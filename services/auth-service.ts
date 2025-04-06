export async function loginToBackend(): Promise<void> {
  try {
    const username = "admin"
    const password = "admin123"

    const response = await fetch("https://tienda-backend-p9ms.onrender.com/api/auth/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      console.error("Error de autenticación:", response.status, response.statusText)
      throw new Error("Error al autenticar con el backend")
    }

    const data = await response.json()

    if (data.access) {
      localStorage.setItem("backendToken", data.access)
      localStorage.setItem("userType", "admin")

      if (data.refresh) {
        localStorage.setItem("refreshToken", data.refresh)
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 1)
        localStorage.setItem("tokenExpiresAt", expiresAt.toISOString())
      }
    } else if (data.key) {
      localStorage.setItem("backendToken", data.key)
      localStorage.setItem("userType", "admin")
    } else {
      console.error("No se recibió token de acceso:", data)
      throw new Error("No se recibió token de acceso")
    }
  } catch (error) {
    console.error("Error en loginToBackend:", error)
    throw error
  }
}

// Función para generar un nombre aleatorio para simulación
export function generateRandomVendorName(): string {
  const firstNames = [
    "Carlos",
    "María",
    "Juan",
    "Ana",
    "Luis",
    "Laura",
    "Pedro",
    "Sofía",
    "Andrés",
    "Valentina",
    "José",
    "Camila",
    "Fernando",
    "Isabella",
    "Diego",
    "Gabriela",
  ]

  const lastNames = [
    "García",
    "Rodríguez",
    "Martínez",
    "López",
    "González",
    "Pérez",
    "Sánchez",
    "Ramírez",
    "Torres",
    "Flores",
    "Rivera",
    "Gómez",
    "Díaz",
    "Reyes",
    "Cruz",
    "Morales",
  ]

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]

  return `${firstName} ${lastName}`
}

// Función para realizar solicitudes autenticadas
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    // Obtener token de autenticación
    const token = localStorage.getItem("backendToken")

    if (!token) {
      throw new Error("No hay token de autenticación disponible")
    }

    // Configurar opciones con el token
    const authOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }

    console.log(`Realizando solicitud a ${url}`)
    const response = await fetch(url, authOptions)
    return response
  } catch (error) {
    console.error(`Error en fetchWithAuth para URL ${url}:`, error)
    throw error
  }
}

