"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, Plus, Search } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { type Producto, getProductos } from "@/services/product-service"

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
        <Link href={`/stores/${storeId}`} className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Productos de {storeName}</h1>
      </div>

      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
          <Input
            type="text"
            placeholder="Buscar productos..."
            className="pl-10 bg-white border-0 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                    <Card
                      key={producto.id}
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => router.push(`/stores/${storeId}/productos/edit/${producto.id}`)}
                    >
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
    </main>
  )
}
