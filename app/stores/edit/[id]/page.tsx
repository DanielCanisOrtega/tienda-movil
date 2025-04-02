"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Store } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"

interface StoreData {
  id: string
  name: string
  address: string
  phone: string
  description: string
  image?: string
  createdAt: string
}

export default function EditStorePage() {
  const router = useRouter()
  const params = useParams()
  const storeId = params.id as string

  const [userType, setUserType] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [storeNotFound, setStoreNotFound] = useState(false)

  const [formData, setFormData] = useState<StoreData>({
    id: storeId,
    name: "",
    address: "",
    phone: "",
    description: "",
    createdAt: "",
  })

  const [errors, setErrors] = useState({
    name: "",
    address: "",
    phone: "",
  })

  // Verificar si el usuario es administrador y cargar datos de la tienda
  useEffect(() => {
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)

    if (storedUserType !== "admin") {
      // Redirigir a la página de inicio si no es administrador
      router.push("/")
      return
    }

    // Cargar datos de la tienda
    const storedStores = localStorage.getItem("stores")
    if (storedStores) {
      const stores: StoreData[] = JSON.parse(storedStores)
      const store = stores.find((s) => s.id === storeId)

      if (store) {
        setFormData(store)
      } else {
        setStoreNotFound(true)
      }
    } else {
      setStoreNotFound(true)
    }
  }, [router, storeId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Limpiar error
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
      address: "",
      phone: "",
    }

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio"
      isValid = false
    }

    if (!formData.address.trim()) {
      newErrors.address = "La dirección es obligatoria"
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

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Obtener tiendas existentes del localStorage
    const storedStores = localStorage.getItem("stores")
    if (storedStores) {
      const stores: StoreData[] = JSON.parse(storedStores)

      // Actualizar la tienda
      const updatedStores = stores.map((store) => (store.id === formData.id ? formData : store))

      // Guardar en localStorage
      localStorage.setItem("stores", JSON.stringify(updatedStores))

      // Simular tiempo de procesamiento
      setTimeout(() => {
        setIsSubmitting(false)
        alert("Tienda actualizada con éxito")
        router.push("/stores")
      }, 1000)
    }
  }

  if (userType !== "admin") {
    return null // No renderizar nada mientras se verifica o redirige
  }

  if (storeNotFound) {
    return (
      <main className="flex min-h-screen flex-col bg-background-light android-safe-top">
        <div className="bg-white p-4 flex items-center">
          <Link href="/stores" className="mr-4">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-semibold">Editar Tienda</h1>
        </div>

        <div className="container max-w-md mx-auto p-4 text-center">
          <div className="bg-white rounded-lg p-8">
            <p className="text-text-secondary mb-4">Tienda no encontrada</p>
            <Button onClick={() => router.push("/stores")} className="bg-primary hover:bg-primary-dark">
              Volver a tiendas
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top">
      <div className="bg-white p-4 flex items-center">
        <Link href="/stores" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Editar Tienda</h1>
      </div>

      <div className="container max-w-md mx-auto p-4">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">
              Nombre de la Tienda
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Tienda Principal"
              className="bg-input-bg border-0 h-12 text-base"
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-base">
              Dirección
            </Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Ej: Calle 123 #45-67"
              className="bg-input-bg border-0 h-12 text-base"
            />
            {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base">
              Teléfono
            </Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Ej: +57 3124567890"
              className="bg-input-bg border-0 h-12 text-base"
              type="tel"
            />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
          </div>

          <div className="bg-input-bg rounded-lg p-4 flex flex-col items-center justify-center h-40">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <p className="text-base text-text-secondary">Cambiar imagen</p>
            <p className="text-xs text-text-secondary mt-1">(Funcionalidad no disponible en esta versión)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-base">
              Descripción
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción de la tienda"
              className="bg-input-bg border-0 min-h-[100px] text-base"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-base bg-primary hover:bg-primary-dark mt-6 android-ripple"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Actualizar Tienda"}
          </Button>
        </form>
      </div>
    </main>
  )
}

