import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-light">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="mt-4 text-text-primary">Cargando productos...</p>
    </div>
  )
}
