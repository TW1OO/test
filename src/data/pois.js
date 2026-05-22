import rawCsv from './사하구_하단동_상권DB_대학교추가 (1).csv?raw'

const TYPE_MAP = {
  '카페':    'cafe',
  '헬스장':  'gym',
  '병원':    'hospital',
  '지하철역': 'subway',
  '편의점':  'conv',
  '마트':    'mart',
  '대학교':  'university',
}

function parsePois(raw) {
  const lines = raw
    .replace(/^﻿/, '')  // BOM 제거
    .split('\n')
    .map(l => l.trim())
    .filter(l => l)

  return lines.slice(1).map(line => {
    const cols = line.split(',')
    const id   = Number(cols[0])
    const name = cols[1]?.trim()
    const type = TYPE_MAP[cols[2]?.trim()] ?? cols[2]?.trim()
    const lat  = Number(cols[4])
    const lng  = Number(cols[5])
    return { id, name, type, lat, lng }
  })
}

const rawPois = parsePois(rawCsv)

// 하단역환승센터(아트 가든 하단) 좌표로 고정 보정
const SUBWAY_OVERRIDE = { lat: 35.103690, lng: 128.967319, name: '하단역환승센터' }
export const pois = rawPois.map(p =>
  p.type === 'subway' ? { ...p, ...SUBWAY_OVERRIDE } : p
)

export const poisByType = {
  conv:       pois.filter(p => p.type === 'conv'),
  subway:     pois.filter(p => p.type === 'subway'),
  mart:       pois.filter(p => p.type === 'mart'),
  hospital:   pois.filter(p => p.type === 'hospital'),
  cafe:       pois.filter(p => p.type === 'cafe'),
  gym:        pois.filter(p => p.type === 'gym'),
  university: pois.filter(p => p.type === 'university'),
  police:     [],
}
