import os
import zipfile

OUTPUT_ZIP = "garv-jain-portfolio-netlify.zip"

EXCLUDE_DIRS = {
    ".git",
    ".vercel",
    ".system_generated",
    "scratch",
    "__pycache__"
}

EXCLUDE_FILES = {
    OUTPUT_ZIP,
    ".gitignore",
    "build-zip.py",
    "package-zip.ps1"
}

def create_zip():
    base_dir = os.path.abspath(os.path.dirname(__file__))
    zip_path = os.path.join(base_dir, OUTPUT_ZIP)
    
    if os.path.exists(zip_path):
        os.remove(zip_path)

    print(f"Creating production Netlify archive: {OUTPUT_ZIP}...")
    
    file_count = 0
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
        for root, dirs, files in os.walk(base_dir):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            
            for file in sorted(files):
                if file in EXCLUDE_FILES or file.endswith(".zip") or file.endswith(".log"):
                    continue
                
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, base_dir)
                
                # Standardize forward slashes for Linux / Netlify compatibility
                arcname = rel_path.replace(os.path.sep, "/")
                
                zipf.write(full_path, arcname)
                print(f"  + Added: {arcname}")
                file_count += 1
                
    size_mb = os.path.getsize(zip_path) / (1024 * 1024)
    print(f"\nSuccessfully packaged {file_count} files into {OUTPUT_ZIP} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    create_zip()
