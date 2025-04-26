"use client"

import { useState, useEffect, useRef } from "react"
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
import Quagga from "@ericblade/quagga2" // Importamos quagga2 que es una versión mantenida de quagga

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
  const scannerRef = useRef<HTMLDivElement>(null)

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
  const [scannerInitialized, setScannerInitialized] = useState(false)
  const [scanning, setScanning] = useState(false)

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

  // Limpiar el escáner cuando se desmonta el componente
  useEffect(() => {
    return () => {
      if (scannerInitialized) {
        Quagga.stop()
      }
    }
  }, [scannerInitialized])

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
  const startBarcodeScanner = () => {
    setShowBarcodeScanner(true)
    setScannerActive(true)
    setScanning(true)

    // Inicializar el escáner después de que el modal esté visible
    setTimeout(() => {
      initQuagga()
    }, 100)
  }

  // Función para detener el escáner
  const stopBarcodeScanner = () => {
    if (scannerInitialized) {
      Quagga.stop()
      setScannerInitialized(false)
    }
    setShowBarcodeScanner(false)
    setScannerActive(false)
    setScanning(false)
  }

  // Inicializar Quagga
  const initQuagga = () => {
    if (!scannerRef.current) return

    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            facingMode: "environment", // Usar cámara trasera
            width: { min: 450 },
            height: { min: 300 },
            aspectRatio: { min: 1, max: 2 },
          },
          area: {
            // Definir un área más pequeña para el escaneo puede mejorar la precisión
            top: "25%",
            right: "10%",
            left: "10%",
            bottom: "25%",
          },
        },
        locator: {
          patchSize: "medium",
          halfSample: true,
        },
        numOfWorkers: 2, // Reducir el número de workers para evitar problemas de rendimiento
        frequency: 10, // Reducir la frecuencia de escaneo
        decoder: {
          readers: ["ean_reader", "ean_8_reader", "code_128_reader", "code_39_reader", "upc_reader", "upc_e_reader"],
          debug: {
            drawBoundingBox: false,
            showFrequency: false,
            drawScanline: false,
            showPattern: false,
          },
        },
        locate: true,
      },
      (err) => {
        if (err) {
          console.error("Error al inicializar Quagga:", err)
          toast({
            title: "Error",
            description: "No se pudo inicializar el escáner. Verifica los permisos de la cámara.",
            variant: "destructive",
          })
          stopBarcodeScanner()
          return
        }

        setScannerInitialized(true)
        Quagga.start()

        // Añadir detector de códigos de barras con manejo de errores
        Quagga.onDetected((result) => {
          try {
            handleBarcodeDetected(result)
          } catch (error) {
            console.error("Error al procesar el código detectado:", error)
          }
        })

        // Añadir procesamiento de cada fotograma para mostrar el cuadro de detección
        Quagga.onProcessed((result) => {
          try {
            handleProcessed(result)
          } catch (error) {
            console.error("Error al procesar el fotograma:", error)
          }
        })
      },
    )
  }

  // Función para manejar el procesamiento de cada fotograma
  const handleProcessed = (result: any) => {
    try {
      const drawingCtx = Quagga.canvas.ctx.overlay
      const drawingCanvas = Quagga.canvas.dom.overlay

      if (!drawingCtx || !drawingCanvas) return

      if (result) {
        if (result.boxes) {
          drawingCtx.clearRect(
            0,
            0,
            Number.parseInt(drawingCanvas.getAttribute("width") || "0"),
            Number.parseInt(drawingCanvas.getAttribute("height") || "0"),
          )
          result.boxes
            .filter((box: any) => box !== result.box)
            .forEach((box: any) => {
              if (box) {
                try {
                  Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 })
                } catch (error) {
                  console.error("Error al dibujar caja:", error)
                }
              }
            })
        }

        if (result.box) {
          try {
            Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 })
          } catch (error) {
            console.error("Error al dibujar caja principal:", error)
          }
        }

        if (result.codeResult && result.codeResult.code) {
          try {
            Quagga.ImageDebug.drawPath(result.line, { x: "x", y: "y" }, drawingCtx, { color: "red", lineWidth: 3 })
          } catch (error) {
            console.error("Error al dibujar línea de código:", error)
          }
        }
      }
    } catch (error) {
      console.error("Error en handleProcessed:", error)
    }
  }

  // Función para manejar la detección de un código de barras
  const handleBarcodeDetected = (result: any) => {
    try {
      if (!result || !result.codeResult) {
        console.log("Detección sin resultado válido")
        return
      }

      // Obtener el código detectado
      const code = result.codeResult.code

      // Mostrar el código en la consola sin importar qué sea
      console.log("CÓDIGO DETECTADO EN CARRITO:", code)
      console.log("RESULTADO COMPLETO:", result)

      // Notificar al usuario que se detectó un código
      toast({
        title: "Código detectado",
        description: `Código: ${code}`,
        variant: "success",
      })

      // Establecer el término de búsqueda como el código
      setSearchQuery(code)

      // Detener el escáner después de una detección exitosa
      stopBarcodeScanner()
    } catch (error) {
      console.error("Error en handleBarcodeDetected:", error)
      console.log("Resultado que causó el error:", result)
      stopBarcodeScanner()
      toast({
        title: "Error",
        description: "Error al procesar el código de barras",
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

      <div className="container max-w-md mx-auto p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Button
                variant="ghost"
                className="w-full h-full flex flex-col items-center justify-center gap-2 py-6"
                onClick={handleVoiceRecognition}
                disabled={processingVoice || isListening}
                style={{ minHeight: "120px" }}
              >
                <Mic
                  className={`${isListening ? "text-red-500 animate-pulse" : "text-primary"}`}
                  style={{ width: "45px", height: "45px" }}
                />
                {isListening && <span className="text-xs text-red-500">Escuchando...</span>}
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Button
                variant="ghost"
                className="w-full h-full flex flex-col items-center justify-center gap-3 py-6"
                onClick={startBarcodeScanner}
                style={{ minHeight: "120px" }}
              >
                <Barcode className="text-primary" style={{ width: "45px", height: "45px" }} />
                <span className="text-sm font-medium">Escanear código de barras</span>
              </Button>
            </CardContent>
          </Card>
        </div>
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
                {/* Mejorar la visualización de productos en el carrito */}
                <div className="space-y-4 mt-4">
                  {cartItems.map((item, index) => (
                    <div
                      key={`${item.product.id}-${index}`}
                      className="bg-white rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <h3 className="font-medium text-base truncate max-w-[200px]">{item.product.nombre}</h3>
                          <span className="font-semibold">
                            ${(item.product.precio * item.quantity).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            <p>Precio: ${item.product.precio.toLocaleString()}</p>
                            {item.product.codigo_barras && (
                              <p className="text-xs">Código: {item.product.codigo_barras}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>

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
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  También puedes usar los botones de voz o código de barras en la parte superior
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
                      <div className="ml-3 flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-1">{product.nombre}</h3>
                        <p className="text-xs text-muted-foreground truncate">{product.categoria}</p>
                        {product.codigo_barras && product.codigo_barras.trim() !== "" && (
                          <p className="text-xs text-gray-500 truncate">Código: {product.codigo_barras}</p>
                        )}
                      </div>
                      <div className="font-medium text-sm whitespace-nowrap ml-2">{formatPrice(product.precio)}</div>
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

      {/* Modal para el escáner de códigos de barras */}
      {showBarcodeScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-2">Escanear código de barras</h3>
            <p className="text-sm text-gray-500 mb-4">Apunta la cámara al código de barras del producto</p>

            <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <div ref={scannerRef} className="w-full h-full">
                {/* Quagga insertará el video aquí */}
              </div>

              {/* Línea de escaneo animada */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="h-0.5 w-full bg-red-500 absolute top-1/2 transform -translate-y-1/2 animate-pulse"></div>
                <div className="absolute inset-0 border-2 border-primary opacity-50"></div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={stopBarcodeScanner}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </main>
  )
}
