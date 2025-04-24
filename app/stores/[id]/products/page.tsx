"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Filter, Plus, Search, Barcode } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
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
import { useToast } from "@/hooks/use-toast"
import { getProductsByStore } from "@/services/product-service" // Importar el servicio de productos

interface Producto {
  id: number
  nombre: string
  descripcion: string
  precio: number
  cantidad: number
  categoria: string
  disponible: boolean
  tienda: number
  codigo_barras?: string
  imagen?: string
  tienda_id?: number
}

export default function ProductsPage() {
  const params = useParams()
  const router = useRouter()
  const storeId = params.id as string
  const { toast } = useToast()

  const [productos, setProductos] = useState<Producto[]>([])
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
  const [activeCategory, setActiveCategory] = useState("Todos")
  const [storeName, setStoreName] = useState<string>("")
  const [categories, setCategories] = useState<string[]>([])
  const [nextId, setNextId] = useState(1) // Para generar IDs únicos
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [scannerActive, setScannerActive] = useState(false)
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)

  // Cargar productos
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
    loadProducts()
  }, [storeId, router])

  // Limpiar el stream de video cuando se desmonta el componente
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [videoStream])

  // Cargar productos desde el backend
  const loadProducts = async () => {
    setIsLoading(true)

    try {
      // Obtener productos del backend
      const fetchedProducts = await getProductsByStore(storeId)

      // Adaptar la estructura de los productos
      const adaptedProducts = fetchedProducts.map((p) => ({
        id: p.id || 0,
        nombre: p.nombre,
        descripcion: p.descripcion || "",
        precio: p.precio,
        cantidad: p.cantidad,
        categoria: p.categoria,
        disponible: p.cantidad > 0,
        tienda: Number(p.tienda_id),
        codigo_barras: p.codigo_barras || "",
        imagen: p.imagen,
      }))

      setProductos(adaptedProducts)
      setFilteredProductos(adaptedProducts)

      // Extraer categorías únicas
      const uniqueCategories = Array.from(new Set(adaptedProducts.map((producto) => producto.categoria)))
      setCategories(["Todos", ...uniqueCategories])

      // Encontrar el ID más alto para nuevos productos
      if (adaptedProducts.length > 0) {
        setNextId(Math.max(...adaptedProducts.map((p) => p.id)) + 1)
      }
    } catch (error) {
      console.error("Error al cargar productos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos del servidor. Usando datos en caché si están disponibles.",
        variant: "destructive",
      })

      // Fallback a localStorage si el endpoint falla
      const storedProducts = localStorage.getItem(`store_${storeId}_products`)
      if (storedProducts) {
        const parsedProducts = JSON.parse(storedProducts)
        setProductos(parsedProducts)
        setFilteredProductos(parsedProducts)

          // Extraer categorías únicas
          const uniqueCategories = Array.from(new Set(parsedProducts.map((producto:Producto) => producto.categoria)))
          setCategories(["Todos", ...uniqueCategories])

        if (parsedProducts.length > 0) {
          setNextId(Math.max(...parsedProducts.map((p: Producto) => p.id)) + 1)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar productos cuando cambia el término de búsqueda o filtros
  useEffect(() => {
    let filtered = [...productos]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          producto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (producto.codigo_barras && producto.codigo_barras.includes(searchTerm)),
      )
    }

    // Filtrar por disponibilidad
    if (showOnlyAvailable) {
      filtered = filtered.filter((producto) => producto.disponible)
    }

    // Filtrar por categoría
    if (activeCategory !== "Todos") {
      filtered = filtered.filter((producto) => producto.categoria === activeCategory)
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
  }

  // Función para iniciar el escáner de códigos de barras
  const startBarcodeScanner = async () => {
    try {
      setShowBarcodeScanner(true)
      setScannerActive(true)

      // Acceder a la cámara
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      setVideoStream(stream)

      // Obtener el elemento de video
      const videoElement = document.getElementById("barcode-scanner") as HTMLVideoElement
      if (videoElement) {
        videoElement.srcObject = stream
        videoElement.play()

        // Iniciar la detección de códigos de barras
        startBarcodeDetection(videoElement)
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error)
      toast({
        title: "Error",
        description: "No se pudo acceder a la cámara. Verifica los permisos.",
        variant: "destructive",
      })
      setShowBarcodeScanner(false)
      setScannerActive(false)
    }
  }

  // Función para detener el escáner
  const stopBarcodeScanner = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop())
      setVideoStream(null)
    }
    setShowBarcodeScanner(false)
    setScannerActive(false)
  }

  // Función para procesar la detección de códigos de barras
  const startBarcodeDetection = (videoElement: HTMLVideoElement) => {
    // Esta es una implementación simulada
    // En una implementación real, usarías una biblioteca como quagga.js o zxing

    // Simulamos la detección después de 3 segundos
    setTimeout(() => {
      if (scannerActive) {
        // Simulamos la detección de un código de barras aleatorio de los productos
        const productsWithBarcodes = productos.filter((p) => p.codigo_barras && p.codigo_barras.trim() !== "")

        if (productsWithBarcodes.length > 0) {
          const randomProduct = productsWithBarcodes[Math.floor(Math.random() * productsWithBarcodes.length)]
          handleBarcodeDetected(randomProduct.codigo_barras!)
        } else {
          // Si no hay productos con códigos de barras, simulamos uno
          handleBarcodeDetected("7707123456789")
        }
      }
    }, 3000)
  }

  // Función para manejar la detección de un código de barras
  const handleBarcodeDetected = (barcode: string) => {
    // Detener el escáner
    stopBarcodeScanner()

    // Buscar el producto por código de barras
    const foundProduct = productos.find((p) => p.codigo_barras === barcode)

    if (foundProduct) {
      // Si encontramos el producto, establecemos el término de búsqueda
      setSearchTerm(barcode)
      toast({
        title: "Código detectado",
        description: `Producto encontrado: ${foundProduct.nombre}`,
        variant: "success",
      })
    } else {
      toast({
        title: "Código detectado",
        description: `Código ${barcode} no corresponde a ningún producto`,
        variant: "destructive",
      })
    }
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
        <Link href={`/stores`} className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Productos de {storeName}</h1>
      </div>

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
          <Button variant="outline" size="icon" className="bg-white" onClick={startBarcodeScanner}>
            <Barcode className="h-5 w-5" />
          </Button>
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

        {filteredProductos.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-text-secondary mb-2">No se encontraron productos</p>
            <Link href={`/stores/${storeId}/products/add`}>
              <Button className="mt-4 bg-primary hover:bg-primary-dark">Añadir producto</Button>
            </Link>
          </div>
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
                      {producto.codigo_barras && producto.codigo_barras.trim() !== "" && (
                        <div className="mt-2 text-xs text-gray-500">Código: {producto.codigo_barras}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Modal para el escáner de códigos de barras */}
      {showBarcodeScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-2">Escanear código de barras</h3>
            <p className="text-sm text-gray-500 mb-4">Apunta la cámara al código de barras del producto</p>

            <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <video id="barcode-scanner" className="w-full h-full object-cover" playsInline muted></video>
              <div className="absolute inset-0 border-2 border-primary opacity-50 pointer-events-none"></div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={stopBarcodeScanner}>
                Cancelar
              </Button>
              <Button onClick={stopBarcodeScanner}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
