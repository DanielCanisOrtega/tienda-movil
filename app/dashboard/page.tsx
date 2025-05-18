"use client"
import {
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart2,
  PieChart,
  ArrowRight,
  Download,
  FileSpreadsheet,
} from "lucide-react"
import React, { useState, useEffect, useCallback, useRef } from "react"

import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { BarChart } from "@/components/bar-chart"
import { LineChart } from "@/components/line-chart"
import { SalesList } from "@/components/sales-list"
import { ExpensesList } from "@/components/expenses-list"
import { toast } from "@/hooks/use-toast"
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
  storeId?: string
}

// Interfaces para los datos de gráficos
interface ChartDataItem {
  name: string
  value: number
}

interface BalanceChartDataItem {
  name: string
  ingresos: number
  gastos: number
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("daily")
  const [salesData, setSalesData] = useState<Sale[]>([])
  const [expensesData, setExpensesData] = useState<Expense[]>([])
  const [reportView, setReportView] = useState<"sales" | "expenses" | "balance">("sales")
  const [storeId, setStoreId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [animateCharts, setAnimateCharts] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Referencias para los canvas de las gráficas
  const salesBarChartRef = useRef<HTMLDivElement>(null)
  const expensesBarChartRef = useRef<HTMLDivElement>(null)
  const balanceChartRef = useRef<HTMLCanvasElement>(null)
  const salesPieChartRef = useRef<HTMLCanvasElement>(null)
  const expensesPieChartRef = useRef<HTMLCanvasElement>(null)
  const salesLineChartRef = useRef<HTMLDivElement>(null)

  // Load data from localStorage
  useEffect(() => {
    setIsLoading(true)
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

    setIsLoading(false)

    // Trigger animation after a short delay
    setTimeout(() => {
      setAnimateCharts(true)
    }, 300)
  }, [])

  // Filter sales by store ID
  const getFilteredSales = useCallback(() => {
    if (!storeId) return []

    const storeSales = salesData.filter((sale) => {
      // Check if sale has storeId property and it matches the current storeId
      return "storeId" in sale ? sale.storeId === storeId : true
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday as start of week

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    switch (activeTab) {
      case "daily":
        return storeSales.filter((sale) => {
          const saleDate = new Date(sale.date)
          return saleDate >= today
        })
      case "weekly":
        return storeSales.filter((sale) => {
          const saleDate = new Date(sale.date)
          return saleDate >= startOfWeek
        })
      case "monthly":
        return storeSales.filter((sale) => {
          const saleDate = new Date(sale.date)
          return saleDate >= startOfMonth
        })
      default:
        return storeSales
    }
  }, [salesData, storeId, activeTab])

  // Filter expenses by store ID
  const getFilteredExpenses = useCallback(() => {
    if (!storeId || !expensesData.length) return []

    const storeExpenses = expensesData.filter((expense) => {
      // Check if expense has storeId property and it matches the current storeId
      return "storeId" in expense ? expense.storeId === storeId : true
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday as start of week

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    switch (activeTab) {
      case "daily":
        return storeExpenses.filter((expense) => {
          // Convertir la fecha del gasto a un objeto Date para comparación correcta
          let expenseDate: Date

          if (typeof expense.date === "string") {
            // Si la fecha es una cadena, intentamos convertirla a Date
            // Primero verificamos si es formato ISO (YYYY-MM-DD)
            if (expense.date.includes("-")) {
              const [year, month, day] = expense.date.split("-").map(Number)
              expenseDate = new Date(year, month - 1, day)
            } else {
              // Si no es formato ISO, intentamos parsear directamente
              expenseDate = new Date(expense.date)
            }
          } else {
            // Si ya es un objeto Date, lo usamos directamente
            expenseDate = new Date(expense.date)
          }

          // Resetear la hora a 00:00:00 para comparar solo fechas
          expenseDate.setHours(0, 0, 0, 0)

          // Comparar si la fecha del gasto es igual a hoy
          return expenseDate.getTime() === today.getTime()
        })
      case "weekly":
        return storeExpenses.filter((expense) => {
          let expenseDate: Date

          if (typeof expense.date === "string") {
            if (expense.date.includes("-")) {
              const [year, month, day] = expense.date.split("-").map(Number)
              expenseDate = new Date(year, month - 1, day)
            } else {
              expenseDate = new Date(expense.date)
            }
          } else {
            expenseDate = new Date(expense.date)
          }

          expenseDate.setHours(0, 0, 0, 0)

          // Verificar si la fecha del gasto es posterior o igual al inicio de la semana
          return expenseDate >= startOfWeek
        })
      case "monthly":
        return storeExpenses.filter((expense) => {
          let expenseDate: Date

          if (typeof expense.date === "string") {
            if (expense.date.includes("-")) {
              const [year, month, day] = expense.date.split("-").map(Number)
              expenseDate = new Date(year, month - 1, day)
            } else {
              expenseDate = new Date(expense.date)
            }
          } else {
            expenseDate = new Date(expense.date)
          }

          expenseDate.setHours(0, 0, 0, 0)

          // Verificar si la fecha del gasto es posterior o igual al inicio del mes
          return expenseDate >= startOfMonth
        })
      default:
        return storeExpenses
    }
  }, [expensesData, storeId, activeTab])

  // Calculate total sales
  const calculateTotalSales = useCallback((sales: Sale[]) => {
    return sales.reduce((sum, sale) => sum + sale.total, 0)
  }, [])

  // Calculate total expenses
  const calculateTotalExpenses = useCallback((expenses: Expense[]) => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0)
  }, [])

  // Prepare data for bar chart (sales by day)
  const prepareSalesBarChartData = useCallback((): ChartDataItem[] => {
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
  }, [getFilteredSales, activeTab])

  // Prepare data for bar chart (expenses by day)
  const prepareExpensesBarChartData = useCallback((): ChartDataItem[] => {
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
        const date = new Date(expense.date)
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
        const date = new Date(expense.date)
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
        const date = new Date(expense.date)
        const day = date.getDate().toString()
        expensesByDay.set(day, (expensesByDay.get(day) || 0) + expense.amount)
      })
    }

    // Convert Map to array for chart
    return Array.from(expensesByDay).map(([name, value]) => ({ name, value }))
  }, [getFilteredExpenses, activeTab])

  // Prepare data for balance chart (income vs expenses)
  const prepareBalanceBarChartData = useCallback((): BalanceChartDataItem[] => {
    const salesData = prepareSalesBarChartData()
    const expensesData = prepareExpensesBarChartData()

    // Combine data to show income and expenses together
    const combinedData: BalanceChartDataItem[] = []

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
  }, [prepareSalesBarChartData, prepareExpensesBarChartData])

  // Prepare data for line chart (trend)
  const prepareLineChartData = useCallback((): ChartDataItem[] => {
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
  }, [getFilteredSales, activeTab])

  // Prepare data for pie chart (sales by category)
  const prepareSalesByCategoryData = useCallback((): ChartDataItem[] => {
    const filteredSales = getFilteredSales()
    const salesByCategory = new Map<string, number>()

    // Sum sales by category
    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const category = item.product.category || "Sin categoría"
        const amount = item.product.price * item.quantity
        salesByCategory.set(category, (salesByCategory.get(category) || 0) + amount)
      })
    })

    // Convert Map to array for chart
    return Array.from(salesByCategory).map(([name, value]) => ({ name, value }))
  }, [getFilteredSales])

  // Prepare data for pie chart (expenses by category)
  const prepareExpensesByCategoryData = useCallback((): ChartDataItem[] => {
    const filteredExpenses = getFilteredExpenses()
    const expensesByCategory = new Map<string, number>()

    // Sum expenses by category
    filteredExpenses.forEach((expense) => {
      const category = expense.categoria || "Sin categoría"
      expensesByCategory.set(category, (expensesByCategory.get(category) || 0) + expense.amount)
    })

    // Convert Map to array for chart
    return Array.from(expensesByCategory).map(([name, value]) => ({ name, value }))
  }, [getFilteredExpenses])

  // Format price in Colombian pesos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Función para exportar los datos a CSV
  const exportToCSV = () => {
    try {
      setIsExporting(true)

      const filteredSales = getFilteredSales()
      const filteredExpenses = getFilteredExpenses()
      const totalSales = calculateTotalSales(filteredSales)
      const totalExpenses = calculateTotalExpenses(filteredExpenses)
      const balance = totalSales - totalExpenses

      // Función para escapar celdas CSV
      const escapeCSV = (text: string) => {
        if (text.includes(",") || text.includes("\n") || text.includes('"')) {
          return `"${text.replace(/"/g, '""')}"`
        }
        return text
      }

      // Crear CSV para el resumen
      let summaryCSV = "Resumen Financiero\n"
      summaryCSV += `Período,${getPeriodText()}\n`
      summaryCSV += `Total Ingresos,${formatPrice(totalSales)}\n`
      summaryCSV += `Total Gastos,${formatPrice(totalExpenses)}\n`
      summaryCSV += `Balance,${formatPrice(balance)}\n\n`

      // Crear CSV para las ventas
      let salesCSV = "ID,Fecha,Total,Productos\n"

      filteredSales.forEach((sale) => {
        const saleDate = new Date(sale.date)
        const formattedDate = saleDate.toLocaleString("es-CO")
        const productsInfo = sale.items
          .map((item) => `${item.product.name} (${item.quantity} x ${formatPrice(item.product.price)})`)
          .join("; ")

        salesCSV += `${escapeCSV(sale.id)},${escapeCSV(formattedDate)},${escapeCSV(
          formatPrice(sale.total),
        )},${escapeCSV(productsInfo)}\n`
      })

      // Crear CSV para los gastos
      let expensesCSV = "ID,Fecha,Categoría,Descripción,Monto\n"

      filteredExpenses.forEach((expense) => {
        const expenseDate = new Date(expense.date)
        const formattedDate = expenseDate.toLocaleString("es-CO")

        expensesCSV += `${escapeCSV(expense.id)},${escapeCSV(formattedDate)},${escapeCSV(
          expense.categoria || "Sin categoría",
        )},${escapeCSV(expense.descripcion || "")},${escapeCSV(formatPrice(expense.amount))}\n`
      })

      // Crear CSV para los datos de gráficos
      let chartsCSV = "Datos de Gráficos\n\n"
      chartsCSV += "Ventas por Período\n"
      chartsCSV += "Período,Monto\n"

      const salesChartData = prepareSalesBarChartData()
      salesChartData.forEach((item) => {
        chartsCSV += `${escapeCSV(item.name)},${item.value}\n`
      })

      chartsCSV += "\nGastos por Período\n"
      chartsCSV += "Período,Monto\n"

      const expensesChartData = prepareExpensesBarChartData()
      expensesChartData.forEach((item) => {
        chartsCSV += `${escapeCSV(item.name)},${item.value}\n`
      })

      chartsCSV += "\nVentas por Categoría\n"
      chartsCSV += "Categoría,Monto\n"

      const salesCategoryData = prepareSalesByCategoryData()
      salesCategoryData.forEach((item) => {
        chartsCSV += `${escapeCSV(item.name)},${item.value}\n`
      })

      chartsCSV += "\nGastos por Categoría\n"
      chartsCSV += "Categoría,Monto\n"

      const expensesCategoryData = prepareExpensesByCategoryData()
      expensesCategoryData.forEach((item) => {
        chartsCSV += `${escapeCSV(item.name)},${item.value}\n`
      })

      // Combinar todos los CSV
      const fullCSV = `${summaryCSV}\n${salesCSV}\n${expensesCSV}\n${chartsCSV}`

      // Crear un blob y descargar
      const blob = new Blob([fullCSV], { type: "text/csv;charset=utf-8;" })
      const storeName = localStorage.getItem("selectedStoreName") || "Tienda"
      const date = new Date().toISOString().split("T")[0]
      const fileName = `Reporte_${storeName}_${date}.csv`

      // Crear un enlace para descargar
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", fileName)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Reporte exportado",
        description: `El reporte ha sido exportado como ${fileName}`,
      })
    } catch (error) {
      console.error("Error al exportar a CSV:", error)
      toast({
        title: "Error al exportar",
        description: "No se pudo exportar el reporte. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
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
  const salesByCategoryData = prepareSalesByCategoryData()
  const expensesByCategoryData = prepareExpensesByCategoryData()

  // Get period text
  const getPeriodText = () => {
    switch (activeTab) {
      case "daily":
        return "hoy"
      case "weekly":
        return "esta semana"
      case "monthly":
        return "este mes"
      default:
        return ""
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background-light">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-text-primary">Cargando reportes...</p>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top">
      <div className="bg-primary text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/home" className="mr-4">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-semibold">Reportes</h1>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="flex items-center gap-1"
          onClick={exportToCSV}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Exportando...</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="h-4 w-4" />
              <span>Exportar</span>
            </>
          )}
        </Button>
      </div>

      <div className="container max-w-md mx-auto p-4 space-y-4">
        <Tabs
          defaultValue="daily"
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value)
            setAnimateCharts(false)
            setTimeout(() => setAnimateCharts(true), 300)
          }}
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="daily" className="relative overflow-hidden">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Diario</span>
              </div>
              {activeTab === "daily" && (
                <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary animate-slide-in-right"></div>
              )}
            </TabsTrigger>
            <TabsTrigger value="weekly" className="relative overflow-hidden">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Semanal</span>
              </div>
              {activeTab === "weekly" && (
                <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary animate-slide-in-right"></div>
              )}
            </TabsTrigger>
            <TabsTrigger value="monthly" className="relative overflow-hidden">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Mensual</span>
              </div>
              {activeTab === "monthly" && (
                <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary animate-slide-in-right"></div>
              )}
            </TabsTrigger>
          </TabsList>

          <Card
            className={`transition-all duration-300 ${animateCharts ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-primary" />
                Resumen Financiero
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={exportToCSV}
                disabled={isExporting}
                title="Exportar resumen a CSV"
              >
                {isExporting ? (
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-text-secondary flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                    Ingresos
                  </p>
                  <p className="text-xl font-bold text-primary">{formatPrice(totalSales)}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-text-secondary flex items-center">
                    <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
                    Gastos
                  </p>
                  <p className="text-xl font-bold text-danger">{formatPrice(totalExpenses)}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className={`p-3 rounded-lg ${balance >= 0 ? "bg-green-50" : "bg-red-50"}`}>
                <p className="text-sm text-text-secondary">Balance</p>
                <div className="flex items-center">
                  <p className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatPrice(balance)}
                  </p>
                  {balance >= 0 ? (
                    <TrendingUp className="h-5 w-5 ml-2 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 ml-2 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs
            defaultValue="sales"
            value={reportView}
            onValueChange={(value) => {
              setReportView(value as any)
              setAnimateCharts(false)
              setTimeout(() => setAnimateCharts(true), 300)
            }}
          >
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="sales" className="relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  <span>Ventas</span>
                </div>
                {reportView === "sales" && (
                  <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary animate-slide-in-right"></div>
                )}
              </TabsTrigger>
              <TabsTrigger value="expenses" className="relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  <span>Gastos</span>
                </div>
                {reportView === "expenses" && (
                  <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary animate-slide-in-right"></div>
                )}
              </TabsTrigger>
              <TabsTrigger value="balance" className="relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  <span>Balance</span>
                </div>
                {reportView === "balance" && (
                  <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary animate-slide-in-right"></div>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sales" className="space-y-4">
              <ReportContent
                title="Reporte de Ventas"
                sales={filteredSales}
                expenses={[]}
                total={totalSales}
                barChartData={salesBarChartData}
                lineChartData={lineChartData}
                pieChartData={salesByCategoryData}
                formatPrice={formatPrice}
                period={getPeriodText()}
                type="sales"
                animateCharts={animateCharts}
                onExport={exportToCSV}
                isExporting={isExporting}
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
                pieChartData={expensesByCategoryData}
                formatPrice={formatPrice}
                period={getPeriodText()}
                type="expenses"
                animateCharts={animateCharts}
                onExport={exportToCSV}
                isExporting={isExporting}
              />
            </TabsContent>

            <TabsContent value="balance" className="space-y-4">
              <Card
                className={`transition-all duration-300 ${animateCharts ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-primary" />
                    Balance Financiero
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={exportToCSV}
                    disabled={isExporting}
                    title="Exportar balance a CSV"
                  >
                    {isExporting ? (
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-3xl font-bold flex items-center ${balance >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatPrice(balance)}
                    {balance >= 0 ? <TrendingUp className="h-6 w-6 ml-2" /> : <TrendingDown className="h-6 w-6 ml-2" />}
                  </div>
                  <p className="text-sm text-text-secondary">Balance {getPeriodText()}</p>

                  <div className="mt-6">
                    <h3 className="font-medium mb-2 flex items-center">
                      <BarChart2 className="h-4 w-4 mr-2 text-primary" />
                      Ingresos vs Gastos
                    </h3>
                    <div className="h-64 rounded-lg overflow-hidden bg-gray-50 p-2">
                      <BalanceChart data={balanceBarChartData} />
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <h3 className="font-medium mb-3 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                        Detalle de Ventas
                      </h3>
                      <div className="bg-green-50 rounded-lg p-3">
                        <SalesList sales={filteredSales.slice(0, 3)} formatPrice={formatPrice} />
                        {filteredSales.length > 3 && (
                          <Link href="/sales" className="text-sm text-primary flex items-center mt-2 hover:underline">
                            Ver todas las ventas
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Link>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-3 flex items-center">
                        <TrendingDown className="h-4 w-4 mr-2 text-red-500" />
                        Detalle de Gastos
                      </h3>
                      <div className="bg-red-50 rounded-lg p-3">
                        <ExpensesList expenses={filteredExpenses.slice(0, 3)} formatPrice={formatPrice} />
                        {filteredExpenses.length > 3 && (
                          <Link
                            href="/expenses"
                            className="text-sm text-primary flex items-center mt-2 hover:underline"
                          >
                            Ver todos los gastos
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Link>
                        )}
                      </div>
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
  barChartData: ChartDataItem[]
  lineChartData: ChartDataItem[]
  pieChartData: ChartDataItem[]
  formatPrice: (price: number) => string
  period: string
  type: "sales" | "expenses"
  animateCharts: boolean
  onExport: () => void
  isExporting: boolean
}

function ReportContent({
  title,
  sales,
  expenses,
  total,
  barChartData,
  lineChartData,
  pieChartData,
  formatPrice,
  period,
  type,
  animateCharts,
  onExport,
  isExporting,
}: ReportContentProps) {
  return (
    <>
      <Card
        className={`transition-all duration-300 ${animateCharts ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            {type === "sales" ? (
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 mr-2 text-red-500" />
            )}
            {title}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onExport}
            disabled={isExporting}
            title={`Exportar ${type === "sales" ? "ventas" : "gastos"} a CSV`}
          >
            {isExporting ? (
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <div
            className={`text-3xl font-bold ${type === "sales" ? "text-green-600" : "text-red-600"} flex items-center`}
          >
            {formatPrice(total)}
            {type === "sales" ? <TrendingUp className="h-6 w-6 ml-2" /> : <TrendingDown className="h-6 w-6 ml-2" />}
          </div>
          <p className="text-sm text-text-secondary">
            Total de {type === "sales" ? "ventas" : "gastos"} {period}
          </p>

          <div className="mt-6">
            <h3 className="font-medium mb-2 flex items-center">
              <BarChart2 className="h-4 w-4 mr-2 text-primary" />
              {type === "sales" ? "Ventas" : "Gastos"} por período
            </h3>
            <div className="h-64 rounded-lg overflow-hidden bg-gray-50 p-2">
              <BarChart data={barChartData} />
            </div>
          </div>

          {pieChartData.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-2 flex items-center">
                <PieChart className="h-4 w-4 mr-2 text-primary" />
                {type === "sales" ? "Ventas" : "Gastos"} por categoría
              </h3>
              <div className="h-64 rounded-lg overflow-hidden bg-gray-50 p-2">
                <PieChartComponent data={pieChartData} formatPrice={formatPrice} />
              </div>
            </div>
          )}

          {type === "sales" && lineChartData.length > 0 && (
            <>
              <Separator className="my-6" />
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                  Tendencia de ventas
                </h3>
                <div className="h-48 rounded-lg overflow-hidden bg-gray-50 p-2">
                  <LineChart data={lineChartData} />
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" className="flex-1 mr-2" asChild>
            <Link href={type === "sales" ? "/sales" : "/expenses"}>
              Ver todos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button variant="default" className="flex-1 ml-2" onClick={onExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Exportando...
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar CSV
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card
        className={`transition-all duration-300 ${animateCharts ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-primary" />
            {type === "sales" ? "Detalle de Ventas" : "Detalle de Gastos"}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onExport}
            disabled={isExporting}
            title={`Exportar detalle de ${type === "sales" ? "ventas" : "gastos"} a CSV`}
          >
            {isExporting ? (
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {type === "sales" ? (
            <div className="bg-green-50 rounded-lg p-3">
              <SalesList sales={sales} formatPrice={formatPrice} />
            </div>
          ) : (
            <div className="bg-red-50 rounded-lg p-3">
              <ExpensesList expenses={expenses} formatPrice={formatPrice} />
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

// Corregir la interfaz para el componente BalanceChart
interface BalanceChartProps {
  data: BalanceChartDataItem[]
}

function BalanceChart({ data }: BalanceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    // Usar aserción de tipo para evitar el error de TypeScript
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
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

    // Draw bars with animation
    const barWidth = (chartWidth / data.length) * 0.35
    const groupWidth = chartWidth / data.length

    // Animation
    let currentFrame = 0
    const totalFrames = 20

    function animate() {
      if (currentFrame <= totalFrames) {
        // Clear the chart area only (not the axes or labels)
        ctx.clearRect(padding.left + 1, padding.top, chartWidth - 1, chartHeight)

        const animationProgress = currentFrame / totalFrames

        data.forEach((item, index) => {
          const x = padding.left + index * groupWidth + groupWidth * 0.15

          // Income bar with animation
          const incomesHeight = (item.ingresos / maxValue) * chartHeight * animationProgress
          const incomesY = canvas.height - padding.bottom - incomesHeight
          ctx.fillStyle = "#29d890"
          ctx.fillRect(x, incomesY, barWidth, incomesHeight)

          // Expense bar with animation
          const expensesHeight = (item.gastos / maxValue) * chartHeight * animationProgress
          const expensesY = canvas.height - padding.bottom - expensesHeight
          ctx.fillStyle = "#ff1515"
          ctx.fillRect(x + barWidth + 2, expensesY, barWidth, expensesHeight)

          // Draw values if they're visible in the current animation frame
          if (item.ingresos > 0 && incomesHeight > 15) {
            ctx.fillStyle = "#0e0e0e"
            ctx.font = "10px sans-serif"
            ctx.textAlign = "center"
            ctx.fillText(
              new Intl.NumberFormat("es-CO", { notation: "compact", compactDisplay: "short" }).format(item.ingresos),
              x + barWidth / 2,
              incomesY - 5,
            )
          }

          if (item.gastos > 0 && expensesHeight > 15) {
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

        currentFrame++
        requestAnimationFrame(animate)
      }
    }

    // Draw labels (outside animation loop)
    data.forEach((item, index) => {
      const x = padding.left + index * groupWidth + groupWidth * 0.15

      // Draw label
      ctx.fillStyle = "#798184"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(item.name, x + barWidth + 1, canvas.height - padding.bottom + 15)
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

    // Start animation
    animate()
  }, [data])

  return <canvas ref={canvasRef} width={400} height={300} className="w-full h-full" />
}

// Corregir la interfaz para el componente PieChartComponent
interface PieChartComponentProps {
  data: ChartDataItem[]
  formatPrice: (price: number) => string
}

function PieChartComponent({ data, formatPrice }: PieChartComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    if (!canvasRef.current || data.length === 0) return

    const canvas = canvasRef.current
    // Usar aserción de tipo para evitar el error de TypeScript
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Configuration
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) * 0.7

    // Calculate total value
    const total = data.reduce((sum, item) => sum + item.value, 0)

    // Colors for pie slices
    const colors = [
      "#4CAF50",
      "#2196F3",
      "#FFC107",
      "#E91E63",
      "#9C27B0",
      "#00BCD4",
      "#FF5722",
      "#795548",
      "#607D8B",
      "#3F51B5",
    ]

    // Draw pie chart with animation
    let currentFrame = 0
    const totalFrames = 30

    function animate() {
      if (currentFrame <= totalFrames) {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const animationProgress = currentFrame / totalFrames
        const endAngle = Math.PI * 2 * animationProgress

        let startAngle = 0
        let legendY = 20

        // Draw pie slices
        data.forEach((item, index) => {
          const sliceAngle = (item.value / total) * endAngle

          ctx.beginPath()
          ctx.moveTo(centerX, centerY)
          ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
          ctx.closePath()

          ctx.fillStyle = colors[index % colors.length]
          ctx.fill()

          // Draw legend
          if (currentFrame === totalFrames) {
            ctx.fillRect(20, legendY, 15, 15)
            ctx.fillStyle = "#000"
            ctx.font = "12px sans-serif"
            ctx.textAlign = "left"
            ctx.fillText(
              `${item.name}: ${formatPrice(item.value)} (${Math.round((item.value / total) * 100)}%)`,
              45,
              legendY + 12,
            )
            legendY += 25
          }

          startAngle += sliceAngle
        })

        currentFrame++
        requestAnimationFrame(animate)
      }
    }

    // Start animation
    animate()
  }, [data, formatPrice])

  return <canvas ref={canvasRef} width={400} height={300} className="w-full h-full" />
}
