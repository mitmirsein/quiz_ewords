// app.js

// --- HTML 요소 참조 ---
const appContainer = document.getElementById('app-container');
const levelSelectorContainer = document.getElementById('level-selector-container');
const levelButtonsWrapper = document.getElementById('level-buttons-wrapper');
const quizViewContainer = document.getElementById('quiz-view-container');
const resultScreenContainer = document.getElementById('result-screen-container');
const resetProgressButton = document.getElementById('reset-progress-button');

// NEW: 퀴즈 모드 선택 관련 UI 요소들
const quizModeSelector = document.getElementById('quiz-mode-selector');
const selectedLevelQuizModeText = document.getElementById('selected-level-quiz-mode-text');
const startRandomQuizButton = document.getElementById('start-random-quiz-button');
const startIncorrectQuizButton = document.getElementById('start-incorrect-quiz-button');
const backToLevelSelectButton = document.getElementById('back-to-level-select-button');


// 퀴즈 뷰 내부 요소들은 quizViewContainer.innerHTML이 재설정될 수 있으므로
// renderQuestion() 또는 startQuiz() 진입 시 다시 참조를 갱신해야 합니다.
let currentLevelDisplay;
let scoreDisplay;
let progressBar;
let questionNumberDisplay;
let questionTextElement;
let optionsGrid;
let feedbackMessageElement;
let nextQuestionButton;

// 결과 화면 요소들은 화면 전환 시 다시 참조해도 되지만, HTML이 직접 변경되지 않으므로 한 번만 참조합니다.
const resultTitle = document.getElementById('result-title');
const resultLevel = document.getElementById('result-level');
const resultDetails = document.getElementById('result-details');
const resultPercentage = document.getElementById('result-percentage');
const resultScore = document.getElementById('result-score');
const resultMessage = document.getElementById('result-message');
const resultMessageIcon = document.getElementById('result-message-icon');
const resultMessageText = document.getElementById('result-message-text');
const retryQuizButton = document.getElementById('retry-quiz-button');
const proceedNextLevelButton = document.getElementById('proceed-next-level-button');
const backToLevelsButton = document.getElementById('back-to-levels-button');

// --- 상태 변수 ---
let currentQuizLevel = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let unlockedLevels = new Set();

// NEW: 정답 맞춘 문제와 틀린 문제 ID를 관리
let answeredCorrectlyWordIdsByLevel = {}; // { '초급': Set<string>, '중급': Set<string> } - 이전에 정답을 맞춘 문제 ID
let incorrectWordIdsByLevel = {};       // { '초급': Set<string>, '중급': Set<string> } - 이전에 틀렸던 문제 ID

let isAnswered = false; // 사용자가 현재 질문에 답했는지 여부

// NEW: 퀴즈 모드 상수 및 현재 퀴즈 모드 변수
const QuizMode = {
    RANDOM: 'random',
    INCORRECT_ONLY: 'incorrect_only'
};
let currentQuizMode = QuizMode.RANDOM; // 기본 모드 설정

// NEW: 퀴즈 모드 선택 시 저장할 레벨
let selectedLevelForQuizMode = null; 

// --- SVG 아이콘 (템플릿 리터럴용) ---
const svgIconCheck = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>`;
const svgIconX = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" /></svg>`;
const svgIconCheckCircleLarge = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" /></svg>`;
const svgIconXCircleLarge = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd" /></svg>`;

// --- 유틸리티 함수 ---
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// --- 화면 전환 함수 ---
function showScreen(screenToShow) {
    levelSelectorContainer.style.display = 'none';
    quizViewContainer.style.display = 'none';
    resultScreenContainer.style.display = 'none';
    quizModeSelector.style.display = 'none'; // 퀴즈 모드 선택 UI도 숨김

    screenToShow.style.display = 'block';
}

// --- 레벨 선택 화면 ---
function renderLevelSelector() {
    showScreen(levelSelectorContainer);
    levelButtonsWrapper.innerHTML = ''; // 기존 버튼 모두 제거
    levelButtonsWrapper.style.display = 'flex'; // 레벨 버튼 래퍼 다시 표시

    LEVEL_ORDER.forEach(levelName => {
        const button = document.createElement('button');
        let levelText = '';
        let levelClass = ''; 
        
        if (levelName === DifficultyLevel.BEGINNER) {
            levelText = '🌟 초급 (Level 1)';
            levelClass = 'btn-primary'; 
        } else if (levelName === DifficultyLevel.INTERMEDIATE) {
            levelText = '⚡ 중급 (Level 2)';
            levelClass = 'btn-secondary'; 
        } else if (levelName === DifficultyLevel.ADVANCED) {
            levelText = '🔥 고급 (Level 3)';
            levelClass = 'btn-success'; 
        } else {
            levelText = levelName; 
            levelClass = 'btn-primary'; 
        }

        button.innerHTML = levelText;
        button.classList.add('level-button', levelClass, 'text-white', 'font-bold', 'py-4', 'px-8', 'rounded-2xl', 'text-xl', 'shadow-xl'); 
        
        button.onclick = () => showQuizModeSelector(levelName); 
        levelButtonsWrapper.appendChild(button);
    });
}

// NEW: 퀴즈 모드 선택 화면을 보여주는 함수
function showQuizModeSelector(level) {
    selectedLevelForQuizMode = level; // 선택된 레벨 저장
    
    // 레벨 선택 화면은 유지하되, 레벨 버튼을 숨기고 퀴즈 모드 선택기를 표시
    levelButtonsWrapper.style.display = 'none'; 
    quizModeSelector.style.display = 'block';

    selectedLevelQuizModeText.textContent = `'${level}' 레벨 퀴즈 모드 선택`;

    const incorrectWordsCount = incorrectWordIdsByLevel[level] ? incorrectWordIdsByLevel[level].size : 0;
    startIncorrectQuizButton.textContent = `📝 오답 노트 풀기 (${incorrectWordsCount}개)`;
    startIncorrectQuizButton.disabled = incorrectWordsCount === 0; // 오답이 없으면 비활성화
    if (incorrectWordsCount === 0) {
        startIncorrectQuizButton.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        startIncorrectQuizButton.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    // 버튼 이벤트 리스너 연결
    startRandomQuizButton.onclick = () => {
        currentQuizMode = QuizMode.RANDOM;
        selectLevel(selectedLevelForQuizMode);
    };
    startIncorrectQuizButton.onclick = () => {
        currentQuizMode = QuizMode.INCORRECT_ONLY;
        selectLevel(selectedLevelForQuizMode);
    };
    backToLevelSelectButton.onclick = () => {
        levelButtonsWrapper.style.display = 'flex'; // 레벨 버튼 다시 표시
        quizModeSelector.style.display = 'none'; // 모드 선택기 숨기기
    };
}


// 퀴즈 뷰의 초기 HTML을 저장합니다. (앱 시작 시 단 한 번만 실행)
let initialQuizViewHTML = ''; 

// quizViewContainer 내부의 전역 변수 DOM 요소 참조를 갱신하는 함수
function reassignQuizViewElements() {
    currentLevelDisplay = document.getElementById('current-level-display');
    scoreDisplay = document.getElementById('score-display');
    progressBar = document.getElementById('progress-bar');
    questionNumberDisplay = document.getElementById('question-number-display');
    questionTextElement = document.getElementById('question-text');
    optionsGrid = document.getElementById('options-grid');
    feedbackMessageElement = document.getElementById('feedback-message');
    nextQuestionButton = document.getElementById('next-question-button');
    console.log("[DEBUG] Quiz view elements reassigned.");
}

// quizViewContainer의 구조가 손상되었을 때 초기 HTML로 복원하는 함수
function ensureQuizViewStructure() {
    if (!document.getElementById('question-text')) {
        console.warn("[DEBUG] Quiz view structure seems missing or incomplete. Restoring from initial HTML.");
        if (initialQuizViewHTML) {
            quizViewContainer.innerHTML = initialQuizViewHTML;
            reassignQuizViewElements(); 
        } else {
            console.error("[DEBUG] initialQuizViewHTML is not set. Cannot restore quiz view structure. This should not happen if initializeApp ran correctly.");
            quizViewContainer.innerHTML = `
                <div class="text-center p-4 text-white">
                    <p class="text-red-300">퀴즈 화면 로드 오류. 레벨을 다시 선택해주세요.</p>
                    <button onclick="renderLevelSelector()" class="btn-primary text-white font-bold py-3 px-6 rounded-xl shadow-md">레벨 선택</button>
                </div>`;
            return false;
        }
    } else {
        reassignQuizViewElements();
    }
    return true;
}


// --- 퀴즈 진행 ---
function selectLevel(level) {
    currentQuizLevel = level;
    startQuiz();
}

function startQuiz() {
    showScreen(quizViewContainer);

    if (!ensureQuizViewStructure()) {
        return; 
    }
    
    let wordsToChooseFrom = []; // 선택 가능한 단어 목록

    if (currentQuizMode === QuizMode.INCORRECT_ONLY) {
        // 오답 노트 퀴즈 모드
        // incorrectWordIdsByLevel[currentQuizLevel]이 Set이 아니거나 없을 수 있으므로 빈 Set으로 기본값 지정
        const currentIncorrectIds = incorrectWordIdsByLevel[currentQuizLevel] || new Set();

        wordsToChooseFrom = Array.from(currentIncorrectIds)
                               .map(id => WORDS_DATA.find(word => word.id === id))
                               .filter(word => word !== undefined); // 존재하지 않는 ID로 인한 undefined 제거
        
        console.log(`[DEBUG] Incorrect words for ${currentQuizLevel}:`, wordsToChooseFrom.length);

        if (wordsToChooseFrom.length === 0) {
            quizViewContainer.innerHTML = `
                <div class="text-center p-4 text-white">
                    <p class="mb-4">이 레벨(${currentQuizLevel})에는 현재 틀린 문제가 없습니다. <br/>랜덤 퀴즈에서 문제를 풀거나 다른 레벨을 선택해주세요.</p>
                    <button onclick="currentQuizMode = QuizMode.RANDOM; selectLevel('${currentQuizLevel}')" class="btn-primary text-white font-bold py-3 px-6 rounded-xl shadow-md">랜덤 퀴즈 시작</button>
                    <button onclick="renderLevelSelector()" class="glass text-white font-bold py-3 px-6 rounded-xl shadow-md mt-2">레벨 선택으로</button>
                </div>`;
            return;
        }

    } else { // 기본: 랜덤 퀴즈 모드 (QuizMode.RANDOM)
        const allLevelWords = WORDS_DATA.filter(word => word.level === currentQuizLevel);
        
        // answeredCorrectlyWordIdsByLevel[currentQuizLevel]이 Set이 아니거나 없을 수 있으므로 빈 Set으로 기본값 지정
        const currentAnsweredCorrectlyIds = answeredCorrectlyWordIdsByLevel[currentQuizLevel] || new Set();
        
        // 정답을 맞췄던 문제를 제외하고 새로운 문제만 우선적으로 출제
        let newWords = allLevelWords.filter(word => 
            !currentAnsweredCorrectlyIds.has(word.id)
        );

        console.log(`[DEBUG] All words for ${currentQuizLevel}: ${allLevelWords.length}`);
        console.log(`[DEBUG] Answered correctly for ${currentQuizLevel}: ${currentAnsweredCorrectlyIds.size}`);
        console.log(`[DEBUG] New words available: ${newWords.length}`);

        // 새로운 문제가 부족하면 이미 정답 맞췄던 문제도 포함
        if (newWords.length < QUESTIONS_PER_QUIZ) {
            console.warn(`[DEBUG] Not enough new words (${newWords.length}) for ${QUESTIONS_PER_QUIZ} questions. Reusing answered words.`);
            wordsToChooseFrom = allLevelWords; // 모든 단어를 다시 포함
            // 사용자에게 알림을 줄 수도 있습니다: "새로운 문제가 모두 소진되어, 이전에 맞췄던 문제가 포함됩니다."
        } else {
            wordsToChooseFrom = newWords;
        }
    }
    
    currentQuestions = shuffleArray(wordsToChooseFrom).slice(0, QUESTIONS_PER_QUIZ);
    console.log(`[DEBUG] Final questions for quiz: ${currentQuestions.length}`);

    // 최종적으로 문제가 0개일 경우 처리
    if (currentQuestions.length === 0) {
        quizViewContainer.innerHTML = `
            <div class="text-center p-4 text-white">
                <p class="text-red-300 mb-4">선택하신 레벨(${currentQuizLevel})에 출제할 문제가 현재 없습니다. <br/>words.js 파일에 단어를 추가하거나, 진행 상황을 초기화해보세요.</p>
                <button onclick="renderLevelSelector()" class="btn-primary text-white font-bold py-3 px-6 rounded-xl shadow-md">레벨 선택으로 돌아가기</button>
            </div>`;
        return;
    }
    
    currentQuestionIndex = 0;
    score = 0;
    renderQuestion();
}

function renderQuestion() {
    isAnswered = false;

    if (currentQuestionIndex >= currentQuestions.length) {
        renderResultScreen();
        return;
    }

    feedbackMessageElement.style.display = 'none';
    feedbackMessageElement.className = 'text-white p-4 rounded-2xl text-center font-bold text-lg shadow-xl'; 
    feedbackMessageElement.innerHTML = '';
    
    nextQuestionButton.style.display = 'none';

    optionsGrid.innerHTML = '';

    const questionData = currentQuestions[currentQuestionIndex];
    questionTextElement.textContent = `${questionData.english}`;
    currentLevelDisplay.textContent = `${currentQuizLevel} 퀴즈`;
    scoreDisplay.textContent = `점수: ${score} / ${currentQuestions.length}`;
    
    const progressPercent = ((currentQuestionIndex) / currentQuestions.length) * 100;
    progressBar.style.width = `${progressPercent}%`;
    questionNumberDisplay.textContent = `문제 ${currentQuestionIndex + 1} / ${currentQuestions.length}`;

    const options = generateOptions(questionData);
    options.forEach(optionText => {
        const optionButton = document.createElement('button');
        optionButton.innerHTML = `<span>${optionText}</span>`; 
        optionButton.classList.add('quiz-option-button', 'default'); 
        optionButton.onclick = (event) => handleAnswer(event.currentTarget, optionText, questionData.korean);
        optionsGrid.appendChild(optionButton);
    });
}

function generateOptions(correctWord) {
    const correctAnswer = correctWord.korean;
    let distractors = WORDS_DATA
        .filter(word => word.korean !== correctAnswer && word.level === correctWord.level)
        .map(word => word.korean);

    if (distractors.length < OPTIONS_COUNT - 1) {
        const globalDistractors = WORDS_DATA
            .filter(word => word.korean !== correctAnswer && !distractors.includes(word.korean))
            .map(word => word.korean);
        distractors = [...new Set([...distractors, ...globalDistractors])]; 
    }

    distractors = shuffleArray(distractors).slice(0, OPTIONS_COUNT - 1);

    let tempDistractorCount = 1;
    while (distractors.length < OPTIONS_COUNT - 1) {
        const tempDist = `오답${tempDistractorCount++}`;
        if (tempDist !== correctAnswer && !distractors.includes(tempDist)) {
            distractors.push(tempDist);
        } else if (tempDistractorCount > 200) { 
            console.warn("Could not generate enough unique distractors. Using generic fallbacks.");
            break; 
        }
    }

    const finalOptions = shuffleArray([correctAnswer, ...distractors]);
    return finalOptions.slice(0, OPTIONS_COUNT);
}

function handleAnswer(selectedButton, selectedAnswer, correctAnswer) {
    if (isAnswered) return;
    isAnswered = true;
    
    const optionButtons = Array.from(optionsGrid.children);
    optionButtons.forEach(btn => {
        btn.classList.add('answered'); 
        btn.onclick = null;
        btn.classList.remove('default'); 

        const textSpan = btn.querySelector('span'); 
        const originalText = textSpan ? textSpan.textContent : btn.textContent; 
        let iconToShow = '';

        if (originalText === correctAnswer) { 
            btn.classList.add('correct'); 
            iconToShow = `<span class="absolute right-3 top-1/2 -translate-y-1/2 text-white">${svgIconCheck}</span>`;
        } else if (btn === selectedButton) { 
            btn.classList.add('incorrect'); 
            iconToShow = `<span class="absolute right-3 top-1/2 -translate-y-1/2 text-white">${svgIconX}</span>`;
        } else { 
            btn.classList.add('unselected-after-reveal');
        }
        btn.innerHTML = `<span>${originalText}</span>${iconToShow}`; 
    });

    const currentQuestionId = currentQuestions[currentQuestionIndex].id;

    let feedbackIconHTML = '';
    if (selectedAnswer === correctAnswer) {
        score++;
        feedbackIconHTML = `<span class="text-2xl mr-3">${svgIconCheckCircleLarge}</span>`;
        feedbackMessageElement.innerHTML = `<div class="flex items-center justify-center">${feedbackIconHTML}<span>정답입니다! 훌륭해요!</span></div>`;
        feedbackMessageElement.classList.add('feedback-success'); 
        feedbackMessageElement.classList.remove('feedback-error');

        // NEW: 정답 맞췄으므로 answeredCorrectly 목록에 추가
        if (!answeredCorrectlyWordIdsByLevel[currentQuizLevel]) {
            answeredCorrectlyWordIdsByLevel[currentQuizLevel] = new Set();
        }
        answeredCorrectlyWordIdsByLevel[currentQuizLevel].add(currentQuestionId);

        // NEW: 만약 이전에 틀렸던 문제였다면 incorrect 목록에서 제거
        if (incorrectWordIdsByLevel[currentQuizLevel] && incorrectWordIdsByLevel[currentQuizLevel].has(currentQuestionId)) {
            incorrectWordIdsByLevel[currentQuizLevel].delete(currentQuestionId);
        }

    } else {
        feedbackIconHTML = `<span class="text-2xl mr-3">${svgIconXCircleLarge}</span>`;
        feedbackMessageElement.innerHTML = `<div class="flex items-center justify-center">${feedbackIconHTML}<span>틀렸습니다. 정답: "${correctAnswer}"</span></div>`;
        feedbackMessageElement.classList.add('feedback-error');
        feedbackMessageElement.classList.remove('feedback-success');

        // NEW: 틀렸으므로 incorrect 목록에 추가
        if (!incorrectWordIdsByLevel[currentQuizLevel]) {
            incorrectWordIdsByLevel[currentQuizLevel] = new Set();
        }
        incorrectWordIdsByLevel[currentQuizLevel].add(currentQuestionId);
    }
    feedbackMessageElement.style.display = 'block'; 
    nextQuestionButton.style.display = 'block';

    const nextButtonTextSpan = nextQuestionButton.querySelector('span');
    const nextButtonSvg = nextQuestionButton.querySelector('svg');

    if (currentQuestionIndex >= currentQuestions.length - 1) {
        nextButtonTextSpan.textContent = '결과 보기';
        nextButtonSvg.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />`; 
    } else {
        nextButtonTextSpan.textContent = '다음 문제로';
        nextButtonSvg.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>`; 
    }

    saveProgress(); // 답을 제출할 때마다 진행 상황 저장
}

function renderResultScreen() {
    showScreen(resultScreenContainer);
    const percentage = currentQuestions.length > 0 ? (score / currentQuestions.length) * 100 : 0;
    const passed = percentage >= LEVEL_UP_THRESHOLD_PERCENTAGE;

    resultLevel.textContent = `${currentQuizLevel} 결과`;
    resultPercentage.textContent = `${percentage.toFixed(0)}%`;
    resultScore.textContent = `${score} / ${currentQuestions.length} 문제 정답`;

    resultDetails.classList.remove('feedback-success', 'feedback-error'); 
    resultDetails.classList.add('glass'); 
    if (passed) {
        resultDetails.classList.add('feedback-success');
        resultPercentage.classList.add('text-white'); 
        resultScore.classList.add('text-white/80');
    } else {
        resultDetails.classList.add('feedback-error');
        resultPercentage.classList.add('text-white'); 
        resultScore.classList.add('text-white/80');
    }

    resultMessageIcon.innerHTML = passed ? svgIconCheckCircleLarge : svgIconXCircleLarge;
    resultMessage.classList.remove('text-green-700', 'text-red-700'); 
    resultMessage.classList.add('text-white'); 

    resultMessageText.textContent = passed ? '축하합니다! 레벨을 통과했습니다.' : `아쉬워요! (${LEVEL_UP_THRESHOLD_PERCENTAGE}% 이상 필요)`;
    
    const currentLevelIdx = LEVEL_ORDER.indexOf(currentQuizLevel);
    if (passed && currentLevelIdx < LEVEL_ORDER.length - 1) {
        const nextLevel = LEVEL_ORDER[currentLevelIdx + 1];
        unlockedLevels.add(nextLevel); 
        saveProgress(); 
        resultMessageText.textContent += ` 다음 '${nextLevel}' 레벨로 도전해보세요!`;
        proceedNextLevelButton.style.display = 'inline-flex';
        
        proceedNextLevelButton.classList.add('btn-success');
        proceedNextLevelButton.classList.remove('btn-primary', 'glass');
        proceedNextLevelButton.innerHTML = `<span class="flex items-center justify-center">
                                                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                                </svg>
                                                다음 레벨 (${nextLevel})
                                            </span>`;
        proceedNextLevelButton.onclick = () => {
            currentQuizMode = QuizMode.RANDOM; // 다음 레벨 시작 시 기본은 랜덤 모드
            selectLevel(nextLevel);
        };
    } else if (passed && currentLevelIdx === LEVEL_ORDER.length - 1) {
        resultMessageText.textContent = '모든 레벨을 통과했습니다! 대단해요!';
        proceedNextLevelButton.style.display = 'none';
    } else {
        proceedNextLevelButton.style.display = 'none';
    }

    // 결과 화면 버튼들 이벤트 연결
    // '다시 도전하기'는 현재 모드와 레벨로 다시 시작
    retryQuizButton.onclick = () => startQuiz(); 
    backToLevelsButton.onclick = renderLevelSelector; 

    retryQuizButton.classList.add('btn-primary');
    retryQuizButton.classList.remove('btn-success', 'glass');
    backToLevelsButton.classList.add('glass');
    backToLevelsButton.classList.remove('btn-primary', 'btn-success');
}

function loadProgress() {
    try {
        const storedLevels = localStorage.getItem('simpleQuizUnlockedLevels');
        if (storedLevels) {
            unlockedLevels = new Set(JSON.parse(storedLevels));
            console.log("[DEBUG] Loaded unlocked levels:", Array.from(unlockedLevels));
        } else {
            if (LEVEL_ORDER && LEVEL_ORDER.length > 0) {
                unlockedLevels = new Set(LEVEL_ORDER);
                console.log("[DEBUG] No saved progress found. All levels unlocked by default.");
            } else {
                console.error("LEVEL_ORDER is empty. Cannot unlock any default level.");
            }
        }

        // NEW: 정답 맞춘 문제 로드
        const storedAnsweredCorrectlyWords = localStorage.getItem('simpleQuizAnsweredCorrectlyWords');
        if (storedAnsweredCorrectlyWords) {
            const parsedData = JSON.parse(storedAnsweredCorrectlyWords);
            // 각 레벨의 배열을 Set으로 변환하여 저장
            for (const level in parsedData) {
                answeredCorrectlyWordIdsByLevel[level] = new Set(parsedData[level]);
            }
            console.log("[DEBUG] Loaded answered correctly word IDs:", answeredCorrectlyWordIdsByLevel);
        } else {
            answeredCorrectlyWordIdsByLevel = {};
        }

        // NEW: 틀린 문제 로드
        const storedIncorrectWords = localStorage.getItem('simpleQuizIncorrectWords');
        if (storedIncorrectWords) {
            const parsedData = JSON.parse(storedIncorrectWords);
            // 각 레벨의 배열을 Set으로 변환하여 저장
            for (const level in parsedData) {
                incorrectWordIdsByLevel[level] = new Set(parsedData[level]);
            }
            console.log("[DEBUG] Loaded incorrect word IDs:", incorrectWordIdsByLevel);
        } else {
            incorrectWordIdsByLevel = {};
        }

    } catch (e) {
        console.error("Failed to load progress from localStorage:", e);
        if (LEVEL_ORDER && LEVEL_ORDER.length > 0) {
            unlockedLevels.add(LEVEL_ORDER[0]);
        }
        answeredCorrectlyWordIdsByLevel = {}; 
        incorrectWordIdsByLevel = {};         
    }
}

function saveProgress() {
    localStorage.setItem('simpleQuizUnlockedLevels', JSON.stringify(Array.from(unlockedLevels)));
    console.log("[DEBUG] Saved unlocked levels:", Array.from(unlockedLevels));

    // NEW: 정답 맞춘 문제 저장 (Set을 배열로 변환)
    const serializableAnsweredCorrectly = {};
    for (const level in answeredCorrectlyWordIdsByLevel) {
        serializableAnsweredCorrectly[level] = Array.from(answeredCorrectlyWordIdsByLevel[level]);
    }
    localStorage.setItem('simpleQuizAnsweredCorrectlyWords', JSON.stringify(serializableAnsweredCorrectly));
    console.log("[DEBUG] Saved answered correctly word IDs:", answeredCorrectlyWordIdsByLevel);

    // NEW: 틀린 문제 저장 (Set을 배열로 변환)
    const serializableIncorrect = {};
    for (const level in incorrectWordIdsByLevel) {
        serializableIncorrect[level] = Array.from(incorrectWordIdsByLevel[level]);
    }
    localStorage.setItem('simpleQuizIncorrectWords', JSON.stringify(serializableIncorrect));
    console.log("[DEBUG] Saved incorrect word IDs:", serializableIncorrect); // DEBUG: 직렬화된 데이터 로깅 확인
}

// --- 앱 시작 ---
function initializeApp() {
    // words.js의 필수 변수들이 로드되었는지 확인
    if (typeof WORDS_DATA === 'undefined' || typeof LEVEL_ORDER === 'undefined' || 
        typeof QUESTIONS_PER_QUIZ === 'undefined' || typeof DifficultyLevel === 'undefined' || 
        typeof OPTIONS_COUNT === 'undefined' || typeof LEVEL_UP_THRESHOLD_PERCENTAGE === 'undefined') {
        document.body.innerHTML = `
            <div class="min-h-screen flex flex-col items-center justify-center p-4 text-white">
                <p class="text-red-300 text-center text-lg">
                    오류: words.js 파일이 제대로 로드되지 않았거나, <br/>
                    필요한 변수(WORDS_DATA, LEVEL_ORDER 등)가 없습니다. <br/>
                    words.js 파일을 확인해주세요.
                </p> 
                <p class="mt-4 text-white/60">콘솔(F12)에서 자세한 오류를 확인할 수 있습니다.</p>
            </div>`;
        console.error("Critical variables from words.js are missing. Check words.js loading and content.");
        return;
    }
    
    // quizViewContainer의 초기 HTML 내용을 저장.
    const tempQuizViewContainer = document.getElementById('quiz-view-container');
    if (tempQuizViewContainer) {
        initialQuizViewHTML = tempQuizViewContainer.innerHTML;
        console.log("[DEBUG] Initial quiz view HTML saved.");
    } else {
        console.error("[DEBUG] initializeApp: quiz-view-container not found. Cannot save initial HTML. This is a critical error.");
        return;
    }
    
    // 앱 시작 시, 모든 UI 요소에 대한 첫 참조 설정
    reassignQuizViewElements(); 

    if (nextQuestionButton) {
        nextQuestionButton.addEventListener('click', function() {
            console.log("[DEBUG] Next question button clicked.");
            currentQuestionIndex++;
            renderQuestion();
        });
    } else {
        console.error("[DEBUG] nextQuestionButton not found on initial load.");
    }
    
    // 진행 상황 초기화 버튼 이벤트
    if (resetProgressButton) {
        resetProgressButton.onclick = () => {
            if (confirm("정말로 모든 진행 상황을 초기화하시겠습니까? (레벨 잠금 해제, 정답/오답 문제 기록이 모두 초기화됩니다)")) {
                localStorage.removeItem('simpleQuizUnlockedLevels'); 
                localStorage.removeItem('simpleQuizAnsweredCorrectlyWords'); // NEW: 정답 기록 제거
                localStorage.removeItem('simpleQuizIncorrectWords'); // NEW: 오답 기록 제거
                
                // 메모리상의 변수도 초기화
                unlockedLevels = new Set();
                answeredCorrectlyWordIdsByLevel = {};
                incorrectWordIdsByLevel = {};

                loadProgress(); // localStorage가 비워졌으므로 초기 상태로 로드
                renderLevelSelector(); 
                const notification = document.createElement('div');
                notification.textContent = '진행 상황이 초기화되었습니다.';
                notification.className = 'fixed bottom-4 right-4 glass text-white p-3 rounded-lg shadow-md animate-pulse z-50';
                document.body.appendChild(notification);
                setTimeout(() => {
                    notification.remove();
                }, 3000);
            }
        };
    } else {
        console.error("[DEBUG] resetProgressButton not found on initial load.");
    }

    // 앱 시작 시 진행 상황 로드 및 레벨 선택 화면 렌더링
    loadProgress(); 
    renderLevelSelector();
}

// DOM이 완전히 로드된 후 앱 초기화 함수를 실행
document.addEventListener('DOMContentLoaded', initializeApp);