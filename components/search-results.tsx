import Image from "next/image"

export function SearchResults() {
  const products = [
    { id: 1, name: "Plátano", price: "$1.50/lb" },
    { id: 2, name: "Plátano", price: "$1.50/lb" },
  ]

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm android-ripple">
          <div className="relative h-48 w-full">
            <Image src="/placeholder.svg?height=192&width=400" alt={product.name} fill className="object-cover" />
          </div>
          <div className="p-4">
            <div className="font-medium text-lg">{product.name}</div>
            <div className="text-base text-text-secondary">{product.price}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

