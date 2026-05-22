import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { convStores } from '../data/listings'
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
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  })
}

const activeIcon  = makeIcon('#ffeb3b')
const defaultIcon = makeIcon('#fff9c4')

export default function MapView({ listings, activeId, onMarkerClick }) {
  const mapRef    = useRef(null)
  const mapObj    = useRef(null)
  const markers   = useRef({})

  // 지도 초기화 (한 번만)
  useEffect(() => {
    if (mapObj.current) return

    mapObj.current = L.map(mapRef.current, { zoomControl: true }).setView(
      [35.1060, 128.9660],
      15
    )

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapObj.current)

    convStores.forEach(s => {
      L.circle([s.lat, s.lng], {
        radius: 150,
        color: '#f9a825',
        fillColor: '#fff9c4',
        fillOpacity: 0.3,
        weight: 2,
        dashArray: '5,5',
      })
        .addTo(mapObj.current)
        .bindTooltip(s.name, { permanent: false, direction: 'top' })
    })
  }, [])

  // 마커 동기화
  useEffect(() => {
    if (!mapObj.current) return

    // 기존 마커 제거
    Object.values(markers.current).forEach(m => m.remove())
    markers.current = {}

    listings.forEach(item => {
      const marker = L.marker([item.lat, item.lng], { icon: defaultIcon })
        .addTo(mapObj.current)
        .bindPopup(`
          <div class="popup-name">📍 ${item.name} (${item.room})</div>
          <div class="popup-dist">편의점(${item.convName})까지 ${item.convDist}m</div>
          <div class="popup-price">월세 ${item.monthly}만 / 보증금 ${item.deposit}만</div>
        `)

      marker.on('click', () => onMarkerClick(item.id))
      markers.current[item.id] = marker
    })
  }, [listings])

  // 활성 마커 처리
  useEffect(() => {
    if (!mapObj.current) return

    Object.entries(markers.current).forEach(([id, m]) => {
      m.setIcon(Number(id) === activeId ? activeIcon : defaultIcon)
    })

    if (activeId && markers.current[activeId]) {
      const item = listings.find(l => l.id === activeId)
      if (item) {
        mapObj.current.flyTo([item.lat, item.lng], 16, { duration: 0.8 })
        markers.current[activeId].openPopup()
      }
    }
  }, [activeId])

  return (
    <div className={styles.wrapper}>
      <div ref={mapRef} className={styles.map} />
      <div className={styles.label}>
        <strong>📍 검색 결과</strong> &nbsp;|&nbsp; 편의점 반경 표시 중
      </div>
    </div>
  )
}
