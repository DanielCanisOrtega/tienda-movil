"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ImageIcon, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { fetchWithAuth } from "@/services/auth-service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ProductFormData {
  id?: number
  nombre: string
  descripcion: string
  precio: number
  cantidad: number
  categoria: string
  disponible: boolean
  tienda: number
  codigo_barras?: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const storeId = params.id as string
  const productId = params.productId as string

  const [userType, setUserType] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [storeName, setStoreName] = useState<string>("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [formData, setFormData] = useState<ProductFormData>({
    nombre: "",
    descripcion: "",
    precio: 0,
    cantidad: 0,
    categoria: "",
    disponible: true,
    tienda: Number.parseInt(storeId),
  })

  const [errors, setErrors] = useState({
    nombre: "",
    precio: "",
    cantidad: "",
    categoria: "",
  })

  // Categorías predefinidas
  const categories = ["Frutas", "Verduras", "Lácteos", "Carnes", "Abarrotes", "Bebidas", "Limpieza", "Otros"]

  // Función para seleccionar la tienda
  const selectStore = async () => {
    try {
      console.log(`Seleccionando tienda con ID: ${storeId}`)
      const response = await fetchWithAuth(
        `https://tienda-backend-p9ms.onrender.com/api/tiendas/${storeId}/seleccionar_tienda/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error al seleccionar tienda: ${response.status} - ${response.statusText}`, errorText)
        throw new Error(`Error al seleccionar tienda: ${response.status} - ${response.statusText}`)
      }

      console.log("Tienda seleccionada correctamente")
      return true
    } catch (err) {
      console.error("Error al seleccionar tienda:", err)
      alert(
        `No se pudo seleccionar la tienda: ${err instanceof Error ? err.message : "Error desconocido"}. Por favor, intenta de nuevo más tarde.`,
      )
      return false
    }
  }

  // Obtener datos del producto
  const fetchProduct = async () => {
    try {
      // Primero seleccionar la tienda
      const storeSelected = await selectStore()
      if (!storeSelected) {
        return
      }

      const response = await fetchWithAuth(`https://tienda-backend-p9ms.onrender.com/api/productos/${productId}/`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()

      // Verificar que el producto pertenezca a la tienda seleccionada
      if (data.tienda !== Number.parseInt(storeId)) {
        alert("Este producto no pertenece a la tienda seleccionada")
        router.push(`/stores/${storeId}/products`)
        return
      }

      setFormData({
        id: data.id,
        nombre: data.nombre || "",
        descripcion: data.descripcion || "",
        precio: data.precio || 0,
        cantidad: data.cantidad || 0,
        categoria: data.categoria || "",
        disponible: data.disponible !== undefined ? data.disponible : true,
        tienda: data.tienda || Number.parseInt(storeId),
        codigo_barras: data.codigo_barras || "",
      })
    } catch (error) {
      console.error("Error al cargar el producto:", error)
      alert("No se pudo cargar la información del producto. Por favor, intenta de nuevo más tarde.")
      router.push(`/stores/${storeId}/products`)
    }
  }

  // Verificar si el usuario está autorizado y cargar datos
  useEffect(() => {
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)

    if (!storedUserType) {
      router.push("/")
      return
    }

    // Obtener el nombre de la tienda seleccionada
    const selectedStoreName = localStorage.getItem("selectedStoreName")
    if (selectedStoreName) {
      setStoreName(selectedStoreName)
    }

    // Cargar datos del producto
    fetchProduct()
  }, [storeId, productId, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Primero seleccionar la tienda
      const storeSelected = await selectStore()
      if (!storeSelected) {
        setIsSubmitting(false)
        return
      }

      const response = await fetchWithAuth(`https://tienda-backend-p9ms.onrender.com/api/productos/${productId}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error al actualizar producto: ${response.status} - ${response.statusText}`, errorText)
        throw new Error(`Error al actualizar producto: ${response.status} - ${response.statusText}`)
      }

      alert("Producto actualizado con éxito")
      router.push(`/stores/${storeId}/products`)
    } catch (err) {
      console.error("Error al actualizar el producto:", err)
      alert(
        `No se pudo actualizar el producto: ${err instanceof Error ? err.message : "Error desconocido"}. Por favor, intenta de nuevo más tarde.`,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      // Primero seleccionar la tienda
      const storeSelected = await selectStore()
      if (!storeSelected) {
        setIsDeleting(false)
        return
      }

      const response = await fetchWithAuth(`https://tienda-backend-p9ms.onrender.com/api/productos/${productId}/`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error al eliminar producto: ${response.status} - ${response.statusText}`, errorText)
        throw new Error(`Error al eliminar producto: ${response.status} - ${response.statusText}`)
      }

      alert("Producto eliminado con éxito")
      router.push(`/stores/${storeId}/products`)
    } catch (err) {
      console.error("Error al eliminar el producto:", err)
      alert(
        `No se pudo eliminar el producto: ${err instanceof Error ? err.message : "Error desconocido"}. Por favor, intenta de nuevo más tarde.`,
      )
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top">
      <div className="bg-white p-4 flex items-center">
        <Link href={`/stores/${storeId}/products`} className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Editar Producto</h1>
      </div>

      <div className="container max-w-md mx-auto p-4">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-base">
              Nombre del Producto
            </Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Manzana Roja"
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
                step="100"
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
              placeholder="0"
              className="bg-input-bg border-0 h-12 text-base"
              type="number"
              inputMode="numeric"
              min="0"
            />
            {errors.cantidad && <p className="text-sm text-red-500">{errors.cantidad}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria" className="text-base">
              Categoría
            </Label>
            <Select value={formData.categoria} onValueChange={(value) => handleSelectChange("categoria", value)}>
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

          <div className="bg-input-bg rounded-lg p-4 flex flex-col items-center justify-center h-40">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2">
              <ImageIcon className="h-6 w-6 text-primary" />
            </div>
            <p className="text-base text-text-secondary">Añadir imagen</p>
            <p className="text-xs text-text-secondary mt-1">(Funcionalidad no disponible en esta versión)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-base">
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Descripción del producto"
              className="bg-input-bg border-0 min-h-[100px] text-base"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="disponible" checked={formData.disponible} onCheckedChange={handleSwitchChange} />
            <Label htmlFor="disponible">Producto disponible</Label>
          </div>

          <div className="flex gap-4 mt-6">
            <Button
              type="submit"
              className="flex-1 h-14 text-base bg-primary hover:bg-primary-dark android-ripple"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  className="h-14 aspect-square flex items-center justify-center"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-6 w-6" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Eliminar Producto</DialogTitle>
                  <DialogDescription>
                    ¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? "Eliminando..." : "Eliminar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </form>
      </div>
    </main>
  )
}

