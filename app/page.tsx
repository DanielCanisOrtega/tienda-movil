import { LoginForm } from "@/components/login-form"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-primary android-safe-top">
      <div className="flex flex-col items-center justify-center p-6 h-full min-h-screen">
        {/* Logo centrado en la parte superior */}
        <div className="text-center mb-10">
          <div className="tienda-title text-white text-4xl">
            <div>Tienda</div>
            <div>mixta</div>
            <div>doña jose</div>
          </div>
          <div className="text-white text-sm mt-2">by José</div>
        </div>

        {/* Formulario de inicio de sesión */}
        <LoginForm />
      </div>
    </main>
  )
}

