import os
import zipfile

def make_source_zip(zip_path):
    exclude_dirs = {'.git', 'node_modules', 'dist', '__pycache__', '.aistudio'}
    exclude_files = {'bun.lock', '.DS_Store'}
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Prune excluded dirs
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
            for file in files:
                if file in exclude_files or file.endswith('.zip'):
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, '.')
                zipf.write(full_path, rel_path)

def make_dist_zip(zip_path):
    if not os.path.exists('dist'):
        return
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('dist'):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, 'dist')
                zipf.write(full_path, rel_path)

os.makedirs('public', exist_ok=True)
make_source_zip('public/pickleball-cun-cung-source.zip')
make_dist_zip('public/pickleball-cun-cung-dist.zip')
print("Successfully generated source and dist zips in public/")
