import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Plus } from "lucide-react"
import Link from "next/link"

export default function AddProductPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top">
      <div className="bg-white p-4 flex items-center">
        <Link href="/home" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Añadir un producto</h1>
      </div>

      <div className="container max-w-md mx-auto p-4">
        <form className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">
              Nombre
            </Label>
            <Input id="name" placeholder="Nombre del producto" className="bg-input-bg border-0 h-12 text-base" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="text-base">
              Precio
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base">$</span>
              <Input
                id="price"
                placeholder="0.00"
                className="bg-input-bg border-0 pl-8 h-12 text-base"
                type="number"
                inputMode="decimal"
              />
            </div>
          </div>

          <div className="bg-input-bg rounded-lg p-4 flex flex-col items-center justify-center h-40">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <p className="text-base text-text-secondary">Añadir foto</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-base">
              Descripción
            </Label>
            <Input
              id="description"
              placeholder="Descripción del producto"
              className="bg-input-bg border-0 h-12 text-base"
            />
          </div>

          <Button className="w-full h-14 text-base bg-primary hover:bg-primary-dark mt-6 android-ripple">
            Publicar
          </Button>
        </form>
      </div>

      <div className="fixed bottom-0 left-0 right-0">
        <div className="flex justify-between bg-primary p-4 max-w-md mx-auto">
          <div className="flex justify-center w-full">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}