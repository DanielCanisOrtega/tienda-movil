import { RegisterForm } from "@/components/register-form"

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col bg-primary android-safe-top">
      {/* Logo en la parte superior */}
      <div className="text-center pt-8 pb-4">
        <div className="tienda-title text-white text-3xl">
          <div>Tienda</div>
          <div>mixta</div>
          <div>doña jose</div>
        </div>
      </div>

      {/* Formulario centrado */}
      <div className="flex-1 flex items-center justify-center p-6">
        <RegisterForm/>
      </div>
    </main>
  )
}

