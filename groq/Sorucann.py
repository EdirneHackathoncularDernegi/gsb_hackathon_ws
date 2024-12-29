import os
import pickle
import requests
import streamlit as st
import fitz  # PyMuPDF for PDF text extraction
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# ---------------- LANGCHAIN & FAISS KÜTÜPHANELERİ ----------------
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceInferenceAPIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

# ---------------- STREAMLIT OPTION MENU ----------------
from streamlit_option_menu import option_menu

# -------------------------------------------------------
#                    AYARLAR & DEĞİŞKENLER
# -------------------------------------------------------
load_dotenv()
st.set_page_config(page_title="SoruCAN", page_icon=":robot_face:", layout="centered")

VECTOR_STORE_PATH = "vector_store.pkl"       # Oluşturulacak / yüklenilecek vektör deposu
PDF_FOLDER_PATH   = "source"                 # PDF’lerin bulunduğu klasör
LINKS_TXT_PATH    = "links.txt"              # Linklerin bulunduğu txt dosyası

# -------------------------------------------------------
#                    FONKSİYONLAR
# -------------------------------------------------------

# 1) GROQ API Key'i environment'tan alma
def get_api_key() -> str:
    return os.getenv("GROQ_API_KEY", "")

# 2) HuggingFace Inference API Key'i environment'tan alma
def get_inference_api_key() -> str:
    return os.getenv("INFERENCE_API_KEY", "")

# 3) Sidebar üzerinde API Key uyarıları ve kontrol
def sidebar_api_key_configuration() -> str:
    groq_api_key = get_api_key()
    if not groq_api_key:
        st.sidebar.warning('Enter the API Key(s) 🗝️')
        st.session_state.prompt_activation = False
    elif groq_api_key.startswith('gsk_') and len(groq_api_key) == 56:
        st.sidebar.success(' ', icon='👉')
        st.session_state.prompt_activation = True
    else:
        st.sidebar.warning('Please enter the correct API Key 🗝️!', icon='⚠️')
        st.session_state.prompt_activation = False
    return groq_api_key

# 4) Sidebar: Model seçimi
def sidebar_groq_model_selection() -> str:
    st.sidebar.subheader("Model Seçimi")
    return st.sidebar.selectbox(
        'Groq Modeli Seçin',
        ('Llama3-8b-8192', 'Llama3-70b-8192', 'Mixtral-8x7b-32768', 'Gemma-7b-it'),
        label_visibility="collapsed"
    )

# 5) PDF’den metin okuma (fitz ile)
def extract_text_from_pdf(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()

        if not text.strip():
            raise ValueError("PDF'den metin çıkarılamadı.")

        return text
    except Exception as e:
        st.error(f"PDF işleme sırasında bir hata oluştu: {e}")
        return ""

# 6) Mevcut vektör deposunu yükleme
def load_previous_data():
    if os.path.exists(VECTOR_STORE_PATH):
        with open(VECTOR_STORE_PATH, "rb") as f:
            return pickle.load(f)
    return None

# 7) Vektör deposunu pickle ile kaydetme
def save_vectorstore(vectorstore):
    with open(VECTOR_STORE_PATH, "wb") as f:
        pickle.dump(vectorstore, f)

# 8) Metinleri chunk'lara bölme
def split_data(text: str):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    return text_splitter.split_text(text)

# 9) HuggingFace Inference API bazlı embedding fonksiyonu
def get_embedding_function():
    inference_api_key = get_inference_api_key()
    if not inference_api_key:
        st.error("HuggingFace Inference API key not found")
        return None
    return HuggingFaceInferenceAPIEmbeddings(
        api_key=inference_api_key,
        model_name="sentence-transformers/all-MiniLM-l6-v2"
    )

# 10) TXT dosyasından linkleri okuma
def read_links_from_txt(txt_path: str) -> list:
    """
    Var olan bir txt dosyasındaki linkleri satır satır okur,
    'http' ile başlayanları bir listeye ekleyerek döndürür.
    """
    if not os.path.exists(txt_path):
        return []
    try:
        with open(txt_path, "r", encoding="utf-8") as file:
            links = [line.strip() for line in file if line.strip().startswith("http")]
        return links
    except Exception as e:
        st.error(f"TXT dosyasından link okuma sırasında bir hata oluştu: {e}")
        return []

# 11) Linklerden HTTP ile veri çekme (requests + BeautifulSoup)
def fetch_data_from_links(links: list) -> list:
    data_list = []
    for link in links:
        try:
            response = requests.get(link, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                text = soup.get_text(separator="\n", strip=True)
                data_list.append(text)
            else:
                st.warning(f"Bağlantı başarısız: {link} (Durum Kodu: {response.status_code})")
        except Exception as e:
            st.warning(f"Bağlantı çekme sırasında hata: {link}, Hata: {e}")
    return data_list

# 12) FAISS tabanlı vektör deposu oluşturma
def create_vectorstore_from_texts(text_list):
    embeddings = get_embedding_function()
    if not embeddings:
        return None
    try:
        return FAISS.from_texts(texts=text_list, embedding=embeddings)
    except Exception as e:
        st.error(f"Vektör deposu oluşturulurken hata: {str(e)}")
        return None

# 13) Hem PDF’lerden hem linklerden gelen metinleri birleştirip vektör deposu oluşturan fonksiyon
def create_or_update_vectorstore(pdf_files: list, link_texts: list):
    """
    PDF’lerden okunan metinlerle linklerden çekilen düz metinleri bir araya getirir,
    chunk'lar ve FAISS vektör deposu oluşturur.
    """
    # PDF tarafı
    pdf_text = ""
    for pdf_file in pdf_files:
        pdf_text += extract_text_from_pdf(pdf_file)

    # Linklerden gelen veri tarafı
    combined_link_text = "\n".join(link_texts)

    # İki kaynağı birleştir
    combined_text = pdf_text + "\n" + combined_link_text

    # Boşsa uyarı
    if not combined_text.strip():
        st.error("Ne PDF’den ne de linklerden metin elde edilemedi.")
        return None

    # Metni chunk'lara böl
    chunks = split_data(combined_text)
    if not chunks:
        st.error("Metin chunk'lara ayrılamadı.")
        return None

    # FAISS vektör deposunu oluştur
    vector_store = create_vectorstore_from_texts(chunks)
    if vector_store:
        save_vectorstore(vector_store)
        st.success("Veri tabanı (vektör deposu) başarıyla oluşturuldu/güncellendi!")
        return vector_store
    return None

# 14) Soruya yanıt almak için LangChain zincirlerini oluşturan fonksiyon
def get_llm_response(llm, prompt_template, question: str) -> dict:
    """
    Mevcut vektör deposunu kullanarak retrieval chain oluşturur
    ve LLM'e sorulan soruya cevap döndürür.
    """
    try:
        # Retrieval zinciri için Document Chain
        document_chain = create_stuff_documents_chain(llm, prompt_template)

        # Vektör deposu yoksa uyarı
        if "vector_store" not in st.session_state or not st.session_state.vector_store:
            return {"answer": "Vektör deposu bulunamadı. Lütfen önce PDF/link verilerini yükleyin."}

        # Vektör deposunu bir retriever olarak kullan
        retrieval_chain = create_retrieval_chain(
            st.session_state.vector_store.as_retriever(),
            document_chain
        )
        # Soruyu zincire ilet
        response = retrieval_chain.invoke({'input': question})
        return response
    except Exception as e:
        st.error(f"Error getting response: {str(e)}")
        return {"answer": "Bir hata oluştu."}

# -------------------------------------------------------
#                    OTURUM DURUMU
# -------------------------------------------------------

if "vector_store" not in st.session_state:
    st.session_state.vector_store = load_previous_data()
if "response" not in st.session_state:
    st.session_state.response = None
if "prompt_activation" not in st.session_state:
    st.session_state.prompt_activation = bool(st.session_state.vector_store)
if "conversation" not in st.session_state:
    st.session_state.conversation = None
if "chat_history" not in st.session_state:
    st.session_state.chat_history = None
if "prompt" not in st.session_state:
    st.session_state.prompt = False
if "messages" not in st.session_state:
    st.session_state["messages"] = [{"role": "assistant", "content": "Sana nasıl yardımcı olabilirim?"}]

# -------------------------------------------------------
#                    SIDEBAR
# -------------------------------------------------------
st.sidebar.header('Yapılandırma')
groq_api_key = sidebar_api_key_configuration()
model = sidebar_groq_model_selection()

# -------------------------------------------------------
#                    ANA SAYFA
# -------------------------------------------------------
st.title("SoruCAN :robot_face:")
st.write("*Sorularına Cevap, Hedeflerine Destek*")
st.write(':blue[***Powered by Matiricie***]')

# Option Menu
selected = option_menu(
    menu_title=None,
    options=["SoruCAN", "Hakkında"],
    icons=["robot", "bi-file-text-fill"],
    orientation="horizontal",
)

# LLM Oluştur
llm = ChatGroq(groq_api_key=groq_api_key, model_name=model)

# Prompt Şablonu
prompt = ChatPromptTemplate.from_template(
    """
Sen, siber güvenlik alanında uzman bir yardımcı yapay zekasın. Kullanıcı, lise düzeyinde olup siber güvenlikte kendini geliştirmek isteyen bir öğrencidir. Kullanıcının seviyesine uygun, adım adım bir plan, kaynak önerileri, kurs ve etkinlik tavsiyeleri vermekle görevlisin. Açıklamaların hem teorik hem pratik boyutu içermeli, somut önerilere ve kaynaklara (web siteleri, kurslar, konferanslar, CTF yarışmaları, vs.) yer vermelisin.
Türkçe konuşuyorsun ve kullanıcıdan gelen sorulara Türkçe yanıtlar vermelisin.
    <context>
    {context}
    </context>

    Sorular:
    {input}
    """
)

# -------------------------------------------------------
#                    "SORUCAN" SEKME
# -------------------------------------------------------
if selected == "SoruCAN":

    # 1) PDF Klasörünü Otomatik Tara
    st.subheader("1) PDF Klasörünü Otomatik Tara ve Metinleri Al")
    if not os.path.exists(PDF_FOLDER_PATH):
        st.error(f"Belirtilen klasör bulunamadı: {PDF_FOLDER_PATH}")
    else:
        pdf_files = [
            os.path.join(PDF_FOLDER_PATH, file) 
            for file in os.listdir(PDF_FOLDER_PATH) 
            if file.endswith(".pdf")
        ]
        if not pdf_files:
            st.warning("Klasörde analiz edilecek PDF bulunamadı.")
        else:
            if st.button("PDF Dosyalarını İşle"):
                with st.spinner("PDF dosyaları işleniyor..."):
                    # 2) Linklerden veri çek
                    links = read_links_from_txt(LINKS_TXT_PATH)
                    link_data_list = fetch_data_from_links(links)
                    # Hem PDF’ler hem link metinleri -> tek vektör deposu
                    st.session_state.vector_store = create_or_update_vectorstore(pdf_files, link_data_list)
                    st.session_state.prompt = True

    st.divider()

    # 2) Sohbet Ekranı
    st.subheader("2) Soru-Cevap")
    for msg in st.session_state.messages:
        st.chat_message(msg["role"]).write(msg["content"])

    if question := st.chat_input(
        placeholder='Yüklenen PDF + linklerden elde edilen veriye dayanarak sorunuzu yazın...',
        disabled=not st.session_state.prompt
    ):
        # Kullanıcı mesajı
        st.session_state.messages.append({"role": "user", "content": question})
        st.chat_message("user").write(question)

        # Yanıt alma
        with st.spinner('İşleniyor...'):
            st.session_state.response = get_llm_response(llm, prompt, question)
            answer = st.session_state.response.get('answer', 'Bir hata oluştu.')
            st.session_state.messages.append({"role": "assistant", "content": answer})
            st.chat_message("assistant").write(answer)

# -------------------------------------------------------
#                    "HAKKINDA" SEKME
# -------------------------------------------------------
elif selected == "Hakkında":

    with st.expander("Bu Uygulama Hangi Büyük Dil Modellerini Destekliyor?"):
        st.markdown('''Groq tarafından desteklenen aşağıdaki LLM'leri destekler:
- **Llama3-8b-8192**
- **Llama3-70b-8192**
- **Mixtral-8x7b-32768**
- **Gemma-7b-it**''')

    with st.expander("Bu Uygulama Hangi Kütüphaneyi Vektör Deposu için Kullanıyor?"):
        st.markdown('''Bu uygulama, AI benzerlik araması ve vektör deposu için **FAISS** kütüphanesini kullanır.''')

    with st.expander("SoruCAN Nedir ve Ne İşe Yarar?"):
        st.markdown('''**SoruCAN**, HedefGenç platformunun yapay zeka destekli asistanıdır. Gençlerin kariyer planlaması, iş ve staj fırsatları, eğitim önerileri gibi konularda sorularını yanıtlar ve rehberlik sağlar. Kişisel hedeflerinize ulaşmanız için size özel öneriler sunar.''')

    with st.expander("SoruCAN’a Hangi Tür Soruları Sorabilirim?"):
        st.markdown('''SoruCAN’a kariyer ve kişisel gelişimle ilgili birçok soru sorabilirsiniz. Örnek sorular:
- “Hangi mesleğe daha yatkınım?”
- “CV’mi nasıl geliştirebilirim?”
- “Yakınımda hangi kariyer etkinlikleri var?”
- “Bir staj bulmak için ne yapmalıyım?”''')

    with st.expander("SoruCAN Nasıl Doğru Öneriler Sunuyor?"):
        st.markdown('''SoruCAN, sizin profil bilgilerinizi (ilgi alanlarınız, kariyer hedefleriniz) ve sistemdeki fırsatları analiz ederek önerilerde bulunur. Ayrıca, yapay zeka desteği sayesinde sorularınıza hızlı ve güvenilir yanıtlar verir.''')

    with st.expander("SoruCAN’a Verdiğim Bilgiler Güvenli mi?"):
        st.markdown('''Evet, SoruCAN’a sağladığınız bilgiler tamamen güvendedir. Kişisel bilgileriniz yalnızca platform içindeki öneriler ve rehberlik için kullanılır. HedefGenç, veri güvenliğiniz için tüm yasal düzenlemelere uyar.''')


