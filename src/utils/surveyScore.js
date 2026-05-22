// POI 타입별 거리 허용 범위 (m)
const RANGES = {
  conv:       { min: 100,  max: 1000 },
  subway:     { min: 200,  max: 2000 },
  mart:       { min: 200,  max: 3000 },
  police:     { min: 200,  max: 2000 },
  hospital:   { min: 200,  max: 3000 },
  cafe:       { min: 100,  max: 1000 },
  gym:        { min: 100,  max: 1500 },
  university: { min: 200,  max: 3000 },
}

// 코사인 유사도 계산 시 거리→점수 변환 기준 최대 거리
const MAX_DIST = {
  conv: 1000, subway: 2000, mart: 3000, police: 2000,
  hospital: 3000, cafe: 1000, gym: 1500, university: 3000,
}

const POI_KEYS = Object.keys(MAX_DIST)

const FIELD_MAP = {
  conv:       'convDist',
  subway:     'subwayDist',
  mart:       'martDist',
  police:     'policeDist',
  hospital:   'hospitalDist',
  cafe:       'cafeDist',
  gym:        'gymDist',
  university: 'universityDist',
}

// 중요도(1~5) → 최대 허용 거리(m) 변환
// 중요도 높을수록 → 가까워야 함 → 작은 maxDist
function importanceToMaxDist(importance, range) {
  const t = (importance - 1) / 4  // 0(관심없음) ~ 1(매우중요)
  return Math.round(range.max - t * (range.max - range.min))
}

// 답변 + direction → 중요도(1~5) 변환
// yesno 타입은 answer가 0|1이므로 0→1점, 1→5점으로 매핑
function toImportance(answer, direction, type) {
  if (type === 'yesno') return answer === 1 ? 5 : 1
  return direction === 1 ? answer : 6 - answer
}

export function computeResults(answers, questions) {
  const importanceAcc = {}

  questions.forEach(q => {
    const raw = answers[q.id]
    if (raw == null) return
    if (q.filterKey === 'roomType' || q.filterKey === 'roomLoft') return

    const imp = toImportance(raw, q.direction, q.type)
    if (!importanceAcc[q.filterKey]) importanceAcc[q.filterKey] = []
    importanceAcc[q.filterKey].push(imp)
  })

  // filterKey → maxDist 계산
  const filterValues = {}
  for (const [key, vals] of Object.entries(importanceAcc)) {
    const avg = vals.reduce((s, v) => s + v, 0) / vals.length
    filterValues[key] = RANGES[key] ? importanceToMaxDist(avg, RANGES[key]) : 1000
  }

  // 중요도 3점 이상인 필터만 실제 적용
  const activeKeys = Object.entries(importanceAcc)
    .filter(([, vals]) => (vals.reduce((s, v) => s + v, 0) / vals.length) >= 3)
    .map(([key]) => key)

  // 방 종류 선호
  const rtQ = questions.find(q => q.id === 'q_room_type')
  const rlQ = questions.find(q => q.id === 'q_room_loft')
  const preferTwoRoom = rtQ ? (answers[rtQ.id] ?? 3) >= 4 : false
  const preferLoft    = rlQ ? (answers[rlQ.id] ?? 3) >= 4 : false
  // 투룸 중요도: 1~5 (방 구분 중시 정도)
  const roomTypeImportance = rtQ ? toImportance(answers[rtQ.id] ?? 3, 1) : 3

  // 모달 표시용: filterKey → 평균 중요도
  const importanceMap = {}
  for (const [key, vals] of Object.entries(importanceAcc)) {
    importanceMap[key] = vals.reduce((s, v) => s + v, 0) / vals.length
  }

  return { filterValues, activeKeys, preferTwoRoom, preferLoft, roomTypeImportance, fieldMap: FIELD_MAP, importanceMap }
}

// 성향 텍스트 생성
const PERSONALITY_LABELS = {
  conv:       '편의 중심',
  mart:       '요리 & 장보기',
  hospital:   '건강 관리',
  cafe:       '카페 & 야간',
  gym:        '운동 & 활동',
  university: '통학 편의',
  subway:     '대중교통',
  police:     '안전 중시',
}

// 가중 코사인 유사도 기반 매물 점수 계산 및 정렬
export function scoreListings(listings, importanceMap, preferTwoRoom, roomTypeImportance, fieldMap) {
  // 사용자 벡터: [poi 중요도(0~1) × N, 방타입 중요도(0~1)]
  const userVec = [
    ...POI_KEYS.map(k => (importanceMap[k] ?? 1) / 5),
    roomTypeImportance / 5,
  ]
  // 가중치는 사용자 벡터와 동일 (중요도가 곧 가중치)
  const weights = userVec.slice()

  function listingVec(l) {
    const poiScores = POI_KEYS.map(k => {
      const d = l[fieldMap[k]]
      // 거리 정보 없으면 중간값
      return d == null ? 0.5 : Math.max(0, 1 - d / MAX_DIST[k])
    })
    const roomMatch = preferTwoRoom
      ? (l.room === '투룸' ? 1 : 0.1)
      : (l.room === '원룸' ? 1 : 0.3)
    return [...poiScores, roomMatch]
  }

  function weightedCosineSim(u, v, w) {
    let dot = 0, nU = 0, nV = 0
    for (let i = 0; i < u.length; i++) {
      dot += w[i] * u[i] * v[i]
      nU  += w[i] * u[i] * u[i]
      nV  += w[i] * v[i] * v[i]
    }
    if (nU < 1e-10 || nV < 1e-10) return 0
    return dot / (Math.sqrt(nU) * Math.sqrt(nV))
  }

  return listings
    .map(l => ({ ...l, matchScore: weightedCosineSim(userVec, listingVec(l), weights) }))
    .sort((a, b) => b.matchScore - a.matchScore)
}

export function generatePersonality(answers, questions) {
  const importanceAcc = {}

  questions.forEach(q => {
    const raw = answers[q.id]
    if (raw == null) return
    if (q.filterKey === 'roomType' || q.filterKey === 'roomLoft') return
    const imp = toImportance(raw, q.direction, q.type)
    if (!importanceAcc[q.filterKey]) importanceAcc[q.filterKey] = []
    importanceAcc[q.filterKey].push(imp)
  })

  const top = Object.entries(importanceAcc)
    .map(([key, vals]) => ({ key, avg: vals.reduce((s, v) => s + v, 0) / vals.length }))
    .filter(({ avg }) => avg >= 3)
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 2)
    .map(({ key }) => PERSONALITY_LABELS[key] || key)

  return top.length
    ? `당신은 ${top.join(' · ')}을(를) 중시하는 타입이에요`
    : '당신만의 라이프스타일에 맞는 매물을 찾았어요'
}
