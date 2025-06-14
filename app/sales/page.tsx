"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, Plus } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getProductsByStore } from "@/services/product-service" // Importar el servicio de productos

// Definición de interfaces
interface Product {
  id: number
  nombre: string
  precio: number
  categoria: string
  imagen?: string
  cantidad?: number
  disponible?: boolean
  tienda?: number
  descripcion?: string
  codigo_barras?: string
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
  storeId: string
}

// Reemplazar la función generateSampleSales con esta nueva implementación
const generateSampleSales = async (storeId: string): Promise<Sale[]> => {
  try {
    // Obtener productos reales desde el endpoint
    const fetchedProducts = await getProductsByStore(storeId)

    // Si no hay productos, devolver un array vacío
    if (!fetchedProducts || fetchedProducts.length === 0) {
      return []
    }

    const sales: Sale[] = []
    const today = new Date()

    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)

      // Generate between 1 and 5 sales per day
      const salesPerDay = Math.floor(Math.random() * 5) + 1

      for (let j = 0; j < salesPerDay; j++) {
        const items: CartItem[] = []
        // Generate between 1 and 4 products per sale
        const itemsCount = Math.floor(Math.random() * 4) + 1

        for (let k = 0; k < itemsCount; k++) {
          const rawProduct = fetchedProducts[Math.floor(Math.random() * fetchedProducts.length)]
          const quantity = Math.floor(Math.random() * 5) + 1

          // Adaptar el producto al formato esperado por CartItem
          const product = {
            id: rawProduct.id || 0,
            nombre: rawProduct.nombre,
            precio: rawProduct.precio,
            categoria: rawProduct.categoria,
            imagen: rawProduct.imagen,
            cantidad: rawProduct.cantidad,
            disponible: rawProduct.cantidad > 0,
            tienda: Number(rawProduct.tienda_id),
            descripcion: rawProduct.descripcion || "",
            codigo_barras: rawProduct.codigo_barras || "",
          }

          items.push({
            product,
            quantity,
          })
        }

        const total = items.reduce((sum, item) => sum + item.product.precio * item.quantity, 0)

        sales.push({
          id: `sample-sale-${i}-${j}`,
          items,
          total,
          date: date.toISOString(),
          storeId,
        })
      }
    }

    return sales
  } catch (error) {
    console.error("Error al generar ventas de ejemplo:", error)
    return []
  }
}

export default function SalesPage() {
  const { toast } = useToast()
  // Estado para las ventas
  const [sales, setSales] = useState<Sale[]>([])
  const [activeTab, setActiveTab] = useState("today")
  const [storeId, setStoreId] = useState<string | null>(null)

  // Modificar el useEffect que carga las ventas
  useEffect(() => {
    const selectedStoreId = localStorage.getItem("selectedStoreId")
    if (selectedStoreId) {
      setStoreId(selectedStoreId)
    }

    // Intentar cargar ventas del localStorage
    const storedSales = localStorage.getItem("sales")

    const loadSales = async () => {
      if (storedSales) {
        const parsedSales = JSON.parse(storedSales)
        setSales(parsedSales)
      } else {
        // Si no hay ventas guardadas, generar datos de ejemplo con productos reales
        const sampleSales = await generateSampleSales(selectedStoreId || "1")
        setSales(sampleSales)
        // Guardar en localStorage para futuras visitas
        localStorage.setItem("sales", JSON.stringify(sampleSales))
      }
    }

    loadSales()
  }, [])

  // Filtrar ventas según el período seleccionado
  const getFilteredSales = () => {
    if (!storeId) return []

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Domingo como inicio de semana

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Primero filtrar por tienda
    const storeSales = sales.filter((sale) => sale.storeId === storeId)

    switch (activeTab) {
      case "today":
        return storeSales.filter((sale) => {
          const saleDate = new Date(sale.date)
          return saleDate >= today
        })
      case "week":
        return storeSales.filter((sale) => {
          const saleDate = new Date(sale.date)
          return saleDate >= startOfWeek
        })
      case "month":
        return storeSales.filter((sale) => {
          const saleDate = new Date(sale.date)
          return saleDate >= startOfMonth
        })
      default:
        return storeSales
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
    <main className="flex min-h-screen flex-col bg-background android-safe-top">
      <div className="bg-white dark:bg-gray-800 p-4 flex items-center">
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
                        <div key={index} className="flex flex-col">
                          <div className="flex justify-between text-sm">
                            <div>
                              {item.quantity} x {item.product.nombre}
                            </div>
                            <div>{formatPrice(item.product.precio * item.quantity)}</div>
                          </div>
                          {item.product.codigo_barras && item.product.codigo_barras.trim() !== "" && (
                            <div className="text-xs text-gray-500">Código: {item.product.codigo_barras}</div>
                          )}
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
    </main>
  )
}
