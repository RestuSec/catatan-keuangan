# 💰 Catatan Keuangan

Aplikasi pencatat keuangan **1 file** yang bisa dipakai **offline di laptop & HP** dan **bisa dipakai bersama banyak orang** — setiap orang punya **akun cloud sendiri** yang terpisah & terenkripsi-per-akun.

## ✨ Fitur
- **Catat transaksi**: Pemasukan (+), Pengeluaran (−), Beli Aset (−), Jual Aset (+), dan **"Aset (sudah punya)"** — masuk portofolio tanpa mengurangi saldo kas.
- **Dasbor** dengan grafik:
  - 🍩 Donut **Portofolio per Aset** (termasuk Saldo Kas)
  - 🍩 Donut **Pemasukan per Kategori**
  - 🍩 Donut **Pengeluaran per Kategori**
  - 📊 Bar **Pemasukan vs Pengeluaran** (30 hari terakhir)
  - 📈 Garis **Total Kekayaan** (6 bulan terakhir)
- **Portofolio aset**: pantau modal ditanam, harga sekarang, nilai, dan laba/rugi. Nilai aset = dana ditanam × (harga sekarang ÷ harga beli).
- **Target tabungan** dengan progres.
- **Sinkronisasi cloud** antar perangkat via login akun (tidak butuh server sendiri).
- **Ekspor & impor JSON**, plus **Ekspor Excel** (4 sheet: Ringkasan, Transaksi, Aset, Target).
- **Tema** bisa diganti, nama aplikasi bisa diubah.

## 🚀 Cara pakai

### 1) Langsung pakai (online)
Buka **https://restusec.github.io/catatan-keuangan/**

Pertama kali (dan untuk mencari File lokal/offline):
1. **Buka aplikasi** — langsung bisa dicatat. Tanpa login, data hanya tersimpan **di browser perangkat itu**.
2. Mau **akun cloud + sinkron antar perangkat**? → **Pengaturan → Sinkronisasi Cloud**.
3. Isi **Email** & **Sandi** → tekan **Buat Akun** (atau **Masuk** kalau sudah pernah daftar).
4. Setelah **✓ Terhubung**, semua data otomatis tersimpan di cloud dan **sinkron realtime** ke perangkat lain yang login dengan akun yang sama.

### 2) Offline (tanpa internet)
Aplikasi ini **hanya satu file HTML** + folder `vendor/` (library yang sudah diunduh lokal). Semua library sudah dibawa, jadi **tidak perlu koneksi internet** untuk dipakai.

1. Salin folder proyek ini (`index.html` + folder `vendor/`) ke laptop/HP.
2. **Double-click `index.html`** → kebuka di browser, semua fitur jalan (catat transaksi, grafik, ekspor Excel), data tersimpan di browser tersebut.
3. Untuk sinkron cloud saat nanti online → login akun seperti langkah di atas.

> 💡 **Catatan offline:** data lokal (browser tanpa login) dan data cloud itu **tempat berbeda**. Kalau sudah punya akun, selalu login biar semua perangkat datanya sama.

## 🔐 Privasi & keamanan
- **Setiap akun punya ruang data sendiri** di cloud. Aturan database hanya mengizinkan pemilik akun yang membaca/menulis datanya — akun lain tidak bisa.
- Password **tidak pernah disimpan** di aplikasi; semua ditangani Firebase Authentication (Google).
- Data tetap server-side aman walau statis; kalau mau deploy di tempat lain, tinggal buka file lokalnya.

## 🛠 Untuk developer (fork / deploy sendiri)
1. Fork repo ini.
2. (Opsional) Buat project Firebase sendiri (Real-time Database + Authentication, aktifkan Email/Password).
3. Ganti konfigurasi bawaan di `index.html` → cari `DEFAULT_FB`.
4. **Rules database** wajib (jangan pernah pakai public):
```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "data": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```
5. Deploy via GitHub Pages (Settings → Pages) atau hosting statis mana pun — `index.html` + `vendor/` saja cukup.

## 🧪 Tes
Harness ada di `_test/harness.js` — jalankan: `node _test/harness.js index.html`

## 📄 Lisensi
Gunakan bebas untuk kebutuhan sendiri.