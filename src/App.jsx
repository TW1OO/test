import { useState, useMemo, useCallback } from 'react'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import MapView from './components/MapView'
import { listings as allListings } from './data/listings'
import { parseQuery } from './utils/parseQuery'
import styles from './App.module.css'

export const FILTER_DEFINITIONS = [
  {
    key: 'conv',
    label: '편의점 거리',
    keywords: ['편의점', 'cu', 'gs25', '세븐일레븐', '이마트24', 'gs 25'],
    min: 50, max: 1000, defaultValue: 300,
    field: 'convDist',
  },
  {
    key: 'subway',
    label: '지하철역 거리',
    keywords: ['지하철', '지하철역', '전철', '지하철 역'],
    min: 100, max: 2000, defaultValue: 500,
    field: 'subwayDist',
  },
  {
    key: 'mart',
    label: '대형마트 거리',
    keywords: ['마트', '대형마트', '이마트', '홈플러스', '롯데마트'],
    min: 100, max: 3000, defaultValue: 1000,
    field: 'martDist',
  },
  {
    key: 'bus',
    label: '버스정류장',
    keywords: ['버스', '버스정류장', '정류장'],
    min: 50, max: 500, defaultValue: 150,
    field: 'busDist',
  },
  {
    key: 'police',
    label: '경찰서 거리',
    keywords: ['경찰서', '경찰', '지구대', '파출소'],
    min: 100, max: 2000, defaultValue: 800,
    field: 'policeDist',
  },
  {
    key: 'hospital',
    label: '병원 거리',
    keywords: ['병원', '의원', '클리닉', '응급실', '약국'],
    min: 100, max: 3000, defaultValue: 1000,
    field: 'hospitalDist',
  },
  {
    key: 'cafe',
    label: '카페 거리',
    keywords: ['카페', '커피', '스타벅스', '이디야', '메가커피', '카페인'],
    min: 50, max: 1000, defaultValue: 300,
    field: 'cafeDist',
  },
  {
    key: 'university',
    label: '대학교 거리',
    keywords: ['대학교', '대학', '캠퍼스', '동아대', '동아대학교'],
    min: 100, max: 3000, defaultValue: 1000,
    field: 'universityDist',
  },
]

export default function App() {
  const [query, setQuery] = useState('')
  const [filterValues, setFilterValues] = useState({
    conv: 300, subway: 500, mart: 1000, bus: 150,
    police: 800, hospital: 1000, cafe: 300, university: 1000,
  })
  // LLM이 결정한 활성 필터 키 목록
  const [activeKeys, setActiveKeys] = useState([])
  // AND: 모두 만족 / OR: 하나만 만족
  const [operator, setOperator] = useState('AND')
  const [isParsing, setIsParsing] = useState(false)
  const [activeId, setActiveId] = useState(null)

  // 타이핑 중 실시간 미리보기 (키워드만 감지)
  const previewDefs = useMemo(() => {
    const lower = query.toLowerCase()
    return FILTER_DEFINITIONS.filter(def =>
      def.keywords.some(kw => lower.includes(kw))
    )
  }, [query])

  // 검색 후 확정된 활성 필터 정의
  const activeFilterDefs = useMemo(
    () => FILTER_DEFINITIONS.filter(def => activeKeys.includes(def.key)),
    [activeKeys]
  )

  // 필터링 로직: AND = 모두 만족, OR = 하나라도 만족
  const filtered = useMemo(() => {
    if (activeFilterDefs.length === 0) {
      return [...allListings].sort((a, b) => a.convDist - b.convDist)
    }
    // dist가 null이면 POI 데이터 없음 → AND에서는 통과, OR에서는 불충족으로 처리
    const check = (l, def) => {
      const dist = l[def.field]
      if (dist === null) return operator === 'AND'
      return dist <= filterValues[def.key]
    }
    return allListings
      .filter(l =>
        operator === 'AND'
          ? activeFilterDefs.every(def => check(l, def))
          : activeFilterDefs.some(def => check(l, def))
      )
      .sort((a, b) => (a.convDist ?? 99999) - (b.convDist ?? 99999))
  }, [activeFilterDefs, filterValues, operator])

  function handleFilterChange(key, value) {
    setFilterValues(prev => ({ ...prev, [key]: value }))
  }

  function toggleOperator() {
    setOperator(prev => (prev === 'AND' ? 'OR' : 'AND'))
  }

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    setIsParsing(true)
    try {
      const result = await parseQuery(query, FILTER_DEFINITIONS)
      setActiveKeys(result.filters)
      setOperator(result.operator)
      // 결과 중 첫 번째 매물로 지도 이동
      const defs = FILTER_DEFINITIONS.filter(d => result.filters.includes(d.key))
      const chk = (l, d) => {
        const dist = l[d.field]
        if (dist === null) return result.operator === 'AND'
        return dist <= filterValues[d.key]
      }
      const nextFiltered = allListings
        .filter(l =>
          defs.length === 0
            ? true
            : result.operator === 'AND'
              ? defs.every(d => chk(l, d))
              : defs.some(d => chk(l, d))
        )
        .sort((a, b) => (a.convDist ?? 99999) - (b.convDist ?? 99999))
      if (nextFiltered.length > 0) setActiveId(nextFiltered[0].id)
    } finally {
      setIsParsing(false)
    }
  }, [query, filterValues])

  return (
    <div className={styles.layout}>
      <TopBar
        query={query}
        onChange={setQuery}
        onSearch={handleSearch}
        isParsing={isParsing}
      />
      <div className={styles.grid}>
        <Sidebar
          previewDefs={previewDefs}
          activeFilterDefs={activeFilterDefs}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          operator={operator}
          onToggleOperator={toggleOperator}
          listings={filtered}
          activeId={activeId}
          onCardClick={setActiveId}
          isParsing={isParsing}
        />
        <MapView
          listings={filtered}
          activeId={activeId}
          onMarkerClick={setActiveId}
        />
      </div>
    </div>
  )
}
