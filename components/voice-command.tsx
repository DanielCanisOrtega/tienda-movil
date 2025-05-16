"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

interface VoiceCommandProps {
  className?: string
  style?: React.CSSProperties
  buttonStyle?: "floating" | "normal"
}

declare global {
  interface Window {
    webkitSpeechRecognition: any
  }
}

export function VoiceCommand({ className, style, buttonStyle = "normal" }: VoiceCommandProps) {
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const router = useRouter()

  // Inicializar el reconocimiento de voz
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      // @ts-ignore
      const recognitionInstance = new window.webkitSpeechRecognition()
      recognitionInstance.continuous = false
      recognitionInstance.lang = "es-ES"
      recognitionInstance.interimResults = false
      recognitionInstance.maxAlternatives = 1

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase()
        console.log("Comando detectado:", transcript)
        handleCommand(transcript)
      }

      recognitionInstance.onerror = (event: any) => {
        console.error("Error en reconocimiento de voz:", event.error)
        setIsListening(false)
        toast({
          title: "Error",
          description: "No se pudo reconocer el comando de voz",
          variant: "destructive",
        })
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    }

    return () => {
      if (recognition) {
        recognition.abort()
      }
    }
  }, [])

  const toggleListening = useCallback(() => {
    if (!recognition) {
      toast({
        title: "Error",
        description: "El reconocimiento de voz no está disponible en este navegador",
        variant: "destructive",
      })
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
      toast({
        title: "Escuchando",
        description: "Diga un comando...",
      })
    }
  }, [isListening, recognition])

  const handleCommand = useCallback(
    (command: string) => {
      // Normalizar el comando (quitar acentos, convertir a minúsculas)
      const normalizedCommand = command
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()

      console.log("Comando normalizado:", normalizedCommand)

      // Comandos para navegar a diferentes páginas
      if (
        normalizedCommand.includes("ir a inicio") ||
        normalizedCommand.includes("ir al inicio") ||
        normalizedCommand.includes("pagina principal") ||
        normalizedCommand.includes("página principal") ||
        normalizedCommand.includes("volver a inicio") ||
        normalizedCommand.includes("home")
      ) {
        router.push("/home")
        toast({ title: "Navegando", description: "Yendo a Inicio" })
        return
      }

      // Comandos para productos
      if (
        normalizedCommand.includes("ir a productos") ||
        normalizedCommand.includes("ver productos") ||
        normalizedCommand.includes("mostrar productos") ||
        normalizedCommand.includes("lista de productos") ||
        normalizedCommand.includes("entrar a productos")
      ) {
        router.push("/products")
        toast({ title: "Navegando", description: "Yendo a Productos" })
        return
      }

      // Comandos para ventas
      if (
        normalizedCommand.includes("ir a ventas") ||
        normalizedCommand.includes("ver ventas") ||
        normalizedCommand.includes("mostrar ventas") ||
        normalizedCommand.includes("historial de ventas") ||
        normalizedCommand.includes("entrar a ventas")
      ) {
        router.push("/sales")
        toast({ title: "Navegando", description: "Yendo a Ventas" })
        return
      }

      // Comandos para gastos
      if (
        normalizedCommand.includes("ir a gastos") ||
        normalizedCommand.includes("ver gastos") ||
        normalizedCommand.includes("mostrar gastos") ||
        normalizedCommand.includes("lista de gastos") ||
        normalizedCommand.includes("entrar a gastos")
      ) {
        router.push("/expenses")
        toast({ title: "Navegando", description: "Yendo a Gastos" })
        return
      }

      // Comandos para tiendas
      if (
        normalizedCommand.includes("ir a tiendas") ||
        normalizedCommand.includes("ver tiendas") ||
        normalizedCommand.includes("mostrar tiendas") ||
        normalizedCommand.includes("lista de tiendas") ||
        normalizedCommand.includes("entrar a tiendas")
      ) {
        router.push("/stores")
        toast({ title: "Navegando", description: "Yendo a Tiendas" })
        return
      }

      // Comandos para vendedores
      if (
        normalizedCommand.includes("ir a vendedores") ||
        normalizedCommand.includes("ver vendedores") ||
        normalizedCommand.includes("mostrar vendedores") ||
        normalizedCommand.includes("lista de vendedores") ||
        normalizedCommand.includes("entrar a vendedores")
      ) {
        router.push("/vendors")
        toast({ title: "Navegando", description: "Yendo a Vendedores" })
        return
      }

      // Comandos para cajas
      if (
        normalizedCommand.includes("ir a cajas") ||
        normalizedCommand.includes("ver cajas") ||
        normalizedCommand.includes("mostrar cajas") ||
        normalizedCommand.includes("lista de cajas") ||
        normalizedCommand.includes("entrar a cajas")
      ) {
        // Asumiendo que hay una ruta para cajas
        router.push("/vendor/caja")
        toast({ title: "Navegando", description: "Yendo a Cajas" })
        return
      }

      // Comandos para reportes o estadísticas
      if (
        normalizedCommand.includes("ir a reportes") ||
        normalizedCommand.includes("ver reportes") ||
        normalizedCommand.includes("mostrar reportes") ||
        normalizedCommand.includes("ir a estadisticas") ||
        normalizedCommand.includes("ver estadisticas") ||
        normalizedCommand.includes("mostrar estadisticas") ||
        normalizedCommand.includes("entrar a reportes") ||
        normalizedCommand.includes("entrar a estadisticas")
      ) {
        router.push("/dashboard")
        toast({ title: "Navegando", description: "Yendo a Reportes" })
        return
      }

      // Comandos para perfil
      if (
        normalizedCommand.includes("ir a perfil") ||
        normalizedCommand.includes("ver perfil") ||
        normalizedCommand.includes("mostrar perfil") ||
        normalizedCommand.includes("mi perfil") ||
        normalizedCommand.includes("entrar a perfil")
      ) {
        router.push("/profile")
        toast({ title: "Navegando", description: "Yendo a Perfil" })
        return
      }

      // Comandos para carrito
      if (
        normalizedCommand.includes("ir a carrito") ||
        normalizedCommand.includes("ver carrito") ||
        normalizedCommand.includes("mostrar carrito") ||
        normalizedCommand.includes("mi carrito") ||
        normalizedCommand.includes("entrar a carrito")
      ) {
        router.push("/cart")
        toast({ title: "Navegando", description: "Yendo a Carrito" })
        return
      }

      // Comandos para agregar producto
      if (
        normalizedCommand.includes("agregar producto") ||
        normalizedCommand.includes("nuevo producto") ||
        normalizedCommand.includes("crear producto") ||
        normalizedCommand.includes("añadir producto")
      ) {
        router.push("/add-product")
        toast({ title: "Navegando", description: "Yendo a Agregar Producto" })
        return
      }

      // Comandos para agregar gasto
      if (
        normalizedCommand.includes("agregar gasto") ||
        normalizedCommand.includes("nuevo gasto") ||
        normalizedCommand.includes("crear gasto") ||
        normalizedCommand.includes("añadir gasto")
      ) {
        router.push("/add-expense")
        toast({ title: "Navegando", description: "Yendo a Agregar Gasto" })
        return
      }

      // Comandos para agregar caja
      if (
        normalizedCommand.includes("agregar caja") ||
        normalizedCommand.includes("nueva caja") ||
        normalizedCommand.includes("crear caja") ||
        normalizedCommand.includes("añadir caja")
      ) {
        // Asumiendo que hay una ruta para agregar cajas
        router.push("/vendor/caja?action=add")
        toast({ title: "Navegando", description: "Yendo a Agregar Caja" })
        return
      }

      // Si no se reconoce ningún comando
      toast({
        title: "Comando no reconocido",
        description: `No se pudo entender: "${command}"`,
        variant: "destructive",
      })
    },
    [router],
  )

  // Estilos para el botón flotante
  const floatingButtonClass =
    buttonStyle === "floating"
      ? "fixed bottom-20 right-4 rounded-full w-14 h-14 shadow-lg flex items-center justify-center z-50"
      : ""

  // Animación de pulso cuando está escuchando
  const pulseClass = isListening ? "animate-pulse" : ""

  return (
    <Button
      variant="default"
      size="icon"
      onClick={toggleListening}
      className={`${className} ${floatingButtonClass} ${pulseClass}`}
      style={style}
    >
      {isListening ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
    </Button>
  )
}
