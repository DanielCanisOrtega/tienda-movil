interface Sale {
  id: string
  items: {
    product: {
      id: number
      name?: string
      nombre?: string
      price?: number
      precio?: number
      category?: string
      categoria?: string
    }
    quantity: number
  }[]
  total: number
  date: Date | string
  storeId?: string
  storeName?: string
  paymentMethod?: string
  customerInfo?: {
    name?: string
    phone?: string
    email?: string
  }
}

interface SalesListProps {
  sales: Sale[]
  formatPrice: (price: number) => string
}

export function SalesList({ sales, formatPrice }: SalesListProps) {
  if (sales.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No hay ventas registradas en este período</div>
  }

  // Agrupar ventas por fecha
  const salesByDate = sales.reduce(
    (acc, sale) => {
      const saleDate = new Date(sale.date)
      const dateStr = saleDate.toLocaleDateString()
      if (!acc[dateStr]) {
        acc[dateStr] = []
      }
      acc[dateStr].push(sale)
      return acc
    },
    {} as Record<string, Sale[]>,
  )

  return (
    <div className="space-y-6">
      {Object.entries(salesByDate).map(([date, dateSales]) => (
        <div key={date} className="space-y-3">
          <h4 className="font-medium text-sm bg-muted p-2 rounded">
            {date} - {dateSales.length} ventas - {formatPrice(dateSales.reduce((sum, sale) => sum + sale.total, 0))}
          </h4>

          <div className="space-y-4">
            {dateSales.map((sale) => (
              <div key={sale.id} className="border-b pb-3 last:border-0">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-muted-foreground">
                    {new Date(sale.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {sale.customerInfo?.name && <span className="ml-2">• {sale.customerInfo.name}</span>}
                    {sale.paymentMethod && <span className="ml-2">• {sale.paymentMethod}</span>}
                  </div>
                  <div className="font-medium">{formatPrice(sale.total)}</div>
                </div>

                <div className="space-y-1">
                  {sale.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div>
                        {item.quantity} x {item.product.name || item.product.nombre || "Producto"}
                      </div>
                      <div>{formatPrice((item.product.price || item.product.precio || 0) * item.quantity)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
