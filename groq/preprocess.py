import os
import pickle
from multiprocessing import Pool, cpu_count
from tqdm import tqdm  # Progress bar için
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import FAISS

def process_page(args):
    """
    Tek bir PDF sayfasını işler ve FAISS vektörlerini döner.
    """
    page, embeddings = args
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    split_documents = text_splitter.split_documents([page])  # Sayfa içeriğini böl
    if not split_documents:
        raise ValueError(f"Split işlemi boş sonuç döndürdü. Sayfa içeriği: {page.page_content[:100]}...")
    return FAISS.from_documents(split_documents, embeddings)

def process_pdf_to_vectors_with_progress(pdf_path, output_path):
    """
    PDF dosyasını işler ve FAISS vektörlerini oluşturur.
    Sorunlu sayfalar atlanır ve yalnızca geçerli veriler vektörleştirilir.
    """
    try:
        print(f"Loading PDF: {pdf_path}")
        pdf_loader = PyPDFLoader(pdf_path)
        documents = pdf_loader.load()

        if not documents:
            print(f"Warning: No content found in {pdf_path}")
            return

        embeddings = OllamaEmbeddings()

        # Paralel işlemede progress bar ile sayfaları işleyelim
        print(f"Processing {len(documents)} pages...")
        valid_vectors = []
        with Pool(cpu_count()) as pool:
            args = [(doc, embeddings) for doc in documents]

            # tqdm ile progress bar ekliyoruz
            for vector in tqdm(pool.imap_unordered(process_page, args), total=len(documents), desc="Processing Pages"):
                if vector is not None:
                    valid_vectors.append(vector)

        # Tüm parçaları birleştir
        if valid_vectors:
            combined_vectors = valid_vectors[0]
            for vectors in valid_vectors[1:]:
                combined_vectors.merge_from(vectors)

            # Vektörleri kaydet
            with open(output_path, 'wb') as f:
                pickle.dump(combined_vectors, f)

            print(f"Vectors saved to {output_path}")
        else:
            print(f"No vectors generated from {pdf_path}.")

    except Exception as e:
        print(f"Error processing {pdf_path}: {e}")



if __name__ == "__main__":
    # PDF ve çıktı dosyası yolları
    pdf_path = r"C:\Users\fuchs\Desktop\gsb_hackathon_ws\source\2023 Faaliyet Raporu.pdf"  # PDF dosyasının yolu
    output_path = "output_vectors.pkl"  # Çıktı dosyasının yolu

    process_pdf_to_vectors_with_progress(pdf_path, output_path)


