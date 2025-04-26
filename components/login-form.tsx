"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Lock, LogIn, Store, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react"

export function LoginForm() {
  // Estados para el formulario de administrador
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Estados para el formulario de vendedor
  const [vendorName, setVendorName] = useState("")
  const [vendorPassword, setVendorPassword] = useState("")
  const [showVendorPassword, setShowVendorPassword] = useState(false)

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

  // Función para crear una caja para el vendedor
  const crearCajaParaVendedor = (usuarioId: number, nombreVendedor: string): void => {
    try {
      console.log(`Creando caja para el vendedor ${usuarioId}...`)
      const tiendaId = "3" // Siempre usamos la tienda 3

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

  // Función para autenticar como administrador y obtener token
  const getAdminToken = async (): Promise<string | null> => {
    try {
      // Usar credenciales hardcodeadas para admin
      const adminUsername = "admin";
      const adminPassword = "clave_seminario";
      
      console.log("Autenticando como administrador para acceder a vendedores...");

      const response = await fetch("https://tienda-backend-p9ms.onrender.com/api/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword,
        }),
      });

      if (!response.ok) {
        console.error("Error al obtener token de administrador:", response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      
      if (data.access) {
        console.log("Token de administrador obtenido correctamente.");
        return data.access;
      }
      
      return null;
    } catch (error) {
      console.error("Error al autenticar como administrador:", error);
      return null;
    }
  }

  // Función para obtener vendedores usando token de admin
  const obtenerVendedores = async (token: string, tiendaId: string) => {
    try {
      const response = await fetch(`https://tienda-backend-p9ms.onrender.com/api/tiendas/${tiendaId}/empleados/`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error al obtener empleados: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener vendedores:", error);
      throw error;
    }
  }

  // Función actualizada para login de vendedor - con autenticación automática
  const handleVendorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validar que los campos no estén vacíos
    if (!vendorName.trim()) {
      setError("Por favor ingresa tu nombre");
      setIsLoading(false);
      return;
    }

    if (!vendorPassword.trim()) {
      setError("Por favor ingresa tu contraseña");
      setIsLoading(false);
      return;
    }

    try {
      // Primero obtener token de administrador
      const adminToken = await getAdminToken();
      
      if (!adminToken) {
        setError("No se pudo conectar con el servidor. Por favor, intenta más tarde.");
        return;
      }

      // Usar directamente el endpoint de la tienda 3
      const tiendaId = "3";
      console.log(`Verificando si ${vendorName} existe en tienda ${tiendaId}...`);

      // Usar el token para obtener la lista de vendedores
      const data = await obtenerVendedores(adminToken, tiendaId);

      // Buscar el vendedor en la respuesta
      let vendedorEncontrado = false;
      let vendedorData = null;

      if (data && data.empleados && Array.isArray(data.empleados)) {
        // Buscar por nombre (ignorando mayúsculas/minúsculas)
        vendedorData = data.empleados.find(
          (emp: any) => emp.nombre && emp.nombre.toLowerCase() === vendorName.toLowerCase(),
        );

        if (vendedorData) {
          vendedorEncontrado = true;
        }
      }

      if (vendedorEncontrado && vendedorData) {
        console.log("Vendedor encontrado:", vendedorData);

        // Guardar información en localStorage
        localStorage.setItem("userType", "vendor");
        localStorage.setItem("vendorName", vendedorData.nombre);
        localStorage.setItem("vendorId", vendedorData.id.toString());

        // Establecer la tienda asociada al vendedor (siempre tienda 3)
        localStorage.setItem("selectedStoreId", tiendaId);
        localStorage.setItem("selectedStoreName", "Tienda Principal"); // Nombre fijo para la tienda 3

        // Crear una caja para el vendedor
        crearCajaParaVendedor(vendedorData.id, vendedorData.nombre);

        // Redirigir a home
        router.push(`/home`);
      } else {
        console.log("Vendedor no encontrado");
        setError("No se encontró ningún vendedor con ese nombre");
      }
    } catch (error) {
      console.error("Error en login de vendedor:", error);
      setError("Error al verificar credenciales. Por favor, intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar el login de administrador
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
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Iniciando sesión...
                  </span>
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
            // Formulario de vendedor simplificado (nombre + contraseña dummy)
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

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5" />
                <Input
                  id="vendorPassword"
                  type={showVendorPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  className="pl-10 pr-10 bg-input-bg border-0 h-12 text-base"
                  value={vendorPassword}
                  onChange={(e) => setVendorPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                  onClick={() => setShowVendorPassword(!showVendorPassword)}
                >
                  {showVendorPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base bg-primary hover:bg-primary-dark text-white android-ripple"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verificando...
                  </span>
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