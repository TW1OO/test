import styles from './FilterSlider.module.css'

function formatValue(value) {
  return value >= 1000
    ? (value / 1000).toFixed(1).replace(/\.0$/, '') + 'km내'
    : value + 'm내'
}

export default function FilterSlider({ label, min, max, value, onChange }) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <div className={styles.sliderWrapper}>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          style={{ '--pct': `${pct}%` }}
          onChange={e => onChange(Number(e.target.value))}
        />
      </div>
      <span className={styles.value}>{formatValue(value)}</span>
    </div>
  )
}
