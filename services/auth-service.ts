// Servicio para manejar la autenticación con el backend
export interface AuthResponse {
  refresh: string;
  access: string;
  user?: {
    id: string;
    username: string;
    email?: string;
  };
}
  
// Función para iniciar sesión y obtener el token
export async function loginToBackend(): Promise<string | null> {
  try {
    const response = await fetch("https://tienda-backend-p9ms.onrender.com/api/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "admin",
        password: "clave_seminario",
      }),
    });
  
    if (!response.ok) {
      throw new Error(`Error de autenticación: ${response.status} - ${response.statusText}`);
    }
  
    const data: AuthResponse = await response.json();
  
    // Guardar el token de acceso en localStorage para usarlo en futuras solicitudes
    if (data.access) {
      localStorage.setItem("backendToken", data.access);
      return data.access;
    }
  
    return null;
  } catch (error) {
    console.error("Error al iniciar sesión en el backend:", error);
    return null;
  }
}
  
// Función para obtener el token almacenado o iniciar sesión si no existe
export async function getAuthToken(): Promise<string | null> {
  // Verificar si ya tenemos un token almacenado
  const storedToken = localStorage.getItem("backendToken");
  
  if (storedToken) {
    return storedToken;
  }
  
  // Si no hay token, iniciar sesión para obtener uno nuevo
  return await loginToBackend();
}
  
// Función para realizar solicitudes autenticadas
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error("No se pudo obtener un token de autenticación");
  }
  
  // Añadir el token a los headers
  const authOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  };
  
  return fetch(url, authOptions);
}
