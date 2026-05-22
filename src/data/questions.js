export const ALL_QUESTIONS = [

  // 옵션형
  {
    id: 'q_option_count',
    text: '나는 몸만 들어가서 살고 싶다',
    emoji: '🧺',
    filterKey: 'optionCount',
    direction: 1,
    type: 'yesno',
  },
  {
    id: 'q_option_full',
    text: '나는 풀옵션 방이 좋다',
    emoji: '📦',
    filterKey: 'optionCount',
    direction: 1,
    type: 'yesno',
  },

  // 구조형
  {
    id: 'q_room_type_1',
    text: '나는 작업 공간과 휴식 공간을 분리하는 편이다',
    emoji: '🏠',
    filterKey: 'roomType',
    direction: 1,
    type: 'yesno',
  },
  {
    id: 'q_room_type_2',
    text: '나는 집에서도 집중할 공간이 필요하다',
    emoji: '💻',
    filterKey: 'roomType',
    direction: 1,
    type: 'yesno',
  },
  {
    id: 'q_room_type_3',
    text: '나는 공간이 분리된 집이 좋다',
    emoji: '🛋️',
    filterKey: 'roomType',
    direction: 1,
    type: 'yesno',
  },

  {
    id: 'q_size_1',
    text: '나는 방이 넓은 게 중요하다',
    emoji: '📏',
    filterKey: 'size',
    direction: 1,
    type: 'scale5',
  },
  {
    id: 'q_size_2',
    text: '나는 답답한 공간이 싫다',
    emoji: '🧘',
    filterKey: 'size',
    direction: 1,
    type: 'scale5',
  },
  {
    id: 'q_size_3',
    text: '나는 친구들을 자주 집에 부르는 편이다',
    emoji: '👥',
    filterKey: 'size',
    direction: 1,
    type: 'scale5',
  },

  {
    id: 'q_floor',
    text: '나는 계단 오르기가 귀찮다',
    emoji: '🛗',
    filterKey: 'floor',
    direction: 1,
    type: 'scale5',
  },

  {
    id: 'q_room_loft',
    text: '불편하더라도 낭만을 추구한다',
    emoji: '🌙',
    filterKey: 'roomLoft',
    direction: 1,
    type: 'scale5',
  },

  // 안전형
  {
    id: 'q_police_1',
    text: '나는 늦은 시간에 귀가하는 경우가 많다',
    emoji: '🌃',
    filterKey: 'police',
    direction: 1,
    type: 'scale5',
  },
  {
    id: 'q_police_2',
    text: '나는 어두운 골목길이 무섭다',
    emoji: '🚨',
    filterKey: 'police',
    direction: 1,
    type: 'scale5',
  },

  {
    id: 'q_fire',
    text: '나는 안전 시설에 민감한 편이다',
    emoji: '🔥',
    filterKey: 'fireStation',
    direction: 1,
    type: 'scale5',
  },

  {
    id: 'q_police_3',
    text: '나는 안전 시설에 민감한 편이다',
    emoji: '🚓',
    filterKey: 'police',
    direction: 1,
    type: 'scale5',
  },

  // 생활 편의형
  {
    id: 'q_gym_1',
    text: '나는 운동을 좋아한다',
    emoji: '💪',
    filterKey: 'gym',
    direction: 1,
    type: 'scale5',
  },
  {
    id: 'q_gym_2',
    text: '나는 자주 운동하러 간다',
    emoji: '🏋️',
    filterKey: 'gym',
    direction: 1,
    type: 'scale5',
  },

  {
    id: 'q_conv_1',
    text: '나는 술을 즐긴다',
    emoji: '🍺',
    filterKey: 'conv',
    direction: 1,
    type: 'scale5',
  },
  {
    id: 'q_conv_2',
    text: '나는 야식을 자주 먹는다',
    emoji: '🍜',
    filterKey: 'conv',
    direction: 1,
    type: 'scale5',
  },

  {
    id: 'q_mart_1',
    text: '나는 요리를 자주 해먹는다',
    emoji: '🛒',
    filterKey: 'mart',
    direction: 1,
    type: 'scale5',
  },
  {
    id: 'q_mart_2',
    text: '나는 직접 해먹는 걸 좋아한다',
    emoji: '🍳',
    filterKey: 'mart',
    direction: 1,
    type: 'scale5',
  },

  {
    id: 'q_hospital_1',
    text: '나는 건강관리를 중요하게 생각한다',
    emoji: '🏥',
    filterKey: 'hospital',
    direction: 1,
    type: 'scale5',
  },
  {
    id: 'q_hospital_2',
    text: '나는 몸이 자주 아프다',
    emoji: '🤒',
    filterKey: 'hospital',
    direction: 1,
    type: 'scale5',
  },

  // 통학 / 이동형
  {
    id: 'q_university',
    text: '나는 동아대학교 학생이다',
    emoji: '🎓',
    filterKey: 'university',
    direction: 1,
    type: 'yesno',
  },

  {
    id: 'q_subway_bus_1',
    text: '나는 대중교통 이용이 많다',
    emoji: '🚇',
    filterKey: 'subway',
    direction: 1,
    type: 'scale5',
  },
  {
    id: 'q_subway_bus_2',
    text: '나는 이동 시간을 줄이고 싶다',
    emoji: '⏰',
    filterKey: 'subway',
    direction: 1,
    type: 'scale5',
  },
  {
    id: 'q_walk',
    text: '나는 걷는 걸 좋아하는 편이다',
    emoji: '🚶',
    filterKey: 'subway',
    direction: -1,
    type: 'scale5',
  },

  // 행정형
  {
    id: 'q_admin_1',
    text: '나는 서류 업무를 빠르게 해결하고 싶다',
    emoji: '📄',
    filterKey: 'admin',
    direction: 1,
    type: 'scale5',
  },
  {
    id: 'q_admin_2',
    text: '나는 행정 업무를 자주 처리하는 편이다',
    emoji: '🏢',
    filterKey: 'admin',
    direction: 1,
    type: 'scale5',
  },
]

// 테스트용: 매 세션마다 서로 다른 filterKey를 가진 5문항 랜덤 선택
export function getTestQuestions() {
  const shuffled = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5)
  const seen = new Set()
  const result = []
  for (const q of shuffled) {
    if (!seen.has(q.filterKey)) {
      seen.add(q.filterKey)
      result.push(q)
    }
    if (result.length === 5) break
  }
  return result
}

// 검사용: filterKey당 최대 2개, 총 15문항 랜덤 선택
export function getFullQuestions() {
  const shuffled = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5)
  const keyCount = {}
  const result = []
  for (const q of shuffled) {
    const c = keyCount[q.filterKey] ?? 0
    if (c < 2) {
      keyCount[q.filterKey] = c + 1
      result.push(q)
    }
    if (result.length === 15) break
  }
  return result
}
