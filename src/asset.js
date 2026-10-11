// URL de un archivo de /public con versión de publicación (evita que el navegador muestre imágenes viejas).
export const asset = (path) => `${import.meta.env.BASE_URL}${path}?v=${__VERSION__}`;
