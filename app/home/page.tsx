"use client"

import type React from "react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import {
  ShoppingBag,
  Package,
  Users,
  BarChart2,
  ShoppingCart,
  DollarSign,
  ArrowLeft,
  LogOut,
  CreditCard,
  Mic,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

// Declaraciones de tipos para SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  readonly length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  readonly length: number
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition
    }
    webkitSpeechRecognition: {
      new (): SpeechRecognition
    }
  }
}

export default function HomePage() {
  const router = useRouter()
  const [userType, setUserType] = useState<string | null>(null)
  const [selectedStore, setSelectedStore] = useState<{ id: string; name: string } | null>(null)
  const [vendorName, setVendorName] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const storeId = searchParams.get("storeId")
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    // Obtener el tipo de usuario del localStorage
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)

    // Obtener el nombre del vendedor si existe
    const storedVendorName = localStorage.getItem("vendorName")
    if (storedVendorName) {
      setVendorName(storedVendorName)
    }

    // Obtener la tienda seleccionada
    const selectedStoreId = storeId || localStorage.getItem("selectedStoreId")
    const selectedStoreName = localStorage.getItem("selectedStoreName")

    if (selectedStoreId && selectedStoreName) {
      setSelectedStore({
        id: selectedStoreId,
        name: selectedStoreName,
      })
    }
  }, [storeId])

  const handleLogout = () => {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      setIsLoggingOut(true)

      // Limpiar tokens y datos de sesión
      localStorage.removeItem("backendToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("tokenExpiresAt")
      localStorage.removeItem("userType")
      localStorage.removeItem("selectedStoreId")
      localStorage.removeItem("selectedStoreName")
      localStorage.removeItem("vendorName")
      localStorage.removeItem("vendorId")
      localStorage.removeItem("cajaActualId")
      localStorage.removeItem("cajaActualSaldoInicial")

      // Redirigir a la página de inicio de sesión
      router.push("/")
    }
  }

  // Función para manejar el reconocimiento de voz
  const handleVoiceCommand = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "No soportado",
        description: "Tu navegador no soporta reconocimiento de voz",
        variant: "destructive",
      })
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = "es-ES"
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
      toast({
        title: "Escuchando...",
        description: "Di un comando como 'ir a ventas' o 'agregar producto'",
      })
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.toLowerCase()
      processVoiceCommand(transcript)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Error de reconocimiento:", event.error)
      setIsListening(false)
      toast({
        title: "Error",
        description: `Error en el reconocimiento: ${event.error}`,
        variant: "destructive",
      })
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  // Función para procesar el comando de voz
  const processVoiceCommand = (text: string) => {
    console.log("Comando recibido:", text)

    // Normalizar el texto: eliminar acentos, convertir a minúsculas
    const normalizedText = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

    // Comandos de navegación
    if (
      normalizedText.includes("ir a ventas") ||
      normalizedText.includes("ver ventas") ||
      normalizedText.includes("mostrar ventas") ||
      normalizedText.includes("entrar a ventas") ||
      normalizedText.includes("entrar a historial") ||
      normalizedText.includes("ver historial") ||
      normalizedText.includes("historial")
    ) {
      router.push("/sales")
      toast({ title: "Navegando a ventas" })
      return
    }

    if (
      normalizedText.includes("ir a productos") ||
      normalizedText.includes("ver productos") ||
      normalizedText.includes("mostrar productos") ||
      normalizedText.includes("entrar a productos") ||
      normalizedText.includes("entrar a inventario") ||
      normalizedText.includes("ver inventario") ||
      normalizedText.includes("inventario")
    ) {
      if (selectedStore) {
        router.push(`/stores/${selectedStore.id}/products`)
      } else {
        router.push("/products")
      }
      toast({ title: "Navegando a productos" })
      return
    }

    if (
      normalizedText.includes("ir a carrito") ||
      normalizedText.includes("ver carrito") ||
      normalizedText.includes("entrar a carrito") ||
      normalizedText.includes("nueva venta") ||
      normalizedText.includes("registrar venta") ||
      normalizedText.includes("vender")
    ) {
      router.push("/cart")
      toast({ title: "Navegando a carrito" })
      return
    }

    if (
      normalizedText.includes("ir a gastos") ||
      normalizedText.includes("ver gastos") ||
      normalizedText.includes("mostrar gastos") ||
      normalizedText.includes("entrar a gastos")
    ) {
      router.push("/expenses")
      toast({ title: "Navegando a gastos" })
      return
    }

    if (
      normalizedText.includes("ir a empleados") ||
      normalizedText.includes("ver empleados") ||
      normalizedText.includes("mostrar empleados") ||
      normalizedText.includes("entrar a empleados") ||
      normalizedText.includes("ir a vendedores") ||
      normalizedText.includes("ver vendedores") ||
      normalizedText.includes("mostrar vendedores") ||
      normalizedText.includes("entrar a vendedores") ||
      normalizedText.includes("vendedores")
    ) {
      if (selectedStore) {
        router.push(`/stores/${selectedStore.id}/employees`)
        toast({ title: "Navegando a empleados" })
      } else {
        toast({
          title: "Error",
          description: "No hay tienda seleccionada",
          variant: "destructive",
        })
      }
      return
    }

    if (
      normalizedText.includes("ir a cajas") ||
      normalizedText.includes("ver cajas") ||
      normalizedText.includes("mostrar cajas") ||
      normalizedText.includes("entrar a cajas")
    ) {
      if (selectedStore) {
        router.push(`/stores/${selectedStore.id}/cajas`)
        toast({ title: "Navegando a cajas" })
      } else {
        toast({
          title: "Error",
          description: "No hay tienda seleccionada",
          variant: "destructive",
        })
      }
      return
    }

    if (
      normalizedText.includes("ir a reportes") ||
      normalizedText.includes("ver reportes") ||
      normalizedText.includes("mostrar reportes") ||
      normalizedText.includes("entrar a reportes") ||
      normalizedText.includes("ir a estadisticas") ||
      normalizedText.includes("ver estadisticas") ||
      normalizedText.includes("mostrar estadisticas") ||
      normalizedText.includes("entrar a estadisticas") ||
      normalizedText.includes("dashboard")
    ) {
      router.push("/dashboard")
      toast({ title: "Navegando a reportes" })
      return
    }

    // Comandos para agregar elementos
    if (
      normalizedText.includes("agregar producto") ||
      normalizedText.includes("nuevo producto") ||
      normalizedText.includes("añadir producto")
    ) {
      router.push("/add-product")
      toast({ title: "Navegando a agregar producto" })
      return
    }

    if (
      normalizedText.includes("agregar empleado") ||
      normalizedText.includes("nuevo empleado") ||
      normalizedText.includes("añadir empleado") ||
      normalizedText.includes("agregar vendedor") ||
      normalizedText.includes("nuevo vendedor") ||
      normalizedText.includes("añadir vendedor")
    ) {
      if (selectedStore) {
        router.push(`/stores/${selectedStore.id}/employees?action=add`)
        toast({ title: "Navegando a agregar empleado" })
      } else {
        toast({
          title: "Error",
          description: "No hay tienda seleccionada",
          variant: "destructive",
        })
      }
      return
    }

    if (
      normalizedText.includes("agregar gasto") ||
      normalizedText.includes("nuevo gasto") ||
      normalizedText.includes("añadir gasto")
    ) {
      router.push("/add-expense")
      toast({ title: "Navegando a agregar gasto" })
      return
    }

    if (
      normalizedText.includes("agregar caja") ||
      normalizedText.includes("nueva caja") ||
      normalizedText.includes("añadir caja")
    ) {
      if (selectedStore) {
        router.push(`/stores/${selectedStore.id}/cajas/add`)
        toast({ title: "Navegando a agregar caja" })
      } else {
        toast({
          title: "Error",
          description: "No hay tienda seleccionada",
          variant: "destructive",
        })
      }
      return
    }

    // Si no se reconoce ningún comando
    toast({
      title: "Comando no reconocido",
      description: "Intenta con comandos como 'ir a ventas' o 'agregar producto'",
      variant: "destructive",
    })
  }

  // Si no hay tienda seleccionada y el usuario es administrador, redirigir a la página de tiendas
  if (!selectedStore && userType === "admin") {
    return (
      <main className="flex min-h-screen flex-col bg-background android-safe-top">
        <div className="gradient-primary text-white p-5">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-semibold">Tienda mixta doña jose</h1>
            <ThemeToggle />
          </div>
          <p className="text-sm opacity-80 mt-1">¡Bienvenido, Administrador!</p>
        </div>

        <div className="container max-w-md mx-auto p-4 text-center">
          <div className="bg-card rounded-lg p-8">
            <p className="text-muted-foreground mb-4">No has seleccionado ninguna tienda</p>
            <Link href="/stores">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Ir a gestión de tiendas
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-background android-safe-top has-bottom-nav">
      <div className="gradient-primary text-white p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {userType === "admin" && selectedStore && (
              <Link href="/stores" className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            )}
            {selectedStore && <span className="text-sm font-medium">Tienda: {selectedStore.name}</span>}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              <span className="text-xs">Salir</span>
            </Button>
          </div>
        </div>
        <h1 className="text-2xl font-semibold tienda-title">Tienda mixta doña jose</h1>
        <p className="text-sm opacity-80 mt-1">
          ¡Bienvenido
          {vendorName
            ? `, ${vendorName}`
            : userType === "admin"
              ? ", Administrador"
              : userType === "vendor"
                ? ", Vendedor"
                : ""}
          !
        </p>
      </div>

      <div className="container max-w-md mx-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          <MenuCard
            icon={<ShoppingCart className="h-8 w-8 text-primary" />}
            title="Nueva Venta"
            description="Registrar venta"
            href="/cart"
          />

          <MenuCard
            icon={<ShoppingBag className="h-8 w-8 text-primary" />}
            title="Historial"
            description="Ver ventas"
            href="/sales"
          />

          <MenuCard
            icon={<Package className="h-8 w-8 text-primary" />}
            title="Inventario"
            description="Ver productos"
            href={selectedStore ? `/stores/${selectedStore.id}/products` : "/products"}
          />

          {userType === "vendor" ? (
            <MenuCard
              icon={<DollarSign className="h-8 w-8 text-primary" />}
              title="Mi Caja"
              description="Gestionar caja"
              href="/vendor/caja"
            />
          ) : (
            <MenuCard
              icon={<DollarSign className="h-8 w-8 text-primary" />}
              title="Gastos"
              description="Gestionar gastos"
              href="/expenses"
            />
          )}

          {/* Solo mostrar Vendedores, Cajas y Reportes si es administrador */}
          {userType === "admin" && (
            <>
              <MenuCard
                icon={<Users className="h-8 w-8 text-primary" />}
                title="Vendedores"
                description="Gestionar equipo"
                href={selectedStore ? `/stores/${selectedStore.id}/employees` : "/vendors"}
              />

              <MenuCard
                icon={<CreditCard className="h-8 w-8 text-primary" />}
                title="Cajas"
                description="Gestionar cajas"
                href={selectedStore ? `/stores/${selectedStore.id}/cajas` : "/vendors"}
              />

              <MenuCard
                icon={<BarChart2 className="h-8 w-8 text-primary" />}
                title="Reportes"
                description="Ver estadísticas"
                href="/dashboard"
              />
            </>
          )}
        </div>
      </div>

      {/* Botón de voz en la parte inferior - VISIBLE */}
      <div className="fixed bottom-20 right-4 z-10">
        <Button
          className={`rounded-full w-14 h-14 bg-primary hover:bg-primary/90 text-white shadow-lg ${
            isListening ? "animate-pulse" : ""
          }`}
          onClick={handleVoiceCommand}
          disabled={isListening}
        >
          <Mic className="h-6 w-6" />
        </Button>
      </div>

      {/* Solo mostrar navegación en la página de inicio */}
      <BottomNavigation />
    </main>
  )
}

function MenuCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
}) {
  return (
    <Link href={href}>
      <div className="bg-card rounded-lg p-4 h-full flex flex-col android-ripple hover:opacity-90 transition-all duration-200 border border-border">
        <div className="mb-3">{icon}</div>
        <h2 className="font-medium text-lg text-card-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </Link>
  )
}
