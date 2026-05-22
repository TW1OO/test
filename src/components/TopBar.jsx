import styles from './TopBar.module.css'

export default function TopBar({ query, onChange, onSearch, isParsing }) {
  return (
    <header className={styles.topBar}>
      <span className={styles.icon}>{isParsing ? '⏳' : '🔍'}</span>
      <input
        className={styles.input}
        type="text"
        placeholder="예) 병원이 가깝고 카페 근처인 원룸"
        value={query}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && !isParsing && onSearch()}
        disabled={isParsing}
      />
      <button className={styles.btn} onClick={onSearch} disabled={isParsing}>
        {isParsing ? '분석 중…' : '검색'}
      </button>
    </header>
  )
}
