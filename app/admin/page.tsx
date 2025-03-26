import { Button } from "@/components/ui/button"
import Link from "next/link"
import BottomNavigation from "@/components/BottomNavigation"

export default function AdminPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top has-bottom-nav">
      <div className="bg-white p-5">
        <h1 className="text-xl font-semibold">Administrador</h1>
        <p className="text-sm text-text-secondary mt-1">Se puede de todo aquí controlarlo</p>
      </div>

      <div className="container max-w-md mx-auto p-4">
        <div className="space-y-5">
          <div className="bg-white rounded-lg p-5">
            <h2 className="font-medium text-lg mb-4">Productos y Categorías</h2>
            <div className="space-y-3">
              <Link href="/add-product">
                <Button className="w-full h-12 text-base bg-primary hover:bg-primary-dark android-ripple">
                  Añadir Producto
                </Button>
              </Link>
              <Button className="w-full h-12 text-base bg-white text-primary border border-primary hover:bg-primary/10 android-ripple">
                Gestionar Categorías
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5">
            <h2 className="font-medium text-lg mb-4">Ventas</h2>
            <div className="space-y-3">
              <Button className="w-full h-12 text-base bg-primary hover:bg-primary-dark android-ripple">
                Ver Ventas
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5">
            <h2 className="font-medium text-lg mb-4">Configuración de Cuenta</h2>
            <div className="space-y-3">
              <Button className="w-full h-12 text-base bg-white text-danger border border-danger hover:bg-danger/10 android-ripple">
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </main>
  )
}

