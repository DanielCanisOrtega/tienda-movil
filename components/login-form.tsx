"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Lock, LogIn, Store, ArrowLeft } from "lucide-react"

export function LoginForm() {
  // Estados para el formulario de administrador
  const [username, setUsername] = useState("admin")
  const [password, setPassword] = useState("123456")

  // Estado para el formulario de vendedor
  const [vendorName, setVendorName] = useState("")

  // Estados generales
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [loginMode, setLoginMode] = useState<"select" | "admin" | "vendor">("select")

  const router = useRouter()

  // Inicializar la autenticación al cargar el componente
  useEffect(() => {
    const initAuth = async () => {
      try {
        // await loginToBackend() // Removed this line
      } catch (err) {
        console.error("Error al inicializar autenticación:", err)
      }
    }

    initAuth()
  }, [])

  // Función para determinar el turno actual (mañana o noche)
  const determinarTurnoActual = (): string => {
    const horaActual = new Date().getHours()
    // Si es entre 6am y 6pm, es turno de mañana, de lo contrario es turno de noche
    return horaActual >= 6 && horaActual < 18 ? "mañana" : "noche"
  }

  // Add function to automatically create a cash register when a vendor logs in
  const crearCajaParaVendedor = (tiendaId: string, usuarioId: number, nombreVendedor: string): void => {
    try {
      console.log(`Creando caja para el vendedor ${usuarioId} en la tienda ${tiendaId}...`)

      // Get existing cash registers
      const storedCajas = localStorage.getItem(`store_${tiendaId}_cajas`)
      let cajas = []
      let nextId = 1

      if (storedCajas) {
        cajas = JSON.parse(storedCajas)
        // Find the highest ID to assign a new one
        if (cajas.length > 0) {
          nextId = Math.max(...cajas.map((caja: any) => caja.id)) + 1
        }
      }

      // Find the last closed cash register to use its final balance as initial balance
      let saldoInicial = "100000" // Default value
      if (cajas.length > 0) {
        // Sort cash registers by closing date (from most recent to oldest)
        const cajasCerradas = cajas
          .filter((caja: any) => caja.estado === "cerrada" && caja.saldo_final)
          .sort((a: any, b: any) => new Date(b.fecha_cierre).getTime() - new Date(a.fecha_cierre).getTime())

        if (cajasCerradas.length > 0) {
          saldoInicial = cajasCerradas[0].saldo_final
          console.log(`Usando saldo final de caja anterior: ${saldoInicial}`)
        }
      }

      // Determine current shift (morning or night)
      const horaActual = new Date().getHours()
      const turnoActual = horaActual >= 6 && horaActual < 18 ? "mañana" : "noche"

      // Create the new cash register
      const nuevaCaja = {
        id: nextId,
        usuario: usuarioId,
        usuario_nombre: nombreVendedor,
        turno: turnoActual,
        saldo_inicial: saldoInicial,
        saldo_final: saldoInicial, // Initially equal to initial balance
        estado: "abierta",
        fecha_apertura: new Date().toISOString(),
        fecha_cierre: null,
      }

      console.log("Datos de la nueva caja:", nuevaCaja)

      // Add the new cash register to the list
      cajas.push(nuevaCaja)

      // Save to localStorage
      localStorage.setItem(`store_${tiendaId}_cajas`, JSON.stringify(cajas))

      // Save the cash register ID in localStorage for future reference
      localStorage.setItem("cajaActualId", nextId.toString())
      localStorage.setItem("cajaActualSaldoInicial", saldoInicial)

      console.log("Caja creada exitosamente")
    } catch (err) {
      console.error("Error al crear caja para el vendedor:", err)
    }
  }

  // Update the handleVendorLogin function to create a cash register
  const handleVendorLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!vendorName.trim()) {
      setError("Por favor ingresa tu nombre")
      setIsLoading(false)
      return
    }

    // Look for the vendor in the stores
    const selectedStoreId = localStorage.getItem("selectedStoreId") || "1"
    const storedEmployees = localStorage.getItem(`store_${selectedStoreId}_employees`)

    if (storedEmployees) {
      const employees = JSON.parse(storedEmployees)
      const employee = employees.find((emp: any) => emp.activo && emp.nombre.toLowerCase() === vendorName.toLowerCase())

      if (employee) {
        // Save information in localStorage
        localStorage.setItem("userType", "vendor")
        localStorage.setItem("vendorName", employee.nombre)
        localStorage.setItem("vendorId", employee.id.toString())

        // Create a cash register for the vendor
        crearCajaParaVendedor(selectedStoreId, employee.id, employee.nombre)

        // Redirect to home page
        router.push(`/home`)
      } else {
        setError("No se encontró ningún vendedor con ese nombre en esta tienda")
        setIsLoading(false)
      }
    } else {
      // If there are no registered employees, allow access with sample data
      const vendorId = Math.floor(Math.random() * 1000) + 100

      // Save information in localStorage
      localStorage.setItem("userType", "vendor")
      localStorage.setItem("vendorName", vendorName)
      localStorage.setItem("vendorId", vendorId.toString())

      // Create a cash register for the vendor
      crearCajaParaVendedor(selectedStoreId, vendorId, vendorName)

      // Redirect to home page
      router.push(`/home`)
    }

    setIsLoading(false)
  }

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validar que los campos no estén vacíos
    if (!username.trim() || !password.trim()) {
      setError("Por favor ingresa un usuario y contraseña")
      setIsLoading(false)
      return
    }

    // Simulamos una verificación de credenciales
    setTimeout(() => {
      // Credenciales para administrador
      if (username === "admin" && password === "123456") {
        // Guardar el tipo de usuario en localStorage para mantener la sesión
        localStorage.setItem("userType", "admin")
        router.push("/stores") // Redirigir a la página de gestión de tiendas
      } else {
        setError("Credenciales de administrador incorrectas")
        setIsLoading(false)
      }
    }, 1000)
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
        <div className="bg-primary p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Bienvenido</h1>
          <p className="text-sm text-white/80 mt-1">
            {loginMode === "select"
              ? "Selecciona tu tipo de usuario"
              : loginMode === "admin"
                ? "Inicia sesión como administrador"
                : "Inicia sesión como vendedor"}
          </p>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {loginMode === "select" ? (
            // Pantalla de selección de tipo de usuario
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-center mb-4">¿Cómo deseas iniciar sesión?</h2>

              <Button
                onClick={() => setLoginMode("admin")}
                className="w-full h-16 text-base bg-primary hover:bg-primary-dark text-white android-ripple"
              >
                <User className="mr-3 h-6 w-6" />
                Soy Administrador
              </Button>

              <Button
                onClick={() => setLoginMode("vendor")}
                className="w-full h-16 text-base bg-primary/90 hover:bg-primary-dark text-white android-ripple"
              >
                <Store className="mr-3 h-6 w-6" />
                Soy Vendedor
              </Button>
            </div>
          ) : loginMode === "admin" ? (
            // Formulario de administrador
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="flex items-center mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode("select")
                    setError("")
                  }}
                  className="flex items-center text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span>Volver</span>
                </button>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5" />
                  <Input
                    id="username"
                    placeholder="Usuario"
                    className="pl-10 bg-input-bg border-0 h-12 text-base"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Contraseña"
                    className="pl-10 bg-input-bg border-0 h-12 text-base"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base bg-primary hover:bg-primary-dark text-white android-ripple"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Iniciando sesión..."
                ) : (
                  <span className="flex items-center justify-center">
                    <LogIn className="mr-2 h-5 w-5" />
                    Entrar como Administrador
                  </span>
                )}
              </Button>

              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode("vendor")
                    setError("")
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Iniciar como vendedor
                </button>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setUsername("admin")
                  setPassword("123456")
                }}
                className="w-full text-sm h-10 border-primary/30 text-primary hover:bg-primary/5"
              >
                Usar credenciales de prueba
              </Button>
            </form>
          ) : (
            // Formulario de vendedor
            <form onSubmit={handleVendorLogin} className="space-y-4">
              <div className="flex items-center mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode("select")
                    setError("")
                  }}
                  className="flex items-center text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span>Volver</span>
                </button>
              </div>

              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5" />
                <Input
                  id="vendorName"
                  placeholder="Tu nombre"
                  className="pl-10 bg-input-bg border-0 h-12 text-base"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base bg-primary hover:bg-primary-dark text-white android-ripple"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Buscando tu tienda..."
                ) : (
                  <span className="flex items-center justify-center">
                    <Store className="mr-2 h-5 w-5" />
                    Entrar a mi tienda
                  </span>
                )}
              </Button>

              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode("admin")
                    setError("")
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Iniciar como administrador
                </button>
              </div>

              <div className="text-sm text-center text-gray-500 mt-2">
                Ingresa tu nombre exactamente como está registrado en el sistema
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-white">
          ¿No tienes una cuenta?{" "}
          <Link href="/register" className="font-medium underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}

