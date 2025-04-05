"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Loader2, DollarSign, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { VendorNavigation } from "@/components/vendor-navigation"
import { fetchWithAuth } from "@/services/auth-service"

interface Caja {
  id: number
  usuario: number
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
    // Verificar si el usuario es un vendedor
    const userType = localStorage.getItem("userType")
    if (userType !== "vendor") {
      router.push("/")
      return
    }

    // Obtener el nombre del vendedor y de la tienda
    const storedVendorName = localStorage.getItem("vendorName")
    const selectedStoreName = localStorage.getItem("selectedStoreName")
    if (storedVendorName) setVendorName(storedVendorName)
    if (selectedStoreName) setStoreName(selectedStoreName)

    // Cargar la caja actual del vendedor
    cargarCajaActual()
  }, [router])

  const cargarCajaActual = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Obtener todas las cajas
      const response = await fetchWithAuth("https://tienda-backend-p9ms.onrender.com/api/cajas/")

      if (!response.ok) {
        throw new Error(`Error al obtener cajas: ${response.status}`)
      }

      const cajas = await response.json()

      // Obtener el ID del vendedor actual
      const vendorId = localStorage.getItem("vendorId")
      if (!vendorId) {
        throw new Error("No se encontró el ID del vendedor")
      }

      // Buscar la caja abierta del vendedor actual
      const cajaVendedor = Array.isArray(cajas)
        ? cajas.find((caja: Caja) => caja.usuario === Number(vendorId) && caja.estado === "abierta")
        : null

      if (cajaVendedor) {
        console.log("Caja actual encontrada:", cajaVendedor)
        setCajaActual(cajaVendedor)
        setSaldoFinal(cajaVendedor.saldo_final)

        // Guardar el ID de la caja en localStorage
        localStorage.setItem("cajaActualId", cajaVendedor.id.toString())
      } else {
        console.log("No se encontró una caja abierta para este vendedor")
        setError("No tienes una caja abierta actualmente. Por favor, contacta al administrador.")
      }
    } catch (err) {
      console.error("Error al cargar la caja:", err)
      setError(`Error al cargar la información de la caja: ${err instanceof Error ? err.message : "Error desconocido"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCerrarCaja = async () => {
    if (!cajaActual) return

    if (!saldoFinal.trim()) {
      alert("Por favor, ingresa el saldo final de la caja")
      return
    }

    setIsSubmitting(true)

    try {
      // Primero actualizar el saldo final
      const updateResponse = await fetchWithAuth(
        `https://tienda-backend-p9ms.onrender.com/api/cajas/${cajaActual.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            saldo_final: saldoFinal,
          }),
        },
      )

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text()
        throw new Error(`Error al actualizar saldo: ${updateResponse.status} - ${errorText}`)
      }

      // Luego cerrar la caja
      const closeResponse = await fetchWithAuth(
        `https://tienda-backend-p9ms.onrender.com/api/cajas/${cajaActual.id}/cerrar/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (!closeResponse.ok) {
        const errorText = await closeResponse.text()
        throw new Error(`Error al cerrar caja: ${closeResponse.status} - ${errorText}`)
      }

      alert("Caja cerrada con éxito")

      // Limpiar la información de la caja actual
      localStorage.removeItem("cajaActualId")

      // Redirigir al inicio
      router.push("/home")
    } catch (err) {
      console.error("Error al cerrar la caja:", err)
      alert(`No se pudo cerrar la caja: ${err instanceof Error ? err.message : "Error desconocido"}`)
    } finally {
      setIsSubmitting(false)
    }
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
      <div className="bg-primary text-white p-4">
        <div className="flex items-center mb-2">
          <Link href="/home" className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold">Mi Caja</h1>
        </div>
        <p className="text-sm opacity-80">
          {vendorName ? `${vendorName} - ` : ""}
          {storeName || ""}
        </p>
      </div>

      <div className="container max-w-md mx-auto p-4 space-y-4">
        {error ? (
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500 mb-4">{error}</p>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-primary mr-2" />
                    <span className="font-medium">Turno:</span>
                  </div>
                  <span className="capitalize">{cajaActual.turno}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-primary mr-2" />
                    <span className="font-medium">Saldo inicial:</span>
                  </div>
                  <span>{formatCurrency(cajaActual.saldo_inicial)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Fecha de apertura:</span>
                  <span>{formatDate(cajaActual.fecha_apertura)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Estado:</span>
                  <span className="capitalize bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {cajaActual.estado}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cerrar Caja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="saldo_final">Saldo Final</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base">$</span>
                    <Input
                      id="saldo_final"
                      value={saldoFinal}
                      onChange={(e) => setSaldoFinal(e.target.value.replace(/[^0-9.]/g, ""))}
                      placeholder="0.00"
                      className="bg-input-bg border-0 pl-8 h-12 text-base"
                      type="text"
                      inputMode="decimal"
                    />
                  </div>
                  <p className="text-xs text-text-secondary">
                    Ingresa el saldo final con el que entregarás la caja al finalizar tu turno.
                  </p>
                </div>

                <Button
                  onClick={handleCerrarCaja}
                  className="w-full bg-primary hover:bg-primary-dark"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cerrando caja...
                    </>
                  ) : (
                    "Cerrar Caja"
                  )}
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <p className="mb-4">No se encontró información de tu caja actual.</p>
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

