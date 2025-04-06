"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Lock, LogIn, Store, ArrowLeft, Eye, EyeOff } from "lucide-react"

export function LoginForm() {
  // Estados para el formulario de administrador
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Estado para el formulario de vendedor
  const [vendorName, setVendorName] = useState("")

  // Estados generales
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [loginMode, setLoginMode] = useState<"select" | "admin" | "vendor">("select")

  const router = useRouter()

  // Función para determinar el turno actual (mañana o noche)
  const determinarTurnoActual = (): string => {
    const horaActual = new Date().getHours()
    // Si es entre 6am y 6pm, es turno de mañana, de lo contrario es turno de noche
    return horaActual >= 6 && horaActual < 18 ? "mañana" : "noche"
  }

  // Función mejorada para crear una caja para el vendedor
  const crearCajaParaVendedor = (tiendaId: string, usuarioId: number, nombreVendedor: string): void => {
    try {
      console.log(`Creando caja para el vendedor ${usuarioId} en la tienda ${tiendaId}...`)

      // Asegurarse de que tiendaId y usuarioId estén guardados en localStorage
      localStorage.setItem("selectedStoreId", tiendaId)
      localStorage.setItem("vendorId", usuarioId.toString())
      localStorage.setItem("vendorName", nombreVendedor)

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

      // Verificar si ya existe una caja abierta para este vendedor
      const cajaExistente = cajas.find((caja: any) => caja.usuario === usuarioId && caja.estado === "abierta")

      if (cajaExistente) {
        console.log("El vendedor ya tiene una caja abierta:", cajaExistente)
        // Guardar el ID de la caja actual en localStorage
        localStorage.setItem("cajaActualId", cajaExistente.id.toString())
        localStorage.setItem("cajaActualSaldoInicial", cajaExistente.saldo_inicial)
        return
      }

      // Usar un saldo inicial fijo para simplificar
      const saldoInicial = "100000"

      // Determine current shift (morning or night)
      const turnoActual = determinarTurnoActual()

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

    try {
      // Usar el nombre proporcionado o generar uno aleatorio para simulación
      const selectedStoreId = "1" // Valor predeterminado
      const vendorId = Math.floor(Math.random() * 1000) + 100

      // Guardar información en localStorage
      localStorage.setItem("userType", "vendor")
      localStorage.setItem("vendorName", vendorName)
      localStorage.setItem("vendorId", vendorId.toString())
      localStorage.setItem("selectedStoreId", selectedStoreId)
      localStorage.setItem("selectedStoreName", "Tienda Principal")

      // Crear una caja para el vendedor
      crearCajaParaVendedor(selectedStoreId, vendorId, vendorName)

      // Redirigir a la página de inicio
      router.push(`/home`)
    } catch (error) {
      console.error("Error al iniciar sesión como vendedor:", error)
      setError("Error al iniciar sesión. Por favor, intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  // Actualizar la función handleAdminLogin para usar el nuevo endpoint
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validar que los campos no estén vacíos
    if (!username.trim() || !password.trim()) {
      setError("Por favor ingresa un usuario y contraseña")
      setIsLoading(false)
      return
    }

    try {
      console.log("Intentando iniciar sesión con:", { username })

      // Usar el nuevo endpoint de token
      const response = await fetch("https://tienda-backend-p9ms.onrender.com/api/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      console.log("Respuesta del servidor:", response.status, response.statusText)

      // Obtener el texto de la respuesta para depuración
      const responseText = await response.text()
      console.log("Respuesta completa:", responseText)

      // Intentar parsear como JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Error al parsear respuesta JSON:", e)
        throw new Error("Formato de respuesta inválido del servidor")
      }

      if (!response.ok) {
        // Manejar errores de la API
        console.error("Error de inicio de sesión:", data)

        if (data.detail) {
          setError(data.detail)
        } else if (data.non_field_errors) {
          setError(Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors)
        } else {
          setError("Credenciales incorrectas. Por favor, verifica tu usuario y contraseña.")
        }

        throw new Error("Error de autenticación")
      }

      // Login exitoso, guardar tokens
      if (data.access && data.refresh) {
        localStorage.setItem("backendToken", data.access)
        localStorage.setItem("refreshToken", data.refresh)
        localStorage.setItem("userType", "admin")

        // Establecer expiración del token (asumiendo 1 hora)
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 1)
        localStorage.setItem("tokenExpiresAt", expiresAt.toISOString())

        console.log("Tokens guardados correctamente:", {
          access: data.access.substring(0, 10) + "...",
          refresh: data.refresh.substring(0, 10) + "...",
        })

        // Redirigir a la página de tiendas
        router.push("/stores")
      } else {
        console.error("No se recibieron los tokens esperados:", data)
        throw new Error("No se recibieron los tokens de acceso y refresco")
      }
    } catch (error) {
      console.error("Error de inicio de sesión:", error)
      if (!error) {
        setError("Error al iniciar sesión. Por favor, intenta nuevamente.")
      }
    } finally {
      setIsLoading(false)
    }
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
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    className="pl-10 pr-10 bg-input-bg border-0 h-12 text-base"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
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

export default LoginForm

