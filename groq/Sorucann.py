import os
import pickle
import streamlit as st
from util import *  # Yardımcı fonksiyonlar için util.py
from streamlit_option_menu import option_menu
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from dotenv import load_dotenv

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

if selected == "SoruCAN":
    st.subheader("PDF Klasörü Otomatik İşleme")

    default_folder = r"source"  # Varsayılan PDF klasörü
    if not os.path.exists(default_folder):
        st.error(f"Belirtilen klasör bulunamadı: {default_folder}")
    else:
        pdf_files = [os.path.join(default_folder, file) for file in os.listdir(default_folder) if file.endswith(".pdf")]
        if not pdf_files:
            st.warning("Klasörde analiz edilecek PDF bulunamadı.")
        else:
            with st.spinner("PDF dosyaları işleniyor..."):
                st.session_state.vector_store = vektor_deposu_olustur(pdf_files)
                st.session_state.prompt = True
                st.success('Tüm PDF dosyaları başarıyla işlendi ve veri tabanı hazır!')

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
            st.session_state.messages.append({"role": "assistant", "content": st.session_state.response['answer']})
            st.chat_message("assistant").write(st.session_state.response['answer'])

if selected == "Hakkında":
    with st.expander("Bu Uygulama Hakkında"):
        st.markdown('''Bu uygulama PDF belgeleriyle sohbet etmenizi sağlar. Özellikler şunlardır:
    - Birden fazla PDF belgesi ile sohbet edebilme
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

    with st.expander("SoruCAN Nedir ve Ne İşe Yarar?"):
        st.markdown('''SoruCAN, HedefGenç platformunun yapay zeka destekli asistanıdır. Gençlerin kariyer planlaması, iş ve staj fırsatları, eğitim önerileri gibi konularda sorularını yanıtlar ve rehberlik sağlar. Kişisel hedeflerinize ulaşmanız için size özel öneriler sunar.''')

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
