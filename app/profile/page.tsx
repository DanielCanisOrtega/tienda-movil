"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, LogOut, Edit } from "lucide-react"
import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileEditForm } from "@/components/profile-edit-form"

export interface Vendor {
  id: string
  name: string
  phone: string
  email: string
  password: string
  photo?: string
}

export interface UserProfile {
  name: string
  email: string
  phone: string
  role: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [userType, setUserType] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    role: "",
  })

  useEffect(() => {
    // Obtener el tipo de usuario del localStorage
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)

    // Cargar perfil de usuario según el tipo
    if (storedUserType === "admin") {
      setUserProfile({
        name: "Administrador Principal",
        email: "admin@tiendamixta.com",
        phone: "+57 3124567890",
        role: "admin",
      })
    } else if (storedUserType === "vendor") {
      setUserProfile({
        name: "Vendedor",
        email: "vendedor@tiendamixta.com",
        phone: "+57 3209876543",
        role: "vendor",
      })
    }
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

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile)
    setIsEditing(false)
    // En un caso real, aquí enviarías los datos al backend
    console.log("Perfil actualizado:", updatedProfile)
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
          <h1 className="text-xl font-medium">{userProfile.name}</h1>
          <p className="text-sm opacity-80 mt-1">{userProfile.role === "admin" ? "Administrador" : "Vendedor"}</p>
        </div>
      </div>

      <div className="container max-w-md mx-auto p-4 space-y-4">
        {isEditing ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Editar Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileEditForm
                profile={userProfile}
                onSubmit={handleUpdateProfile}
                onCancel={() => setIsEditing(false)}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Información Personal</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Editar</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Nombre</h3>
                  <p>{userProfile.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Correo</h3>
                  <p>{userProfile.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Teléfono</h3>
                  <p>{userProfile.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {userType === "admin" && (
          <div className="space-y-4">
            <Link href="/vendors">
              <Button className="w-full h-12 text-base bg-primary hover:bg-primary-dark android-ripple">
                Gestionar Vendedores
              </Button>
            </Link>
          </div>
        )}

        <Link href="/cart">
          <Button className="w-full h-12 text-base bg-primary hover:bg-primary-dark android-ripple">
            Registrar Venta
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuración de Cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full h-12 text-base bg-white text-danger border border-danger hover:bg-danger/10 android-ripple flex items-center justify-center"
            >
              <LogOut className="mr-2 h-5 w-5" />
              {isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </main>
  )
}

