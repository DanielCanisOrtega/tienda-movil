"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { UserProfile } from "@/app/profile/page"

interface ProfileEditFormProps {
  profile: UserProfile
  onSubmit: (profile: UserProfile) => void
  onCancel: () => void
}

export function ProfileEditForm({ profile, onSubmit, onCancel }: ProfileEditFormProps) {
  const [formData, setFormData] = useState<UserProfile>({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    role: profile.role,
  })

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
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
      email: "",
      phone: "",
    }

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio"
      isValid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = "El correo es obligatorio"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El correo no es válido"
      isValid = false
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es obligatorio"
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
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} className="bg-input-bg border-0" />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className="bg-input-bg border-0"
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="bg-input-bg border-0"
        />
        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
      </div>

      <div className="flex space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 bg-primary hover:bg-primary-dark">
          Guardar
        </Button>
      </div>
    </form>
  )
}

