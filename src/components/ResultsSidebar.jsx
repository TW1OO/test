import ListingCard from './ListingCard'
import styles from './ResultsSidebar.module.css'

const POI_DIST_META = {
  conv:       { emoji: '🏪', label: '편의점', distKey: 'convDist',       nameKey: 'convName' },
  mart:       { emoji: '🛒', label: '마트',   distKey: 'martDist',       nameKey: 'martName' },
  hospital:   { emoji: '🏥', label: '병원',   distKey: 'hospitalDist',   nameKey: 'hospitalName' },
  cafe:       { emoji: '☕', label: '카페',   distKey: 'cafeDist',       nameKey: 'cafeName' },
  gym:        { emoji: '💪', label: '헬스장', distKey: 'gymDist',        nameKey: 'gymName' },
  university: { emoji: '🎓', label: '대학교', distKey: 'universityDist', nameKey: 'universityName' },
  subway:     { emoji: '🚇', label: '지하철', distKey: 'subwayDist',     nameKey: 'subwayName' },
  police:     { emoji: '🚔', label: '경찰서', distKey: 'policeDist',     nameKey: 'policeName' },
}

function getTopPoi(listing, importanceMap) {
  const sorted = Object.keys(POI_DIST_META)
    .filter(k => importanceMap[k] != null && listing[POI_DIST_META[k].distKey] != null)
    .sort((a, b) => (importanceMap[b] ?? 0) - (importanceMap[a] ?? 0))
  if (!sorted.length) return null
  const key = sorted[0]
  const meta = POI_DIST_META[key]
  return { emoji: meta.emoji, label: meta.label, name: listing[meta.nameKey], dist: listing[meta.distKey] }
}

export default function ResultsSidebar({
  listings, activeId, isOpen, onToggle, onCardClick, personality, onRetake, importanceMap = {},
}) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <span className={styles.personality}>✨ {personality}</span>
          <button
            className={`${styles.btnToggle} ${isOpen ? styles.btnToggleOpen : ''}`}
            onClick={onToggle}
            title={isOpen ? '목록 접기' : '목록 펼치기'}
          >
            ▼
          </button>
        </div>
        <div className={styles.meta}>
          <span className={styles.count}>추천 매물 {listings.length}개</span>
          <button className={styles.btnRetake} onClick={onRetake}>↺ 다시 하기</button>
        </div>
      </div>

      <div className={`${styles.listWrap} ${!isOpen ? styles.listWrapClosed : ''}`}>
        <div className={styles.listInner}>
          <div className={styles.list}>
            {listings.length === 0 ? (
              <p className={styles.empty}>
                조건에 맞는 매물이 없어요.<br />
                설문을 다시 해보세요!
              </p>
            ) : (
              listings.map((l, i) => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  rank={i + 1}
                  isActive={l.id === activeId}
                  topPoi={getTopPoi(l, importanceMap)}
                  onClick={() => onCardClick(l.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
