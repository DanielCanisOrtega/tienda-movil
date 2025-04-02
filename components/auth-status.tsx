// Modificar el componente para ocultar la interfaz de autenticación al usuario final
// y solo mostrar información mínima o nada

"use client"

import { useEffect, useState } from "react"
import { loginToBackend } from "@/services/auth-service"

// Componente simplificado que maneja la autenticación automáticamente
// pero no muestra interfaz al usuario final
export function AuthStatus() {
  const [status, setStatus] = useState<"checking" | "authenticated" | "unauthenticated">("checking")
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("backendToken")
      if (token) {
        setStatus("authenticated")
      } else {
        setStatus("unauthenticated")
        // Intentar autenticar automáticamente
        handleLogin()
      }
    }

    checkAuth()
  }, [])

  const handleLogin = async () => {
    if (isLoggingIn) return

    setIsLoggingIn(true)
    try {
      await loginToBackend()
      setStatus("authenticated")
    } catch (err) {
      console.error("Error de autenticación automática:", err)
    } finally {
      setIsLoggingIn(false)
    }
  }

  // No renderizamos nada visible para el usuario final
  return null
}

