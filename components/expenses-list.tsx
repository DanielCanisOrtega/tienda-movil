import type { Expense } from "@/app/expenses/page"

interface ExpensesListProps {
  expenses: Expense[]
  formatPrice: (price: number) => string
}

export function ExpensesList({ expenses, formatPrice }: ExpensesListProps) {
  // Depuración
  console.log("Renderizando ExpensesList con", expenses.length, "gastos")

  if (!expenses || expenses.length === 0) {
    return <div className="text-center py-4 text-text-secondary">No hay gastos registrados en este período</div>
  }

  // Agrupar gastos por fecha
  const expensesByDate = expenses.reduce(
    (acc, expense) => {
      try {
        const dateStr = new Date(expense.date).toLocaleDateString()
        if (!acc[dateStr]) {
          acc[dateStr] = []
        }
        acc[dateStr].push(expense)
      } catch (error) {
        console.error("Error al procesar gasto:", expense, error)
      }
      return acc
    },
    {} as Record<string, Expense[]>,
  )

  return (
    <div className="space-y-6">
      {Object.entries(expensesByDate).map(([date, dateExpenses]) => (
        <div key={date} className="space-y-3">
          <h4 className="font-medium text-sm bg-background-light p-2 rounded">
            {date} - {dateExpenses.length} gastos -{" "}
            {formatPrice(dateExpenses.reduce((sum, expense) => sum + expense.amount, 0))}
          </h4>

          <div className="space-y-4">
            {dateExpenses.map((expense) => (
              <div key={expense.id} className="border-b pb-3 last:border-0">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-text-secondary">{expense.categoria}</div>
                  <div className="font-medium text-danger">{formatPrice(expense.amount)}</div>
                </div>

                <div className="space-y-1">
                  <div className="font-medium">{expense.descripcion}</div>
                  {expense.notes && <div className="text-sm text-text-secondary">{expense.notes}</div>}
                  <div className="text-xs text-text-secondary">{expense.paymentMethod}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

