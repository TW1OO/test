import rawJson from './hadan_final_coords_swapped.json'

const TYPE_MAP = {
  '편의점':  'conv',
  '마트':    'mart',
  '병원':    'hospital',
  '지하철역': 'subway',
  '경찰서':  'police',
  '소방서':  'fireStation',
  '행정기관': 'admin',
  '공공기관': 'admin',
  '카페':    'cafe',
  '헬스장':  'gym',
  '대학교':  'university',
}

const rawPois = rawJson
  .map((p, i) => ({
    id:   Number(p.id) || i,
    name: p.place_name,
    type: TYPE_MAP[p.infra_type] ?? null,
    lat:  p.x,
    lng:  p.y,
  }))
  .filter(p => p.type !== null)

// 하단역환승센터 좌표 고정 보정
const SUBWAY_OVERRIDE = { lat: 35.103690, lng: 128.967319, name: '하단역환승센터' }
export const pois = rawPois.map(p =>
  p.type === 'subway' ? { ...p, ...SUBWAY_OVERRIDE } : p
)

export const poisByType = {
  conv:        pois.filter(p => p.type === 'conv'),
  subway:      pois.filter(p => p.type === 'subway'),
  mart:        pois.filter(p => p.type === 'mart'),
  hospital:    pois.filter(p => p.type === 'hospital'),
  police:      pois.filter(p => p.type === 'police'),
  fireStation: pois.filter(p => p.type === 'fireStation'),
  admin:       pois.filter(p => p.type === 'admin'),
  cafe:        pois.filter(p => p.type === 'cafe'),
  gym:         pois.filter(p => p.type === 'gym'),
  university:  pois.filter(p => p.type === 'university'),
}
