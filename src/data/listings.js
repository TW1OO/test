import { poisByType } from './pois'
import { nearestPoi } from '../utils/distance'
import rawCsv from './동아대_하단역근처_원룸투룸_30개_최종 (1).csv?raw'

function convBrand(name) {
  if (name.startsWith('GS25'))       return 'GS25'
  if (name.startsWith('CU'))         return 'CU'
  if (name.startsWith('이마트24'))   return '이마트24'
  if (name.startsWith('세븐일레븐')) return '세븐일레븐'
  return name
}

function computeDists(lat, lng) {
  const result = {}
  for (const [type, list] of Object.entries(poisByType)) {
    result[type] = nearestPoi(lat, lng, list)
  }
  return result
}

function parseCsv(raw) {
  const lines = raw
    .replace(/^﻿/, '')   // BOM 제거
    .split('\n')
    .map(l => l.trim())
    .filter(l => l)

  return lines.slice(1).map(line => {
    // 주소에 쉼표 없으므로 단순 split 사용
    const cols = line.split(',')
    const id       = Number(cols[0])
    const name     = cols[1]?.trim()
    const roomType = cols[2]?.trim()   // 원룸 | 투룸
    const lat      = Number(cols[4])
    const lng      = Number(cols[5])
    const address  = cols[6]?.trim()

    // 방 종류별 월세/보증금 생성 (현실적인 하단동 시세)
    const isOneRoom = roomType === '원룸'
    const monthly  = isOneRoom ? 25 + (id % 7) * 3  : 40 + (id % 6) * 5
    const deposit  = isOneRoom ? 100 + (id % 5) * 50 : 300 + (id % 4) * 100

    const tags = isOneRoom
      ? ['원룸', id % 3 === 0 ? '풀옵션' : id % 3 === 1 ? '채광 좋음' : '보증금 협의']
      : ['투룸', id % 2 === 0 ? '주차 가능' : '신축']

    const area  = isOneRoom
      ? (8 + (id % 5) * 1.5).toFixed(1)
      : (15 + (id % 6) * 2).toFixed(1)
    const options = isOneRoom
      ? ['에어컨', '냉장고', id % 3 === 0 ? '세탁기' : id % 3 === 1 ? '전자레인지' : '인덕션',
         id % 2 === 0 ? '침대' : '책상', id % 4 === 0 ? '옷장' : '선풍기']
      : ['에어컨', '냉장고', '세탁기', '전자레인지', id % 2 === 0 ? '침대' : '소파', '옷장']
    const phone = '010-1946-2026'

    return { id, name, room: roomType, monthly, deposit, area, options, phone, tags, address, lat, lng }
  })
}

const rawListings = parseCsv(rawCsv)

export const listings = rawListings.map(l => {
  const d = computeDists(l.lat, l.lng)
  const nc = d.conv
  return {
    ...l,
    convDist:           nc?.dist                ?? null,
    convName:           nc ? convBrand(nc.poi.name) : '편의점',
    convPoiLat:         nc?.poi.lat             ?? null,
    convPoiLng:         nc?.poi.lng             ?? null,
    subwayDist:         d.subway?.dist          ?? null,
    subwayName:         d.subway?.poi.name      ?? null,
    subwayPoiLat:       d.subway?.poi.lat       ?? null,
    subwayPoiLng:       d.subway?.poi.lng       ?? null,
    martDist:           d.mart?.dist            ?? null,
    martName:           d.mart?.poi.name        ?? null,
    martPoiLat:         d.mart?.poi.lat         ?? null,
    martPoiLng:         d.mart?.poi.lng         ?? null,
    hospitalDist:       d.hospital?.dist        ?? null,
    hospitalName:       d.hospital?.poi.name    ?? null,
    hospitalPoiLat:     d.hospital?.poi.lat     ?? null,
    hospitalPoiLng:     d.hospital?.poi.lng     ?? null,
    cafeDist:           d.cafe?.dist            ?? null,
    cafeName:           d.cafe?.poi.name        ?? null,
    cafePoiLat:         d.cafe?.poi.lat         ?? null,
    cafePoiLng:         d.cafe?.poi.lng         ?? null,
    policeDist:         d.police?.dist          ?? null,
    policeName:         d.police?.poi.name      ?? null,
    policePoiLat:       d.police?.poi.lat       ?? null,
    policePoiLng:       d.police?.poi.lng       ?? null,
    gymDist:            d.gym?.dist             ?? null,
    gymName:            d.gym?.poi.name         ?? null,
    gymPoiLat:          d.gym?.poi.lat          ?? null,
    gymPoiLng:          d.gym?.poi.lng          ?? null,
    universityDist:     d.university?.dist      ?? null,
    universityName:     d.university?.poi.name  ?? null,
    universityPoiLat:   d.university?.poi.lat   ?? null,
    universityPoiLng:   d.university?.poi.lng   ?? null,
  }
})

/** 지도 편의점 반경 표시용: 하단동 편의점 4곳 */
export const convStores = [
  { lat: 35.105760, lng: 128.968561, name: 'CU 하단점' },
  { lat: 35.102980, lng: 128.965811, name: '이마트24 하단점' },
  { lat: 35.106403, lng: 128.967985, name: 'GS25 하단점' },
  { lat: 35.107292, lng: 128.962336, name: '세븐일레븐 하단점' },
]
