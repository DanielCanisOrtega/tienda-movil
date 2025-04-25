"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, Plus, Search, Barcode } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { type Producto, getProductos, deleteProducto } from "@/services/product-service"
import BarcodeScanner from "@/components/barcode-scanner"

export default function ProductosPage() {
  const router = useRouter()
  const params = useParams()
  const storeId = params.id as string
  const { toast } = useToast()

  const [userType, setUserType] = useState<string | null>(null)
  const [productos, setProductos] = useState<Producto[]>([])
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [storeName, setStoreName] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

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

    // Cargar productos
    loadProductos()
  }, [storeId, router])

  // Cargar productos desde la API
  const loadProductos = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getProductos(Number(storeId))
      setProductos(data)
      setFilteredProductos(data)
    } catch (err) {
      console.error("Error al cargar productos:", err)
      setError("No se pudieron cargar los productos. Por favor, intenta de nuevo más tarde.")
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos. Por favor, intenta de nuevo más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar productos por término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProductos(productos)
    } else {
      const filtered = productos.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          producto.codigo_barras?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          producto.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredProductos(filtered)
    }
  }, [searchTerm, productos])

  // Función para iniciar el escáner de códigos de barras
  const startBarcodeScanner = () => {
    setShowBarcodeScanner(true)
  }

  // Función para manejar la detección de un código de barras
  const handleBarcodeDetected = (code: string) => {
    console.log("CÓDIGO RECIBIDO EN LA PÁGINA:", code)

    // Mostrar un toast con el código detectado
    toast({
      title: "Código detectado",
      description: `Código: ${code}`,
      variant: "success",
    })

    // Establecer el término de búsqueda como el código
    setSearchTerm(code)
    setShowBarcodeScanner(false)
  }

  // Función para eliminar un producto
  const handleDeleteProduct = async (productoId: number) => {
    try {
      setIsDeleting(productoId)
      await deleteProducto(productoId, Number(storeId))

      // Actualizar la lista de productos
      setProductos(productos.filter((p) => p.id !== productoId))

      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente",
        variant: "success",
      })
    } catch (err) {
      console.error("Error al eliminar el producto:", err)
      toast({
        title: "Error",
        description: `No se pudo eliminar el producto: ${err instanceof Error ? err.message : "Error desconocido"}`,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  // Agrupar productos por categoría
  const groupedProductos = filteredProductos.reduce<Record<string, Producto[]>>((acc, producto) => {
    const categoria = producto.categoria || "Sin categoría"
    if (!acc[categoria]) {
      acc[categoria] = []
    }
    acc[categoria].push(producto)
    return acc
  }, {})

  // Ordenar categorías
  const sortedCategorias = Object.keys(groupedProductos).sort()

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background-light">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-text-primary">Cargando productos...</p>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top">
      <div className="bg-white p-4 flex items-center">
        <Link href="/home" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Productos de {storeName}</h1>
      </div>

      <div className="p-4">
        <div className="flex items-center mb-4 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              className="pl-10 bg-white border-0 h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="bg-white" onClick={startBarcodeScanner}>
            <Barcode className="h-5 w-5" />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="bg-primary hover:bg-primary-dark"
            onClick={() => router.push(`/stores/${storeId}/productos/add`)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {error ? (
          <div className="bg-white rounded-lg p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadProductos} className="bg-primary hover:bg-primary-dark">
              Reintentar
            </Button>
          </div>
        ) : filteredProductos.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center">
            <p className="text-text-secondary mb-4">
              {searchTerm
                ? "No se encontraron productos que coincidan con tu búsqueda"
                : "No hay productos registrados en esta tienda"}
            </p>
            {searchTerm ? (
              <Button onClick={() => setSearchTerm("")} className="bg-primary hover:bg-primary-dark">
                Limpiar búsqueda
              </Button>
            ) : (
              <Button
                onClick={() => router.push(`/stores/${storeId}/productos/add`)}
                className="bg-primary hover:bg-primary-dark"
              >
                Añadir producto
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {sortedCategorias.map((categoria) => (
              <div key={categoria}>
                <h2 className="text-lg font-semibold mb-2">{categoria}</h2>
                <div className="grid grid-cols-1 gap-3">
                  {groupedProductos[categoria].map((producto) => (
                    <Card key={producto.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{producto.nombre}</h3>
                          <p className="text-sm text-text-secondary mt-1">
                            {producto.codigo_barras ? `Código: ${producto.codigo_barras}` : "Sin código de barras"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${producto.precio.toLocaleString()}</p>
                          <p className="text-sm text-text-secondary mt-1">Stock: {producto.cantidad}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <Badge
                          variant={producto.disponible ? "default" : "secondary"}
                          className={producto.disponible ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {producto.disponible ? "Disponible" : "No disponible"}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/stores/${storeId}/productos/edit/${producto.id}`)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isDeleting === producto.id}
                            onClick={() => handleDeleteProduct(producto.id!)}
                          >
                            {isDeleting === producto.id ? "Eliminando..." : "Eliminar"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {userType === "admin" && (
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={() => router.push(`/stores/${storeId}/productos/add`)}
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary-dark shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Componente de escáner de códigos de barras */}
      {showBarcodeScanner && (
        <BarcodeScanner onDetected={handleBarcodeDetected} onClose={() => setShowBarcodeScanner(false)} />
      )}
    </main>
  )
}
