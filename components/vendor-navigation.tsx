"use client"

import { Package, ShoppingBag, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function VendorNavigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="bottom-nav">
      <Link href="/search" className={`bottom-nav-item android-ripple ${isActive("/search") ? "active" : ""}`}>
        <Package size={24} />
        <span className="text-xs mt-1">Inventario</span>
      </Link>

      <Link href="/sales" className={`bottom-nav-item android-ripple ${isActive("/sales") ? "active" : ""}`}>
        <ShoppingBag size={24} />
        <span className="text-xs mt-1">Ventas</span>
      </Link>

      <Link href="/profile" className={`bottom-nav-item android-ripple ${isActive("/profile") ? "active" : ""}`}>
        <User size={24} />
        <span className="text-xs mt-1">Perfil</span>
      </Link>
    </nav>
  )
}

export default VendorNavigation

