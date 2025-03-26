"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Mail, Phone, Lock, ArrowLeft } from "lucide-react"

export function RegisterForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    // Simulamos el registro
    setTimeout(() => {
      // En un caso real, aquí enviarías los datos al backend
      console.log("Datos de registro:", formData)
      // Redirigir al usuario a la página de inicio de sesión
      router.push("/")
    }, 1500)
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-white">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
        <div className="w-6"></div> {/* Espaciador para centrar el título */}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl overflow-hidden shadow-lg">
        <div className="p-6 space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5" />
            <Input
              id="fullName"
              name="fullName"
              placeholder="Nombre completo"
              className="pl-10 bg-input-bg border-0 h-12 text-base"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Correo electrónico"
              className="pl-10 bg-input-bg border-0 h-12 text-base"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Teléfono"
              className="pl-10 bg-input-bg border-0 h-12 text-base"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Contraseña"
              className="pl-10 bg-input-bg border-0 h-12 text-base"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirmar contraseña"
              className="pl-10 bg-input-bg border-0 h-12 text-base"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base bg-primary hover:bg-primary-dark text-white android-ripple mt-2"
            disabled={isLoading}
          >
            {isLoading ? "Registrando..." : "Registrarse"}
          </Button>
        </div>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-white">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/" className="font-medium underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

