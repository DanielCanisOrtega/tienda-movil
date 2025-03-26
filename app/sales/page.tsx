import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import BottomNavigation from "@/components/BottomNavigation"

export default function SalesPage() {
  const sales = [
    { id: 1, product: "Cebolla 1kg", price: "$12.00", quantity: 3 },
    { id: 2, product: "Tomate 1kg", price: "$10.00", quantity: 2 },
    { id: 3, product: "Plátano 1kg", price: "$5.00", quantity: 5 },
  ]

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top has-bottom-nav">
      <div className="bg-white p-4 flex items-center">
        <Link href="/admin" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Ventas</h1>
      </div>

      <div className="container max-w-md mx-auto p-4">
        <div className="bg-white rounded-lg overflow-hidden mb-5">
          <div className="p-4 border-b">
            <h2 className="font-medium text-lg">Visitas</h2>
          </div>

          <div className="p-4">
            {sales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex-1">
                  <div className="font-medium text-base">{sale.product}</div>
                  <div className="text-sm text-text-secondary">Cantidad: {sale.quantity}</div>
                </div>
                <div className="font-medium text-base">{sale.price}</div>
              </div>
            ))}
          </div>

          <div className="flex p-4">
            <Button className="flex-1 h-12 text-base bg-danger hover:bg-danger/90 text-white android-ripple">
              Cancelar
            </Button>
            <Button className="flex-1 h-12 text-base ml-3 bg-primary hover:bg-primary-dark android-ripple">
              Confirmar
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-medium text-lg">Venta</h2>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div className="font-medium text-base">Cebolla 1kg</div>
              <div className="flex items-center">
                <Button variant="outline" size="sm" className="h-10 w-10 rounded-md p-0 android-ripple">
                  -
                </Button>
                <span className="mx-3 text-base">1</span>
                <Button variant="outline" size="sm" className="h-10 w-10 rounded-md p-0 android-ripple">
                  +
                </Button>
              </div>
              <div className="font-medium text-base">$12.00</div>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div className="font-medium text-base">Tomate 1kg</div>
              <div className="flex items-center">
                <Button variant="outline" size="sm" className="h-10 w-10 rounded-md p-0 android-ripple">
                  -
                </Button>
                <span className="mx-3 text-base">1</span>
                <Button variant="outline" size="sm" className="h-10 w-10 rounded-md p-0 android-ripple">
                  +
                </Button>
              </div>
              <div className="font-medium text-base">$10.00</div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="font-medium text-base">Plátano 1kg</div>
              <div className="flex items-center">
                <Button variant="outline" size="sm" className="h-10 w-10 rounded-md p-0 android-ripple">
                  -
                </Button>
                <span className="mx-3 text-base">1</span>
                <Button variant="outline" size="sm" className="h-10 w-10 rounded-md p-0 android-ripple">
                  +
                </Button>
              </div>
              <div className="font-medium text-base">$5.00</div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>$27.00</span>
              </div>
            </div>
          </div>

          <div className="flex p-4">
            <Button className="flex-1 h-12 text-base bg-danger hover:bg-danger/90 text-white android-ripple">
              Cancelar
            </Button>
            <Button className="flex-1 h-12 text-base ml-3 bg-primary hover:bg-primary-dark android-ripple">
              Confirmar
            </Button>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </main>
  )
}

