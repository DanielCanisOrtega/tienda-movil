"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { VendorNavigation } from "@/components/vendor-navigation"

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  // Asegurarse de que el vendedor vuelva a la página de inicio cuando presiona atrás
  useEffect(() => {
    const handleBackButton = (e: PopStateEvent) => {
      // Si el usuario está en una página que no es la de inicio, redirigirlo a inicio
      if (pathname !== "/home" && localStorage.getItem("userType")) {
        router.push("/home")
      }
    }

    window.addEventListener("popstate", handleBackButton)

    return () => {
      window.removeEventListener("popstate", handleBackButton)
    }
  }, [pathname, router])

  return (
    <div className="has-bottom-nav">
      {children}
      <VendorNavigation />
    </div>
  )
}