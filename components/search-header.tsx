"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function SearchHeader() {
  return (
    <div className="bg-white p-4 shadow-sm">
      <h1 className="text-xl font-semibold mb-4">¿Qué estás buscando?</h1>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
        <Input placeholder="Frutas, verduras..." className="pl-10 bg-input-bg border-0 h-12 text-base rounded-xl" />
      </div>
      <div className="flex justify-between mt-6">
        <CategoryButton icon="🍎" label="Frutas" />
        <CategoryButton icon="🥦" label="Verduras" />
        <CategoryButton icon="🥛" label="Lácteos" />
        <CategoryButton icon="🥩" label="Carnes" />
      </div>
    </div>
  )
}

function CategoryButton({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center android-ripple">
      <div className="w-14 h-14 rounded-full bg-input-bg flex items-center justify-center text-2xl mb-2">{icon}</div>
      <span className="text-xs text-text-secondary">{label}</span>
    </div>
  )
}

