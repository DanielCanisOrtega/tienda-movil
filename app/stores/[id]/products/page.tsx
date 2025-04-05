"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Filter, Plus, Search } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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
  imagen?: string
}

// Generate more sample products data
const sampleProductos: Producto[] = [
  // Frutas
  {
    id: 1,
    nombre: "Manzana Roja",
    descripcion: "Manzana roja fresca",
    precio: 2500,
    cantidad: 50,
    categoria: "Frutas",
    disponible: true,
    tienda: 1,
  },
  {
    id: 2,
    nombre: "Banano",
    descripcion: "Banano maduro",
    precio: 1800,
    cantidad: 80,
    categoria: "Frutas",
    disponible: true,
    tienda: 1,
  },
  {
    id: 3,
    nombre: "Naranja",
    descripcion: "Naranja jugosa",
    precio: 2000,
    cantidad: 60,
    categoria: "Frutas",
    disponible: true,
    tienda: 1,
  },
  {
    id: 4,
    nombre: "Pera",
    descripcion: "Pera dulce",
    precio: 2800,
    cantidad: 40,
    categoria: "Frutas",
    disponible: true,
    tienda: 1,
  },
  {
    id: 5,
    nombre: "Uvas",
    descripcion: "Uvas sin semilla",
    precio: 5000,
    cantidad: 30,
    categoria: "Frutas",
    disponible: true,
    tienda: 1,
  },
  {
    id: 6,
    nombre: "Fresa",
    descripcion: "Fresas frescas",
    precio: 4500,
    cantidad: 25,
    categoria: "Frutas",
    disponible: true,
    tienda: 1,
  },

  // Verduras
  {
    id: 7,
    nombre: "Tomate",
    descripcion: "Tomate rojo maduro",
    precio: 3000,
    cantidad: 45,
    categoria: "Verduras",
    disponible: true,
    tienda: 1,
  },
  {
    id: 8,
    nombre: "Cebolla",
    descripcion: "Cebolla cabezona",
    precio: 2200,
    cantidad: 55,
    categoria: "Verduras",
    disponible: true,
    tienda: 1,
  },
  {
    id: 9,
    nombre: "Zanahoria",
    descripcion: "Zanahoria fresca",
    precio: 1900,
    cantidad: 70,
    categoria: "Verduras",
    disponible: true,
    tienda: 1,
  },
  {
    id: 10,
    nombre: "Lechuga",
    descripcion: "Lechuga crespa",
    precio: 2500,
    cantidad: 35,
    categoria: "Verduras",
    disponible: true,
    tienda: 1,
  },
  {
    id: 11,
    nombre: "Pimentón",
    descripcion: "Pimentón rojo",
    precio: 3200,
    cantidad: 30,
    categoria: "Verduras",
    disponible: true,
    tienda: 1,
  },
  {
    id: 12,
    nombre: "Papa",
    descripcion: "Papa sabanera",
    precio: 2000,
    cantidad: 100,
    categoria: "Verduras",
    disponible: true,
    tienda: 1,
  },

  // Lácteos
  {
    id: 13,
    nombre: "Leche Entera",
    descripcion: "Leche entera 1L",
    precio: 4500,
    cantidad: 40,
    categoria: "Lácteos",
    disponible: true,
    tienda: 1,
  },
  {
    id: 14,
    nombre: "Queso Campesino",
    descripcion: "Queso campesino 500g",
    precio: 12000,
    cantidad: 25,
    categoria: "Lácteos",
    disponible: true,
    tienda: 1,
  },
  {
    id: 15,
    nombre: "Yogurt Natural",
    descripcion: "Yogurt natural 1L",
    precio: 7500,
    cantidad: 30,
    categoria: "Lácteos",
    disponible: true,
    tienda: 1,
  },
  {
    id: 16,
    nombre: "Mantequilla",
    descripcion: "Mantequilla 250g",
    precio: 8500,
    cantidad: 20,
    categoria: "Lácteos",
    disponible: true,
    tienda: 1,
  },
  {
    id: 17,
    nombre: "Crema de Leche",
    descripcion: "Crema de leche 200ml",
    precio: 5500,
    cantidad: 35,
    categoria: "Lácteos",
    disponible: true,
    tienda: 1,
  },

  // Carnes
  {
    id: 18,
    nombre: "Pechuga de Pollo",
    descripcion: "Pechuga de pollo 1kg",
    precio: 15000,
    cantidad: 20,
    categoria: "Carnes",
    disponible: true,
    tienda: 1,
  },
  {
    id: 19,
    nombre: "Carne Molida",
    descripcion: "Carne molida de res 500g",
    precio: 12000,
    cantidad: 25,
    categoria: "Carnes",
    disponible: true,
    tienda: 1,
  },
  {
    id: 20,
    nombre: "Lomo de Cerdo",
    descripcion: "Lomo de cerdo 1kg",
    precio: 18000,
    cantidad: 15,
    categoria: "Carnes",
    disponible: true,
    tienda: 1,
  },
  {
    id: 21,
    nombre: "Costillas BBQ",
    descripcion: "Costillas de cerdo BBQ 1kg",
    precio: 22000,
    cantidad: 10,
    categoria: "Carnes",
    disponible: true,
    tienda: 1,
  },

  // Abarrotes
  {
    id: 22,
    nombre: "Arroz",
    descripcion: "Arroz blanco 1kg",
    precio: 5500,
    cantidad: 80,
    categoria: "Abarrotes",
    disponible: true,
    tienda: 1,
  },
  {
    id: 23,
    nombre: "Azúcar",
    descripcion: "Azúcar refinada 1kg",
    precio: 4800,
    cantidad: 70,
    categoria: "Abarrotes",
    disponible: true,
    tienda: 1,
  },
  {
    id: 24,
    nombre: "Aceite",
    descripcion: "Aceite vegetal 1L",
    precio: 12000,
    cantidad: 50,
    categoria: "Abarrotes",
    disponible: true,
    tienda: 1,
  },
  {
    id: 25,
    nombre: "Pasta",
    descripcion: "Pasta espagueti 500g",
    precio: 3500,
    cantidad: 60,
    categoria: "Abarrotes",
    disponible: true,
    tienda: 1,
  },
  {
    id: 26,
    nombre: "Frijoles",
    descripcion: "Frijoles rojos 500g",
    precio: 6000,
    cantidad: 45,
    categoria: "Abarrotes",
    disponible: true,
    tienda: 1,
  },

  // Bebidas
  {
    id: 27,
    nombre: "Agua Mineral",
    descripcion: "Agua mineral 1.5L",
    precio: 3000,
    cantidad: 100,
    categoria: "Bebidas",
    disponible: true,
    tienda: 1,
  },
  {
    id: 28,
    nombre: "Refresco Cola",
    descripcion: "Refresco de cola 2L",
    precio: 5500,
    cantidad: 80,
    categoria: "Bebidas",
    disponible: true,
    tienda: 1,
  },
  {
    id: 29,
    nombre: "Jugo de Naranja",
    descripcion: "Jugo de naranja natural 1L",
    precio: 7000,
    cantidad: 40,
    categoria: "Bebidas",
    disponible: true,
    tienda: 1,
  },
  {
    id: 30,
    nombre: "Cerveza",
    descripcion: "Cerveza nacional 330ml",
    precio: 2500,
    cantidad: 120,
    categoria: "Bebidas",
    disponible: true,
    tienda: 1,
  },

  // Limpieza
  {
    id: 31,
    nombre: "Detergente",
    descripcion: "Detergente en polvo 1kg",
    precio: 9500,
    cantidad: 50,
    categoria: "Limpieza",
    disponible: true,
    tienda: 1,
  },
  {
    id: 32,
    nombre: "Jabón de Baño",
    descripcion: "Jabón de baño x3",
    precio: 7500,
    cantidad: 60,
    categoria: "Limpieza",
    disponible: true,
    tienda: 1,
  },
  {
    id: 33,
    nombre: "Limpiador Multiusos",
    descripcion: "Limpiador multiusos 750ml",
    precio: 8000,
    cantidad: 45,
    categoria: "Limpieza",
    disponible: true,
    tienda: 1,
  },
  {
    id: 34,
    nombre: "Papel Higiénico",
    descripcion: "Papel higiénico x12",
    precio: 15000,
    cantidad: 40,
    categoria: "Limpieza",
    disponible: true,
    tienda: 1,
  },

  // Otros
  {
    id: 35,
    nombre: "Pilas AA",
    descripcion: "Pilas alcalinas AA x4",
    precio: 12000,
    cantidad: 30,
    categoria: "Otros",
    disponible: true,
    tienda: 1,
  },
  {
    id: 36,
    nombre: "Velas",
    descripcion: "Velas blancas x10",
    precio: 5000,
    cantidad: 50,
    categoria: "Otros",
    disponible: true,
    tienda: 1,
  },
  {
    id: 37,
    nombre: "Encendedor",
    descripcion: "Encendedor recargable",
    precio: 3500,
    cantidad: 40,
    categoria: "Otros",
    disponible: true,
    tienda: 1,
  },
  {
    id: 38,
    nombre: "Bolsas de Basura",
    descripcion: "Bolsas de basura x10",
    precio: 4500,
    cantidad: 60,
    categoria: "Otros",
    disponible: true,
    tienda: 1,
  },
]

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
  const [nextId, setNextId] = useState(39) // Para generar IDs únicos

  // Cargar productos
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
    loadProducts()
  }, [storeId, router])

  // Cargar productos desde localStorage o usar datos de ejemplo
  const loadProducts = () => {
    setIsLoading(true)

    // Intentar cargar productos del localStorage
    const storedProducts = localStorage.getItem(`store_${storeId}_products`)

    let productsToUse: Producto[]

    if (storedProducts) {
      productsToUse = JSON.parse(storedProducts)
    } else {
      // Si no hay datos en localStorage, usar los datos de ejemplo
      productsToUse = sampleProductos.map((p) => ({ ...p, tienda: Number(storeId) }))
      // Guardar en localStorage para futuras visitas
      localStorage.setItem(`store_${storeId}_products`, JSON.stringify(productsToUse))
    }

    setProductos(productsToUse)
    setFilteredProductos(productsToUse)

    // Extraer categorías únicas
    const uniqueCategories = Array.from(new Set(productsToUse.map((producto) => producto.categoria)))
    setCategories(["Todos", ...uniqueCategories])

    setNextId(Math.max(...productsToUse.map((p) => p.id)) + 1)
    setIsLoading(false)
  }

  // Filtrar productos cuando cambia el término de búsqueda o filtros
  useEffect(() => {
    let filtered = [...productos]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          producto.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrar por disponibilidad
    if (showOnlyAvailable) {
      filtered = filtered.filter((producto) => producto.disponible)
    }

    // Filtrar por categoría
    if (activeCategory !== "Todos") {
      filtered = filtered.filter((producto) => producto.categoria === activeCategory)
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
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(price)
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
                <DialogDescription>Selecciona las opciones para filtrar los productos</DialogDescription>
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
                  className={`px-4 py-2 ${activeCategory === category ? "bg-primary text-white" : "bg-white text-text-primary"} rounded-full text-sm`}
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
              <Button className="mt-4 bg-primary hover:bg-primary-dark">Añadir producto</Button>
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
                        <Badge
                          variant={producto.disponible ? "default" : "secondary"}
                          className={producto.disponible ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {producto.disponible ? "Disponible" : "Agotado"}
                        </Badge>
                      </div>
                      <p className="text-text-secondary text-sm line-clamp-2 mb-2">
                        {producto.descripcion || "Sin descripción"}
                      </p>
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

