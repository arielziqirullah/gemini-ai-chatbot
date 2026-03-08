# MealPlannerID 🌿

MealPlannerID adalah chatbot AI berbasis Gemini yang membantu pengguna dalam merencanakan pola makan sehat, menyusun menu harian atau mingguan, dan memberikan rekomendasi nutrisi seimbang. Chatbot ini mendukung input teks, gambar, dokumen, maupun file audio.

---

## 🛠️ Library yang Digunakan

### Backend (`server/`)

| Library | Versi | Fungsi |
|---|---|---|
| [`express`](https://expressjs.com/) | ^5.2.1 | Framework web untuk membangun REST API dan menyajikan file statis |
| [`@google/genai`](https://www.npmjs.com/package/@google/genai) | ^1.44.0 | SDK resmi Google Generative AI untuk mengakses model Gemini |
| [`multer`](https://github.com/expressjs/multer) | ^2.1.1 | Middleware untuk menangani unggahan file (`multipart/form-data`) |
| [`dotenv`](https://github.com/motdotla/dotenv) | ^16.0.0 | Memuat variabel lingkungan dari file `.env` |
| [`cors`](https://github.com/expressjs/cors) | ^2.8.6 | Middleware untuk mengaktifkan Cross-Origin Resource Sharing |

### Frontend (`server/public/`)

| Library | Sumber | Fungsi |
|---|---|---|
| [`showdown.js`](https://github.com/showdownjs/showdown) | CDN | Mengkonversi Markdown dari respons AI menjadi HTML |
| [Google Fonts - Poppins](https://fonts.google.com/specimen/Poppins) | CDN | Font utama untuk tampilan yang bersih dan modern |

---

## ⚙️ Prasyarat

Pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/) versi 18 atau lebih baru
- npm (sudah termasuk dalam instalasi Node.js)
- API Key dari [Google AI Studio](https://aistudio.google.com/)

---

## 🚀 Cara Menjalankan Project

### 1. Clone atau buka folder project

```bash
cd server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Buat file `.env`

Buat file `.env` di dalam folder `server/` dan isi dengan:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-pro
PORT=3000
```

Ganti `your_gemini_api_key_here` dengan API Key Anda dari Google AI Studio.

### 4. Jalankan server

```bash
node index.js
```

### 5. Buka di browser

Setelah server berjalan, buka browser dan akses:

```
http://localhost:3000
```

---

## 💬 Fitur

- Chat berbasis AI dengan model Gemini
- Mendukung unggahan **gambar**, **dokumen (PDF)**, dan **audio**
- Gambar yang dikirim ditampilkan langsung di kotak obrolan
- Respons AI dirender dalam format **Markdown**
- Riwayat percakapan disimpan selama sesi berlangsung
- Tampilan UI yang bersih dan responsif bertema hijau alam

---

## 📁 Struktur Project

```
server/
├── index.js          # Entry point backend (Express + Gemini API)
├── package.json      # Konfigurasi dan dependencies Node.js
├── .env              # Variabel lingkungan (tidak di-commit)
└── public/
    ├── index.html    # Halaman utama frontend
    ├── script.js     # Logika frontend (fetch API, UI)
    └── style.css     # Gaya tampilan UI
```
