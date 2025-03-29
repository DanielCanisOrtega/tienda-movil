"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Plus, Minus, ShoppingCart, Trash2 } from "lucide-react"
import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

interface Product {
  id: number
  name: string
  price: number
  category: string
  image: string
}

interface CartItem {
  product: Product
  quantity: number
}

export default function CartPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Cargar productos
  useEffect(() => {
    // En un caso real, estos datos vendrían de una API
    const availableProducts: Product[] = [
      { id: 1, name: "Manzana Roja", price: 4500, category: "Frutas", image: "/placeholder.svg?height=80&width=80" },
      { id: 2, name: "Banano", price: 3200, category: "Frutas", image: "/placeholder.svg?height=80&width=80" },
      { id: 3, name: "Tomate", price: 4200, category: "Verduras", image: "/placeholder.svg?height=80&width=80" },
      {
        id: 4,
        name: "Cebolla Cabezona",
        price: 3800,
        category: "Verduras",
        image: "/placeholder.svg?height=80&width=80",
      },
      { id: 5, name: "Leche Entera", price: 4800, category: "Lácteos", image: "/placeholder.svg?height=80&width=80" },
      {
        id: 6,
        name: "Queso Campesino",
        price: 12500,
        category: "Lácteos",
        image: "/placeholder.svg?height=80&width=80",
      },
      { id: 7, name: "Pollo Entero", price: 15900, category: "Carnes", image: "/placeholder.svg?height=80&width=80" },
      {
        id: 8,
        name: "Carne de Res (Lomo)",
        price: 28500,
        category: "Carnes",
        image: "/placeholder.svg?height=80&width=80",
      },
    ]

    setProducts(availableProducts)
    setFilteredProducts(availableProducts)
  }, [])

  // Filtrar productos según la búsqueda
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredProducts(filtered)
    }
  }, [searchQuery, products])

  // Calcular el total del carrito
  const cartTotal = cartItems.reduce((total, item) => {
    return total + item.product.price * item.quantity
  }, 0)

  // Formatear precio en pesos colombianos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Agregar producto al carrito
  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === product.id)

      if (existingItem) {
        // Si el producto ya está en el carrito, aumentar la cantidad
        return prevItems.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      } else {
        // Si no está en el carrito, agregarlo con cantidad 1
        return [...prevItems, { product, quantity: 1 }]
      }
    })
  }

  // Actualizar cantidad de un producto en el carrito
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Si la cantidad es 0 o menos, eliminar el producto del carrito
      setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId))
    } else {
      // Actualizar la cantidad
      setCartItems((prevItems) =>
        prevItems.map((item) => (item.product.id === productId ? { ...item, quantity: newQuantity } : item)),
      )
    }
  }

  // Eliminar producto del carrito
  const removeFromCart = (productId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId))
  }

  // Procesar la venta
  const processCheckout = () => {
    if (cartItems.length === 0) {
      alert("El carrito está vacío")
      return
    }

    setIsProcessing(true)

    // Simulamos el procesamiento de la venta
    setTimeout(() => {
      // En un caso real, aquí enviarías los datos al backend

      // Guardar la venta en localStorage para el historial
      const sale = {
        id: crypto.randomUUID(),
        items: cartItems,
        total: cartTotal,
        date: new Date().toISOString(),
      }

      const storedSales = localStorage.getItem("dailySales")
      const sales = storedSales ? JSON.parse(storedSales) : []
      sales.push(sale)
      localStorage.setItem("dailySales", JSON.stringify(sales))

      // Limpiar carrito y redirigir
      setCartItems([])
      setIsProcessing(false)

      alert("¡Venta registrada con éxito!")
      router.push("/sales")
    }, 1500)
  }

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top has-bottom-nav">
      <div className="bg-white p-4 flex items-center">
        <Link href="/home" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Registrar Venta</h1>
      </div>

      <div className="container max-w-md mx-auto p-4 space-y-4">
        {/* Carrito de compras */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Carrito de Compras
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cartItems.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">No hay productos en el carrito</div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.image || "/placeholder.svg"}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.product.price)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full p-0"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full p-0"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-right w-20 font-medium">{formatPrice(item.product.price * item.quantity)}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-0 text-red-500"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Separator className="my-4" />

                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>

                <Button
                  className="w-full h-12 bg-primary hover:bg-primary-dark"
                  onClick={processCheckout}
                  disabled={isProcessing || cartItems.length === 0}
                >
                  {isProcessing ? "Procesando..." : "Finalizar Venta"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Buscador de productos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Agregar Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="search-products">Buscar productos</Label>
                <Input
                  id="search-products"
                  placeholder="Nombre o categoría..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-input-bg border-0"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => addToCart(product)}
                  >
                    <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                    <div className="font-medium">{formatPrice(product.price)}</div>
                    <Button variant="ghost" size="icon" className="ml-2 h-8 w-8 p-0 text-primary">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </main>
  )
}

