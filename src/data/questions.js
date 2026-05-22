export const ALL_QUESTIONS = [
  {
    id: 'q_conv',
    text: '나는 술을 즐긴다',
    emoji: '🍺',
    filterKey: 'conv',
    direction: 1,   // 1: 점수 높을수록 해당 POI가 가까워야 함
  },
  {
    id: 'q_mart',
    text: '나는 요리를 즐겨한다',
    emoji: '🛒',
    filterKey: 'mart',
    direction: 1,
  },
  {
    id: 'q_hospital',
    text: '나는 감기에 자주 걸린다',
    emoji: '🏥',
    filterKey: 'hospital',
    direction: 1,
  },
  {
    id: 'q_cafe',
    text: '나는 밤을 자주 샌다',
    emoji: '☕',
    filterKey: 'cafe',
    direction: 1,
  },
  {
    id: 'q_gym',
    text: '나는 운동을 좋아한다',
    emoji: '💪',
    filterKey: 'gym',
    direction: 1,
  },
  {
    id: 'q_university',
    text: '나는 동아대학교 학생이다',
    emoji: '🎓',
    filterKey: 'university',
    direction: 1,
    type: 'yesno',  // 예(1) / 아니오(0) 이진 응답
  },
  {
    id: 'q_subway',
    text: '나는 30분 거리 정도는 걸어다닌다',
    emoji: '🚶',
    filterKey: 'subway',
    direction: -1,  // -1: 점수 높을수록 해당 POI가 멀어도 됨 (역방향)
  },
  {
    id: 'q_police',
    text: '나는 안전불감증이다',
    emoji: '🚔',
    filterKey: 'police',
    direction: -1,
  },
  {
    id: 'q_room_type',
    text: '나는 작업 공간과 휴식 공간을 분리하는 편이다',
    emoji: '🏠',
    filterKey: 'roomType',
    direction: 1,
  },
  {
    id: 'q_room_loft',
    text: '불편하더라도 낭만을 추구한다',
    emoji: '🌙',
    filterKey: 'roomLoft',
    direction: 1,
  },
]

// 테스트용 5문항: 대표 문항 선정
export const TEST_QUESTIONS = [
  ALL_QUESTIONS.find(q => q.id === 'q_conv'),
  ALL_QUESTIONS.find(q => q.id === 'q_gym'),
  ALL_QUESTIONS.find(q => q.id === 'q_university'),
  ALL_QUESTIONS.find(q => q.id === 'q_subway'),
  ALL_QUESTIONS.find(q => q.id === 'q_room_type'),
]

// 검사용 10문항: 전체
export const FULL_QUESTIONS = ALL_QUESTIONS
