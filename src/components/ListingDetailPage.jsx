import styles from './ListingDetailPage.module.css'

const POI_KEYS = new Set(['conv','mart','hospital','cafe','gym','university','subway','police'])

const KEY_META = {
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

function getNonPoiDesc(key, listing) {
  if (key === 'optionCount') return `옵션 ${listing.options?.length ?? 0}개 구비`
  if (key === 'size')        return `${listing.area}평 규모`
  if (key === 'floor')       return '층수 선호 반영됨'
  if (key === 'fireStation') return '안전 시설 선호 반영됨'
  if (key === 'admin')       return '행정 편의 선호 반영됨'
  if (key === 'roomLoft')    return '구조 선호 반영됨'
  return '선호 반영됨'
}

function distLabel(dist) {
  if (dist <= 300) return '매우 가깝'
  if (dist <= 700) return '가까움'
  return '적정 거리'
}

export default function ListingDetailPage({ listing, rank, poiMarkers = [], importanceMap = {}, onClose }) {
  // 중요도 3점 이상의 비-POI 항목 (poiMarkers에 없는 것들)
  const nonPoiReasons = Object.entries(importanceMap)
    .filter(([key, avg]) => avg >= 3 && !POI_KEYS.has(key))
    .sort((a, b) => b[1] - a[1])
  return (
    <div className={styles.page}>
      {/* 상단 헤더 */}
      <div className={styles.header}>
        <button className={styles.btnBack} onClick={onClose}>← 뒤로</button>
        <span className={styles.rankBadge}>{rank}위 추천</span>
      </div>

      {/* 사진 공간 */}
      <div className={styles.photoArea}>
        <span className={styles.photoIcon}>📷</span>
        <span className={styles.photoHint}>사진 준비 중</span>
      </div>

      {/* 기본 정보 */}
      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h2 className={styles.name}>
            {listing.name}
            <span className={styles.roomBadge}>{listing.room}</span>
          </h2>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>평수</span>
            <span className={styles.infoValue}>{listing.area}평</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>월세</span>
            <span className={styles.infoValue}>{listing.monthly}만원</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>보증금</span>
            <span className={styles.infoValue}>{listing.deposit}만원</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>전화</span>
            <span className={styles.infoValue}>{listing.phone}</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.section}>
          <div className={styles.sectionLabel}>주소</div>
          <div className={styles.sectionValue}>{listing.address ?? '주소 정보 없음'}</div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionLabel}>옵션 ({listing.options?.length ?? 0}개)</div>
          <div className={styles.optionList}>
            {listing.options?.map(opt => (
              <span key={opt} className={styles.optionTag}>{opt}</span>
            ))}
          </div>
        </div>

        {/* 추천 이유 */}
        <div className={styles.reasonBox}>
          <div className={styles.reasonTitle}>🎯 이 매물이 추천된 이유</div>
          <div className={styles.reasonScore}>
            AI 일치도 <strong>{Math.round((listing.matchScore ?? 0) * 100)}%</strong>
          </div>

          {(poiMarkers.length > 0 || nonPoiReasons.length > 0) ? (
            <div className={styles.reasonList}>
              {/* POI 항목 */}
              {poiMarkers.map((p, i) => (
                <div key={`poi-${i}`} className={styles.reasonRow}>
                  <span className={styles.reasonEmoji}>{p.emoji}</span>
                  <div className={styles.reasonInfo}>
                    <span className={styles.reasonName}>{p.name ?? p.label}</span>
                    <span className={styles.reasonSub}>{p.label} · {p.dist}m 거리</span>
                  </div>
                  <span className={styles.reasonDist}>{distLabel(p.dist)}</span>
                </div>
              ))}
              {/* 비-POI 항목 (가격, 평수, 층수 등) */}
              {nonPoiReasons.map(([key]) => {
                const meta = KEY_META[key] ?? { label: key, emoji: '📍' }
                return (
                  <div key={`non-${key}`} className={styles.reasonRow}>
                    <span className={styles.reasonEmoji}>{meta.emoji}</span>
                    <div className={styles.reasonInfo}>
                      <span className={styles.reasonName}>{meta.label}</span>
                      <span className={styles.reasonSub}>{getNonPoiDesc(key, listing)}</span>
                    </div>
                    <span className={`${styles.reasonDist} ${styles.reasonDistSoft}`}>선호 반영</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className={styles.reasonEmpty}>설문에서 선택한 중요 시설과 가까운 매물이에요.</p>
          )}
        </div>
      </div>
    </div>
  )
}
