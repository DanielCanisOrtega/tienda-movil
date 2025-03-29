"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search, Grid3X3 } from "lucide-react"

export function SearchHeader() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category)
    // Emitir evento personalizado para comunicar el cambio de categoría
    const event = new CustomEvent("categoryChange", {
      detail: { category },
    })
    window.dispatchEvent(event)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    // Emitir evento personalizado para comunicar el cambio en la búsqueda
    const event = new CustomEvent("searchChange", {
      detail: { query },
    })
    window.dispatchEvent(event)
  }

  return (
    <div className="bg-white p-4 shadow-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
        <Input
          placeholder="Buscar productos..."
          className="pl-10 bg-input-bg border-0 h-12 text-base rounded-xl"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      <div className="flex justify-between mt-6">
        <CategoryButton
          icon={<Grid3X3 className="h-6 w-6" />}
          label="Todos"
          isActive={activeCategory === "all"}
          onClick={() => handleCategoryClick("all")}
        />
        <CategoryButton
          icon="🍎"
          label="Frutas"
          isActive={activeCategory === "frutas"}
          onClick={() => handleCategoryClick("frutas")}
        />
        <CategoryButton
          icon="🥦"
          label="Verduras"
          isActive={activeCategory === "verduras"}
          onClick={() => handleCategoryClick("verduras")}
        />
        <CategoryButton
          icon="🥛"
          label="Lácteos"
          isActive={activeCategory === "lacteos"}
          onClick={() => handleCategoryClick("lacteos")}
        />
        <CategoryButton
          icon="🥩"
          label="Carnes"
          isActive={activeCategory === "carnes"}
          onClick={() => handleCategoryClick("carnes")}
        />
      </div>
    </div>
  )
}

function CategoryButton({
  icon,
  label,
  isActive = false,
  onClick,
}: {
  icon: React.ReactNode | string
  label: string
  isActive?: boolean
  onClick: () => void
}) {
  return (
    <div
      className={`flex flex-col items-center android-ripple cursor-pointer ${isActive ? "opacity-100" : "opacity-70"}`}
      onClick={onClick}
    >
      <div
        className={`w-14 h-14 rounded-full ${isActive ? "bg-primary text-white" : "bg-input-bg"} flex items-center justify-center text-2xl mb-2`}
      >
        {typeof icon === "string" ? icon : icon}
      </div>
      <span className="text-xs text-text-secondary">{label}</span>
    </div>
  )
}

