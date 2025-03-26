import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

const data = [
  { name: "Lun", value: 40 },
  { name: "Mar", value: 30 },
  { name: "Mie", value: 60 },
  { name: "Jue", value: 20 },
  { name: "Vie", value: 50 },
  { name: "Sab", value: 35 },
]

export default function DashboardPage() {
  // Find the maximum value for scaling
  const maxValue = Math.max(...data.map((item) => item.value))

  return (
    <main className="flex min-h-screen flex-col bg-primary android-safe-top">
      <div className="p-4 text-white flex items-center">
        <Link href="/home" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Balances</h1>
      </div>

      <div className="p-4 text-white">
        <div className="text-3xl font-bold">$7,783.00</div>
        <div className="text-sm opacity-80">Balance Total</div>

        <div className="mt-4 bg-white/10 h-3 rounded-full w-full">
          <div className="bg-white h-full rounded-full w-3/4"></div>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span>$0</span>
          <span>$10,000.00</span>
        </div>
      </div>

      <div className="mt-4 bg-white rounded-t-3xl flex-1 p-4">
        <div className="flex space-x-2 mb-4">
          <Button className="text-sm bg-primary hover:bg-primary-dark rounded-full px-4 py-2 android-ripple">
            Diario
          </Button>
          <Button className="text-sm bg-white text-text-secondary border hover:bg-gray-100 rounded-full px-4 py-2 android-ripple">
            Semanal
          </Button>
          <Button className="text-sm bg-white text-text-secondary border hover:bg-gray-100 rounded-full px-4 py-2 android-ripple">
            Mensual
          </Button>
        </div>

        <div className="text-base font-medium mb-2">Ingresos y Egresos</div>

        {/* Custom chart implementation */}
        <div className="h-64 w-full mt-6 relative">
          {/* Chart grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div className="border-t border-gray-200"></div>
            <div className="border-t border-gray-200"></div>
            <div className="border-t border-gray-200"></div>
            <div className="border-t border-gray-200"></div>
          </div>

          {/* Bars */}
          <div className="absolute inset-0 flex items-end justify-between pt-6 pb-8">
            {data.map((item, index) => (
              <div key={index} className="flex flex-col items-center w-full">
                <div
                  className="w-12 bg-primary rounded-t-md"
                  style={{ height: `${(item.value / maxValue) * 100}%` }}
                ></div>
                <div className="mt-2 text-sm text-gray-500">{item.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <div>
            <div className="text-sm text-text-secondary">Ingresos</div>
            <div className="font-bold text-lg">$4,012,033.00</div>
          </div>
          <div>
            <div className="text-sm text-text-secondary">Egresos</div>
            <div className="font-bold text-lg">$320,000.00</div>
          </div>
        </div>
      </div>
    </main>
  )
}