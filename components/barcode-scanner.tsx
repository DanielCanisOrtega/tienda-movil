"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import Quagga from "@ericblade/quagga2"

// Actualizar la interfaz BarcodeScannerProps para incluir simulationMode
interface BarcodeScannerProps {
  onDetected: (barcode: string) => void
  onClose: () => void
  simulationMode?: boolean // Añadir esta propiedad como opcional
}

export default function BarcodeScanner({ onDetected, onClose, simulationMode = false }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [simulationTimer, setSimulationTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!scannerRef.current) return

    const startScanner = async () => {
      try {
        setError(null)
        setIsScanning(true)

        await Quagga.init(
          {
            inputStream: {
              name: "Live",
              type: "LiveStream",
              target: scannerRef.current || undefined,
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
              setError("No se pudo inicializar la cámara. Asegúrate de dar permisos de cámara.")
              setIsScanning(false)
              return
            }
            console.log("Escáner de código de barras inicializado")
            Quagga.start()

            // Si estamos en modo simulación, generamos un código después de un tiempo
            if (simulationMode) {
              const timer = setTimeout(
                () => {
                  simulateBarcodeDetection()
                },
                1500 + Math.random() * 1500,
              ) // Entre 1.5 y 3 segundos
              setSimulationTimer(timer)
            }
          },
        )

        // Manejar detección de código
        Quagga.onDetected((result) => {
          if (result && result.codeResult && result.codeResult.code) {
            const code = result.codeResult.code
            console.log("Código detectado:", code)

            // Detener el escáner
            Quagga.stop()

            // Llamar al callback con el código detectado
            onDetected(code)
          }
        })

        return () => {
          if (isScanning) {
            Quagga.stop()
          }
        }
      } catch (err) {
        console.error("Error al configurar el escáner:", err)
        setError("Error al configurar el escáner de código de barras.")
        setIsScanning(false)
      }
    }

    startScanner()

    return () => {
      if (isScanning) {
        Quagga.stop()
      }
      if (simulationTimer) {
        clearTimeout(simulationTimer)
      }
    }
  }, [onDetected, simulationMode])

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
    console.log("Código simulado:", randomBarcode)
    onDetected(randomBarcode)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b">
          <h3 className="text-lg font-semibold">Escanear Código de Barras</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          {error ? (
            <div className="text-center p-4">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={onClose}>Cerrar</Button>
            </div>
          ) : (
            <>
              <div ref={scannerRef} className="w-full h-64 bg-gray-100 overflow-hidden relative rounded-md"></div>
              <p className="text-sm text-gray-500 mt-3 text-center">
                {simulationMode
                  ? "Simulando escaneo de código de barras..."
                  : "Apunta la cámara al código de barras para escanear"}
              </p>
            </>
          )}
        </div>

        <div className="p-4 border-t flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}
