import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'

const app = express()
app.use(cors())
app.use(express.json())

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a Korean real estate search query parser.
Given a Korean search query, identify which location conditions are mentioned and whether they are connected with AND or OR logic.

Korean AND indicators: ~고, ~이고, ~가깝고, ~근처이고, 그리고, 및, ~하고, ~이면서
Korean OR indicators: ~거나, ~이거나, ~가깝거나, 또는, 혹은, ~하거나

Available filter keys (only include ones actually mentioned):
- "conv": 편의점, CU, GS25, 세븐일레븐, 이마트24
- "subway": 지하철, 지하철역, 전철
- "mart": 마트, 대형마트, 이마트, 홈플러스, 롯데마트
- "bus": 버스, 버스정류장, 정류장
- "police": 경찰서, 경찰, 지구대, 파출소
- "hospital": 병원, 의원, 클리닉, 응급실
- "cafe": 카페, 커피, 스타벅스, 이디야, 메가커피
- "university": 대학교, 대학, 캠퍼스, 동아대, 동아대학교

Rules:
- operator is "AND" when conditions are combined with ~고/그리고/및/이면서
- operator is "OR" when conditions are combined with ~거나/또는/혹은
- If only one condition, operator defaults to "AND"
- Return ONLY valid JSON, no explanation

Example output: {"operator":"AND","filters":["hospital","cafe"]}`

app.post('/api/parse-query', async (req, res) => {
  const { query } = req.body
  if (!query?.trim()) return res.json({ operator: 'AND', filters: [] })

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: query }],
    })

    const text = message.content[0].text.trim()
    const parsed = JSON.parse(text)
    res.json(parsed)
  } catch (err) {
    console.error('[parse-query error]', err.message)
    res.status(500).json({ error: 'parse failed' })
  }
})

const BUDGET_SYSTEM_PROMPT = `You are a Korean real estate preference extractor.
Given a Korean natural language input about housing preferences, extract the following and return ONLY valid JSON:

- maxMonthly: Maximum monthly rent in 만원 (integer, null if not mentioned)
- maxDeposit: Maximum deposit in 만원 (integer, null if not mentioned)
- preferTwoRoom: true if they prefer 투룸, false if 원룸, null if not mentioned
- poiBoosts: Object mapping facility keys to importance 1~5 based on how strongly they want proximity.
  Use 5 for strong need ("꼭 필요", "중요"), 4 for clear preference, 3 for mild mention.
  Available keys: conv, subway, mart, police, hospital, cafe, gym, university

Example input: "나는 월세 40만원 이하를 원하고 경찰서와 가까우면 좋겠어"
Example output: {"maxMonthly":40,"maxDeposit":null,"preferTwoRoom":null,"poiBoosts":{"police":5}}

Return ONLY valid JSON, no explanation.`

app.post('/api/parse-budget', async (req, res) => {
  const { text } = req.body
  if (!text?.trim()) return res.json({ maxMonthly: null, maxDeposit: null, preferTwoRoom: null, poiBoosts: {} })

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: BUDGET_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: text }],
    })

    const parsed = JSON.parse(message.content[0].text.trim())
    res.json(parsed)
  } catch (err) {
    console.error('[parse-budget error]', err.message)
    res.status(500).json({ error: 'parse failed' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Parse server → http://localhost:${PORT}`))
