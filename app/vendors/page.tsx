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
  active?: boolean
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

  // Update the handleDeleteVendor function to mark vendors as inactive instead of removing them
  const handleDeleteVendor = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este vendedor?")) {
      // Instead of filtering out the vendor, mark it as inactive
      const updatedVendors = vendors.map((vendor) => (vendor.id === id ? { ...vendor, active: false } : vendor))

      // Update state with all vendors (including inactive ones)
      setVendors(updatedVendors)

      // But only show active vendors in the UI
      const activeVendors = updatedVendors.filter((vendor) => vendor.active !== false)

      // Save all vendors to localStorage
      localStorage.setItem("vendors", JSON.stringify(updatedVendors))
    }
  }

  // Also update the useEffect that loads vendors to filter out inactive ones for display
  useEffect(() => {
    // Obtain the user type from localStorage
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)

    // Check if the user is an administrator
    if (storedUserType !== "admin") {
      // Redirect to the home page if not an administrator
      window.location.href = "/home"
    }

    // Load vendors from localStorage
    const storedVendors = localStorage.getItem("vendors")
    if (storedVendors) {
      const allVendors = JSON.parse(storedVendors)
      // Only display active vendors
      const activeVendors = allVendors.filter((v: any) => v.active !== false)
      setVendors(allVendors) // Keep all vendors in state
    } else {
      // Sample initial data
      const initialVendors: Vendor[] = [
        {
          id: "1",
          name: "Juan Pérez",
          phone: "+57 3124567890",
          email: "juan@example.com",
          password: "123456",
          active: true,
        },
        {
          id: "2",
          name: "María López",
          phone: "+57 3209876543",
          email: "maria@example.com",
          password: "123456",
          active: true,
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

