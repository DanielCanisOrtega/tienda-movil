"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Receipt } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Expense } from "../expenses/page"

export default function AddExpensePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<Omit<Expense, "id">>({
    description: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0], // Formato YYYY-MM-DD
    category: "",
    paymentMethod: "",
    notes: "",
  })

  const [errors, setErrors] = useState({
    description: "",
    amount: "",
    date: "",
    category: "",
    paymentMethod: "",
  })

  const categories = ["Pedidos", "Servicios", "Nómina", "Alquiler", "Impuestos", "Otros"]

  const paymentMethods = ["Efectivo", "Transferencia", "Tarjeta de Débito", "Tarjeta de Crédito", "Otro"]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number.parseFloat(value) || 0 : value,
    }))

    // Limpiar error
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      description: "",
      amount: "",
      date: "",
      category: "",
      paymentMethod: "",
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria"
      isValid = false
    }

    if (formData.amount <= 0) {
      newErrors.amount = "El monto debe ser mayor a 0"
      isValid = false
    }

    if (!formData.date) {
      newErrors.date = "La fecha es obligatoria"
      isValid = false
    }

    if (!formData.category) {
      newErrors.category = "Seleccione una categoría"
      isValid = false
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Seleccione un método de pago"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Obtener gastos existentes del localStorage
    const existingExpenses = localStorage.getItem("expenses")
    const expenses: Expense[] = existingExpenses ? JSON.parse(existingExpenses) : []

    // Crear el nuevo gasto con ID único
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      ...formData,
    }

    // Agregar el nuevo gasto a la lista
    expenses.push(newExpense)

    // Guardar en localStorage
    localStorage.setItem("expenses", JSON.stringify(expenses))
    console.log("Gasto guardado. Total de gastos:", expenses.length)

    // Simular tiempo de procesamiento
    setTimeout(() => {
      setIsSubmitting(false)
      alert("Gasto registrado con éxito")
      router.push("/expenses")
    }, 1000)
  }

  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top">
      <div className="bg-white p-4 flex items-center">
        <Link href="/expenses" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Registrar Gasto</h1>
      </div>

      <div className="container max-w-md mx-auto p-4">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base">
              Descripción
            </Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ej: Pedido de frutas, Factura de luz"
              className="bg-input-bg border-0 h-12 text-base"
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-base">
              Monto
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base">$</span>
              <Input
                id="amount"
                name="amount"
                value={formData.amount || ""}
                onChange={handleChange}
                placeholder="0.00"
                className="bg-input-bg border-0 pl-8 h-12 text-base"
                type="number"
                inputMode="decimal"
                min="0"
              />
            </div>
            {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-base">
              Fecha
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="bg-input-bg border-0 h-12 text-base"
            />
            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-base">
              Categoría
            </Label>
            <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
              <SelectTrigger className="bg-input-bg border-0 h-12 text-base">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod" className="text-base">
              Método de pago
            </Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => handleSelectChange("paymentMethod", value)}
            >
              <SelectTrigger className="bg-input-bg border-0 h-12 text-base">
                <SelectValue placeholder="Seleccionar método de pago" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paymentMethod && <p className="text-sm text-red-500">{errors.paymentMethod}</p>}
          </div>

          <div className="bg-input-bg rounded-lg p-4 flex flex-col items-center justify-center h-40">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
            <p className="text-base text-text-secondary">Añadir comprobante</p>
            <p className="text-xs text-text-secondary mt-1">(Funcionalidad no disponible en esta versión)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base">
              Notas adicionales
            </Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Información adicional sobre el gasto"
              className="bg-input-bg border-0 min-h-[100px] text-base"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-base bg-primary hover:bg-primary-dark mt-6 android-ripple"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Registrar Gasto"}
          </Button>
        </form>
      </div>
    </main>
  )
}

