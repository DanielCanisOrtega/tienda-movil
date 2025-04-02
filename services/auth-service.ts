// Servicio para manejar la autenticación con el backend
export interface AuthResponse {
  refresh: string
  access: string
  user?: {
    id: string
    username: string
    email?: string
  }
}

// Función para iniciar sesión y obtener el token
export async function loginToBackend(): Promise<string | null> {
  try {
    console.log("Iniciando sesión en el backend...")
    const response = await fetch("https://tienda-backend-p9ms.onrender.com/api/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "admin",
        password: "clave_seminario",
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error de autenticación: ${response.status} - ${response.statusText}`, errorText)
      throw new Error(`Error de autenticación: ${response.status} - ${response.statusText}`)
    }

    const data: AuthResponse = await response.json()
    console.log("Autenticación exitosa, token obtenido")

    // Guardar tokens
    saveAuthTokens(data.access, data.refresh)
    return data.access
  } catch (error) {
    console.error("Error al iniciar sesión en el backend:", error)
    return null
  }
}

// Función para refrescar el token
export async function refreshToken(): Promise<string | null> {
  try {
    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) {
      console.error("No hay refresh token disponible")
      return null
    }

    console.log("Refrescando token...")
    const response = await fetch("https://tienda-backend-p9ms.onrender.com/api/token/refresh/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    })

    if (!response.ok) {
      console.error(`Error al refrescar token: ${response.status} - ${response.statusText}`)
      
      // Si falla la renovación, eliminar TODOS los tokens y forzar login
      clearAuthTokens()
      return await loginToBackend()
    }

    const data = await response.json()
    if (data.access) {
      saveAuthTokens(data.access, data.refresh)
      console.log("Token refrescado exitosamente")
      return data.access
    }

    return null
  } catch (error) {
    console.error("Error al refrescar token:", error)
    clearAuthTokens()  // Si hay un error, asegurarnos de limpiar los tokens inválidos
    return null
  }
}

// Verificar si el token ha expirado
function isTokenExpired(): boolean {
  const expiresAtStr = localStorage.getItem("tokenExpiresAt")
  if (!expiresAtStr) return true

  const expiresAt = new Date(expiresAtStr)
  const now = new Date()

  // Considerar el token expirado 5 minutos antes para evitar problemas
  const fiveMinutes = 5 * 60 * 1000
  return now.getTime() > expiresAt.getTime() - fiveMinutes
}

// Función para obtener el token almacenado o iniciar sesión si no existe
export async function getAuthToken(): Promise<string | null> {
  // Verificar si ya tenemos un token almacenado
  const storedToken = localStorage.getItem("backendToken")

  if (storedToken) {
    // Verificar si el token ha expirado
    if (isTokenExpired()) {
      console.log("Token expirado, intentando refrescar...")
      return await refreshToken()
    }
    return storedToken
  }

  // Si no hay token, iniciar sesión para obtener uno nuevo
  return await loginToBackend()
}

// Función para realizar solicitudes autenticadas
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  let token = await getAuthToken()

  if (!token) {
    console.error("No se pudo obtener un token de autenticación")
    throw new Error("No se pudo obtener un token de autenticación")
  }

  // Añadir el token a los headers
  const authOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  }

  console.log(`Realizando solicitud a ${url}`)
  let response = await fetch(url, authOptions)

  // Si recibimos un 401 o 403, intentar refrescar el token y reintentar
  if (response.status === 401 || response.status === 403) {
    console.log(`Recibido ${response.status}, intentando refrescar token y reintentar...`)

    // Forzar la obtención de un nuevo token
    localStorage.removeItem("backendToken")
    token = await loginToBackend()

    if (!token) {
      throw new Error("No se pudo renovar la autenticación")
    }

    // Reintentar con el nuevo token
    authOptions.headers = {
      ...authOptions.headers,
      Authorization: `Bearer ${token}`,
    }

    console.log("Reintentando solicitud con nuevo token...")
    response = await fetch(url, authOptions)
  }

  return response
}

// Función para guardar los tokens en localStorage
function saveAuthTokens(access: string, refresh: string) {
  localStorage.setItem("backendToken", access)
  localStorage.setItem("refreshToken", refresh)

  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 1)
  localStorage.setItem("tokenExpiresAt", expiresAt.toISOString())
}

// Función para eliminar todos los tokens en caso de error
function clearAuthTokens() {
  localStorage.removeItem("backendToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("tokenExpiresAt")
}
