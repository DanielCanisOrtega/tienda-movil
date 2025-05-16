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
  const [simulationMode, setSimulationMode] = useState(true) // Modo de simulación activado por defecto
  const [simulationTimer, setSimulationTimer] = useState<NodeJS.Timeout | null>(null)

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
          console.log("Productos cargados:", fetchedProducts)
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
      if (simulationTimer) {
        clearTimeout(simulationTimer)
      }
    }
  }, [scannerInitialized, simulationTimer])

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

      // Nuevos patrones para modificar cantidades
      const updatePatterns = [
        /(cambiar|actualizar|modificar|cambia|actualiza|modifica|ajustar|ajusta)\s+(.+)\s+a\s+(\d+|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)/i,
        /(poner|pon|dejar|deja)\s+(.+)\s+en\s+(\d+|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)/i,
      ]

      // Patrón para vaciar el carrito
      const clearCartPattern = /(vaciar|limpiar|borrar|eliminar)\s+(carrito|todo|carro|productos|canasta)/i

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

      // Verificar si es un comando para vaciar el carrito
      if (clearCartPattern.test(normalizedText)) {
        if (cartItems.length === 0) {
          toast({
            title: "Carrito vacío",
            description: "El carrito ya está vacío",
            variant: "default",
          })
        } else {
          setCartItems([])
          if (storeId) {
            localStorage.removeItem(`store_${storeId}_cart`)
          }
          toast({
            title: "Carrito vaciado",
            description: "Se han eliminado todos los productos del carrito",
            variant: "success",
          })
        }
        setProcessingVoice(false)
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
        setProcessingVoice(false)
        return
      }

      match = normalizedText.match(addPatterns[1])
      if (match) {
        // Sin cantidad específica, usar 1 por defecto
        const productName = match[2].trim()
        handleAddProductCommand(productName, 1)
        setProcessingVoice(false)
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
        setProcessingVoice(false)
        return
      }

      match = normalizedText.match(removePatterns[1])
      if (match) {
        // Sin cantidad específica, eliminar todo el producto
        const productName = match[2].trim()
        handleRemoveProductCommand(productName, -1) // -1 indica eliminar todo
        setProcessingVoice(false)
        return
      }

      // Verificar si es un comando para actualizar cantidades
      match = normalizedText.match(updatePatterns[0]) || normalizedText.match(updatePatterns[1])
      if (match) {
        // Extraer nombre del producto y nueva cantidad
        const productName = match[2].trim()
        const quantityText = match[3].toLowerCase()
        const newQuantity = isNaN(Number.parseInt(quantityText))
          ? numberWords[quantityText] || 1
          : Number.parseInt(quantityText)

        handleUpdateQuantityCommand(productName, newQuantity)
        setProcessingVoice(false)
        return
      }

      // Si llegamos aquí, no se reconoció ningún comando
      toast({
        title: "Comando no reconocido",
        description: "Prueba con: 'agregar [producto]', 'quitar [producto]' o 'cambiar [producto] a [cantidad]'",
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

    setProcessingVoice(false)
  }

  // Función para singularizar palabras en español
  const singularize = (word: string): string => {
    // Reglas básicas para convertir plurales a singulares en español
    if (word.endsWith("es") && word.length > 3) {
      // Para palabras que terminan en 'es'
      if (word.endsWith("ces")) return word.slice(0, -3) + "z" // lápices -> lápiz
      if (word.endsWith("les")) return word.slice(0, -2) // papeles -> papel
      if (word.endsWith("res")) return word.slice(0, -2) // colores -> color
      if (word.endsWith("nes")) return word.slice(0, -2) // botones -> botón
      return word.slice(0, -2) // general: quitar 'es'
    } else if (word.endsWith("s") && word.length > 2) {
      return word.slice(0, -1) // general: quitar 's'
    }
    return word
  }

  // Función para normalizar y singularizar un nombre de producto
  const normalizeProductName = (productName: string): string[] => {
    const normalizedName = productName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()

    // Obtener palabras del nombre del producto y singularizarlas
    return normalizedName.split(" ").map(singularize)
  }

  // Nueva función para manejar comandos de agregar productos
  const handleAddProductCommand = (productName: string, quantity: number) => {
    console.log(`Buscando producto "${productName}" para agregar ${quantity} unidades`)

    // Buscar el producto en el inventario
    const foundProduct = findProductByName(productName)

    if (foundProduct) {
      // Verificar si hay suficiente stock
      const existingItem = cartItems.find((item) => item.product.id === foundProduct.id)
      const currentQuantity = existingItem ? existingItem.quantity : 0

      if (currentQuantity + quantity > foundProduct.cantidad) {
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
        setCartItems((prevItems) => [...prevItems, { product: foundProduct, quantity }])
      }

      toast({
        title: "Producto añadido por voz",
        description: `Se ${quantity === 1 ? "agregó" : "agregaron"} ${quantity} ${foundProduct.nombre} al carrito`,
        variant: "success",
      })
    } else {
      handleProductNotFound(productName)
    }
  }

  // Nueva función para manejar comandos de eliminar productos
  const handleRemoveProductCommand = (productName: string, quantity: number) => {
    console.log(`Buscando producto "${productName}" para eliminar ${quantity === -1 ? "todo" : quantity} unidades`)

    // Buscar el producto en el carrito usando la función mejorada
    const cartItem = findCartItemByName(productName)

    if (cartItem) {
      if (quantity === -1) {
        // Eliminar todo el producto
        removeFromCart(cartItem.product.id)
        toast({
          title: "Producto eliminado por voz",
          description: `Se eliminó ${cartItem.product.nombre} del carrito`,
          variant: "success",
        })
      } else {
        // Eliminar la cantidad especificada
        const newQuantity = Math.max(0, cartItem.quantity - quantity)
        if (newQuantity === 0) {
          removeFromCart(cartItem.product.id)
          toast({
            title: "Producto eliminado por voz",
            description: `Se eliminó ${cartItem.product.nombre} del carrito`,
            variant: "success",
          })
        } else {
          updateQuantity(cartItem.product.id, newQuantity)
          toast({
            title: "Cantidad actualizada por voz",
            description: `Se ${quantity === 1 ? "quitó" : "quitaron"} ${quantity} ${cartItem.product.nombre} del carrito`,
            variant: "success",
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

  // Nueva función para manejar comandos de actualizar cantidades
  const handleUpdateQuantityCommand = (productName: string, newQuantity: number) => {
    console.log(`Buscando producto "${productName}" para actualizar a ${newQuantity} unidades`)

    // Buscar el producto en el carrito usando la función mejorada
    const cartItem = findCartItemByName(productName)

    if (cartItem) {
      // Verificar si hay suficiente stock
      if (newQuantity > cartItem.product.cantidad) {
        toast({
          title: "Stock insuficiente",
          description: `Solo hay ${cartItem.product.cantidad} unidades de ${cartItem.product.nombre} disponibles`,
          variant: "destructive",
        })
        return
      }

      // Actualizar la cantidad
      if (newQuantity === 0) {
        removeFromCart(cartItem.product.id)
        toast({
          title: "Producto eliminado por voz",
          description: `Se eliminó ${cartItem.product.nombre} del carrito`,
          variant: "success",
        })
      } else {
        updateQuantity(cartItem.product.id, newQuantity)
        toast({
          title: "Cantidad actualizada por voz",
          description: `Se actualizó ${cartItem.product.nombre} a ${newQuantity} unidades`,
          variant: "success",
        })
      }
    } else {
      // Si el producto no está en el carrito pero existe en el inventario, agregarlo
      const foundProduct = findProductByName(productName)
      if (foundProduct) {
        if (newQuantity > foundProduct.cantidad) {
          toast({
            title: "Stock insuficiente",
            description: `Solo hay ${foundProduct.cantidad} unidades de ${foundProduct.nombre} disponibles`,
            variant: "destructive",
          })
          return
        }

        setCartItems((prevItems) => [...prevItems, { product: foundProduct, quantity: newQuantity }])
        toast({
          title: "Producto añadido por voz",
          description: `Se agregó ${newQuantity} ${foundProduct.nombre} al carrito`,
          variant: "success",
        })
      } else {
        handleProductNotFound(productName)
      }
    }
  }

  // Función auxiliar para buscar un producto en el carrito por nombre (con soporte para plurales)
  const findCartItemByName = (productName: string): CartItem | undefined => {
    const searchWords = normalizeProductName(productName)

    return cartItems.find((item) => {
      const itemWords = normalizeProductName(item.product.nombre)

      // Verificar si alguna palabra del producto buscado coincide con alguna palabra del producto en el carrito
      return searchWords.some((searchWord) =>
        itemWords.some(
          (itemWord) => searchWord === itemWord || searchWord.includes(itemWord) || itemWord.includes(searchWord),
        ),
      )
    })
  }

  // Función auxiliar para buscar un producto por nombre
  const findProductByName = (productName: string) => {
    // Normalizar y singularizar las palabras del nombre del producto buscado
    const searchWords = normalizeProductName(productName)

    console.log("Buscando producto con palabras singularizadas:", searchWords)

    // Primero intentamos una coincidencia exacta
    let foundProduct = filteredProducts.find((product) => {
      const normalizedName = product.nombre
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
      return (
        normalizedName ===
        productName
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
      )
    })

    // Si no hay coincidencia exacta, buscamos coincidencias con la versión singularizada
    if (!foundProduct) {
      foundProduct = filteredProducts.find((product) => {
        const itemWords = normalizeProductName(product.nombre)

        // Verificar si alguna palabra singularizada coincide con el nombre del producto
        return searchWords.some((searchWord) =>
          itemWords.some(
            (itemWord) => searchWord === itemWord || searchWord.includes(itemWord) || itemWord.includes(searchWord),
          ),
        )
      })
    }

    // Si aún no hay coincidencia, buscamos coincidencias parciales
    if (!foundProduct) {
      foundProduct = filteredProducts.find((product) => {
        const itemWords = normalizeProductName(product.nombre)

        // Verificar coincidencias parciales con las palabras singularizadas
        return searchWords.some(
          (searchWord) => searchWord.length > 2 && itemWords.some((itemWord) => itemWord.includes(searchWord)),
        )
      })
    }

    return foundProduct
  }

  // Función auxiliar para manejar productos no encontrados
  const handleProductNotFound = (productName: string) => {
    // Buscar productos similares
    const searchWords = normalizeProductName(productName)

    const similarProducts = filteredProducts.filter((product) => {
      const itemWords = normalizeProductName(product.nombre)

      return searchWords.some(
        (searchWord) => searchWord.length > 2 && itemWords.some((itemWord) => itemWord.includes(searchWord)),
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

  // Función para iniciar el escáner de códigos de barras
  const startBarcodeScanner = () => {
    setShowBarcodeScanner(true)
    setScannerActive(true)
    setScanning(true)

    // Inicializar el escáner después de que el modal esté visible
    setTimeout(() => {
      if (simulationMode) {
        // En modo simulación, iniciamos la cámara pero generamos un código aleatorio
        initQuaggaSimulation()
      } else {
        initQuagga()
      }
    }, 100)
  }

  // Función para detener el escáner
  const stopBarcodeScanner = () => {
    if (scannerInitialized) {
      Quagga.stop()
      setScannerInitialized(false)
    }
    if (simulationTimer) {
      clearTimeout(simulationTimer)
      setSimulationTimer(null)
    }
    setShowBarcodeScanner(false)
    setScannerActive(false)
    setScanning(false)
  }

  // Inicializar Quagga en modo simulación
  const initQuaggaSimulation = () => {
    if (!scannerRef.current) return

    // Inicializar Quagga normalmente para mostrar la cámara
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
        },
        locator: {
          patchSize: "medium",
          halfSample: true,
        },
        numOfWorkers: 2,
        frequency: 10,
        decoder: {
          readers: ["ean_reader", "ean_8_reader", "code_128_reader", "code_39_reader", "upc_reader", "upc_e_reader"],
        },
        locate: true,
      },
      (err) => {
        if (err) {
          console.error("Error al inicializar Quagga:", err)
          toast({
            title: "Error",
            description: "No se pudo inicializar la cámara. Verifica los permisos.",
            variant: "destructive",
          })
          stopBarcodeScanner()
          return
        }

        setScannerInitialized(true)
        Quagga.start()

        // Programar la simulación de detección después de un tiempo aleatorio
        const timer = setTimeout(
          () => {
            simulateBarcodeDetection()
          },
          1500 + Math.random() * 1500,
        ) // Entre 1.5 y 3 segundos

        setSimulationTimer(timer)
      },
    )
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

  // Función para simular la detección de un código de barras
  const simulateBarcodeDetection = () => {
    // Generar un código de barras aleatorio de 13 dígitos (formato EAN-13)
    const generateRandomBarcode = () => {
      let barcode = ""
      // Generar los primeros 12 dígitos
      for (let i = 0; i < 12; i++) {
        barcode += Math.floor(Math.random() * 10).toString()
      }

      // Calcular el dígito de verificación (simplificado)
      let sum = 0
      for (let i = 0; i < 12; i++) {
        sum += Number.parseInt(barcode[i]) * (i % 2 === 0 ? 1 : 3)
      }
      const checkDigit = (10 - (sum % 10)) % 10

      // Añadir el dígito de verificación
      barcode += checkDigit.toString()

      return barcode
    }

    const randomBarcode = generateRandomBarcode()

    // Notificar al usuario que se detectó un código
    toast({
      title: "Código detectado",
      description: `Código: ${randomBarcode}`,
      variant: "success",
    })

    // Establecer el término de búsqueda como el código
    setSearchQuery(randomBarcode)

    // Detener el escáner después de una detección exitosa
    stopBarcodeScanner()
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
          {/* Botón de reconocimiento de voz mejorado */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-teal-500 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
            <button
              onClick={handleVoiceRecognition}
              disabled={processingVoice || isListening}
              className="relative flex items-center justify-center w-full h-20 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-70"
            >
              <div className="flex flex-col items-center">
                <Mic className={`h-8 w-8 ${isListening ? "text-red-500 animate-pulse" : "text-primary"}`} />
                <span className="mt-1 text-sm font-medium">{isListening ? "Escuchando..." : "Comandos de voz"}</span>
              </div>
            </button>
          </div>

          {/* Botón de escáner de código de barras mejorado */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
            <button
              onClick={startBarcodeScanner}
              className="relative flex items-center justify-center w-full h-20 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="flex flex-col items-center">
                <Barcode className="h-8 w-8 text-primary" />
                <span className="mt-1 text-sm font-medium">Escanear código</span>
              </div>
            </button>
          </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Escanear código de barras</h3>
              <Button variant="ghost" size="icon" onClick={stopBarcodeScanner} className="h-8 w-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            </div>

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

            <div className="flex justify-end">
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
