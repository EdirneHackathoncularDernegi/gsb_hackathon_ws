import os
from bs4 import BeautifulSoup

# Kaynak ve hedef klasörleri tanımlayın:
INPUT_FOLDER = r"C:\Users\fuchs\Desktop\gsb_hackathon_ws\web_test\Test\gsb.gov.tr"
OUTPUT_FOLDER = "cikti_klasoru"

# Çıktı klasörü yoksa oluşturalım
if not os.path.exists(OUTPUT_FOLDER):
    os.makedirs(OUTPUT_FOLDER)

# Klasördeki dosyaları dolaşalım
for filename in os.listdir(INPUT_FOLDER):
    filepath = os.path.join(INPUT_FOLDER, filename)

    # HTML dosyası mı kontrol edelim
    if os.path.isfile(filepath) and filename.lower().endswith(".html"):
        try:
            # Dosyayı oku
            with open(filepath, "r", encoding="utf-8") as f:
                html_content = f.read()

            # BeautifulSoup ile parse et
            soup = BeautifulSoup(html_content, 'html.parser')

            # Tüm metni (text) alalım
            all_text = soup.get_text(separator="\n", strip=True)

            # Çıktı dosya adını belirleyelim
            output_filename = os.path.splitext(filename)[0] + "_tum_metin.txt"
            output_path = os.path.join(OUTPUT_FOLDER, output_filename)

            # Metni çıktı dosyasına yaz
            with open(output_path, "w", encoding="utf-8") as out_file:
                out_file.write(all_text)

            print(f"{filename} içindeki tüm metin, {output_filename} dosyasına kaydedildi.")

        except PermissionError:
            # Windows'ta bazı dosyalar kapalı olmayabilir, o yüzden hata alabilirsiniz
            print(f"Dosya erişim hatası: {filepath} - Permission Denied.")
        except Exception as e:
            print(f"Hata oluştu: {e}")
    else:
        # .html uzantısı olmayan veya klasör olan öğeleri atla
        print(f"{filename} bir .html dosyası değil. Geçiyorum...")
