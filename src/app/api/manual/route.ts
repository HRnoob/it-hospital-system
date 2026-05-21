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
          'Buka browser dan akses http://localhost:3005',
          'Login dengan email dan password yang diberikan oleh SUPERADMIN',
          'Default SUPERADMIN: superadmin@rumahsakit.id / admin123'
        ]
      },
      {
        title: 'Dashboard',
        icon: '📊',
        content: [
          'Menampilkan ringkasan sistem secara real-time',
          'Klik card statistik untuk langsung menuju halaman terkait',
          'Notifikasi muncul jika ada issue critical atau morning check belum diisi',
          'Network status menampilkan status device berdasarkan IP address'
        ]
      },
      {
        title: 'Morning Check',
        icon: '✅',
        content: [
          'Digunakan setiap pagi untuk pengecekan rutin',
          'Klik "PING ALL" untuk cek koneksi jaringan',
          'Isi status aplikasi, PRTG recap, access point, dan server room',
          'Simpan checklist, akan tersimpan dengan timestamp'
        ]
      },
      {
        title: 'Inventaris',
        icon: '📦',
        content: [
          'Kelola semua aset IT rumah sakit',
          'Tambah aset baru dengan klik "ADD ASSET"',
          'Edit aset untuk mengubah informasi',
          'Hapus aset yang tidak terpakai',
          'Filter dan search untuk mencari aset tertentu',
          'Setiap aset memiliki QR code unik'
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
          'SLA deadline akan terlihat di detail tiket'
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
        title: 'Reports',
        icon: '📄',
        content: [
          'Generate laporan harian, bulanan, inventaris, dan kerusakan',
          'Pilih periode tanggal',
          'Export ke PDF (coming soon), Print, atau Excel',
          'Laporan bisa di-cetak langsung'
        ]
      },
      {
        title: 'Remote Access',
        icon: '🖥️',
        content: [
          'Akses remote ke device yang sudah dikonfigurasi',
          'RustDesk: butuh aplikasi RustDesk terinstall',
          'Guacamole: akses via browser',
          'Status online/offline berdasarkan ping ke IP address'
        ]
      },
      {
        title: 'Admin Panel',
        icon: '👑',
        content: [
          'Hanya SUPERADMIN yang dapat mengakses',
          'User Management: tambah/edit/hapus user, reset password, assign role',
          'Activity Log: lihat semua aktivitas user',
          'Backup: backup database manual'
        ]
      },
      {
        title: 'Tips & Trik',
        icon: '💡',
        content: [
          'Gunakan dark/light mode toggle di sidebar untuk kenyamanan mata',
          'Sidebar bisa di-collapse dengan klik tombol panah',
      'Filter data di tabel untuk pencarian cepat',
          'Export Excel untuk analisis data lebih lanjut'
        ]
      }
    ]
  }

  return NextResponse.json({ success: true, data: manualData })
}