"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import Quagga from "@ericblade/quagga2"

interface SimpleBarcodeProps {
  onClose: () => void
}

export default function SimpleBarcodeScanner({ onClose }: SimpleBarcodeProps) {
  const scannerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [scannerInitialized, setScannerInitialized] = useState(false)

  // Inicializar el escáner cuando el componente se monta
  useEffect(() => {
    // Pequeño retraso para asegurar que el DOM está listo
    const timer = setTimeout(() => {
      initQuagga()
    }, 100)

    return () => {
      clearTimeout(timer)
      stopScanner()
    }
  }, [])

  const initQuagga = () => {
    if (!scannerRef.current) return

    // Configuración simplificada para pruebas
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
          },
        },
        locator: {
          patchSize: "medium",
          halfSample: true,
        },
        numOfWorkers: 1, // Reducir a 1 para evitar problemas
        frequency: 5, // Reducir la frecuencia de escaneo
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
            description: "No se pudo inicializar el escáner. Verifica los permisos de la cámara.",
            variant: "destructive",
          })
          onClose()
          return
        }

        console.log("Quagga inicializado correctamente")
        setScannerInitialized(true)
        Quagga.start()

        // Añadir detector de códigos de barras con manejo de errores
        Quagga.onDetected((result) => {
          try {
            console.log("Resultado de detección:", result)

            if (result && result.codeResult && result.codeResult.code) {
              const code = result.codeResult.code
              console.log("CÓDIGO DETECTADO:", code)

              toast({
                title: "Código detectado",
                description: `Código: ${code}`,
                variant: "success",
              })
            } else {
              console.log("Detección sin código válido")
            }
          } catch (error) {
            console.error("Error al procesar el código detectado:", error)
          }
        })
      },
    )
  }

  const stopScanner = () => {
    if (scannerInitialized) {
      try {
        Quagga.offDetected()
        Quagga.stop()
        console.log("Quagga detenido correctamente")
      } catch (error) {
        console.error("Error al detener Quagga:", error)
      }
    }
    setScannerInitialized(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-2">Prueba de escáner</h3>
        <p className="text-sm text-gray-500 mb-4">Apunta la cámara a cualquier código de barras</p>

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
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  )
}
