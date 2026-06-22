import { PrismaClient, Role, Priority, KanbanColumn } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ============================================
  // 1. CREATE SUPER ADMIN (AMAN - UPSERT)
  // ============================================
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@rumahsakit.id' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@rumahsakit.id',
      password: hashedPassword,
      role: Role.SUPERADMIN,
      isActive: true,
    },
  })
  console.log(`✅ User: ${superAdmin.email} (${superAdmin.role})`)

  // ============================================
  // 2. ASSET CATEGORIES (AMAN - UPSERT)
  // ============================================
  const categories = [
    { name: 'PC', icon: 'Monitor', description: 'Desktop Computer' },
    { name: 'Laptop', icon: 'Laptop', description: 'Notebook / Laptop' },
    { name: 'Printer', icon: 'Printer', description: 'Printer & Multifunction' },
    { name: 'Scanner', icon: 'Scan', description: 'Document Scanner' },
    { name: 'Access Point', icon: 'Wifi', description: 'Wireless Access Point' },
    { name: 'Switch', icon: 'Network', description: 'Network Switch' },
    { name: 'Router', icon: 'Router', description: 'Network Router' },
    { name: 'UPS', icon: 'Battery', description: 'Uninterruptible Power Supply' },
    { name: 'Server', icon: 'Server', description: 'Server Hardware' },
    { name: 'TV Pelayanan', icon: 'Tv', description: 'Patient Information Display' },
    { name: 'Mesin Antrol', icon: 'Ticket', description: 'Queue Machine' },
    { name: 'Finger Machine', icon: 'Fingerprint', description: 'Attendance Device' },
  ]

  for (const cat of categories) {
    await prisma.assetCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    })
  }
  console.log(`✅ ${categories.length} asset categories`)

  // ============================================
  // 3. LOCATIONS (AMAN - UPSERT)
  // ============================================
  const locations = [
    { name: 'Server Room', floor: 'Lantai 1', building: 'Gedung Utama' },
    { name: 'IGD', floor: 'Lantai 1', building: 'Gedung Utama' },
    { name: 'Radiologi', floor: 'Lantai 2', building: 'Gedung Utama' },
    { name: 'Laboratorium', floor: 'Lantai 2', building: 'Gedung Utama' },
    { name: 'Poli Umum', floor: 'Lantai 1', building: 'Gedung Poliklinik' },
    { name: 'Poli Gigi', floor: 'Lantai 1', building: 'Gedung Poliklinik' },
    { name: 'Ruang Perawatan A', floor: 'Lantai 2', building: 'Gedung Rawat Inap' },
    { name: 'Ruang Perawatan B', floor: 'Lantai 3', building: 'Gedung Rawat Inap' },
    { name: 'Farmasi', floor: 'Lantai 1', building: 'Gedung Utama' },
    { name: 'Administrasi', floor: 'Lantai 1', building: 'Gedung Utama' },
    { name: 'Ruang IT', floor: 'Lantai 1', building: 'Gedung Utama' },
  ]

  for (const loc of locations) {
    await prisma.location.upsert({
      where: { name: loc.name },
      update: {},
      create: loc,
    })
  }
  console.log(`✅ ${locations.length} locations`)

  // ============================================
  // 4. NETWORK TARGETS (AMAN - UPSERT)
  // ============================================
  const networkTargets = [
    { name: 'Google DNS', host: '8.8.8.8', type: 'ping', category: 'Internet' },
    { name: 'SIMRS Server', host: '10.0.101.192', type: 'ping', category: 'Server Aplikasi' },
    { name: 'Database Server', host: '10.0.101.191', type: 'ping', category: 'Server Database' },
    { name: 'Unified Controller', host: '10.0.101.100', type: 'http', port: 8080, category: 'Jaringan' },
    { name: 'PACS Server', host: '10.0.101.193', type: 'ping', category: 'Server Aplikasi' },
  ]

  for (const target of networkTargets) {
    await prisma.networkTarget.upsert({
      where: { id: target.name },
      update: {},
      create: target,
    })
  }
  console.log(`✅ ${networkTargets.length} network targets`)

  // ============================================
  // 5. SYSTEM SETTINGS (AMAN - UPSERT)
  // ============================================
  const settings = [
    // SLA Settings
    { key: 'sla_critical_hours', value: '2', label: 'SLA Critical (jam)', group: 'sla' },
    { key: 'sla_high_hours', value: '8', label: 'SLA High (jam)', group: 'sla' },
    { key: 'sla_medium_hours', value: '24', label: 'SLA Medium (jam)', group: 'sla' },
    { key: 'sla_low_hours', value: '72', label: 'SLA Low (jam)', group: 'sla' },
    
    // Alert Settings
    { key: 'repeat_failure_threshold', value: '3', label: 'Threshold Repeat Failure', group: 'alert' },
    { key: 'repeat_failure_days', value: '30', label: 'Window Repeat Failure (hari)', group: 'alert' },
    
    // Report Settings
    { key: 'it_head_name', value: 'Kepala IT', label: 'Nama Kepala IT', group: 'report' },
    { key: 'it_head_title', value: 'Kepala Divisi Teknologi Informasi', label: 'Jabatan Kepala IT', group: 'report' },
    
    // Identity RS
    { key: 'hospital_name', value: 'RSUD Contoh Manado', label: 'Nama Rumah Sakit', group: 'identity' },
    { key: 'hospital_address', value: 'Jl. Contoh No. 123, Manado', label: 'Alamat RS', group: 'identity' },
    { key: 'hospital_phone', value: '(0431) 1234567', label: 'Telepon RS', group: 'identity' },
    { key: 'hospital_email', value: 'info@rscontoh.id', label: 'Email RS', group: 'identity' },
    { key: 'hospital_website', value: 'www.rscontoh.id', label: 'Website RS', group: 'identity' },
    
    // Kop Surat
    { key: 'report_header_text', value: 'LAPORAN IT RUMAH SAKIT', label: 'Header Laporan', group: 'report' },
    { key: 'report_footer_text', value: 'Dokumen ini adalah laporan resmi IT', label: 'Footer Laporan', group: 'report' },
    
    // Branding
    { key: 'app_name', value: 'IT Hospital System', label: 'Nama Aplikasi', group: 'branding' },
    { key: 'app_short_name', value: 'ITHS', label: 'Nama Singkat', group: 'branding' },
    { key: 'primary_color', value: '#00E5FF', label: 'Warna Utama', group: 'branding' },
  ]

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {}, // TIDAK update data existing, hanya tambah yang belum ada
      create: setting,
    })
  }
  console.log(`✅ ${settings.length} system settings`)

  // ============================================
  // 6. SAMPLE KANBAN CARDS (OPTIONAL - AMAN)
  // ============================================
  const adminUser = await prisma.user.findFirst({ where: { role: Role.SUPERADMIN } })
  
  if (adminUser) {
    const existingCards = await prisma.kanbanCard.count()
    
    if (existingCards === 0) {
      const kanbanCards = [
        {
          title: 'Update firmware semua AP',
          description: 'Update firmware terbaru untuk semua Access Point',
          column: KanbanColumn.TODO,
          priority: Priority.MEDIUM,
          assignedToId: adminUser.id,
          labels: ['Jaringan', 'Maintenance'],
          position: 0,
        },
        {
          title: 'Cek backup database',
          description: 'Verifikasi backup database harian berjalan normal',
          column: KanbanColumn.DOING,
          priority: Priority.HIGH,
          assignedToId: adminUser.id,
          labels: ['Database', 'Backup'],
          position: 0,
        },
        {
          title: 'Install antivirus baru',
          description: 'Deploy antivirus ke semua PC di ruang rawat inap',
          column: KanbanColumn.TODO,
          priority: Priority.HIGH,
          assignedToId: adminUser.id,
          labels: ['Security', 'Software'],
          position: 1,
        },
        {
          title: 'Monitoring performa server',
          description: 'Cek resource usage server SIMRS',
          column: KanbanColumn.DOING,
          priority: Priority.MEDIUM,
          assignedToId: adminUser.id,
          labels: ['Server', 'Monitoring'],
          position: 1,
        },
        {
          title: 'Update dokumentasi inventaris',
          description: 'Update lokasi semua aset di ruang baru',
          column: KanbanColumn.DONE,
          priority: Priority.LOW,
          assignedToId: adminUser.id,
          labels: ['Dokumentasi', 'Inventaris'],
          position: 0,
        },
      ]

      for (const card of kanbanCards) {
        await prisma.kanbanCard.create({ data: card })
      }
      console.log(`✅ ${kanbanCards.length} sample kanban cards`)
    } else {
      console.log(`⏭️ Skipped kanban cards (${existingCards} already exist)`)
    }
  }

  console.log('🌱 Seeding completed!')
  console.log('===================================')
  console.log('📝 Login Credentials:')
  console.log(`   Email: superadmin@rumahsakit.id`)
  console.log(`   Password: admin123`)
  console.log('===================================')
  console.log('')
  console.log('💡 Settings yang tersedia:')
  console.log('   - Identitas RS bisa diubah di Admin → Settings')
  console.log('   - Kop surat laporan otomatis menggunakan data RS')
  console.log('===================================')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })