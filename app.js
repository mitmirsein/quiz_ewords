// app.js

// --- HTML 요소 참조 ---
// 이 요소들은 앱의 생명주기 동안 단 한 번만 참조되므로, 최상단에 둡니다.
const appContainer = document.getElementById('app-container');
const levelSelectorContainer = document.getElementById('level-selector-container');
const levelButtonsWrapper = document.getElementById('level-buttons-wrapper');
const quizViewContainer = document.getElementById('quiz-view-container');
const resultScreenContainer = document.getElementById('result-screen-container');
const resetProgressButton = document.getElementById('reset-progress-button');

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
let isAnswered = false; // 사용자가 현재 질문에 답했는지 여부

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
    screenToShow.style.display = 'block';
}

// --- 레벨 선택 화면 ---
function renderLevelSelector() {
    showScreen(levelSelectorContainer);
    levelButtonsWrapper.innerHTML = ''; // 기존 버튼 모두 제거

    LEVEL_ORDER.forEach(levelName => {
        const button = document.createElement('button');
        let levelText = '';
        let levelClass = ''; // For specific gradient classes like btn-primary

        // sample.html의 버튼 텍스트와 클래스 매핑
        if (levelName === DifficultyLevel.BEGINNER) {
            levelText = '🌟 초급 (Level 1)';
            levelClass = 'btn-primary'; // btn-primary는 스타일 시트에서 배경 그라디언트와 효과 정의
        } else if (levelName === DifficultyLevel.INTERMEDIATE) {
            levelText = '⚡ 중급 (Level 2)';
            levelClass = 'btn-secondary'; // btn-secondary
        } else if (levelName === DifficultyLevel.ADVANCED) {
            levelText = '🔥 고급 (Level 3)';
            levelClass = 'btn-success'; // btn-success
        } else {
            levelText = levelName; // Fallback for other levels
            levelClass = 'btn-primary'; // Default styling if no specific class
        }

        button.innerHTML = levelText;
        // level-button 클래스는 animation-delay를 위해 필요
        button.classList.add('level-button', levelClass, 'text-white', 'font-bold', 'py-4', 'px-8', 'rounded-2xl', 'text-xl', 'shadow-xl'); 
        
        // 애니메이션 딜레이를 위한 nth-child(index + 1)와 동일한 효과 적용
        // `level-button` CSS 규칙에 `animation-delay`가 `nth-child`로 이미 정의되어 있으므로, 여기에 추가적인 인라인 스타일은 필요 없습니다.
        
        button.onclick = () => selectLevel(levelName);
        levelButtonsWrapper.appendChild(button);
    });
}

// 퀴즈 뷰의 초기 HTML을 저장합니다.
// 앱 시작 시 단 한 번만 실행되어야 합니다.
let initialQuizViewHTML = ''; 

// quizViewContainer 내부의 전역 변수 DOM 요소 참조를 갱신하는 함수
// HTML 구조가 innerHTML로 다시 그려진 후 반드시 호출되어야 합니다.
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
    if (!document.getElementById('question-text')) { // 주요 요소가 없다면 구조가 손상되었다고 판단
        console.warn("[DEBUG] Quiz view structure seems missing or incomplete. Restoring from initial HTML.");
        if (initialQuizViewHTML) {
            quizViewContainer.innerHTML = initialQuizViewHTML;
            reassignQuizViewElements(); // DOM 재생성 후 참조 갱신
        } else {
            console.error("[DEBUG] initialQuizViewHTML is not set. Cannot restore quiz view structure. This should not happen if initializeApp ran correctly.");
            // 비상 상황: 사용자에게 오류 알림
            quizViewContainer.innerHTML = `
                <div class="text-center p-4 text-white">
                    <p class="text-red-300">퀴즈 화면 로드 오류. 레벨을 다시 선택해주세요.</p>
                    <button onclick="renderLevelSelector()" class="btn-primary mt-4">레벨 선택</button>
                </div>`;
            return false; // 복원 실패 알림
        }
    } else {
        // 이미 구조가 있다면, 참조만 갱신 (항상 안전하게 호출)
        reassignQuizViewElements();
    }
    return true; // 복원 성공 또는 이미 존재함
}


// --- 퀴즈 진행 ---
function selectLevel(level) {
    currentQuizLevel = level;
    startQuiz();
}

function startQuiz() {
    showScreen(quizViewContainer);

    // 퀴즈 뷰의 DOM 구조가 제대로 준비되었는지 확인 (innerHTML 변경 후 필수)
    if (!ensureQuizViewStructure()) {
        return; // 구조 복원 실패 시 더 이상 진행하지 않음
    }

    const levelWords = WORDS_DATA.filter(word => word.level === currentQuizLevel);
    // 충분한 단어가 있는지 확인하고, 없으면 오류 메시지 표시
    if (levelWords.length < QUESTIONS_PER_QUIZ) {
        quizViewContainer.innerHTML = `
            <div class="text-center p-4 text-white">
                <p class="text-red-300 mb-4">이 레벨(${currentQuizLevel})에는 문제가 충분하지 않습니다. (최소 ${QUESTIONS_PER_QUIZ}개 필요)</p>
                <button onclick="renderLevelSelector()" class="btn-primary text-white font-bold py-3 px-6 rounded-xl shadow-md">레벨 선택으로 돌아가기</button>
            </div>`;
        return;
    }

    currentQuestions = shuffleArray(levelWords).slice(0, QUESTIONS_PER_QUIZ);
    currentQuestionIndex = 0;
    score = 0;
    renderQuestion();
}

function renderQuestion() {
    isAnswered = false;

    // 현재 질문 인덱스가 총 질문 수를 초과하면 결과 화면으로 이동
    if (currentQuestionIndex >= currentQuestions.length) {
        renderResultScreen();
        return;
    }

    // 피드백 메시지 숨김 및 초기화
    feedbackMessageElement.style.display = 'none';
    feedbackMessageElement.className = 'text-white p-4 rounded-2xl text-center font-bold text-lg shadow-xl'; // 기본 클래스로 리셋
    feedbackMessageElement.innerHTML = '';
    
    // 다음 문제 버튼 숨김
    nextQuestionButton.style.display = 'none';

    // 옵션 그리드 초기화
    optionsGrid.innerHTML = '';

    const questionData = currentQuestions[currentQuestionIndex];
    questionTextElement.textContent = `${questionData.english}`;
    currentLevelDisplay.textContent = `${currentQuizLevel} 퀴즈`;
    scoreDisplay.textContent = `점수: ${score} / ${currentQuestions.length}`;
    
    // 프로그레스 바 업데이트
    const progressPercent = ((currentQuestionIndex) / currentQuestions.length) * 100; // 현재 문제 시작 전의 진행률
    progressBar.style.width = `${progressPercent}%`;
    questionNumberDisplay.textContent = `문제 ${currentQuestionIndex + 1} / ${currentQuestions.length}`;

    // 옵션 생성
    const options = generateOptions(questionData);
    options.forEach(optionText => {
        const optionButton = document.createElement('button');
        optionButton.innerHTML = `<span>${optionText}</span>`; 
        // CSS에서 정의된 .quiz-option-button과 .default 클래스 적용
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

    // 같은 레벨에서 충분한 오답이 없다면 다른 레벨에서도 가져옵니다.
    if (distractors.length < OPTIONS_COUNT - 1) {
        const globalDistractors = WORDS_DATA
            .filter(word => word.korean !== correctAnswer && !distractors.includes(word.korean))
            .map(word => word.korean);
        distractors = [...new Set([...distractors, ...globalDistractors])]; // 중복 제거
    }

    distractors = shuffleArray(distractors).slice(0, OPTIONS_COUNT - 1);

    // 그럼에도 부족할 경우 임시 오답을 생성 (최소한의 선택지 보장)
    let tempDistractorCount = 1;
    while (distractors.length < OPTIONS_COUNT - 1) {
        const tempDist = `오답${tempDistractorCount++}`;
        if (tempDist !== correctAnswer && !distractors.includes(tempDist)) {
            distractors.push(tempDist);
        } else if (tempDistractorCount > 200) { // 무한 루프 방지
            console.warn("Could not generate enough unique distractors. Using generic fallbacks.");
            break; 
        }
    }

    const finalOptions = shuffleArray([correctAnswer, ...distractors]);
    return finalOptions.slice(0, OPTIONS_COUNT);
}

function handleAnswer(selectedButton, selectedAnswer, correctAnswer) {
    if (isAnswered) return; // 이미 답했다면 무시
    isAnswered = true;
    
    const optionButtons = Array.from(optionsGrid.children);
    optionButtons.forEach(btn => {
        btn.classList.add('answered'); // 모든 버튼 비활성화 (클릭 방지)
        btn.onclick = null; // 이벤트 핸들러 제거
        btn.classList.remove('default'); // 기본 스타일 제거 (hover 효과 등)

        const textSpan = btn.querySelector('span'); 
        const originalText = textSpan ? textSpan.textContent : btn.textContent; 
        let iconToShow = '';

        if (originalText === correctAnswer) { 
            btn.classList.add('correct'); // 정답 스타일 적용
            iconToShow = `<span class="absolute right-3 top-1/2 -translate-y-1/2 text-white">${svgIconCheck}</span>`;
        } else if (btn === selectedButton) { // 선택한 버튼이 오답일 경우
            btn.classList.add('incorrect'); // 오답 스타일 적용
            iconToShow = `<span class="absolute right-3 top-1/2 -translate-y-1/2 text-white">${svgIconX}</span>`;
        } else { // 선택하지 않은 오답
            btn.classList.add('unselected-after-reveal');
        }
        btn.innerHTML = `<span>${originalText}</span>${iconToShow}`; // 아이콘 추가
    });

    // 피드백 메시지 표시
    let feedbackIconHTML = '';
    if (selectedAnswer === correctAnswer) {
        score++;
        feedbackIconHTML = `<span class="text-2xl mr-3">${svgIconCheckCircleLarge}</span>`;
        feedbackMessageElement.innerHTML = `<div class="flex items-center justify-center">${feedbackIconHTML}<span>정답입니다! 훌륭해요!</span></div>`;
        feedbackMessageElement.classList.add('feedback-success'); // style.css의 애니메이션 클래스
        feedbackMessageElement.classList.remove('feedback-error');
    } else {
        feedbackIconHTML = `<span class="text-2xl mr-3">${svgIconXCircleLarge}</span>`;
        feedbackMessageElement.innerHTML = `<div class="flex items-center justify-center">${feedbackIconHTML}<span>틀렸습니다. 정답: "${correctAnswer}"</span></div>`;
        feedbackMessageElement.classList.add('feedback-error'); // style.css의 애니메이션 클래스
        feedbackMessageElement.classList.remove('feedback-success');
    }
    feedbackMessageElement.style.display = 'block'; 
    nextQuestionButton.style.display = 'block';

    // 다음 문제 버튼 텍스트 업데이트
    const nextButtonTextSpan = nextQuestionButton.querySelector('span');
    const nextButtonSvg = nextQuestionButton.querySelector('svg');

    if (currentQuestionIndex >= currentQuestions.length - 1) {
        nextButtonTextSpan.textContent = '결과 보기';
        nextButtonSvg.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />`; // 다른 아이콘으로 변경
    } else {
        nextButtonTextSpan.textContent = '다음 문제로';
        nextButtonSvg.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>`; // 원래 아이콘
    }
}

function renderResultScreen() {
    showScreen(resultScreenContainer);
    const percentage = currentQuestions.length > 0 ? (score / currentQuestions.length) * 100 : 0;
    const passed = percentage >= LEVEL_UP_THRESHOLD_PERCENTAGE;

    resultLevel.textContent = `${currentQuizLevel} 결과`;
    resultPercentage.textContent = `${percentage.toFixed(0)}%`;
    resultScore.textContent = `${score} / ${currentQuestions.length} 문제 정답`;

    // 결과 디테일 카드에 유리모피즘 + 피드백 효과 적용
    resultDetails.classList.remove('feedback-success', 'feedback-error'); // 기존 피드백 클래스 제거
    resultDetails.classList.add('glass'); // 기본 유리모피즘
    if (passed) {
        resultDetails.classList.add('feedback-success');
        resultPercentage.classList.add('text-white'); 
        resultScore.classList.add('text-white/80');
    } else {
        resultDetails.classList.add('feedback-error');
        resultPercentage.classList.add('text-white'); 
        resultScore.classList.add('text-white/80');
    }

    // 결과 메시지 아이콘 및 텍스트 설정
    resultMessageIcon.innerHTML = passed ? svgIconCheckCircleLarge : svgIconXCircleLarge;
    // 아이콘 색상은 CSS에서 `.feedback-success` 또는 `.feedback-error` 내의 SVG 컬러로 정의될 수 있음.
    // 여기서는 `text-white`로 통일 (부모 요소의 텍스트 색상 따름).
    resultMessage.classList.remove('text-green-700', 'text-red-700'); // 기존 색상 클래스 제거
    resultMessage.classList.add('text-white'); // 메인 텍스트 색상 유지 (sample.html의 `text-white` 반영)

    resultMessageText.textContent = passed ? '축하합니다! 레벨을 통과했습니다.' : `아쉬워요! (${LEVEL_UP_THRESHOLD_PERCENTAGE}% 이상 필요)`;
    
    const currentLevelIdx = LEVEL_ORDER.indexOf(currentQuizLevel);
    if (passed && currentLevelIdx < LEVEL_ORDER.length - 1) {
        const nextLevel = LEVEL_ORDER[currentLevelIdx + 1];
        unlockedLevels.add(nextLevel); // 다음 레벨 잠금 해제
        saveProgress(); // 진행 상황 저장
        resultMessageText.textContent += ` 다음 '${nextLevel}' 레벨로 도전해보세요!`;
        proceedNextLevelButton.style.display = 'inline-flex'; // 다음 레벨 버튼 표시
        
        // 다음 레벨 버튼에 btn-success 스타일 적용
        proceedNextLevelButton.classList.add('btn-success');
        proceedNextLevelButton.classList.remove('btn-primary', 'glass'); // 다른 버튼 스타일 제거
        proceedNextLevelButton.innerHTML = `<span class="flex items-center justify-center">
                                                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                                </svg>
                                                다음 레벨 (${nextLevel})
                                            </span>`;
        proceedNextLevelButton.onclick = () => selectLevel(nextLevel);
    } else if (passed && currentLevelIdx === LEVEL_ORDER.length - 1) {
        resultMessageText.textContent = '모든 레벨을 통과했습니다! 대단해요!';
        proceedNextLevelButton.style.display = 'none'; // 마지막 레벨 통과 시 다음 레벨 버튼 숨김
    } else {
        proceedNextLevelButton.style.display = 'none'; // 통과 못했을 시 다음 레벨 버튼 숨김
    }

    // 결과 화면 버튼들 이벤트 연결
    retryQuizButton.onclick = () => startQuiz(); // 현재 레벨 다시 시작
    backToLevelsButton.onclick = renderLevelSelector; // 레벨 선택 화면으로 돌아가기

    // 버튼 스타일 재확인 (재도전은 primary, 레벨 선택은 glass)
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
            // 저장된 진행 상황이 없으면 모든 레벨을 잠금 해제합니다.
            // sample.html은 레벨 선택 화면에서 모든 레벨 버튼을 보여줬으므로, 기본적으로 모두 열린 상태로 가정합니다.
            if (LEVEL_ORDER && LEVEL_ORDER.length > 0) {
                unlockedLevels = new Set(LEVEL_ORDER);
                console.log("[DEBUG] No saved progress found. All levels unlocked by default.");
            } else {
                console.error("LEVEL_ORDER is empty. Cannot unlock any default level.");
            }
        }
    } catch (e) {
        console.error("Failed to load progress from localStorage:", e);
        // localStorage 오류 시에도 최소한 첫 레벨은 플레이 가능하도록
        if (LEVEL_ORDER && LEVEL_ORDER.length > 0) {
            unlockedLevels.add(LEVEL_ORDER[0]);
        }
    }
}

function saveProgress() {
    localStorage.setItem('simpleQuizUnlockedLevels', JSON.stringify(Array.from(unlockedLevels)));
    console.log("[DEBUG] Saved unlocked levels:", Array.from(unlockedLevels));
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
    // 이 작업은 DOMContentLoaded 시점에 한 번만 이뤄져야 합니다.
    const tempQuizViewContainer = document.getElementById('quiz-view-container');
    if (tempQuizViewContainer) {
        initialQuizViewHTML = tempQuizViewContainer.innerHTML;
        console.log("[DEBUG] Initial quiz view HTML saved.");
    } else {
        console.error("[DEBUG] initializeApp: quiz-view-container not found. Cannot save initial HTML. This is a critical error.");
        // 여기서 더 이상 진행하지 않도록 할 수 있습니다.
        return;
    }
    
    // 앱 시작 시, 모든 UI 요소에 대한 첫 참조 설정
    reassignQuizViewElements(); 

    // `next-question-button`에 대한 이벤트 리스너를 한 번만 등록합니다.
    // 이 버튼은 `innerHTML`로 매번 다시 생성되지 않으므로, 한 번만 등록해도 됩니다.
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
            if (confirm("정말로 모든 진행 상황을 초기화하시겠습니까? (모든 레벨이 다시 열린 상태로 유지됩니다)")) {
                localStorage.removeItem('simpleQuizUnlockedLevels'); 
                loadProgress(); // 모든 레벨을 다시 'unlocked' 상태로 로드합니다.
                renderLevelSelector(); // 레벨 선택 화면으로 돌아갑니다.
                const notification = document.createElement('div');
                notification.textContent = '진행 상황이 초기화되었습니다.';
                // 알림 스타일 (sample.html의 footer reset button hover 효과와 유사)
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