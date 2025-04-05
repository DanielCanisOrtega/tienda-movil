"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ImageIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Definir la interfaz para el producto
interface Product {
  id: number
  name: string
  price: number
  description: string
  category: string
  image: string
  stock: number
}

export default function AddProductPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<string[]>([
    "Frutas",
    "Verduras",
    "Lácteos",
    "Carnes",
    "Abarrotes",
    "Bebidas",
    "Limpieza",
    "Otros",
  ])

  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: "",
    price: 0,
    description: "",
    category: "",
    image: "/placeholder.svg?height=200&width=200",
    stock: 1,
  })

  const [errors, setErrors] = useState({
    name: "",
    price: "",
    category: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number.parseFloat(value) || 0 : value,
    }))

    // Limpiar error
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }))

    if (errors.category) {
      setErrors((prev) => ({
        ...prev,
        category: "",
      }))
    }
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      name: "",
      price: "",
      category: "",
    }

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio"
      isValid = false
    }

    if (formData.price <= 0) {
      newErrors.price = "El precio debe ser mayor a 0"
      isValid = false
    }

    if (!formData.category) {
      newErrors.category = "Seleccione una categoría"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // Modificar la función handleSubmit para mejorar la adición de productos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Obtener productos existentes del localStorage
      const existingProducts = localStorage.getItem("products")
      const products: Product[] = existingProducts ? JSON.parse(existingProducts) : []

      // Generar un nuevo ID (el más alto + 1)
      const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1

      // Crear el nuevo producto
      const newProduct: Product = {
        id: newId,
        ...formData,
      }

      // Agregar el nuevo producto a la lista
      products.push(newProduct)

      // Guardar en localStorage
      localStorage.setItem("products", JSON.stringify(products))

      // Simular tiempo de procesamiento
      setTimeout(() => {
        setIsSubmitting(false)
        alert("Producto agregado con éxito")
        router.push("/products")
      }, 1000)
    } catch (error) {
      console.error("Error al agregar producto:", error)
      alert("Ocurrió un error al agregar el producto. Por favor intente nuevamente.")
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top">
      <div className="bg-white p-4 flex items-center">
        <Link href="/products" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Añadir un producto</h1>
      </div>

      <div className="container max-w-md mx-auto p-4">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">
              Nombre
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nombre del producto"
              className="bg-input-bg border-0 h-12 text-base"
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="text-base">
              Precio
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base">$</span>
              <Input
                id="price"
                name="price"
                value={formData.price || ""}
                onChange={handleChange}
                placeholder="0.00"
                className="bg-input-bg border-0 pl-8 h-12 text-base"
                type="number"
                inputMode="decimal"
                min="0"
              />
            </div>
            {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock" className="text-base">
              Cantidad en inventario
            </Label>
            <Input
              id="stock"
              name="stock"
              value={formData.stock || ""}
              onChange={handleChange}
              placeholder="1"
              className="bg-input-bg border-0 h-12 text-base"
              type="number"
              inputMode="numeric"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-base">
              Categoría
            </Label>
            <Select value={formData.category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="bg-input-bg border-0 h-12 text-base">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>

          <div className="bg-input-bg rounded-lg p-4 flex flex-col items-center justify-center h-40">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2">
              <ImageIcon className="h-6 w-6 text-primary" />
            </div>
            <p className="text-base text-text-secondary">Añadir foto</p>
            <p className="text-xs text-text-secondary mt-1">(Funcionalidad no disponible en esta versión)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-base">
              Descripción
            </Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción del producto"
              className="bg-input-bg border-0 h-12 text-base"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-base bg-primary hover:bg-primary-dark mt-6 android-ripple"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Guardar Producto"}
          </Button>
        </form>
      </div>
    </main>
  )
}

