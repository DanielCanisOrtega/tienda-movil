"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

// Definición de la interfaz para los productos
interface Product {
  id: number
  name: string
  price: number
  description: string
  category: string
  image: string
  stock: number
}

export function SearchResults() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  // Cargar productos del localStorage
  useEffect(() => {
    const storedProducts = localStorage.getItem("products")
    if (storedProducts) {
      const parsedProducts = JSON.parse(storedProducts)
      setProducts(parsedProducts)
    } else {
      // Redirigir a la nueva página de productos
      router.push("/products")
    }
  }, [router])

  // Escuchar eventos de cambio de categoría y búsqueda
  useEffect(() => {
    const handleCategoryChange = (event: Event) => {
      const customEvent = event as CustomEvent
      setActiveCategory(customEvent.detail.category)
    }

    const handleSearchChange = (event: Event) => {
      const customEvent = event as CustomEvent
      setSearchQuery(customEvent.detail.query)
    }

    window.addEventListener("categoryChange", handleCategoryChange)
    window.addEventListener("searchChange", handleSearchChange)

    return () => {
      window.removeEventListener("categoryChange", handleCategoryChange)
      window.removeEventListener("searchChange", handleSearchChange)
    }
  }, [])

  // Filtrar productos por categoría y búsqueda
  useEffect(() => {
    let result = [...products]

    // Filtrar por categoría
    if (activeCategory !== "all") {
      result = result.filter((product) => product.category.toLowerCase() === activeCategory)
    }

    // Filtrar por búsqueda
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (product) => product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query),
      )
    }

    setFilteredProducts(result)
  }, [products, activeCategory, searchQuery])

  // Formatear precio en pesos colombianos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-4">
      {filteredProducts.length > 0 ? (
        filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg overflow-hidden shadow-sm android-ripple"
            onClick={() => router.push(`/products`)}
          >
            <div className="relative h-48 w-full">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            </div>
            <div className="p-4">
              <div className="flex justify-between">
                <div className="font-medium text-lg">{product.name}</div>
                <div className="font-bold text-primary">{formatPrice(product.price)}</div>
              </div>
              <div className="text-sm text-text-secondary mt-1">{product.category}</div>
              {product.description && <p className="text-sm mt-2 line-clamp-2">{product.description}</p>}
              <div className="text-sm mt-2">
                Stock: <span className="font-medium">{product.stock}</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <p className="text-text-secondary">No se encontraron productos</p>
          <p className="text-sm text-text-secondary mt-2">Intenta con otra búsqueda o categoría</p>
        </div>
      )}
    </div>
  )
}

