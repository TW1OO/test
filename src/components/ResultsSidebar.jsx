import styles from './ResultsSidebar.module.css'

export default function ResultsSidebar({
  listings, activeId, isOpen, onToggle, onCardClick, personality, onRetake,
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
                <div
                  key={l.id}
                  className={`${styles.card} ${l.id === activeId ? styles.cardActive : ''}`}
                  onClick={() => onCardClick(l.id)}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.cardName}>{l.name}</span>
                    <div className={styles.cardBadges}>
                      <span className={styles.rankBadge}>{i + 1}위</span>
                      <span className={styles.cardRoom}>{l.room}</span>
                    </div>
                  </div>
                  <div className={styles.cardPrice}>
                    월세 {l.monthly}만 · 보증금 {l.deposit}만
                  </div>
                  <div className={styles.cardTags}>
                    {l.tags?.map(t => (
                      <span key={t} className={styles.tag}>{t}</span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
