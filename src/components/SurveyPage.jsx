import { useState, useEffect } from 'react'
import { TEST_QUESTIONS, FULL_QUESTIONS } from '../data/questions'
import styles from './SurveyPage.module.css'

const SCALE_LABELS = ['전혀\n아니다', '아니다', '보통\n이다', '그렇다', '매우\n그렇다']

export default function SurveyPage({ onComplete }) {
  const [stage, setStage]           = useState('landing')  // 'landing' | 'budget' | 'survey'
  const [mode, setMode]             = useState(null)
  const [step, setStep]             = useState(1)
  const [answers, setAnswers]       = useState({})
  const [budgetText, setBudgetText] = useState('')
  const [budgetData, setBudgetData] = useState(null)
  const [budgetLoading, setBudgetLoading] = useState(false)

  const questions = mode === 'test' ? TEST_QUESTIONS : FULL_QUESTIONS
  const current   = stage === 'survey' ? questions[step - 1] : null
  const isLast    = step === questions?.length

  function startSurvey(selectedMode) {
    setMode(selectedMode)
    setAnswers({})
    setStage('budget')
  }

  async function handleBudgetNext() {
    if (budgetText.trim()) {
      setBudgetLoading(true)
      try {
        const res = await fetch('/api/parse-budget', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: budgetText }),
        })
        const data = await res.json()
        setBudgetData(data)
      } catch {
        // API 실패 시 budget 없이 진행
      }
      setBudgetLoading(false)
    }
    setStage('survey')
    setStep(1)
  }

  function handleAnswer(id, value) {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }

  function handleNext() {
    if (!isLast) {
      setStep(s => s + 1)
    } else {
      onComplete(answers, questions, budgetData)
    }
  }

  function handlePrev() {
    if (step > 1) setStep(s => s - 1)
    else { setStage('budget') }
  }

  // budget 단계에서 Enter → 다음
  useEffect(() => {
    if (stage !== 'budget') return
    function onKey(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleBudgetNext() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [stage, budgetText])

  // 키보드 단축키: yesno는 Y/N, scale은 1~5 / Enter 다음
  useEffect(() => {
    if (!current) return
    function onKey(e) {
      if (current.type === 'yesno') {
        if (e.key === 'y' || e.key === 'Y') handleAnswer(current.id, 1)
        if (e.key === 'n' || e.key === 'N') handleAnswer(current.id, 0)
      } else {
        if (['1','2','3','4','5'].includes(e.key)) handleAnswer(current.id, Number(e.key))
      }
      if (e.key === 'Enter' && answers[current.id] != null) handleNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, answers])

  // ── 랜딩 화면 ──
  if (stage === 'landing') {
    return (
      <div className={styles.root}>
        <div className={styles.card}>
          <div className={styles.landingEmoji}>🏠</div>
          <h1 className={styles.landingTitle}>나에게 맞는 원룸 찾기</h1>
          <p className={styles.landingDesc}>
            몇 가지 질문으로 당신의 생활 성향을 파악하고<br />
            딱 맞는 매물을 추천해 드릴게요.
          </p>
          <div className={styles.modeButtons}>
            <button className={styles.btnTest} onClick={() => startSurvey('test')}>
              <span className={styles.btnModeLabel}>⚡ 테스트용</span>
              <span className={styles.btnModeSub}>5문항 · 1분</span>
            </button>
            <button className={styles.btnFull} onClick={() => startSurvey('full')}>
              <span className={styles.btnModeLabel}>🔍 정밀 검사</span>
              <span className={styles.btnModeSub}>10문항 · 3분</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── 예산 입력 화면 ──
  if (stage === 'budget') {
    return (
      <div className={styles.root}>
        <div className={styles.surveyCard}>
          <div className={styles.qEmoji}>💬</div>
          <p className={styles.qText}>당신이 원하는 방과 예산안은?</p>
          <textarea
            className={styles.budgetTextarea}
            value={budgetText}
            onChange={e => setBudgetText(e.target.value)}
            placeholder="예) 나는 월세 40만원 이하를 원하고 경찰서와 가까우면 좋겠어"
            rows={4}
            disabled={budgetLoading}
          />
          <div className={styles.nav}>
            <button className={styles.btnPrev} onClick={() => setStage('landing')} disabled={budgetLoading}>
              ← 이전
            </button>
            <button className={styles.btnNext} onClick={handleBudgetNext} disabled={budgetLoading}>
              {budgetLoading ? '분석 중…' : '다음 →'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── 설문 화면 ──
  const progress  = ((step - 1) / questions.length) * 100
  const answered  = answers[current.id]

  return (
    <div className={styles.root}>
      <div className={styles.surveyCard}>
        {/* 진행 바 */}
        <div className={styles.progressWrap}>
          <div className={styles.progressBar} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.stepLabel}>{step} / {questions.length}</div>

        {/* 문항 */}
        <div className={styles.qEmoji}>{current.emoji}</div>
        <p className={styles.qText}>{current.text}</p>

        {/* 응답 버튼: yesno / 5점 척도 */}
        {current.type === 'yesno' ? (
          <div className={styles.yesnoWrap}>
            <button
              className={`${styles.yesnoBtn} ${styles.yesBtnColor} ${answered === 1 ? styles.scaleBtnActive : ''}`}
              onClick={() => handleAnswer(current.id, 1)}
            >
              <span className={styles.scaleNum}>예</span>
              <span className={styles.scaleLabel}>Y</span>
            </button>
            <button
              className={`${styles.yesnoBtn} ${styles.noBtnColor} ${answered === 0 ? styles.scaleBtnActive : ''}`}
              onClick={() => handleAnswer(current.id, 0)}
            >
              <span className={styles.scaleNum}>아니오</span>
              <span className={styles.scaleLabel}>N</span>
            </button>
          </div>
        ) : (
          <div className={styles.scale}>
            {[1, 2, 3, 4, 5].map(v => (
              <button
                key={v}
                className={`${styles.scaleBtn} ${answered === v ? styles.scaleBtnActive : ''}`}
                onClick={() => handleAnswer(current.id, v)}
              >
                <span className={styles.scaleNum}>{v}</span>
                <span className={styles.scaleLabel}>{SCALE_LABELS[v - 1]}</span>
              </button>
            ))}
          </div>
        )}

        {/* 이전 / 다음 */}
        <div className={styles.nav}>
          <button className={styles.btnPrev} onClick={handlePrev}>← 이전</button>
          <button
            className={styles.btnNext}
            onClick={handleNext}
            disabled={answered == null}
          >
            {isLast ? '결과 보기 →' : '다음 →'}
          </button>
        </div>
      </div>
    </div>
  )
}
