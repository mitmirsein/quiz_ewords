// config.js

const DifficultyLevel = {
    BEGINNER: '초급',
    INTERMEDIATE: '중급',
    ADVANCED: '고급',
};

const LEVEL_ORDER = [
    DifficultyLevel.BEGINNER,
    DifficultyLevel.INTERMEDIATE,
    DifficultyLevel.ADVANCED,
];

const QUESTIONS_PER_QUIZ = 20;
const OPTIONS_COUNT = 4;
const LEVEL_UP_THRESHOLD_PERCENTAGE = 70;