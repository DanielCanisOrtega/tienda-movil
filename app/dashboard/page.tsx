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
import { Badge } from "@/components/ui/badge"

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
  storeId?: string
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("daily")
  const [salesData, setSalesData] = useState<Sale[]>([])
  const [expensesData, setExpensesData] = useState<Expense[]>([])
  const [reportView, setReportView] = useState<"sales" | "expenses" | "balance">("sales")
  const [storeId, setStoreId] = useState<string | null>(null)

  // Load data from localStorage
  useEffect(() => {
    // Get the selected store ID
    const selectedStoreId = localStorage.getItem("selectedStoreId")
    if (selectedStoreId) {
      setStoreId(selectedStoreId)
    }

    // Load sales from localStorage
    const storedSales = localStorage.getItem("sales")
    if (storedSales) {
      try {
        // Convert dates from string to Date
        const parsedSales = JSON.parse(storedSales).map((sale: any) => ({
          ...sale,
          date: new Date(sale.date),
        }))
        setSalesData(parsedSales)
      } catch (error) {
        console.error("Error parsing sales data:", error)
        setSalesData([])
      }
    }

    // Load expenses from localStorage
    const storedExpenses = localStorage.getItem("expenses")
    if (storedExpenses) {
      try {
        const parsedExpenses = JSON.parse(storedExpenses)
        setExpensesData(parsedExpenses)
      } catch (error) {
        console.error("Error parsing expenses data:", error)
        setExpensesData([])
      }
    }
  }, [])

  // Función para convertir una fecha string a objeto Date
  const parseDate = (dateStr: string | Date): Date => {
    if (dateStr instanceof Date) {
      return new Date(dateStr)
    }

    // Si es string, intentar parsear
    if (dateStr.includes("T")) {
      // Formato ISO
      return new Date(dateStr)
    } else {
      // Formato YYYY-MM-DD
      const parts = dateStr.split("-")
      if (parts.length === 3) {
        return new Date(Number.parseInt(parts[0]), Number.parseInt(parts[1]) - 1, Number.parseInt(parts[2]))
      }
    }

    // Si no se puede parsear, devolver fecha actual
    return new Date()
  }

  // Filter sales by store ID
  const getFilteredSales = () => {
    if (!storeId) return []

    const storeSales = salesData.filter((sale) => {
      // Check if sale has storeId property and it matches the current storeId
      return !sale.storeId || sale.storeId === storeId
    })

    // Obtener la fecha actual en Colombia (UTC-5)
    const now = new Date()

    // Crear fecha de hoy a las 00:00:00
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

    // Calcular el inicio de la semana (domingo)
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    // Calcular el inicio del mes
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    return storeSales.filter((sale) => {
      // Convertir la fecha de la venta a un objeto Date
      const saleDate = parseDate(sale.date)

      // Resetear la hora a 00:00:00 para comparar solo fechas
      saleDate.setHours(0, 0, 0, 0)

      // Comparar según el período seleccionado
      switch (activeTab) {
        case "daily":
          // Para vista diaria, comparar si la fecha es igual a hoy
          return saleDate.toDateString() === today.toDateString()
        case "weekly":
          // Para vista semanal, verificar si la fecha es posterior o igual al inicio de la semana
          return saleDate >= startOfWeek
        case "monthly":
          // Para vista mensual, verificar si la fecha es posterior o igual al inicio del mes
          return saleDate >= startOfMonth
        default:
          return true
      }
    })
  }

  // Filter expenses by store ID
  const getFilteredExpenses = () => {
    if (!storeId || !expensesData.length) return []

    const storeExpenses = expensesData.filter((expense) => {
      // Check if expense has storeId property and it matches the current storeId
      return !expense.storeId || expense.storeId === storeId
    })

    // Obtener la fecha actual
    const now = new Date()

    // Crear fecha de hoy a las 00:00:00
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

    // Calcular el inicio de la semana (domingo)
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    // Calcular el inicio del mes
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    return storeExpenses.filter((expense) => {
      // Convertir la fecha del gasto a un objeto Date
      const expenseDate = parseDate(expense.date)

      // Resetear la hora a 00:00:00 para comparar solo fechas
      expenseDate.setHours(0, 0, 0, 0)

      // Comparar según el período seleccionado
      switch (activeTab) {
        case "daily":
          // Para vista diaria, comparar si la fecha es igual a hoy
          return expenseDate.toDateString() === today.toDateString()
        case "weekly":
          // Para vista semanal, verificar si la fecha es posterior o igual al inicio de la semana
          return expenseDate >= startOfWeek
        case "monthly":
          // Para vista mensual, verificar si la fecha es posterior o igual al inicio del mes
          return expenseDate >= startOfMonth
        default:
          return true
      }
    })
  }

  // Calculate total sales
  const calculateTotalSales = (sales: Sale[]) => {
    return sales.reduce((sum, sale) => sum + sale.total, 0)
  }

  // Calculate total expenses
  const calculateTotalExpenses = (expenses: Expense[]) => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0)
  }

  // Prepare data for bar chart (sales by day)
  const prepareSalesBarChartData = () => {
    const filteredSales = getFilteredSales()
    const salesByDay = new Map<string, number>()

    if (activeTab === "daily") {
      // For daily view, group by hour
      for (let i = 0; i < 24; i++) {
        const hour = i < 10 ? `0${i}:00` : `${i}:00`
        salesByDay.set(hour, 0)
      }

      // Sum sales by hour
      filteredSales.forEach((sale) => {
        const hour = new Date(sale.date).getHours()
        const hourKey = hour < 10 ? `0${hour}:00` : `${hour}:00`
        salesByDay.set(hourKey, (salesByDay.get(hourKey) || 0) + sale.total)
      })
    } else if (activeTab === "weekly") {
      // For weekly view, group by day of week
      const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
      days.forEach((day) => salesByDay.set(day, 0))

      // Sum sales by day of week
      filteredSales.forEach((sale) => {
        const day = days[new Date(sale.date).getDay()]
        salesByDay.set(day, (salesByDay.get(day) || 0) + sale.total)
      })
    } else {
      // For monthly view, group by day of month
      const today = new Date()
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()

      for (let i = 1; i <= daysInMonth; i++) {
        salesByDay.set(`${i}`, 0)
      }

      // Sum sales by day of month
      filteredSales.forEach((sale) => {
        const day = new Date(sale.date).getDate().toString()
        salesByDay.set(day, (salesByDay.get(day) || 0) + sale.total)
      })
    }

    // Convert Map to array for chart
    return Array.from(salesByDay).map(([name, value]) => ({ name, value }))
  }

  // Prepare data for bar chart (expenses by day)
  const prepareExpensesBarChartData = () => {
    const filteredExpenses = getFilteredExpenses()
    const expensesByDay = new Map<string, number>()

    if (activeTab === "daily") {
      // For daily view, group by hour
      for (let i = 0; i < 24; i++) {
        const hour = i < 10 ? `0${i}:00` : `${i}:00`
        expensesByDay.set(hour, 0)
      }

      // Sum expenses by hour
      filteredExpenses.forEach((expense) => {
        const date = parseDate(expense.date)
        const hour = date.getHours()
        const hourKey = hour < 10 ? `0${hour}:00` : `${hour}:00`
        expensesByDay.set(hourKey, (expensesByDay.get(hourKey) || 0) + expense.amount)
      })
    } else if (activeTab === "weekly") {
      // For weekly view, group by day of week
      const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
      days.forEach((day) => expensesByDay.set(day, 0))

      // Sum expenses by day of week
      filteredExpenses.forEach((expense) => {
        const date = parseDate(expense.date)
        const day = days[date.getDay()]
        expensesByDay.set(day, (expensesByDay.get(day) || 0) + expense.amount)
      })
    } else {
      // For monthly view, group by day of month
      const today = new Date()
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()

      for (let i = 1; i <= daysInMonth; i++) {
        expensesByDay.set(`${i}`, 0)
      }

      // Sum expenses by day of month
      filteredExpenses.forEach((expense) => {
        const date = parseDate(expense.date)
        const day = date.getDate().toString()
        expensesByDay.set(day, (expensesByDay.get(day) || 0) + expense.amount)
      })
    }

    // Convert Map to array for chart
    return Array.from(expensesByDay).map(([name, value]) => ({ name, value }))
  }

  // Prepare data for balance chart (income vs expenses)
  const prepareBalanceBarChartData = () => {
    const salesData = prepareSalesBarChartData()
    const expensesData = prepareExpensesBarChartData()

    // Combine data to show income and expenses together
    const combinedData: { name: string; ingresos: number; gastos: number }[] = []

    // Create a set of all labels (names)
    const allNames = new Set([...salesData.map((item) => item.name), ...expensesData.map((item) => item.name)])

    // For each name, find the corresponding value in sales and expenses
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

  // Prepare data for line chart (trend)
  const prepareLineChartData = () => {
    const filteredSales = getFilteredSales()
    const salesByDay = new Map<string, number>()

    if (activeTab === "daily") {
      // For daily view, group by hour
      for (let i = 0; i < 24; i++) {
        const hour = i < 10 ? `0${i}:00` : `${i}:00`
        salesByDay.set(hour, 0)
      }

      filteredSales.forEach((sale) => {
        const hour = new Date(sale.date).getHours()
        const hourKey = hour < 10 ? `0${hour}:00` : `${hour}:00`
        salesByDay.set(hourKey, (salesByDay.get(hourKey) || 0) + 1) // Count number of sales
      })
    } else if (activeTab === "weekly") {
      // For weekly view, group by day
      const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
      days.forEach((day) => salesByDay.set(day, 0))

      filteredSales.forEach((sale) => {
        const day = days[new Date(sale.date).getDay()]
        salesByDay.set(day, (salesByDay.get(day) || 0) + 1)
      })
    } else {
      // For monthly view, group by week
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

  // Preparar datos para el balance detallado
  const prepareBalanceDetailData = () => {
    const filteredSales = getFilteredSales()
    const filteredExpenses = getFilteredExpenses()

    // Calcular totales
    const totalSales = calculateTotalSales(filteredSales)
    const totalExpenses = calculateTotalExpenses(filteredExpenses)
    const balance = totalSales - totalExpenses

    // Obtener datos de caja
    const cajaData = getCajaData()

    return {
      sales: filteredSales,
      expenses: filteredExpenses,
      totalSales,
      totalExpenses,
      balance,
      cajaData,
    }
  }

  // Función para obtener datos de caja
  const getCajaData = () => {
    if (!storeId) return []

    const storedCajas = localStorage.getItem(`store_${storeId}_cajas`)
    if (!storedCajas) return []

    const cajas = JSON.parse(storedCajas)

    // Filtrar cajas según el período seleccionado
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Domingo como inicio de semana

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    return cajas.filter((caja: any) => {
      const cajaDate = new Date(caja.fecha_apertura)

      switch (activeTab) {
        case "daily":
          return cajaDate.toDateString() === today.toDateString()
        case "weekly":
          return cajaDate >= startOfWeek
        case "monthly":
          return cajaDate >= startOfMonth
        default:
          return true
      }
    })
  }

  // Format price in Colombian pesos
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
                  <CardTitle className="text-lg">Balance Financiero Detallado</CardTitle>
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

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Resumen de Caja</h3>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-text-secondary">Cajas Activas</p>
                            <p className="font-medium">
                              {getCajaData().filter((c: any) => c.estado === "abierta").length}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary">Cajas Cerradas</p>
                            <p className="font-medium">
                              {getCajaData().filter((c: any) => c.estado === "cerrada").length}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary">Saldo Inicial Total</p>
                            <p className="font-medium">
                              {formatPrice(
                                getCajaData().reduce((sum: number, caja: any) => sum + Number(caja.saldo_inicial), 0),
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary">Saldo Final Total</p>
                            <p className="font-medium">
                              {formatPrice(
                                getCajaData().reduce((sum: number, caja: any) => sum + Number(caja.saldo_final), 0),
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Detalle de Cajas</h3>
                      <CajaDetailList cajas={getCajaData()} formatPrice={formatPrice} />
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Detalle de Ingresos</h3>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-text-secondary">Total Ventas</p>
                            <p className="font-medium text-primary">{formatPrice(totalSales)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary">Número de Ventas</p>
                            <p className="font-medium">{filteredSales.length}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary">Venta Promedio</p>
                            <p className="font-medium">
                              {formatPrice(filteredSales.length > 0 ? totalSales / filteredSales.length : 0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary">Venta Máxima</p>
                            <p className="font-medium">
                              {formatPrice(Math.max(...filteredSales.map((sale) => sale.total), 0))}
                            </p>
                          </div>
                        </div>
                      </div>
                      <SalesList sales={filteredSales.slice(0, 3)} formatPrice={formatPrice} />
                      {filteredSales.length > 3 && (
                        <Link href="/sales" className="text-sm text-primary block mt-2">
                          Ver todas las ventas
                        </Link>
                      )}
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Detalle de Egresos</h3>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-text-secondary">Total Gastos</p>
                            <p className="font-medium text-danger">{formatPrice(totalExpenses)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary">Número de Gastos</p>
                            <p className="font-medium">{filteredExpenses.length}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary">Categorías Principales</p>
                            <p className="font-medium">
                              {Array.from(new Set(filteredExpenses.map((expense) => expense.categoria)))
                                .slice(0, 2)
                                .join(", ")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary">Gasto Promedio</p>
                            <p className="font-medium">
                              {formatPrice(filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0)}
                            </p>
                          </div>
                        </div>
                      </div>
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

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Configuration
    const padding = { top: 20, right: 20, bottom: 40, left: 60 }
    const chartWidth = canvas.width - padding.left - padding.right
    const chartHeight = canvas.height - padding.top - padding.bottom

    // Find the maximum value for scaling
    const maxValue = Math.max(...data.map((item) => Math.max(item.ingresos, item.gastos)), 1)

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, canvas.height - padding.bottom)
    ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom)
    ctx.strokeStyle = "#ccc"
    ctx.stroke()

    // Draw bars
    const barWidth = (chartWidth / data.length) * 0.35
    const groupWidth = chartWidth / data.length

    data.forEach((item, index) => {
      const x = padding.left + index * groupWidth + groupWidth * 0.15

      // Income bar
      const incomesHeight = (item.ingresos / maxValue) * chartHeight
      const incomesY = canvas.height - padding.bottom - incomesHeight
      ctx.fillStyle = "#29d890"
      ctx.fillRect(x, incomesY, barWidth, incomesHeight)

      // Expense bar
      const expensesHeight = (item.gastos / maxValue) * chartHeight
      const expensesY = canvas.height - padding.bottom - expensesHeight
      ctx.fillStyle = "#ff1515"
      ctx.fillRect(x + barWidth + 2, expensesY, barWidth, expensesHeight)

      // Draw label
      ctx.fillStyle = "#798184"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(item.name, x + barWidth + 1, canvas.height - padding.bottom + 15)

      // Draw values
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

    // Legend
    const legendY = padding.top / 2

    // Income
    ctx.fillStyle = "#29d890"
    ctx.fillRect(padding.left, legendY, 10, 10)
    ctx.fillStyle = "#0e0e0e"
    ctx.font = "10px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("Ingresos", padding.left + 15, legendY + 8)

    // Expenses
    ctx.fillStyle = "#ff1515"
    ctx.fillRect(padding.left + 80, legendY, 10, 10)
    ctx.fillStyle = "#0e0e0e"
    ctx.font = "10px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("Gastos", padding.left + 95, legendY + 8)
  }, [data])

  return <canvas ref={canvasRef} width={400} height={300} className="w-full h-full" />
}

// Añadir un componente para mostrar el detalle de cajas
// Añadir después de la función BalanceChart

function CajaDetailList({ cajas, formatPrice }: { cajas: any[]; formatPrice: (price: number) => string }) {
  const [storeId, setStoreId] = useState<string | null>(null)

  useEffect(() => {
    const selectedStoreId = localStorage.getItem("selectedStoreId")
    if (selectedStoreId) {
      setStoreId(selectedStoreId)
    }
  }, [])

  if (cajas.length === 0) {
    return <div className="text-center py-4 text-text-secondary">No hay cajas registradas en este período</div>
  }

  return (
    <div className="space-y-3 mt-3">
      {cajas.slice(0, 3).map((caja: any) => (
        <div key={caja.id} className="border-b pb-2 last:border-0">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium">Caja #{caja.id}</span>
              <span className="text-xs ml-2 text-text-secondary">{caja.usuario_nombre}</span>
            </div>
            <Badge
              variant={caja.estado === "abierta" ? "default" : "secondary"}
              className={caja.estado === "abierta" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
            >
              {caja.estado}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-1 mt-1 text-sm">
            <div>Inicial: {formatPrice(Number(caja.saldo_inicial))}</div>
            <div>Final: {formatPrice(Number(caja.saldo_final))}</div>
          </div>
        </div>
      ))}
      {cajas.length > 3 && storeId && (
        <Link href={`/stores/${storeId}/cajas`} className="text-sm text-primary block mt-2">
          Ver todas las cajas
        </Link>
      )}
    </div>
  )
}

