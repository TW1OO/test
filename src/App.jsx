import { useState, useMemo } from 'react'
import SurveyPage from './components/SurveyPage'
import ResultsSidebar from './components/ResultsSidebar'
import ResultModal from './components/ResultModal'
import MapView from './components/MapView'
import ListingDetailModal from './components/ListingDetailModal'
import { listings as allListings } from './data/listings'
import { computeResults, generatePersonality, scoreListings } from './utils/surveyScore'
import styles from './App.module.css'

const POI_META = {
  conv:       { label: '편의점', emoji: '🏪', latKey: 'convPoiLat',       lngKey: 'convPoiLng',       distKey: 'convDist',       nameKey: 'convName' },
  mart:       { label: '마트',   emoji: '🛒', latKey: 'martPoiLat',       lngKey: 'martPoiLng',       distKey: 'martDist',       nameKey: 'martName' },
  hospital:   { label: '병원',   emoji: '🏥', latKey: 'hospitalPoiLat',   lngKey: 'hospitalPoiLng',   distKey: 'hospitalDist',   nameKey: 'hospitalName' },
  cafe:       { label: '카페',   emoji: '☕', latKey: 'cafePoiLat',       lngKey: 'cafePoiLng',       distKey: 'cafeDist',       nameKey: 'cafeName' },
  gym:        { label: '헬스장', emoji: '💪', latKey: 'gymPoiLat',        lngKey: 'gymPoiLng',        distKey: 'gymDist',        nameKey: 'gymName' },
  university: { label: '대학교', emoji: '🎓', latKey: 'universityPoiLat', lngKey: 'universityPoiLng', distKey: 'universityDist', nameKey: 'universityName' },
  subway:     { label: '지하철', emoji: '🚇', latKey: 'subwayPoiLat',     lngKey: 'subwayPoiLng',     distKey: 'subwayDist',     nameKey: 'subwayName' },
  police:     { label: '경찰서', emoji: '🚔', latKey: 'policePoiLat',     lngKey: 'policePoiLng',     distKey: 'policeDist',     nameKey: 'policeName' },
}

export default function App() {
  const [page, setPage]                 = useState('survey')
  const [showModal, setShowModal]       = useState(false)
  const [listOpen, setListOpen]         = useState(true)
  const [surveyData, setSurveyData]     = useState(null)
  const [activeId, setActiveId]         = useState(null)
  const [detailListing, setDetailListing] = useState(null)

  function handleSurveyComplete(answers, questions, budgetData) {
    const results     = computeResults(answers, questions)
    const personality = generatePersonality(answers, questions)
    setSurveyData({ ...results, personality, budgetData: budgetData ?? null })
    setPage('results')
    setShowModal(true)
    setListOpen(true)
    setActiveId(null)
  }

  function handleRetake() {
    setPage('survey')
    setSurveyData(null)
    setShowModal(false)
    setActiveId(null)
    setDetailListing(null)
  }

  function handleListingClick(id) {
    setActiveId(id)
    setDetailListing(filtered.find(l => l.id === id) ?? null)
  }

  // 가중 코사인 유사도로 매물 랭킹 (LLM 예산 데이터 블렌딩 포함)
  const filtered = useMemo(() => {
    if (!surveyData) return []
    const { importanceMap, preferTwoRoom, roomTypeImportance, fieldMap, budgetData } = surveyData

    // LLM poiBoosts를 설문 중요도와 블렌딩 (설문 60% : LLM 40%)
    const blendedImportance = { ...importanceMap }
    if (budgetData?.poiBoosts) {
      for (const [key, boost] of Object.entries(budgetData.poiBoosts)) {
        blendedImportance[key] = (blendedImportance[key] ?? 3) * 0.6 + boost * 0.4
      }
    }

    // 방 타입 선호 블렌딩
    const effectivePreferTwoRoom =
      budgetData?.preferTwoRoom != null ? budgetData.preferTwoRoom : preferTwoRoom
    const effectiveRoomType =
      budgetData?.preferTwoRoom != null
        ? roomTypeImportance * 0.6 + (budgetData.preferTwoRoom ? 5 : 1) * 0.4
        : roomTypeImportance

    let scored = scoreListings(allListings, blendedImportance, effectivePreferTwoRoom, effectiveRoomType, fieldMap)

    // 예산 필터
    if (budgetData?.maxMonthly) scored = scored.filter(l => l.monthly <= budgetData.maxMonthly)
    if (budgetData?.maxDeposit)  scored = scored.filter(l => l.deposit  <= budgetData.maxDeposit)

    return scored
  }, [surveyData])

  // 선택된 매물의 중요 POI 마커 (중요도 3점 이상)
  const detailPoiMarkers = useMemo(() => {
    if (!detailListing || !surveyData) return []
    return Object.entries(surveyData.importanceMap)
      .filter(([, avg]) => avg >= 3)
      .map(([key]) => {
        const meta = POI_META[key]
        if (!meta) return null
        const lat = detailListing[meta.latKey]
        const lng = detailListing[meta.lngKey]
        if (lat == null || lng == null) return null
        return {
          lat, lng,
          emoji: meta.emoji,
          label: meta.label,
          name:  detailListing[meta.nameKey],
          dist:  detailListing[meta.distKey],
        }
      })
      .filter(Boolean)
  }, [detailListing, surveyData])

  if (page === 'survey') {
    return <SurveyPage onComplete={handleSurveyComplete} />
  }

  const { personality, importanceMap, preferTwoRoom } = surveyData

  // 그리드 클래스 결정
  const gridClass = [
    styles.grid,
    showModal                     ? styles.gridModal : '',
    !showModal && listOpen        ? styles.gridList  : '',
    !showModal && !listOpen       ? styles.gridMap   : '',
  ].join(' ')

  return (
    <div className={styles.layout}>
      <div className={gridClass}>
        {!showModal && (
          <div className={styles.sidebarCol}>
            <ResultsSidebar
              listings={filtered}
              activeId={activeId}
              isOpen={listOpen}
              onToggle={() => setListOpen(o => !o)}
              onCardClick={handleListingClick}
              personality={personality}
              onRetake={handleRetake}
            />
          </div>
        )}
        <div className={styles.mapCol} style={{ position: 'relative' }}>
          <MapView
            listings={filtered}
            activeId={activeId}
            onMarkerClick={handleListingClick}
            mapVisible={!showModal && !listOpen}
            poiMarkers={detailPoiMarkers}
          />
          {!showModal && !listOpen && (
            <button
              className={styles.btnShowList}
              onClick={() => setListOpen(true)}
            >
              ☰ 목록 보기
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <ResultModal
          personality={personality}
          importanceMap={importanceMap}
          preferTwoRoom={preferTwoRoom}
          listings={filtered}
          onClose={() => { setShowModal(false); setListOpen(true) }}
        />
      )}

      {!showModal && detailListing && (
        <ListingDetailModal
          listing={detailListing}
          rank={filtered.findIndex(l => l.id === detailListing.id) + 1}
          poiMarkers={detailPoiMarkers}
          onClose={() => { setDetailListing(null) }}
        />
      )}
    </div>
  )
}
