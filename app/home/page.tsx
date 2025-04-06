"use client"

import type React from "react"
import { BottomNavigation } from "@/components/bottom-navigation"
import Link from "next/link"
import {
  ShoppingBag,
  Package,
  Users,
  BarChart2,
  ShoppingCart,
  DollarSign,
  ArrowLeft,
  LogOut,
  CreditCard,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { VendorNavigation } from "@/components/vendor-navigation"

export default function HomePage() {
  const router = useRouter()
  const [userType, setUserType] = useState<string | null>(null)
  const [selectedStore, setSelectedStore] = useState<{ id: string; name: string } | null>(null)
  const [vendorName, setVendorName] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const storeId = searchParams.get("storeId")
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    // Obtener el tipo de usuario del localStorage
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)

    // Obtener el nombre del vendedor si existe
    const storedVendorName = localStorage.getItem("vendorName")
    if (storedVendorName) {
      setVendorName(storedVendorName)
    }

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

  const handleLogout = () => {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      setIsLoggingOut(true)

      // Limpiar tokens y datos de sesión
      localStorage.removeItem("backendToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("tokenExpiresAt")
      localStorage.removeItem("userType")
      localStorage.removeItem("selectedStoreId")
      localStorage.removeItem("selectedStoreName")
      localStorage.removeItem("vendorName")
      localStorage.removeItem("vendorId")
      localStorage.removeItem("cajaActualId")
      localStorage.removeItem("cajaActualSaldoInicial")

      // Redirigir a la página de inicio de sesión
      router.push("/")
    }
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              {userType === "admin" && (
                <Link href="/stores" className="mr-2">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              )}
              <span className="text-sm font-medium">Tienda: {selectedStore.name}</span>
            </div>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              <span className="text-xs">Salir</span>
            </Button>
          </div>
        )}
        <h1 className="text-2xl font-semibold">Tienda mixta doña jose</h1>
        <p className="text-sm opacity-80 mt-1">
          ¡Bienvenido
          {vendorName
            ? `, ${vendorName}`
            : userType === "admin"
              ? ", Administrador"
              : userType === "vendor"
                ? ", Vendedor"
                : ""}
          !
        </p>
      </div>

      <div className="container max-w-md mx-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          {userType === "vendor" ? (
            <>
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
                href={selectedStore ? `/stores/${selectedStore.id}/products` : "/products"}
              />
              <MenuCard
                icon={<DollarSign className="h-8 w-8 text-primary" />}
                title="Mi Caja"
                description="Gestionar caja"
                href="/vendor/caja"
              />
              <MenuCard
                icon={<DollarSign className="h-8 w-8 text-primary" />}
                title="Gastos"
                description="Gestionar gastos"
                href="/expenses"
              />
            </>
          ) : (
            <>
              <MenuCard
                icon={<DollarSign className="h-8 w-8 text-primary" />}
                title="Gastos"
                description="Gestionar gastos"
                href="/expenses"
              />

              {/* Solo mostrar Vendedores, Cajas y Reportes si es administrador */}
              {userType === "admin" && (
                <>
                  <MenuCard
                    icon={<Users className="h-8 w-8 text-primary" />}
                    title="Vendedores"
                    description="Gestionar equipo"
                    href={selectedStore ? `/stores/${selectedStore.id}/employees` : "/vendors"}
                  />

                  <MenuCard
                    icon={<CreditCard className="h-8 w-8 text-primary" />}
                    title="Cajas"
                    description="Gestionar cajas"
                    href={selectedStore ? `/stores/${selectedStore.id}/cajas` : "/vendors"}
                  />

                  <MenuCard
                    icon={<BarChart2 className="h-8 w-8 text-primary" />}
                    title="Reportes"
                    description="Ver estadísticas"
                    href="/dashboard"
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>

      {userType === "vendor" ? <VendorNavigation /> : <BottomNavigation />}
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

