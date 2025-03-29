"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import BottomNavigation from "@/components/BottomNavigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// Definición de interfaces
interface Product {
  id: number
  name: string
  price: number
  category: string
}

interface CartItem {
  product: Product
  quantity: number
}

interface Sale {
  id: string
  items: CartItem[]
  total: number
  date: Date
}

export default function SalesPage() {
  // Estado para los productos disponibles
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: "Manzana Roja", price: 4500, category: "Frutas" },
    { id: 2, name: "Banano", price: 3200, category: "Frutas" },
    { id: 3, name: "Tomate", price: 4200, category: "Verduras" },
    { id: 4, name: "Cebolla Cabezona", price: 3800, category: "Verduras" },
    { id: 5, name: "Leche Entera", price: 4800, category: "Lácteos" },
    { id: 6, name: "Queso Campesino", price: 12500, category: "Lácteos" },
    { id: 7, name: "Pollo Entero", price: 15900, category: "Carnes" },
    { id: 8, name: "Carne de Res (Lomo)", price: 28500, category: "Carnes" },
  ])

  // Estado para los items en el carrito
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { product: products[0], quantity: 2 },
    { product: products[2], quantity: 1 },
    { product: products[4], quantity: 3 },
  ])

  // Estado para las ventas del día
  const [dailySales, setDailySales] = useState<Sale[]>([])

  // Cargar ventas del día desde localStorage al iniciar
  useEffect(() => {
    const storedSales = localStorage.getItem("dailySales")
    if (storedSales) {
      // Convertir las fechas de string a Date
      const parsedSales = JSON.parse(storedSales).map((sale: any) => ({
        ...sale,
        date: new Date(sale.date),
      }))
      setDailySales(parsedSales)
    }
  }, [])

  // Calcular el total del carrito
  const cartTotal = cartItems.reduce((total, item) => {
    return total + item.product.price * item.quantity
  }, 0)

  // Función para actualizar la cantidad de un producto en el carrito
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 0) return

    setCartItems((prevItems) =>
      prevItems.map((item) => (item.product.id === productId ? { ...item, quantity: newQuantity } : item)),
    )
  }

  // Función para confirmar la venta
  const confirmSale = () => {
    if (cartItems.length === 0) {
      alert("No hay productos en el carrito")
      return
    }

    // Crear nueva venta
    const newSale: Sale = {
      id: crypto.randomUUID(),
      items: [...cartItems],
      total: cartTotal,
      date: new Date(),
    }

    // Actualizar ventas del día
    const updatedSales = [...dailySales, newSale]
    setDailySales(updatedSales)

    // Guardar en localStorage
    localStorage.setItem("dailySales", JSON.stringify(updatedSales))

    // Limpiar carrito
    setCartItems([])

    alert("Venta confirmada con éxito")
  }

  // Función para cancelar la venta
  const cancelSale = () => {
    if (confirm("¿Estás seguro de que deseas cancelar la venta?")) {
      setCartItems([])
    }
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
      <div className="bg-white p-4 flex items-center">
        <Link href="/home" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Ventas</h1>
      </div>

      <div className="container max-w-md mx-auto p-4 space-y-4">
        {/* Sección de Venta Actual */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Venta Actual</CardTitle>
          </CardHeader>
          <CardContent>
            {cartItems.length === 0 ? (
              <div className="text-center py-4 text-text-secondary">No hay productos en el carrito</div>
            ) : (
              <>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-text-secondary">
                          {item.product.category} • {formatPrice(item.product.price)}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 rounded-md p-0"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="mx-3 text-base">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 rounded-md p-0"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <div className="w-24 text-right font-medium">
                        {formatPrice(item.product.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>

                <div className="flex mt-4">
                  <Button
                    className="flex-1 h-12 text-base bg-danger hover:bg-danger/90 text-white android-ripple"
                    onClick={cancelSale}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 h-12 text-base ml-3 bg-primary hover:bg-primary-dark android-ripple"
                    onClick={confirmSale}
                  >
                    Confirmar
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sección de Ventas del Día */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Ventas del Día</CardTitle>
          </CardHeader>
          <CardContent>
            {dailySales.length === 0 ? (
              <div className="text-center py-4 text-text-secondary">No hay ventas registradas hoy</div>
            ) : (
              <div className="space-y-4">
                {dailySales.map((sale) => (
                  <div key={sale.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm text-text-secondary">
                        {sale.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div className="font-bold">{formatPrice(sale.total)}</div>
                    </div>

                    <div className="space-y-2">
                      {sale.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <div>
                            {item.quantity} x {item.product.name}
                          </div>
                          <div>{formatPrice(item.product.price * item.quantity)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between items-center font-bold">
                  <span>Total del día:</span>
                  <span>{formatPrice(dailySales.reduce((total, sale) => total + sale.total, 0))}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </main>
  )
}

