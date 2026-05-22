const R = 6371000 // 지구 반지름 (m)

/** 두 좌표 사이의 거리(m)를 반환 */
export function haversine(lat1, lng1, lat2, lng2) {
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return Math.round(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

/** POI 목록 중 가장 가까운 항목과 거리를 반환 */
export function nearestPoi(lat, lng, poiList) {
  if (!poiList || poiList.length === 0) return null
  return poiList.reduce(
    (best, p) => {
      const d = haversine(lat, lng, p.lat, p.lng)
      return d < best.dist ? { poi: p, dist: d } : best
    },
    { poi: null, dist: Infinity }
  )
}
