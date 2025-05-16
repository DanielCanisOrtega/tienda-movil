"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, Camera } from "lucide-react"

export interface BarcodeScannerProps {
  onDetected: (barcode: string) => void
  onClose: () => void
  simulationMode?: boolean
}

export default function BarcodeScanner({ onDetected, onClose, simulationMode = false }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scannerRef = useRef<any>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [hasCamera, setHasCamera] = useState(true)

  useEffect(() => {
    let stream: MediaStream | null = null

    const startScanner = async () => {
      try {
        if (!simulationMode) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          })

          if (videoRef.current) {
            videoRef.current.srcObject = stream
            await videoRef.current.play()
            setIsScanning(true)
            scanCode()
          }
        } else {
          // En modo simulación, solo activamos la cámara pero no escaneamos
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          })

          if (videoRef.current) {
            videoRef.current.srcObject = stream
            await videoRef.current.play()
            setIsScanning(true)
          }
        }
      } catch (error) {
        console.error("Error accessing camera:", error)
        setHasCamera(false)
      }
    }

    startScanner()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (scannerRef.current) {
        clearTimeout(scannerRef.current)
      }
    }
  }, [simulationMode])

  const scanCode = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight
      canvas.width = video.videoWidth

      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Aquí iría la lógica real de detección de códigos de barras
      // Por ahora, simulamos una detección después de un tiempo aleatorio
      const randomDelay = Math.floor(Math.random() * 3000) + 1000 // Entre 1 y 4 segundos
      scannerRef.current = setTimeout(() => {
        // Simulamos la detección de un código de barras
        const mockBarcode = Math.floor(Math.random() * 9000000000000) + 1000000000000
        onDetected(mockBarcode.toString())
      }, randomDelay)
    } else {
      scannerRef.current = setTimeout(scanCode, 100)
    }
  }

  const handleSimulateBarcode = () => {
    if (simulationMode) {
      const mockBarcode = Math.floor(Math.random() * 9000000000000) + 1000000000000
      onDetected(mockBarcode.toString())
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Escanear Código de Barras</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center">
          {hasCamera ? (
            <>
              <div className="relative w-full max-w-sm overflow-hidden rounded-lg border">
                <video ref={videoRef} className="w-full h-auto" playsInline muted />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 border-2 border-dashed border-primary/50 pointer-events-none"></div>
              </div>
              {simulationMode && (
                <Button className="mt-4" onClick={handleSimulateBarcode}>
                  <Camera className="mr-2 h-4 w-4" />
                  Simular Lectura
                </Button>
              )}
              <p className="text-sm text-muted-foreground mt-4">
                {simulationMode
                  ? "Modo simulación: Haga clic en el botón para simular una lectura de código de barras."
                  : "Apunte la cámara al código de barras para escanear."}
              </p>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">No se pudo acceder a la cámara.</p>
              <Button onClick={onClose}>Cerrar</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
