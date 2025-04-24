import { fetchWithAuth } from "@/services/auth-service"

// Actualizar la interfaz para que coincida con los campos del serializador
export interface Producto {
  id?: number
  nombre: string
  categoria: string
  precio: number
  cantidad: number
  codigo_barras?: string
  // Campos adicionales que usamos en el frontend pero no están en el serializador
  descripcion?: string
  disponible?: boolean
  tienda_id: number
  imagen?: string
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

// Obtener un producto específico
export async function getProducto(productoId: number, tiendaId: number): Promise<Producto> {
  try {
    console.log(`Obteniendo producto con id=${productoId} para tienda_id=${tiendaId}`)
    const response = await fetchWithAuth(
      `https://tienda-backend-p9ms.onrender.com/api/productos/${productoId}/?tienda_id=${tiendaId}`,
      {
        method: "GET",
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error ${response.status} al obtener producto:`, errorText)
      throw new Error(`Error al obtener producto: ${response.status}`)
    }

    const data = await response.json()
    console.log("Producto obtenido:", data)
    return data
  } catch (error) {
    console.error("Error en getProducto:", error)
    throw error
  }
}

// Crear un nuevo producto
export async function createProducto(producto: Producto): Promise<Producto> {
  try {
    // Asegurarse de que tienda_id sea un número
    const tiendaId = Number(producto.tienda_id)

    // Crear un objeto que solo contenga los campos que espera el serializador
    // y añadir tienda_id que es necesario para perform_create
    const productoData = {
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: producto.precio,
      cantidad: producto.cantidad,
      codigo_barras: producto.codigo_barras || "",
      tienda_id: tiendaId,
    }

    console.log(`Creando producto para tienda_id=${tiendaId}`, productoData)

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

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error ${response.status} al crear producto:`, errorText)
      throw new Error(`Error al crear producto: ${response.status}`)
    }

    const data = await response.json()
    console.log("Producto creado:", data)
    return data
  } catch (error) {
    console.error("Error en createProducto:", error)
    throw error
  }
}

// Actualizar un producto existente
export async function updateProducto(productoId: number, producto: Producto): Promise<Producto> {
  try {
    // Asegurarse de que tienda_id sea un número
    const tiendaId = Number(producto.tienda_id)

    // Crear un objeto que solo contenga los campos que espera el serializador
    // y añadir tienda_id que es necesario para la actualización
    const productoData = {
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: producto.precio,
      cantidad: producto.cantidad,
      codigo_barras: producto.codigo_barras || "",
      tienda_id: tiendaId,
    }

    console.log(`Actualizando producto con id=${productoId} para tienda_id=${tiendaId}`, productoData)

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
    return data
  } catch (error) {
    console.error("Error en updateProducto:", error)
    throw error
  }
}

// Eliminar un producto
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
        const errorData = await response.json()
        if (errorData.error && errorData.error.includes("ventas asociadas")) {
          throw new Error("No se puede eliminar un producto con ventas asociadas.")
        }
      }

      throw new Error(`Error al eliminar producto: ${response.status}`)
    }

    console.log("Producto eliminado con éxito")
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
  const endpoints = {
    getProductos: `/api/productos/?tienda_id=${storeId}`,
    createProducto: `/api/productos/?tienda_id=${storeId}`,
    getProducto: `/api/productos/1/?tienda_id=${storeId}`, // Usamos un ID fijo para la prueba
    updateProducto: `/api/productos/1/?tienda_id=${storeId}`, // Usamos un ID fijo para la prueba
  }

  const results: { [key: string]: boolean } = {}

  for (const key in endpoints) {
    const endpointKey = key as keyof typeof endpoints;
    const url = endpoints[endpointKey];
    try {
      console.log(`Testing endpoint: ${endpointKey} - ${url}`);
      const response = await fetchWithAuth(`https://tienda-backend-p9ms.onrender.com${url}`);
      results[url] = response.ok;
      console.log(`Endpoint ${endpointKey} test result: ${response.ok}`);
    } catch (error) {
      console.error(`Error testing endpoint ${endpointKey}:`, error);
      results[url] = false;
    }
  }

  localStorage.setItem("apiEndpointTests", JSON.stringify(results))
  return results
}
