"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

// Definición de la interfaz para los productos
interface Product {
  id: number
  name: string
  price: string
  image: string
  category: string
}

export function SearchResults() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  // Lista de productos por categoría
  const products: Product[] = [
    // Frutas
    {
      id: 1,
      name: "Manzana Roja",
      price: "$4.500/kg",
      image: "/placeholder.svg?height=192&width=400",
      category: "frutas",
    },
    {
      id: 2,
      name: "Banano",
      price: "$3.200/kg",
      image: "/placeholder.svg?height=192&width=400",
      category: "frutas",
    },
    {
      id: 3,
      name: "Naranja Valencia",
      price: "$5.800/kg",
      image: "/placeholder.svg?height=192&width=400",
      category: "frutas",
    },
    {
      id: 4,
      name: "Fresa",
      price: "$8.900/kg",
      image: "/placeholder.svg?height=192&width=400",
      category: "frutas",
    },
    {
      id: 5,
      name: "Piña",
      price: "$6.500/unidad",
      image: "/placeholder.svg?height=192&width=400",
      category: "frutas",
    },

    // Verduras
    {
      id: 6,
      name: "Tomate",
      price: "$4.200/kg",
      image: "/placeholder.svg?height=192&width=400",
      category: "verduras",
    },
    {
      id: 7,
      name: "Cebolla Cabezona",
      price: "$3.800/kg",
      image: "/placeholder.svg?height=192&width=400",
      category: "verduras",
    },
    {
      id: 8,
      name: "Zanahoria",
      price: "$2.900/kg",
      image: "/placeholder.svg?height=192&width=400",
      category: "verduras",
    },
    {
      id: 9,
      name: "Papa Pastusa",
      price: "$2.500/kg",
      image: "/placeholder.svg?height=192&width=400",
      category: "verduras",
    },
    {
      id: 10,
      name: "Lechuga Crespa",
      price: "$3.500/unidad",
      image: "/placeholder.svg?height=192&width=400",
      category: "verduras",
    },

    // Lácteos
    {
      id: 11,
      name: "Leche Entera",
      price: "$4.800/litro",
      image: "/placeholder.svg?height=192&width=400",
      category: "lacteos",
    },
    {
      id: 12,
      name: "Queso Campesino",
      price: "$12.500/kg",
      image: "/placeholder.svg?height=192&width=400",
      category: "lacteos",
    },
    {
      id: 13,
      name: "Yogurt Natural",
      price: "$7.200/litro",
      image: "/placeholder.svg?height=192&width=400",
      category: "lacteos",
    },
    {
      id: 14,
      name: "Mantequilla",
      price: "$9.800/500g",
      image: "/placeholder.svg?height=192&width=400",
      category: "lacteos",
    },
    {
      id: 15,
      name: "Kumis",
      price: "$6.900/litro",
      image: "/placeholder.svg?height=192&width=400",
      category: "lacteos",
    },

    // Carnes
    {
      id: 16,
      name: "Carne de Res (Lomo)",
      price: "$28.500/kg",
      image: "/placeholder.svg?height=192&width=400",
      category: "carnes",
    },
    {
      id: 17,
      name: "Pollo Entero",
      price: "$15.900/kg",
      image: "/placeholder.svg?height=192&width=400",
      category: "carnes",
    },
    {
      id: 18,
      name: "Cerdo (Chuleta)",
      price: "$22.300/kg",
      image: "/placeholder.svg?height=192&width=400",
      category: "carnes",
    },
    {
      id: 19,
      name: "Pescado (Tilapia)",
      price: "$19.800/kg",
      image: "/placeholder.svg?height=192&width=400",
      category: "carnes",
    },
    {
      id: 20,
      name: "Costilla de Res",
      price: "$18.500/kg",
      image: "/placeholder.svg?height=192&width=400",
      category: "carnes",
    },
  ]

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
      result = result.filter((product) => product.category === activeCategory)
    }

    // Filtrar por búsqueda
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      result = result.filter((product) => product.name.toLowerCase().includes(query))
    }

    setFilteredProducts(result)
  }, [activeCategory, searchQuery])

  return (
    <div className="space-y-4">
      {filteredProducts.length > 0 ? (
        filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)
      ) : (
        <div className="text-center py-8">
          <p className="text-text-secondary">No se encontraron productos</p>
        </div>
      )}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm android-ripple">
      <div className="relative h-48 w-full">
        <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">
            {product.category === "frutas"
              ? "🍎"
              : product.category === "verduras"
                ? "🥦"
                : product.category === "lacteos"
                  ? "🥛"
                  : product.category === "carnes"
                    ? "🥩"
                    : "📦"}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="font-medium text-lg">{product.name}</div>
        <div className="text-base text-text-secondary">{product.price}</div>
      </div>
    </div>
  )
}