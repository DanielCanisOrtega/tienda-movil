"use client"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BarChart } from "@/components/bar-chart"
import { LineChart } from "@/components/line-chart"
import { SalesList } from "@/components/sales-list"

// Interfaces
interface Sale {
  id: string
  items: {
    product: {
      id: number
      name: string
      price: number
      category: string
    }
    quantity: number
  }[]
  total: number
  date: Date
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("daily")
  const [salesData, setSalesData] = useState<Sale[]>([])

  // Generar datos de ejemplo para las gráficas
  useEffect(() => {
    // Intentar cargar ventas reales del localStorage
    const storedSales = localStorage.getItem("dailySales")

    if (storedSales) {
      // Convertir las fechas de string a Date
      const parsedSales = JSON.parse(storedSales).map((sale: any) => ({
        ...sale,
        date: new Date(sale.date),
      }))
      setSalesData(parsedSales)
    } else {
      // Generar datos de ejemplo si no hay ventas reales
      const exampleSales: Sale[] = generateExampleSales()
      setSalesData(exampleSales)
    }
  }, [])

  // Función para generar datos de ejemplo
  const generateExampleSales = (): Sale[] => {
    const sales: Sale[] = []
    const products = [
      { id: 1, name: "Manzana Roja", price: 4500, category: "Frutas" },
      { id: 2, name: "Banano", price: 3200, category: "Frutas" },
      { id: 3, name: "Tomate", price: 4200, category: "Verduras" },
      { id: 4, name: "Cebolla", price: 3800, category: "Verduras" },
      { id: 5, name: "Leche", price: 4800, category: "Lácteos" },
      { id: 6, name: "Queso", price: 12500, category: "Lácteos" },
      { id: 7, name: "Pollo", price: 15900, category: "Carnes" },
      { id: 8, name: "Carne", price: 28500, category: "Carnes" },
    ]

    // Generar ventas para los últimos 30 días
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)

      // Generar entre 1 y 5 ventas por día
      const salesPerDay = Math.floor(Math.random() * 5) + 1

      for (let j = 0; j < salesPerDay; j++) {
        const items = []
        // Generar entre 1 y 4 productos por venta
        const itemsCount = Math.floor(Math.random() * 4) + 1

        for (let k = 0; k < itemsCount; k++) {
          const product = products[Math.floor(Math.random() * products.length)]
          const quantity = Math.floor(Math.random() * 5) + 1

          items.push({
            product,
            quantity,
          })
        }

        const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

        sales.push({
          id: `sale-${i}-${j}`,
          items,
          total,
          date: new Date(date),
        })
      }
    }

    return sales
  }

  // Filtrar ventas según el período seleccionado
  const getFilteredSales = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Domingo como inicio de semana

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    switch (activeTab) {
      case "daily":
        return salesData.filter((sale) => {
          const saleDate = new Date(sale.date)
          return saleDate >= today
        })
      case "weekly":
        return salesData.filter((sale) => {
          const saleDate = new Date(sale.date)
          return saleDate >= startOfWeek
        })
      case "monthly":
        return salesData.filter((sale) => {
          const saleDate = new Date(sale.date)
          return saleDate >= startOfMonth
        })
      default:
        return salesData
    }
  }

  // Calcular total de ventas
  const calculateTotal = (sales: Sale[]) => {
    return sales.reduce((sum, sale) => sum + sale.total, 0)
  }

  // Preparar datos para la gráfica de barras (ventas por día)
  const prepareBarChartData = () => {
    const filteredSales = getFilteredSales()
    const salesByDay = new Map<string, number>()

    // Inicializar días según el período seleccionado
    if (activeTab === "daily") {
      // Para vista diaria, mostrar ventas por hora
      for (let i = 0; i < 24; i++) {
        const hour = i < 10 ? `0${i}:00` : `${i}:00`
        salesByDay.set(hour, 0)
      }

      // Sumar ventas por hora
      filteredSales.forEach((sale) => {
        const hour = new Date(sale.date).getHours()
        const hourKey = hour < 10 ? `0${hour}:00` : `${hour}:00`
        salesByDay.set(hourKey, (salesByDay.get(hourKey) || 0) + sale.total)
      })
    } else if (activeTab === "weekly") {
      // Para vista semanal, mostrar ventas por día de la semana
      const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
      days.forEach((day) => salesByDay.set(day, 0))

      // Sumar ventas por día de la semana
      filteredSales.forEach((sale) => {
        const day = days[new Date(sale.date).getDay()]
        salesByDay.set(day, (salesByDay.get(day) || 0) + sale.total)
      })
    } else {
      // Para vista mensual, mostrar ventas por día del mes
      const today = new Date()
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()

      for (let i = 1; i <= daysInMonth; i++) {
        salesByDay.set(`${i}`, 0)
      }

      // Sumar ventas por día del mes
      filteredSales.forEach((sale) => {
        const day = new Date(sale.date).getDate().toString()
        salesByDay.set(day, (salesByDay.get(day) || 0) + sale.total)
      })
    }

    // Convertir Map a array para la gráfica
    return Array.from(salesByDay).map(([name, value]) => ({ name, value }))
  }

  // Preparar datos para la gráfica de líneas (tendencia)
  const prepareLineChartData = () => {
    const filteredSales = getFilteredSales()
    const salesByDay = new Map<string, number>()

    if (activeTab === "daily") {
      // Para vista diaria, agrupar por hora
      for (let i = 0; i < 24; i++) {
        const hour = i < 10 ? `0${i}:00` : `${i}:00`
        salesByDay.set(hour, 0)
      }

      filteredSales.forEach((sale) => {
        const hour = new Date(sale.date).getHours()
        const hourKey = hour < 10 ? `0${hour}:00` : `${hour}:00`
        salesByDay.set(hourKey, (salesByDay.get(hourKey) || 0) + 1) // Contar número de ventas
      })
    } else if (activeTab === "weekly") {
      // Para vista semanal, agrupar por día
      const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
      days.forEach((day) => salesByDay.set(day, 0))

      filteredSales.forEach((sale) => {
        const day = days[new Date(sale.date).getDay()]
        salesByDay.set(day, (salesByDay.get(day) || 0) + 1)
      })
    } else {
      // Para vista mensual, agrupar por semana
      for (let i = 1; i <= 5; i++) {
        salesByDay.set(`Semana ${i}`, 0)
      }

      filteredSales.forEach((sale) => {
        const date = new Date(sale.date)
        const weekOfMonth = Math.ceil(date.getDate() / 7)
        salesByDay.set(`Semana ${weekOfMonth}`, (salesByDay.get(`Semana ${weekOfMonth}`) || 0) + 1)
      })
    }

    return Array.from(salesByDay).map(([name, value]) => ({ name, value }))
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
  const totalSales = calculateTotal(filteredSales)
  const barChartData = prepareBarChartData()
  const lineChartData = prepareLineChartData()

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top">
      <div className="bg-primary text-white p-4 flex items-center">
        <Link href="/home" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Reportes</h1>
      </div>

      <div className="container max-w-md mx-auto p-4 space-y-4">
        <Tabs defaultValue="daily" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="daily">Diario</TabsTrigger>
            <TabsTrigger value="weekly">Semanal</TabsTrigger>
            <TabsTrigger value="monthly">Mensual</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            <ReportContent
              title="Reporte Diario"
              sales={filteredSales}
              total={totalSales}
              barChartData={barChartData}
              lineChartData={lineChartData}
              formatPrice={formatPrice}
              period="hoy"
            />
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <ReportContent
              title="Reporte Semanal"
              sales={filteredSales}
              total={totalSales}
              barChartData={barChartData}
              lineChartData={lineChartData}
              formatPrice={formatPrice}
              period="esta semana"
            />
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <ReportContent
              title="Reporte Mensual"
              sales={filteredSales}
              total={totalSales}
              barChartData={barChartData}
              lineChartData={lineChartData}
              formatPrice={formatPrice}
              period="este mes"
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

interface ReportContentProps {
  title: string
  sales: Sale[]
  total: number
  barChartData: { name: string; value: number }[]
  lineChartData: { name: string; value: number }[]
  formatPrice: (price: number) => string
  period: string
}

function ReportContent({ title, sales, total, barChartData, lineChartData, formatPrice, period }: ReportContentProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatPrice(total)}</div>
          <p className="text-sm text-text-secondary">Total de ventas {period}</p>

          <div className="mt-4">
            <h3 className="font-medium mb-2">Ventas por período</h3>
            <div className="h-64">
              <BarChart data={barChartData} />
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <h3 className="font-medium mb-2">Tendencia de ventas</h3>
            <div className="h-48">
              <LineChart data={lineChartData} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalle de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesList sales={sales} formatPrice={formatPrice} />
        </CardContent>
      </Card>
    </>
  )
}