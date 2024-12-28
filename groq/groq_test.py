import streamlit as st
import os
from langchain_groq import ChatGroq
from langchain_community.document_loaders import WebBaseLoader
from langchain.embeddings import OllamaEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain_community.vectorstores import FAISS
import time
from dotenv import load_dotenv

load_dotenv()
## load the Groq API key
groq_api_key = os.environ.get('GROQ_API_KEY', None)

# Web siteleri listesi
websites = [
    "https://genclikhizmetleri.gov.tr/",
    "https://biz.gsb.gov.tr/",
    "https://genclikhizmetleri.gov.tr/hizmetlerimiz/"
]

# Streamlit Uygulaması
st.title("soruCan Demo")

# Sadece bir kez embeddings ve vectorstore oluşturmak için
if "vectors" not in st.session_state:
    st.write("Vektör depoları oluşturuluyor, lütfen bekleyin...")
    all_vectors = []
    embeddings = OllamaEmbeddings()

    # Metinleri bölerken kullanılacak parametreler
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    # Her site için dokümanları indirip parçalara ayırma
    for url in websites:
        try:
            loader = WebBaseLoader(url)
            documents = loader.load()

            # Dokümanların boş gelip gelmediğini kontrol edelim
            if not documents:
                st.warning(f"{url} adresinden veri alınamadı veya boş döndü.")
                continue

            final_documents = text_splitter.split_documents(documents)

            # final_documents boş mu kontrol edelim
            if not final_documents:
                st.warning(f"{url} dokümanlarını bölerken içerik oluşturulamadı.")
                continue

            # Vektör oluştur
            vectors = FAISS.from_documents(final_documents, embeddings)
            all_vectors.append(vectors)
            st.write(f"**{url}** için vektörleşme tamamlandı! Doküman sayısı: {len(final_documents)}")

        except Exception as e:
            st.error(f"{url} verisi alınırken hata oluştu: {e}")

    # Tüm web sitelerini tek bir FAISS objesinde birleştirelim
    if all_vectors:
        # İlk vectorstore'u referans alarak diğerlerini merge edebiliriz
        base_vectorstore = all_vectors[0]
        for vectorstore in all_vectors[1:]:
            base_vectorstore.merge_from(vectorstore)
        st.session_state.vectors = base_vectorstore

        st.success("Tüm web sitelerinden veri vektörleştirme tamamlandı!")
    else:
        st.error("Hiçbir web sitesi için vektör oluşturulamadı. Uygulama çalışmayabilir.")
else:
    st.write("Önceden oluşturulmuş vektör depoları kullanılıyor...")

# Eğer GROQ_API_KEY bulunamazsa uyarı
if not groq_api_key:
    st.error("GROQ_API_KEY bulunamadı! lütfen .env dosyanızı kontrol edin.")

# LLM tanımı
llm = ChatGroq(
    groq_api_key=groq_api_key,
    model_name="mixtral-8x7b-32768"
)

# Prompt metni
prompt_template = """
Sen, bir Gençlik Bilgilendirme Merkezi uzmanısın ve sağlanan dokümandan faydalanarak gençlere yönelik sorulara cevap veriyorsun.
Cevaplarını:
- Açık, net ve kolay anlaşılır bir şekilde oluştur.
- Sorunun bağlamına uygun şekilde cevapla.
- Eğer dokümanda bilgi yoksa "Bu bilgi sağlanan dokümanda mevcut değil." yanıtını ver.
- Fazladan tahmin yapma ya da doküman dışına çıkma.
  
Kendi bilgi birikimini kullanma; yalnızca sağlanan dosyaya dayan.
Cevap verirken lütfen:
- Gerekirse örnekler veya detaylarla açıklama yap.
- Sadece ilgili bilgilere odaklan, gereksiz detaylardan kaçın.

Soruları dikkatlice değerlendir ve aşağıdaki bilgiler ışığında cevap ver:

<context>
{context}
<context>

Sorular:
{input}

Cevaplar:
"""

chat_prompt = ChatPromptTemplate.from_template(prompt_template)

# Vectorstore'un var olup olmadığını kontrol et
if "vectors" in st.session_state:
    # Belgeleri birleştirme chain'i
    document_chain = create_stuff_documents_chain(llm, chat_prompt)
    retriever = st.session_state.vectors.as_retriever()
    retrieval_chain = create_retrieval_chain(retriever, document_chain)

    prompt_input = st.text_input("Sorunuzu Buraya Girin")
    if prompt_input:
        start = time.process_time()
        response = retrieval_chain.invoke({"input": prompt_input})
        st.write("Cevap:", response['answer'])
        st.write("Response time:", time.process_time() - start)

        with st.expander("Doküman Benzerliği (Similarity Search)"):
            for i, doc in enumerate(response["context"]):
                st.markdown(f"**Doküman {i+1}:**")
                st.write(doc.page_content[:500] + "...")
                st.write("---")

else:
    st.warning("Vektör veritabanı oluşturulamadığı için soru soramazsınız.")
