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
  FileText,
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

  // Función para exportar a CSV (más simple y confiable)
  const exportToCSV = () => {
    try {
      setIsExporting(true)

      const filteredSales = getFilteredSales()
      const filteredExpenses = getFilteredExpenses()
      const totalSales = calculateTotalSales(filteredSales)
      const totalExpenses = calculateTotalExpenses(filteredExpenses)
      const balance = totalSales - totalExpenses

      // Crear contenido CSV
      let csvContent = "data:text/csv;charset=utf-8,"

      // Resumen
      csvContent += "RESUMEN FINANCIERO\n"
      csvContent += `Período,${getPeriodText()}\n`
      csvContent += `Tienda,${localStorage.getItem("selectedStoreName") || "Tienda"}\n`
      csvContent += `Fecha de reporte,${new Date().toLocaleString("es-CO")}\n`
      csvContent += `Total Ingresos,${totalSales}\n`
      csvContent += `Total Gastos,${totalExpenses}\n`
      csvContent += `Balance,${balance}\n`
      csvContent += `Número de ventas,${filteredSales.length}\n`
      csvContent += `Número de gastos,${filteredExpenses.length}\n\n`

      // Ventas detalladas
      csvContent += "VENTAS DETALLADAS\n"
      csvContent +=
        "ID Venta,Fecha,Hora,Cliente,Método de Pago,Producto,Categoría,Cantidad,Precio Unitario,Subtotal,Total Venta\n"

      filteredSales.forEach((sale) => {
        const saleDate = new Date(sale.date)
        const formattedDate = saleDate.toLocaleDateString("es-CO")
        const formattedTime = saleDate.toLocaleTimeString("es-CO")

        sale.items.forEach((item, index) => {
          csvContent += `${index === 0 ? sale.id : ""},`
          csvContent += `${index === 0 ? formattedDate : ""},`
          csvContent += `${index === 0 ? formattedTime : ""},`
          csvContent += `${index === 0 ? sale.customerInfo?.name || "Cliente general" : ""},`
          csvContent += `${index === 0 ? sale.paymentMethod || "No especificado" : ""},`
          csvContent += `${item.product.name || item.product.nombre || "Producto"},`
          csvContent += `${item.product.category || item.product.categoria || "Sin categoría"},`
          csvContent += `${item.quantity},`
          csvContent += `${item.product.price || item.product.precio || 0},`
          csvContent += `${(item.product.price || item.product.precio || 0) * item.quantity},`
          csvContent += `${index === 0 ? sale.total : ""}\n`
        })
      })

      csvContent += "\nGASTOS DETALLADOS\n"
      csvContent += "ID,Fecha,Categoría,Descripción,Monto\n"

      filteredExpenses.forEach((expense) => {
        const expenseDate = new Date(expense.date)
        const formattedDate = expenseDate.toLocaleDateString("es-CO")

        csvContent += `${expense.id},`
        csvContent += `${formattedDate},`
        csvContent += `${expense.categoria || "Sin categoría"},`
        csvContent += `${expense.descripcion || ""},`
        csvContent += `${expense.amount}\n`
      })

      // Descargar archivo
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      const storeName = localStorage.getItem("selectedStoreName") || "Tienda"
      const date = new Date().toISOString().split("T")[0]
      link.setAttribute("download", `Reporte_${storeName}_${date}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Reporte exportado",
        description: "El reporte ha sido exportado como archivo CSV",
      })
    } catch (error) {
      console.error("Error al exportar CSV:", error)
      toast({
        title: "Error al exportar",
        description: "No se pudo exportar el reporte. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Función para exportar reporte HTML visual
  const exportToHTML = () => {
    try {
      setIsExporting(true)

      const filteredSales = getFilteredSales()
      const filteredExpenses = getFilteredExpenses()
      const totalSales = calculateTotalSales(filteredSales)
      const totalExpenses = calculateTotalExpenses(filteredExpenses)
      const balance = totalSales - totalExpenses

      const storeName = localStorage.getItem("selectedStoreName") || "Tienda"
      const date = new Date().toLocaleString("es-CO")

      // Crear contenido HTML
      const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte Financiero - ${storeName}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #6366f1;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #6366f1;
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            color: #666;
            margin: 10px 0;
            font-size: 1.1em;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .summary-card.income {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
        }
        .summary-card.expense {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
        }
        .summary-card.balance {
            background: linear-gradient(135deg, ${balance >= 0 ? "#6366f1, #4f46e5" : "#ef4444, #dc2626"});
            color: white;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            font-size: 1.2em;
        }
        .summary-card .amount {
            font-size: 2em;
            font-weight: bold;
            margin: 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background: #6366f1;
            color: white;
            font-weight: bold;
        }
        tr:hover {
            background-color: #f9fafb;
        }
        .section {
            margin: 40px 0;
        }
        .section h2 {
            color: #374151;
            border-left: 4px solid #6366f1;
            padding-left: 15px;
            margin-bottom: 20px;
        }
        .no-data {
            text-align: center;
            color: #6b7280;
            font-style: italic;
            padding: 40px;
        }
        @media print {
            body { margin: 0; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Reporte Financiero</h1>
            <p><strong>${storeName}</strong></p>
            <p>Período: ${getPeriodText()} | Generado: ${date}</p>
        </div>

        <div class="summary">
            <div class="summary-card income">
                <h3>💰 Total Ingresos</h3>
                <p class="amount">${formatPrice(totalSales)}</p>
                <p>${filteredSales.length} ventas</p>
            </div>
            <div class="summary-card expense">
                <h3>💸 Total Gastos</h3>
                <p class="amount">${formatPrice(totalExpenses)}</p>
                <p>${filteredExpenses.length} gastos</p>
            </div>
            <div class="summary-card balance">
                <h3>${balance >= 0 ? "📈" : "📉"} Balance</h3>
                <p class="amount">${formatPrice(balance)}</p>
                <p>${balance >= 0 ? "Ganancia" : "Pérdida"}</p>
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
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Productos</th>
                        <th>Método de Pago</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredSales
                      .map(
                        (sale) => `
                    <tr>
                        <td>${sale.id}</td>
                        <td>${new Date(sale.date).toLocaleString("es-CO")}</td>
                        <td>${sale.customerInfo?.name || "Cliente general"}</td>
                        <td>
                            ${sale.items
                              .map((item) => `${item.product.name || item.product.nombre} (${item.quantity})`)
                              .join(", ")}
                        </td>
                        <td>${sale.paymentMethod || "No especificado"}</td>
                        <td><strong>${formatPrice(sale.total)}</strong></td>
                    </tr>
                    `,
                      )
                      .join("")}
                </tbody>
            </table>
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
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Categoría</th>
                        <th>Descripción</th>
                        <th>Monto</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredExpenses
                      .map(
                        (expense) => `
                    <tr>
                        <td>${expense.id}</td>
                        <td>${new Date(expense.date).toLocaleDateString("es-CO")}</td>
                        <td>${expense.categoria || "Sin categoría"}</td>
                        <td>${expense.descripcion || "-"}</td>
                        <td><strong>${formatPrice(expense.amount)}</strong></td>
                    </tr>
                    `,
                      )
                      .join("")}
                </tbody>
            </table>
            `
                : '<div class="no-data">No hay gastos en este período</div>'
            }
        </div>
    </div>
</body>
</html>`

      // Crear y descargar archivo HTML
      const blob = new Blob([htmlContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      const fileName = `Reporte_${storeName}_${new Date().toISOString().split("T")[0]}.html`
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Reporte exportado",
        description: `Reporte HTML visual exportado como ${fileName}`,
      })
    } catch (error) {
      console.error("Error al exportar HTML:", error)
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
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex items-center gap-1"
            onClick={exportToHTML}
            disabled={isExporting}
          >
            {isExporting ? (
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FileText className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">HTML</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex items-center gap-1"
            onClick={exportToCSV}
            disabled={isExporting}
          >
            {isExporting ? (
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            <span>CSV</span>
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
                onClick={exportToHTML}
                disabled={isExporting}
                title="Exportar resumen visual"
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
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                    Ingresos
                  </p>
                  <p className="text-xl font-bold text-green-600">{formatPrice(totalSales)}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center">
                    <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
                    Gastos
                  </p>
                  <p className="text-xl font-bold text-red-600">{formatPrice(totalExpenses)}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div
                className={`p-3 rounded-lg ${balance >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}
              >
                <p className="text-sm text-muted-foreground">Balance</p>
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
                formatPrice={formatPrice}
                period={getPeriodText()}
                type="sales"
                animateCharts={animateCharts}
                onExport={exportToHTML}
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
                formatPrice={formatPrice}
                period={getPeriodText()}
                type="expenses"
                animateCharts={animateCharts}
                onExport={exportToHTML}
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
                    onClick={exportToHTML}
                    disabled={isExporting}
                    title="Exportar balance visual"
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
                  <p className="text-sm text-muted-foreground">Balance {getPeriodText()}</p>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <h3 className="font-medium mb-3 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                        Detalle de Ventas
                      </h3>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
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
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
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
            title={`Exportar ${type === "sales" ? "ventas" : "gastos"}`}
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
          <p className="text-sm text-muted-foreground">
            Total de {type === "sales" ? "ventas" : "gastos"} {period}
          </p>

          <div className="mt-6">
            <h3 className="font-medium mb-2 flex items-center">
              <BarChart2 className="h-4 w-4 mr-2 text-primary" />
              {type === "sales" ? "Ventas" : "Gastos"} por período
            </h3>
            <div className="h-64 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 p-2">
              <BarChart data={barChartData} />
            </div>
          </div>

          {type === "sales" && lineChartData.length > 0 && (
            <>
              <Separator className="my-6" />
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                  Tendencia de ventas
                </h3>
                <div className="h-48 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 p-2">
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
                <FileText className="h-4 w-4 mr-2" />
                Exportar HTML
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
            title={`Exportar detalle de ${type === "sales" ? "ventas" : "gastos"}`}
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
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <SalesList sales={sales} formatPrice={formatPrice} />
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
              <ExpensesList expenses={expenses} formatPrice={formatPrice} />
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
