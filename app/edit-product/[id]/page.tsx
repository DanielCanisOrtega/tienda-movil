"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ImageIcon } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { obtenerProductoPorId, actualizarProducto, type Producto } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [productNotFound, setProductNotFound] = useState(false)
  const [categories] = useState<string[]>([
    "Frutas",
    "Verduras",
    "Lácteos",
    "Carnes",
    "Abarrotes",
    "Bebidas",
    "Limpieza",
    "Otros",
  ])

  const [formData, setFormData] = useState<Producto>({
    id: Number.parseInt(productId),
    nombre: "",
    precio: 0,
    categoria: "",
    cantidad: 1,
    codigo_barras: "",
  })

  const [errors, setErrors] = useState({
    nombre: "",
    precio: "",
    categoria: "",
  })

  // Cargar datos del producto
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true)
      try {
        const product = await obtenerProductoPorId(Number.parseInt(productId))

        if (product) {
          setFormData(product)
        } else {
          setProductNotFound(true)
        }
      } catch (error) {
        console.error("Error al cargar producto:", error)
        setProductNotFound(true)
        toast({
          title: "Error",
          description: "No se pudo cargar el producto",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [productId, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "precio" || name === "cantidad" ? Number.parseFloat(value) || 0 : value,
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
      categoria: value,
    }))

    if (errors.categoria) {
      setErrors((prev) => ({
        ...prev,
        categoria: "",
      }))
    }
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      nombre: "",
      precio: "",
      categoria: "",
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
      isValid = false
    }

    if (formData.precio <= 0) {
      newErrors.precio = "El precio debe ser mayor a 0"
      isValid = false
    }

    if (!formData.categoria) {
      newErrors.categoria = "Seleccione una categoría"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Actualizar el producto en el backend
      const productoActualizado = await actualizarProducto(Number.parseInt(productId), formData)

      if (productoActualizado) {
        toast({
          title: "Producto actualizado",
          description: "El producto ha sido actualizado correctamente",
        })

        // Redirigir a la lista de productos
        router.push("/products")
      } else {
        throw new Error("No se pudo actualizar el producto")
      }
    } catch (error) {
      console.error("Error al actualizar producto:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col bg-background-light android-safe-top">
        <div className="bg-white p-4 flex items-center">
          <Link href="/products" className="mr-4">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-semibold">Editar producto</h1>
        </div>

        <div className="container max-w-md mx-auto p-4 text-center">
          <div className="bg-white rounded-lg p-8">
            <p className="text-text-secondary">Cargando producto...</p>
          </div>
        </div>
      </main>
    )
  }

  if (productNotFound) {
    return (
      <main className="flex min-h-screen flex-col bg-background-light android-safe-top">
        <div className="bg-white p-4 flex items-center">
          <Link href="/products" className="mr-4">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-semibold">Editar producto</h1>
        </div>

        <div className="container max-w-md mx-auto p-4 text-center">
          <div className="bg-white rounded-lg p-8">
            <p className="text-text-secondary mb-4">Producto no encontrado</p>
            <Button onClick={() => router.push("/products")} className="bg-primary hover:bg-primary-dark">
              Volver al inventario
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top">
      <div className="bg-white p-4 flex items-center">
        <Link href="/products" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Editar producto</h1>
      </div>

      <div className="container max-w-md mx-auto p-4">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-base">
              Nombre
            </Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre del producto"
              className="bg-input-bg border-0 h-12 text-base"
            />
            {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="precio" className="text-base">
              Precio
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base">$</span>
              <Input
                id="precio"
                name="precio"
                value={formData.precio || ""}
                onChange={handleChange}
                placeholder="0.00"
                className="bg-input-bg border-0 pl-8 h-12 text-base"
                type="number"
                inputMode="decimal"
                min="0"
              />
            </div>
            {errors.precio && <p className="text-sm text-red-500">{errors.precio}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cantidad" className="text-base">
              Cantidad en inventario
            </Label>
            <Input
              id="cantidad"
              name="cantidad"
              value={formData.cantidad || ""}
              onChange={handleChange}
              placeholder="1"
              className="bg-input-bg border-0 h-12 text-base"
              type="number"
              inputMode="numeric"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria" className="text-base">
              Categoría
            </Label>
            <Select value={formData.categoria} onValueChange={handleCategoryChange}>
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
            {errors.categoria && <p className="text-sm text-red-500">{errors.categoria}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigo_barras" className="text-base">
              Código de barras
            </Label>
            <Input
              id="codigo_barras"
              name="codigo_barras"
              value={formData.codigo_barras}
              onChange={handleChange}
              placeholder="Código de barras"
              className="bg-input-bg border-0 h-12 text-base"
            />
          </div>

          <div className="bg-input-bg rounded-lg p-4 flex flex-col items-center justify-center h-40">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2">
              <ImageIcon className="h-6 w-6 text-primary" />
            </div>
            <p className="text-base text-text-secondary">Cambiar foto</p>
            <p className="text-xs text-text-secondary mt-1">(Funcionalidad no disponible en esta versión)</p>
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-base bg-primary hover:bg-primary-dark mt-6 android-ripple"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Actualizar Producto"}
          </Button>
        </form>
      </div>
    </main>
  )
}

