from pypdf import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceInferenceAPIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain
from typing import List, Optional
import streamlit as st
import os
from dotenv import load_dotenv

load_dotenv()

def get_api_key() -> str:
    return os.getenv("GROQ_API_KEY", "")

def get_inference_api_key() -> str:
    return os.getenv("INFERENCE_API_KEY", "")

def yan_menu_api_anahtari_konfigurasyonu() -> str:
    groq_api_key = get_api_key()
    if not groq_api_key:
        st.sidebar.warning('API Anahtar(lar)ını Girin 🗝️')
        st.session_state.prompt_aktivasyon = False
    elif groq_api_key.startswith('gsk_') and len(groq_api_key) == 56:
        st.sidebar.success('Devam Ediyoruz!', icon='️👉')
        st.session_state.prompt_aktivasyon = True
    else:
        st.sidebar.warning('Lütfen doğru API Anahtarını girin 🗝️!', icon='⚠️')
        st.session_state.prompt_aktivasyon = False
    return groq_api_key

def yan_menu_model_secimi() -> str:
    st.sidebar.subheader("Model Seçimi")
    return st.sidebar.selectbox(
        'Model Seçiniz',
        ('Llama3-8b-8192', 'Llama3-70b-8192', 'Mixtral-8x7b-32768', 'Gemma-7b-it'),
        label_visibility="collapsed"
    )

def pdf_verisi_okuma(pdf_dosyalari: List) -> str:
    try:
        metin = ""
        for pdf in pdf_dosyalari:
            pdf_okuyucu = PdfReader(pdf)
            for sayfa in pdf_okuyucu.pages:
                metin += sayfa.extract_text()
        return metin
    except Exception as e:
        st.error(f"PDF Okunurken hata oluştu: {str(e)}")
        return ""

def veriyi_parcalama(metin: str) -> List[str]:
    metin_parcalayici = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    return metin_parcalayici.split_text(metin)

def gomi_fonksiyonunu_getir() -> HuggingFaceInferenceAPIEmbeddings:
    inference_api_key = get_inference_api_key()
    if not inference_api_key:
        st.error("HuggingFace Inference API anahtarı bulunamadı")
        return None
        
    return HuggingFaceInferenceAPIEmbeddings(
        api_key=inference_api_key,
        model_name="sentence-transformers/all-MiniLM-l6-v2"
    )

def vektor_deposu_olustur(pdf_dosyalari: List) -> Optional[FAISS]:
    ham_metin = pdf_verisi_okuma(pdf_dosyalari)
    if not ham_metin:
        st.error("PDF'lerden hiçbir metin alınamadı")
        return None
        
    metin_parcalari = veriyi_parcalama(ham_metin)
    if not metin_parcalari:
        st.error("Hiçbir metin parçası oluşturulamadı")
        return None
        
    gomiler = gomi_fonksiyonunu_getir()
    if not gomiler:
        return None
        
    try:
        return FAISS.from_texts(texts=metin_parcalari, embedding=gomiler)
    except Exception as e:
        st.error(f"Vektör deposu oluşturulurken hata oluştu: {str(e)}")
        return None

def llm_cevabi_getir(llm, prompt, soru: str) -> dict:
    try:
        belge_zinciri = create_stuff_documents_chain(llm, prompt)
        sorgu_zinciri = create_retrieval_chain(
            st.session_state.vector_store.as_retriever(),
            belge_zinciri
        )
        cevap = sorgu_zinciri.invoke({'input': soru})
        return cevap
    except Exception as e:
        st.error(f"Cevap alınırken hata oluştu: {str(e)}")
        return {"cevap": "Sorunuz işlenirken bir hata oluştu"}
