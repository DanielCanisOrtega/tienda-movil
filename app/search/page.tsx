"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SearchPage() {
  const router = useRouter()

  // Redirigir directamente a la página de productos
  useEffect(() => {
    router.replace("/products")
  }, [router])

  // Página de carga mientras se redirige
  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light">
      <p className="text-text-secondary">Redirigiendo...</p>
    </div>
  )
}

