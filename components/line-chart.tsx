"use client"

import { useEffect, useRef } from "react"

interface LineChartProps {
  data: { name: string; value: number }[]
}

export function LineChart({ data }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Configuración
    const padding = { top: 20, right: 20, bottom: 40, left: 40 }
    const chartWidth = canvas.width - padding.left - padding.right
    const chartHeight = canvas.height - padding.top - padding.bottom

    // Encontrar el valor máximo para escalar
    const maxValue = Math.max(...data.map((item) => item.value), 1)

    // Dibujar ejes
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, canvas.height - padding.bottom)
    ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom)
    ctx.strokeStyle = "#ccc"
    ctx.stroke()

    // Dibujar línea
    ctx.beginPath()
    data.forEach((item, index) => {
      const x = padding.left + index * (chartWidth / (data.length - 1 || 1))
      const y = canvas.height - padding.bottom - (item.value / maxValue) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      // Dibujar punto
      ctx.fillStyle = "#29d890"
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()

      // Dibujar etiqueta
      ctx.fillStyle = "#798184"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(item.name, x, canvas.height - padding.bottom + 15)

      // Dibujar valor
      ctx.fillStyle = "#0e0e0e"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(item.value.toString(), x, y - 10)
    })

    ctx.strokeStyle = "#29d890"
    ctx.lineWidth = 2
    ctx.stroke()

    // Dibujar área bajo la línea
    ctx.lineTo(padding.left + chartWidth, canvas.height - padding.bottom)
    ctx.lineTo(padding.left, canvas.height - padding.bottom)
    ctx.closePath()
    ctx.fillStyle = "rgba(41, 216, 144, 0.1)"
    ctx.fill()
  }, [data])

  return <canvas ref={canvasRef} width={400} height={200} className="w-full h-full" />
}