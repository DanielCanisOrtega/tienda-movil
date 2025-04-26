"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Plus, Search, User, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { fetchWithAuth } from "@/services/auth-service"

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
const generateSampleEmployees = (): Employee[] => {
  return [
    {
      id: 1,
      nombre: "Juan Pérez",
      email: "juan@tiendamixta.com",
      telefono: "+57 3124567890",
      cargo: "Vendedor Senior",
      activo: true,
    },
    {
      id: 2,
      nombre: "María López",
      email: "maria@tiendamixta.com",
      telefono: "+57 3209876543",
      cargo: "Vendedor",
      activo: true,
    },
    {
      id: 3,
      nombre: "Carlos Rodríguez",
      email: "carlos@tiendamixta.com",
      telefono: "+57 3157894561",
      cargo: "Vendedor",
      activo: true,
    },
    {
      id: 4,
      nombre: "Ana Martínez",
      email: "ana@tiendamixta.com",
      telefono: "+57 3112345678",
      cargo: "Vendedor Junior",
      activo: true,
    },
  ]
}

export default function StoreEmployeesPage() {
  const router = useRouter()
  const params = useParams()
  const storeId = params.id as string
  const { toast } = useToast()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [userType, setUserType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [storeName, setStoreName] = useState<string>("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newEmployeeName, setNewEmployeeName] = useState("")
  const [newEmployeeEmail, setNewEmployeeEmail] = useState("")
  const [newEmployeePhone, setNewEmployeePhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

    // Cargar empleados desde localStorage o generar datos de ejemplo
    fetchEmployees()
  }, [router, storeId])

  // Cargar empleados desde la API o localStorage
  const fetchEmployees = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Intentar obtener empleados de la API
      console.log(`Obteniendo empleados para tienda_id=${storeId}`)

      const response = await fetch(`https://tienda-backend-p9ms.onrender.com/api/tiendas/${storeId}/empleados/`)

      if (response.ok) {
        const data = await response.json()
        console.log("Empleados obtenidos de la API:", data)

        // Transformar los datos si es necesario para que coincidan con nuestra interfaz
        const formattedEmployees = data.map((emp: any) => ({
          id: emp.id || emp.usuario_id,
          nombre: emp.nombre || emp.usuario_nombre,
          email: emp.email,
          telefono: emp.telefono,
          cargo: emp.cargo || "Vendedor",
          activo: emp.activo !== false,
        }))

        setEmployees(formattedEmployees)
        setFilteredEmployees(formattedEmployees.filter((emp: Employee) => emp.activo !== false))

        // Guardar en localStorage para uso futuro
        localStorage.setItem(`store_${storeId}_employees`, JSON.stringify(formattedEmployees))
      } else {
        // Si la API falla, intentar cargar desde localStorage
        console.log("Error al obtener empleados de la API, intentando desde localStorage")
        const storedEmployees = localStorage.getItem(`store_${storeId}_employees`)

        if (storedEmployees) {
          const parsedEmployees = JSON.parse(storedEmployees)
          setEmployees(parsedEmployees)
          setFilteredEmployees(parsedEmployees.filter((emp: Employee) => emp.activo !== false))
        } else {
          // Si no hay datos en localStorage, generar datos de ejemplo
          const sampleEmployees = generateSampleEmployees()
          setEmployees(sampleEmployees)
          setFilteredEmployees(sampleEmployees)
          // Guardar en localStorage para futuras visitas
          localStorage.setItem(`store_${storeId}_employees`, JSON.stringify(sampleEmployees))
        }
      }
    } catch (err) {
      console.error("Error al cargar los empleados:", err)
      setError(`No se pudieron cargar los empleados: ${err instanceof Error ? err.message : "Error desconocido"}`)

      // Intentar cargar desde localStorage como fallback
      const storedEmployees = localStorage.getItem(`store_${storeId}_employees`)
      if (storedEmployees) {
        const parsedEmployees = JSON.parse(storedEmployees)
        setEmployees(parsedEmployees)
        setFilteredEmployees(parsedEmployees.filter((emp: Employee) => emp.activo !== false))
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar empleados según búsqueda
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEmployees(employees.filter((emp) => emp.activo !== false))
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = employees.filter(
        (employee) =>
          employee.activo !== false &&
          (employee.nombre.toLowerCase().includes(query) ||
            (employee.email && employee.email.toLowerCase().includes(query)) ||
            (employee.telefono && employee.telefono.includes(query)) ||
            (employee.cargo && employee.cargo.toLowerCase().includes(query))),
      )
      setFilteredEmployees(filtered)
    }
  }, [employees, searchQuery])

  // Añadir empleado usando la API
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newEmployeeName.trim()) {
      setError("El nombre del empleado es obligatorio")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Intentar añadir empleado a través de la API
      console.log(`Añadiendo empleado a tienda_id=${storeId}`)

      const employeeData = {
        nombre: newEmployeeName,
        email: newEmployeeEmail || undefined,
        telefono: newEmployeePhone || undefined,
        cargo: "Vendedor",
      }

      console.log("Datos del empleado a añadir:", employeeData)

      const response = await fetchWithAuth(
        `https://tienda-backend-p9ms.onrender.com/api/tiendas/${storeId}/agregar_empleado/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(employeeData),
        },
      )

      if (response.ok) {
        const data = await response.json()
        console.log("Empleado añadido exitosamente:", data)

        // Actualizar la lista de empleados
        await fetchEmployees()

        // Limpiar formulario y cerrar diálogo
        setNewEmployeeName("")
        setNewEmployeeEmail("")
        setNewEmployeePhone("")
        setIsAddDialogOpen(false)

        // Mostrar mensaje de éxito
        toast({
          title: "Vendedor añadido",
          description: "El vendedor ha sido añadido con éxito",
          variant: "success",
        })
      } else {
        // Si la API falla, añadir localmente
        console.log("Error al añadir empleado a través de la API, añadiendo localmente")

        // Obtener empleados actuales
        const currentEmployees = [...employees]

        // Generar un nuevo ID (el más alto + 1)
        const newId = currentEmployees.length > 0 ? Math.max(...currentEmployees.map((emp) => emp.id)) + 1 : 1

        // Crear el nuevo empleado
        const newEmployee: Employee = {
          id: newId,
          nombre: newEmployeeName,
          email: newEmployeeEmail || undefined,
          telefono: newEmployeePhone || undefined,
          cargo: "Vendedor",
          activo: true,
        }

        // Añadir el nuevo empleado a la lista
        const updatedEmployees = [...currentEmployees, newEmployee]

        // Actualizar estado
        setEmployees(updatedEmployees)
        setFilteredEmployees(updatedEmployees.filter((emp) => emp.activo !== false))

        // Guardar en localStorage
        localStorage.setItem(`store_${storeId}_employees`, JSON.stringify(updatedEmployees))

        // Limpiar formulario y cerrar diálogo
        setNewEmployeeName("")
        setNewEmployeeEmail("")
        setNewEmployeePhone("")
        setIsAddDialogOpen(false)

        // Mostrar mensaje de éxito
        toast({
          title: "Vendedor añadido localmente",
          description: "El vendedor ha sido añadido con éxito (modo local)",
          variant: "success",
        })
      }
    } catch (err) {
      console.error("Error al añadir el empleado:", err)
      setError(`No se pudo añadir el empleado: ${err instanceof Error ? err.message : "Error desconocido"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Eliminar empleado localmente
  const handleRemoveEmployee = (employeeId: number, nombre: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar al vendedor ${nombre} de esta tienda?`)) {
      try {
        // Marcar como inactivo en lugar de eliminar completamente
        const updatedEmployees = employees.map((emp) => (emp.id === employeeId ? { ...emp, activo: false } : emp))

        // Actualizar estado
        setEmployees(updatedEmployees)
        setFilteredEmployees(updatedEmployees.filter((emp) => emp.activo !== false))

        // Guardar en localStorage
        localStorage.setItem(`store_${storeId}_employees`, JSON.stringify(updatedEmployees))

        toast({
          title: "Vendedor eliminado",
          description: "El vendedor ha sido eliminado con éxito",
          variant: "success",
        })
      } catch (err) {
        console.error("Error al eliminar el empleado:", err)
        toast({
          title: "Error",
          description: `No se pudo eliminar el empleado: ${err instanceof Error ? err.message : "Error desconocido"}`,
          variant: "destructive",
        })
      }
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
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="mr-2 h-5 w-5" />
          Añadir Vendedor
        </Button>

        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-text-secondary">Cargando vendedores...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchEmployees} className="bg-primary hover:bg-primary-dark">
                Reintentar
              </Button>
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

      {/* Diálogo para añadir empleado */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Vendedor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEmployee}>
            <div className="space-y-4 py-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="employeeName">Nombre del Vendedor</Label>
                <Input
                  id="employeeName"
                  value={newEmployeeName}
                  onChange={(e) => setNewEmployeeName(e.target.value)}
                  placeholder="Nombre completo"
                  className="bg-input-bg border-0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeEmail">Correo Electrónico</Label>
                <Input
                  id="employeeEmail"
                  type="email"
                  value={newEmployeeEmail}
                  onChange={(e) => setNewEmployeeEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="bg-input-bg border-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeePhone">Teléfono</Label>
                <Input
                  id="employeePhone"
                  value={newEmployeePhone}
                  onChange={(e) => setNewEmployeePhone(e.target.value)}
                  placeholder="+57 3123456789"
                  className="bg-input-bg border-0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setNewEmployeeName("")
                  setNewEmployeeEmail("")
                  setNewEmployeePhone("")
                  setError(null)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary-dark" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Añadiendo...
                  </>
                ) : (
                  "Añadir"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </main>
  )
}
