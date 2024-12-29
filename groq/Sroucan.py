import os
import pickle
import streamlit as st
from util import *  # Yardımcı fonksiyonlar için util.py
from streamlit_option_menu import option_menu
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup

# PyMuPDF for reliable PDF text extraction
import fitz  

# Kalıcı dosya yolları
VECTOR_STORE_PATH = "vector_store.pkl"
PDF_STORAGE_DIR = "uploaded_pdfs"

st.set_page_config(page_title="SoruCAN", page_icon=":robot_face:", layout="centered")

if "vector_store" not in st.session_state:
    st.session_state.vector_store = None
if "response" not in st.session_state:
    st.session_state.response = None
if "prompt_activation" not in st.session_state:
    st.session_state.prompt_activation = False
if "conversation" not in st.session_state:
    st.session_state.conversation = None
if "chat_history" not in st.session_state:
    st.session_state.chat_history = None
if "prompt" not in st.session_state:
    st.session_state.prompt = False

load_dotenv()

st.sidebar.header('Yapılandırma')
groq_api_key = yan_menu_api_anahtari_konfigurasyonu()
model = yan_menu_model_secimi()

st.title("SoruCAN :robot_face:")
st.write("*Sorularına Cevap, Hedeflerine Destek*")
st.write(':blue[***Powered by Matiricie***]')

selected = option_menu(
    menu_title=None,
    options=["SoruCAN", "Hakkında"],
    icons=["robot", "bi-file-text-fill", "app"],
    orientation="horizontal",
)

llm = ChatGroq(groq_api_key=groq_api_key, model_name=model)

prompt = ChatPromptTemplate.from_template(
    """
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
    </context>

    Sorular:
    {input}
    """
)

def extract_text_from_pdf(pdf_path):
    """
    PDF dosyasından metin çıkarır.
    """
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
        st.error(f"PDF işlenirken hata oluştu: {e}")
        return ""

def web_verisi_cek(url):
    """
    Verilen URL'den metin verilerini çeker.
    """
    try:
        response = requests.get(url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, "html.parser")
            return soup.get_text()
        else:
            st.error(f"URL'den veri alınamadı. HTTP Durum Kodu: {response.status_code}")
            return ""
    except Exception as e:
        st.error(f"Web verisi çekilirken hata oluştu: {e}")
        return ""

if selected == "SoruCAN":
    st.subheader("PDF ve Web Verisi İşleme")

    # Web URL'si girişi
    url = st.text_input("Web Verisi İşlemek için URL Girin:")
    web_metni = ""
    if url:
        with st.spinner("Web verisi çekiliyor..."):
            web_metni = web_verisi_cek(url)
            st.success("Web verisi başarıyla çekildi!")

    default_folder = r"source"  # Varsayılan PDF klasörü
    pdf_metni = ""
    if not os.path.exists(default_folder):
        st.error(f"Belirtilen klasör bulunamadı: {default_folder}")
    else:
        pdf_files = [os.path.join(default_folder, file) for file in os.listdir(default_folder) if file.endswith(".pdf")]
        if not pdf_files:
            st.warning("Klasörde analiz edilecek PDF bulunamadı.")
        else:
            with st.spinner("PDF dosyaları işleniyor..."):
                pdf_metni = ''.join([extract_text_from_pdf(pdf) for pdf in pdf_files])
                # PDF metninin yalnızca ilk 500 karakterini konsola yazdır
                print("PDF başarıyla işlendi!")
                # PDF metni konsola yazdırılmıyor.

                # PDF metnini log dosyasına kaydet
                #with open("pdf_text_log.txt", "w", encoding="utf-8") as log_file:
                    #log_file.write(pdf_metni)
                #print("PDF metni 'pdf_text_log.txt' dosyasına kaydedildi.")
                st.success("Tüm PDF dosyaları başarıyla işlendi!")
                # PDF içeriğini ekrana yazdırmayı kaldırmak için aşağıdaki satırı yoruma alın veya silin.
                # # st.write(pdf_metni)  # PDF içeriğini ekrana yazdırmayı kaldırdık.

    # PDF ve web metinlerini birleştirerek vektör oluşturma
    if pdf_metni or web_metni:
        combined_text = pdf_metni + "\n" + web_metni
        st.session_state.vector_store = vektor_deposu_olustur([combined_text])
        st.session_state.prompt = True
        st.success('Veriler başarıyla işlendi ve veri tabanı hazır!')

    st.divider()

    if "messages" not in st.session_state:
        st.session_state["messages"] = [{"role": "assistant", "content": "Sana nasıl yardımcı olabilirim?"}]

    for msg in st.session_state.messages:
        st.chat_message(msg["role"]).write(msg["content"])

    container = st.container(border=True)
    if question := st.chat_input(placeholder='Yüklenen dokümanlarla ilgili sorunuzu buraya girin',
                                 disabled=not st.session_state.prompt):
        st.session_state.messages.append({"role": "user", "content": question})
        st.chat_message("user").write(question)

        with st.spinner('İşleniyor...'):
            st.session_state.response = llm_cevabi_getir(llm, prompt, question)
            if st.session_state.response and 'answer' in st.session_state.response:
                st.session_state.messages.append({"role": "assistant", "content": st.session_state.response['answer']})
                st.chat_message("assistant").write(st.session_state.response['answer'])
            else:
                st.error("Geçerli bir yanıt alınamadı.")

if selected == "Hakkında":
    with st.expander("Bu Uygulama Hakkında"):
        st.markdown('''Bu uygulama PDF ve web verileriyle sohbet etmenizi sağlar. Özellikler şunlardır:
    - PDF dosyalarını işleme ve analiz etme
    - Web verilerini çekme ve metin analizine dahil etme
    - Groq AI çıkarım teknolojisi desteği
    - Cevap bağlamını ve belge referansını görüntüleme''')
        
    with st.expander("Bu Uygulama Hangi Büyük Dil Modellerini Destekliyor?"):
        st.markdown('''Bu uygulama Groq tarafından desteklenen aşağıdaki LLM'leri destekler:
    - Sohbet Modelleri -- Groq
        - Llama3-8b-8192 
        - Llama3-70b-8192 
        - Mixtral-8x7b-32768
        - Gemma-7b-it''')

    with st.expander("Bu Uygulama Hangi Kütüphaneyi Vektör Deposu için Kullanıyor?"):
        st.markdown('''Bu uygulama AI benzerlik araması ve vektör deposu için FAISS'i destekler:''')
