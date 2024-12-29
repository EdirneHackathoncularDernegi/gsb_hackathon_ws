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

# EKLENDİ: PDF Desteği
from langchain.document_loaders import PyPDFLoader

# Streamlit sayfa ayarları
st.set_page_config(
    page_title="SoruCan Demo",
    page_icon=":male-student:",
    layout="wide",
    initial_sidebar_state="expanded"
)

# .env dosyasından yükleyelim
load_dotenv()
groq_api_key = os.environ.get('GROQ_API_KEY', None)

# PKL dosyasını yükleme işlevi
def load_vectors_from_pkl(pkl_file_path):
    """PKL dosyasından vektörleri yükler."""
    with open(pkl_file_path, 'rb') as f:
        return pickle.load(f)

# --- SIDEBAR ---
with st.sidebar:
    st.header("Hakkında")
    st.write("""
    **SoruCan**, Gençlik ve Spor Bakanlığı ile ilgili web sitelerinden ve 
    önceden belirlenmiş verilerden toplanan bilgilere dayanarak sorularınızı 
    yanıtlamak için tasarlanmış bir chatbot prototipidir.
    """)
    st.markdown("---")
    st.write("*Matiricie*")

# PKL dosyası yüklenecek
pkl_file_path = st.text_input("PKL dosya yolunu girin", "source/vector_outputs/performans programı.pkl")

if os.path.exists(pkl_file_path):
    try:
        # PKL dosyasını yükle
        vectors = load_vectors_from_pkl(pkl_file_path)
        st.session_state.vectors = vectors
        st.success(f"PKL dosyası başarıyla yüklendi: {pkl_file_path}")
    except Exception as e:
        st.error(f"PKL dosyasını yüklerken hata oluştu: {e}")
else:
    st.warning("Belirtilen PKL dosya yolu bulunamadı. Lütfen doğru bir yol girin.")

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
