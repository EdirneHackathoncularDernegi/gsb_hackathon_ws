import os
import pickle
from multiprocessing import Pool, cpu_count, Manager
from tqdm import tqdm
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import FAISS


def process_pdf(args):
    """Bir PDF dosyasını işler ve içeriğini vektörleştirir."""
    pdf_path, progress_queue = args
    try:
        loader = PyPDFLoader(pdf_path)
        pages = loader.load()

        # Eğer PDF boşsa bir hata mesajı
        if not pages:
            print(f"Warning: {pdf_path} içinde sayfa bulunamadı veya içerik okunamadı.")
            progress_queue.put((pdf_path, len(pages)))
            return None

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

        with tqdm(total=len(pages), desc=f"Processing {os.path.basename(pdf_path)} Pages", leave=False) as page_bar:
            splitted = []
            for page in pages:
                page_split = text_splitter.split_documents([page])
                if page_split:  # Sadece içeriği olan sayfaları ekle
                    splitted.extend(page_split)
                page_bar.update(1)

        # Eğer içerik boşsa devam et
        if not splitted:
            print(f"Warning: {pdf_path} içeriği boş veya bölünemedi.")
            progress_queue.put((pdf_path, len(pages)))
            return None

        embeddings = OllamaEmbeddings()
        vector_store = FAISS.from_documents(splitted, embeddings)

        # İlerleme durumu
        progress_queue.put((pdf_path, len(pages)))
        return vector_store
    except Exception as e:
        print(f"Error processing {pdf_path}: {e}")
        progress_queue.put((pdf_path, 0))
        return None


def main():
    pdf_directory = r"C:\Users\fuchs\Desktop\gsb_hackathon_ws\source"
    output_file = "output_vectors.pkl"

    pdf_files = [os.path.join(pdf_directory, f) for f in os.listdir(pdf_directory) if f.endswith(".pdf")]

    if not pdf_files:
        print("No PDF files found in the directory.")
        return

    print("Processing PDFs...")

    # tqdm ile ilerleme göstergesi ekleniyor
    manager = Manager()
    progress_queue = manager.Queue()

    try:
        with Pool(cpu_count()) as pool:
            args = [(pdf_path, progress_queue) for pdf_path in pdf_files]
            results = []

            # Ana ilerleme çubuğu, her PDF'nin durumunu takip eder
            with tqdm(total=len(pdf_files), desc="Processing PDFs", unit="file") as main_bar:
                for result in pool.imap_unordered(process_pdf, args):
                    results.append(result)
                    while not progress_queue.empty():
                        _, pages_processed = progress_queue.get()
                        main_bar.update(1)

    except KeyboardInterrupt:
        print("\nProcess interrupted! Terminating all subprocesses...")
        pool.terminate()
        pool.join()
        print("All processes terminated. Exiting...")
        return

    # Geçerli vektörleri birleştir
    valid_vector_stores = [vector_store for vector_store in results if vector_store is not None]

    if valid_vector_stores:
        base_vector_store = valid_vector_stores[0]
        for vector_store in valid_vector_stores[1:]:
            base_vector_store.merge_from(vector_store)

        # Vektörleri kaydet
        with open(output_file, "wb") as f:
            pickle.dump(base_vector_store, f)

        print(f"Vektörler başarıyla '{output_file}' dosyasına kaydedildi.")
    else:
        print("Hiçbir geçerli vektör oluşturulamadı.")


if __name__ == "__main__":
    main()
