import type React from "react"
import { BottomNavigation } from "@/components/bottom-navigation"
import Link from "next/link"
import { ShoppingBag, Package, Users, BarChart2, Plus } from "lucide-react"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top has-bottom-nav">
      <div className="bg-primary text-white p-5">
        <h1 className="text-2xl font-semibold">Tienda mixta doña jose</h1>
        <p className="text-sm opacity-80 mt-1">¡Bienvenido de nuevo!</p>
      </div>

      <div className="container max-w-md mx-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          <MenuCard
            icon={<ShoppingBag className="h-8 w-8 text-primary" />}
            title="Ventas"
            description="Gestionar ventas"
            href="/sales"
          />

          <MenuCard
            icon={<Package className="h-8 w-8 text-primary" />}
            title="Productos"
            description="Ver inventario"
            href="/search"
          />

          <MenuCard
            icon={<Users className="h-8 w-8 text-primary" />}
            title="Vendedores"
            description="Gestionar equipo"
            href="/profile"
          />

          <MenuCard
            icon={<BarChart2 className="h-8 w-8 text-primary" />}
            title="Reportes"
            description="Ver estadísticas"
            href="/dashboard"
          />
        </div>
      </div>

      <Link href="/add-product" className="fab">
        <Plus size={24} />
      </Link>

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

