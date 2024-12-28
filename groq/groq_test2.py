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
groq_api_key='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'


if "vector" not in st.session_state:
  st.session_state.embeddings=OllamaEmbeddings()
  st.session_state.loader=WebBaseLoader("https://gsb.gov.tr/")
  st.session_state.docs=st.session_state.loader.load()
  st.session_state.text_splitter=RecursiveCharacterTextSplitter(chunk_size=1000,chunk_overlap=200) 
  st.session_state.final_documents=st.session_state.text_splitter.split_documents(st.session_state.docs[:50]) 
  st.session_state.vectors=FAISS.from_documents(st.session_state.final_documents,st.session_state.embeddings)


st.title("soruCan Demo")
llm=ChatGroq(groq_api_key=groq_api_key,
model_name="mixtral-8x7b-32768")
prompt=ChatPromptTemplate.from_template(
"""
Sen gençlik bilgilendirme merkezinde çalışan bir uzman gibi davranıyorsun.
Sorulara Gençlik Bilgilendirme Merkezi uzmanı gibi cevap ver.
Sorulara sadece sağlanan dosya üzerinden cevap ver.
Lütfen Soruya göre en doğru cevabı verin.
<context>
{context}
<context>
Questions:{input}
"""
)
document_chain = create_stuff_documents_chain(llm, prompt)
retriever = st.session_state.vectors.as_retriever()
retrieval_chain = create_retrieval_chain(retriever, document_chain)

prompt=st.text_input("Sorunuzu Buraya Girin")
if prompt:
    start=time.process_time()
    response=retrieval_chain.invoke({"input":prompt})
    print("Response time :",time.process_time()-start)
    st.write(response['answer'])

    # With a streamlit expander
    with st.expander("Document Similarity Search"):
        # Find the relevant chunks
        for i, doc in enumerate(response["context"]):
            st.write(doc.page_content)
