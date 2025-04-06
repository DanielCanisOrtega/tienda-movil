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
import { useToast } from "@/hooks/use-toast"

// Actualizar la interfaz Product para que coincida con la estructura de datos
interface Product {
  id: number
  nombre: string
  precio: number
  descripcion: string
  categoria: string
  imagen?: string
  cantidad: number
  disponible: boolean
  tienda: number
}

interface CartItem {
  product: Product
  quantity: number
}

export default function CartPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [storeId, setStoreId] = useState<string | null>(null)

  // Modificar la función para cargar productos correctamente
  useEffect(() => {
    // Obtener el ID de la tienda seleccionada
    const selectedStoreId = localStorage.getItem("selectedStoreId")
    if (selectedStoreId) {
      setStoreId(selectedStoreId)

      // Cargar productos de la tienda
      const storedProducts = localStorage.getItem(`store_${selectedStoreId}_products`)

      if (storedProducts) {
        const parsedProducts = JSON.parse(storedProducts)
        // Solo mostrar productos disponibles
        const availableProducts = parsedProducts.filter((p: Product) => p.disponible && p.cantidad > 0)
        setProducts(availableProducts)
        setFilteredProducts(availableProducts)
      } else {
        // Si no hay productos en localStorage, cargar productos de ejemplo
        const sampleProducts = generateSampleProducts(selectedStoreId)
        setProducts(sampleProducts)
        setFilteredProducts(sampleProducts)
        // Guardar en localStorage para futuras visitas
        localStorage.setItem(`store_${selectedStoreId}_products`, JSON.stringify(sampleProducts))
      }

      // Cargar carrito si existe
      const storedCart = localStorage.getItem(`store_${selectedStoreId}_cart`)
      if (storedCart) {
        setCartItems(JSON.parse(storedCart))
      }
    } else {
      // Si no hay tienda seleccionada, usar ID predeterminado
      const defaultStoreId = "1"
      setStoreId(defaultStoreId)
      localStorage.setItem("selectedStoreId", defaultStoreId)

      // Cargar productos de ejemplo
      const sampleProducts = generateSampleProducts(defaultStoreId)
      setProducts(sampleProducts)
      setFilteredProducts(sampleProducts)
      // Guardar en localStorage para futuras visitas
      localStorage.setItem(`store_${defaultStoreId}_products`, JSON.stringify(sampleProducts))
    }
  }, [router])

  // Añadir función para generar productos de ejemplo
  const generateSampleProducts = (storeId: string): Product[] => {
    return [
      {
        id: 1,
        nombre: "Manzana Roja",
        precio: 2500,
        descripcion: "Manzana roja fresca",
        categoria: "Frutas",
        imagen: "/placeholder.svg?height=200&width=200",
        cantidad: 50,
        disponible: true,
        tienda: Number(storeId),
      },
      {
        id: 2,
        nombre: "Banano",
        precio: 1800,
        descripcion: "Banano maduro",
        categoria: "Frutas",
        imagen: "/placeholder.svg?height=200&width=200",
        cantidad: 80,
        disponible: true,
        tienda: Number(storeId),
      },
      {
        id: 3,
        nombre: "Naranja",
        precio: 2000,
        descripcion: "Naranja jugosa",
        categoria: "Frutas",
        imagen: "/placeholder.svg?height=200&width=200",
        cantidad: 60,
        disponible: true,
        tienda: Number(storeId),
      },
      {
        id: 7,
        nombre: "Tomate",
        precio: 3000,
        descripcion: "Tomate rojo maduro",
        categoria: "Verduras",
        imagen: "/placeholder.svg?height=200&width=200",
        cantidad: 45,
        disponible: true,
        tienda: Number(storeId),
      },
      {
        id: 13,
        nombre: "Leche Entera",
        precio: 4500,
        descripcion: "Leche entera 1L",
        categoria: "Lácteos",
        imagen: "/placeholder.svg?height=200&width=200",
        cantidad: 40,
        disponible: true,
        tienda: Number(storeId),
      },
      {
        id: 14,
        nombre: "Queso Campesino",
        precio: 12000,
        descripcion: "Queso campesino 500g",
        categoria: "Lácteos",
        imagen: "/placeholder.svg?height=200&width=200",
        cantidad: 25,
        disponible: true,
        tienda: Number(storeId),
      },
    ]
  }

  // Filtrar productos según la búsqueda
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(
        (product) =>
          product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.categoria.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.descripcion.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredProducts(filtered)
    }
  }, [searchQuery, products])

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    if (storeId && cartItems.length > 0) {
      localStorage.setItem(`store_${storeId}_cart`, JSON.stringify(cartItems))
    }
  }, [cartItems, storeId])

  // Calcular el total del carrito
  const cartTotal = cartItems.reduce((total, item) => {
    return total + item.product.precio * item.quantity
  }, 0)

  // Formatear precio en pesos colombianos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Modificar la función addToCart para manejar la estructura de productos correcta
  const addToCart = (product: Product) => {
    // Verificar si hay suficiente stock
    const existingItem = cartItems.find((item) => item.product.id === product.id)
    const currentQuantity = existingItem ? existingItem.quantity : 0

    if (currentQuantity >= product.cantidad) {
      toast({
        title: "Stock insuficiente",
        description: `No hay suficiente stock de ${product.nombre}. Solo quedan ${product.cantidad} unidades.`,
        variant: "destructive",
      })
      return
    }

    setCartItems((prevItems) => {
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

    toast({
      title: "Producto añadido",
      description: `${product.nombre} añadido al carrito`,
      variant: "success",
    })
  }

  // Actualizar cantidad de un producto en el carrito
  const updateQuantity = (productId: number, newQuantity: number) => {
    const item = cartItems.find((item) => item.product.id === productId)

    if (item && newQuantity > item.product.cantidad) {
      toast({
        title: "Stock insuficiente",
        description: `No hay suficiente stock de ${item.product.nombre}. Solo quedan ${item.product.cantidad} unidades.`,
        variant: "destructive",
      })
      return
    }

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

    toast({
      title: "Producto eliminado",
      description: "Producto eliminado del carrito",
      variant: "success",
    })
  }

  // Procesar la venta
  const processCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "No hay productos en el carrito",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    // Update inventory
    if (storeId) {
      const storedProducts = localStorage.getItem(`store_${storeId}_products`)
      if (storedProducts) {
        let products = JSON.parse(storedProducts)

        // Update quantity of each product
        cartItems.forEach((item) => {
          products = products.map((p: Product) => {
            if (p.id === item.product.id) {
              const newQuantity = p.cantidad - item.quantity
              return {
                ...p,
                cantidad: newQuantity,
                disponible: newQuantity > 0,
              }
            }
            return p
          })
        })

        // Save updated products
        localStorage.setItem(`store_${storeId}_products`, JSON.stringify(products))
      }

      // Save the sale in localStorage for history
      const sale = {
        id: crypto.randomUUID(),
        items: cartItems,
        total: cartTotal,
        date: new Date().toISOString(),
        storeId,
      }

      const storedSales = localStorage.getItem("sales")
      const sales = storedSales ? JSON.parse(storedSales) : []
      sales.push(sale)
      localStorage.setItem("sales", JSON.stringify(sales))

      // Clear cart
      setCartItems([])
      localStorage.removeItem(`store_${storeId}_cart`)
    }

    setTimeout(() => {
      setIsProcessing(false)
      toast({
        title: "Venta registrada",
        description: "La venta ha sido registrada con éxito",
        variant: "success",
      })
      router.push("/sales")
    }, 1000)
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
                    <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                      {item.product.imagen ? (
                        <img
                          src={item.product.imagen || "/placeholder.svg"}
                          alt={item.product.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-xl text-gray-400">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{item.product.nombre}</h3>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.product.precio)}</p>
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
                    <div className="text-right w-20 font-medium">
                      {formatPrice(item.product.precio * item.quantity)}
                    </div>
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
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No se encontraron productos disponibles</div>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => addToCart(product)}
                    >
                      <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                        {product.imagen ? (
                          <img
                            src={product.imagen || "/placeholder.svg"}
                            alt={product.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-xl text-gray-400">📦</div>
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="font-medium">{product.nombre}</h3>
                        <p className="text-sm text-muted-foreground">{product.categoria}</p>
                      </div>
                      <div className="font-medium">{formatPrice(product.precio)}</div>
                      <Button variant="ghost" size="icon" className="ml-2 h-8 w-8 p-0 text-primary">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </main>
  )
}

