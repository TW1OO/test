import styles from './ListingDetailModal.module.css'

export default function ListingDetailModal({ listing, rank, poiMarkers, onClose, onOpenDetail }) {
  return (
    <div className={styles.modal} onClick={onOpenDetail} style={{ cursor: 'pointer' }}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.rankBadge}>{rank}위</span>
          <span className={styles.name}>{listing.name}</span>
          <span className={styles.room}>{listing.room}</span>
        </div>
        <button className={styles.btnClose} onClick={e => { e.stopPropagation(); onClose() }}>✕</button>
      </div>

      <div className={styles.price}>
        월세 {listing.monthly}만 · 보증금 {listing.deposit}만
      </div>

      {listing.address && (
        <div className={styles.address}>{listing.address}</div>
      )}

      {poiMarkers.length > 0 && (
        <div className={styles.poiList}>
          <div className={styles.poiHeader}>주변 중요 시설</div>
          {poiMarkers.map((p, i) => (
            <div key={i} className={styles.poiRow}>
              <span className={styles.poiEmoji}>{p.emoji}</span>
              <span className={styles.poiName}>{p.name ?? p.label}</span>
              <span className={styles.poiDist}>{p.dist}m</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
