import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { haversine } from '../utils/distance'
import styles from './MapView.module.css'

function makeIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;
      background:${color};
      border:3px solid #5d4037;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 34],
    popupAnchor: [0, -34],
  })
}

function makeClusterIcon(count) {
  const size = count > 9 ? 48 : 40
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:rgba(249,168,37,0.55);
      border:2.5px solid #f9a825;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-weight:700;font-size:14px;color:#3e2723;
      box-shadow:0 2px 10px rgba(0,0,0,0.2);
      cursor:pointer;
    ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  })
}

const activeIcon  = makeIcon('#ffeb3b')
const defaultIcon = makeIcon('#fff9c4')

function makePoiMarkerIcon(emoji) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:32px;height:32px;
      background:#1a237e;
      border:2.5px solid #fff;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:14px;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
    ">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

function buildClusters(listings, radiusM = 20) {
  const assigned = new Set()
  const result = []
  for (const item of listings) {
    if (assigned.has(item.id)) continue
    const group = [item]
    assigned.add(item.id)
    for (const other of listings) {
      if (assigned.has(other.id)) continue
      if (haversine(item.lat, item.lng, other.lat, other.lng) <= radiusM) {
        group.push(other)
        assigned.add(other.id)
      }
    }
    result.push(group)
  }
  return result
}

export default function MapView({ listings, activeId, onMarkerClick, onOpenDetail, mapVisible, poiMarkers }) {
  const mapRef     = useRef(null)
  const mapObj     = useRef(null)
  const singleMap  = useRef({})
  const clusterMap = useRef({})
  const allLayers  = useRef([])
  const poiLayers  = useRef([])
  const [expandedClusters, setExpandedClusters] = useState(new Set())

  const collapse = () =>
    setExpandedClusters(prev => (prev.size > 0 ? new Set() : prev))

  // 필터 변경 시 묶음 초기화
  useEffect(() => {
    setExpandedClusters(new Set())
  }, [listings])

  // 지도가 보일 때마다 크기 재계산 (짤림 방지)
  useEffect(() => {
    if (!mapObj.current) return
    const t = setTimeout(() => mapObj.current?.invalidateSize(), 80)
    return () => clearTimeout(t)
  }, [mapVisible])

  // 지도 초기화 (한 번만)
  useEffect(() => {
    if (mapObj.current) return
    mapObj.current = L.map(mapRef.current, { zoomControl: true }).setView(
      [35.106541, 128.966855], 17
    )
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapObj.current)

    // 지도 배경 클릭 / 드래그 → 묶음 닫기
    mapObj.current.on('click',     () => collapse())
    mapObj.current.on('dragstart', () => collapse())
    mapObj.current.on('zoomstart', () => collapse())
  }, [])

  // 매물 마커 + POI 마커 통합 동기화
  useEffect(() => {
    if (!mapObj.current) return

    // 전체 레이어 초기화
    allLayers.current.forEach(l => l.remove())
    poiLayers.current.forEach(l => l.remove())
    allLayers.current = []
    poiLayers.current = []
    singleMap.current  = {}
    clusterMap.current = {}

    // ── 매물 마커 ──
    const clusters = buildClusters(listings)

    clusters.forEach(group => {
      const clusterId  = group[0].id
      const isExpanded = expandedClusters.has(clusterId)

      if (group.length === 1 || isExpanded) {
        group.forEach(item => {
          const m = L.marker([item.lat, item.lng], { icon: defaultIcon })
            .addTo(mapObj.current)
            .bindPopup(`
              <div class="popup-card" style="cursor:pointer;min-width:160px;">
                <div class="popup-name" style="font-weight:700;font-size:13px;margin-bottom:4px;">📍 ${item.name}</div>
                <div class="popup-room" style="font-size:11px;color:#6d4c41;margin-bottom:4px;">${item.room} · ${item.area}평</div>
                <div class="popup-price" style="font-size:12px;font-weight:600;color:#1a237e;margin-bottom:6px;">월세 ${item.monthly}만 / 보증금 ${item.deposit}만</div>
                <div class="popup-hint" style="font-size:11px;color:#888;text-align:right;">탭하여 상세보기 →</div>
              </div>
            `, { maxWidth: 220 })

          m.on('click', () => {
            if (!isExpanded) collapse()
            onMarkerClick(item.id)
          })

          m.on('popupopen', (e) => {
            const el = e.popup.getElement()?.querySelector('.popup-card')
            if (el) {
              el.addEventListener('click', () => {
                m.closePopup()
                onOpenDetail?.(item)
              }, { once: true })
            }
          })

          singleMap.current[item.id] = m
          allLayers.current.push(m)
        })
      } else {
        const lat = group.reduce((s, l) => s + l.lat, 0) / group.length
        const lng = group.reduce((s, l) => s + l.lng, 0) / group.length

        const m = L.marker([lat, lng], { icon: makeClusterIcon(group.length) })
          .addTo(mapObj.current)

        m.on('click', () => {
          mapObj.current.flyTo([lat, lng], 18, { duration: 0.6 })
          mapObj.current.once('moveend', () => {
            setExpandedClusters(new Set([clusterId]))
          })
        })

        group.forEach(item => { clusterMap.current[item.id] = m })
        allLayers.current.push(m)
      }
    })

    // ── POI 마커 (매물 위에 렌더링) ──
    poiMarkers?.forEach(p => {
      const m = L.marker([p.lat, p.lng], {
        icon: makePoiMarkerIcon(p.emoji),
        zIndexOffset: 500,
      })
        .addTo(mapObj.current)
        .bindPopup(`<div class="popup-name">${p.emoji} ${p.name ?? p.label}</div><div class="popup-dist">${p.dist}m</div>`)
      poiLayers.current.push(m)
    })

    return () => {
      allLayers.current.forEach(l => l.remove())
      poiLayers.current.forEach(l => l.remove())
    }
  }, [listings, expandedClusters, poiMarkers])

  // 활성 마커 처리
  useEffect(() => {
    if (!mapObj.current) return

    Object.entries(singleMap.current).forEach(([id, m]) => {
      m.setIcon(Number(id) === activeId ? activeIcon : defaultIcon)
    })

    if (activeId) {
      const item = listings.find(l => l.id === activeId)
      if (!item) return
      const m = singleMap.current[activeId] ?? clusterMap.current[activeId]
      if (m) {
        mapObj.current.flyTo([item.lat, item.lng], 16, { duration: 0.8 })
        m.openPopup()
      }
    }
  }, [activeId])

  return (
    <div className={styles.wrapper}>
      <div ref={mapRef} className={styles.map} />
      <div className={styles.label}>
        <strong>📍 검색 결과</strong> &nbsp;|&nbsp; 근접 매물 묶음 표시 중
      </div>
    </div>
  )
}
