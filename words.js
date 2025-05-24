// words.js

// 난이도 수준을 정의하는 객체
const DifficultyLevel = {
    BEGINNER: '초급',
    INTERMEDIATE: '중급',
    ADVANCED: '고급',
};

// 퀴즈 레벨 순서를 정의하는 배열
const LEVEL_ORDER = [
    DifficultyLevel.BEGINNER,
    DifficultyLevel.INTERMEDIATE,
    DifficultyLevel.ADVANCED,
];

// 영어 단어 데이터 배열
const WORDS_DATA = [
    // 초급 (Beginner)
    { id: 'b_1', english: 'attitude', korean: '태도', level: DifficultyLevel.BEGINNER },
    { id: 'b_2', english: 'behavior', korean: '행동', level: DifficultyLevel.BEGINNER },
    { id: 'b_3', english: 'community', korean: '공동체', level: DifficultyLevel.BEGINNER },
    { id: 'b_4', english: 'curious', korean: '호기심 있는', level: DifficultyLevel.BEGINNER },
    { id: 'b_5', english: 'develop', korean: '발전시키다', level: DifficultyLevel.BEGINNER },
    { id: 'b_6', english: 'emotional', korean: '감정적인', level: DifficultyLevel.BEGINNER },
    { id: 'b_7', english: 'fantastic', korean: '환상적인', level: DifficultyLevel.BEGINNER },
    { id: 'b_8', english: 'global', korean: '세계적인', level: DifficultyLevel.BEGINNER },
    { id: 'b_9', english: 'imagine', korean: '상상하다', level: DifficultyLevel.BEGINNER },
    { id: 'b_10', english: 'journey', korean: '여행', level: DifficultyLevel.BEGINNER },
    { id: 'b_11', english: 'knowledge', korean: '지식', level: DifficultyLevel.BEGINNER },
    { id: 'b_12', english: 'leadership', korean: '지도력', level: DifficultyLevel.BEGINNER },
    { id: 'b_13', english: 'memory', korean: '기억', level: DifficultyLevel.BEGINNER },
    { id: 'b_14', english: 'natural', korean: '자연의', level: DifficultyLevel.BEGINNER },
    { id: 'b_15', english: 'opinion', korean: '의견', level: DifficultyLevel.BEGINNER },
    { id: 'b_16', english: 'physical', korean: '신체의', level: DifficultyLevel.BEGINNER },
    { id: 'b_17', english: 'quality', korean: '질', level: DifficultyLevel.BEGINNER },
    { id: 'b_18', english: 'relationship', korean: '관계', level: DifficultyLevel.BEGINNER },
    { id: 'b_19', english: 'solution', korean: '해결책', level: DifficultyLevel.BEGINNER },
    { id: 'b_20', english: 'tradition', korean: '전통', level: DifficultyLevel.BEGINNER },
    { id: 'b_21', english: 'unique', korean: '독특한', level: DifficultyLevel.BEGINNER },
    { id: 'b_22', english: 'valuable', korean: '가치 있는', level: DifficultyLevel.BEGINNER },
    { id: 'b_23', english: 'wisdom', korean: '지혜', level: DifficultyLevel.BEGINNER },
    { id: 'b_24', english: 'explore', korean: '탐험하다', level: DifficultyLevel.BEGINNER },
    { id: 'b_25', english: 'create', korean: '창조하다', level: DifficultyLevel.BEGINNER },
    { id: 'b_26', english: 'challenge', korean: '도전', level: DifficultyLevel.BEGINNER },
    { id: 'b_27', english: 'achieve', korean: '성취하다', level: DifficultyLevel.BEGINNER },
    { id: 'b_28', english: 'improve', korean: '향상시키다', level: DifficultyLevel.BEGINNER },
    { id: 'b_29', english: 'inspire', korean: '영감을 주다', level: DifficultyLevel.BEGINNER },
    { id: 'b_30', english: 'respect', korean: '존경하다', level: DifficultyLevel.BEGINNER },

    // 중급 (Intermediate)
    { id: 'i_1', english: 'activity', korean: '활동', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_2', english: 'answer', korean: '답하다, 답', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_3', english: 'believe', korean: '믿다', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_4', english: 'character', korean: '인물, 성격', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_5', english: 'different', korean: '다른', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_6', english: 'environment', korean: '환경', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_7', english: 'experience', korean: '경험', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_8', english: 'favorite', korean: '가장 좋아하는', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_9', english: 'government', korean: '정부', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_10', english: 'history', korean: '역사', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_11', english: 'important', korean: '중요한', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_12', english: 'information', korean: '정보', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_13', english: 'interesting', korean: '흥미로운', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_14', english: 'language', korean: '언어', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_15', english: 'medicine', korean: '약, 의학', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_16', english: 'necessary', korean: '필요한', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_17', english: 'opportunity', korean: '기회', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_18', english: 'popular', korean: '인기 있는', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_19', english: 'problem', korean: '문제', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_20', english: 'question', korean: '질문', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_21', english: 'remember', korean: '기억하다', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_22', english: 'restaurant', korean: '식당', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_23', english: 'science', korean: '과학', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_24', english: 'society', korean: '사회', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_25', english: 'successful', korean: '성공한', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_26', english: 'technology', korean: '기술', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_27', english: 'university', korean: '대학교', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_28', english: 'vacation', korean: '휴가', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_29', english: 'volunteer', korean: '자원봉사자', level: DifficultyLevel.INTERMEDIATE },
    { id: 'i_30', english: 'weather', korean: '날씨', level: DifficultyLevel.INTERMEDIATE },

    // 고급 (Advanced)
    { id: 'a_1', english: 'accomplish', korean: '성취하다', level: DifficultyLevel.ADVANCED },
    { id: 'a_2', english: 'agriculture', korean: '농업', level: DifficultyLevel.ADVANCED },
    { id: 'a_3', english: 'appreciate', korean: '감사하다, 인정하다', level: DifficultyLevel.ADVANCED },
    { id: 'a_4', english: 'bibliography', korean: '참고문헌', level: DifficultyLevel.ADVANCED },
    { id: 'a_5', english: 'circumstance', korean: '상황, 환경', level: DifficultyLevel.ADVANCED },
    { id: 'a_6', english: 'communication', korean: '의사소통', level: DifficultyLevel.ADVANCED },
    { id: 'a_7', english: 'competitive', korean: '경쟁적인', level: DifficultyLevel.ADVANCED },
    { id: 'a_8', english: 'consequence', korean: '결과', level: DifficultyLevel.ADVANCED },
    { id: 'a_9', english: 'democracy', korean: '민주주의', level: DifficultyLevel.ADVANCED },
    { id: 'a_10', english: 'economy', korean: '경제', level: DifficultyLevel.ADVANCED },
    { id: 'a_11', english: 'education', korean: '교육', level: DifficultyLevel.ADVANCED },
    { id: 'a_12', english: 'extraordinary', korean: '특별한', level: DifficultyLevel.ADVANCED },
    { id: 'a_13', english: 'generation', korean: '세대', level: DifficultyLevel.ADVANCED },
    { id: 'a_14', english: 'independent', korean: '독립적인', level: DifficultyLevel.ADVANCED },
    { id: 'a_15', english: 'knowledge', korean: '지식', level: DifficultyLevel.ADVANCED }, 
    { id: 'a_16', english: 'literature', korean: '문학', level: DifficultyLevel.ADVANCED },
    { id: 'a_17', english: 'manufacturing', korean: '제조업', level: DifficultyLevel.ADVANCED },
    { id: 'a_18', english: 'neighborhood', korean: '이웃', level: DifficultyLevel.ADVANCED },
    { id: 'a_19', english: 'organization', korean: '조직', level: DifficultyLevel.ADVANCED },
    { id: 'a_20', english: 'participate', korean: '참여하다', level: DifficultyLevel.ADVANCED },
    { id: 'a_21', english: 'personality', korean: '성격', level: DifficultyLevel.ADVANCED },
    { id: 'a_22', english: 'responsibility', korean: '책임', level: DifficultyLevel.ADVANCED },
    { id: 'a_23', english: 'situation', korean: '상황', level: DifficultyLevel.ADVANCED },
    { id: 'a_24', english: 'temperature', korean: '온도', level: DifficultyLevel.ADVANCED },
    { id: 'a_25', english: 'traditional', korean: '전통적인', level: DifficultyLevel.ADVANCED },
    { id: 'a_26', english: 'transportation', korean: '교통', level: DifficultyLevel.ADVANCED },
    { id: 'a_27', english: 'unfortunately', korean: '불행히도', level: DifficultyLevel.ADVANCED },
    { id: 'a_28', english: 'vegetables', korean: '채소', level: DifficultyLevel.ADVANCED },
    { id: 'a_29', english: 'wonderful', korean: '놀라운', level: DifficultyLevel.ADVANCED },
    { id: 'a_30', english: 'yesterday', korean: '어제', level: DifficultyLevel.ADVANCED },
];

// 퀴즈 설정 상수
const QUESTIONS_PER_QUIZ = 10;
const OPTIONS_COUNT = 4;
const LEVEL_UP_THRESHOLD_PERCENTAGE = 70;