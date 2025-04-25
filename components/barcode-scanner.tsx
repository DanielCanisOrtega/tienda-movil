"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Camera } from "lucide-react"
import Quagga from "@ericblade/quagga2"

interface BarcodeScannerProps {
  onDetected: (code: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResults, setLastResults] = useState<Array<{ code: string }>>([])
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)

  useEffect(() => {
    // Solicitar permiso de cámara
    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        stream.getTracks().forEach((track) => track.stop()) // Detener la transmisión después de obtener permiso
        setCameraPermission(true)
        initializeScanner()
      } catch (err) {
        console.error("Error al solicitar permiso de cámara:", err)
        setCameraPermission(false)
        setError("No se pudo acceder a la cámara. Por favor, verifica los permisos.")
      }
    }

    requestCameraPermission()

    return () => {
      if (isInitialized) {
        Quagga.stop()
      }
    }
  }, [])

  const initializeScanner = () => {
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
        },
        locator: {
          patchSize: "medium",
          halfSample: true,
        },
        numOfWorkers: 2,
        frequency: 10,
        decoder: {
          readers: ["ean_reader", "ean_8_reader", "code_128_reader", "code_39_reader", "upc_reader"],
        },
        locate: true,
      },
      (err) => {
        if (err) {
          console.error("Error al inicializar el escáner:", err)
          setError("No se pudo inicializar el escáner de códigos de barras.")
          return
        }

        console.log("Escáner de códigos de barras inicializado")
        setIsInitialized(true)
        Quagga.start()
      },
    )

    // Manejar resultados del escaneo
    Quagga.onDetected((result) => {
      if (result && result.codeResult) {
        const code = result.codeResult.code

        if (code) {
          console.log(`Código detectado: ${code}`)

          // Agregar el resultado a la lista de últimos resultados
          setLastResults((prev) => {
            const newResults = [...prev, { code }].slice(-5) // Mantener solo los últimos 5 resultados

            // Verificar si hay al menos 3 resultados con el mismo código
            const counts: Record<string, number> = {}

            newResults.forEach((item) => {
              if (!counts[item.code]) {
                counts[item.code] = 0
              }
              counts[item.code]++
            })

            // Buscar el código más frecuente
            let bestCode: string | null = null
            let bestCount = 0

            Object.entries(counts).forEach(([code, count]) => {
              if (count >= 3 && count > bestCount) {
                bestCode = code
                bestCount = count
              }
            })

            // Si encontramos un código confiable, notificar
            if (bestCode) {
              onDetected(bestCode)
              return [] // Limpiar resultados después de detectar
            }

            return newResults
          })
        }
      }
    })
  }

  if (cameraPermission === false) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Error de Cámara</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="text-center py-8">
            <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="mb-4">
              No se pudo acceder a la cámara. Por favor, verifica que has concedido los permisos necesarios.
            </p>
            <Button onClick={onClose} className="mt-2">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg p-4 w-full max-w-md">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Escanear Código de Barras</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative">
          <div ref={scannerRef} className="w-full h-64 bg-gray-100 rounded overflow-hidden">
            {!isInitialized && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                <p className="text-red-500">{error}</p>
              </div>
            )}
          </div>

          {/* Guía visual para el escaneo */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 opacity-70 transform -translate-y-1/2"></div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-3 text-center">Coloca el código de barras dentro del área de escaneo</p>

        <div className="mt-4 flex justify-center">
          <Button onClick={onClose} variant="outline" className="w-full">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}
