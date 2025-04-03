"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Plus, Search, User, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { getAuthToken } from "@/services/auth-service"
import { BottomNavigation } from "@/components/bottom-navigation"

// Actualizar la interfaz Employee para que coincida con la estructura de la respuesta
interface Employee {
  id: number | string
  nombre: string
  username?: string
  email?: string
  first_name?: string
  last_name?: string
}

export default function StoreEmployeesPage() {
  const router = useRouter()
  const params = useParams()
  const storeId = params.id as string

  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [userType, setUserType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [storeName, setStoreName] = useState<string>("")
  const [showAddForm, setShowAddForm] = useState(false)
  // Cambiar para usar nombre de usuario en lugar de ID
  const [newEmployeeUsername, setNewEmployeeUsername] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

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

    // Cargar empleados de la tienda
    fetchEmployees()
  }, [router, storeId])

  // Modificar la función fetchEmployees para manejar la estructura específica de la respuesta
  const fetchEmployees = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Asegurarse de tener un token válido
      const token = await getAuthToken()
      if (!token) {
        throw new Error("No se pudo obtener un token de autenticación")
      }

      console.log(`Obteniendo empleados de la tienda con ID: ${storeId}`)

      const response = await fetch(`https://tienda-backend-p9ms.onrender.com/api/tiendas/${storeId}/empleados/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error al obtener empleados: ${response.status} - ${response.statusText}`, errorText)
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Respuesta de empleados:", data)

      // Verificar si la respuesta tiene la estructura esperada
      if (data && typeof data === "object" && Array.isArray(data.empleados)) {
        console.log(`Se encontraron ${data.empleados.length} empleados`)
        setEmployees(data.empleados)
        setFilteredEmployees(data.empleados)
      } else {
        console.error("La respuesta no tiene la estructura esperada:", data)
        setEmployees([])
        setFilteredEmployees([])
      }
    } catch (err) {
      console.error("Error al cargar los empleados:", err)
      setError(
        `No se pudieron cargar los vendedores: ${err instanceof Error ? err.message : "Error desconocido"}. Por favor, intenta de nuevo más tarde.`,
      )
      setEmployees([])
      setFilteredEmployees([])
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar empleados según búsqueda
  useEffect(() => {
    if (!Array.isArray(employees)) {
      console.error("employees no es un array:", employees)
      setFilteredEmployees([])
      return
    }

    if (searchQuery.trim() === "") {
      setFilteredEmployees(employees)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = employees.filter(
        (employee) =>
          (employee.username ? employee.username.toLowerCase().includes(query) : false) ||
          (employee.email ? employee.email.toLowerCase().includes(query) : false) ||
          `${employee.first_name || ""} ${employee.last_name || ""}`.toLowerCase().includes(query) ||
          employee.nombre.toLowerCase().includes(query),
      )
      setFilteredEmployees(filtered)
    }
  }, [employees, searchQuery])

  // Modificar la función handleAddEmployee para enviar los datos correctamente
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newEmployeeUsername.trim()) {
      setAddError("El nombre de usuario es obligatorio")
      return
    }

    setIsSubmitting(true)
    setAddError(null)

    try {
      // Asegurarse de tener un token válido
      const token = await getAuthToken()
      if (!token) {
        throw new Error("No se pudo obtener un token de autenticación")
      }

      console.log(`Agregando empleado ${newEmployeeUsername} a la tienda ${storeId}`)

      // Modificar el cuerpo de la solicitud para que coincida con lo que espera la API
      const response = await fetch(
        `https://tienda-backend-p9ms.onrender.com/api/tiendas/${storeId}/agregar_empleado/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nombre: newEmployeeUsername }),
        },
      )

      // Intentar obtener el texto de la respuesta para depuración
      let responseText
      try {
        responseText = await response.text()
        console.log("Respuesta al agregar empleado:", responseText)
      } catch (textError) {
        console.error("Error al leer la respuesta:", textError)
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText} - ${responseText || ""}`)
      }

      // Limpiar el formulario
      setNewEmployeeUsername("")
      setShowAddForm(false)

      // Recargar la lista de empleados
      await fetchEmployees()

      alert("Vendedor agregado con éxito")
    } catch (err) {
      console.error("Error al agregar el empleado:", err)
      setAddError(
        `No se pudo agregar el vendedor: ${err instanceof Error ? err.message : "Error desconocido"}. Por favor, verifica que el usuario existe y no está ya asociado a la tienda.`,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Probar un enfoque diferente para eliminar empleados
  const handleRemoveEmployee = async (employeeId: number | string, nombre: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar al vendedor ${nombre} de esta tienda?`)) {
      try {
        // Asegurarse de tener un token válido
        const token = await getAuthToken()
        if (!token) {
          throw new Error("No se pudo obtener un token de autenticación")
        }

        console.log(`Eliminando empleado ${nombre} (ID: ${employeeId}) de la tienda ${storeId}`)

        // Intentar con el ID del empleado
        const response = await fetch(
          `https://tienda-backend-p9ms.onrender.com/api/tiendas/${storeId}/remover_empleado/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            // Enviar solo el ID del empleado
            body: JSON.stringify({ empleado_id: employeeId }),
          },
        )

        // Intentar obtener el texto de la respuesta para depuración
        let responseText
        try {
          responseText = await response.text()
          console.log("Respuesta al eliminar empleado:", responseText)
        } catch (textError) {
          console.error("Error al leer la respuesta:", textError)
        }

        if (!response.ok) {
          // Si falla, intentar con un enfoque alternativo
          console.log("Primer intento fallido, probando con nombre...")

          // Intentar con el nombre del empleado
          const alternativeResponse = await fetch(
            `https://tienda-backend-p9ms.onrender.com/api/tiendas/${storeId}/remover_empleado/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ nombre: nombre }),
            },
          )

          let altResponseText
          try {
            altResponseText = await alternativeResponse.text()
            console.log("Respuesta al segundo intento:", altResponseText)
          } catch (textError) {
            console.error("Error al leer la respuesta del segundo intento:", textError)
          }

          if (!alternativeResponse.ok) {
            // Tercer intento: usar ID como parámetro en la URL
            console.log("Segundo intento fallido, probando con ID en URL...")

            const thirdResponse = await fetch(
              `https://tienda-backend-p9ms.onrender.com/api/tiendas/${storeId}/remover_empleado/${employeeId}/`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            )

            let thirdResponseText
            try {
              thirdResponseText = await thirdResponse.text()
              console.log("Respuesta al tercer intento:", thirdResponseText)
            } catch (textError) {
              console.error("Error al leer la respuesta del tercer intento:", textError)
            }

            if (!thirdResponse.ok) {
              throw new Error(
                `No se pudo eliminar el empleado después de varios intentos. Último error: ${thirdResponse.status} - ${thirdResponse.statusText}`,
              )
            }
          }
        }

        // Recargar la lista de empleados
        await fetchEmployees()

        alert("Vendedor eliminado con éxito")
      } catch (err) {
        console.error("Error al eliminar el empleado:", err)
        alert(
          `No se pudo eliminar el vendedor: ${err instanceof Error ? err.message : "Error desconocido"}. Por favor, intenta de nuevo más tarde.`,
        )
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
                  <label htmlFor="username" className="text-sm font-medium">
                    Nombre de Usuario
                  </label>
                  <Input
                    id="username"
                    value={newEmployeeUsername}
                    onChange={(e) => setNewEmployeeUsername(e.target.value)}
                    placeholder="Ingrese el nombre de usuario"
                    className="bg-input-bg border-0"
                  />
                  {addError && <p className="text-sm text-red-500">{addError}</p>}
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowAddForm(false)
                      setAddError(null)
                      setNewEmployeeUsername("")
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
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <p className="text-sm text-text-secondary mb-4">
                Esto podría deberse a problemas de conectividad o que el servidor está temporalmente inaccesible.
              </p>
              <Button onClick={() => fetchEmployees()} className="mt-2 bg-primary hover:bg-primary-dark">
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
                      {(employee.first_name || employee.last_name) && (
                        <p className="text-sm">
                          {employee.first_name} {employee.last_name}
                        </p>
                      )}
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

