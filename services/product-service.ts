import { fetchWithAuth } from "@/services/auth-service"

export interface Producto {
  id?: number
  nombre: string
  descripcion?: string
  precio: number
  cantidad: number
  categoria: string
  disponible?: boolean
  tienda_id: number
  codigo_barras?: string
  imagen?: string
}

// Obtener todos los productos de una tienda
export async function getProductos(tiendaId: number): Promise<Producto[]> {
  try {
    const response = await fetchWithAuth(
      `https://tienda-backend-p9ms.onrender.com/api/productos/?tienda_id=${tiendaId}`,
      {
        method: "GET",
      },
    )

    if (!response.ok) {
      throw new Error(`Error al obtener productos: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error en getProductos:", error)
    throw error
  }
}

// Obtener un producto específico
export async function getProducto(productoId: number, tiendaId: number): Promise<Producto> {
  try {
    // URL correcta según el ejemplo: https://tienda-backend-p9ms.onrender.com/api/productos/7/?tienda_id=3
    const response = await fetchWithAuth(
      `https://tienda-backend-p9ms.onrender.com/api/productos/${productoId}/?tienda_id=${tiendaId}`,
      {
        method: "GET",
      },
    )

    if (!response.ok) {
      throw new Error(`Error al obtener producto: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error en getProducto:", error)
    throw error
  }
}

// Crear un nuevo producto
export async function createProducto(producto: Producto): Promise<Producto> {
  try {
    // Para crear, usamos la URL sin ID de producto pero con tienda_id como query parameter
    const response = await fetchWithAuth(
      `https://tienda-backend-p9ms.onrender.com/api/productos/?tienda_id=${producto.tienda_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(producto),
      },
    )

    if (!response.ok) {
      throw new Error(`Error al crear producto: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error en createProducto:", error)
    throw error
  }
}

// Actualizar un producto existente
export async function updateProducto(productoId: number, producto: Producto): Promise<Producto> {
  try {
    // URL correcta según el ejemplo: https://tienda-backend-p9ms.onrender.com/api/productos/7/?tienda_id=3
    const response = await fetchWithAuth(
      `https://tienda-backend-p9ms.onrender.com/api/productos/${productoId}/?tienda_id=${producto.tienda_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(producto),
      },
    )

    if (!response.ok) {
      throw new Error(`Error al actualizar producto: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error en updateProducto:", error)
    throw error
  }
}

// Eliminar un producto
export async function deleteProducto(productoId: number, tiendaId: number): Promise<void> {
  try {
    // URL correcta según el ejemplo: https://tienda-backend-p9ms.onrender.com/api/productos/7/?tienda_id=3
    const response = await fetchWithAuth(
      `https://tienda-backend-p9ms.onrender.com/api/productos/${productoId}/?tienda_id=${tiendaId}`,
      {
        method: "DELETE",
      },
    )

    if (!response.ok) {
      throw new Error(`Error al eliminar producto: ${response.status}`)
    }
  } catch (error) {
    console.error("Error en deleteProducto:", error)
    throw error
  }
}

// Función para probar los endpoints de la API
export async function testApiEndpoints(storeId: number): Promise<{ [key: string]: boolean }> {
  const testResults: { [key: string]: boolean } = {}
  const apiLogs: any[] = []

  const logApiCall = (url: string, method: string, body?: any) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      url,
      method,
      body: body ? JSON.stringify(body) : null,
    }
    apiLogs.push(logEntry)
    localStorage.setItem("apiLogs", JSON.stringify(apiLogs))
  }

  try {
    // Probar obtener productos
    try {
      logApiCall(`https://tienda-backend-p9ms.onrender.com/api/productos/?tienda_id=${storeId}`, "GET")
      await getProductos(storeId)
      testResults["getProductos"] = true
    } catch (error) {
      console.error("Error al probar getProductos:", error)
      testResults["getProductos"] = false
    }

    // Probar obtener un producto específico (usando ID 1 como ejemplo)
    try {
      logApiCall(`https://tienda-backend-p9ms.onrender.com/api/productos/1/?tienda_id=${storeId}`, "GET")
      await getProducto(1, storeId)
      testResults["getProducto"] = true
    } catch (error) {
      console.error("Error al probar getProducto:", error)
      testResults["getProducto"] = false
    }
  } catch (error) {
    console.error("Error al ejecutar pruebas:", error)
  } finally {
    localStorage.setItem("apiEndpointTests", JSON.stringify(testResults))
    return testResults
  }
}
