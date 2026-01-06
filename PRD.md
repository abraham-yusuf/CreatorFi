

# **Product Requirement Document (PRD)**

## **x402 CreatorFi \- Web3 Pay-Per-View Marketplace**

| Metadata | Detail |
| :---- | :---- |
| **Nama Produk** | CreatorFi (x402 Implementation) |
| **Versi Dokumen** | 1.0 (MVP Phase) |
| **Status** | In Development / Live Beta |
| **Platform** | Web (Mobile Responsive) |
| **Tech Stack** | Next.js 14+, PostgreSQL (Prisma), x402 Protocol, EVM/Solana Wallet |

## **1\. Ringkasan Eksekutif (Executive Summary)**

**CreatorFi** adalah platform konten terdesentralisasi yang memungkinkan kreator memonetisasi karya digital mereka (Artikel, Video, Audio) secara eceran (*micropayments*) tanpa perantara terpusat.

Berbeda dengan model langganan bulanan (seperti Patreon/OnlyFans), CreatorFi menggunakan protokol **HTTP 402 (Payment Required)**. Pengguna hanya membayar untuk konten spesifik yang ingin mereka nikmati secara instan menggunakan dompet kripto (Crypto Wallet), tanpa perlu mendaftar akun (Loginless) atau berlangganan jangka panjang.

## **2\. Masalah & Solusi**

### **Masalah**

1. **Subscription Fatigue:** Pengguna enggan membayar langganan bulanan penuh hanya untuk melihat satu atau dua konten dari seorang kreator.  
2. **Middleman Fees:** Platform Web2 mengambil potongan besar (20-30%) dari pendapatan kreator.  
3. **Privasi:** Pengguna harus menyerahkan data email dan kartu kredit untuk mengakses konten berbayar.

### **Solusi**

1. **Pay-per-View:** Model "Bayar Eceran" menggunakan stablecoin (USDC) dengan biaya gas rendah (Base/Solana).  
2. **Peer-to-Peer:** Pembayaran dikirim langsung dari wallet User ke wallet Kreator melalui protokol x402.  
3. **Anonymous Access:** Akses berbasis kepemilikan token/pembayaran on-chain, bukan login email.

## **3\. Spesifikasi Fitur (Functional Requirements)**

### **A. Halaman Beranda (Marketplace Landing Page)**

**Tujuan:** Menampilkan katalog konten yang tersedia agar mudah ditemukan pengguna.

* **FR-01 (Grid Layout):** Menampilkan daftar konten dalam bentuk kartu (Card UI).  
  * *Mobile:* 1 Kolom.  
  * *Tablet/Desktop:* 2-3 Kolom (Responsif).  
* **FR-02 (Card Component):** Setiap kartu harus menampilkan:  
  * Thumbnail Image.  
  * Judul Konten.  
  * Nama & Avatar Kreator.  
  * Harga (dalam USDC).  
  * Ikon Tipe Konten (Video/Audio/Artikel).  
  * Indikator Gembok (Lock) untuk konten berbayar.  
* **FR-03 (Filtering):** Tab navigasi untuk menyaring konten berdasarkan tipe: Semua, Video, Artikel, Audio.

### **B. Dasbor Kreator (Creator Dashboard)**

**Tujuan:** Memungkinkan kreator mengunggah dan memberi harga pada karya mereka.

* **FR-04 (Wallet Connect):** Kreator wajib menghubungkan wallet sebelum mengunggah.  
* **FR-05 (Upload Form):** Formulir input yang mencakup:  
  * Judul & Deskripsi (Teaser).  
  * Tipe Konten (Dropdown: Video, Audio, Artikel).  
  * File Upload (untuk Media) atau Text Editor (untuk Artikel).  
  * **Harga Akses:** Input nominal dalam USDC (contoh: 0.5 USDC).  
* **FR-06 (Data Persistence):** Data metadata disimpan ke PostgreSQL via Server Actions. File media disimpan ke object storage (S3/IPFS) \- *Untuk MVP bisa menggunakan URL direct*.

### **C. Halaman Konsumsi Konten (Dynamic Content Page)**

**Tujuan:** Halaman detail untuk melihat/membaca konten. Menggunakan arsitektur **Server Shell \+ Client Fetcher**.

* **FR-07 (Server Shell \- SEO):**  
  * Halaman app/content/\[id\]/page.tsx harus di-render di server.  
  * Hanya menampilkan metadata publik: Judul, Deskripsi, Harga, Nama Kreator.  
  * **Keamanan:** Dilarang merender URL video/isi artikel di layer ini.  
* **FR-08 (Access Controller):**  
  * Komponen Client Side yang otomatis memanggil API GET /api/access/\[id\].  
  * Menangani 3 status: Loading, Locked (402), Unlocked (200).

### **D. Sistem Paywall & Protokol x402 (The Core)**

**Tujuan:** Menangani logika pembayaran dan pembukaan akses.

* **FR-09 (API Gatekeeper):**  
  * Endpoint: GET /api/access/\[id\].  
  * Tugas: Mengecek Cookie Akses (x402-access-\[id\]).  
  * **Respon 402:** Jika cookie tidak ada, return status 402 dengan Headers: X-Payment-Address, X-Payment-Amount, X-Payment-Currency.  
  * **Respon 200:** Jika cookie valid, return JSON berisi URL Video atau Isi Artikel.  
* **FR-10 (Client Paywall UI):**  
  * Jika API mengembalikan 402, tampilkan UI Paywall.  
  * Tombol "Bayar \[Harga\] USDC".  
  * Integrasi Wallet (Wagmi/Viem) untuk menandatangani transaksi transfer USDC.  
  * Setelah sukses on-chain, panggil Server Action untuk set Cookie.  
* **FR-11 (Media Player):**  
  * Jika akses terbuka (200 OK), render player sesuai tipe:  
    * \<video\> player untuk tipe VIDEO.  
    * \<audio\> player untuk tipe AUDIO.  
    * Text Renderer untuk tipe ARTICLE.

## **4\. Arsitektur Teknis (Technical Architecture)**

### **Database Schema (Prisma PostgreSQL)**

model User {  
  id            String    @id @default(cuid())  
  walletAddress String    @unique  
  username      String?  
  contents      Content\[\]  
  createdAt     DateTime  @default(now())  
}

model Content {  
  id             String   @id @default(cuid())  
  title          String  
  description    String?  
  type           String   // ENUM: VIDEO, AUDIO, ARTICLE  
  price          Decimal  // Disimpan sebagai angka desimal  
  currency       String   @default("USDC")  
    
  // Data Privat (Hanya diakses via API Gatekeeper)  
  contentUrl     String?  // Untuk Video/Audio  
  textContent    String?  // Untuk Artikel  
    
  creatorId      String?  
  creatorAddress String   // Redundant tapi perlu untuk x402 header cepat  
  creator        User?    @relation(fields: \[creatorId\], references: \[id\])  
    
  createdAt      DateTime @default(now())  
}

### **Flow Pembayaran (User Journey)**

1. **User** membuka halaman konten.  
2. **Browser** menampilkan judul & deskripsi, tapi player *loading*.  
3. **Client** request ke API Backend.  
4. **API** cek cookie \-\> Tidak ada \-\> Return **402**.  
5. **Client** menampilkan tombol **Bayar**.  
6. **User** klik Bayar \-\> Metamask terbuka \-\> User konfirmasi transfer USDC.  
7. **Sistem** memverifikasi transaksi \-\> Set Cookie x402-access-\[id\]=true.  
8. **Client** request ulang ke API Backend.  
9. **API** cek cookie \-\> Ada \-\> Return **200** \+ Link Video.  
10. **Client** menampilkan video.

## **5\. Non-Functional Requirements**

1. **Keamanan:** URL asli video/audio tidak boleh terekspos di *View Source* HTML sebelum pembayaran.  
2. **Performa:** Halaman shell harus dimuat di bawah 1.5 detik (menggunakan Next.js SSR).  
3. **SEO:** Judul dan Deskripsi konten harus dapat diindeks oleh mesin pencari (Google).  
4. **Kompatibilitas:** Mendukung wallet EVM standar (Metamask, Coinbase Wallet, Rabbit).  
5. **Network:** Optimal berjalan di jaringan L2 murah (Base) atau High Speed L1 (Solana/Avalanche) untuk biaya gas rendah.

## **6\. Roadmap Pengembangan**

### **Fase 1: MVP**

* \[ \] Setup Next.js & Tailwind.  
* \[ \] Integrasi Database PostgreSQL.  
* \[ \] Landing Page dengan Grid Card.  
* \[ \] Creator Dashboard (Upload & Set Harga).  
* \[ \] Implementasi Protokol x402 (Guard 402 & Headers).  
* \[ \] Paywall UI Component (Mocked/Simulated Payment).

### **Fase 2: On-Chain Integration (Next Step)**

* \[ \] Mengganti simulasi pembayaran dengan *Real Transaction Signing* (USDC Transfer).  
* \[ \] Verifikasi transaksi on-chain di sisi server (mencegah pemalsuan cookie).  
* \[ \] Support Upload File asli ke IPFS/Arweave (Decentralized Storage).

### **Fase 3: Advanced Features**

* \[ \] Multi-chain support (Bayar pakai SOL atau ETH).  
* \[ \] Fitur "Tipping" tambahan untuk kreator.  
* \[ \] Social Features (Komentar hanya untuk yang sudah bayar).
