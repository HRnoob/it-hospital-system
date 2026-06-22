import { NextResponse } from 'next/server'

export async function GET() {
  const manualData = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    sections: [
      {
        title: 'Getting Started',
        icon: '🚀',
        content: [
          'Buka browser dan akses http://localhost:3005 (sesuaikan dengan IP server)',
          'Login dengan email dan password yang diberikan oleh SUPERADMIN',
          'Hubungi tim IT untuk mendapatkan akses',
          'Gunakan dark/light mode toggle di sidebar untuk kenyamanan mata',
          'Sidebar bisa di-collapse dengan klik tombol panah'
        ]
      },
      {
        title: 'Dashboard',
        icon: '📊',
        content: [
          'Menampilkan ringkasan sistem secara real-time',
          'Klik card statistik untuk langsung menuju halaman terkait',
          'Notifikasi muncul jika ada issue critical atau morning check belum diisi',
          'Network status menampilkan status device berdasarkan IP address',
          'System uptime dihitung dari history morning check (30 hari terakhir)'
        ]
      },
      {
        title: 'Morning Check (Global)',
        icon: '✅',
        content: [
          'Digunakan setiap pagi untuk pengecekan rutin (CUKUP SATU KALI per hari untuk semua tim)',
          'Klik "PING ALL" untuk cek koneksi jaringan dengan animasi radar',
          'Isi status aplikasi, PRTG recap, access point, dan server room',
          'Simpan checklist, akan tersimpan dengan timestamp',
          'Hanya Admin/Superadmin yang bisa edit jika sudah terisi'
        ]
      },
      {
        title: 'Inventaris + QR Code',
        icon: '📦',
        content: [
          'Kelola semua aset IT rumah sakit',
          'Tambah aset baru dengan klik "ADD ASSET" (QR Code auto generate)',
          'Edit aset untuk mengubah informasi',
          'Hapus aset yang tidak terpakai',
          'Filter dan search untuk mencari aset tertentu',
          'Cetak QR Code (single atau massal dengan centang)',
          'Scan QR Code dengan HP langsung ke detail aset'
        ]
      },
      {
        title: 'Issue Tracker',
        icon: '🐛',
        content: [
          'Laporkan kerusakan dengan klik "REPORT ISSUE"',
          'Pilih prioritas (Critical/High/Medium/Low) untuk SLA',
          'Assign teknisi ke tiket',
          'Update status tiket (Open → In Progress → Resolved → Closed)',
          'Lihat timeline aktivitas tiket',
          'SLA deadline akan terlihat di detail tiket',
          'Hanya Admin/Superadmin yang bisa menghapus tiket'
        ]
      },
      {
        title: 'Kanban Board',
        icon: '📋',
        content: [
          'Task management dengan drag & drop',
          '3 kolom: Todo, Doing, Done',
          'Drag task antar kolom untuk update progress',
          'Klik "ADD TASK" untuk buat task baru',
          'Set priority, assignee, due date, dan labels'
        ]
      },
      {
        title: 'Reports & Export',
        icon: '📄',
        content: [
          'Generate laporan harian, bulanan, inventaris, dan kerusakan',
          'Pilih periode tanggal',
          'Export ke Excel, Print, atau PDF (coming soon)',
          'Laporan bisa di-cetak langsung dengan kop surat RS'
        ]
      },
      {
        title: 'Remote Access (RustDesk)',
        icon: '🖥️',
        content: [
          'Akses remote ke device yang sudah dikonfigurasi',
          'Pastikan server RustDesk (hbbs/hbbr) berjalan',
          'Pastikan client RustDesk terinstall dan terhubung ke server',
          'RustDesk ID harus diisi di form inventaris',
          'Klik tombol "RustDesk" di menu Remote untuk konek'
        ]
      },
      {
        title: 'Admin Panel (Superadmin Only)',
        icon: '👑',
        content: [
          'User Management: tambah/edit/hapus user, reset password, assign role (Admin/Viewer)',
          'Activity Log: lihat semua aktivitas user (login, create, update, delete)',
          'Backup: backup database manual dan download file .sql',
          'Restore: upload file backup untuk restore database (⚠️ hati-hati)',
          'Settings: ubah nama RS, alamat, kop surat, dan branding aplikasi'
        ]
      },
      {
        title: 'Tips & Trik',
        icon: '💡',
        content: [
          'Gunakan dark/light mode toggle di sidebar untuk kenyamanan mata',
          'Sidebar bisa di-collapse dengan klik tombol panah',
          'Filter data di tabel untuk pencarian cepat',
          'Export Excel untuk analisis data lebih lanjut',
          'Cetak QR Code massal untuk pelabelan aset baru',
          'Morning Check cukup diisi 1x sehari oleh siapa saja'
        ]
      }
    ]
  }

  return NextResponse.json({ success: true, data: manualData })
}