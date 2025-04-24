"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Plus, Minus, ShoppingCart, Trash2, Mic, Barcode } from "lucide-react"
import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getProductsByStore } from "@/services/product-service" // Importar el servicio de productos

interface Product {
  id: number
  nombre: string
  precio: number
  categoria: string
  imagen?: string
  cantidad: number
  disponible: boolean
  tienda: number
  descripcion: string
  codigo_barras?: string
}

interface CartItem {
  product: Product
  quantity: number
}

// Agregar estas interfaces después de las interfaces existentes
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  readonly length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  readonly length: number
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

// Extender la interfaz Window para incluir SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export default function CartPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [storeId, setStoreId] = useState<string | null>(null)

  // Estado para el reconocimiento de voz
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [processingVoice, setProcessingVoice] = useState(false)

  // Estado para el escáner de códigos de barras
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [scannerActive, setScannerActive] = useState(false)
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)

  // Cargar productos y carrito
  useEffect(() => {
    // Obtener el ID de la tienda seleccionada
    const selectedStoreId = localStorage.getItem("selectedStoreId")
    if (selectedStoreId) {
      setStoreId(selectedStoreId)

      // Cargar productos desde el endpoint
      const fetchProducts = async () => {
        try {
          const fetchedProducts = await getProductsByStore(selectedStoreId)
          // Solo mostrar productos disponibles, adaptando la estructura
          const availableProducts = fetchedProducts
            .map((p) => ({
              id: p.id || 0,
              nombre: p.nombre,
              precio: p.precio,
              categoria: p.categoria,
              imagen: p.imagen,
              cantidad: p.cantidad,
              disponible: p.cantidad > 0,
              tienda: Number(p.tienda_id),
              descripcion: p.descripcion || "",
              codigo_barras: p.codigo_barras || "",
            }))
            .filter((p) => p.cantidad > 0)
          setProducts(availableProducts)
          setFilteredProducts(availableProducts)
        } catch (error) {
          console.error("Error al cargar productos:", error)
          toast({
            title: "Error",
            description: "No se pudieron cargar los productos. Usando datos en caché si están disponibles.",
            variant: "destructive",
          })

          // Fallback a localStorage si el endpoint falla
          const storedProducts = localStorage.getItem(`store_${selectedStoreId}_products`)
          if (storedProducts) {
            const parsedProducts = JSON.parse(storedProducts)
            const availableProducts = parsedProducts.filter((p: Product) => p.disponible && p.cantidad > 0)
            setProducts(availableProducts)
            setFilteredProducts(availableProducts)
          }
        }
      }

      fetchProducts()

      // Cargar carrito si existe
      const storedCart = localStorage.getItem(`store_${selectedStoreId}_cart`)
      if (storedCart) {
        setCartItems(JSON.parse(storedCart))
      }
    } else {
      router.push("/home")
    }
  }, [router, toast])

  // Limpiar el stream de video cuando se desmonta el componente
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [videoStream])

  // Filtrar productos según la búsqueda
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(
        (product) =>
          product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.categoria.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.codigo_barras && product.codigo_barras.includes(searchQuery)),
      )
      setFilteredProducts(filtered)
    }
  }, [searchQuery, products])

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    if (storeId && cartItems.length > 0) {
      localStorage.setItem(`store_${storeId}_cart`, JSON.stringify(cartItems))
    }
  }, [cartItems, storeId])

  // Calcular el total del carrito
  const cartTotal = cartItems.reduce((total, item) => {
    return total + item.product.precio * item.quantity
  }, 0)

  // Formatear precio en pesos colombianos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Agregar producto al carrito
  const addToCart = (product: Product) => {
    // Verificar si hay suficiente stock
    const existingItem = cartItems.find((item) => item.product.id === product.id)
    const currentQuantity = existingItem ? existingItem.quantity : 0

    if (currentQuantity >= product.cantidad) {
      toast({
        title: "Stock insuficiente",
        description: `No hay suficiente stock de ${product.nombre}. Solo quedan ${product.cantidad} unidades.`,
        variant: "destructive",
      })
      return
    }

    setCartItems((prevItems) => {
      if (existingItem) {
        // Si el producto ya está en el carrito, aumentar la cantidad
        return prevItems.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      } else {
        // Si no está en el carrito, agregarlo con cantidad 1
        return [...prevItems, { product, quantity: 1 }]
      }
    })

    toast({
      title: "Producto añadido",
      description: `${product.nombre} añadido al carrito`,
      variant: "success",
    })
  }

  // Actualizar cantidad de un producto en el carrito
  const updateQuantity = (productId: number, newQuantity: number) => {
    const item = cartItems.find((item) => item.product.id === productId)

    if (item && newQuantity > item.product.cantidad) {
      toast({
        title: "Stock insuficiente",
        description: `No hay suficiente stock de ${item.product.nombre}. Solo quedan ${item.product.cantidad} unidades.`,
        variant: "destructive",
      })
      return
    }

    if (newQuantity <= 0) {
      // Si la cantidad es 0 o menos, eliminar el producto del carrito
      setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId))
    } else {
      // Actualizar la cantidad
      setCartItems((prevItems) =>
        prevItems.map((item) => (item.product.id === productId ? { ...item, quantity: newQuantity } : item)),
      )
    }
  }

  // Eliminar producto del carrito
  const removeFromCart = (productId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId))

    toast({
      title: "Producto eliminado",
      description: "Producto eliminado del carrito",
      variant: "success",
    })
  }

  // Procesar la venta
  const processCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "No hay productos en el carrito",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    // Update inventory
    if (storeId) {
      const storedProducts = localStorage.getItem(`store_${storeId}_products`)
      if (storedProducts) {
        let products = JSON.parse(storedProducts)

        // Update quantity of each product
        cartItems.forEach((item) => {
          products = products.map((p: Product) => {
            if (p.id === item.product.id) {
              const newQuantity = p.cantidad - item.quantity
              return {
                ...p,
                cantidad: newQuantity,
                disponible: newQuantity > 0,
              }
            }
            return p
          })
        })

        // Save updated products
        localStorage.setItem(`store_${storeId}_products`, JSON.stringify(products))
      }

      // Save the sale in localStorage for history
      const sale = {
        id: crypto.randomUUID(),
        items: cartItems,
        total: cartTotal,
        date: new Date().toISOString(),
        storeId,
      }

      const storedSales = localStorage.getItem("sales")
      const sales = storedSales ? JSON.parse(storedSales) : []
      sales.push(sale)
      localStorage.setItem("sales", JSON.stringify(sales))

      // Clear cart
      setCartItems([])
      localStorage.removeItem(`store_${storeId}_cart`)
    }

    setTimeout(() => {
      setIsProcessing(false)
      toast({
        title: "Venta registrada",
        description: "La venta ha sido registrada con éxito",
        variant: "success",
      })
      router.push("/sales")
    }, 1000)
  }

  // Función para manejar el reconocimiento de voz
  const handleVoiceRecognition = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "No soportado",
        description: "Tu navegador no soporta reconocimiento de voz",
        variant: "destructive",
      })
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = "es-ES"
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript("")
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.toLowerCase()
      setTranscript(transcript)
      processVoiceCommand(transcript)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Error de reconocimiento:", event.error)
      setIsListening(false)
      toast({
        title: "Error",
        description: `Error en el reconocimiento: ${event.error}`,
        variant: "destructive",
      })
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  // Función para procesar el comando de voz
  const processVoiceCommand = (text: string) => {
    setProcessingVoice(true)

    try {
      // Normalizar el texto: eliminar acentos, convertir a minúsculas
      const normalizedText = text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")

      // Patrones para diferentes comandos
      const addPatterns = [
        /(agregar|añadir|poner|quiero|dame|agrega|añade|pon)\s+(\d+|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+(.+)/i,
        /(agregar|añadir|poner|quiero|dame|agrega|añade|pon)\s+(.+)/i, // Sin cantidad específica
      ]

      // Diccionario para convertir palabras de números a dígitos
      const numberWords: Record<string, number> = {
        un: 1,
        una: 1,
        dos: 2,
        tres: 3,
        cuatro: 4,
        cinco: 5,
        seis: 6,
        siete: 7,
        ocho: 8,
        nueve: 9,
        diez: 10,
      }

      // Probar con el primer patrón (con cantidad)
      let match = normalizedText.match(addPatterns[0])
      let quantity = 1
      let productName = ""

      if (match) {
        // Extraer cantidad
        const quantityText = match[2].toLowerCase()
        quantity = isNaN(Number.parseInt(quantityText)) ? numberWords[quantityText] || 1 : Number.parseInt(quantityText)

        productName = match[3].trim()
      } else {
        // Probar con el segundo patrón (sin cantidad específica)
        match = normalizedText.match(addPatterns[1])
        if (match) {
          quantity = 1
          productName = match[2].trim()
        }
      }

      if (match && productName) {
        // Buscar el producto en el inventario
        // Primero intentamos una coincidencia exacta
        let foundProduct = filteredProducts.find(
          (product) => product.nombre.toLowerCase() === productName.toLowerCase(),
        )

        // Si no hay coincidencia exacta, buscamos coincidencias parciales
        if (!foundProduct) {
          foundProduct = filteredProducts.find((product) => {
            const normalizedProductName = product.nombre
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")

            return normalizedProductName.includes(productName) || productName.includes(normalizedProductName)
          })
        }

        if (foundProduct) {
          // Verificar si hay suficiente stock
          const existingItem = cartItems.find((item) => item.product.id === foundProduct!.id)
          const currentQuantity = existingItem ? existingItem.quantity : 0

          if (currentQuantity + quantity > foundProduct.cantidad) {
            toast({
              title: "Stock insuficiente",
              description: `Solo hay ${foundProduct.cantidad} unidades de ${foundProduct.nombre} disponibles`,
              variant: "destructive",
            })
          } else {
            // Agregar el producto al carrito con la cantidad especificada
            const existingItem = cartItems.find((item) => item.product.id === foundProduct!.id)
            if (existingItem) {
              // Si el producto ya está en el carrito, actualizar la cantidad
              updateQuantity(foundProduct.id, existingItem.quantity + quantity)
            } else {
              // Si no está en el carrito, agregarlo con la cantidad especificada
              setCartItems((prevItems) => [...prevItems, { product: foundProduct!, quantity }])
            }

            toast({
              title: "Producto añadido por voz",
              description: `Se ${quantity === 1 ? "agregó" : "agregaron"} ${quantity} ${foundProduct.nombre} al carrito`,
              variant: "success",
            })
          }
        } else {
          // Si no encontramos el producto, mostramos los productos similares
          const similarProducts = filteredProducts.filter((product) => {
            const normalizedProductName = product.nombre
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")

            // Dividir el nombre del producto en palabras y buscar coincidencias parciales
            const productWords = normalizedProductName.split(" ")
            const searchWords = productName.split(" ")

            return searchWords.some(
              (word) => word.length > 2 && productWords.some((prodWord) => prodWord.includes(word)),
            )
          })

          if (similarProducts.length > 0) {
            toast({
              title: "Producto no encontrado",
              description: `¿Quisiste decir "${similarProducts[0].nombre}"?`,
              variant: "destructive",
            })
          } else {
            toast({
              title: "Producto no encontrado",
              description: `No se encontró "${productName}" en el inventario`,
              variant: "destructive",
            })
          }
        }
      } else {
        toast({
          title: "Comando no reconocido",
          description: "Intenta decir: 'agregar [cantidad] [producto]'",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error procesando comando de voz:", error)
      toast({
        title: "Error",
        description: "Error al procesar el comando de voz",
        variant: "destructive",
      })
    }

    setProcessingVoice(false)
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
        const productsWithBarcodes = products.filter((p) => p.codigo_barras && p.codigo_barras.trim() !== "")

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
    const foundProduct = products.find((p) => p.codigo_barras === barcode)

    if (foundProduct) {
      // Si encontramos el producto, lo añadimos directamente al carrito
      addToCart(foundProduct)
      toast({
        title: "Código detectado",
        description: `Producto añadido: ${foundProduct.nombre}`,
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

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top has-bottom-nav">
      <div className="bg-white p-4 flex items-center">
        <Link href="/home" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Registrar Venta</h1>
      </div>

      <div className="container max-w-md mx-auto p-4 space-y-4">
        {/* Carrito de compras */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Carrito de Compras
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cartItems.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">No hay productos en el carrito</div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                      {item.product.imagen ? (
                        <img
                          src={item.product.imagen || "/placeholder.svg"}
                          alt={item.product.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-xl text-gray-400">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{item.product.nombre}</h3>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.product.precio)}</p>
                      {item.product.codigo_barras && item.product.codigo_barras.trim() !== "" && (
                        <p className="text-xs text-gray-500">Código: {item.product.codigo_barras}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full p-0"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full p-0"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-right w-20 font-medium">
                      {formatPrice(item.product.precio * item.quantity)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-0 text-red-500"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Separator className="my-4" />

                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>

                <Button
                  className="w-full h-12 bg-primary hover:bg-primary-dark"
                  onClick={processCheckout}
                  disabled={isProcessing || cartItems.length === 0}
                >
                  {isProcessing ? "Procesando..." : "Finalizar Venta"}
                </Button>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    className={`flex items-center gap-2 ${isListening ? "bg-red-100 text-red-600 border-red-300" : ""}`}
                    onClick={handleVoiceRecognition}
                    disabled={processingVoice}
                  >
                    <Mic className={`h-5 w-5 ${isListening ? "animate-pulse text-red-600" : ""}`} />
                    {isListening ? "Escuchando..." : "Agregar por voz"}
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2" onClick={startBarcodeScanner}>
                    <Barcode className="h-5 w-5" />
                    Escanear código
                  </Button>
                </div>

                {transcript && <div className="mt-2 text-sm text-center text-muted-foreground">"{transcript}"</div>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Buscador de productos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Agregar Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="search-products">Buscar productos</Label>
                <Input
                  id="search-products"
                  placeholder="Nombre o categoría..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-input-bg border-0"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No se encontraron productos disponibles</div>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => addToCart(product)}
                    >
                      <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                        {product.imagen ? (
                          <img
                            src={product.imagen || "/placeholder.svg"}
                            alt={product.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-xl text-gray-400">📦</div>
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="font-medium">{product.nombre}</h3>
                        <p className="text-sm text-muted-foreground">{product.categoria}</p>
                        {product.codigo_barras && product.codigo_barras.trim() !== "" && (
                          <p className="text-xs text-gray-500">Código: {product.codigo_barras}</p>
                        )}
                      </div>
                      <div className="font-medium">{formatPrice(product.precio)}</div>
                      <Button variant="ghost" size="icon" className="ml-2 h-8 w-8 p-0 text-primary">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-20 right-4 z-10">
        <Button
          size="lg"
          className={`rounded-full w-14 h-14 shadow-lg ${isListening ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary-dark"}`}
          onClick={handleVoiceRecognition}
          disabled={processingVoice}
        >
          <Mic className={`h-6 w-6 ${isListening ? "animate-pulse" : ""}`} />
        </Button>
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

      <BottomNavigation />
    </main>
  )
}
