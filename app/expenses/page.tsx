"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, Plus, Edit, Trash2, Search, Filter } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Definir la interfaz para los gastos
export interface Expense {
  id: string
  description: string
  amount: number
  date: string
  category: string
  paymentMethod: string
  receipt?: string
  notes?: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month")
  const [categories, setCategories] = useState<string[]>([
    "Todos",
    "Pedidos",
    "Servicios",
    "Nómina",
    "Alquiler",
    "Impuestos",
    "Otros",
  ])

  // Cargar gastos del localStorage
  useEffect(() => {
    const storedExpenses = localStorage.getItem("expenses")
    if (storedExpenses) {
      const parsedExpenses = JSON.parse(storedExpenses)
      setExpenses(parsedExpenses)
    }
  }, [])

  // Filtrar gastos según búsqueda, categoría y período
  useEffect(() => {
    let result = [...expenses]

    // Filtrar por período
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Domingo como inicio de semana
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfYear = new Date(today.getFullYear(), 0, 1)

    switch (selectedPeriod) {
      case "day":
        result = result.filter((expense) => new Date(expense.date) >= startOfDay)
        break
      case "week":
        result = result.filter((expense) => new Date(expense.date) >= startOfWeek)
        break
      case "month":
        result = result.filter((expense) => new Date(expense.date) >= startOfMonth)
        break
      case "year":
        result = result.filter((expense) => new Date(expense.date) >= startOfYear)
        break
      // "all" no necesita filtro
    }

    // Filtrar por categoría
    if (selectedCategory !== "Todos") {
      result = result.filter((expense) => expense.category === selectedCategory)
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (expense) => expense.description.toLowerCase().includes(query) || expense.notes?.toLowerCase().includes(query),
      )
    }

    // Ordenar por fecha (más reciente primero)
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setFilteredExpenses(result)
  }, [expenses, searchQuery, selectedCategory, selectedPeriod])

  // Formatear precio en pesos colombianos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleDeleteExpense = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este gasto?")) {
      const updatedExpenses = expenses.filter((expense) => expense.id !== id)
      setExpenses(updatedExpenses)
      localStorage.setItem("expenses", JSON.stringify(updatedExpenses))
    }
  }

  // Calcular el total de gastos filtrados
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top has-bottom-nav">
      <div className="bg-white p-4 flex items-center">
        <Link href="/home" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Gastos</h1>
      </div>

      <div className="bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
          <Input
            placeholder="Buscar gastos..."
            className="pl-10 bg-input-bg border-0 h-12 text-base rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <Tabs defaultValue="month" value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="day">Hoy</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="month">Mes</TabsTrigger>
              <TabsTrigger value="year">Año</TabsTrigger>
              <TabsTrigger value="all">Todo</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="mt-4">
          <div className="flex items-center mb-2">
            <Filter className="h-4 w-4 mr-2 text-text-secondary" />
            <span className="text-sm text-text-secondary">Filtrar por categoría</span>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="bg-input-bg border-0 h-10">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="container max-w-md mx-auto p-4">
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-text-secondary">Total de gastos</p>
                <p className="text-2xl font-bold text-danger">{formatPrice(totalExpenses)}</p>
              </div>
              <Link href="/add-expense">
                <Button className="bg-primary hover:bg-primary-dark">
                  <Plus className="mr-2 h-5 w-5" />
                  Añadir Gasto
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-text-secondary mb-2">No hay gastos registrados</p>
            <p className="text-sm text-text-secondary">Comienza añadiendo los gastos de tu negocio</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{expense.description}</h3>
                      <p className="text-sm text-text-secondary mt-1">{formatDate(expense.date)}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs px-2 py-1 bg-input-bg rounded-full">{expense.category}</span>
                        <span className="text-xs px-2 py-1 bg-input-bg rounded-full ml-2">{expense.paymentMethod}</span>
                      </div>
                    </div>
                    <div className="font-bold text-danger">{formatPrice(expense.amount)}</div>
                  </div>

                  {expense.notes && <p className="text-sm mt-2 text-text-secondary">{expense.notes}</p>}

                  <div className="flex justify-end mt-3 space-x-2">
                    <Link href={`/edit-expense/${expense.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4 text-primary" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500"
                      onClick={() => handleDeleteExpense(expense.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </main>
  )
}

