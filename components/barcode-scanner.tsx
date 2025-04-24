"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import Quagga from "@ericblade/quagga2"

interface BarcodeScannerProps {
  onDetected: (code: string) => void
  onClose: () => void
  title?: string
  description?: string
}

export default function BarcodeScanner({
  onDetected,
  onClose,
  title = "Escanear código de barras",
  description = "Apunta la cámara al código de barras del producto",
}: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [scannerInitialized, setScannerInitialized] = useState(false)
  const [scanning, setScanning] = useState(false)

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
        numOfWorkers: 2,
        frequency: 10,
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
          onClose()
          return
        }

        setScannerInitialized(true)
        setScanning(true)
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

  const stopScanner = () => {
    if (scannerInitialized) {
      try {
        Quagga.offDetected()
        Quagga.offProcessed()
        Quagga.stop()
      } catch (error) {
        console.error("Error al detener Quagga:", error)
      }
    }
    setScannerInitialized(false)
    setScanning(false)
  }

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

  // Modificar la función handleBarcodeDetected para que simplemente muestre el código en la consola
  const handleBarcodeDetected = (result: any) => {
    try {
      if (!result || !result.codeResult) {
        console.log("Detección sin resultado válido")
        return
      }

      // Obtener el código detectado
      const code = result.codeResult.code

      // Mostrar el código en la consola sin importar qué sea
      console.log("CÓDIGO DETECTADO:", code)
      console.log("RESULTADO COMPLETO:", result)

      // Notificar al usuario que se detectó un código
      toast({
        title: "Código detectado",
        description: `Código: ${code}`,
        variant: "success",
      })

      // Evitar múltiples detecciones pero no detener el escáner
      setTimeout(() => {
        // Notificar al componente padre solo si hay un código
        if (code) {
          onDetected(code)
        }
      }, 1000)
    } catch (error) {
      console.error("Error en handleBarcodeDetected:", error)
      console.log("Resultado que causó el error:", result)
      toast({
        title: "Error",
        description: "Error al procesar el código de barras",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">{description}</p>

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
