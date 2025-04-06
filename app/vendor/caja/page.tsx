"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VendorNavigation } from "@/components/vendor-navigation"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

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

export default function VendorCajaPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cajaActual, setCajaActual] = useState<Caja | null>(null)
  const [saldoFinal, setSaldoFinal] = useState("")
  const [vendorName, setVendorName] = useState<string | null>(null)
  const [storeName, setStoreName] = useState<string | null>(null)

  useEffect(() => {
    // Verify if the user is a vendor
    const userType = localStorage.getItem("userType")
    if (userType !== "vendor") {
      router.push("/")
      return
    }

    // Get the vendor name and store name
    const storedVendorName = localStorage.getItem("vendorName")
    const selectedStoreName = localStorage.getItem("selectedStoreName")
    if (storedVendorName) setVendorName(storedVendorName)
    if (selectedStoreName) setStoreName(selectedStoreName)

    // Load the vendor's current cash register
    cargarCajaActual()
  }, [router])

  // Modificar la función cargarCajaActual para manejar mejor los casos de error
  const cargarCajaActual = () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get the store ID and vendor ID
      let storeId = localStorage.getItem("selectedStoreId")
      let vendorId = localStorage.getItem("vendorId")

      // Si no hay storeId o vendorId, usar valores predeterminados
      if (!storeId) {
        storeId = "1" // Valor predeterminado para storeId
        localStorage.setItem("selectedStoreId", storeId)
      }

      if (!vendorId) {
        vendorId = "100" // Valor predeterminado para vendorId
        localStorage.setItem("vendorId", vendorId)
      }

      // Obtener el nombre del vendedor o usar un valor predeterminado
      const vendorName = localStorage.getItem("vendorName") || "Vendedor"

      // Crear una caja predeterminada
      const cajaDefault: Caja = {
        id: 1,
        usuario: Number(vendorId),
        usuario_nombre: vendorName,
        turno: "mañana",
        saldo_inicial: "100000",
        saldo_final: "100000",
        fecha_apertura: new Date().toISOString(),
        fecha_cierre: null,
        estado: "abierta",
      }

      // Get the store's cash registers
      const storedCajas = localStorage.getItem(`store_${storeId}_cajas`)

      if (storedCajas) {
        const cajas = JSON.parse(storedCajas)

        // Find the vendor's open cash register
        const cajaVendedor = cajas.find(
          (caja: Caja) => caja.usuario.toString() === vendorId && caja.estado === "abierta",
        )

        if (cajaVendedor) {
          console.log("Caja actual encontrada:", cajaVendedor)
          setCajaActual(cajaVendedor)
          setSaldoFinal(cajaVendedor.saldo_final)
        } else {
          // Si no se encuentra una caja abierta, buscar la última caja del vendedor
          const ultimaCaja = cajas
            .filter((caja: Caja) => caja.usuario.toString() === vendorId)
            .sort((a: Caja, b: Caja) => {
              // Ordenar por fecha de apertura (más reciente primero)
              return new Date(b.fecha_apertura).getTime() - new Date(a.fecha_apertura).getTime()
            })[0]

          if (ultimaCaja) {
            console.log("Última caja del vendedor encontrada:", ultimaCaja)
            setCajaActual(ultimaCaja)
            setSaldoFinal(ultimaCaja.saldo_final)
          } else {
            // Si no hay cajas para este vendedor, crear una nueva
            console.log("Creando caja predeterminada para el vendedor")
            setCajaActual(cajaDefault)
            setSaldoFinal(cajaDefault.saldo_final)

            // Añadir la caja predeterminada a la lista de cajas
            cajas.push(cajaDefault)
            localStorage.setItem(`store_${storeId}_cajas`, JSON.stringify(cajas))
          }
        }
      } else {
        // Si no hay cajas registradas, crear una lista con la caja predeterminada
        console.log("No hay cajas registradas, creando caja predeterminada")
        setCajaActual(cajaDefault)
        setSaldoFinal(cajaDefault.saldo_final)

        // Guardar la caja predeterminada en localStorage
        localStorage.setItem(`store_${storeId}_cajas`, JSON.stringify([cajaDefault]))
      }
    } catch (err) {
      console.error("Error al cargar la caja:", err)
      setError(`Error al cargar la información de la caja: ${err instanceof Error ? err.message : "Error desconocido"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCerrarCaja = () => {
    if (!cajaActual) return

    if (!saldoFinal.trim()) {
      alert("Por favor, ingresa el saldo final de la caja")
      return
    }

    setIsSubmitting(true)

    try {
      // Get the store ID
      const storeId = localStorage.getItem("selectedStoreId") || "1"

      // Get the store's cash registers
      const storedCajas = localStorage.getItem(`store_${storeId}_cajas`)

      if (storedCajas) {
        let cajas = JSON.parse(storedCajas)

        // Update the cash register
        cajas = cajas.map((caja: Caja) => {
          if (caja.id === cajaActual.id) {
            return {
              ...caja,
              saldo_final: saldoFinal,
              estado: "cerrada",
              fecha_cierre: new Date().toISOString(),
            }
          }
          return caja
        })

        // Save to localStorage
        localStorage.setItem(`store_${storeId}_cajas`, JSON.stringify(cajas))

        // Clear the current cash register information
        localStorage.removeItem("cajaActualId")

        alert("Caja cerrada con éxito")

        // Redirect to home
        router.push("/home")
      }
    } catch (err) {
      console.error("Error al cerrar la caja:", err)
      alert(`No se pudo cerrar la caja: ${err instanceof Error ? err.message : "Error desconocido"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format date
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

  // Format currency
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background-light">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-text-primary">Cargando información de la caja...</p>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top has-bottom-nav">
      <div className="bg-white p-4 flex items-center">
        <Link href="/home" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Mi Caja</h1>
      </div>

      <div className="container max-w-md mx-auto p-4 space-y-4">
        {error ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => cargarCajaActual()} className="bg-primary hover:bg-primary-dark mb-4">
                Reintentar
              </Button>
              <Button onClick={() => router.push("/home")} className="bg-primary hover:bg-primary-dark">
                Volver al inicio
              </Button>
            </CardContent>
          </Card>
        ) : cajaActual ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información de la Caja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">ID de Caja</Label>
                    <p className="font-medium">#{cajaActual.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Turno</Label>
                    <p className="font-medium capitalize">{cajaActual.turno}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Estado</Label>
                    <p className="font-medium capitalize">{cajaActual.estado}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Fecha de Apertura</Label>
                    <p className="font-medium">{formatDate(cajaActual.fecha_apertura)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Saldo Inicial</Label>
                    <p className="font-medium">{formatCurrency(cajaActual.saldo_inicial)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Saldo Actual</Label>
                    <p className="font-medium">{formatCurrency(cajaActual.saldo_final)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cerrar Caja</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="saldoFinal">Saldo Final</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base">$</span>
                      <Input
                        id="saldoFinal"
                        value={saldoFinal}
                        onChange={(e) => setSaldoFinal(e.target.value)}
                        placeholder="0.00"
                        className="bg-input-bg border-0 pl-8 h-12 text-base"
                        type="text"
                        inputMode="decimal"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCerrarCaja}
                    className="w-full h-12 bg-primary hover:bg-primary-dark"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Procesando..." : "Cerrar Caja"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-text-secondary mb-4">No tienes una caja abierta actualmente</p>
              <Button onClick={() => router.push("/home")} className="bg-primary hover:bg-primary-dark">
                Volver al inicio
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <VendorNavigation />
    </main>
  )
}

