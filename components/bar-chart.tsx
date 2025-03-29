"use client"

import { useEffect, useRef } from "react"

interface BarChartProps {
  data: { name: string; value: number }[]
}

export function BarChart({ data }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Configuración
    const padding = { top: 20, right: 20, bottom: 40, left: 60 }
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

    // Dibujar barras
    const barWidth = (chartWidth / data.length) * 0.8
    const barSpacing = (chartWidth / data.length) * 0.2

    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight
      const x = padding.left + index * (barWidth + barSpacing)
      const y = canvas.height - padding.bottom - barHeight

      // Dibujar barra
      ctx.fillStyle = "#29d890"
      ctx.fillRect(x, y, barWidth, barHeight)

      // Dibujar etiqueta
      ctx.fillStyle = "#798184"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(item.name, x + barWidth / 2, canvas.height - padding.bottom + 15)

      // Dibujar valor
      ctx.fillStyle = "#0e0e0e"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(
        new Intl.NumberFormat("es-CO", { notation: "compact", compactDisplay: "short" }).format(item.value),
        x + barWidth / 2,
        y - 5,
      )
    })
  }, [data])

  return <canvas ref={canvasRef} width={400} height={300} className="w-full h-full" />
}