import streamlit as st
import os
import time
import pickle
from dotenv import load_dotenv

# LangChain ve Groq modülleri
from langchain_groq import ChatGroq
from langchain_community.document_loaders import WebBaseLoader
from langchain.embeddings import OllamaEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain_community.vectorstores import FAISS

# EKLENDİ: PDF Desteği (artık doğrudan kod içinde path belirtilecek)
from langchain.document_loaders import PyPDFLoader

# Streamlit sayfa ayarları
st.set_page_config(
    page_title="SoruCan Demo",
    page_icon=":male-student:",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Örnek CSS
st.markdown(
    """
    <style>
    [data-testid="stSidebar"] {
        background-color: #e7e9ec; /* Sidebar'ın arka planı */
        color: #333 !important;    /* Metin rengi */
    }
    .stTextInput > label {
        font-weight: 600;
    }
    .stTitle, .stHeader, .stCaption {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    }
    </style>
    """,
    unsafe_allow_html=True
)

# .env dosyasından yükleyelim
load_dotenv()
groq_api_key = os.environ.get('GROQ_API_KEY', None)

# Web siteleri listesi
websites = [
    "https://gsb.gov.tr/haberler-ve-duyurular.html",
    "https://genclikhizmetleri.gov.tr/hizmetlerimiz/",
    #"https://biz.gsb.gov.tr/page/egitim/BilisimEgitimleri/"
]

# PDF dosyalarını koddan belirliyoruz (örnek yollar):
pdf_file_paths = [
    r"source\2023 Faaliyet Raporu.pdf",
    r"source\2023 Faaliyet Raporu.pdf",
]

# Vektörleri kaydetmek için klasör
vector_output_folder = r"source\vector_outputs"
os.makedirs(vector_output_folder, exist_ok=True)

st.title("SoruCan")

# --- SIDEBAR ---
with st.sidebar:
    st.header("Hakkında")
    st.write("""
    **SoruCan**, Gençlik ve Spor Bakanlığı ile ilgili web sitelerinden ve 
    önceden belirlenmiş PDF'lerden toplanan bilgilere dayanarak sorularınızı 
    yanıtlamak için tasarlanmış bir chatbot prototipidir.
    """)
    st.markdown("---")
    st.write("*Matiricie*")

# --- ANA GÖVDE ---

def save_vectors_to_file(vectors, output_file):
    """Vektörleri bir dosyaya kaydeder."""
    with open(output_file, 'wb') as f:
        pickle.dump(vectors, f)

def load_vectors_from_file(file_path):
    """Bir dosyadan vektörleri yükler."""
    with open(file_path, 'rb') as f:
        return pickle.load(f)

# Yalnızca bir kez embeddings ve vectorstore oluşturmak
if "vectors" not in st.session_state:
    st.info("Vektör depoları oluşturuluyor, lütfen bekleyin...")
    all_vectors = []
    embeddings = OllamaEmbeddings()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

    # 1) Önce web sitelerinden veri çekelim
    total_sites = len(websites)
    progress_bar = st.progress(0)

    for idx, url in enumerate(websites):
        try:
            with st.spinner(f"'{url}' adresinden veri toplanıyor..."):
                loader = WebBaseLoader(url)
                documents = loader.load()

            if not documents:
                st.warning(f"**{url}** adresinden veri alınamadı veya boş döndü.")
                continue

            final_docs = text_splitter.split_documents(documents)
            if not final_docs:
                st.warning(f"**{url}** dokümanlarını bölerken içerik oluşturulamadı.")
                continue

            vectors = FAISS.from_documents(final_docs, embeddings)
            all_vectors.append(vectors)
            st.success(f"**{url}** için vektörleşme tamamlandı! Doküman sayısı: {len(final_docs)}")

        except Exception as e:
            st.error(f"{url} verisi alınırken hata oluştu: {e}")

        # Progress bar güncelle
        progress_bar.progress(int((idx + 1) / total_sites * 100))

    # 2) Şimdi PDF dosyalarını yükleyip vektörleştirelim
    for pdf_path in pdf_file_paths:
        try:
            with st.spinner(f"'{pdf_path}' PDF dosyası yükleniyor..."):
                pdf_loader = PyPDFLoader(pdf_path)
                pdf_docs = pdf_loader.load()

            if not pdf_docs:
                st.warning(f"**{pdf_path}** içi boş ya da okunamadı.")
                continue

            pdf_final_docs = text_splitter.split_documents(pdf_docs)
            if not pdf_final_docs:
                st.warning(f"**{pdf_path}** belgelerini bölerken içerik oluşturulamadı.")
                continue

            pdf_vectors = FAISS.from_documents(pdf_final_docs, embeddings)

            # Vektörleri kaydet
            vector_file = os.path.join(vector_output_folder, os.path.basename(pdf_path).replace('.pdf', '_vectors.pkl'))
            save_vectors_to_file(pdf_vectors, vector_file)

            all_vectors.append(pdf_vectors)
            st.success(f"**{pdf_path}** için vektörleşme tamamlandı ve kaydedildi! Doküman sayısı: {len(pdf_final_docs)}")

        except Exception as e:
            st.error(f"{pdf_path} yüklenirken hata oluştu: {e}")

    # Tüm data (web + pdf) tek bir FAISS objesinde birleştirelim
    if all_vectors:
        base_vectorstore = all_vectors[0]
        for vectorstore in all_vectors[1:]:
            base_vectorstore.merge_from(vectorstore)
        st.session_state.vectors = base_vectorstore

        st.balloons()
        st.success("Tüm kaynaklardan veri vektörleştirme tamamlandı!")
    else:
        st.error("Hiçbir veri kaynağından vektör oluşturulamadı. Uygulama çalışmayabilir.")
else:
    st.info("Önceden oluşturulmuş vektör depoları kullanılıyor...")

# GROQ_API_KEY yoksa uyarı
if not groq_api_key:
    st.error("GROQ_API_KEY bulunamadı! Lütfen .env dosyanızı veya çevresel değişkenlerinizi kontrol edin.")

# LLM tanımı
llm = ChatGroq(
    groq_api_key=groq_api_key,
    model_name="llama-3.3-70b-versatile"
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

# Vektör oluşturulmuş mu kontrol
if "vectors" in st.session_state:
    document_chain = create_stuff_documents_chain(llm, chat_prompt)
    retriever = st.session_state.vectors.as_retriever()
    retrieval_chain = create_retrieval_chain(retriever, document_chain)

    # Soru giriş alanı
    st.subheader("Soru Sor")
    user_question = st.text_input("Örneğin: Gençlik kampları nerede düzenleniyor?")

    if user_question:
        with st.spinner("Cevap aranıyor..."):
            start = time.process_time()
            response = retrieval_chain.invoke({"input": user_question})
            elapsed = time.process_time() - start

        st.markdown("### Cevap:")
        st.write(response['answer'])
        st.caption(f"Yanıt süresi: {elapsed:.2f} saniye")

        with st.expander("Doküman Benzerliği (Similarity Search)"):
            for i, doc in enumerate(response["context"]):
                st.markdown(f"**Doküman Parçası {i+1}:**")
                st.write(doc.page_content[:500] + "...")
                st.write("---")

else:
    st.warning("Vektör veritabanı oluşturulamadığı için soru soramazsınız.")
