"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { VendorNavigation } from "@/components/vendor-navigation"
import { LogOut, Plus, ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function VendorPage() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = () => {
    setIsLoggingOut(true)

    // Simulamos el proceso de cierre de sesión
    setTimeout(() => {
      // En un caso real, aquí limpiarías tokens, cookies, etc.
      router.push("/")
    }, 1000)
  }

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top has-bottom-nav">
      <div className="bg-white p-4 flex items-center">
        <Link href="/" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Panel de Vendedor</h1>
      </div>

      <div className="container max-w-md mx-auto p-4">
        <div className="space-y-5">
          <div className="bg-white rounded-lg p-5">
            <h2 className="font-medium text-lg mb-4">Inventario</h2>
            <div className="space-y-3">
              <Link href="/add-product">
                <Button className="w-full h-12 text-base bg-primary hover:bg-primary-dark android-ripple">
                  Añadir Producto
                </Button>
              </Link>
              <Link href="/search">
                <Button className="w-full h-12 text-base bg-white text-primary border border-primary hover:bg-primary/10 android-ripple">
                  Ver Inventario
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5">
            <h2 className="font-medium text-lg mb-4">Ventas</h2>
            <div className="space-y-3">
              <Link href="/sales">
                <Button className="w-full h-12 text-base bg-primary hover:bg-primary-dark android-ripple">
                  Registrar Venta
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5">
            <h2 className="font-medium text-lg mb-4">Mi Cuenta</h2>
            <div className="space-y-3">
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
        </div>
      </div>

      <Link href="/add-product" className="fab">
        <Plus size={24} />
      </Link>

      <VendorNavigation />
    </main>
  )
}
