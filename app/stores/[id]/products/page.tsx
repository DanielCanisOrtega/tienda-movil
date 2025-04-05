"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
<<<<<<< HEAD
import { ChevronLeft, Filter, Plus, Search } from "lucide-react"
=======
import { ChevronLeft, Filter, Plus, Search, AlertCircle, RefreshCw } from "lucide-react"
>>>>>>> 3870742a9a7e94a94118d2e6cf41f9a770310339
import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Interfaz para productos
interface Producto {
  id: number
  nombre: string
  descripcion?: string
  precio: number
  cantidad: number
  categoria: string
  disponible?: boolean
  tienda?: number
  codigo_barras?: string
  imagen?: string
}

<<<<<<< HEAD
// Generate more sample products data
const sampleProductos: Producto[] = [
  // Frutas
=======
// Productos de ejemplo para usar como fallback
const PRODUCTOS_EJEMPLO: Producto[] = [
>>>>>>> 3870742a9a7e94a94118d2e6cf41f9a770310339
  {
    id: 1,
    nombre: "Manzana Roja",
    descripcion: "Manzana roja fresca",
<<<<<<< HEAD
    precio: 2500,
    cantidad: 50,
=======
    precio: 4500,
    cantidad: 100,
>>>>>>> 3870742a9a7e94a94118d2e6cf41f9a770310339
    categoria: "Frutas",
    disponible: true,
    tienda: 1,
  },
  {
    id: 2,
    nombre: "Banano",
<<<<<<< HEAD
    descripcion: "Banano maduro",
    precio: 1800,
    cantidad: 80,
=======
    descripcion: "Banano fresco",
    precio: 3200,
    cantidad: 150,
>>>>>>> 3870742a9a7e94a94118d2e6cf41f9a770310339
    categoria: "Frutas",
    disponible: true,
    tienda: 1,
  },
  {
    id: 3,
<<<<<<< HEAD
    nombre: "Naranja",
    descripcion: "Naranja jugosa",
    precio: 2000,
    cantidad: 60,
    categoria: "Frutas",
=======
    nombre: "Tomate",
    descripcion: "Tomate fresco",
    precio: 4200,
    cantidad: 80,
    categoria: "Verduras",
>>>>>>> 3870742a9a7e94a94118d2e6cf41f9a770310339
    disponible: true,
    tienda: 1,
  },
  {
    id: 4,
<<<<<<< HEAD
    nombre: "Pera",
    descripcion: "Pera dulce",
    precio: 2800,
    cantidad: 40,
    categoria: "Frutas",
=======
    nombre: "Cebolla",
    descripcion: "Cebolla cabezona",
    precio: 3800,
    cantidad: 60,
    categoria: "Verduras",
>>>>>>> 3870742a9a7e94a94118d2e6cf41f9a770310339
    disponible: true,
    tienda: 1,
  },
  {
    id: 5,
<<<<<<< HEAD
    nombre: "Uvas",
    descripcion: "Uvas sin semilla",
    precio: 5000,
    cantidad: 30,
    categoria: "Frutas",
    disponible: true,
    tienda: 1,
  },
  {
    id: 6,
    nombre: "Fresa",
    descripcion: "Fresas frescas",
    precio: 4500,
    cantidad: 25,
    categoria: "Frutas",
    disponible: true,
    tienda: 1,
  },

  // Verduras
  {
    id: 7,
    nombre: "Tomate",
    descripcion: "Tomate rojo maduro",
    precio: 3000,
    cantidad: 45,
    categoria: "Verduras",
    disponible: true,
    tienda: 1,
  },
  {
    id: 8,
    nombre: "Cebolla",
    descripcion: "Cebolla cabezona",
    precio: 2200,
    cantidad: 55,
    categoria: "Verduras",
    disponible: true,
    tienda: 1,
  },
  {
    id: 9,
    nombre: "Zanahoria",
    descripcion: "Zanahoria fresca",
    precio: 1900,
    cantidad: 70,
    categoria: "Verduras",
    disponible: true,
    tienda: 1,
  },
  {
    id: 10,
    nombre: "Lechuga",
    descripcion: "Lechuga crespa",
    precio: 2500,
    cantidad: 35,
    categoria: "Verduras",
    disponible: true,
    tienda: 1,
  },
  {
    id: 11,
    nombre: "Pimentón",
    descripcion: "Pimentón rojo",
    precio: 3200,
    cantidad: 30,
    categoria: "Verduras",
    disponible: true,
    tienda: 1,
  },
  {
    id: 12,
    nombre: "Papa",
    descripcion: "Papa sabanera",
    precio: 2000,
    cantidad: 100,
    categoria: "Verduras",
    disponible: true,
    tienda: 1,
  },

  // Lácteos
  {
    id: 13,
    nombre: "Leche Entera",
    descripcion: "Leche entera 1L",
    precio: 4500,
    cantidad: 40,
    categoria: "Lácteos",
    disponible: true,
    tienda: 1,
  },
  {
    id: 14,
    nombre: "Queso Campesino",
    descripcion: "Queso campesino 500g",
    precio: 12000,
    cantidad: 25,
    categoria: "Lácteos",
    disponible: true,
    tienda: 1,
  },
  {
    id: 15,
    nombre: "Yogurt Natural",
    descripcion: "Yogurt natural 1L",
    precio: 7500,
    cantidad: 30,
    categoria: "Lácteos",
    disponible: true,
    tienda: 1,
  },
  {
    id: 16,
    nombre: "Mantequilla",
    descripcion: "Mantequilla 250g",
    precio: 8500,
    cantidad: 20,
    categoria: "Lácteos",
    disponible: true,
    tienda: 1,
  },
  {
    id: 17,
    nombre: "Crema de Leche",
    descripcion: "Crema de leche 200ml",
    precio: 5500,
    cantidad: 35,
    categoria: "Lácteos",
    disponible: true,
    tienda: 1,
  },

  // Carnes
  {
    id: 18,
    nombre: "Pechuga de Pollo",
    descripcion: "Pechuga de pollo 1kg",
    precio: 15000,
    cantidad: 20,
    categoria: "Carnes",
    disponible: true,
    tienda: 1,
  },
  {
    id: 19,
    nombre: "Carne Molida",
    descripcion: "Carne molida de res 500g",
    precio: 12000,
    cantidad: 25,
    categoria: "Carnes",
    disponible: true,
    tienda: 1,
  },
  {
    id: 20,
    nombre: "Lomo de Cerdo",
    descripcion: "Lomo de cerdo 1kg",
    precio: 18000,
    cantidad: 15,
    categoria: "Carnes",
    disponible: true,
    tienda: 1,
  },
  {
    id: 21,
    nombre: "Costillas BBQ",
    descripcion: "Costillas de cerdo BBQ 1kg",
    precio: 22000,
    cantidad: 10,
    categoria: "Carnes",
    disponible: true,
    tienda: 1,
  },

  // Abarrotes
  {
    id: 22,
    nombre: "Arroz",
    descripcion: "Arroz blanco 1kg",
    precio: 5500,
    cantidad: 80,
    categoria: "Abarrotes",
    disponible: true,
    tienda: 1,
  },
  {
    id: 23,
    nombre: "Azúcar",
    descripcion: "Azúcar refinada 1kg",
    precio: 4800,
    cantidad: 70,
    categoria: "Abarrotes",
    disponible: true,
    tienda: 1,
  },
  {
    id: 24,
    nombre: "Aceite",
    descripcion: "Aceite vegetal 1L",
    precio: 12000,
    cantidad: 50,
    categoria: "Abarrotes",
    disponible: true,
    tienda: 1,
  },
  {
    id: 25,
    nombre: "Pasta",
    descripcion: "Pasta espagueti 500g",
    precio: 3500,
    cantidad: 60,
    categoria: "Abarrotes",
    disponible: true,
    tienda: 1,
  },
  {
    id: 26,
    nombre: "Frijoles",
    descripcion: "Frijoles rojos 500g",
    precio: 6000,
    cantidad: 45,
    categoria: "Abarrotes",
    disponible: true,
    tienda: 1,
  },

  // Bebidas
  {
    id: 27,
    nombre: "Agua Mineral",
    descripcion: "Agua mineral 1.5L",
    precio: 3000,
    cantidad: 100,
    categoria: "Bebidas",
    disponible: true,
    tienda: 1,
  },
  {
    id: 28,
    nombre: "Refresco Cola",
    descripcion: "Refresco de cola 2L",
    precio: 5500,
    cantidad: 80,
    categoria: "Bebidas",
    disponible: true,
    tienda: 1,
  },
  {
    id: 29,
    nombre: "Jugo de Naranja",
    descripcion: "Jugo de naranja natural 1L",
    precio: 7000,
    cantidad: 40,
    categoria: "Bebidas",
    disponible: true,
    tienda: 1,
  },
  {
    id: 30,
    nombre: "Cerveza",
    descripcion: "Cerveza nacional 330ml",
    precio: 2500,
    cantidad: 120,
    categoria: "Bebidas",
    disponible: true,
    tienda: 1,
  },

  // Limpieza
  {
    id: 31,
    nombre: "Detergente",
    descripcion: "Detergente en polvo 1kg",
    precio: 9500,
    cantidad: 50,
    categoria: "Limpieza",
    disponible: true,
    tienda: 1,
  },
  {
    id: 32,
    nombre: "Jabón de Baño",
    descripcion: "Jabón de baño x3",
    precio: 7500,
    cantidad: 60,
    categoria: "Limpieza",
    disponible: true,
    tienda: 1,
  },
  {
    id: 33,
    nombre: "Limpiador Multiusos",
    descripcion: "Limpiador multiusos 750ml",
    precio: 8000,
    cantidad: 45,
    categoria: "Limpieza",
    disponible: true,
    tienda: 1,
  },
  {
    id: 34,
    nombre: "Papel Higiénico",
    descripcion: "Papel higiénico x12",
    precio: 15000,
    cantidad: 40,
    categoria: "Limpieza",
    disponible: true,
    tienda: 1,
  },

  // Otros
  {
    id: 35,
    nombre: "Pilas AA",
    descripcion: "Pilas alcalinas AA x4",
    precio: 12000,
    cantidad: 30,
    categoria: "Otros",
    disponible: true,
    tienda: 1,
  },
  {
    id: 36,
    nombre: "Velas",
    descripcion: "Velas blancas x10",
    precio: 5000,
    cantidad: 50,
    categoria: "Otros",
    disponible: true,
    tienda: 1,
  },
  {
    id: 37,
    nombre: "Encendedor",
    descripcion: "Encendedor recargable",
    precio: 3500,
    cantidad: 40,
    categoria: "Otros",
    disponible: true,
    tienda: 1,
  },
  {
    id: 38,
    nombre: "Bolsas de Basura",
    descripcion: "Bolsas de basura x10",
    precio: 4500,
    cantidad: 60,
    categoria: "Otros",
=======
    nombre: "Leche",
    descripcion: "Leche entera",
    precio: 4800,
    cantidad: 40,
    categoria: "Lácteos",
>>>>>>> 3870742a9a7e94a94118d2e6cf41f9a770310339
    disponible: true,
    tienda: 1,
  },
]

export default function ProductsPage() {
  const params = useParams()
  const router = useRouter()
  const storeId = params.id as string

  const [productos, setProductos] = useState<Producto[]>([])
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
  const [activeCategory, setActiveCategory] = useState("Todos")
  const [storeName, setStoreName] = useState<string>("")
  const [categories, setCategories] = useState<string[]>([])
<<<<<<< HEAD
  const [nextId, setNextId] = useState(39) // Para generar IDs únicos

  // Cargar productos
=======
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [useFallbackData, setUseFallbackData] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  // Función para obtener el token de autenticación usando XMLHttpRequest
  const getAuthToken = () => {
    return new Promise<string>((resolve, reject) => {
      // Verificar si ya tenemos un token almacenado
      let token = localStorage.getItem("backendToken")

      if (token) {
        resolve(token)
        return
      }

      // Si no hay token, iniciar sesión para obtener uno nuevo
      console.log("No hay token, iniciando sesión...")

      const xhr = new XMLHttpRequest()
      xhr.open("POST", "https://tienda-backend-p9ms.onrender.com/api/token/", true)
      xhr.setRequestHeader("Content-Type", "application/json")

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            token = response.access

            // Guardar el token en localStorage
            if (token) {
              localStorage.setItem("backendToken", token)
              resolve(token)
            } else {
              reject(new Error("No se recibió un token válido"))
            }
          } catch (e) {
            reject(new Error(`Error al parsear respuesta: ${e}`))
          }
        } else {
          reject(new Error(`Error de autenticación: ${xhr.status} - ${xhr.statusText}`))
        }
      }

      xhr.onerror = () => {
        reject(new Error("Error de red al intentar autenticar"))
      }

      xhr.send(
        JSON.stringify({
          username: "admin",
          password: "clave_seminario",
        }),
      )
    })
  }

  // Función para seleccionar tienda usando XMLHttpRequest
  const selectStore = () => {
    return new Promise<boolean>((resolve, reject) => {
      getAuthToken()
        .then((token) => {
          console.log(`Seleccionando tienda con ID: ${storeId}`)

          const xhr = new XMLHttpRequest()
          xhr.open("POST", `https://tienda-backend-p9ms.onrender.com/api/tiendas/${storeId}/seleccionar_tienda/`, true)
          xhr.setRequestHeader("Content-Type", "application/json")
          xhr.setRequestHeader("Authorization", `Bearer ${token}`)

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              console.log("Tienda seleccionada correctamente")
              setDebugInfo((prev) => prev + `Respuesta de selección: ${xhr.responseText}\n`)
              resolve(true)
            } else {
              setDebugInfo(
                (prev) =>
                  prev + `Error al seleccionar tienda: ${xhr.status} - ${xhr.statusText} - ${xhr.responseText}\n`,
              )
              reject(new Error(`Error al seleccionar tienda: ${xhr.status} - ${xhr.statusText}`))
            }
          }

          xhr.onerror = () => {
            reject(new Error("Error de red al intentar seleccionar tienda"))
          }

          // Probar con diferentes formatos de datos
          const dataToSend =
            retryCount % 3 === 0
              ? {}
              : retryCount % 3 === 1
                ? { nombre: "", telefono: "", direccion: "" }
                : { tienda_id: storeId }

          xhr.send(JSON.stringify(dataToSend))
        })
        .catch(reject)
    })
  }

  // Función para obtener productos usando XMLHttpRequest
  const getProducts = () => {
    return new Promise<Producto[]>((resolve, reject) => {
      getAuthToken()
        .then((token) => {
          console.log("Obteniendo productos...")

          const xhr = new XMLHttpRequest()
          xhr.open("GET", "https://tienda-backend-p9ms.onrender.com/api/productos/", true)
          xhr.setRequestHeader("Authorization", `Bearer ${token}`)
          xhr.timeout = 10000 // 10 segundos de timeout

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                setDebugInfo((prev) => prev + `Respuesta de productos: ${xhr.responseText}\n`)
                const data = JSON.parse(xhr.responseText)

                if (!Array.isArray(data)) {
                  setDebugInfo((prev) => prev + `La respuesta no es un array: ${JSON.stringify(data)}\n`)
                  reject(new Error("La respuesta no tiene el formato esperado"))
                  return
                }

                console.log(`Se encontraron ${data.length} productos`)
                resolve(data)
              } catch (e) {
                reject(new Error(`Error al parsear respuesta JSON: ${e}`))
              }
            } else {
              setDebugInfo(
                (prev) =>
                  prev + `Error al obtener productos: ${xhr.status} - ${xhr.statusText} - ${xhr.responseText}\n`,
              )
              reject(new Error(`Error al obtener productos: ${xhr.status} - ${xhr.statusText}`))
            }
          }

          xhr.ontimeout = () => {
            reject(new Error("Timeout al obtener productos"))
          }

          xhr.onerror = () => {
            reject(new Error("Error de red al intentar obtener productos"))
          }

          xhr.send()
        })
        .catch(reject)
    })
  }

  // Función para intentar obtener productos con múltiples estrategias
  const fetchProductsWithRetry = async () => {
    setIsLoading(true)
    setError(null)
    setDebugInfo("")

    // Cancelar cualquier solicitud anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      // Estrategia 1: Intentar seleccionar tienda y obtener productos
      try {
        await selectStore()

        // Pequeña pausa para asegurar que la selección de tienda se ha procesado
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const productosData = await getProducts()
        setProductos(productosData)
        setFilteredProductos(productosData)

        // Extraer categorías únicas
        const uniqueCategories = Array.from(
          new Set(productosData.map((producto: Producto) => producto.categoria)),
        ) as string[]
        setCategories(["Todos", ...uniqueCategories])

        // Guardar en caché local
        try {
          localStorage.setItem(`productos_tienda_${storeId}`, JSON.stringify(productosData))
          localStorage.setItem(`productos_tienda_${storeId}_timestamp`, Date.now().toString())
        } catch (e) {
          console.error("Error al guardar en caché:", e)
        }

        setUseFallbackData(false)
        return
      } catch (error) {
        console.error("Error en la estrategia 1:", error)
        setDebugInfo((prev) => prev + `Error en estrategia 1: ${error}\n`)

        // Continuar con la siguiente estrategia
      }

      // Estrategia 2: Intentar obtener productos directamente sin seleccionar tienda
      try {
        const productosData = await getProducts()

        // Filtrar productos por tienda en el cliente
        const filteredByStore = productosData.filter(
          (p) => p.tienda === Number.parseInt(storeId) || p.tienda === Number(storeId),
        )

        if (filteredByStore.length > 0) {
          setProductos(filteredByStore)
          setFilteredProductos(filteredByStore)

          // Extraer categorías únicas
          const uniqueCategories = Array.from(
            new Set(filteredByStore.map((producto: Producto) => producto.categoria)),
          ) as string[]
          setCategories(["Todos", ...uniqueCategories])

          // Guardar en caché local
          try {
            localStorage.setItem(`productos_tienda_${storeId}`, JSON.stringify(filteredByStore))
            localStorage.setItem(`productos_tienda_${storeId}_timestamp`, Date.now().toString())
          } catch (e) {
            console.error("Error al guardar en caché:", e)
          }

          setUseFallbackData(false)
          return
        } else {
          throw new Error("No se encontraron productos para esta tienda")
        }
      } catch (error) {
        console.error("Error en la estrategia 2:", error)
        setDebugInfo((prev) => prev + `Error en estrategia 2: ${error}\n`)

        // Continuar con la siguiente estrategia
      }

      // Estrategia 3: Verificar si hay datos en caché
      try {
        const cachedData = localStorage.getItem(`productos_tienda_${storeId}`)
        const timestamp = localStorage.getItem(`productos_tienda_${storeId}_timestamp`)

        if (cachedData && timestamp) {
          const age = Date.now() - Number.parseInt(timestamp)
          // Usar caché si tiene menos de 1 hora
          if (age < 3600000) {
            const productosData = JSON.parse(cachedData)
            setProductos(productosData)
            setFilteredProductos(productosData)

            // Extraer categorías únicas
            const uniqueCategories = Array.from(
              new Set(productosData.map((producto: Producto) => producto.categoria)),
            ) as string[]
            setCategories(["Todos", ...uniqueCategories])

            setDebugInfo((prev) => prev + `Usando datos en caché (${age / 1000} segundos de antigüedad)\n`)
            setUseFallbackData(false)
            return
          }
        }
      } catch (error) {
        console.error("Error al usar caché:", error)
        setDebugInfo((prev) => prev + `Error al usar caché: ${error}\n`)
      }

      // Estrategia 4: Usar datos de ejemplo como último recurso
      setDebugInfo((prev) => prev + "Usando datos de ejemplo como fallback\n")
      setProductos(PRODUCTOS_EJEMPLO)
      setFilteredProductos(PRODUCTOS_EJEMPLO)

      // Extraer categorías únicas
      const uniqueCategories = Array.from(
        new Set(PRODUCTOS_EJEMPLO.map((producto: Producto) => producto.categoria)),
      ) as string[]
      setCategories(["Todos", ...uniqueCategories])

      setUseFallbackData(true)
      setError("No se pudieron cargar los productos reales. Mostrando datos de ejemplo.")
    } catch (error) {
      console.error("Error general:", error)
      setError(`Error al cargar productos: ${error instanceof Error ? error.message : "Error desconocido"}`)

      // Usar datos de ejemplo como último recurso
      setProductos(PRODUCTOS_EJEMPLO)
      setFilteredProductos(PRODUCTOS_EJEMPLO)

      // Extraer categorías únicas
      const uniqueCategories = Array.from(
        new Set(PRODUCTOS_EJEMPLO.map((producto: Producto) => producto.categoria)),
      ) as string[]
      setCategories(["Todos", ...uniqueCategories])

      setUseFallbackData(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Función para iniciar polling de productos
  const startPolling = () => {
    if (isPolling) return

    setIsPolling(true)
    setDebugInfo((prev) => prev + "Iniciando polling de productos...\n")

    let attempts = 0
    const maxAttempts = 5
    const pollInterval = 2000 // 2 segundos

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setIsPolling(false)
        setDebugInfo((prev) => prev + `Polling finalizado después de ${maxAttempts} intentos\n`)
        return
      }

      attempts++
      setDebugInfo((prev) => prev + `Intento de polling #${attempts}\n`)

      try {
        // Intentar seleccionar tienda
        await selectStore()

        // Pequeña pausa
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Obtener productos
        const productosData = await getProducts()

        if (productosData.length > 0) {
          setProductos(productosData)
          setFilteredProductos(productosData)

          // Extraer categorías únicas
          const uniqueCategories = Array.from(
            new Set(productosData.map((producto: Producto) => producto.categoria)),
          ) as string[]
          setCategories(["Todos", ...uniqueCategories])

          setUseFallbackData(false)
          setIsPolling(false)
          setDebugInfo((prev) => prev + `Polling exitoso en el intento #${attempts}\n`)
          return
        }

        // Si no hay productos, continuar con el siguiente intento
        setTimeout(poll, pollInterval)
      } catch (error) {
        console.error(`Error en intento de polling #${attempts}:`, error)
        setDebugInfo((prev) => prev + `Error en intento de polling #${attempts}: ${error}\n`)

        // Continuar con el siguiente intento
        setTimeout(poll, pollInterval)
      }
    }

    // Iniciar el primer intento
    poll()
  }

>>>>>>> 3870742a9a7e94a94118d2e6cf41f9a770310339
  useEffect(() => {
    // Verificar si el usuario está autorizado
    const userType = localStorage.getItem("userType")
    if (!userType) {
      router.push("/")
      return
    }

    // Obtener el nombre de la tienda seleccionada
    const selectedStoreName = localStorage.getItem("selectedStoreName")
    if (selectedStoreName) {
      setStoreName(selectedStoreName)
    }

    // Cargar productos
<<<<<<< HEAD
    loadProducts()
  }, [storeId, router])
=======
    fetchProductsWithRetry()

    // Limpiar al desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [storeId, router, retryCount])
>>>>>>> 3870742a9a7e94a94118d2e6cf41f9a770310339

  // Cargar productos desde localStorage o usar datos de ejemplo
  const loadProducts = () => {
    setIsLoading(true)

    // Intentar cargar productos del localStorage
    const storedProducts = localStorage.getItem(`store_${storeId}_products`)

    let productsToUse: Producto[]

    if (storedProducts) {
      productsToUse = JSON.parse(storedProducts)
    } else {
      // Si no hay datos en localStorage, usar los datos de ejemplo
      productsToUse = sampleProductos.map((p) => ({ ...p, tienda: Number(storeId) }))
      // Guardar en localStorage para futuras visitas
      localStorage.setItem(`store_${storeId}_products`, JSON.stringify(productsToUse))
    }

    setProductos(productsToUse)
    setFilteredProductos(productsToUse)

    // Extraer categorías únicas
    const uniqueCategories = Array.from(new Set(productsToUse.map((producto) => producto.categoria)))
    setCategories(["Todos", ...uniqueCategories])

    setNextId(Math.max(...productsToUse.map((p) => p.id)) + 1)
    setIsLoading(false)
  }

  // Filtrar productos cuando cambia el término de búsqueda o filtros
  useEffect(() => {
    let filtered = [...productos]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
<<<<<<< HEAD
        (producto) =>
          producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
=======
        (producto: Producto) =>
          producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          producto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
>>>>>>> 3870742a9a7e94a94118d2e6cf41f9a770310339
          producto.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrar por disponibilidad
    if (showOnlyAvailable) {
<<<<<<< HEAD
      filtered = filtered.filter((producto) => producto.disponible)
=======
      filtered = filtered.filter((producto: Producto) => producto.disponible)
>>>>>>> 3870742a9a7e94a94118d2e6cf41f9a770310339
    }

    // Filtrar por categoría
    if (activeCategory !== "Todos") {
<<<<<<< HEAD
      filtered = filtered.filter((producto) => producto.categoria === activeCategory)
=======
      filtered = filtered.filter((producto: Producto) => producto.categoria === activeCategory)
>>>>>>> 3870742a9a7e94a94118d2e6cf41f9a770310339
    }

    setFilteredProductos(filtered)
  }, [searchTerm, showOnlyAvailable, activeCategory, productos])

  const toggleAvailableFilter = () => {
    setShowOnlyAvailable(!showOnlyAvailable)
  }

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(price)
<<<<<<< HEAD
=======
  }

  // Función para reintentar con incremento del contador
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
>>>>>>> 3870742a9a7e94a94118d2e6cf41f9a770310339
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background-light">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-text-primary">Cargando productos...</p>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top">
      <div className="bg-white p-4 flex items-center">
        <Link href={`/home`} className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Productos de {storeName}</h1>
      </div>

      {useFallbackData && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 m-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-700">
                Mostrando datos de ejemplo. Los productos reales no pudieron ser cargados.
              </p>
              <div className="flex space-x-2 mt-2">
                <Button
                  onClick={handleRetry}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reintentar
                </Button>
                <Button
                  onClick={startPolling}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm"
                  size="sm"
                  disabled={isPolling}
                >
                  {isPolling ? "Intentando..." : "Intentar con polling"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && !useFallbackData && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <p className="text-sm text-red-700">{error}</p>
              <Button onClick={handleRetry} className="mt-2 bg-red-500 hover:bg-red-600 text-white text-sm" size="sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Información de depuración */}
      {debugInfo && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 m-4 overflow-auto max-h-40">
          <p className="text-xs font-mono text-blue-700 whitespace-pre-wrap">{debugInfo}</p>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center mb-4 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
            <Input
              placeholder="Buscar productos..."
              className="pl-10 bg-input-bg border-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="bg-white">
                <Filter className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Filtrar productos</DialogTitle>
                <DialogDescription>Selecciona las opciones para filtrar los productos</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={showOnlyAvailable}
                    onChange={toggleAvailableFilter}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="available" className="text-sm font-medium text-text-primary">
                    Mostrar solo productos disponibles
                  </label>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Link href={`/stores/${storeId}/products/add`}>
            <Button variant="default" size="icon" className="bg-primary hover:bg-primary-dark">
              <Plus className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {categories.length > 1 && (
          <Tabs defaultValue="Todos" className="mb-4">
            <TabsList className="bg-white overflow-x-auto flex w-full justify-start p-0 h-auto">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 ${activeCategory === category ? "bg-primary text-white" : "bg-white text-text-primary"} rounded-full text-sm`}
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProductos.map((producto) => (
            <Link key={producto.id} href={`/stores/${storeId}/products/edit/${producto.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="bg-gray-100 h-40 flex items-center justify-center">
                    <div className="text-4xl text-gray-400">📦</div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">{producto.nombre}</h3>
                      <Badge
                        variant={producto.disponible ? "default" : "secondary"}
                        className={producto.disponible ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {producto.disponible ? "Disponible" : "Agotado"}
                      </Badge>
                    </div>
                    <p className="text-text-secondary text-sm line-clamp-2 mb-2">
                      {producto.descripcion || "Sin descripción"}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary">{formatPrice(producto.precio)}</span>
                      <span className="text-sm text-text-secondary">Stock: {producto.cantidad}</span>
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline" className="bg-gray-100 text-text-secondary">
                        {producto.categoria}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredProductos.length === 0 && (
          <div className="text-center py-10">
            <p className="text-text-secondary">No se encontraron productos</p>
            <Link href={`/stores/${storeId}/products/add`}>
              <Button className="mt-4 bg-primary hover:bg-primary-dark">Añadir producto</Button>
            </Link>
          </div>
<<<<<<< HEAD
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProductos.map((producto) => (
              <Link key={producto.id} href={`/stores/${storeId}/products/edit/${producto.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="bg-gray-100 h-40 flex items-center justify-center">
                      <div className="text-4xl text-gray-400">📦</div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1">{producto.nombre}</h3>
                        <Badge
                          variant={producto.disponible ? "default" : "secondary"}
                          className={producto.disponible ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {producto.disponible ? "Disponible" : "Agotado"}
                        </Badge>
                      </div>
                      <p className="text-text-secondary text-sm line-clamp-2 mb-2">
                        {producto.descripcion || "Sin descripción"}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-primary">{formatPrice(producto.precio)}</span>
                        <span className="text-sm text-text-secondary">Stock: {producto.cantidad}</span>
                      </div>
                      <div className="mt-2">
                        <Badge variant="outline" className="bg-gray-100 text-text-secondary">
                          {producto.categoria}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
=======
>>>>>>> 3870742a9a7e94a94118d2e6cf41f9a770310339
        )}
      </div>
    </main>
  )
}

