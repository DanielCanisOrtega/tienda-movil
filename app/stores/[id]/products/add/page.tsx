"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ImageIcon, Barcode } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { type Producto, createProducto } from "@/services/product-service"
import BarcodeScanner from "@/components/barcode-scanner"

export default function AddProductPage() {
  const router = useRouter()
  const params = useParams()
  const storeId = params.id as string
  const { toast } = useToast()

  const [userType, setUserType] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [storeName, setStoreName] = useState<string>("")
  const [showScanner, setShowScanner] = useState(false)

  const [formData, setFormData] = useState<Producto>({
    nombre: "",
    descripcion: "",
    precio: 0,
    cantidad: 0,
    categoria: "",
    disponible: true,
    tienda_id: Number(storeId),
    codigo_barras: null,
  })

  const [errors, setErrors] = useState({
    nombre: "",
    precio: "",
    cantidad: "",
    categoria: "",
  })

  const categories = ["Frutas", "Verduras", "Lácteos", "Carnes", "Abarrotes", "Bebidas", "Limpieza", "Otros"]

  useEffect(() => {
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)

    if (!storedUserType) {
      router.push("/")
      return
    }

    const selectedStoreName = localStorage.getItem("selectedStoreName")
    if (selectedStoreName) {
      setStoreName(selectedStoreName)
    }

    setFormData((prev) => ({
      ...prev,
      tienda_id: Number(storeId),
    }))

    console.log(`Página de añadir producto inicializada para tienda_id=${storeId}`)
  }, [router, storeId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "precio" || name === "cantidad") {
      const numValue = value === "" ? 0 : Number.parseFloat(value)
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "codigo_barras" && value === "" ? null : value,
      }))
    }

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      disponible: checked,
    }))
  }

  const handleBarcodeDetected = (code: string) => {
    setFormData((prev) => ({
      ...prev,
      codigo_barras: code,
    }))
    setShowScanner(false)
    toast({
      title: "Código detectado",
      description: `Se ha añadido el código: ${code}`,
    })
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      nombre: "",
      precio: "",
      cantidad: "",
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

    if (formData.cantidad < 0) {
      newErrors.cantidad = "La cantidad no puede ser negativa"
      isValid = false
    }

    if (!formData.categoria) {
      newErrors.categoria = "Seleccione una categoría"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const goBack = () => {
    router.push(`/stores/${storeId}/productos`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const productoData = {
        ...formData,
        tienda_id: Number(storeId),
      }

      console.log("Enviando producto:", productoData)

      try {
        const createdProduct = await createProducto(productoData)
        console.log("Producto creado con éxito en la API:", createdProduct)

        toast({
          title: "Producto creado",
          description: "El producto ha sido creado con éxito",
          variant: "success",
        })
      } catch (apiError) {
        console.error("Error al crear producto en la API, usando localStorage como fallback:", apiError)

        const existingProducts = localStorage.getItem(`store_${storeId}_products`)
        const products = existingProducts ? JSON.parse(existingProducts) : []

        const newId = products.length > 0 ? Math.max(...products.map((p: any) => p.id)) + 1 : 1

        const newProduct = {
          ...productoData,
          id: newId,
        }

        products.push(newProduct)

        localStorage.setItem(`store_${storeId}_products`, JSON.stringify(products))

        toast({
          title: "Producto guardado localmente",
          description: "El producto ha sido guardado en el almacenamiento local",
          variant: "success",
        })
      }

      setTimeout(() => {
        router.push(`/stores/${storeId}/productos`)
      }, 500)
    } catch (err) {
      console.error("Error al crear el producto:", err)
      toast({
        title: "Error",
        description: `No se pudo crear el producto: ${err instanceof Error ? err.message : "Error desconocido"}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top">
      <div className="bg-white p-4 flex items-center">
        <Button variant="ghost" className="mr-4 p-2" onClick={goBack} aria-label="Volver">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold">Añadir Producto a {storeName}</h1>
      </div>

      <div className="container max-w-md mx-auto p-4">
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-base">Nombre del Producto *</Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Manzana Roja"
              className="bg-input-bg border-0 h-12 text-base"
              required
            />
            {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
          </div>

          {/* Precio */}
          <div className="space-y-2">
            <Label htmlFor="precio" className="text-base">Precio *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base">$</span>
              <Input
                id="precio"
                name="precio"
                value={formData.precio === 0 ? "" : formData.precio}
                onChange={handleChange}
                placeholder="0.00"
                className="bg-input-bg border-0 pl-8 h-12 text-base"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                required
              />
            </div>
            {errors.precio && <p className="text-sm text-red-500">{errors.precio}</p>}
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <Label htmlFor="cantidad" className="text-base">Cantidad en inventario *</Label>
            <Input
              id="cantidad"
              name="cantidad"
              value={formData.cantidad === 0 ? "" : formData.cantidad}
              onChange={handleChange}
              placeholder="0"
              className="bg-input-bg border-0 h-12 text-base"
              type="number"
              inputMode="numeric"
              min="0"
              required
            />
            {errors.cantidad && <p className="text-sm text-red-500">{errors.cantidad}</p>}
          </div>

          {/* Código de barras */}
          <div className="space-y-2">
            <Label htmlFor="codigo_barras" className="text-base">Código de Barras (opcional)</Label>
            <div className="flex">
              <Input
                id="codigo_barras"
                name="codigo_barras"
                value={formData.codigo_barras || ""}
                onChange={handleChange}
                placeholder="Ej: 7501234567890"
                className="bg-input-bg border-0 h-12 text-base flex-1 mr-2"
              />
              <Button type="button" variant="outline" className="h-12 px-3" onClick={() => setShowScanner(true)}>
                <Barcode className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="categoria" className="text-base">Categoría *</Label>
            <Select
              value={formData.categoria}
              onValueChange={(value) => handleSelectChange("categoria", value)}
              required
            >
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

          {/* Imagen */}
          <div className="bg-input-bg rounded-lg p-4 flex flex-col items-center justify-center h-40">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2">
              <ImageIcon className="h-6 w-6 text-primary" />
            </div>
            <p className="text-base text-text-secondary">Añadir imagen</p>
            <p className="text-xs text-text-secondary mt-1">(Funcionalidad no disponible en esta versión)</p>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-base">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion || ""}
              onChange={handleChange}
              placeholder="Descripción del producto"
              className="bg-input-bg border-0 min-h-[100px] text-base"
            />
          </div>

          {/* Disponible */}
          <div className="flex items-center space-x-2">
            <Switch id="disponible" checked={formData.disponible} onCheckedChange={handleSwitchChange} />
            <Label htmlFor="disponible">Producto disponible</Label>
          </div>

          <div className="text-sm text-gray-500 mt-2">* Campos obligatorios</div>

          <Button
            type="submit"
            className="w-full h-14 text-base bg-primary hover:bg-primary-dark mt-6 android-ripple"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Guardar Producto"}
          </Button>
        </form>
      </div>

      {showScanner && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}
    </main>
  )
}
