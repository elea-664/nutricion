// Fondo en degradado pastel para el "tile" de foto de cada producto,
// asignado de forma estable por categoría (misma categoría → mismo color).

const TILE_GRADIENTS = [
  "from-blue-50 to-blue-100",
  "from-violet-50 to-violet-100",
  "from-emerald-50 to-emerald-100",
  "from-amber-50 to-amber-100",
  "from-rose-50 to-rose-100",
  "from-cyan-50 to-cyan-100",
  "from-lime-50 to-lime-100",
  "from-fuchsia-50 to-fuchsia-100",
];

export function tileGradientForCategory(category: string): string {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % TILE_GRADIENTS.length;
  return TILE_GRADIENTS[index];
}
