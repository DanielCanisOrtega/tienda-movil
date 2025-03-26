"use client"

import type React from "react"

import { UserTypeGuard } from "@/components/user-type-guard"

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserTypeGuard allowedUserType="vendor" redirectTo="/">
      {children}
    </UserTypeGuard>
  )
}

