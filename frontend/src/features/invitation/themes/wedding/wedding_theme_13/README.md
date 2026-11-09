# Pangantén Sunda — undangan pernikahan 3D

- Ubah data acara, foto, rekening, warna, musik, dan kepadatan adegan di `src/config.js`.
- Build: `python3 build.py`. Skrip ini mengecek sintaks semua modul JS dan memastikan setiap aset yang dirujuk ada, lalu menghasilkan `dist/index.html` + `dist/assets/`.
- Hosting: unggah isi folder `dist/` apa adanya.
- Nama tamu personal: tambahkan `#Nama_Tamu` di akhir tautan, contoh `.../index.html#Budi_Santoso`.
- Aset: lihat `MANIFEST.md`. Buat ulang tekstur dengan `python3 make_sunda_assets.py` dan ilustrasi dengan `python3 make_panganten_svg.py`.
- RSVP & buku tamu: isi `rsvp.endpoint` / `bukuTamu.endpoint` dengan URL backend (POST JSON) bila ingin tersimpan terpusat. Tanpa itu, RSVP dikirim lewat WhatsApp dan ucapan hanya tersimpan di perangkat tamu.
