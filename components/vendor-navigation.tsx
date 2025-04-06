"use client"

import { Home, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function VendorNavigation() {
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

      <Link
        href="/vendor/profile"
        className={`bottom-nav-item android-ripple ${isActive("/vendor/profile") ? "active" : ""}`}
      >
        <User size={24} />
        <span className="text-xs mt-1">Perfil</span>
      </Link>
    </nav>
  )
}

export default VendorNavigation

