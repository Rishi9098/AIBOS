import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AIBOS - AI Board Examination Operating System',
  description: 'Next-Generation Government & Enterprise Examination Infrastructure Powered by AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  )
}
