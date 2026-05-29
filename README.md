# PETA Karir — FILKOM UB

Platform roadmap belajar interaktif untuk mahasiswa FILKOM UB.

---

## Struktur Folder

```
peta-karir/
│
├── index.html              ← Halaman utama
├── paths.html              ← Daftar semua path
├── dashboard.html          ← Dashboard progress
├── settings.html           ← Pengaturan
│
├── tailwind.config.js      ← Konfigurasi warna & font
│
├── css/
│   └── globals.css         ← CSS kustom (card, button, animasi, dll)
│
└── js/
    ├── data/
    │   └── paths.js            ← Data semua learning path
    │
    ├── store/
    │   └── progressStore.js    ← Simpan progress dari localStorage
    │
    ├── components/
    │   ├── Navbar.js           ← Navbar
    │   ├── Footer.js           ← Footer
    │   └── PathCard.js         ← Path card
    │
    └── pages/
        └── homepage.js         ← Logic index.html
```

---

## Cara Menambah Halaman Baru

1. Salin struktur `<head>` dari `index.html`
2. Tambah `<div id="navbar"></div>` di bagian atas `<body>`
3. Tambah `<div id="footer"></div>` di bagian bawah `<body>`
4. Load script dengan urutan ini:
   ```html
   <script src="js/data/paths.js"></script>
   <script src="js/store/progressStore.js"></script>
   <script src="js/components/Navbar.js"></script>
   <script src="js/components/Footer.js"></script>
   <script src="js/components/PathCard.js"></script>
   <script src="js/pages/namaHalaman.js"></script>
   ```
5. Buat file `js/pages/namaHalaman.js`, lalu panggil `Navbar.render()` dan `Footer.render()` di dalamnya

---

## Cara Kerja Progress (localStorage)

Progress disimpan otomatis di browser. Formatnya seperti ini:

```json
{
  "backend_dev": {
    "Programming Basics": "done",
    "API Design": "learning"
  }
}
```

Fungsi yang tersedia di `ProgressStore`:

| Fungsi | Kegunaan |
|---|---|
| `getDoneCount(pathId)` | Jumlah skill yang sudah selesai |
| `getPercent(pathId, total)` | Persentase selesai |
| `setActivePath(pathId)` | Set path yang sedang aktif |
| `subscribe(fn)` | Jalankan `fn()` setiap kali data berubah |

---

## Setup Git (Baca dulu sebelum mulai!)

### 1. Install Git

Cek dulu apakah Git sudah terinstall:
```bash
git --version
```

Kalau belum ada, download di [git-scm.com](https://git-scm.com/downloads) lalu install seperti biasa.
Setelah install, setting nama dan email kamu (ini yang muncul di commit):
```bash
git config --global user.name "Nama Kamu"
git config --global user.email "email@kamu.com"
```

---

### 2. Clone Repo

Lakukan ini **sekali saja** di awal, untuk mengambil project ke komputermu:
```bash
git clone https://github.com/nama-org/peta-karir.git
cd peta-karir
```

---

### 3. Buat Branch Sendiri

> ⚠️ Branch `main` protected, jadi **jangan push di main**.
> Setiap orang punya branch masing-masing.

Buat branch baru dengan namamu/feature (lakukan sekali saja):
```bash
git checkout -b nama-kamu/feature
```

Contoh:
```bash
git checkout -b nayla/landing-page
```

Cek branch kamu sekarang di mana:
```bash
git branch
```
Branch yang aktif tandanya `*`.

---

### 4. Alur Kerja

Setiap kali mau mulai ngoding, ikuti ini:

**Ambil update terbaru dari development:**
```bash
git checkout development
git pull origin development
git checkout nama-kamu/feature
git merge development
```

**Simpan progress kerja kamu (commit):**
```bash
git add .
git commit -m "deskripsi singkat apa yang di kerjakan"
```

Contoh pesan commit (harus jelas):
```bash
git commit -m "tambah halaman dashboard"
git commit -m "fix bug progress bar tidak update"
git commit -m "update warna navbar"
```

**Upload ke GitHub:**
```bash
git push origin nama-kamu/feature
```

---

### 5. Kalau Ada Konflik Saat Merge

**pakai `git stash` dulu**

Situasi nya pas kamu lagi di tengah ngoding tapi tiba-tiba perlu ambil update dari main.
```bash
# Simpan dulu kerjaanmu sementara
git stash

# Ambil update dari main
git checkout development
git pull origin development
git checkout nama-kamu/feature
git merge development

# Ambil kembali kerjaan yang tadi disimpan
git stash pop
```

Kalau setelah `merge` ada konflik, Git akan menandai file yang konflik.
Buka file tersebut, cari bagian seperti ini:
```
kode punyamu
```
Pilih mana yang mau dipakai (atau gabungkan keduanya), hapus tanda `<<<<`, `====`, `>>>>`, lalu commit lagi.

---
 
### 6. Minta Review (Pull Request)
 
Kalau bagianmu sudah selesai dan mau digabung ke development:
 
1. Push branch kamu ke GitHub:
   ```bash
   git push origin nama-kamu
   ```
2. Buka repo di GitHub
3. Klik tombol **"Compare & pull request"**
4. Pastikan arahnya: `nama-kamu/feature` → **`development`**
5. Tulis deskripsi singkat apa yang kamu kerjakan
6. Assign untuk di-review