import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helvetica/v14/Helvetica.ttf' },
  ],
})

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottom: '2 solid #000',
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  hospitalAddress: {
    fontSize: 10,
    color: '#333',
    marginBottom: 2,
  },
  contact: {
    fontSize: 10,
    color: '#333',
  },
  reportTitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 12,
    textDecoration: 'underline',
  },
  period: {
    textAlign: 'center',
    fontSize: 10,
    marginBottom: 15,
    color: '#333',
  },
  summarySection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 4,
  },
  summaryItem: {
    textAlign: 'center',
  },
  summaryNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 9,
    color: '#555',
  },
  tableTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  table: {
    marginTop: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  tableRowEven: {
    backgroundColor: '#f9f9f9',
  },
  colTicket: { width: '13%', fontSize: 8 },
  colTitle: { width: '37%', fontSize: 8 },
  colPriority: { width: '12%', fontSize: 8 },
  colStatus: { width: '13%', fontSize: 8 },
  colDate: { width: '13%', fontSize: 8 },
  colAssigned: { width: '12%', fontSize: 8 },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    paddingTop: 8,
    borderTop: '1 solid #ccc',
    color: '#666',
  },
})

interface PDFTemplateProps {
  type: string
  data: any
  settings: any
  startDate: string
  endDate: string
}

export default function PDFTemplate({ type, data, settings, startDate, endDate }: PDFTemplateProps) {
  const hospitalName = settings?.identity?.find((s: any) => s.key === 'hospital_name')?.value || 'IT Hospital System'
  const hospitalAddress = settings?.identity?.find((s: any) => s.key === 'hospital_address')?.value || ''
  const hospitalPhone = settings?.identity?.find((s: any) => s.key === 'hospital_phone')?.value || ''
  const hospitalEmail = settings?.identity?.find((s: any) => s.key === 'hospital_email')?.value || ''
  const reportHeader = settings?.report?.find((s: any) => s.key === 'report_header_text')?.value || 'LAPORAN IT RUMAH SAKIT'
  const reportFooter = settings?.report?.find((s: any) => s.key === 'report_footer_text')?.value || 'Dokumen ini adalah laporan resmi IT'

  const getTypeName = () => {
    switch (type) {
      case 'daily_summary': return 'Laporan Harian'
      case 'monthly_summary': return 'Laporan Bulanan'
      case 'asset_report': return 'Laporan Inventaris'
      case 'issue_report': return 'Laporan Kerusakan'
      default: return 'Laporan'
    }
  }

  const getPriorityBadge = (priority: string) => {
    const styles = {
      CRITICAL: {
        backgroundColor: '#fee2e2',
        borderColor: '#dc2626',
        color: '#b91c1c',
        label: 'CRITICAL'
      },
      HIGH: {
        backgroundColor: '#ffedd5',
        borderColor: '#f97316',
        color: '#c2410c',
        label: 'HIGH'
      },
      MEDIUM: {
        backgroundColor: '#fef9c3',
        borderColor: '#eab308',
        color: '#854d0e',
        label: 'MEDIUM'
      },
      LOW: {
        backgroundColor: '#e0f2fe',
        borderColor: '#0ea5e9',
        color: '#0369a1',
        label: 'LOW'
      }
    }
    return styles[priority as keyof typeof styles] || styles.MEDIUM
  }

  const getTotalIssues = () => {
    if (type === 'daily_summary' || type === 'issue_report') {
      return data.issues?.length || 0
    }
    return 0
  }

  const getResolvedIssues = () => {
    if (type === 'daily_summary' || type === 'issue_report') {
      return data.issues?.filter((i: any) => i.status === 'RESOLVED' || i.status === 'CLOSED').length || 0
    }
    return 0
  }

  const getCriticalIssues = () => {
    if (type === 'daily_summary' || type === 'issue_report') {
      return data.issues?.filter((i: any) => i.priority === 'CRITICAL').length || 0
    }
    return 0
  }

  const renderContent = () => {
    switch (type) {
      case 'daily_summary':
      case 'issue_report':
        const total = getTotalIssues()
        const resolved = getResolvedIssues()
        const critical = getCriticalIssues()
        const unresolved = total - resolved

        return (
          <>
            {/* Summary Cards */}
            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{total}</Text>
                  <Text style={styles.summaryLabel}>Total Tiket</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{resolved}</Text>
                  <Text style={styles.summaryLabel}>Selesai</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{unresolved}</Text>
                  <Text style={styles.summaryLabel}>Belum Selesai</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{critical}</Text>
                  <Text style={styles.summaryLabel}>Critical</Text>
                </View>
              </View>
            </View>

            {/* Table */}
            <View>
              <Text style={styles.tableTitle}>Daftar Tiket ({total} tiket)</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={styles.colTicket}>Tiket</Text>
                  <Text style={styles.colTitle}>Judul</Text>
                  <Text style={styles.colPriority}>Prioritas</Text>
                  <Text style={styles.colStatus}>Status</Text>
                  <Text style={styles.colDate}>Tanggal</Text>
                  <Text style={styles.colAssigned}>Teknisi</Text>
                </View>
                {data.issues?.map((issue: any, idx: number) => {
                  const badge = getPriorityBadge(issue.priority)
                  return (
                    <View key={idx} style={[styles.tableRow, idx % 2 === 0 ? styles.tableRowEven : {}]}>
                      <Text style={styles.colTicket}>{issue.ticketNumber}</Text>
                      <Text style={styles.colTitle}>{issue.title}</Text>
                      <View style={{
                        ...styles.colPriority,
                        backgroundColor: badge.backgroundColor,
                        borderWidth: 1,
                        borderColor: badge.borderColor,
                        paddingVertical: 2,
                        paddingHorizontal: 4,
                        borderRadius: 4,
                        textAlign: 'center',
                      }}>
                        <Text style={{ fontSize: 8, fontWeight: 'bold', color: badge.color }}>
                          {badge.label}
                        </Text>
                      </View>
                      <Text style={styles.colStatus}>{issue.status}</Text>
                      <Text style={styles.colDate}>
                        {new Date(issue.createdAt).toLocaleDateString('id-ID')}
                      </Text>
                      <Text style={styles.colAssigned}>{issue.assignedTo?.name || '-'}</Text>
                    </View>
                  )
                })}
              </View>
            </View>
          </>
        )

      case 'asset_report':
        return (
          <View>
            <Text style={styles.tableTitle}>Daftar Aset ({data.totalAssets || 0} item)</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ width: '12%', fontSize: 8 }}>Kode</Text>
                <Text style={{ width: '28%', fontSize: 8 }}>Nama Aset</Text>
                <Text style={{ width: '15%', fontSize: 8 }}>Kategori</Text>
                <Text style={{ width: '20%', fontSize: 8 }}>Lokasi</Text>
                <Text style={{ width: '12%', fontSize: 8 }}>Status</Text>
                <Text style={{ width: '13%', fontSize: 8 }}>Kondisi</Text>
              </View>
              {data.assets?.slice(0, 30).map((asset: any, idx: number) => (
                <View key={idx} style={[styles.tableRow, idx % 2 === 0 ? styles.tableRowEven : {}]}>
                  <Text style={{ width: '12%', fontSize: 8 }}>{asset.assetCode}</Text>
                  <Text style={{ width: '28%', fontSize: 8 }}>{asset.name}</Text>
                  <Text style={{ width: '15%', fontSize: 8 }}>{asset.category?.name}</Text>
                  <Text style={{ width: '20%', fontSize: 8 }}>{asset.location?.name || '-'}</Text>
                  <Text style={{ width: '12%', fontSize: 8 }}>{asset.status}</Text>
                  <Text style={{ width: '13%', fontSize: 8 }}>{asset.condition}</Text>
                </View>
              ))}
            </View>
            {data.assets?.length > 30 && (
              <Text style={{ fontSize: 8, color: '#666', marginTop: 4 }}>
                * Menampilkan 30 dari {data.totalAssets} aset
              </Text>
            )}
          </View>
        )

      case 'monthly_summary':
        return (
          <View>
            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{data.totalAssets || 0}</Text>
                  <Text style={styles.summaryLabel}>Total Aset</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{data.openIssues || 0}</Text>
                  <Text style={styles.summaryLabel}>Issues Open</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{data.resolvedIssues || 0}</Text>
                  <Text style={styles.summaryLabel}>Issues Resolved</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{data.totalMorningChecks || 0}</Text>
                  <Text style={styles.summaryLabel}>Morning Check</Text>
                </View>
              </View>
            </View>

            {data.issuesByPriority && data.issuesByPriority.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.tableTitle}>Issues by Priority</Text>
                <View style={styles.tableHeader}>
                  <Text style={{ width: '50%', fontSize: 8 }}>Prioritas</Text>
                  <Text style={{ width: '50%', fontSize: 8 }}>Jumlah</Text>
                </View>
                {data.issuesByPriority.map((item: any, idx: number) => (
                  <View key={idx} style={[styles.tableRow, idx % 2 === 0 ? styles.tableRowEven : {}]}>
                    <Text style={{ width: '50%', fontSize: 8 }}>{item.priority}</Text>
                    <Text style={{ width: '50%', fontSize: 8 }}>{item._count} tiket</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )

      default:
        return <Text>Jenis laporan tidak tersedia</Text>
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header / Kop Surat */}
        <View style={styles.header}>
          <Text style={styles.hospitalName}>{hospitalName}</Text>
          <Text style={styles.hospitalAddress}>{hospitalAddress}</Text>
          <Text style={styles.contact}>Telp: {hospitalPhone} | Email: {hospitalEmail}</Text>
        </View>

        {/* Judul Laporan */}
        <Text style={styles.reportTitle}>{reportHeader}</Text>

        {/* Periode */}
        <Text style={styles.period}>
          Jenis Laporan: {getTypeName()}
          {'\n'}Periode: {new Date(startDate).toLocaleDateString('id-ID')} - {new Date(endDate).toLocaleDateString('id-ID')}
          {'\n'}Dicetak: {new Date().toLocaleString('id-ID')}
        </Text>

        {/* Content */}
        {renderContent()}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{reportFooter}</Text>
        </View>
      </Page>
    </Document>
  )
}