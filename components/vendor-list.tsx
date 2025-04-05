"use client"

import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"
import type { Vendor } from "@/app/profile/page"

interface VendorListProps {
  vendors: Vendor[]
  onEdit: (vendor: Vendor) => void
  onDelete: (id: string) => void
}

export function VendorList({ vendors, onEdit, onDelete }: VendorListProps) {
  if (vendors.length === 0) {
    return <div className="text-center py-4 text-text-secondary">No hay vendedores registrados</div>
  }

  return (
    <div className="space-y-3">
      {vendors.map((vendor) => (
        <div key={vendor.id} className="flex items-center justify-between border-b pb-3 last:border-0">
          <div>
            <div className="font-medium">{vendor.name}</div>
            <div className="text-sm text-text-secondary">{vendor.phone}</div>
            <div className="text-sm text-text-secondary">{vendor.email}</div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(vendor)}>
              <Edit2 className="h-4 w-4" />
              <span className="sr-only">Editar</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 text-red-500"
              onClick={() => onDelete(vendor.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Eliminar</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

