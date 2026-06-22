================================================================================
                    IT HOSPITAL SYSTEM v1.0.0
                    ===========================
                    Developed for Hospital IT Teams
================================================================================


📋 DAFTAR ISI
================================================================================
1. Deskripsi Sistem
2. Tech Stack
3. Cara Install
4. Cara Menjalankan
5. Login & Akun
6. Fitur Lengkap
7. QR Code System
8. Remote Access (RustDesk)
9. Cara Backup & Restore Database
10. Cara Ganti Branding RS
11. Activity Log
12. Troubleshooting
13. Perintah Penting
14. Akses dari Komputer Lain
15. Update Sistem
16. Kontak & Support


================================================================================
1. DESKRIPSI SISTEM
================================================================================
IT Hospital System adalah aplikasi web manajemen untuk tim IT rumah sakit.
Fitur meliputi:

✅ Morning Check (Pengecekan rutin pagi hari - GLOBAL, cukup 1x per hari)
✅ Inventaris Aset IT + QR Code (PC, Laptop, Printer, dll)
✅ Issue Tracker (Manajemen kerusakan dengan SLA)
✅ Kanban Board (Task management drag & drop)
✅ Reports & Analytics (Laporan + Export Excel)
✅ Remote Access (RustDesk self-hosted)
✅ Admin Panel (Manajemen user, activity log, backup, restore, settings)
✅ Dashboard Notifikasi (Critical issues, SLA, dll)
✅ QR Code untuk setiap aset (generate, cetak massal, scan)
✅ Dark/Light Mode
✅ Industrial UI/UX (Command Center style)


================================================================================
2. TECH STACK
================================================================================
Frontend:
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS + Shadcn/ui
- Zustand (State management)

Backend:
- Node.js 20+
- Prisma ORM
- PostgreSQL
- JWT Authentication

Tools:
- QR Code (qrcode library)
- Excel Export (xlsx library)
- Docker (opsional)
- PM2 (process manager)
- RustDesk (remote access)


================================================================================
3. CARA INSTALL (PERTAMA KALI)
================================================================================

📌 Prasyarat:
   - Node.js v20 atau lebih tinggi
   - PostgreSQL v16 atau lebih tinggi
   - Git (opsional)

📌 Langkah-langkah:

1. Clone atau copy folder project ke komputer server
   (misal: C:\it-hospital-system)

2. Buka PowerShell / CMD sebagai Administrator

3. Masuk ke folder project:
   cd C:\it-hospital-system

4. Install dependencies:
   npm install

5. Copy file .env.example menjadi .env:
   copy .env.example .env

6. Edit file .env, sesuaikan dengan environment lo:
   - DATABASE_URL (password PostgreSQL lo)
   - JWT_SECRET (ganti dengan random string)

7. Generate Prisma client:
   npx prisma generate

8. Migrate database:
   npx prisma migrate dev --name init

9. Seed database (isi data awal):
   npm run db:seed

10. Build aplikasi:
    npm run build

11. Jalankan aplikasi:
    npm run start

12. Buka browser: http://localhost:3005


================================================================================
4. CARA MENJALANKAN (SETIAP HARI)
================================================================================

📌 Mode Development (untuk coding/testing):
   cd C:\it-hospital-system
   npm run dev
   Akses: http://localhost:3005

📌 Mode Production (untuk pemakaian sehari-hari):
   cd C:\it-hospital-system
   npm run start
   Akses: http://localhost:3005

📌 Menghentikan aplikasi:
   Tekan Ctrl+C di terminal


================================================================================
5. LOGIN & AKUN
================================================================================

⚠️ TIDAK ADA DEFAULT LOGIN ⚠️

Hubungi SUPERADMIN untuk mendapatkan:
- Email login
- Password sementara

Setelah login pertama, segera ganti password untuk keamanan.


================================================================================
6. FITUR LENGKAP
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│ DASHBOARD                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Notifikasi real-time (critical issues, SLA deadline, morning check)       │
│ • Statistik (uptime, active assets, critical issues, open issues)           │
│ • Klik card untuk langsung ke halaman terkait                               │
│ • Network status dari asset yang punya IP address                           │
│ • Quick action buttons (Morning Check, New Issue, Inventory, Kanban)        │
│ • System uptime dihitung dari history morning check (30 hari)               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ MORNING CHECK (GLOBAL)                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ • CUKUP SATU KALI per hari untuk seluruh tim IT                             │
│ • Pengecekan jaringan (ping ke Google, SIMRS, Database) dengan animasi radar│
│ • Status aplikasi (SIMRS, PACS, Unified Controller)                         │
│ • PRTG recap (alert count & notes)                                          │
│ • Status Access Point (total, online, offline)                              │
│ • Server room physical check (UPS, kabel, AC, suhu)                         │
│ • Hanya Admin/Superadmin yang bisa edit setelah terisi                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ INVENTARIS + QR CODE                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Tambah/edit/hapus aset IT                                                 │
│ • Auto-generate kode aset (PC-2026-001)                                     │
│ • Auto-generate QR CODE saat tambah aset                                    │
│ • Kategori & lokasi maintainable dari UI                                    │
│ • Filter & search                                                           │
│ • Cetak QR Code (single atau massal dengan checkbox)                        │
│ • Scan QR Code dengan HP langsung ke detail aset                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ ISSUE TRACKER                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Lapor kerusakan dengan prioritas (Critical/High/Medium/Low)               │
│ • SLA deadline otomatis berdasarkan prioritas                               │
│ • Assign teknisi ke tiket                                                   │
│ • Update status (Open → In Progress → Resolved → Closed)                    │
│ • Timeline aktivitas tiket                                                  │
│ • Hanya Admin/Superadmin yang bisa menghapus tiket                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ KANBAN BOARD                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ • 3 kolom: Todo, Doing, Done                                                │
│ • Drag & drop antar kolom                                                   │
│ • Priority badge, assignee, due date, labels                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ REPORTS                                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Laporan Harian (morning check + issues hari ini)                          │
│ • Laporan Bulanan (statistik lengkap + grafik pie chart)                    │
│ • Laporan Inventaris (daftar semua aset)                                    │
│ • Laporan Kerusakan (daftar semua tiket)                                    │
│ • Export ke Excel                                                           │
│ • Print laporan                                                             │
│ • Kop surat otomatis dari data RS (bisa diubah di Settings)                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ REMOTE ACCESS (RUSTDESK)                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Self-hosted RustDesk server                                               │
│ • Remote PC/laptop dari dalam/luar kantor                                   │
│ • Status online/offline berdasarkan ping ke IP                              │
│ • Koneksi langsung (P2P) atau via relay                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ ADMIN PANEL (Hanya SUPERADMIN)                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ • User Management (tambah/edit/hapus user, reset password, assign role)     │
│ • Activity Log (lihat semua aktivitas user)                                 │
│ • Backup Database (backup manual & download file .sql)                      │
│ • Restore Database (upload file backup untuk restore) ⚠️                    │
│ • System Settings (ubah nama RS, alamat, kop surat, branding)               │
└─────────────────────────────────────────────────────────────────────────────┘


================================================================================
7. QR CODE SYSTEM
================================================================================

📌 Generate QR Code:
   - Otomatis saat tambah aset baru
   - Atau klik tombol "GENERATE QR CODE" di detail aset

📌 Cetak QR Code:
   - Single: Buka detail aset → klik "CETAK QR CODE"
   - Massal: Di halaman inventaris, centang aset → klik "CETAK QR (X)"

📌 Scan QR Code:
   1. Buka kamera HP
   2. Arahkan ke QR code
   3. Klik link yang muncul
   4. Langsung ke halaman detail aset

📌 Lokasi file QR:
   C:\it-hospital-system\public\qrcodes\


================================================================================
8. REMOTE ACCESS (RUSTDESK)
================================================================================

📌 Persiapan Server:

1. Download RustDesk Server:
   https://github.com/rustdesk/rustdesk-server/releases
   Pilih: rustdesk-server-windows-x64.zip

2. Extract ke folder C:\rustdesk-server

3. Jalankan server:
   cd C:\rustdesk-server
   start hbbs.exe
   start hbbr.exe

4. Buka Firewall:
   netsh advfirewall firewall add rule name="RustDesk HBBS TCP" dir=in action=allow protocol=TCP localport=21115-21116
   netsh advfirewall firewall add rule name="RustDesk HBBS UDP" dir=in action=allow protocol=UDP localport=21116
   netsh advfirewall firewall add rule name="RustDesk HBBR" dir=in action=allow protocol=TCP localport=21117

5. Catat Key server:
   type C:\rustdesk-server\id_ed25519.pub

📌 Setting Client (PC yang akan diremote):

1. Download RustDesk Client:
   https://github.com/rustdesk/rustdesk/releases
   Pilih: rustdesk-1.3.8-x86_64.exe

2. Install dan buka RustDesk

3. Klik titik 3 (⋮) → ID/Relay Server

4. Isi:
   - ID Server: [IP_SERVER_RUSTDESK]
   - Relay Server: [IP_SERVER_RUSTDESK]
   - Key: [KEY_DARI_SERVER]

5. Klik Apply → tunggu status "Ready"

6. Catat ID Client (tanpa spasi)

📌 Integrasi ke IT Hospital System:

1. Buka IT Hospital System → Inventaris
2. Edit aset PC target
3. Isi kolom "RustDesk ID" dengan ID Client
4. Simpan
5. Buka menu Remote → Klik tombol RustDesk


================================================================================
9. CARA BACKUP & RESTORE DATABASE
================================================================================

📌 Backup (Download):
   1. Login sebagai SUPERADMIN
   2. Buka menu ADMIN → BACKUP
   3. Klik "CREATE BACKUP"
   4. Download file backup (.sql)
   5. Simpan di folder aman

📌 Restore (Upload):
   1. Login sebagai SUPERADMIN
   2. Buka menu ADMIN → BACKUP
   3. Pilih file backup (.sql) dari komputer
   4. Klik "RESTORE"
   5. Konfirmasi peringatan
   6. Tunggu proses restore selesai

⚠️ PERINGATAN RESTORE:
   - Restore akan MENIMPA semua data yang ada
   - Pastikan sudah melakukan backup terbaru
   - Hanya file .sql yang didukung
   - TINDAKAN INI TIDAK DAPAT DIBATALKAN!

📌 Backup via Command Line:
   cd C:\it-hospital-system
   "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" -h localhost -p 5432 -U postgres -d it_hospital --inserts -f backup.sql

📌 Restore via Command Line:
   "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -p 5432 -U postgres -d it_hospital -f backup.sql


================================================================================
10. CARA GANTI BRANDING RUMAH SAKIT
================================================================================

1. Login sebagai SUPERADMIN
2. Buka menu ADMIN → SETTINGS
3. Isi data RS:
   - Nama Rumah Sakit
   - Alamat
   - Telepon
   - Email
   - Website
4. Isi kop surat laporan:
   - Header Laporan
   - Footer Laporan
5. Isi branding aplikasi:
   - Nama Aplikasi
   - Nama Singkat
6. Klik "SAVE SETTINGS"

Semua perubahan akan langsung tampil di:
   - Halaman Login
   - Dashboard
   - Laporan PDF/Print
   - Sidebar


================================================================================
11. ACTIVITY LOG
================================================================================

📌 Fitur:
   - Mencatat semua aktivitas user (LOGIN, CREATE, UPDATE, DELETE, RESTORE)
   - Meliputi modul: AUTH, INVENTORY, ISSUE, KANBAN, MORNING_CHECK, BACKUP

📌 Cara Akses:
   1. Login sebagai SUPERADMIN
   2. Buka menu ADMIN → ACTIVITY LOG
   3. Filter berdasarkan modul, aksi, atau tanggal
   4. Lihat siapa melakukan apa dan kapan

📌 Informasi yang Tersedia:
   - Waktu aktivitas
   - Nama dan email user
   - Jenis aksi
   - Modul yang diakses
   - Target (nama aset/tiket)
   - IP Address


================================================================================
12. TROUBLESHOOTING
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│ MASALAH: Aplikasi tidak bisa diakses (404 / ERR_CONNECTION_REFUSED)         │
├─────────────────────────────────────────────────────────────────────────────┤
│ SOLUSI:                                                                     │
│   1. Cek apakah aplikasi jalan: `curl http://localhost:3005`                │
│   2. Cek port: netstat -an | findstr :3005                                  │
│   3. Restart aplikasi: Ctrl+C → npm run start                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ MASALAH: QR Code tidak muncul                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ SOLUSI:                                                                     │
│   1. Cek folder qrcodes: Get-ChildItem public\qrcodes                       │
│   2. Generate ulang: Klik "GENERATE QR CODE" di detail aset                 │
│   3. Cek database: npx prisma studio → lihat kolom qrCodeUrl                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ MASALAH: RustDesk client status "Connecting..."                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ SOLUSI:                                                                     │
│   1. Pastikan server hbbs/hbbr jalan: tasklist | findstr hbbs               │
│   2. Cek koneksi: Test-NetConnection [IP_SERVER] -Port 21116                │
│   3. Cek setting ID/Relay Server di client                                  │
│   4. Pastikan key server sesuai                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ MASALAH: Restore database gagal                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ SOLUSI:                                                                     │
│   1. Pastikan file backup berformat .sql (bukan .dump)                      │
│   2. Pastikan file backup tidak corrupt                                     │
│   3. Cek koneksi database: psql -U postgres -d it_hospital -c "SELECT 1"    │
└─────────────────────────────────────────────────────────────────────────────┘


================================================================================
13. PERINTAH PENTING (QUICK REFERENCE)
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│ KEPERLUAN                    │ PERINTAH                                    │
├──────────────────────────────┼─────────────────────────────────────────────┤
│ Masuk folder project         │ cd C:\it-hospital-system                    │
├──────────────────────────────┼─────────────────────────────────────────────┤
│ Start development            │ npm run dev                                 │
├──────────────────────────────┼─────────────────────────────────────────────┤
│ Start production             │ npm run start                               │
├──────────────────────────────┼─────────────────────────────────────────────┤
│ Build production             │ npm run build                               │
├──────────────────────────────┼─────────────────────────────────────────────┤
│ Buka database GUI            │ npx prisma studio                           │
├──────────────────────────────┼─────────────────────────────────────────────┤
│ Seed database                │ npm run db:seed                             │
├──────────────────────────────┼─────────────────────────────────────────────┤
│ Reset database (HATI-HATI!)  │ npx prisma migrate reset                    │
├──────────────────────────────┼─────────────────────────────────────────────┤
│ Cek folder QR Code           │ Get-ChildItem public\qrcodes                │
├──────────────────────────────┼─────────────────────────────────────────────┤
│ Start RustDesk server        │ cd C:\rustdesk-server → start hbbs & hbbr   │
├──────────────────────────────┼─────────────────────────────────────────────┤
│ Backup database (manual)     │ pg_dump -U postgres -d it_hospital > backup.sql│
├──────────────────────────────┼─────────────────────────────────────────────┤
│ Restore database (manual)    │ psql -U postgres -d it_hospital -f backup.sql│
├──────────────────────────────┼─────────────────────────────────────────────┤
│ Cek IP komputer              │ ipconfig                                     │
├──────────────────────────────┼─────────────────────────────────────────────┤
│ Commit ke git                │ git add . → git commit -m "pesan"           │
└──────────────────────────────┴─────────────────────────────────────────────┘


================================================================================
14. AKSES DARI KOMPUTER LAIN
================================================================================

📌 Cari IP server:
   ipconfig
   Cari "IPv4 Address" (contoh: 192.168.1.100)

📌 Akses dari komputer lain di jaringan:
   http://192.168.1.100:3005

📌 Biarkan akses di Windows Firewall:
   New-NetFirewallRule -DisplayName "IT Hospital" -Direction Inbound -Protocol TCP -LocalPort 3005 -Action Allow


================================================================================
15. UPDATE SISTEM (KALAU ADA VERSI BARU)
================================================================================

1. Backup database dulu!
2. Hapus folder .next: Remove-Item -Recurse -Force .next
3. Pull kode terbaru (git pull)
4. Install dependencies baru: npm install
5. Update database: npx prisma migrate dev
6. Build ulang: npm run build
7. Start ulang: npm run start


================================================================================
16. KONTAK & SUPPORT
================================================================================

Developer: IT Hospital System Team
Email: support@ithospital.com
Website: www.ithospital.com

📌 Untuk laporan bug atau request fitur:
   - Buat issue di repository
   - Email ke support@ithospital.com


================================================================================
                    TERIMA KASIH TELAH MENGGUNAKAN
                    IT HOSPITAL SYSTEM v1.0.0
================================================================================