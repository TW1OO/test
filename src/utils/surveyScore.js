// 거리 → 0~1 점수 변환 기준 최대 거리 (m)
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

// 답변 + direction → 중요도(1~5) 변환
function toImportance(answer, direction, type) {
  if (type === 'yesno') return answer === 1 ? 5 : 1
  return direction === 1 ? answer : 6 - answer
}

export function computeResults(answers, questions) {
  const importanceAcc = {}

  questions.forEach(q => {
    const raw = answers[q.id]
    if (raw == null) return
    if (q.filterKey === 'roomType') return

    const imp = toImportance(raw, q.direction, q.type)
    if (!importanceAcc[q.filterKey]) importanceAcc[q.filterKey] = []
    importanceAcc[q.filterKey].push(imp)
  })

  // filterKey → 평균 중요도 (1~5) → 코사인 유사도 가중치로 사용
  const importanceMap = {}
  for (const [key, vals] of Object.entries(importanceAcc)) {
    importanceMap[key] = vals.reduce((s, v) => s + v, 0) / vals.length
  }

  // 방 종류 선호
  const rtQ = questions.find(q => q.id === 'q_room_type')
  const preferTwoRoom      = rtQ ? (answers[rtQ.id] ?? 3) >= 4 : false
  const roomTypeImportance = rtQ ? toImportance(answers[rtQ.id] ?? 3, 1) : 3

  return { preferTwoRoom, roomTypeImportance, fieldMap: FIELD_MAP, importanceMap }
}

// 가중 코사인 유사도 기반 매물 점수 계산 및 정렬
export function scoreListings(listings, importanceMap, preferTwoRoom, roomTypeImportance, fieldMap) {
  // 사용자 벡터: 중요도를 0~1로 정규화
  const userVec = [
    ...POI_KEYS.map(k => (importanceMap[k] ?? 1) / 5),
    roomTypeImportance / 5,
  ]
  const weights = userVec.slice()

  function listingVec(l) {
    const poiScores = POI_KEYS.map(k => {
      const d = l[fieldMap[k]]
      // 거리 정보 없으면 중간값, 있으면 0~1 정규화 (가까울수록 1)
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

// 성향 텍스트 생성
const PERSONALITY_LABELS = {
  conv:        '편의 중심',
  mart:        '요리 & 장보기',
  hospital:    '건강 관리',
  cafe:        '카페 & 야간',
  gym:         '운동 & 활동',
  university:  '통학 편의',
  subway:      '대중교통',
  police:      '안전 중시',
  optionCount: '풀옵션 선호',
  size:        '넓은 공간 선호',
  floor:       '층수 중시',
  roomLoft:    '구조 중시',
  fireStation: '안전 시설 중시',
  admin:       '행정 편의 중시',
}

export function generatePersonality(answers, questions) {
  const importanceAcc = {}

  questions.forEach(q => {
    const raw = answers[q.id]
    if (raw == null) return
    if (q.filterKey === 'roomType') return
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
