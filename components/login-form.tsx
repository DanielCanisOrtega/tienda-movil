"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Lock, LogIn } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function LoginForm() {
  // Valores predeterminados para facilitar el inicio de sesión en desarrollo
  const [username, setUsername] = useState("admin")
  const [password, setPassword] = useState("123456")
  const [userType, setUserType] = useState("admin") // Nuevo estado para el tipo de usuario
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
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
      // Validar credenciales según el tipo de usuario
      if (userType === "admin") {
        // Credenciales para administrador
        if (username === "admin" && password === "123456") {
          // Guardar el tipo de usuario en localStorage para mantener la sesión
          localStorage.setItem("userType", userType)
          router.push("/home")
        } else {
          setError("Credenciales de administrador incorrectas")
          setIsLoading(false)
        }
      } else if (userType === "vendor") {
        // Credenciales para vendedor
        if (username === "vendedor" && password === "123456") {
          // Guardar el tipo de usuario en localStorage para mantener la sesión
          localStorage.setItem("userType", userType)
          router.push("/home")
        } else {
          setError("Credenciales de vendedor incorrectas")
          setIsLoading(false)
        }
      } else {
        setError("Tipo de usuario no válido")
        setIsLoading(false)
      }
    }, 1000)
  }

  return (
    <form onSubmit={handleLogin} className="w-full max-w-md">
      {/* Nuevo diseño con tarjeta flotante */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
        <div className="bg-primary p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Bienvenido</h1>
          <p className="text-sm text-white/80 mt-1">Inicia sesión para continuar</p>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

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

            {/* Selector de tipo de usuario */}
            <div className="bg-input-bg rounded-lg p-4">
              <Label className="text-sm font-medium mb-3 block">Tipo de usuario</Label>
              <RadioGroup value={userType} onValueChange={setUserType} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin" className="cursor-pointer">
                    Administrador
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vendor" id="vendor" />
                  <Label htmlFor="vendor" className="cursor-pointer">
                    Vendedor
                  </Label>
                </div>
              </RadioGroup>
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
                Entrar
              </span>
            )}
          </Button>

          <div className="flex justify-between items-center">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="px-3 text-xs text-gray-500">o</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setUsername("admin")
              setPassword("123456")
              setUserType("admin")
            }}
            className="w-full text-sm h-10 border-primary/30 text-primary hover:bg-primary/5"
          >
            Usar credenciales de administrador
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setUsername("vendedor")
              setPassword("123456")
              setUserType("vendor")
            }}
            className="w-full text-sm h-10 border-primary/30 text-primary hover:bg-primary/5"
          >
            Usar credenciales de vendedor
          </Button>
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
    </form>
  )
}