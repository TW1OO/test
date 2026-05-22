import styles from './ResultModal.module.css'

const POI_META = {
  conv:        { label: '편의점',   emoji: '🏪' },
  mart:        { label: '마트',     emoji: '🛒' },
  hospital:    { label: '병원',     emoji: '🏥' },
  cafe:        { label: '카페',     emoji: '☕' },
  gym:         { label: '헬스장',   emoji: '💪' },
  university:  { label: '대학교',   emoji: '🎓' },
  subway:      { label: '지하철',   emoji: '🚇' },
  police:      { label: '경찰서',   emoji: '🚔' },
  optionCount: { label: '풀옵션',   emoji: '📦' },
  size:        { label: '방 넓이',  emoji: '📏' },
  floor:       { label: '층수',     emoji: '🏢' },
  roomLoft:    { label: '구조',     emoji: '🌙' },
  fireStation: { label: '소방서',   emoji: '🔥' },
  admin:       { label: '행정시설', emoji: '📄' },
}

export default function ResultModal({ personality, importanceMap, preferTwoRoom, listings, onClose }) {
  // 중요도 내림차순 정렬 (전체 표시)
  const priorities = Object.entries(importanceMap)
    .map(([key, avg]) => ({ key, avg, ...(POI_META[key] ?? { label: key, emoji: '📍' }) }))
    .sort((a, b) => b.avg - a.avg)

  const topListings = (listings ?? []).filter(l => l.matchScore >= 0.8).slice(0, 3)

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.badge}>🎯 성향 분석 완료</div>
        <p className={styles.title}>{personality}</p>

        {/* 우선순위 바 */}
        {priorities.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>항목별 중요도</div>
            <div className={styles.priorityList}>
              {priorities.map(({ key, avg, label, emoji }) => (
                <div key={key} className={styles.priorityRow}>
                  <span className={styles.priorityEmoji}>{emoji}</span>
                  <span className={styles.priorityName}>{label}</span>
                  <div className={styles.barWrap}>
                    <div
                      className={`${styles.bar} ${avg >= 4 ? styles.barHigh : ''}`}
                      style={{ width: `${(avg / 5) * 100}%` }}
                    />
                  </div>
                  <span className={styles.priorityScore}>{avg.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 방 종류 선호 */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>선호 방 종류</div>
          <div className={styles.roomBadges}>
            <div className={`${styles.roomBadge} ${!preferTwoRoom ? styles.roomBadgeActive : ''}`}>
              <span className={styles.roomBadgeEmoji}>🛏</span>원룸
            </div>
            <div className={`${styles.roomBadge} ${preferTwoRoom ? styles.roomBadgeActive : ''}`}>
              <span className={styles.roomBadgeEmoji}>🏠</span>투룸
            </div>
          </div>
        </div>

        {/* 상위 추천 매물 */}
        {topListings.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>AI 추천 TOP {topListings.length}</div>
            <div className={styles.topList}>
              {topListings.map((l, i) => (
                <div key={l.id} className={styles.topItem}>
                  <span className={styles.topRank}>{i + 1}</span>
                  <div className={styles.topInfo}>
                    <span className={styles.topName}>{l.name}</span>
                    <span className={styles.topPrice}>월세 {l.monthly}만 · 보증금 {l.deposit}만</span>
                  </div>
                  <span className={styles.topRoom}>{l.room}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 매칭 매물 수 */}
        <div className={styles.matchBox}>
          <span className={styles.matchText}>조건에 맞는 추천 매물</span>
          <span className={styles.matchCount}>{(listings ?? []).length}개</span>
        </div>

        <button className={styles.btnConfirm} onClick={onClose}>
          추천 매물 보러가기 →
        </button>
      </div>
    </div>
  )
}
