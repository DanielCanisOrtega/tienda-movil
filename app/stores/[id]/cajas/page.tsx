"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, Plus, Edit, Trash2, Search, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { fetchWithAuth } from "@/services/auth-service"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Definir la interfaz para las cajas
interface Caja {
  id: number
  usuario: number
  turno: string
  saldo_inicial: string
  saldo_final: string
  fecha_apertura: string
  fecha_cierre: string
  estado: string
}

export default function CajasPage() {
  const params = useParams()
  const router = useRouter()
  const storeId = params.id as string

  const [cajas, setCajas] = useState<Caja[]>([])
  const [filteredCajas, setFilteredCajas] = useState<Caja[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [storeName, setStoreName] = useState<string>("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [cajaToDelete, setCajaToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Función para seleccionar la tienda
  const selectStore = async () => {
    try {
      console.log(`Seleccionando tienda con ID: ${storeId}`)
      const response = await fetchWithAuth(
        `https://tienda-backend-p9ms.onrender.com/api/tiendas/${storeId}/seleccionar_tienda/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error al seleccionar tienda: ${response.status} - ${response.statusText}`, errorText)
        throw new Error(`Error al seleccionar tienda: ${response.status} - ${response.statusText}`)
      }

      console.log("Tienda seleccionada correctamente")
      return true
    } catch (err) {
      console.error("Error al seleccionar tienda:", err)
      setError(`No se pudo seleccionar la tienda: ${err instanceof Error ? err.message : "Error desconocido"}`)
      return false
    }
  }

  // Cargar las cajas
  const fetchCajas = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Primero seleccionar la tienda
      const storeSelected = await selectStore()
      if (!storeSelected) {
        setIsLoading(false)
        return
      }

      console.log("Obteniendo cajas...")
      const response = await fetchWithAuth("https://tienda-backend-p9ms.onrender.com/api/cajas/")

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error al obtener cajas: ${response.status} - ${response.statusText}`, errorText)
        throw new Error(`Error al obtener cajas: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Cajas obtenidas:", data)
      setCajas(data)
      setFilteredCajas(data)
    } catch (err) {
      console.error("Error al cargar las cajas:", err)
      setError(`No se pudieron cargar las cajas: ${err instanceof Error ? err.message : "Error desconocido"}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar si el usuario está autorizado y cargar datos
  useEffect(() => {
    const userType = localStorage.getItem("userType")
    if (userType !== "admin") {
      router.push("/")
      return
    }

    // Obtener el nombre de la tienda seleccionada
    const selectedStoreName = localStorage.getItem("selectedStoreName")
    if (selectedStoreName) {
      setStoreName(selectedStoreName)
    }

    // Cargar cajas
    fetchCajas()
  }, [storeId, router])

  // Filtrar cajas cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCajas(cajas)
    } else {
      const query = searchTerm.toLowerCase()
      const filtered = cajas.filter(
        (caja) =>
          caja.turno.toLowerCase().includes(query) ||
          caja.estado.toLowerCase().includes(query) ||
          caja.saldo_inicial.toLowerCase().includes(query) ||
          caja.saldo_final.toLowerCase().includes(query),
      )
      setFilteredCajas(filtered)
    }
  }, [searchTerm, cajas])

  // Función para eliminar una caja
  const handleDeleteCaja = async () => {
    if (!cajaToDelete) return

    setIsDeleting(true)

    try {
      // Primero seleccionar la tienda
      const storeSelected = await selectStore()
      if (!storeSelected) {
        setIsDeleting(false)
        setIsDeleteDialogOpen(false)
        return
      }

      console.log(`Eliminando caja con ID: ${cajaToDelete}`)
      const response = await fetchWithAuth(`https://tienda-backend-p9ms.onrender.com/api/cajas/${cajaToDelete}/`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error al eliminar caja: ${response.status} - ${response.statusText}`, errorText)
        throw new Error(`Error al eliminar caja: ${response.status} - ${response.statusText}`)
      }

      console.log("Caja eliminada correctamente")
      // Actualizar la lista de cajas
      setCajas(cajas.filter((caja) => caja.id !== cajaToDelete))
      setFilteredCajas(filteredCajas.filter((caja) => caja.id !== cajaToDelete))
      alert("Caja eliminada con éxito")
    } catch (err) {
      console.error("Error al eliminar la caja:", err)
      alert(`No se pudo eliminar la caja: ${err instanceof Error ? err.message : "Error desconocido"}`)
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setCajaToDelete(null)
    }
  }

  // Función para confirmar eliminación
  const confirmDelete = (cajaId: number) => {
    setCajaToDelete(cajaId)
    setIsDeleteDialogOpen(true)
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return dateString
    }
  }

  // Formatear saldo
  const formatCurrency = (value: string) => {
    try {
      const numValue = Number.parseFloat(value)
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
      }).format(numValue)
    } catch (error) {
      return value
    }
  }

  // Obtener color de estado
  const getStatusColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "abierta":
        return "bg-green-100 text-green-800"
      case "cerrada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background-light">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-text-primary">Cargando cajas...</p>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top">
      <div className="bg-white p-4 flex items-center">
        <Link href={`/home`} className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Cajas de {storeName}</h1>
      </div>

      <div className="p-4">
        <div className="flex items-center mb-4 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
            <Input
              placeholder="Buscar cajas..."
              className="pl-10 bg-input-bg border-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link href={`/stores/${storeId}/cajas/add`}>
            <Button variant="default" size="icon" className="bg-primary hover:bg-primary-dark">
              <Plus className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {error ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchCajas} className="bg-primary hover:bg-primary-dark">
              Reintentar
            </Button>
          </div>
        ) : filteredCajas.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-text-secondary">No se encontraron cajas</p>
            <Link href={`/stores/${storeId}/cajas/add`}>
              <Button className="mt-4 bg-primary hover:bg-primary-dark">Añadir caja</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredCajas.map((caja) => (
              <Card key={caja.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">Caja #{caja.id}</h3>
                      <p className="text-sm text-text-secondary">Turno: {caja.turno}</p>
                    </div>
                    <Badge className={getStatusColor(caja.estado)}>{caja.estado}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-3">
                    <div>
                      <p className="text-xs text-text-secondary">Saldo inicial</p>
                      <p className="font-medium">{formatCurrency(caja.saldo_inicial)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Saldo final</p>
                      <p className="font-medium">{formatCurrency(caja.saldo_final)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Apertura</p>
                      <p className="text-sm">{formatDate(caja.fecha_apertura)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Cierre</p>
                      <p className="text-sm">{formatDate(caja.fecha_cierre)}</p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-2">
                    <Link href={`/stores/${storeId}/cajas/edit/${caja.id}`}>
                      <Button variant="outline" size="sm" className="h-9 px-3">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => confirmDelete(caja.id)}
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
            <DialogTitle>Eliminar Caja</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta caja? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteCaja} disabled={isDeleting}>
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
    </main>
  )
}

