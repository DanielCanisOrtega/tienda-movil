"use client"
import { ChevronLeft } from "lucide-react"
import React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BarChart } from "@/components/bar-chart"
import { LineChart } from "@/components/line-chart"
import { SalesList } from "@/components/sales-list"
import { ExpensesList } from "@/components/expenses-list"
import type { Expense } from "../expenses/page"

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
  date: Date | string
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("daily")
  const [salesData, setSalesData] = useState<Sale[]>([])
  const [expensesData, setExpensesData] = useState<Expense[]>([])
  const [reportView, setReportView] = useState<"sales" | "expenses" | "balance">("sales")

  // Generar datos de ejemplo para las gráficas
  useEffect(() => {
    // Cargar ventas desde localStorage
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

    // Cargar gastos desde localStorage
    const storedExpenses = localStorage.getItem("expenses")
    if (storedExpenses) {
      try {
        const parsedExpenses = JSON.parse(storedExpenses)
        console.log("Gastos cargados:", parsedExpenses.length)
        setExpensesData(parsedExpenses)
      } catch (error) {
        console.error("Error al cargar gastos:", error)
        setExpensesData([])
      }
    } else {
      console.log("No hay gastos almacenados")
      setExpensesData([])
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

  // Filtrar gastos según el período seleccionado
  const getFilteredExpenses = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Domingo como inicio de semana

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Si no hay gastos, devolver un array vacío
    if (!expensesData || expensesData.length === 0) {
      return []
    }

    // Imprimir para depuración
    console.log("Total de gastos antes de filtrar:", expensesData.length)

    switch (activeTab) {
      case "daily":
        return expensesData.filter((expense) => {
          const expenseDate = new Date(expense.date)
          const result = expenseDate >= today
          return result
        })
      case "weekly":
        return expensesData.filter((expense) => {
          const expenseDate = new Date(expense.date)
          return expenseDate >= startOfWeek
        })
      case "monthly":
        return expensesData.filter((expense) => {
          const expenseDate = new Date(expense.date)
          return expenseDate >= startOfMonth
        })
      default:
        return expensesData
    }
  }

  // Calcular total de ventas
  const calculateTotalSales = (sales: Sale[]) => {
    return sales.reduce((sum, sale) => sum + sale.total, 0)
  }

  // Calcular total de gastos
  const calculateTotalExpenses = (expenses: Expense[]) => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0)
  }

  // Preparar datos para la gráfica de barras (ventas por día)
  const prepareSalesBarChartData = () => {
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

  // Preparar datos para la gráfica de barras (gastos por día)
  const prepareExpensesBarChartData = () => {
    const filteredExpenses = getFilteredExpenses()
    const expensesByDay = new Map<string, number>()

    // Inicializar días según el período seleccionado
    if (activeTab === "daily") {
      // Para vista diaria, mostrar gastos por hora
      for (let i = 0; i < 24; i++) {
        const hour = i < 10 ? `0${i}:00` : `${i}:00`
        expensesByDay.set(hour, 0)
      }

      // Sumar gastos por hora
      filteredExpenses.forEach((expense) => {
        const date = new Date(expense.date)
        const hour = date.getHours()
        const hourKey = hour < 10 ? `0${hour}:00` : `${hour}:00`
        expensesByDay.set(hourKey, (expensesByDay.get(hourKey) || 0) + expense.amount)
      })
    } else if (activeTab === "weekly") {
      // Para vista semanal, mostrar gastos por día de la semana
      const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
      days.forEach((day) => expensesByDay.set(day, 0))

      // Sumar gastos por día de la semana
      filteredExpenses.forEach((expense) => {
        const date = new Date(expense.date)
        const day = days[date.getDay()]
        expensesByDay.set(day, (expensesByDay.get(day) || 0) + expense.amount)
      })
    } else {
      // Para vista mensual, mostrar gastos por día del mes
      const today = new Date()
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()

      for (let i = 1; i <= daysInMonth; i++) {
        expensesByDay.set(`${i}`, 0)
      }

      // Sumar gastos por día del mes
      filteredExpenses.forEach((expense) => {
        const date = new Date(expense.date)
        const day = date.getDate().toString()
        expensesByDay.set(day, (expensesByDay.get(day) || 0) + expense.amount)
      })
    }

    // Convertir Map a array para la gráfica
    return Array.from(expensesByDay).map(([name, value]) => ({ name, value }))
  }

  // Preparar datos para la gráfica de balance (ingresos vs gastos)
  const prepareBalanceBarChartData = () => {
    const salesData = prepareSalesBarChartData()
    const expensesData = prepareExpensesBarChartData()

    // Combinar los datos para mostrar ingresos y gastos juntos
    const combinedData: { name: string; ingresos: number; gastos: number }[] = []

    // Crear un conjunto de todas las etiquetas (nombres)
    const allNames = new Set([...salesData.map((item) => item.name), ...expensesData.map((item) => item.name)])

    // Para cada nombre, buscar el valor correspondiente en ventas y gastos
    Array.from(allNames).forEach((name) => {
      const salesItem = salesData.find((item) => item.name === name)
      const expensesItem = expensesData.find((item) => item.name === name)

      combinedData.push({
        name: name,
        ingresos: salesItem ? salesItem.value : 0,
        gastos: expensesItem ? expensesItem.value : 0,
      })
    })

    return combinedData
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
  const filteredExpenses = getFilteredExpenses()
  const totalSales = calculateTotalSales(filteredSales)
  const totalExpenses = calculateTotalExpenses(filteredExpenses)
  const balance = totalSales - totalExpenses

  const salesBarChartData = prepareSalesBarChartData()
  const expensesBarChartData = prepareExpensesBarChartData()
  const balanceBarChartData = prepareBalanceBarChartData()
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

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Resumen Financiero</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-secondary">Ingresos</p>
                  <p className="text-xl font-bold text-primary">{formatPrice(totalSales)}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Gastos</p>
                  <p className="text-xl font-bold text-danger">{formatPrice(totalExpenses)}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div>
                <p className="text-sm text-text-secondary">Balance</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? "text-primary" : "text-danger"}`}>
                  {formatPrice(balance)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="sales" value={reportView} onValueChange={(value) => setReportView(value as any)}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="sales">Ventas</TabsTrigger>
              <TabsTrigger value="expenses">Gastos</TabsTrigger>
              <TabsTrigger value="balance">Balance</TabsTrigger>
            </TabsList>

            <TabsContent value="sales" className="space-y-4">
              <ReportContent
                title="Reporte de Ventas"
                sales={filteredSales}
                expenses={[]}
                total={totalSales}
                barChartData={salesBarChartData}
                lineChartData={lineChartData}
                formatPrice={formatPrice}
                period={activeTab === "daily" ? "hoy" : activeTab === "weekly" ? "esta semana" : "este mes"}
                type="sales"
              />
            </TabsContent>

            <TabsContent value="expenses" className="space-y-4">
              <ReportContent
                title="Reporte de Gastos"
                sales={[]}
                expenses={filteredExpenses}
                total={totalExpenses}
                barChartData={expensesBarChartData}
                lineChartData={[]}
                formatPrice={formatPrice}
                period={activeTab === "daily" ? "hoy" : activeTab === "weekly" ? "esta semana" : "este mes"}
                type="expenses"
              />
            </TabsContent>

            <TabsContent value="balance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Balance Financiero</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatPrice(balance)}</div>
                  <p className="text-sm text-text-secondary">
                    Balance{" "}
                    {activeTab === "daily" ? "de hoy" : activeTab === "weekly" ? "de esta semana" : "de este mes"}
                  </p>

                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Ingresos vs Gastos</h3>
                    <div className="h-64">
                      <BalanceChart data={balanceBarChartData} />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Detalle de Ventas</h3>
                      <SalesList sales={filteredSales.slice(0, 3)} formatPrice={formatPrice} />
                      {filteredSales.length > 3 && (
                        <Link href="/sales" className="text-sm text-primary block mt-2">
                          Ver todas las ventas
                        </Link>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Detalle de Gastos</h3>
                      <ExpensesList expenses={filteredExpenses.slice(0, 3)} formatPrice={formatPrice} />
                      {filteredExpenses.length > 3 && (
                        <Link href="/expenses" className="text-sm text-primary block mt-2">
                          Ver todos los gastos
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Tabs>
      </div>
    </main>
  )
}

interface ReportContentProps {
  title: string
  sales: Sale[]
  expenses: Expense[]
  total: number
  barChartData: { name: string; value: number }[]
  lineChartData: { name: string; value: number }[]
  formatPrice: (price: number) => string
  period: string
  type: "sales" | "expenses"
}

function ReportContent({
  title,
  sales,
  expenses,
  total,
  barChartData,
  lineChartData,
  formatPrice,
  period,
  type,
}: ReportContentProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatPrice(total)}</div>
          <p className="text-sm text-text-secondary">
            Total de {type === "sales" ? "ventas" : "gastos"} {period}
          </p>

          <div className="mt-4">
            <h3 className="font-medium mb-2">{type === "sales" ? "Ventas" : "Gastos"} por período</h3>
            <div className="h-64">
              <BarChart data={barChartData} />
            </div>
          </div>

          {type === "sales" && lineChartData.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="font-medium mb-2">Tendencia de ventas</h3>
                <div className="h-48">
                  <LineChart data={lineChartData} />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{type === "sales" ? "Detalle de Ventas" : "Detalle de Gastos"}</CardTitle>
        </CardHeader>
        <CardContent>
          {type === "sales" ? (
            <SalesList sales={sales} formatPrice={formatPrice} />
          ) : (
            <ExpensesList expenses={expenses} formatPrice={formatPrice} />
          )}
        </CardContent>
      </Card>
    </>
  )
}

function BalanceChart({ data }: { data: { name: string; ingresos: number; gastos: number }[] }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Configuración
    const padding = { top: 20, right: 20, bottom: 40, left: 60 }
    const chartWidth = canvas.width - padding.left - padding.right
    const chartHeight = canvas.height - padding.top - padding.bottom

    // Encontrar el valor máximo para escalar
    const maxValue = Math.max(...data.map((item) => Math.max(item.ingresos, item.gastos)), 1)

    // Dibujar ejes
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, canvas.height - padding.bottom)
    ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom)
    ctx.strokeStyle = "#ccc"
    ctx.stroke()

    // Dibujar barras
    const barWidth = (chartWidth / data.length) * 0.35
    const groupWidth = chartWidth / data.length

    data.forEach((item, index) => {
      const x = padding.left + index * groupWidth + groupWidth * 0.15

      // Barra de ingresos
      const incomesHeight = (item.ingresos / maxValue) * chartHeight
      const incomesY = canvas.height - padding.bottom - incomesHeight
      ctx.fillStyle = "#29d890"
      ctx.fillRect(x, incomesY, barWidth, incomesHeight)

      // Barra de gastos
      const expensesHeight = (item.gastos / maxValue) * chartHeight
      const expensesY = canvas.height - padding.bottom - expensesHeight
      ctx.fillStyle = "#ff1515"
      ctx.fillRect(x + barWidth + 2, expensesY, barWidth, expensesHeight)

      // Dibujar etiqueta
      ctx.fillStyle = "#798184"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(item.name, x + barWidth + 1, canvas.height - padding.bottom + 15)

      // Dibujar valores
      if (item.ingresos > 0) {
        ctx.fillStyle = "#0e0e0e"
        ctx.font = "10px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(
          new Intl.NumberFormat("es-CO", { notation: "compact", compactDisplay: "short" }).format(item.ingresos),
          x + barWidth / 2,
          incomesY - 5,
        )
      }

      if (item.gastos > 0) {
        ctx.fillStyle = "#0e0e0e"
        ctx.font = "10px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(
          new Intl.NumberFormat("es-CO", { notation: "compact", compactDisplay: "short" }).format(item.gastos),
          x + barWidth * 1.5 + 2,
          expensesY - 5,
        )
      }
    })

    // Leyenda
    const legendY = padding.top / 2

    // Ingresos
    ctx.fillStyle = "#29d890"
    ctx.fillRect(padding.left, legendY, 10, 10)
    ctx.fillStyle = "#0e0e0e"
    ctx.font = "10px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("Ingresos", padding.left + 15, legendY + 8)

    // Gastos
    ctx.fillStyle = "#ff1515"
    ctx.fillRect(padding.left + 80, legendY, 10, 10)
    ctx.fillStyle = "#0e0e0e"
    ctx.font = "10px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("Gastos", padding.left + 95, legendY + 8)
  }, [data])

  return <canvas ref={canvasRef} width={400} height={300} className="w-full h-full" />
}

