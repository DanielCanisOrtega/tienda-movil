"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Plus, Search, User, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { BottomNavigation } from "@/components/bottom-navigation"

// Interfaz para los empleados
interface Employee {
  id: number
  nombre: string
  email?: string
  telefono?: string
  cargo?: string
  activo: boolean
}

// Datos de ejemplo para empleados
const sampleEmployees: Employee[] = [
  {
    id: 1,
    nombre: "Juan Pérez",
    email: "juan@tiendamixta.com",
    telefono: "3001234567",
    cargo: "Vendedor Senior",
    activo: true,
  },
  {
    id: 2,
    nombre: "María López",
    email: "maria@tiendamixta.com",
    telefono: "3109876543",
    cargo: "Vendedor",
    activo: true,
  },
  {
    id: 3,
    nombre: "Carlos Rodríguez",
    email: "carlos@tiendamixta.com",
    telefono: "3201234567",
    cargo: "Vendedor",
    activo: true,
  },
  {
    id: 4,
    nombre: "Ana Martínez",
    email: "ana@tiendamixta.com",
    telefono: "3001234568",
    cargo: "Cajero",
    activo: true,
  },
  {
    id: 5,
    nombre: "Pedro Gómez",
    email: "pedro@tiendamixta.com",
    telefono: "3109876544",
    cargo: "Vendedor",
    activo: true,
  },
  {
    id: 6,
    nombre: "Laura Sánchez",
    email: "laura@tiendamixta.com",
    telefono: "3201234568",
    cargo: "Cajero",
    activo: true,
  },
]

export default function StoreEmployeesPage() {
  const router = useRouter()
  const params = useParams()
  const storeId = params.id as string

  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [userType, setUserType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [storeName, setStoreName] = useState<string>("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEmployeeName, setNewEmployeeName] = useState("")
  const [newEmployeeEmail, setNewEmployeeEmail] = useState("")
  const [newEmployeePhone, setNewEmployeePhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [nextId, setNextId] = useState(7) // Para generar IDs únicos

  // Verificar si el usuario es administrador
  useEffect(() => {
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)

    if (storedUserType !== "admin") {
      // Redirigir a la página de inicio si no es administrador
      router.push("/")
      return
    }

    // Obtener el nombre de la tienda seleccionada
    const selectedStoreName = localStorage.getItem("selectedStoreName")
    if (selectedStoreName) {
      setStoreName(selectedStoreName)
    }

    // Cargar empleados de ejemplo o del localStorage
    loadEmployees()
  }, [router, storeId])

  // Cargar empleados
  const loadEmployees = () => {
    setIsLoading(true)

    // Intentar cargar empleados del localStorage
    const storedEmployees = localStorage.getItem(`store_${storeId}_employees`)

    if (storedEmployees) {
      const parsedEmployees = JSON.parse(storedEmployees)
      setEmployees(parsedEmployees)
      setFilteredEmployees(parsedEmployees.filter((emp:Employee) => emp.activo))
    } else {
      // Si no hay datos en localStorage, usar los datos de ejemplo
      setEmployees(sampleEmployees)
      setFilteredEmployees(sampleEmployees)
      // Guardar en localStorage para futuras visitas
      localStorage.setItem(`store_${storeId}_employees`, JSON.stringify(sampleEmployees))
    }

    setIsLoading(false)
  }

  // Filtrar empleados según búsqueda
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEmployees(employees.filter((emp) => emp.activo))
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = employees.filter(
        (employee) =>
          employee.activo &&
          (employee.nombre.toLowerCase().includes(query) ||
            (employee.email && employee.email.toLowerCase().includes(query)) ||
            (employee.telefono && employee.telefono.includes(query)) ||
            (employee.cargo && employee.cargo.toLowerCase().includes(query))),
      )
      setFilteredEmployees(filtered)
    }
  }, [employees, searchQuery])

  // Añadir empleado
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newEmployeeName.trim()) {
      alert("El nombre del empleado es obligatorio")
      return
    }

    setIsSubmitting(true)

    // Crear nuevo empleado
    const newEmployee: Employee = {
      id: nextId,
      nombre: newEmployeeName,
      email: newEmployeeEmail || undefined,
      telefono: newEmployeePhone || undefined,
      cargo: "Vendedor",
      activo: true,
    }

    // Actualizar estado
    const updatedEmployees = [...employees, newEmployee]
    setEmployees(updatedEmployees)
    setFilteredEmployees(updatedEmployees.filter((emp) => emp.activo))

    // Guardar en localStorage
    localStorage.setItem(`store_${storeId}_employees`, JSON.stringify(updatedEmployees))

    // Incrementar el ID para el próximo empleado
    setNextId(nextId + 1)

    // Limpiar formulario
    setNewEmployeeName("")
    setNewEmployeeEmail("")
    setNewEmployeePhone("")
    setShowAddForm(false)
    setIsSubmitting(false)

    alert("Vendedor añadido con éxito")
  }

  // "Eliminar" empleado (solo ocultar)
  const handleRemoveEmployee = (employeeId: number, nombre: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar al vendedor ${nombre} de esta tienda?`)) {
      // Mark as inactive instead of removing
      const updatedEmployees = employees.map((emp) => (emp.id === employeeId ? { ...emp, activo: false } : emp))

      setEmployees(updatedEmployees)
      setFilteredEmployees(updatedEmployees.filter((emp) => emp.activo))

      // Save to localStorage
      localStorage.setItem(`store_${storeId}_employees`, JSON.stringify(updatedEmployees))

      alert("Vendedor eliminado con éxito")
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top has-bottom-nav">
      <div className="bg-primary text-white p-5">
        <div className="flex items-center mb-2">
          <Link href="/home" className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold">Vendedores de {storeName}</h1>
        </div>
        <p className="text-sm opacity-80 mt-1">Gestiona los vendedores de esta tienda</p>
      </div>

      <div className="container max-w-md mx-auto p-4 space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
            <Input
              placeholder="Buscar vendedores..."
              className="pl-10 bg-input-bg border-0 h-12 text-base rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Button
          className="w-full h-12 bg-primary hover:bg-primary-dark flex items-center justify-center"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="mr-2 h-5 w-5" />
          Añadir Vendedor
        </Button>

        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Añadir Vendedor</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="nombre" className="text-sm font-medium">
                    Nombre Completo
                  </label>
                  <Input
                    id="nombre"
                    value={newEmployeeName}
                    onChange={(e) => setNewEmployeeName(e.target.value)}
                    placeholder="Nombre del vendedor"
                    className="bg-input-bg border-0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Correo Electrónico
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployeeEmail}
                    onChange={(e) => setNewEmployeeEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="bg-input-bg border-0"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="telefono" className="text-sm font-medium">
                    Teléfono
                  </label>
                  <Input
                    id="telefono"
                    value={newEmployeePhone}
                    onChange={(e) => setNewEmployeePhone(e.target.value)}
                    placeholder="300 123 4567"
                    className="bg-input-bg border-0"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowAddForm(false)
                      setNewEmployeeName("")
                      setNewEmployeeEmail("")
                      setNewEmployeePhone("")
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary-dark" disabled={isSubmitting}>
                    {isSubmitting ? "Agregando..." : "Agregar"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-text-secondary">Cargando vendedores...</p>
            </CardContent>
          </Card>
        ) : filteredEmployees.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-text-secondary mb-2">No hay vendedores registrados</p>
              <p className="text-sm text-text-secondary">Comienza añadiendo vendedores a esta tienda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{employee.nombre}</h3>
                      {employee.email && <p className="text-sm text-text-secondary">{employee.email}</p>}
                      {employee.telefono && <p className="text-sm text-text-secondary">{employee.telefono}</p>}
                      {employee.cargo && <p className="text-xs text-primary mt-1">{employee.cargo}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500"
                      onClick={() => handleRemoveEmployee(employee.id, employee.nombre)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </main>
  )
}

