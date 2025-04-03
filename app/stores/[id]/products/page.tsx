"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Filter, Plus, Search } from 'lucide-react'
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { fetchWithAuth } from "@/services/auth-service"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Producto {
  id: number
  nombre: string
  descripcion: string
  precio: number
  cantidad: number
  categoria: string
  disponible: boolean
  tienda: number
  codigo_barras?: string
}

export default function ProductsPage() {
  const params = useParams()
  const router = useRouter()
  const storeId = params.id as string
  
  const [productos, setProductos] = useState<Producto[]>([])
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
  const [activeCategory, setActiveCategory] = useState("Todos")
  const [storeName, setStoreName] = useState<string>("")
  const [categories, setCategories] = useState<string[]>([])

  // Función para seleccionar la tienda y luego obtener los productos
  const selectStoreAndFetchProducts = async () => {
    setIsLoading(true)
    try {
      // Primero seleccionar la tienda
      console.log(`Seleccionando tienda con ID: ${storeId}`)
      const selectResponse = await fetchWithAuth(
        `https://tienda-backend-p9ms.onrender.com/api/tiendas/${storeId}/seleccionar_tienda/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      if (!selectResponse.ok) {
        const errorText = await selectResponse.text()
        console.error(`Error al seleccionar tienda: ${selectResponse.status} - ${selectResponse.statusText}`, errorText)
        throw new Error(`Error al seleccionar tienda: ${selectResponse.status} - ${selectResponse.statusText}`)
      }

      console.log("Tienda seleccionada correctamente, obteniendo productos...")
      
      // Luego obtener los productos
      console.log(`Obteniendo productos de la tienda con ID: ${storeId}`)
      const response = await fetchWithAuth("https://tienda-backend-p9ms.onrender.com/api/productos/")
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error al obtener productos: ${response.status} - ${response.statusText}`, errorText)
        throw new Error(`Error al obtener productos: ${response.status} - ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log("Respuesta de productos:", data)
      
      // Filtrar productos por tienda
      const storeProducts = Array.isArray(data) ? data.filter((producto: Producto) => producto.tienda === parseInt(storeId)) : []
      console.log(`Se encontraron ${storeProducts.length} productos para la tienda ${storeId}`)
      
      setProductos(storeProducts)
      setFilteredProductos(storeProducts)
      
      // Extraer categorías únicas
      const uniqueCategories = Array.from(new Set(storeProducts.map((producto: Producto) => producto.categoria)))
      setCategories(["Todos", ...uniqueCategories])
      
    } catch (error) {
      console.error("Error al cargar productos:", error)
      alert("No se pudieron cargar los productos. Por favor, intenta de nuevo más tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Verificar si el usuario está autorizado
    const userType = localStorage.getItem("userType")
    if (!userType) {
      router.push("/")
      return
    }

    // Obtener el nombre de la tienda seleccionada
    const selectedStoreName = localStorage.getItem("selectedStoreName")
    if (selectedStoreName) {
      setStoreName(selectedStoreName)
    }

    // Cargar productos
    selectStoreAndFetchProducts()
  }, [storeId, router])

  // Filtrar productos cuando cambia el término de búsqueda o filtros
  useEffect(() => {
    let filtered = [...productos]
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(producto => 
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Filtrar por disponibilidad
    if (showOnlyAvailable) {
      filtered = filtered.filter(producto => producto.disponible)
    }
    
    // Filtrar por categoría
    if (activeCategory !== "Todos") {
      filtered = filtered.filter(producto => producto.categoria === activeCategory)
    }
    
    setFilteredProductos(filtered)
  }, [searchTerm, showOnlyAvailable, activeCategory, productos])

  const toggleAvailableFilter = () => {
    setShowOnlyAvailable(!showOnlyAvailable)
  }

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(price)
  }

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
        <Link href={`/home`} className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Productos de {storeName}</h1>
      </div>

      <div className="p-4">
        <div className="flex items-center mb-4 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
            <Input
              placeholder="Buscar productos..."
              className="pl-10 bg-input-bg border-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="bg-white">
                <Filter className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Filtrar productos</DialogTitle>
                <DialogDescription>
                  Selecciona las opciones para filtrar los productos
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={showOnlyAvailable}
                    onChange={toggleAvailableFilter}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="available" className="text-sm font-medium text-text-primary">
                    Mostrar solo productos disponibles
                  </label>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Link href={`/stores/${storeId}/products/add`}>
            <Button variant="default" size="icon" className="bg-primary hover:bg-primary-dark">
              <Plus className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {categories.length > 1 && (
          <Tabs defaultValue="Todos" className="mb-4">
            <TabsList className="bg-white overflow-x-auto flex w-full justify-start p-0 h-auto">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 ${activeCategory === category ? 'bg-primary text-white' : 'bg-white text-text-primary'} rounded-full text-sm`}
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {filteredProductos.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-text-secondary">No se encontraron productos</p>
            <Link href={`/stores/${storeId}/products/add`}>
              <Button className="mt-4 bg-primary hover:bg-primary-dark">
                Añadir producto
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProductos.map((producto) => (
              <Link key={producto.id} href={`/stores/${storeId}/products/edit/${producto.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="bg-gray-100 h-40 flex items-center justify-center">
                      <div className="text-4xl text-gray-400">📦</div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1">{producto.nombre}</h3>
                        <Badge variant={producto.disponible ? "default" : "secondary"} className={producto.disponible ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {producto.disponible ? "Disponible" : "Agotado"}
                        </Badge>
                      </div>
                      <p className="text-text-secondary text-sm line-clamp-2 mb-2">{producto.descripcion || "Sin descripción"}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-primary">{formatPrice(producto.precio)}</span>
                        <span className="text-sm text-text-secondary">Stock: {producto.cantidad}</span>
                      </div>
                      <div className="mt-2">
                        <Badge variant="outline" className="bg-gray-100 text-text-secondary">
                          {producto.categoria}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
