"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Plus, Minus, Trash2, ShoppingCart, Scan, Mic } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { getProductsByStore } from "@/services/product-service"

// Declaraciones de tipos para SpeechRecognition
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

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition
    }
    webkitSpeechRecognition: {
      new (): SpeechRecognition
    }
  }
}

interface Product {
  id: number
  nombre: string
  precio: number
  categoria: string
  imagen?: string
  cantidad: number
  disponible: boolean
  tienda_id: number
  descripcion?: string
  codigo_barras?: string
}

interface CartItem {
  product: Product
  quantity: number
}

interface Sale {
  id: string
  items: CartItem[]
  total: number
  date: string
  storeId: string
  storeName: string
  paymentMethod: string
  customerInfo?: {
    name?: string
    phone?: string
    email?: string
  }
}

export default function CartPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [storeId, setStoreId] = useState<string | null>(null)
  const [storeName, setStoreName] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("efectivo")
  const [customerName, setCustomerName] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")

  useEffect(() => {
    const selectedStoreId = localStorage.getItem("selectedStoreId")
    const selectedStoreName = localStorage.getItem("selectedStoreName") || "Tienda"

    if (selectedStoreId) {
      setStoreId(selectedStoreId)
      setStoreName(selectedStoreName)
      loadProducts(selectedStoreId)
    }
  }, [])

  const loadProducts = async (storeId: string) => {
    try {
      const fetchedProducts = await getProductsByStore(storeId)
      // Mapear los productos para asegurar compatibilidad de tipos
      const mappedProducts: Product[] = (fetchedProducts || []).map((p) => ({
        id: p.id || 0,
        nombre: p.nombre,
        precio: p.precio,
        categoria: p.categoria,
        imagen: p.imagen,
        cantidad: p.cantidad || 0,
        disponible: (p.cantidad || 0) > 0,
        tienda_id: Number(p.tienda_id),
        descripcion: p.descripcion || "",
        codigo_barras: p.codigo_barras || "",
      }))
      setProducts(mappedProducts)
    } catch (error) {
      console.error("Error loading products:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    }
  }

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id)

    if (existingItem) {
      if (existingItem.quantity < (product.cantidad || 0)) {
        setCart(cart.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
      } else {
        toast({
          title: "Stock insuficiente",
          description: `Solo hay ${product.cantidad} unidades disponibles`,
          variant: "destructive",
        })
      }
    } else {
      if ((product.cantidad || 0) > 0) {
        setCart([...cart, { product, quantity: 1 }])
      } else {
        toast({
          title: "Producto agotado",
          description: "Este producto no tiene stock disponible",
          variant: "destructive",
        })
      }
    }
  }

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId)
      return
    }

    const product = products.find((p) => p.id === productId)
    if (product && newQuantity > (product.cantidad || 0)) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${product.cantidad} unidades disponibles`,
        variant: "destructive",
      })
      return
    }

    setCart(cart.map((item) => (item.product.id === productId ? { ...item, quantity: newQuantity } : item)))
  }

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product.id !== productId))
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.product.precio * item.quantity, 0)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const completeSale = async () => {
    if (cart.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos al carrito antes de completar la venta",
        variant: "destructive",
      })
      return
    }

    if (!storeId) {
      toast({
        title: "Error",
        description: "No se ha seleccionado una tienda",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Crear la venta con información detallada
      const sale: Sale = {
        id: `sale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        items: [...cart],
        total: calculateTotal(),
        date: new Date().toISOString(),
        storeId: storeId,
        storeName: storeName,
        paymentMethod: paymentMethod,
        customerInfo: {
          name: customerName || undefined,
        },
      }

      // Guardar la venta en localStorage
      const existingSales = JSON.parse(localStorage.getItem("sales") || "[]")
      const updatedSales = [sale, ...existingSales]
      localStorage.setItem("sales", JSON.stringify(updatedSales))

      // Actualizar el inventario (opcional - solo en localStorage para demo)
      const updatedProducts = products.map((product) => {
        const cartItem = cart.find((item) => item.product.id === product.id)
        if (cartItem) {
          return {
            ...product,
            cantidad: (product.cantidad || 0) - cartItem.quantity,
          }
        }
        return product
      })

      // Actualizar productos en localStorage si es necesario
      localStorage.setItem(`products_${storeId}`, JSON.stringify(updatedProducts))

      // Limpiar el carrito
      setCart([])
      setCustomerName("")
      setPaymentMethod("efectivo")

      toast({
        title: "¡Venta completada!",
        description: `Venta por ${formatPrice(sale.total)} registrada exitosamente`,
      })

      // Redirigir a la página de ventas
      router.push("/sales")
    } catch (error) {
      console.error("Error completing sale:", error)
      toast({
        title: "Error",
        description: "No se pudo completar la venta. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
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
    try {
      // Normalizar el texto: eliminar acentos, convertir a minúsculas
      const normalizedText = text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")

      console.log("Comando de voz normalizado:", normalizedText)

      // Patrones para diferentes comandos
      const addPatterns = [
        /(agregar|añadir|poner|quiero|dame|agrega|añade|pon)\s+(\d+|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+(.+)/i,
        /(agregar|añadir|poner|quiero|dame|agrega|añade|pon)\s+(.+)/i, // Sin cantidad específica
      ]

      // Nuevos patrones para eliminar productos
      const removePatterns = [
        /(quitar|eliminar|sacar|quita|elimina|saca|borrar|borra|remover|remueve)\s+(\d+|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+(.+)/i,
        /(quitar|eliminar|sacar|quita|elimina|saca|borrar|borra|remover|remueve)\s+(.+)/i, // Sin cantidad específica
      ]

      // Patrón para vaciar el carrito
      const clearCartPattern = /(vaciar|limpiar|borrar|eliminar)\s+(carrito|todo|carro|productos|canasta)/i

      // Patrón para finalizar la venta
      const checkoutPattern = /(finalizar|terminar|completar|procesar)\s+(venta|compra|pedido|carrito)/i

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

      // Verificar si es un comando para finalizar la venta
      if (checkoutPattern.test(normalizedText) || normalizedText.includes("pagar")) {
        completeSale()
        return
      }

      // Verificar si es un comando para vaciar el carrito
      if (clearCartPattern.test(normalizedText)) {
        if (cart.length === 0) {
          toast({
            title: "Carrito vacío",
            description: "El carrito ya está vacío",
            variant: "default",
          })
        } else {
          setCart([])
          toast({
            title: "Carrito vaciado",
            description: "Se han eliminado todos los productos del carrito",
          })
        }
        return
      }

      // Verificar si es un comando para agregar productos
      let match = normalizedText.match(addPatterns[0])
      if (match) {
        // Extraer cantidad y nombre del producto
        const quantityText = match[2].toLowerCase()
        const quantity = isNaN(Number.parseInt(quantityText))
          ? numberWords[quantityText] || 1
          : Number.parseInt(quantityText)
        const productName = match[3].trim()

        handleAddProductCommand(productName, quantity)
        return
      }

      match = normalizedText.match(addPatterns[1])
      if (match) {
        // Sin cantidad específica, usar 1 por defecto
        const productName = match[2].trim()
        handleAddProductCommand(productName, 1)
        return
      }

      // Verificar si es un comando para eliminar productos
      match = normalizedText.match(removePatterns[0])
      if (match) {
        // Extraer cantidad y nombre del producto
        const quantityText = match[2].toLowerCase()
        const quantity = isNaN(Number.parseInt(quantityText))
          ? numberWords[quantityText] || 1
          : Number.parseInt(quantityText)
        const productName = match[3].trim()

        handleRemoveProductCommand(productName, quantity)
        return
      }

      match = normalizedText.match(removePatterns[1])
      if (match) {
        // Sin cantidad específica, eliminar todo el producto
        const productName = match[2].trim()
        handleRemoveProductCommand(productName, -1) // -1 indica eliminar todo
        return
      }

      // Si llegamos aquí, no se reconoció ningún comando
      toast({
        title: "Comando no reconocido",
        description: "Prueba con: 'agregar [producto]', 'quitar [producto]' o 'finalizar venta'",
        variant: "destructive",
      })
    } catch (error) {
      console.error("Error procesando comando de voz:", error)
      toast({
        title: "Error",
        description: "Error al procesar el comando de voz",
        variant: "destructive",
      })
    }
  }

  // Función para buscar un producto por nombre
  const findProductByName = (productName: string) => {
    const normalizedSearchName = productName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

    return products.find((product) => {
      const normalizedProductName = product.nombre
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")

      return (
        normalizedProductName.includes(normalizedSearchName) || normalizedSearchName.includes(normalizedProductName)
      )
    })
  }

  // Función para buscar un producto en el carrito por nombre
  const findCartItemByName = (productName: string): CartItem | undefined => {
    const normalizedSearchName = productName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

    return cart.find((item) => {
      const normalizedProductName = item.product.nombre
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")

      return (
        normalizedProductName.includes(normalizedSearchName) || normalizedSearchName.includes(normalizedProductName)
      )
    })
  }

  // Nueva función para manejar comandos de agregar productos
  const handleAddProductCommand = (productName: string, quantity: number) => {
    console.log(`Buscando producto "${productName}" para agregar ${quantity} unidades`)

    // Buscar el producto en el inventario
    const foundProduct = findProductByName(productName)

    if (foundProduct) {
      // Verificar si hay suficiente stock
      const existingItem = cart.find((item) => item.product.id === foundProduct.id)
      const currentQuantity = existingItem ? existingItem.quantity : 0

      if (currentQuantity + quantity > (foundProduct.cantidad || 0)) {
        toast({
          title: "Stock insuficiente",
          description: `Solo hay ${foundProduct.cantidad} unidades de ${foundProduct.nombre} disponibles`,
          variant: "destructive",
        })
        return
      }

      // Agregar el producto al carrito
      if (existingItem) {
        // Si el producto ya está en el carrito, actualizar la cantidad
        updateQuantity(foundProduct.id, existingItem.quantity + quantity)
      } else {
        // Si no está en el carrito, agregarlo con la cantidad especificada
        setCart((prevItems) => [...prevItems, { product: foundProduct, quantity }])
      }

      toast({
        title: "Producto añadido por voz",
        description: `Se ${quantity === 1 ? "agregó" : "agregaron"} ${quantity} ${foundProduct.nombre} al carrito`,
      })
    } else {
      toast({
        title: "Producto no encontrado",
        description: `No se encontró "${productName}" en el inventario`,
        variant: "destructive",
      })
    }
  }

  // Nueva función para manejar comandos de eliminar productos
  const handleRemoveProductCommand = (productName: string, quantity: number) => {
    console.log(`Buscando producto "${productName}" para eliminar ${quantity === -1 ? "todo" : quantity} unidades`)

    // Buscar el producto en el carrito
    const cartItem = findCartItemByName(productName)

    if (cartItem) {
      if (quantity === -1) {
        // Eliminar todo el producto
        removeFromCart(cartItem.product.id)
        toast({
          title: "Producto eliminado por voz",
          description: `Se eliminó ${cartItem.product.nombre} del carrito`,
        })
      } else {
        // Eliminar la cantidad especificada
        const newQuantity = Math.max(0, cartItem.quantity - quantity)
        if (newQuantity === 0) {
          removeFromCart(cartItem.product.id)
          toast({
            title: "Producto eliminado por voz",
            description: `Se eliminó ${cartItem.product.nombre} del carrito`,
          })
        } else {
          updateQuantity(cartItem.product.id, newQuantity)
          toast({
            title: "Cantidad actualizada por voz",
            description: `Se ${quantity === 1 ? "quitó" : "quitaron"} ${quantity} ${cartItem.product.nombre} del carrito`,
          })
        }
      }
    } else {
      toast({
        title: "Producto no encontrado",
        description: `No se encontró "${productName}" en el carrito`,
        variant: "destructive",
      })
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.codigo_barras && product.codigo_barras.includes(searchTerm)),
  )

  return (
    <main className="flex min-h-screen flex-col bg-background android-safe-top">
      <div className="bg-white dark:bg-gray-800 p-4 flex items-center">
        <Link href="/home" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Nueva Venta</h1>
      </div>

      <div className="container max-w-md mx-auto p-4 space-y-4">
        {/* Botón de reconocimiento de voz */}
        <Card>
          <CardContent className="p-4">
            <Button
              onClick={handleVoiceRecognition}
              disabled={isListening}
              className={`w-full h-12 ${isListening ? "animate-pulse" : ""}`}
              variant={isListening ? "destructive" : "default"}
            >
              <Mic className="mr-2 h-5 w-5" />
              {isListening ? "Escuchando..." : "Comandos de Voz"}
            </Button>
            {transcript && (
              <div className="mt-2 text-sm text-center text-muted-foreground">Último comando: "{transcript}"</div>
            )}
          </CardContent>
        </Card>

        {/* Información de la venta */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Información de la Venta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Cliente (opcional)</label>
              <Input
                placeholder="Nombre del cliente"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Método de pago</label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="credito">Crédito</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Búsqueda de productos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Buscar Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" size="icon">
                <Scan className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de productos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Productos Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <div className="font-medium">{product.nombre}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatPrice(product.precio)} • Stock: {product.cantidad || 0}
                    </div>
                    {product.codigo_barras && (
                      <div className="text-xs text-gray-500">Código: {product.codigo_barras}</div>
                    )}
                  </div>
                  <Button size="sm" onClick={() => addToCart(product)} disabled={(product.cantidad || 0) === 0}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Carrito */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Carrito ({cart.length} productos)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">El carrito está vacío</div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">{item.product.nombre}</div>
                      <div className="text-sm text-muted-foreground">{formatPrice(item.product.precio)} c/u</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => removeFromCart(item.product.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botón de completar venta */}
        <Button className="w-full h-12" onClick={completeSale} disabled={cart.length === 0 || isProcessing}>
          {isProcessing ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Procesando...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Completar Venta - {formatPrice(calculateTotal())}
            </>
          )}
        </Button>
      </div>
    </main>
  )
}
