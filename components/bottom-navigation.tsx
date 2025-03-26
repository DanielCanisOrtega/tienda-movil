"use client"

import { Home, Search, ShoppingBag, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function BottomNavigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="bottom-nav">
      <Link href="/home" className={`bottom-nav-item android-ripple ${isActive("/home") ? "active" : ""}`}>
        <Home size={24} />
        <span className="text-xs mt-1">Inicio</span>
      </Link>

      <Link href="/search" className={`bottom-nav-item android-ripple ${isActive("/search") ? "active" : ""}`}>
        <Search size={24} />
        <span className="text-xs mt-1">Buscar</span>
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

