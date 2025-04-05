"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Lock, LogIn, Store, ArrowLeft } from "lucide-react"
import { fetchWithAuth, loginToBackend } from "@/services/auth-service"

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
        await loginToBackend()
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

  // Función para crear una caja para el vendedor
  const crearCajaParaVendedor = async (tiendaId: string, usuarioId: number): Promise<boolean> => {
    try {
      console.log(`Creando caja para el vendedor ${usuarioId} en la tienda ${tiendaId}...`)

      // Primero, verificar si hay cajas existentes para obtener el último saldo final
      const cajasResponse = await fetchWithAuth("https://tienda-backend-p9ms.onrender.com/api/cajas/")

      if (!cajasResponse.ok) {
        console.error(`Error al obtener cajas: ${cajasResponse.status}`)
        throw new Error(`Error al obtener cajas: ${cajasResponse.status}`)
      }

      const cajas = await cajasResponse.json()

      // Encontrar la última caja cerrada para usar su saldo final como saldo inicial
      let saldoInicial = "0"
      if (Array.isArray(cajas) && cajas.length > 0) {
        // Ordenar cajas por fecha de cierre (de más reciente a más antigua)
        const cajasCerradas = cajas
          .filter((caja: any) => caja.estado === "cerrada" && caja.saldo_final)
          .sort((a: any, b: any) => new Date(b.fecha_cierre).getTime() - new Date(a.fecha_cierre).getTime())

        if (cajasCerradas.length > 0) {
          saldoInicial = cajasCerradas[0].saldo_final
          console.log(`Usando saldo final de caja anterior: ${saldoInicial}`)
        }
      }

      // Crear la nueva caja
      const turnoActual = determinarTurnoActual()
      const cajaData = {
        usuario: usuarioId,
        turno: turnoActual,
        saldo_inicial: saldoInicial,
        saldo_final: saldoInicial, // Inicialmente igual al saldo inicial
        estado: "abierta",
        fecha_apertura: new Date().toISOString(),
      }

      console.log("Datos de la nueva caja:", cajaData)

      const response = await fetchWithAuth("https://tienda-backend-p9ms.onrender.com/api/cajas/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cajaData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error al crear caja: ${response.status} - ${response.statusText}`, errorText)
        throw new Error(`Error al crear caja: ${response.status} - ${response.statusText}`)
      }

      const nuevaCaja = await response.json()
      console.log("Caja creada exitosamente:", nuevaCaja)

      // Guardar el ID de la caja en localStorage para referencia futura
      localStorage.setItem("cajaActualId", nuevaCaja.id.toString())
      localStorage.setItem("cajaActualSaldoInicial", saldoInicial)

      return true
    } catch (err) {
      console.error("Error al crear caja para el vendedor:", err)
      return false
    }
  }

  const handleVendorLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!vendorName.trim()) {
      setError("Por favor ingresa tu nombre")
      setIsLoading(false)
      return
    }

    try {
      // Primero autenticarse con el backend
      const token = await loginToBackend()
      if (!token) {
        throw new Error("No se pudo autenticar con el backend")
      }

      // Buscar al vendedor en todas las tiendas
      const response = await fetchWithAuth("https://tienda-backend-p9ms.onrender.com/api/tiendas/")

      if (!response.ok) {
        throw new Error(`Error al obtener tiendas: ${response.status}`)
      }

      const tiendas = await response.json()
      let vendedorEncontrado = false
      let tiendaAsociada = null
      let usuarioId = null

      // Para cada tienda, verificar sus empleados
      for (const tienda of tiendas) {
        const empleadosResponse = await fetchWithAuth(
          `https://tienda-backend-p9ms.onrender.com/api/tiendas/${tienda.id}/empleados/`,
        )

        if (empleadosResponse.ok) {
          const data = await empleadosResponse.json()

          if (data && data.empleados) {
            // Buscar si el vendedor está en esta tienda
            const empleado = data.empleados.find((emp: any) => emp.nombre.toLowerCase() === vendorName.toLowerCase())

            if (empleado) {
              vendedorEncontrado = true
              tiendaAsociada = tienda
              usuarioId = empleado.id
              break
            }
          }
        }
      }

      if (vendedorEncontrado && tiendaAsociada && usuarioId) {
        // Guardar información en localStorage
        localStorage.setItem("userType", "vendor")
        localStorage.setItem("selectedStoreId", tiendaAsociada.id.toString())
        localStorage.setItem("selectedStoreName", tiendaAsociada.nombre)
        localStorage.setItem("vendorName", vendorName)
        localStorage.setItem("vendorId", usuarioId.toString())

        // Crear una caja para el vendedor
        await crearCajaParaVendedor(tiendaAsociada.id.toString(), usuarioId)

        // Redirigir a la página de inicio con la tienda seleccionada
        router.push(`/home?storeId=${tiendaAsociada.id}`)
      } else {
        setError("No se encontró ningún vendedor con ese nombre")
      }
    } catch (err) {
      console.error("Error al iniciar sesión como vendedor:", err)
      setError(`Error al iniciar sesión: ${err instanceof Error ? err.message : "Error desconocido"}`)
    } finally {
      setIsLoading(false)
    }
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

