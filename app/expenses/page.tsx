"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, Plus, Edit, Trash2, Search, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BottomNavigation } from "@/components/bottom-navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export interface Expense {
  id: string
  descripcion: string
  amount: number
  date: string
  categoria: string
  paymentMethod: string
  receipt?: string
  notes?: string
  storeId?: string
}

// Generar datos de ejemplo para gastos
const generateSampleExpenses = (): Expense[] => {
  const categories = ["Pedidos", "Servicios", "Nómina", "Alquiler", "Impuestos", "Otros"]
  const paymentMethods = ["Efectivo", "Transferencia", "Tarjeta de Débito", "Tarjeta de Crédito", "Otro"]

  const expenses: Expense[] = []
  const today = new Date()
  const storeId = localStorage.getItem("selectedStoreId") || "1"

  // Generar gastos para los últimos 30 días
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)

    // Generar entre 0 y 3 gastos por día
    const expensesPerDay = Math.floor(Math.random() * 4)

    for (let j = 0; j < expensesPerDay; j++) {
      const category = categories[Math.floor(Math.random() * categories.length)]
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]

      // Generar monto aleatorio entre 10,000 y 500,000
      const amount = Math.floor(Math.random() * 490000) + 10000

      expenses.push({
        id: `expense-${i}-${j}`,
        descripcion: `Gasto de ${category.toLowerCase()}`,
        amount,
        date: date.toISOString().split("T")[0], // Formato YYYY-MM-DD
        categoria: category,
        paymentMethod,
        notes: Math.random() > 0.7 ? `Notas adicionales para el gasto de ${category.toLowerCase()}` : "",
        storeId,
      })
    }
  }

  return expenses
}

// Formatear fecha para mostrar
const formatDate = (dateString: string) => {
  try {
    const dateParts = dateString.split("-")
    if (dateParts.length === 3) {
      // Si es formato YYYY-MM-DD, convertir a Date
      const date = new Date(
        Number.parseInt(dateParts[0]),
        Number.parseInt(dateParts[1]) - 1,
        Number.parseInt(dateParts[2]),
      )
      const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
      return date.toLocaleDateString("es-CO", options)
    }
    return dateString // Si no se puede parsear, devolver el string original
  } catch (error) {
    return dateString
  }
}

// Filtrar gastos por fecha
const filterExpensesByDate = (expenses: Expense[], period: string): Expense[] => {
  // Obtener la fecha actual y resetear la hora a 00:00:00
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Calcular el inicio de la semana (domingo)
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())

  // Calcular el inicio del mes
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  return expenses.filter((expense) => {
    // Convertir la fecha del gasto a un objeto Date para comparación correcta
    const parts = expense.date.split("-")
    // Asegurarse de que la fecha tenga el formato correcto (YYYY-MM-DD)
    if (parts.length !== 3) {
      return false
    }

    const expenseDate = new Date(
      Number.parseInt(parts[0]), // año
      Number.parseInt(parts[1]) - 1, // mes (0-11)
      Number.parseInt(parts[2]), // día
    )

    // Resetear la hora a 00:00:00 para comparar solo fechas
    expenseDate.setHours(0, 0, 0, 0)

    switch (period) {
      case "today":
        // Comparar si la fecha del gasto es igual a hoy
        return expenseDate.getTime() === today.getTime()
      case "week":
        // Verificar si la fecha del gasto es posterior o igual al inicio de la semana
        return expenseDate >= startOfWeek
      case "month":
        // Verificar si la fecha del gasto es posterior o igual al inicio del mes
        return expenseDate >= startOfMonth
      default:
        return true
    }
  })
}

export default function ExpensesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [storeId, setStoreId] = useState<string | null>(null)
  const [timePeriod, setTimePeriod] = useState<"today" | "week" | "month">("today")
  const [error, setError] = useState<string | null>(null)

  // Cargar gastos
  useEffect(() => {
    // Obtener el ID de la tienda seleccionada
    const selectedStoreId = localStorage.getItem("selectedStoreId")
    if (selectedStoreId) {
      setStoreId(selectedStoreId)
    }

    // Cargar gastos
    loadExpenses()
  }, [])

  // Cargar gastos desde localStorage o generar datos de ejemplo
  const loadExpenses = () => {
    setIsLoading(true)
    setError(null)

    try {
      // Intentar cargar gastos del localStorage
      const storedExpenses = localStorage.getItem("expenses")

      if (storedExpenses) {
        const parsedExpenses = JSON.parse(storedExpenses)
        setExpenses(parsedExpenses)

        // Aplicar filtros iniciales
        let filtered = [...parsedExpenses]
        if (storeId) {
          filtered = filtered.filter((expense) => !expense.storeId || expense.storeId === storeId)
        }
        filtered = filterExpensesByDate(filtered, timePeriod)
        setFilteredExpenses(filtered)

        // Extraer categorías únicas
        const uniqueCategories = Array.from(
          new Set(parsedExpenses.map((expense: Expense) => expense.categoria)),
        ) as string[]
        setCategories(uniqueCategories)
      } else {
        // Si no hay datos en localStorage, generar datos de ejemplo
        const sampleExpenses = generateSampleExpenses()
        setExpenses(sampleExpenses)

        // Aplicar filtros iniciales
        let filtered = [...sampleExpenses]
        if (storeId) {
          filtered = filtered.filter((expense) => !expense.storeId || expense.storeId === storeId)
        }
        filtered = filterExpensesByDate(filtered, timePeriod)
        setFilteredExpenses(filtered)

        // Extraer categorías únicas
        const uniqueCategories = Array.from(new Set(sampleExpenses.map((expense) => expense.categoria))) as string[]
        setCategories(uniqueCategories)

        // Guardar en localStorage para futuras visitas
        localStorage.setItem("expenses", JSON.stringify(sampleExpenses))
      }
    } catch (err) {
      console.error("Error al cargar gastos:", err)
      setError(`No se pudieron cargar los gastos: ${err instanceof Error ? err.message : "Error desconocido"}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar gastos cuando cambia el término de búsqueda o la categoría
  useEffect(() => {
    let filtered = [...expenses]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (expense) =>
          expense.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expense.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expense.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (expense.notes && expense.notes.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filtrar por categoría
    if (activeCategory) {
      filtered = filtered.filter((expense) => expense.categoria === activeCategory)
    }

    // Filtrar por tienda si hay un ID de tienda seleccionado
    if (storeId) {
      filtered = filtered.filter((expense) => !expense.storeId || expense.storeId === storeId)
    }

    // Aplicar filtro por período de tiempo
    filtered = filterExpensesByDate(filtered, timePeriod)

    setFilteredExpenses(filtered)
  }, [searchTerm, activeCategory, expenses, storeId, timePeriod])

  // Formatear precio en pesos colombianos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Confirmar eliminación
  const confirmDelete = (expenseId: string) => {
    setExpenseToDelete(expenseId)
    setIsDeleteDialogOpen(true)
  }

  // Eliminar gasto
  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return

    setIsDeleting(true)

    try {
      // Obtener gastos actuales
      const updatedExpenses = expenses.filter((expense) => expense.id !== expenseToDelete)

      // Actualizar estado
      setExpenses(updatedExpenses)
      setFilteredExpenses(
        updatedExpenses.filter(
          (expense) =>
            (!activeCategory || expense.categoria === activeCategory) &&
            (!searchTerm ||
              expense.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
              expense.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
              expense.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (expense.notes && expense.notes.toLowerCase().includes(searchTerm.toLowerCase()))),
        ),
      )

      // Guardar en localStorage
      localStorage.setItem("expenses", JSON.stringify(updatedExpenses))

      toast({
        title: "Gasto eliminado",
        description: "El gasto ha sido eliminado correctamente",
        variant: "success",
      })
    } catch (err) {
      console.error("Error al eliminar el gasto:", err)
      toast({
        title: "Error",
        description: "No se pudo eliminar el gasto. Por favor, intenta de nuevo más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setExpenseToDelete(null)
    }
  }

  // Filtrar por categoría
  const handleCategoryFilter = (category: string | null) => {
    setActiveCategory(category)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background-light">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-text-primary">Cargando gastos...</p>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top has-bottom-nav">
      <div className="bg-white p-4 flex items-center">
        <Link href="/home" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Gastos</h1>
      </div>

      <div className="container max-w-md mx-auto p-4 space-y-4">
        <div className="flex items-center mb-4 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
            <Input
              placeholder="Buscar gastos..."
              className="pl-10 bg-input-bg border-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link href="/add-expense">
            <Button variant="default" size="icon" className="bg-primary hover:bg-primary-dark">
              <Plus className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Filtro de categorías */}
        {categories.length > 0 && (
          <div className="flex overflow-x-auto py-2 gap-2 no-scrollbar">
            <Badge
              key="all-categories"
              variant={activeCategory === null ? "default" : "outline"}
              className={`cursor-pointer px-3 py-1 ${
                activeCategory === null ? "bg-primary text-white" : "bg-background text-text-secondary"
              }`}
              onClick={() => handleCategoryFilter(null)}
            >
              Todos
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                className={`cursor-pointer px-3 py-1 whitespace-nowrap ${
                  activeCategory === category ? "bg-primary text-white" : "bg-background text-text-secondary"
                }`}
                onClick={() => handleCategoryFilter(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        )}

        {/* Filtro de período */}
        <div className="flex justify-between mt-4 mb-2">
          <Badge
            key="period-today"
            variant={timePeriod === "today" ? "default" : "outline"}
            className={`cursor-pointer px-3 py-1 flex-1 text-center ${
              timePeriod === "today" ? "bg-primary text-white" : "bg-background text-text-secondary"
            }`}
            onClick={() => setTimePeriod("today")}
          >
            Hoy
          </Badge>
          <Badge
            key="period-week"
            variant={timePeriod === "week" ? "default" : "outline"}
            className={`cursor-pointer px-3 py-1 flex-1 text-center ${
              timePeriod === "week" ? "bg-primary text-white" : "bg-background text-text-secondary"
            }`}
            onClick={() => setTimePeriod("week")}
          >
            Semana
          </Badge>
          <Badge
            key="period-month"
            variant={timePeriod === "month" ? "default" : "outline"}
            className={`cursor-pointer px-3 py-1 flex-1 text-center ${
              timePeriod === "month" ? "bg-primary text-white" : "bg-background text-text-secondary"
            }`}
            onClick={() => setTimePeriod("month")}
          >
            Mes
          </Badge>
        </div>

        {filteredExpenses.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-text-secondary mb-4">No se encontraron gastos</p>
              <Link href="/add-expense">
                <Button className="bg-primary hover:bg-primary-dark">Registrar Gasto</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.map((expense) => (
              <Card key={expense.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{expense.descripcion}</h3>
                      <p className="text-sm text-text-secondary">{formatDate(expense.date)}</p>
                    </div>
                    <Badge variant="outline" className="bg-gray-100 text-text-secondary">
                      {expense.categoria}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-danger">{formatPrice(expense.amount)}</span>
                    <span className="text-sm text-text-secondary">{expense.paymentMethod}</span>
                  </div>

                  {expense.notes && <p className="text-sm text-text-secondary mt-2 line-clamp-2">{expense.notes}</p>}

                  <div className="flex justify-end space-x-2 mt-3">
                    <Link href={`/edit-expense/${expense.id}`}>
                      <Button variant="outline" size="sm" className="h-9 px-3">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => confirmDelete(expense.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Gasto</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este gasto? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteExpense} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </main>
  )
}
