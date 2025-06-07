"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, User } from "lucide-react"

export function BottomNavigation() {
  const pathname = usePathname()

  // Solo mostrar en la página de inicio (/home)
  if (pathname !== "/home") {
    return null
  }

  const navItems = [
    {
      href: "/home",
      icon: Home,
      label: "Inicio",
    },
    {
      href: "/profile",
      icon: User,
      label: "Perfil",
    },
  ]

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link key={item.href} href={item.href} className={`bottom-nav-item ${isActive ? "active" : ""}`}>
            <Icon className="h-6 w-6 mb-1" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
