// Función para iniciar sesión en el backend
export async function loginToBackend(username?: string, password?: string): Promise<string | null> {
  try {
    // Si no se proporcionan credenciales, verificar si tenemos un token válido
    if (!username || !password) {
      const existingToken = localStorage.getItem("backendToken")
      const tokenExpiresAt = localStorage.getItem("tokenExpiresAt")

      if (existingToken && tokenExpiresAt) {
        const expiresAt = new Date(tokenExpiresAt)
        if (expiresAt > new Date()) {
          console.log("Usando token existente")
          return existingToken
        }
      }

      // Si no hay credenciales y el token expiró, no podemos hacer nada
      console.error("No se proporcionaron credenciales y no hay token válido")
      return null
    }

    console.log("Iniciando sesión con credenciales proporcionadas:", username)

    // Usar el nuevo endpoint de token
    const response = await fetch("https://tienda-backend-p9ms.onrender.com/api/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    })

    if (!response.ok) {
      console.error(`Error al iniciar sesión: ${response.status}`)
      return null
    }

    const data = await response.json()
    console.log("Respuesta de login:", data)

    // Guardar tokens en localStorage
    if (data.access) {
      localStorage.setItem("backendToken", data.access)

      if (data.refresh) {
        console.log("Guardando refresh token:", data.refresh)
        localStorage.setItem("refreshToken", data.refresh)

        // Establecer expiración del token (asumiendo 1 hora)
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 1)
        localStorage.setItem("tokenExpiresAt", expiresAt.toISOString())
      } else {
        console.warn("No se recibió refresh token del servidor")
      }

      return data.access
    }

    console.warn("No se recibió token de acceso")
    return null
  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    return null
  }
}

// Actualizar la función refreshToken para usar el mismo formato de endpoint
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
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    })

    if (!response.ok) {
      console.error(`Error al refrescar token: ${response.status}`)
      // Si hay un error al refrescar, limpiar tokens
      localStorage.removeItem("backendToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("tokenExpiresAt")
      return null
    }

    const data = await response.json()
    if (data.access) {
      localStorage.setItem("backendToken", data.access)
      // Actualizar fecha de expiración
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1)
      localStorage.setItem("tokenExpiresAt", expiresAt.toISOString())
      console.log("Token refrescado exitosamente")
      return data.access
    }

    return null
  } catch (error) {
    console.error("Error al refrescar token:", error)
    return null
  }
}

// Modificar la función fetchWithAuth para manejar mejor el caso cuando no hay refresh token
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    // Obtener token de autenticación
    const token = localStorage.getItem("backendToken")

    if (!token) {
      console.log("No hay token disponible, intentando iniciar sesión automáticamente")
      // Si no hay token, intentar iniciar sesión con credenciales almacenadas
      // o redirigir al usuario a la página de login
      throw new Error("No hay token de autenticación disponible. Por favor, inicia sesión nuevamente.")
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
    let response = await fetch(url, authOptions)

    // Si recibimos un 401 o 403, el token puede haber expirado
    if (response.status === 401 || response.status === 403) {
      console.log(`Recibido ${response.status}, posible token expirado`)

      // Verificar si tenemos refresh token antes de intentar renovar
      const refreshTokenValue = localStorage.getItem("refreshToken")

      if (refreshTokenValue) {
        // Intentar renovar el token
        const newToken = await refreshToken()

        if (newToken) {
          // Reintentar con el nuevo token
          authOptions.headers = {
            ...authOptions.headers,
            Authorization: `Bearer ${newToken}`,
          }

          console.log(`Reintentando solicitud con nuevo token`)
          response = await fetch(url, authOptions)
        } else {
          // Si no se pudo renovar, limpiar tokens y notificar
          localStorage.removeItem("backendToken")
          localStorage.removeItem("refreshToken")
          localStorage.removeItem("tokenExpiresAt")
          throw new Error("La sesión ha expirado. Por favor, inicia sesión nuevamente.")
        }
      } else {
        // Si no hay refresh token, limpiar tokens y notificar
        localStorage.removeItem("backendToken")
        throw new Error("No hay refresh token disponible. Por favor, inicia sesión nuevamente.")
      }
    }

    return response
  } catch (error) {
    console.error(`Error en fetchWithAuth para URL ${url}:`, error)
    throw error
  }
}

