"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { loginToBackend } from "@/services/auth-service"
import { Loader2 } from "lucide-react"

export function AuthStatus() {
  const [status, setStatus] = useState<"checking" | "authenticated" | "unauthenticated">("checking")
  const [error, setError] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("backendToken")
      if (token) {
        setStatus("authenticated")
      } else {
        setStatus("unauthenticated")
      }
    }

    checkAuth()
  }, [])

  const handleLogin = async () => {
    setError(null)
    setIsLoggingIn(true)

    try {
      const token = await loginToBackend()
      if (token) {
        setStatus("authenticated")
      } else {
        setError("No se pudo obtener el token de autenticación")
      }
    } catch (err) {
      setError(`Error de autenticación: ${err instanceof Error ? err.message : "Error desconocido"}`)
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (status === "checking") {
    return (
      <div className="flex items-center space-x-2 text-sm text-text-secondary">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Verificando autenticación...</span>
      </div>
    )
  }

  if (status === "authenticated") {
    return (
      <div className="flex flex-col">
        <div className="text-sm text-green-600 flex items-center">
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Autenticado con el backend
        </div>
        <div className="text-xs text-text-secondary mt-1">Token almacenado y listo para usar</div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="text-sm text-red-500 flex items-center">
        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        No autenticado con el backend
      </div>
      {error && (
        <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-200 whitespace-normal break-words">
          {error}
        </div>
      )}
      <Button
        size="sm"
        onClick={handleLogin}
        className="bg-primary hover:bg-primary-dark w-full"
        disabled={isLoggingIn}
      >
        {isLoggingIn ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Iniciando sesión...
          </>
        ) : (
          "Iniciar sesión en el backend"
        )}
      </Button>
    </div>
  )
}

