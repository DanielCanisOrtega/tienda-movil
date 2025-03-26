"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export function UserTypeGuard({
  allowedUserType,
  redirectTo,
  children,
}: {
  allowedUserType: string
  redirectTo: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const userType = localStorage.getItem("userType")

    // Si el usuario no es del tipo permitido, redirigirlo
    if (userType !== allowedUserType) {
      router.push(redirectTo)
    }
  }, [allowedUserType, redirectTo, router])

  return <>{children}</>
}

export default UserTypeGuard

