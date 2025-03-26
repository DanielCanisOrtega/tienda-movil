"use client"

import type React from "react"

import { UserTypeGuard } from "@/components/user-type-guard"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserTypeGuard allowedUserType="admin" redirectTo="/">
      {children}
    </UserTypeGuard>
  )
}

