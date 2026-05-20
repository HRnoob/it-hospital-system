import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'IT Hospital System',
  description: 'IT Reporting & Management System for Hospital',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}