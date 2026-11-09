"""Build: gabungkan src/*.js ke dalam src/index.html menjadi dist/index.html, salin aset, dan cek sintaks."""
import os, re, shutil, subprocess, sys, json
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC, DIST = os.path.join(ROOT, 'src'), os.path.join(ROOT, 'dist')
os.makedirs(DIST, exist_ok=True)
ok = True
for f in ['config.js', 'ui.js', 'musik.js', 'adegan.js']:
    r = subprocess.run(['node', '--check', os.path.join(SRC, f)], capture_output=True, text=True)
    print(f'lint {f:12s}', 'OK' if r.returncode == 0 else 'GAGAL\n' + r.stderr); ok &= r.returncode == 0
html = open(os.path.join(SRC, 'index.html')).read()
html = re.sub(r'<!--INLINE:([\w.]+)-->', lambda m: '<script>\n' + open(os.path.join(SRC, m.group(1))).read() + '\n</script>', html)
# semua aset yang dirujuk harus ada
refs = sorted(set(re.findall(r"assets/[\w.\-]+\.(?:jpg|png|svg)", html)) | set(re.findall(r"tex\('([\w.\-]+\.(?:jpg|png))'", html)))
refs = sorted({r if r.startswith('assets/') else 'assets/' + r for r in refs})
hilang = [r for r in refs if not os.path.exists(os.path.join(ROOT, r))]
print('aset dirujuk:', len(refs), '| hilang:', hilang or 'tidak ada'); ok &= not hilang
open(os.path.join(DIST, 'index.html'), 'w').write(html)
if os.path.exists(os.path.join(DIST, 'assets')): shutil.rmtree(os.path.join(DIST, 'assets'))
shutil.copytree(os.path.join(ROOT, 'assets'), os.path.join(DIST, 'assets'))
json.dump(refs, open(os.path.join(DIST, 'aset-dipakai.json'), 'w'), indent=1)
print('ukuran index.html:', os.path.getsize(os.path.join(DIST, 'index.html')) // 1024, 'KB')
sys.exit(0 if ok else 1)
