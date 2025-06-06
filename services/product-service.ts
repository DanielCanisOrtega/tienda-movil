import { fetchWithAuth } from "@/services/auth-service"

// Actualizar la interfaz para que coincida con los campos del serializador
export interface Producto {
  id?: number
  nombre: string
  categoria: string
  precio: number
  cantidad: number
  codigo_barras?: string | null
  // Campos adicionales que usamos en el frontend pero no están en el serializador
  descripcion?: string
  disponible?: boolean
  tienda_id: number
  imagen?: string
  oculto?: boolean
}

// Crear un nuevo producto - Corregido para usar fetchWithAuth
export async function createProducto(producto: Producto): Promise<Producto> {
  try {
    // Asegurarse de que tienda_id sea un número
    const tiendaId = Number(producto.tienda_id)

    // Crear un objeto que solo contenga los campos que espera el serializador
    // Asegurarse de que los campos obligatorios tengan valores válidos
    const productoData = {
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: producto.precio || 0, // Asegurar que no sea null
      cantidad: producto.cantidad || 0, // Asegurar que no sea null
      codigo_barras: producto.codigo_barras || null, // Este sí puede ser null
      tienda_id: tiendaId,
    }

    console.log(`Creando producto para tienda_id=${tiendaId}`, productoData)

    // CORREGIDO: Usar fetchWithAuth en lugar de fetch directo
    const response = await fetchWithAuth(
      `https://tienda-backend-p9ms.onrender.com/api/productos/?tienda_id=${tiendaId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productoData),
      },
    )

    // Registrar la respuesta completa para depuración
    console.log("Respuesta del servidor:", {
      status: response.status,
      statusText: response.statusText,
    })

    // Si la respuesta no es exitosa, mostrar detalles del error
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error ${response.status} al crear producto:`, errorText)

      try {
        // Intentar parsear como JSON para obtener más detalles
        const errorJson = JSON.parse(errorText)
        console.error("Detalles del error:", errorJson)
      } catch (e) {
        // Si no es JSON, usar el texto tal cual
        console.error("Respuesta de error (texto plano):", errorText)
      }

      throw new Error(`Error al crear producto: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("Producto creado:", data)
    return data
  } catch (error) {
    console.error("Error en createProducto:", error)
    throw error
  }
}

// Obtener todos los productos de una tienda
export async function getProductos(tiendaId: number): Promise<Producto[]> {
  try {
    console.log(`Obteniendo productos para tienda_id=${tiendaId}`)
    const response = await fetchWithAuth(
      `https://tienda-backend-p9ms.onrender.com/api/productos/?tienda_id=${tiendaId}`,
      {
        method: "GET",
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error ${response.status} al obtener productos:`, errorText)
      throw new Error(`Error al obtener productos: ${response.status}`)
    }

    const data = await response.json()
    console.log("Productos obtenidos:", data)
    return data
  } catch (error) {
    console.error("Error en getProductos:", error)
    throw error
  }
}

// Obtener todos los productos de una tienda
export async function getProductsByStore(tiendaId: string): Promise<Producto[]> {
  try {
    console.log(`Obteniendo productos para tienda_id=${tiendaId}`)
    const response = await fetchWithAuth(
      `https://tienda-backend-p9ms.onrender.com/api/productos/?tienda_id=${tiendaId}`,
      {
        method: "GET",
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error ${response.status} al obtener productos:`, errorText)
      throw new Error(`Error al obtener productos: ${response.status}`)
    }

    const data = await response.json()
    console.log("Productos obtenidos:", data)
    return data
  } catch (error) {
    console.error("Error en getProductos:", error)
    throw error
  }
}

// Obtener un producto específico - Mejorado con más logs
export async function getProducto(productoId: number, tiendaId: number): Promise<Producto> {
  try {
    console.log(`Obteniendo producto con id=${productoId} para tienda_id=${tiendaId}`)

    // Verificar si tenemos el producto en localStorage para fallback
    const localStorageKey = `producto_${tiendaId}_${productoId}`
    const cachedProducto = localStorage.getItem(localStorageKey)

    const response = await fetchWithAuth(
      `https://tienda-backend-p9ms.onrender.com/api/productos/${productoId}/?tienda_id=${tiendaId}`,
      {
        method: "GET",
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error ${response.status} al obtener producto:`, errorText)

      // Si hay un error pero tenemos datos en caché, usarlos como fallback
      if (cachedProducto) {
        console.log("Usando datos en caché para el producto:", cachedProducto)
        return JSON.parse(cachedProducto)
      }

      throw new Error(`Error al obtener producto: ${response.status}`)
    }

    const data = await response.json()
    console.log("Producto obtenido:", data)

    // Guardar en localStorage para uso futuro
    localStorage.setItem(localStorageKey, JSON.stringify(data))

    return data
  } catch (error) {
    console.error("Error en getProducto:", error)
    throw error
  }
}

// Actualizar un producto existente - Mejorado con más logs
export async function updateProducto(productoId: number, producto: Producto): Promise<Producto> {
  try {
    // Asegurarse de que tienda_id sea un número
    const tiendaId = Number(producto.tienda_id)

    // Crear un objeto que solo contenga los campos que espera el serializador
    const productoData = {
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: producto.precio || 0,
      cantidad: producto.cantidad || 0,
      codigo_barras: producto.codigo_barras || null,
      tienda_id: tiendaId,
      // No incluimos oculto aquí porque el backend podría no tener este campo
    }

    console.log(`Actualizando producto con id=${productoId} para tienda_id=${tiendaId}`, productoData)

    // Guardar una copia en localStorage antes de enviar la actualización
    const localStorageKey = `producto_${tiendaId}_${productoId}`
    localStorage.setItem(
      localStorageKey,
      JSON.stringify({
        ...productoData,
        id: productoId,
        oculto: producto.oculto || false, // Asegurarse de preservar el estado oculto
      }),
    )

    const response = await fetchWithAuth(
      `https://tienda-backend-p9ms.onrender.com/api/productos/${productoId}/?tienda_id=${tiendaId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productoData),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error ${response.status} al actualizar producto:`, errorText)
      throw new Error(`Error al actualizar producto: ${response.status}`)
    }

    const data = await response.json()
    console.log("Producto actualizado:", data)

    // Asegurarse de que el campo oculto se preserve en los datos devueltos
    return { ...data, oculto: producto.oculto || false }
  } catch (error) {
    console.error("Error en updateProducto:", error)
    throw error
  }
}

// Eliminar un producto - Mejorado con más logs
export async function deleteProducto(productoId: number, tiendaId: number): Promise<void> {
  try {
    console.log(`Eliminando producto con id=${productoId} para tienda_id=${tiendaId}`)

    const response = await fetchWithAuth(
      `https://tienda-backend-p9ms.onrender.com/api/productos/${productoId}/?tienda_id=${tiendaId}`,
      {
        method: "DELETE",
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error ${response.status} al eliminar producto:`, errorText)

      // Si el error es 400, podría ser porque el producto tiene ventas asociadas
      if (response.status === 400) {
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.error && errorData.error.includes("ventas asociadas")) {
            throw new Error("No se puede eliminar un producto con ventas asociadas.")
          }
        } catch (e) {
          // Si no se puede parsear como JSON, usar el mensaje genérico
        }
      }

      throw new Error(`Error al eliminar producto: ${response.status}`)
    }

    console.log("Producto eliminado con éxito")

    // Eliminar del localStorage si existe
    const localStorageKey = `producto_${tiendaId}_${productoId}`
    localStorage.removeItem(localStorageKey)
  } catch (error) {
    console.error("Error en deleteProducto:", error)
    throw error
  }
}

// Actualizar la cantidad de un producto
export async function actualizarCantidadProducto(
  productoId: number,
  tiendaId: number,
  nuevaCantidad: number,
): Promise<void> {
  try {
    console.log(`Actualizando cantidad del producto con id=${productoId} para tienda_id=${tiendaId} a ${nuevaCantidad}`)

    const response = await fetchWithAuth(
      `https://tienda-backend-p9ms.onrender.com/api/productos/${productoId}/actualizar-cantidad/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tienda_id: tiendaId,
          cantidad: nuevaCantidad,
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error ${response.status} al actualizar cantidad:`, errorText)
      throw new Error(`Error al actualizar cantidad: ${response.status}`)
    }

    console.log("Cantidad actualizada con éxito")

    // Actualizar en localStorage si existe
    const localStorageKey = `producto_${tiendaId}_${productoId}`
    const cachedProducto = localStorage.getItem(localStorageKey)
    if (cachedProducto) {
      const producto = JSON.parse(cachedProducto)
      producto.cantidad = nuevaCantidad
      localStorage.setItem(localStorageKey, JSON.stringify(producto))
    }
  } catch (error) {
    console.error("Error en actualizarCantidadProducto:", error)
    throw error
  }
}

// Obtener productos disponibles (con cantidad > 0)
export async function getProductosDisponibles(tiendaId: number): Promise<Producto[]> {
  try {
    console.log(`Obteniendo productos disponibles para tienda_id=${tiendaId}`)

    const response = await fetchWithAuth(
      `https://tienda-backend-p9ms.onrender.com/api/productos/disponibles/?tienda_id=${tiendaId}`,
      {
        method: "GET",
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error ${response.status} al obtener productos disponibles:`, errorText)
      throw new Error(`Error al obtener productos disponibles: ${response.status}`)
    }

    const data = await response.json()
    console.log("Productos disponibles:", data)
    return data
  } catch (error) {
    console.error("Error en getProductosDisponibles:", error)
    throw error
  }
}

export async function testApiEndpoints(storeId: number): Promise<{ [key: string]: boolean }> {
  const endpoints: { [key: string]: string } = {
    getProductos: `/api/productos/?tienda_id=${storeId}`,
    createProducto: `/api/productos/?tienda_id=${storeId}`,
    getProducto: `/api/productos/1/?tienda_id=${storeId}`, // Usamos un ID fijo para la prueba
    updateProducto: `/api/productos/1/?tienda_id=${storeId}`, // Usamos un ID fijo para la prueba
  }

  const results: { [key: string]: boolean } = {}

  for (const key in endpoints) {
    const endpointUrl = endpoints[key]
    try {
      console.log(`Testing endpoint: ${key} - ${endpointUrl}`)
      const response = await fetchWithAuth(`https://tienda-backend-p9ms.onrender.com${endpointUrl}`)
      results[key] = response.ok
      console.log(`Endpoint ${key} test result: ${response.ok}`)
    } catch (error) {
      console.error(`Error testing endpoint ${key}:`, error)
      results[key] = false
    }
  }

  localStorage.setItem("apiEndpointTests", JSON.stringify(results))
  return results
}
