"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Edit, Plus, Search, Store, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { fetchWithAuth } from "@/services/auth-service"

// Definir la interfaz para las tiendas
interface StoreType {
  id: string
  nombre: string
  direccion: string
  telefono: string
  descripcion?: string
  imagen?: string
  fecha_creacion: string
}

export default function StoresPage() {
  const router = useRouter()
  const [stores, setStores] = useState<StoreType[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredStores, setFilteredStores] = useState<StoreType[]>([])
  const [userType, setUserType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar tiendas de la API
  useEffect(() => {
    // Verificar si el usuario es administrador
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)

    if (storedUserType !== "admin") {
      // Redirigir a la página de inicio si no es administrador
      router.push("/")
      return
    }

    // Función para cargar las tiendas
    const fetchStores = async () => {
      setIsLoading(true)
      setError(null)

      try {
        console.log("Intentando conectar a:", "https://tienda-backend-p9ms.onrender.com/api/tiendas/")

        const response = await fetchWithAuth("https://tienda-backend-p9ms.onrender.com/api/tiendas/", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "omit",
        })

        console.log("Respuesta recibida:", response.status, response.statusText)

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Datos recibidos:", data)
        setStores(data)
      } catch (err) {
        console.error("Error detallado al cargar las tiendas:", err)
        setError(`No se pudieron cargar las tiendas: ${err instanceof Error ? err.message : 'Error desconocido'}. Por favor, intenta de nuevo más tarde.`)      } finally {
        setIsLoading(false)
      }
    }

    fetchStores()
  }, [router])

  // Filtrar tiendas según búsqueda
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStores(stores)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = stores.filter(
        (store) =>
          store.nombre.toLowerCase().includes(query) ||
          store.direccion.toLowerCase().includes(query) ||
          store.descripcion?.toLowerCase().includes(query),
      )
      setFilteredStores(filtered)
    }
  }, [stores, searchQuery])

  const handleDeleteStore = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta tienda? Esta acción no se puede deshacer.")) {
      try {
        const response = await fetchWithAuth(`https://tienda-backend-p9ms.onrender.com/api/tiendas/${id}/`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`)
        }

        // Actualizar la lista de tiendas después de eliminar
        setStores(stores.filter((store) => store.id !== id))
        alert("Tienda eliminada con éxito")
      } catch (err) {
        console.error("Error al eliminar la tienda:", err)
        alert("No se pudo eliminar la tienda. Por favor, intenta de nuevo más tarde.")
      }
    }
  }

  const handleSelectStore = async (storeId: string, storeName: string) => {
    try {
      const response = await fetchWithAuth(
        `https://tienda-backend-p9ms.onrender.com/api/tiendas/${storeId}/seleccionar_tienda/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }

      // Guardar la tienda seleccionada en localStorage
      localStorage.setItem("selectedStoreId", storeId)
      localStorage.setItem("selectedStoreName", storeName)

      // Redirigir a la página de inicio con la tienda seleccionada
      router.push(`/home?storeId=${storeId}`)
    } catch (err) {
      console.error("Error al seleccionar la tienda:", err)
      alert("No se pudo seleccionar la tienda. Por favor, intenta de nuevo más tarde.")
    }
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

        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-text-secondary">Cargando tiendas...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <p className="text-sm text-text-secondary mb-4">
                Esto podría deberse a problemas de conectividad o que el servidor está temporalmente inaccesible.
              </p>
              <Button onClick={() => window.location.reload()} className="mt-2 bg-primary hover:bg-primary-dark">
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : filteredStores.length === 0 ? (
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
                    <span>{store.nombre}</span>
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
                  <p className="text-sm text-text-secondary">{store.direccion}</p>
                  <p className="text-sm text-text-secondary">{store.telefono}</p>
                  {store.descripcion && <p className="text-sm mt-2">{store.descripcion}</p>}

                  <Button
                    className="w-full mt-4 bg-primary hover:bg-primary-dark"
                    onClick={() => handleSelectStore(store.id, store.nombre)}
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

