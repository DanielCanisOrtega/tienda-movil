"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, User } from "lucide-react"

export function BottomNavigation() {
  const pathname = usePathname()

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full rounded-xl transition-all duration-200 mx-2 ${
                isActive
                  ? "text-primary bg-primary/10 scale-105"
                  : "text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/5 hover:scale-102"
              }`}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
