import styles from './ListingCard.module.css'

export default function ListingCard({ listing, rank, isActive, topPoi, onClick }) {
  return (
    <div
      className={`${styles.card} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      <div className={styles.rank}>{rank}</div>
      <div className={styles.name}>{listing.name}</div>
      {topPoi && (
        <div className={styles.highlight}>
          {topPoi.emoji} {topPoi.label}({topPoi.name})까지 {topPoi.dist}m
        </div>
      )}
      <div className={styles.tags}>
        {listing.tags?.map(t => (
          <span key={t} className={styles.tag}>{t}</span>
        ))}
        <span className={styles.tag}>{listing.room}</span>
        <span className={styles.tag}>월세 {listing.monthly}만</span>
      </div>
      <div className={styles.price}>
        월세 <strong>{listing.monthly}만</strong>
        <span> / 보증금 {listing.deposit}만</span>
      </div>
    </div>
  )
}
