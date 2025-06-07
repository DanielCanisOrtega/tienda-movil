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
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"

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
      name?: string
      nombre?: string
      price?: number
      precio?: number
      category?: string
      categoria?: string
    }
    quantity: number
  }[]
  total: number
  date: Date | string
  storeId?: string
  storeName?: string
  paymentMethod?: string
  customerInfo?: {
    name?: string
    phone?: string
    email?: string
  }
}

// Interfaces para los datos de gráficos
interface ChartDataItem {
  name: string
  value: number
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
        // Convert dates from string to Date and normalize product data
        const parsedSales = JSON.parse(storedSales).map((sale: any) => ({
          ...sale,
          date: new Date(sale.date),
          items: sale.items.map((item: any) => ({
            ...item,
            product: {
              ...item.product,
              name: item.product.name || item.product.nombre,
              price: item.product.price || item.product.precio,
              category: item.product.category || item.product.categoria,
            },
          })),
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
      return "storeId" in sale ? sale.storeId === storeId : true
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

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
      return "storeId" in expense ? expense.storeId === storeId : true
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    switch (activeTab) {
      case "daily":
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
      for (let i = 0; i < 24; i++) {
        const hour = i < 10 ? `0${i}:00` : `${i}:00`
        salesByDay.set(hour, 0)
      }

      filteredSales.forEach((sale) => {
        const hour = new Date(sale.date).getHours()
        const hourKey = hour < 10 ? `0${hour}:00` : `${hour}:00`
        salesByDay.set(hourKey, (salesByDay.get(hourKey) || 0) + sale.total)
      })
    } else if (activeTab === "weekly") {
      const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
      days.forEach((day) => salesByDay.set(day, 0))

      filteredSales.forEach((sale) => {
        const day = days[new Date(sale.date).getDay()]
        salesByDay.set(day, (salesByDay.get(day) || 0) + sale.total)
      })
    } else {
      const today = new Date()
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()

      for (let i = 1; i <= daysInMonth; i++) {
        salesByDay.set(`${i}`, 0)
      }

      filteredSales.forEach((sale) => {
        const day = new Date(sale.date).getDate().toString()
        salesByDay.set(day, (salesByDay.get(day) || 0) + sale.total)
      })
    }

    return Array.from(salesByDay).map(([name, value]) => ({ name, value }))
  }, [getFilteredSales, activeTab])

  // Prepare data for bar chart (expenses by day)
  const prepareExpensesBarChartData = useCallback((): ChartDataItem[] => {
    const filteredExpenses = getFilteredExpenses()
    const expensesByDay = new Map<string, number>()

    if (activeTab === "daily") {
      for (let i = 0; i < 24; i++) {
        const hour = i < 10 ? `0${i}:00` : `${i}:00`
        expensesByDay.set(hour, 0)
      }

      filteredExpenses.forEach((expense) => {
        const date = new Date(expense.date)
        const hour = date.getHours()
        const hourKey = hour < 10 ? `0${hour}:00` : `${hour}:00`
        expensesByDay.set(hourKey, (expensesByDay.get(hourKey) || 0) + expense.amount)
      })
    } else if (activeTab === "weekly") {
      const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
      days.forEach((day) => expensesByDay.set(day, 0))

      filteredExpenses.forEach((expense) => {
        const date = new Date(expense.date)
        const day = days[date.getDay()]
        expensesByDay.set(day, (expensesByDay.get(day) || 0) + expense.amount)
      })
    } else {
      const today = new Date()
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()

      for (let i = 1; i <= daysInMonth; i++) {
        expensesByDay.set(`${i}`, 0)
      }

      filteredExpenses.forEach((expense) => {
        const date = new Date(expense.date)
        const day = date.getDate().toString()
        expensesByDay.set(day, (expensesByDay.get(day) || 0) + expense.amount)
      })
    }

    return Array.from(expensesByDay).map(([name, value]) => ({ name, value }))
  }, [getFilteredExpenses, activeTab])

  // Prepare data for line chart (trend)
  const prepareLineChartData = useCallback((): ChartDataItem[] => {
    const filteredSales = getFilteredSales()
    const salesByDay = new Map<string, number>()

    if (activeTab === "daily") {
      for (let i = 0; i < 24; i++) {
        const hour = i < 10 ? `0${i}:00` : `${i}:00`
        salesByDay.set(hour, 0)
      }

      filteredSales.forEach((sale) => {
        const hour = new Date(sale.date).getHours()
        const hourKey = hour < 10 ? `0${hour}:00` : `${hour}:00`
        salesByDay.set(hourKey, (salesByDay.get(hourKey) || 0) + 1)
      })
    } else if (activeTab === "weekly") {
      const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
      days.forEach((day) => salesByDay.set(day, 0))

      filteredSales.forEach((sale) => {
        const day = days[new Date(sale.date).getDay()]
        salesByDay.set(day, (salesByDay.get(day) || 0) + 1)
      })
    } else {
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

  // Format price in Colombian pesos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Función para descargar PDF usando window.print() optimizado
  const downloadPDF = () => {
    try {
      setIsExporting(true)

      const filteredSales = getFilteredSales()
      const filteredExpenses = getFilteredExpenses()
      const totalSales = calculateTotalSales(filteredSales)
      const totalExpenses = calculateTotalExpenses(filteredExpenses)
      const balance = totalSales - totalExpenses

      const storeName = localStorage.getItem("selectedStoreName") || "Tienda"
      const date = new Date().toLocaleString("es-CO")

      // Crear contenido HTML optimizado para PDF
      const printContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte Financiero - ${storeName}</title>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 15mm;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body {
        margin: 0 !important;
        padding: 0 !important;
      }
    }
    
    body {
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 15px;
      color: #333;
      background-color: white;
      font-size: 12px;
      line-height: 1.4;
    }
    
    .header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 3px solid #6366f1;
      padding-bottom: 15px;
    }
    
    .header h1 {
      color: #6366f1;
      margin: 0;
      font-size: 22px;
      font-weight: bold;
    }
    
    .header p {
      color: #666;
      margin: 6px 0;
      font-size: 13px;
    }
    
    .summary {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      gap: 10px;
    }
    
    .summary-card {
      padding: 12px;
      border-radius: 6px;
      text-align: center;
      border: 2px solid;
      flex: 1;
    }
    
    .summary-card.income {
      background-color: #d1fae5 !important;
      border-color: #10b981 !important;
      color: #065f46 !important;
    }
    
    .summary-card.expense {
      background-color: #fee2e2 !important;
      border-color: #ef4444 !important;
      color: #7f1d1d !important;
    }
    
    .summary-card.balance {
      background-color: ${balance >= 0 ? "#e0e7ff" : "#fee2e2"} !important;
      border-color: ${balance >= 0 ? "#6366f1" : "#ef4444"} !important;
      color: ${balance >= 0 ? "#312e81" : "#7f1d1d"} !important;
    }
    
    .summary-card h3 {
      margin: 0 0 6px 0;
      font-size: 13px;
      font-weight: bold;
    }
    
    .summary-card .amount {
      font-size: 16px;
      font-weight: bold;
      margin: 4px 0;
    }
    
    .summary-card .count {
      font-size: 10px;
      opacity: 0.8;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 10px;
      page-break-inside: avoid;
    }
    
    th, td {
      padding: 6px 4px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: top;
    }
    
    th {
      background-color: #6366f1 !important;
      color: white !important;
      font-weight: bold;
      font-size: 11px;
    }
    
    tr:nth-child(even) {
      background-color: #f9fafb !important;
    }
    
    .section {
      margin: 20px 0;
      page-break-inside: avoid;
    }
    
    .section h2 {
      color: #374151;
      border-left: 4px solid #6366f1;
      padding-left: 8px;
      font-size: 15px;
      margin-bottom: 12px;
      font-weight: bold;
    }
    
    .no-data {
      text-align: center;
      color: #6b7280;
      font-style: italic;
      padding: 15px;
      background-color: #f9fafb;
      border-radius: 6px;
    }
    
    .footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 9px;
      page-break-inside: avoid;
    }
    
    .truncate {
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .currency {
      font-weight: bold;
      color: #059669 !important;
    }
    
    .expense-amount {
      font-weight: bold;
      color: #dc2626 !important;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Reporte Financiero</h1>
    <p><strong>${storeName}</strong></p>
    <p>Período: ${getPeriodText()} | Generado: ${date}</p>
  </div>

  <div class="summary">
    <div class="summary-card income">
      <h3>💰 Total Ingresos</h3>
      <div class="amount">${formatPrice(totalSales)}</div>
      <div class="count">${filteredSales.length} ventas</div>
    </div>
    <div class="summary-card expense">
      <h3>💸 Total Gastos</h3>
      <div class="amount">${formatPrice(totalExpenses)}</div>
      <div class="count">${filteredExpenses.length} gastos</div>
    </div>
    <div class="summary-card balance">
      <h3>${balance >= 0 ? "📈" : "📉"} Balance</h3>
      <div class="amount">${formatPrice(balance)}</div>
      <div class="count">${balance >= 0 ? "Ganancia" : "Pérdida"}</div>
    </div>
  </div>

  <div class="section">
    <h2>🛒 Ventas Detalladas</h2>
    ${
      filteredSales.length > 0
        ? `
    <table>
      <thead>
        <tr>
          <th style="width: 15%;">ID</th>
          <th style="width: 18%;">Fecha</th>
          <th style="width: 20%;">Cliente</th>
          <th style="width: 27%;">Productos</th>
          <th style="width: 20%;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${filteredSales
          .slice(0, 25) // Limitar a 25 ventas
          .map(
            (sale, index) => `
        <tr>
          <td class="truncate">${sale.id.substring(0, 8)}...</td>
          <td>${new Date(sale.date).toLocaleDateString("es-CO")}</td>
          <td class="truncate">${sale.customerInfo?.name || "Cliente general"}</td>
          <td class="truncate">
            ${sale.items
              .slice(0, 2)
              .map((item) => `${item.product.name || item.product.nombre} (${item.quantity})`)
              .join(", ")}${sale.items.length > 2 ? "..." : ""}
          </td>
          <td class="currency">${formatPrice(sale.total)}</td>
        </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
    ${filteredSales.length > 25 ? `<p style="text-align: center; color: #6b7280; font-style: italic;">... y ${filteredSales.length - 25} ventas más</p>` : ""}
    `
        : '<div class="no-data">No hay ventas en este período</div>'
    }
  </div>

  <div class="section">
    <h2>💳 Gastos Detallados</h2>
    ${
      filteredExpenses.length > 0
        ? `
    <table>
      <thead>
        <tr>
          <th style="width: 20%;">Fecha</th>
          <th style="width: 25%;">Categoría</th>
          <th style="width: 35%;">Descripción</th>
          <th style="width: 20%;">Monto</th>
        </tr>
      </thead>
      <tbody>
        ${filteredExpenses
          .slice(0, 25) // Limitar a 25 gastos
          .map(
            (expense, index) => `
        <tr>
          <td>${new Date(expense.date).toLocaleDateString("es-CO")}</td>
          <td class="truncate">${expense.categoria || "Sin categoría"}</td>
          <td class="truncate">${expense.descripcion || "-"}</td>
          <td class="expense-amount">${formatPrice(expense.amount)}</td>
        </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
    ${filteredExpenses.length > 25 ? `<p style="text-align: center; color: #6b7280; font-style: italic;">... y ${filteredExpenses.length - 25} gastos más</p>` : ""}
    `
        : '<div class="no-data">No hay gastos en este período</div>'
    }
  </div>
  
  <div class="footer">
    <p>© ${new Date().getFullYear()} ${storeName} - Todos los derechos reservados</p>
    <p>Este reporte fue generado automáticamente el ${date}</p>
  </div>
</body>
</html>`

      // Crear ventana de descarga
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        throw new Error("No se pudo abrir la ventana de descarga")
      }

      printWindow.document.write(printContent)
      printWindow.document.close()

      // Configurar para descarga automática
      printWindow.onload = () => {
        setTimeout(() => {
          // Configurar el título del documento para la descarga
          printWindow.document.title = `Reporte_${storeName}_${new Date().toISOString().split("T")[0]}`

          // Ejecutar la descarga
          printWindow.print()

          // Cerrar la ventana después de un momento
          setTimeout(() => {
            printWindow.close()
            setIsExporting(false)
          }, 1000)
        }, 500)
      }

      toast({
        title: "Descarga iniciada",
        description: "En el diálogo que aparece, selecciona 'Guardar como PDF' y elige la ubicación.",
      })
    } catch (error) {
      console.error("Error al descargar PDF:", error)
      toast({
        title: "Error al descargar",
        description: "No se pudo generar el PDF. Intente nuevamente.",
        variant: "destructive",
      })
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
  const lineChartData = prepareLineChartData()

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
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-foreground">Cargando reportes...</p>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-background android-safe-top">
      <div className="bg-primary text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/home" className="mr-4">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-semibold">Reportes</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex items-center gap-1 relative overflow-hidden group"
            onClick={downloadPDF}
            disabled={isExporting}
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            {isExporting ? (
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>Descargar PDF</span>
            <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-white group-hover:w-full transition-all duration-300"></div>
          </Button>
        </div>
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
                onClick={downloadPDF}
                disabled={isExporting}
                title="Descargar reporte PDF"
              >
                {isExporting ? (
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium">Ingresos</span>
                  </div>
                  <span className="font-bold text-green-600">{formatPrice(totalSales)}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-sm font-medium">Gastos</span>
                  </div>
                  <span className="font-bold text-red-600">{formatPrice(totalExpenses)}</span>
                </div>

                <Separator />

                <div
                  className={`flex justify-between items-center p-3 rounded-lg ${balance >= 0 ? "bg-blue-50" : "bg-red-50"}`}
                >
                  <div className="flex items-center">
                    <DollarSign className={`h-5 w-5 mr-2 ${balance >= 0 ? "text-blue-600" : "text-red-600"}`} />
                    <span className="text-sm font-medium">Balance</span>
                  </div>
                  <span className={`font-bold ${balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                    {formatPrice(balance)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <TabsContent value={activeTab} className="space-y-4">
            <Card
              className={`transition-all duration-300 ${animateCharts ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                  Ventas por {activeTab === "daily" ? "Hora" : activeTab === "weekly" ? "Día" : "Día del Mes"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart data={salesBarChartData} />
              </CardContent>
            </Card>

            <Card
              className={`transition-all duration-300 ${animateCharts ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-primary" />
                  Tendencia de Ventas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart data={lineChartData} />
              </CardContent>
            </Card>

            <Card
              className={`transition-all duration-300 ${animateCharts ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2 text-red-500" />
                  Gastos por {activeTab === "daily" ? "Hora" : activeTab === "weekly" ? "Día" : "Día del Mes"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart data={expensesBarChartData} />
              </CardContent>
            </Card>

            <Card
              className={`transition-all duration-300 ${animateCharts ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Detalles</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={reportView === "sales" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setReportView("sales")}
                  >
                    Ventas
                  </Button>
                  <Button
                    variant={reportView === "expenses" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setReportView("expenses")}
                  >
                    Gastos
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {reportView === "sales" ? (
                  <SalesList sales={filteredSales} formatPrice={formatPrice} />
                ) : (
                  <ExpensesList expenses={filteredExpenses} formatPrice={formatPrice} />
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex items-center text-sm text-muted-foreground">
                  <ArrowRight className="h-4 w-4 mr-1" />
                  <span>
                    {reportView === "sales"
                      ? `${filteredSales.length} ventas encontradas`
                      : `${filteredExpenses.length} gastos encontrados`}
                  </span>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
