import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "Tienda Mixta Doña Jose",
  description: "Sistema de gestión para Tienda Mixta Doña Jose",
=======
  title: 'TiendaMixta',
  description: 'Created by WithBaz',
  generator: 'Sebastian',
>>>>>>> 3870742a9a7e94a94118d2e6cf41f9a770310339
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

