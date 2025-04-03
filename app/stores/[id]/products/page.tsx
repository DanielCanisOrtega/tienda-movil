"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Plus, Search, Package, Edit, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { fetchWithAuth } from "@/services/auth-service"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

// Definir la interfaz para los productos
interface Product {
  id: number
  nombre: string
  descripcion: string
  precio: number
  cantidad: number
  categoria: string
  tienda: number
  imagen?: string
  disponible: boolean
  fecha_creacion: string
}

export default function StoreProductsPage() {
  const router = useRouter()
  const params = useParams()
  const storeId = params.id as string

  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [userType, setUserType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [storeName, setStoreName] = useState<string>("")
  const [showQuantityDialog, setShowQuantityDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [newQuantity, setNewQuantity] = useState<number>(0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)

  // Verificar si el usuario está autorizado
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

    // Cargar productos de la tienda
    fetchProducts()
  }, [router, storeId])

  // Función para obtener los productos
  const fetchProducts = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log(`Obteniendo productos de la tienda con ID: ${storeId}`)

      // Determinar qué endpoint usar basado en si queremos mostrar solo disponibles
      const endpoint = showOnlyAvailable
        ? "https://tienda-backend-p9ms.onrender.com/api/productos/disponibles/"
        : "https://tienda-backend-p9ms.onrender.com/api/productos/"

      const response = await fetchWithAuth(endpoint)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error al obtener productos: ${response.status} - ${response.statusText}`, errorText)
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Respuesta de productos:", data)

      // Filtrar productos por tienda si es necesario
      const storeProducts = Array.isArray(data)
        ? data.filter((product) => product.tienda === Number.parseInt(storeId))
        : []

      console.log(`Se encontraron ${storeProducts.length} productos para la tienda ${storeId}`)
      setProducts(storeProducts)
      setFilteredProducts(storeProducts)
    } catch (err) {
      console.error("Error al cargar los productos:", err)
      setError(
        `No se pudieron cargar los productos: ${err instanceof Error ? err.message : "Error desconocido"}. Por favor, intenta de nuevo más tarde.`,
      )
      setProducts([])
      setFilteredProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar productos según búsqueda
  useEffect(() => {
    if (!Array.isArray(products)) {
      console.error("products no es un array:", products)
      setFilteredProducts([])
      return
    }

    if (searchQuery.trim() === "") {
      setFilteredProducts(products)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = products.filter(
        (product) =>
          product.nombre.toLowerCase().includes(query) ||
          product.descripcion.toLowerCase().includes(query) ||
          product.categoria.toLowerCase().includes(query),
      )
      setFilteredProducts(filtered)
    }
  }, [products, searchQuery])

  // Función para eliminar un producto
  const handleDeleteProduct = async (productId: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.")) {
      try {
        console.log(`Eliminando producto con ID: ${productId}`)

        const response = await fetchWithAuth(`https://tienda-backend-p9ms.onrender.com/api/productos/${productId}/`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Error al eliminar producto: ${response.status} - ${response.statusText}`, errorText)
          throw new Error(`Error: ${response.status} - ${response.statusText}`)
        }

        // Actualizar la lista de productos
        await fetchProducts()
        alert("Producto eliminado con éxito")
      } catch (err) {
        console.error("Error al eliminar el producto:", err)
        alert(
          `No se pudo eliminar el producto: ${err instanceof Error ? err.message : "Error desconocido"}. Por favor, intenta de nuevo más tarde.`,
        )
      }
    }
  }

  // Función para actualizar la cantidad de un producto
  const handleUpdateQuantity = async () => {
    if (!selectedProduct) return

    setIsUpdating(true)
    setUpdateError(null)

    try {
      console.log(`Actualizando cantidad del producto ${selectedProduct.id} a ${newQuantity}`)

      const response = await fetchWithAuth(
        `https://tienda-backend-p9ms.onrender.com/api/productos/${selectedProduct.id}/actualizar-cantidad/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cantidad: newQuantity }),
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error al actualizar cantidad: ${response.status} - ${response.statusText}`, errorText)
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }

      // Cerrar el diálogo y actualizar la lista de productos
      setShowQuantityDialog(false)
      setSelectedProduct(null)
      setNewQuantity(0)
      await fetchProducts()
      alert("Cantidad actualizada con éxito")
    } catch (err) {
      console.error("Error al actualizar la cantidad:", err)
      setUpdateError(
        `No se pudo actualizar la cantidad: ${err instanceof Error ? err.message : "Error desconocido"}. Por favor, intenta de nuevo más tarde.`,
      )
    } finally {
      setIsUpdating(false)
    }
  }

  // Función para abrir el diálogo de actualización de cantidad
  const openQuantityDialog = (product: Product) => {
    setSelectedProduct(product)
    setNewQuantity(product.cantidad)
    setShowQuantityDialog(true)
    setUpdateError(null)
  }

  // Función para alternar entre mostrar todos los productos o solo los disponibles
  const toggleAvailableFilter = () => {
    setShowOnlyAvailable(!showOnlyAvailable)
    // Recargar productos con el nuevo filtro
    fetchProducts()
  }

  // Formatear precio en pesos colombianos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top has-bottom-nav">
      <div className="bg-primary text-white p-5">
        <div className="flex items-center mb-2">
          <Link href="/home" className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold">Productos de {storeName}</h1>
        </div>
        <p className="text-sm opacity-80 mt-1">Gestiona el inventario de esta tienda</p>
      </div>

      <div className="container max-w-md mx-auto p-4 space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
            <Input
              placeholder="Buscar productos..."
              className="pl-10 bg-input-bg border-0 h-12 text-base rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="mt-3 flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAvailableFilter}
              className={showOnlyAvailable ? "bg-primary text-white" : ""}
            >
              {showOnlyAvailable ? "Mostrar todos" : "Solo disponibles"}
            </Button>
            <Link href={`/stores/${storeId}/products/add`}>
              <Button className="bg-primary hover:bg-primary-dark">
                <Plus className="mr-2 h-4 w-4" />
                Añadir Producto
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-text-secondary">Cargando productos...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <p className="text-sm text-text-secondary mb-4">
                Esto podría deberse a problemas de conectividad o que el servidor está temporalmente inaccesible.
              </p>
              <Button onClick={() => fetchProducts()} className="mt-2 bg-primary hover:bg-primary-dark">
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-text-secondary mb-2">No hay productos registrados</p>
              <p className="text-sm text-text-secondary">Comienza añadiendo productos a esta tienda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{product.nombre}</h3>
                        <Badge variant={product.disponible ? "default" : "destructive"}>
                          {product.disponible ? "Disponible" : "Agotado"}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-secondary mt-1">{product.categoria}</p>
                      <p className="font-bold text-primary mt-1">{formatPrice(product.precio)}</p>
                      <p className="text-sm mt-2">
                        Cantidad: <span className="font-medium">{product.cantidad}</span>
                      </p>
                      {product.descripcion && (
                        <p className="text-sm text-text-secondary mt-2 line-clamp-2">{product.descripcion}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => openQuantityDialog(product)}
                      >
                        <Package className="h-4 w-4 text-primary" />
                        <span className="sr-only">Actualizar cantidad</span>
                      </Button>
                      <Link href={`/stores/${storeId}/products/edit/${product.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4 text-primary" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Diálogo para actualizar cantidad */}
      <Dialog open={showQuantityDialog} onOpenChange={setShowQuantityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar cantidad</DialogTitle>
            <DialogDescription>Actualiza la cantidad disponible de {selectedProduct?.nombre}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Nueva cantidad</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={newQuantity}
                onChange={(e) => setNewQuantity(Number.parseInt(e.target.value) || 0)}
                className="bg-input-bg border-0"
              />
              {updateError && <p className="text-sm text-red-500">{updateError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowQuantityDialog(false)
                setSelectedProduct(null)
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateQuantity} className="bg-primary hover:bg-primary-dark" disabled={isUpdating}>
              {isUpdating ? "Actualizando..." : "Actualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </main>
  )
}

