import { Fragment } from 'react'
import FilterSlider from './FilterSlider'
import ListingCard from './ListingCard'
import styles from './Sidebar.module.css'

export default function Sidebar({
  previewDefs,
  activeFilterDefs,
  filterValues,
  onFilterChange,
  operator,
  onToggleOperator,
  listings,
  activeId,
  onCardClick,
  isParsing,
}) {
  // 검색 후 확정된 필터가 있으면 그것을, 없으면 타이핑 미리보기 표시
  const displayDefs = activeFilterDefs.length > 0 ? activeFilterDefs : previewDefs
  const isConfirmed = activeFilterDefs.length > 0

  return (
    <aside className={styles.sidebar}>

      {/* 부가 조건 필터 */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <span>🎛️</span> 부가 조건 필터
          {isConfirmed && displayDefs.length >= 2 && (
            <span className={styles.operatorSummary} data-op={operator}>
              전체 {operator}
            </span>
          )}
        </div>

        {isParsing ? (
          <div className={styles.filterEmpty}>
            <span className={styles.filterEmptyIcon}>⏳</span>
            <span>조건 분석 중…</span>
          </div>
        ) : displayDefs.length === 0 ? (
          <div className={styles.filterEmpty}>
            <span className={styles.filterEmptyIcon}>🔍</span>
            <span>조건을 추가해주세요</span>
            <span className={styles.filterHint}>
              검색창에 <em>조건</em>을 입력하면<br />
              자동으로 필터가 추가됩니다
            </span>
          </div>
        ) : (
          displayDefs.map((def, idx) => (
            <Fragment key={def.key}>
              <FilterSlider
                label={def.label}
                min={def.min}
                max={def.max}
                value={filterValues[def.key]}
                onChange={v => onFilterChange(def.key, v)}
                dimmed={!isConfirmed}
              />
              {/* 슬라이더 사이에 AND / OR 토글 칩 */}
              {isConfirmed && idx < displayDefs.length - 1 && (
                <button
                  className={styles.operatorChip}
                  data-op={operator}
                  onClick={onToggleOperator}
                  title="클릭하여 AND / OR 전환"
                >
                  {operator}
                  <span className={styles.chipHint}>전환</span>
                </button>
              )}
            </Fragment>
          ))
        )}
      </div>

      {/* 매물 리스트 헤더 */}
      <div className={`${styles.section} ${styles.listHeader}`}>
        <div className={styles.sectionTitle}>
          <span>🏢</span> 조건 만족 매물 추천 리스트
        </div>
      </div>

      {/* 카드 목록 */}
      <div className={styles.list}>
        {listings.length === 0 ? (
          <p className={styles.empty}>조건에 맞는 매물이 없습니다.</p>
        ) : (
          listings.map((item, idx) => (
            <ListingCard
              key={item.id}
              listing={item}
              rank={idx + 1}
              isActive={item.id === activeId}
              onClick={() => onCardClick(item.id)}
            />
          ))
        )}
      </div>

    </aside>
  )
}
