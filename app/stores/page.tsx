"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Edit, Plus, Search, Store, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Definir la interfaz para las tiendas
interface Store {
  id: string
  name: string
  address: string
  phone: string
  description?: string
  image?: string
  createdAt: string
}

export default function StoresPage() {
  const router = useRouter()
  const [stores, setStores] = useState<Store[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredStores, setFilteredStores] = useState<Store[]>([])
  const [userType, setUserType] = useState<string | null>(null)

  // Cargar tiendas del localStorage
  useEffect(() => {
    // Verificar si el usuario es administrador
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)

    if (storedUserType !== "admin") {
      // Redirigir a la página de inicio si no es administrador
      router.push("/")
      return
    }

    // Cargar tiendas del localStorage
    const storedStores = localStorage.getItem("stores")
    if (storedStores) {
      setStores(JSON.parse(storedStores))
    } else {
      // Datos iniciales de ejemplo
      const initialStores: Store[] = [
        {
          id: "1",
          name: "Tienda Principal",
          address: "Calle 123 #45-67",
          phone: "+57 3124567890",
          description: "Tienda principal de productos mixtos",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Sucursal Norte",
          address: "Avenida Norte #78-90",
          phone: "+57 3209876543",
          description: "Sucursal ubicada en la zona norte",
          createdAt: new Date().toISOString(),
        },
      ]
      setStores(initialStores)
      localStorage.setItem("stores", JSON.stringify(initialStores))
    }
  }, [router])

  // Filtrar tiendas según búsqueda
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStores(stores)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = stores.filter(
        (store) =>
          store.name.toLowerCase().includes(query) ||
          store.address.toLowerCase().includes(query) ||
          store.description?.toLowerCase().includes(query),
      )
      setFilteredStores(filtered)
    }
  }, [stores, searchQuery])

  const handleDeleteStore = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta tienda? Esta acción no se puede deshacer.")) {
      const updatedStores = stores.filter((store) => store.id !== id)
      setStores(updatedStores)
      localStorage.setItem("stores", JSON.stringify(updatedStores))
    }
  }

  const handleSelectStore = (storeId: string) => {
    // Guardar la tienda seleccionada en localStorage
    localStorage.setItem("selectedStoreId", storeId)

    // Obtener la tienda seleccionada
    const selectedStore = stores.find((store) => store.id === storeId)
    if (selectedStore) {
      localStorage.setItem("selectedStoreName", selectedStore.name)
    }

    // Redirigir a la página de inicio con la tienda seleccionada
    router.push(`/home?storeId=${storeId}`)
  }

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top">
      <div className="bg-primary text-white p-5">
        <h1 className="text-2xl font-semibold">Gestión de Tiendas</h1>
        <p className="text-sm opacity-80 mt-1">Administra tus tiendas</p>
      </div>

      <div className="container max-w-md mx-auto p-4 space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
            <Input
              placeholder="Buscar tiendas..."
              className="pl-10 bg-input-bg border-0 h-12 text-base rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Link href="/stores/add">
          <Button className="w-full h-12 bg-primary hover:bg-primary-dark flex items-center justify-center">
            <Plus className="mr-2 h-5 w-5" />
            Añadir Nueva Tienda
          </Button>
        </Link>

        {filteredStores.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-text-secondary mb-2">No hay tiendas registradas</p>
              <p className="text-sm text-text-secondary">Comienza añadiendo tu primera tienda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredStores.map((store) => (
              <Card key={store.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>{store.name}</span>
                    <div className="flex space-x-2">
                      <Link href={`/stores/edit/${store.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4 text-primary" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500"
                        onClick={() => handleDeleteStore(store.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-text-secondary">{store.address}</p>
                  <p className="text-sm text-text-secondary">{store.phone}</p>
                  {store.description && <p className="text-sm mt-2">{store.description}</p>}

                  <Button
                    className="w-full mt-4 bg-primary hover:bg-primary-dark"
                    onClick={() => handleSelectStore(store.id)}
                  >
                    Entrar a la tienda
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

