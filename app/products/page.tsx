"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, Plus, Edit, Trash2, Search } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useRouter } from "next/navigation"

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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos")
  const [categories, setCategories] = useState<string[]>([])
  const router = useRouter()

  // Cargar productos del localStorage
  useEffect(() => {
    // Verificar si hay un usuario autenticado
    const userType = localStorage.getItem("userType")
    if (!userType) {
      router.push("/")
      return
    }

    // Obtener el ID de la tienda seleccionada
    const selectedStoreId = localStorage.getItem("selectedStoreId")

    // Cargar productos desde localStorage o generar datos de ejemplo
    const storedProducts = localStorage.getItem("products")

    if (storedProducts) {
      const parsedProducts = JSON.parse(storedProducts)
      setProducts(parsedProducts)
      setFilteredProducts(parsedProducts)
    } else {
      // Si no hay datos en localStorage, crear algunos productos de ejemplo
      const sampleProducts = [
        {
          id: 1,
          name: "Manzana Roja",
          price: 2500,
          description: "Manzana roja fresca",
          category: "Frutas",
          image: "/placeholder.svg?height=200&width=200",
          stock: 50,
        },
        {
          id: 2,
          name: "Banano",
          price: 1800,
          description: "Banano maduro",
          category: "Frutas",
          image: "/placeholder.svg?height=200&width=200",
          stock: 80,
        },
        {
          id: 3,
          name: "Leche Entera",
          price: 4500,
          description: "Leche entera 1L",
          category: "Lácteos",
          image: "/placeholder.svg?height=200&width=200",
          stock: 40,
        },
      ]

      setProducts(sampleProducts)
      setFilteredProducts(sampleProducts)
      localStorage.setItem("products", JSON.stringify(sampleProducts))
    }
  }, [router])

  // Filtrar productos según búsqueda y categoría
  useEffect(() => {
    let result = [...products]

    // Filtrar por categoría
    if (selectedCategory !== "Todos") {
      result = result.filter((product) => product.category === selectedCategory)
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (product) => product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query),
      )
    }

    setFilteredProducts(result)
  }, [products, searchQuery, selectedCategory])

  // Formatear precio en pesos colombianos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleDeleteProduct = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      const updatedProducts = products.filter((product) => product.id !== id)
      setProducts(updatedProducts)
      localStorage.setItem("products", JSON.stringify(updatedProducts))
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top has-bottom-nav">
      <div className="bg-white p-4 flex items-center">
        <Link href="/home" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Inventario</h1>
      </div>

      <div className="bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
          <Input
            placeholder="Buscar productos..."
            className="pl-10 bg-input-bg border-0 h-12 text-base rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex overflow-x-auto py-4 gap-3 no-scrollbar">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                selectedCategory === category ? "bg-primary text-white" : "bg-input-bg text-text-secondary"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="container max-w-md mx-auto p-4">
        <Link href="/add-product">
          <Button className="w-full h-12 bg-primary hover:bg-primary-dark mb-4 flex items-center justify-center">
            <Plus className="mr-2 h-5 w-5" />
            Añadir Producto
          </Button>
        </Link>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-text-secondary mb-2">No hay productos registrados</p>
            <p className="text-sm text-text-secondary">Comienza añadiendo productos a tu inventario</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="flex">
                  <div className="w-24 h-24 relative">
                    <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="p-3 flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{product.name}</h3>
                      <div className="font-bold text-primary">{formatPrice(product.price)}</div>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">{product.category}</p>
                    {product.description && <p className="text-sm mt-1 line-clamp-1">{product.description}</p>}
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">
                        Stock: <span className="font-medium">{product.stock}</span>
                      </span>
                      <div className="flex space-x-2">
                        <Link href={`/edit-product/${product.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4 text-primary" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </main>
  )
}

