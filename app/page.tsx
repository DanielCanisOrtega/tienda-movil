import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-primary via-primary-light to-accent-pink android-safe-top">
      {/* Logo en la parte superior */}
      <div className="text-center pt-8 pb-4">
        <div className="tienda-title text-white text-3xl drop-shadow-lg">
          <div>Tienda</div>
          <div>mixta</div>
          <div>doña jose</div>
        </div>
      </div>

      {/* Formulario centrado */}
      <div className="flex-1 flex items-center justify-center p-6">
        <LoginForm />
      </div>
    </main>
  )
}
