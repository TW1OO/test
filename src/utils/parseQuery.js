/**
 * LLM 서버에 쿼리를 보내 AND/OR 조건과 필터 목록을 파싱합니다.
 * 서버 오류 시 키워드 기반 폴백을 반환합니다.
 *
 * @param {string} query
 * @param {import('../App').FilterDefinition[]} filterDefs
 * @returns {Promise<{ operator: 'AND'|'OR', filters: string[] }>}
 */
export async function parseQuery(query, filterDefs) {
  try {
    const res = await fetch('http://localhost:3001/api/parse-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    if (!res.ok) throw new Error(`status ${res.status}`)
    return await res.json()
  } catch {
    // 서버 없을 때 키워드 기반 폴백
    const lower = query.toLowerCase()
    const filters = filterDefs
      .filter(def => def.keywords.some(kw => lower.includes(kw)))
      .map(def => def.key)
    const operator = /거나|또는|혹은/.test(query) ? 'OR' : 'AND'
    return { operator, filters }
  }
}
