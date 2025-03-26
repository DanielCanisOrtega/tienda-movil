import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export function ProfileHeader() {
  return (
    <div className="bg-primary text-white p-4 relative">
      <Link href="/home" className="absolute top-4 left-4">
        <ChevronLeft className="h-6 w-6" />
      </Link>
      <div className="flex flex-col items-center justify-center pt-6">
        <div className="w-16 h-16 rounded-full bg-white/20 mb-2 overflow-hidden">
          <img src="/placeholder.svg?height=64&width=64" alt="Profile" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-xl font-medium">Daniel Guaticancas</h1>
        <p className="text-xs opacity-80">Vendedor • Comprador</p>
      </div>
    </div>
  )
}