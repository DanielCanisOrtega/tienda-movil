"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Interfaces para el reconocimiento de voz
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

interface Command {
  command: string[]
  action: () => void
  feedback: string
}

interface VoiceCommandProps {
  commands: Command[]
  buttonStyle?: "default" | "round"
  size?: "default" | "sm" | "lg"
  className?: string
}

export function VoiceCommand({
  commands,
  buttonStyle = "default",
  size = "default",
  className = "",
}: VoiceCommandProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const recognitionRef = useRef<any>(null)

  // Inicializar el reconocimiento de voz
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      console.error("El reconocimiento de voz no está soportado en este navegador")
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.lang = "es-ES"
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = false

    recognitionRef.current.onstart = () => {
      setIsListening(true)
      setTranscript("")
    }

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.toLowerCase()
      setTranscript(transcript)
      processCommand(transcript)
    }

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Error de reconocimiento:", event.error)
      setIsListening(false)
      toast({
        title: "Error",
        description: `Error en el reconocimiento: ${event.error}`,
        variant: "destructive",
      })
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  // Procesar el comando de voz
  const processCommand = (text: string) => {
    // Normalizar el texto: eliminar acentos, convertir a minúsculas
    const normalizedText = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

    console.log("Comando de voz recibido:", normalizedText)

    // Buscar un comando que coincida
    for (const cmd of commands) {
      if (cmd.command.some((c) => normalizedText.includes(c))) {
        console.log("Comando reconocido:", cmd.feedback)
        toast({
          title: "Comando reconocido",
          description: cmd.feedback,
        })
        cmd.action()
        return
      }
    }

    // Si no se encontró ningún comando
    toast({
      title: "Comando no reconocido",
      description: "Intenta con otro comando",
      variant: "destructive",
    })
  }

  // Iniciar el reconocimiento de voz
  const startListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "No soportado",
        description: "Tu navegador no soporta reconocimiento de voz",
        variant: "destructive",
      })
      return
    }

    if (isListening) return

    try {
      recognitionRef.current.start()
    } catch (error) {
      console.error("Error al iniciar el reconocimiento:", error)
      toast({
        title: "Error",
        description: "No se pudo iniciar el reconocimiento de voz",
        variant: "destructive",
      })
    }
  }

  // Determinar las clases del botón según el estilo y tamaño
  let buttonClasses = className || ""
  let buttonSize = {}

  if (buttonStyle === "round") {
    buttonClasses += " rounded-full"
  }

  if (size === "sm") {
    buttonSize = { width: "36px", height: "36px" }
  } else if (size === "lg") {
    buttonSize = { width: "48px", height: "48px" }
  } else {
    buttonSize = { width: "40px", height: "40px" }
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={startListening}
        disabled={isListening}
        className={`${buttonClasses} ${isListening ? "animate-pulse" : ""}`}
        style={buttonSize}
      >
        <Mic className={`h-5 w-5 ${isListening ? "text-red-500" : ""}`} />
        <span className="sr-only">Comandos de voz</span>
      </Button>
      {transcript && (
        <div className="absolute bottom-full mb-2 right-0 bg-background p-2 rounded-md shadow-md text-xs max-w-[200px] truncate">
          "{transcript}"
        </div>
      )}
    </div>
  )
}
