"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { VendorNavigation } from "@/components/vendor-navigation"

export default function VendorProfilePage() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [vendorName, setVendorName] = useState<string | null>(null)
  const [storeName, setStoreName] = useState<string | null>(null)

  useEffect(() => {
    // Obtener el nombre del vendedor si existe
    const storedVendorName = localStorage.getItem("vendorName")
    if (storedVendorName) {
      setVendorName(storedVendorName)
    }

    // Obtener el nombre de la tienda
    const selectedStoreName = localStorage.getItem("selectedStoreName")
    if (selectedStoreName) {
      setStoreName(selectedStoreName)
    }
  }, [])

  const handleLogout = () => {
    setIsLoggingOut(true)

    // Simulamos el proceso de cierre de sesión
    setTimeout(() => {
      // En un caso real, aquí limpiarías tokens, cookies, etc.
      localStorage.removeItem("userType")
      localStorage.removeItem("selectedStoreId")
      localStorage.removeItem("selectedStoreName")
      localStorage.removeItem("vendorName")
      router.push("/")
    }, 1000)
  }

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top has-bottom-nav">
      <div className="bg-primary text-white p-4 pt-8">
        <div className="flex flex-col items-center justify-center pt-6">
          <div className="w-20 h-20 rounded-full bg-white/20 mb-3 overflow-hidden">
            <img src="/placeholder.svg?height=80&width=80" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-medium">{vendorName || "Vendedor"}</h1>
          <p className="text-sm opacity-80 mt-1">{storeName ? `Tienda: ${storeName}` : "Vendedor"}</p>
        </div>
      </div>

      <div className="container max-w-md mx-auto p-4">
        <div className="bg-white rounded-lg p-5 mb-4">
          <h2 className="font-medium mb-2">Teléfono</h2>
          <p className="text-base text-text-secondary">+57 3124567890</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full h-12 text-base bg-white text-danger border border-danger hover:bg-danger/10 android-ripple flex items-center justify-center"
          >
            <LogOut className="mr-2 h-5 w-5" />
            {isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
          </Button>
        </div>
      </div>

      <VendorNavigation />
    </main>
  )
}

