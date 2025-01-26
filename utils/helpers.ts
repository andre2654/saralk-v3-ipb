export function formatTimeFromSeconds(time: number): string {
  const minutes = Math.floor(time / 60)
  const seconds = time % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function isAdjacent(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): boolean {
  return (
    (x1 === x2 && Math.abs(y1 - y2) <= 1) ||
    (y1 === y2 && Math.abs(x1 - x2) <= 1) ||
    (x1 === x2 && y1 === y2)
  )
}

export function isAround(
  cx: number, // Centro do círculo (x)
  cy: number, // Centro do círculo (y)
  x: number,  // Coordenada x do ponto
  y: number,  // Coordenada y do ponto
  radius: number // Raio do círculo
): boolean {
  const distanceSquared = (cx - x) ** 2 + (cy - y) ** 2; // Distância ao quadrado
  return distanceSquared <= radius ** 2; // Verifica se está dentro do círculo
}