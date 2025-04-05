import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TiendaMixta',
  description: 'Created by WithBaz',
  generator: 'Sebastian',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
