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

def sidebar_api_key_configuration() -> str:
    groq_api_key = get_api_key()
    if not groq_api_key:
        st.sidebar.warning('Enter the API Key(s) 🗝️')
        st.session_state.prompt_activation = False
    elif groq_api_key.startswith('gsk_') and len(groq_api_key) == 56:
        st.sidebar.success('Lets Proceed!', icon='️👉')
        st.session_state.prompt_activation = True
    else:
        st.sidebar.warning('Please enter the correct API Key 🗝️!', icon='⚠️')
        st.session_state.prompt_activation = False
    return groq_api_key

def sidebar_groq_model_selection() -> str:
    st.sidebar.subheader("Model Selection")
    return st.sidebar.selectbox(
        'Select the Model',
        ('Llama3-8b-8192', 'Llama3-70b-8192', 'Mixtral-8x7b-32768', 'Gemma-7b-it'),
        label_visibility="collapsed"
    )

def read_pdf_data(pdf_docs: List) -> str:
    try:
        text = ""
        for pdf in pdf_docs:
            pdf_reader = PdfReader(pdf)
            for page in pdf_reader.pages:
                text += page.extract_text()
        return text
    except Exception as e:
        st.error(f"Error reading PDF: {str(e)}")
        return ""

def split_data(text: str) -> List[str]:
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=300)
    return text_splitter.split_text(text)

def get_embedding_function() -> HuggingFaceInferenceAPIEmbeddings:
    inference_api_key = get_inference_api_key()
    if not inference_api_key:
        st.error("HuggingFace Inference API key not found")
        return None
        
    return HuggingFaceInferenceAPIEmbeddings(
        api_key=inference_api_key,
        model_name="sentence-transformers/all-MiniLM-l6-v2"
    )

def create_vectorstore(pdf_docs: List) -> Optional[FAISS]:
    raw_text = read_pdf_data(pdf_docs)
    if not raw_text:
        st.error("No text extracted from PDFs")
        return None

    text_chunks = split_data(raw_text)
    if not text_chunks:
        st.error("No text chunks created")
        return None

    #st.write("Text Chunks: ", text_chunks)  # Debugging output

    if not raw_text:
        st.error("No text extracted from PDFs")
        return None
        
    text_chunks = split_data(raw_text)
    if not text_chunks:
        st.error("No text chunks created")
        return None
        
    embeddings = get_embedding_function()
    if not embeddings:
        return None
        
    try:
        return FAISS.from_texts(texts=text_chunks, embedding=embeddings)
    except Exception as e:
        st.error(f"Error creating vector store: {str(e)}")
        return None

def get_llm_response(llm, prompt, question: str) -> dict:
    try:
        document_chain = create_stuff_documents_chain(llm, prompt)
        retrieval_chain = create_retrieval_chain(
            st.session_state.vector_store.as_retriever(),
            document_chain
        )
        response = retrieval_chain.invoke({'input': question})
        return response
    except Exception as e:
        st.error(f"Error getting response: {str(e)}")
        return {"answer": "An error occurred while processing your question"}