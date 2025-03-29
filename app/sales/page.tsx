"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, Plus } from "lucide-react"
import Link from "next/link"
import BottomNavigation from "@/components/BottomNavigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  date: string
}

export default function SalesPage() {
  // Estado para las ventas
  const [sales, setSales] = useState<Sale[]>([])
  const [activeTab, setActiveTab] = useState("today")

  // Cargar ventas desde localStorage al iniciar
  useEffect(() => {
    const storedSales = localStorage.getItem("dailySales")
    if (storedSales) {
      setSales(JSON.parse(storedSales))
    }
  }, [])

  // Filtrar ventas según el período seleccionado
  const getFilteredSales = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Domingo como inicio de semana

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    switch (activeTab) {
      case "today":
        return sales.filter((sale) => {
          const saleDate = new Date(sale.date)
          return saleDate >= today
        })
      case "week":
        return sales.filter((sale) => {
          const saleDate = new Date(sale.date)
          return saleDate >= startOfWeek
        })
      case "month":
        return sales.filter((sale) => {
          const saleDate = new Date(sale.date)
          return saleDate >= startOfMonth
        })
      default:
        return sales
    }
  }

  // Calcular el total de ventas para el período seleccionado
  const calculateTotal = (filteredSales: Sale[]) => {
    return filteredSales.reduce((total, sale) => total + sale.total, 0)
  }

  // Formatear precio en pesos colombianos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const filteredSales = getFilteredSales()
  const periodTotal = calculateTotal(filteredSales)

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top has-bottom-nav">
      <div className="bg-white p-4 flex items-center">
        <Link href="/home" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Ventas</h1>
      </div>

      <div className="container max-w-md mx-auto p-4 space-y-4">
        <Link href="/cart">
          <Button className="w-full h-12 bg-primary hover:bg-primary-dark flex items-center justify-center">
            <Plus className="mr-2 h-5 w-5" />
            Nueva Venta
          </Button>
        </Link>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Resumen de Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="today" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="today">Hoy</TabsTrigger>
                <TabsTrigger value="week">Semana</TabsTrigger>
                <TabsTrigger value="month">Mes</TabsTrigger>
              </TabsList>
              <div className="mt-4">
                <div className="text-3xl font-bold">{formatPrice(periodTotal)}</div>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "today"
                    ? "Total de ventas hoy"
                    : activeTab === "week"
                      ? "Total de ventas esta semana"
                      : "Total de ventas este mes"}
                </p>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Historial de Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSales.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">No hay ventas registradas en este período</div>
            ) : (
              <div className="space-y-4">
                {filteredSales.map((sale) => (
                  <div key={sale.id} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm text-muted-foreground">
                        {new Date(sale.date).toLocaleString([], {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="font-bold">{formatPrice(sale.total)}</div>
                    </div>

                    <div className="space-y-1">
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </main>
  )
}

