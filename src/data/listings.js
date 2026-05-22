import { poisByType } from './pois'
import { nearestPoi } from '../utils/distance'

function convBrand(name) {
  if (name.startsWith('GS25'))     return 'GS25'
  if (name.startsWith('CU'))       return 'CU'
  if (name.startsWith('이마트24')) return '이마트24'
  if (name.startsWith('세븐일레븐')) return '세븐일레븐'
  return name
}

/** 매물 좌표로부터 각 POI 타입별 최단 거리를 계산 */
function computeDists(lat, lng) {
  const result = {}
  for (const [type, list] of Object.entries(poisByType)) {
    result[type] = nearestPoi(lat, lng, list)
  }
  return result
}

const rawListings = [
  {
    id: 1,
    name: '동아하이빌 원룸',
    room: '101호',
    monthly: 35, deposit: 300,
    tags: ['풀옵션', '반려동물 가능', '엘리베이터'],
    lat: 35.1055, lng: 128.9675,
  },
  {
    id: 2,
    name: '하단역 청년 원룸',
    room: '202호',
    monthly: 40, deposit: 500,
    tags: ['신축', '주차 가능'],
    lat: 35.1028, lng: 128.9680,
  },
  {
    id: 3,
    name: '선진빌라 202',
    room: '202호',
    monthly: 28, deposit: 200,
    tags: ['저렴', '보증금 협의'],
    lat: 35.1042, lng: 128.9648,
  },
  {
    id: 4,
    name: '브라운스톤 오피스텔',
    room: '305호',
    monthly: 55, deposit: 1000,
    tags: ['오피스텔', '헬스장', '보안'],
    lat: 35.1072, lng: 128.9652,
  },
  {
    id: 5,
    name: '그린파크 원룸',
    room: '103호',
    monthly: 32, deposit: 300,
    tags: ['공원 인접', '채광 좋음'],
    lat: 35.1038, lng: 128.9672,
  },
]

export const listings = rawListings.map(l => {
  const d = computeDists(l.lat, l.lng)

  const nearestConv = d.conv
  return {
    ...l,
    convDist:       nearestConv?.dist  ?? null,
    convName:       nearestConv ? convBrand(nearestConv.poi.name) : '편의점',
    subwayDist:     d.subway?.dist       ?? null,
    martDist:       d.mart?.dist         ?? null,
    hospitalDist:   d.hospital?.dist     ?? null,
    cafeDist:       d.cafe?.dist         ?? null,
    policeDist:     d.police?.dist       ?? null,
    gymDist:        d.gym?.dist          ?? null,
    universityDist: d.university?.dist   ?? null,
  }
})

/** 지도 편의점 반경 표시용: 매물 밀집 지역(하단·가천동) 편의점 4곳 */
export const convStores = [
  { lat: 35.100207, lng: 128.981817, name: '세븐일레븐 가천점' },
  { lat: 35.101528, lng: 128.962600, name: '이마트24 하단점' },
  { lat: 35.099535, lng: 128.981462, name: 'CU 가천2점' },
  { lat: 35.097311, lng: 128.979236, name: '이마트24 가천3점' },
]
