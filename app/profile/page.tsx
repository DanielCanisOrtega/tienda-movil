"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, LogOut } from "lucide-react"
import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export interface Vendor {
  id: string
  name: string
  phone: string
  email: string
  password: string
  photo?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [userType, setUserType] = useState<string | null>(null)
  const [userPhone, setUserPhone] = useState("+57 3124567890")

  useEffect(() => {
    // Obtener el tipo de usuario del localStorage
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)
  }, [])

  const handleLogout = () => {
    setIsLoggingOut(true)

    // Simulamos el proceso de cierre de sesión
    setTimeout(() => {
      // En un caso real, aquí limpiarías tokens, cookies, etc.
      localStorage.removeItem("userType")
      router.push("/")
    }, 1000)
  }

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top has-bottom-nav">
      <div className="bg-primary text-white p-4 pt-8 relative">
        <Link href="/home" className="absolute top-8 left-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div className="flex flex-col items-center justify-center pt-6">
          <div className="w-20 h-20 rounded-full bg-white/20 mb-3 overflow-hidden">
            <img src="/placeholder.svg?height=80&width=80" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-medium">{userType === "admin" ? "Administrador" : "Vendedor"}</h1>
          <p className="text-sm opacity-80 mt-1">{userType === "admin" ? "Panel de gestión" : "Panel de vendedor"}</p>
        </div>
      </div>

      <div className="container max-w-md mx-auto p-4">
        <div className="bg-white rounded-lg p-5 mb-4">
          <h2 className="font-medium mb-2">Teléfono</h2>
          <p className="text-base text-text-secondary">{userPhone}</p>
        </div>

        {userType === "admin" && (
          <div className="space-y-4 mb-4">
            <Link href="/vendors">
              <Button className="w-full h-12 text-base bg-primary hover:bg-primary-dark android-ripple">
                Gestionar Vendedores
              </Button>
            </Link>
          </div>
        )}

        <div className="bg-white rounded-lg p-5 mb-4">
          <h2 className="font-medium mb-4">Configuración de Cuenta</h2>
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

      <BottomNavigation />
    </main>
  )
}