"use client"

import type React from "react"
import { BottomNavigation } from "@/components/bottom-navigation"
import Link from "next/link"
import { ShoppingBag, Package, Users, BarChart2, ShoppingCart, DollarSign, ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

export default function HomePage() {
  const [userType, setUserType] = useState<string | null>(null)
  const [selectedStore, setSelectedStore] = useState<{ id: string; name: string } | null>(null)
  const searchParams = useSearchParams()
  const storeId = searchParams.get("storeId")

  useEffect(() => {
    // Obtener el tipo de usuario del localStorage
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)

    // Obtener la tienda seleccionada
    const selectedStoreId = storeId || localStorage.getItem("selectedStoreId")
    const selectedStoreName = localStorage.getItem("selectedStoreName")

    if (selectedStoreId && selectedStoreName) {
      setSelectedStore({
        id: selectedStoreId,
        name: selectedStoreName,
      })
    }
  }, [storeId])

  const createSampleExpenses = () => {
    const categories = ["Pedidos", "Servicios", "Nómina", "Alquiler", "Impuestos", "Otros"]
    const paymentMethods = ["Efectivo", "Transferencia", "Tarjeta de Débito", "Tarjeta de Crédito"]
    const descriptions = [
      "Factura de luz",
      "Factura de agua",
      "Pedido de frutas",
      "Pedido de verduras",
      "Pago de empleados",
      "Alquiler del local",
      "Impuestos municipales",
      "Mantenimiento",
    ]

    const sampleExpenses = []
    const today = new Date()

    // Crear 20 gastos de ejemplo en los últimos 30 días
    for (let i = 0; i < 20; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - Math.floor(Math.random() * 30)) // Hasta 30 días atrás

      const expense = {
        id: crypto.randomUUID(),
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        amount: Math.floor(Math.random() * 500000) + 50000, // Entre 50,000 y 550,000
        date: date.toISOString().split("T")[0], // Formato YYYY-MM-DD
        category: categories[Math.floor(Math.random() * categories.length)],
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        notes: Math.random() > 0.5 ? "Nota de ejemplo" : "",
      }

      sampleExpenses.push(expense)
    }

    localStorage.setItem("expenses", JSON.stringify(sampleExpenses))
    alert(`Se han creado ${sampleExpenses.length} gastos de ejemplo`)
  }

  // Si no hay tienda seleccionada y el usuario es administrador, redirigir a la página de tiendas
  if (!selectedStore && userType === "admin") {
    return (
      <main className="flex min-h-screen flex-col bg-background-light android-safe-top">
        <div className="bg-primary text-white p-5">
          <h1 className="text-2xl font-semibold">Tienda mixta doña jose</h1>
          <p className="text-sm opacity-80 mt-1">¡Bienvenido, Administrador!</p>
        </div>

        <div className="container max-w-md mx-auto p-4 text-center">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <p className="text-text-secondary mb-4">No has seleccionado ninguna tienda</p>
            <Link href="/stores">
              <button className="bg-primary text-white px-4 py-2 rounded-lg">Ir a gestión de tiendas</button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top has-bottom-nav">
      <div className="bg-primary text-white p-5">
        {selectedStore && (
          <div className="flex items-center mb-2">
            {userType === "admin" && (
              <Link href="/stores" className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            )}
            <span className="text-sm font-medium">Tienda: {selectedStore.name}</span>
          </div>
        )}
        <h1 className="text-2xl font-semibold">Tienda mixta doña jose</h1>
        <p className="text-sm opacity-80 mt-1">
          ¡Bienvenido de nuevo{userType === "admin" ? ", Administrador" : userType === "vendor" ? ", Vendedor" : ""}!
        </p>
      </div>

      <div className="container max-w-md mx-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          <MenuCard
            icon={<ShoppingCart className="h-8 w-8 text-primary" />}
            title="Nueva Venta"
            description="Registrar venta"
            href="/cart"
          />

          <MenuCard
            icon={<ShoppingBag className="h-8 w-8 text-primary" />}
            title="Historial"
            description="Ver ventas"
            href="/sales"
          />

          <MenuCard
            icon={<Package className="h-8 w-8 text-primary" />}
            title="Inventario"
            description="Ver productos"
            href="/products"
          />

          <MenuCard
            icon={<DollarSign className="h-8 w-8 text-primary" />}
            title="Gastos"
            description="Gestionar gastos"
            href="/expenses"
          />

          {/* Solo mostrar Vendedores y Reportes si es administrador */}
          {userType === "admin" && (
            <>
              <MenuCard
                icon={<Users className="h-8 w-8 text-primary" />}
                title="Vendedores"
                description="Gestionar equipo"
                href="/vendors"
              />

              <MenuCard
                icon={<BarChart2 className="h-8 w-8 text-primary" />}
                title="Reportes"
                description="Ver estadísticas"
                href="/dashboard"
              />
            </>
          )}

          {userType === "admin" && (
            <div className="mt-6">
              <button onClick={createSampleExpenses} className="text-sm text-primary underline">
                Crear datos de ejemplo para gastos
              </button>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </main>
  )
}

function MenuCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
}) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg p-4 shadow-sm h-full flex flex-col android-ripple">
        <div className="mb-3">{icon}</div>
        <h2 className="font-medium text-lg">{title}</h2>
        <p className="text-sm text-text-secondary mt-1">{description}</p>
      </div>
    </Link>
  )
}

