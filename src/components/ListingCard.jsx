import styles from './ListingCard.module.css'

export default function ListingCard({ listing, rank, isActive, onClick }) {
  return (
    <div
      className={`${styles.card} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      <div className={styles.rank}>{rank}</div>
      <div className={styles.name}>{listing.name}</div>
      <div className={styles.highlight}>
        🏪 편의점({listing.convName})까지 단 {listing.convDist}m!
      </div>
      <div className={styles.tags}>
        {listing.tags.map(t => (
          <span key={t} className={styles.tag}>{t}</span>
        ))}
        <span className={styles.tag}>🚇 {listing.subwayDist}m</span>
        <span className={styles.tag}>🚌 {listing.busDist}m</span>
      </div>
      <div className={styles.price}>
        월세 <strong>{listing.monthly}만</strong>
        <span> / 보증금 {listing.deposit}만</span>
      </div>
    </div>
  )
}
