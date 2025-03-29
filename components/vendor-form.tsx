"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import type { Vendor } from "@/app/profile/page"

interface VendorFormProps {
  vendor?: Vendor
  onSubmit: (vendor: Vendor) => void
}

export function VendorForm({ vendor, onSubmit }: VendorFormProps) {
  const [formData, setFormData] = useState<Vendor>({
    id: vendor?.id || crypto.randomUUID(),
    name: vendor?.name || "",
    phone: vendor?.phone || "",
    email: vendor?.email || "",
    password: vendor?.password || "",
    photo: vendor?.photo || "",
  })

  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Limpiar error al cambiar el valor
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      name: "",
      phone: "",
      email: "",
      password: "",
    }

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio"
      isValid = false
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es obligatorio"
      isValid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = "El correo es obligatorio"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El correo no es válido"
      isValid = false
    }

    if (!formData.password.trim()) {
      newErrors.password = "La contraseña es obligatoria"
      isValid = false
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-base">
          Nombre
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Nombre completo"
          className="bg-input-bg border-0 h-12 text-base"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-base">
          Teléfono
        </Label>
        <Input
          id="phone"
          name="phone"
          placeholder="Número de teléfono"
          className="bg-input-bg border-0 h-12 text-base"
          type="tel"
          inputMode="tel"
          value={formData.phone}
          onChange={handleChange}
        />
        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-base">
          Correo
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          placeholder="Correo electrónico"
          className="bg-input-bg border-0 h-12 text-base"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      <div className="bg-input-bg rounded-lg p-4 flex flex-col items-center justify-center h-40">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2">
          <Plus className="h-6 w-6 text-primary" />
        </div>
        <p className="text-base text-text-secondary">Añadir foto</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-base">
          Contraseña temporal
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          className="bg-input-bg border-0 h-12 text-base"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
      </div>

      <Button type="submit" className="w-full h-14 text-base bg-primary hover:bg-primary-dark mt-6 android-ripple">
        {vendor ? "Actualizar" : "Guardar"}
      </Button>
    </form>
  )
}