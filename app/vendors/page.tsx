"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, Plus } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { VendorList } from "@/components/vendor-list"
import { VendorForm } from "@/components/vendor-form"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useRouter } from "next/navigation"

export interface Vendor {
  id: string
  name: string
  phone: string
  email: string
  password: string
  photo?: string
}

export default function VendorsPage() {
  const [userType, setUserType] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const router = useRouter()

  useEffect(() => {
    // Obtener el ID de la tienda seleccionada
    const selectedStoreId = localStorage.getItem("selectedStoreId")

    // Si hay una tienda seleccionada, redirigir a la gestión de empleados de esa tienda
    if (selectedStoreId) {
      router.push(`/stores/${selectedStoreId}/employees`)
      return
    }
  }, [router])

  useEffect(() => {
    // Obtener el tipo de usuario del localStorage
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)

    // Verificar si el usuario es administrador
    if (storedUserType !== "admin") {
      // Redirigir a la página de inicio si no es administrador
      window.location.href = "/home"
    }

    // Cargar vendedores del localStorage
    const storedVendors = localStorage.getItem("vendors")
    if (storedVendors) {
      setVendors(JSON.parse(storedVendors))
    } else {
      // Datos iniciales de ejemplo
      const initialVendors: Vendor[] = [
        {
          id: "1",
          name: "Juan Pérez",
          phone: "+57 3124567890",
          email: "juan@example.com",
          password: "123456",
        },
        {
          id: "2",
          name: "María López",
          phone: "+57 3209876543",
          email: "maria@example.com",
          password: "123456",
        },
      ]
      setVendors(initialVendors)
      localStorage.setItem("vendors", JSON.stringify(initialVendors))
    }
  }, [])

  const handleAddVendor = (vendor: Vendor) => {
    const newVendors = [...vendors, vendor]
    setVendors(newVendors)
    localStorage.setItem("vendors", JSON.stringify(newVendors))
    setShowAddForm(false)
  }

  const handleEditVendor = (vendor: Vendor) => {
    const updatedVendors = vendors.map((v) => (v.id === vendor.id ? vendor : v))
    setVendors(updatedVendors)
    localStorage.setItem("vendors", JSON.stringify(updatedVendors))
    setShowEditForm(false)
    setCurrentVendor(null)
  }

  const handleDeleteVendor = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este vendedor?")) {
      const updatedVendors = vendors.filter((vendor) => vendor.id !== id)
      setVendors(updatedVendors)
      localStorage.setItem("vendors", JSON.stringify(updatedVendors))
    }
  }

  const startEditVendor = (vendor: Vendor) => {
    setCurrentVendor(vendor)
    setShowEditForm(true)
  }

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top has-bottom-nav">
      <div className="bg-white p-4 flex items-center">
        <Link href="/home" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Gestión de Vendedores</h1>
      </div>

      <div className="container max-w-md mx-auto p-4">
        {showAddForm ? (
          <div className="bg-white rounded-lg p-5 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium text-lg">Añadir Vendedor</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
            </div>
            <VendorForm onSubmit={handleAddVendor} />
          </div>
        ) : showEditForm && currentVendor ? (
          <div className="bg-white rounded-lg p-5 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium text-lg">Editar Vendedor</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEditForm(false)
                  setCurrentVendor(null)
                }}
              >
                Cancelar
              </Button>
            </div>
            <VendorForm vendor={currentVendor} onSubmit={handleEditVendor} />
          </div>
        ) : (
          <div className="bg-white rounded-lg p-5 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium text-lg">Vendedores</h2>
              <Button size="sm" className="bg-primary hover:bg-primary-dark" onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Añadir
              </Button>
            </div>
            <VendorList vendors={vendors} onEdit={startEditVendor} onDelete={handleDeleteVendor} />
          </div>
        )}
      </div>

      <BottomNavigation />
    </main>
  )
}

