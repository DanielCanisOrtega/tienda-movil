"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, Plus, Edit, Trash2, Search, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
import { useToast } from "@/hooks/use-toast"

// Definir la interfaz para las cajas
interface Caja {
  id: number
  usuario: number
  usuario_nombre: string
  turno: string
  saldo_inicial: string
  saldo_final: string
  fecha_apertura: string
  fecha_cierre: string | null
  estado: string
}

// Datos de ejemplo para cajas
const generateSampleCajas = (storeId: string): Caja[] => {
  const turnos = ["mañana", "tarde", "noche"]
  const estados = ["abierta", "cerrada"]

  // Obtener empleados de la tienda
  const storedEmployees = localStorage.getItem(`store_${storeId}_employees`)
  let employees = []

  if (storedEmployees) {
    employees = JSON.parse(storedEmployees).filter((emp: any) => emp.activo)
  } else {
    // Si no hay empleados, crear algunos de ejemplo
    employees = [
      { id: 1, nombre: "Juan Pérez" },
      { id: 2, nombre: "María López" },
      { id: 3, nombre: "Carlos Rodríguez" },
    ]
  }

  const cajas: Caja[] = []

  // Generar cajas para los últimos 30 días
  const today = new Date()
  let cajaId = 1

  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)

    // Generar entre 1 y 3 cajas por día
    const cajasPerDay = Math.floor(Math.random() * 3) + 1

    for (let j = 0; j < cajasPerDay; j++) {
      const employee = employees[Math.floor(Math.random() * employees.length)]
      const turno = turnos[Math.floor(Math.random() * turnos.length)]
      const estado = i === 0 && j === 0 ? "abierta" : estados[Math.floor(Math.random() * estados.length)]

      // Generar saldos aleatorios
      const saldo_inicial = (Math.floor(Math.random() * 50) + 10) * 10000 // Entre 100,000 y 600,000
      const saldo_final =
        estado === "cerrada" ? saldo_inicial + (Math.floor(Math.random() * 100) + 20) * 10000 : saldo_inicial

      // Fecha de apertura
      const fecha_apertura = new Date(date)
      fecha_apertura.setHours(8 + j * 8, 0, 0, 0)

      // Fecha de cierre (solo si está cerrada)
      let fecha_cierre = null
      if (estado === "cerrada") {
        fecha_cierre = new Date(fecha_apertura)
        fecha_cierre.setHours(fecha_apertura.getHours() + 8)
      }

      cajas.push({
        id: cajaId++,
        usuario: employee.id,
        usuario_nombre: employee.nombre,
        turno,
        saldo_inicial: saldo_inicial.toString(),
        saldo_final: saldo_final.toString(),
        fecha_apertura: fecha_apertura.toISOString(),
        fecha_cierre: fecha_cierre ? fecha_cierre.toISOString() : null,
        estado,
      })
    }
  }

  return cajas
}

export default function CajasPage() {
  const params = useParams()
  const router = useRouter()
  const storeId = params.id as string
  const { toast } = useToast()

  const [cajas, setCajas] = useState<Caja[]>([])
  const [filteredCajas, setFilteredCajas] = useState<Caja[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [storeName, setStoreName] = useState<string>("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [cajaToDelete, setCajaToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Cargar cajas
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
    loadCajas()
  }, [storeId, router])

  // Cargar cajas desde localStorage o generar datos de ejemplo
  const loadCajas = () => {
    setIsLoading(true)

    // Intentar cargar cajas del localStorage
    const storedCajas = localStorage.getItem(`store_${storeId}_cajas`)

    if (storedCajas) {
      const parsedCajas = JSON.parse(storedCajas)
      setCajas(parsedCajas)
      setFilteredCajas(parsedCajas)
    } else {
      // Si no hay datos en localStorage, generar datos de ejemplo
      const sampleCajas = generateSampleCajas(storeId)
      setCajas(sampleCajas)
      setFilteredCajas(sampleCajas)
      // Guardar en localStorage para futuras visitas
      localStorage.setItem(`store_${storeId}_cajas`, JSON.stringify(sampleCajas))
    }

    setIsLoading(false)
  }

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
          caja.usuario_nombre.toLowerCase().includes(query) ||
          caja.saldo_inicial.includes(query) ||
          caja.saldo_final.includes(query),
      )
      setFilteredCajas(filtered)
    }
  }, [searchTerm, cajas])

  // Función para eliminar una caja
  const handleDeleteCaja = async () => {
    if (!cajaToDelete) return

    setIsDeleting(true)

    try {
      // Obtener cajas actuales
      const updatedCajas = cajas.filter((caja) => caja.id !== cajaToDelete)

      // Actualizar estado
      setCajas(updatedCajas)
      setFilteredCajas(updatedCajas)

      // Guardar en localStorage
      localStorage.setItem(`store_${storeId}_cajas`, JSON.stringify(updatedCajas))

      toast({
        title: "Caja eliminada",
        description: "La caja ha sido eliminada correctamente",
        variant: "success",
      })
    } catch (err) {
      console.error("Error al eliminar la caja:", err)
      toast({
        title: "Error",
        description: "No se pudo eliminar la caja. Por favor, intenta de nuevo más tarde.",
        variant: "destructive",
      })
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
            <Button onClick={loadCajas} className="bg-primary hover:bg-primary-dark">
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
                      <p className="text-sm text-text-secondary">Vendedor: {caja.usuario_nombre}</p>
                      <p className="text-sm text-text-secondary">Turno: {caja.turno}</p>
                    </div>
                    <Badge
                      variant={caja.estado === "abierta" ? "default" : "secondary"}
                      className={getStatusColor(caja.estado)}
                    >
                      {caja.estado}
                    </Badge>
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
                      <p className="text-sm">{caja.fecha_cierre ? formatDate(caja.fecha_cierre) : "No cerrada"}</p>
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

