// app.js

// --- HTML 요소 참조 ---
const appContainer = document.getElementById('app-container');
const levelSelectorContainer = document.getElementById('level-selector-container');
const levelButtonsWrapper = document.getElementById('level-buttons-wrapper');
const quizViewContainer = document.getElementById('quiz-view-container');
const resultScreenContainer = document.getElementById('result-screen-container');
const resetProgressButton = document.getElementById('reset-progress-button');

// quizViewContainer 내부 요소들은 renderQuestion 또는 startQuiz에서 필요시 다시 찾거나,
// DOM 재생성 시 참조를 갱신해야 합니다.
let currentLevelDisplay;
let scoreDisplay;
let progressBar;
let questionNumberDisplay;
let questionTextElement;
let optionsGrid;
let feedbackMessageElement;
// let nextQuestionButton; // 이벤트 위임으로 처리하므로, 전역 참조는 필수 아님

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
let isAnswered = false;

// --- SVG 아이콘 ---
const svgIconCheck = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>`;
const svgIconX = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" /></svg>`;
const svgIconCheckCircleLarge = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-green-500"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" /></svg>`;
const svgIconXCircleLarge = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-red-500"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd" /></svg>`;

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
    levelButtonsWrapper.innerHTML = '';

    LEVEL_ORDER.forEach(levelName => {
        const button = document.createElement('button');
        button.textContent = levelName;
        button.classList.add('level-button');

        if (levelName === DifficultyLevel.BEGINNER) button.classList.add('beginner');
        else if (levelName === DifficultyLevel.INTERMEDIATE) button.classList.add('intermediate');
        else if (levelName === DifficultyLevel.ADVANCED) button.classList.add('advanced');
        
        button.onclick = () => selectLevel(levelName);
        levelButtonsWrapper.appendChild(button);
    });
}

// --- 퀴즈 진행 ---
function selectLevel(level) {
    currentQuizLevel = level;
    startQuiz();
}

let initialQuizViewHTML = ''; // 퀴즈 화면 초기 HTML 저장용

function startQuiz() {
    showScreen(quizViewContainer);

    if (initialQuizViewHTML) {
        quizViewContainer.innerHTML = initialQuizViewHTML;
        // quizViewContainer 내용이 복원되었으므로, 내부 요소들에 대한 참조를 갱신
        reassignQuizViewElements();
    } else {
        // initialQuizViewHTML이 비어있다면 initializeApp에서 제대로 저장되지 않은 것이므로,
        // 현재 DOM 구조가 올바른지 확인하고, 아니라면 여기서라도 필수 구조를 만들어야 함.
        // 하지만 initializeApp에서 저장하는 것이 더 바람직.
        // 여기서는 initializeApp에서 initialQuizViewHTML이 설정되었다고 가정.
        // 만약 initializeApp에서 실패했다면 reassignQuizViewElements() 호출 전에
        // quizViewContainer.innerHTML에 기본 구조를 넣어주는 fallback 로직 필요.
        ensureQuizViewStructure(); // 필수 구조 확인 및 복원 (initialQuizViewHTML 사용)
    }

    const levelWords = WORDS_DATA.filter(word => word.level === currentQuizLevel);
    // 중요: QUESTIONS_PER_QUIZ가 words.js에서 제대로 로드되었는지 확인
    console.log(`[DEBUG] startQuiz: typeof QUESTIONS_PER_QUIZ = ${typeof QUESTIONS_PER_QUIZ}, value = ${QUESTIONS_PER_QUIZ}`);
    currentQuestions = shuffleArray(levelWords).slice(0, QUESTIONS_PER_QUIZ);

    console.log(`[DEBUG] startQuiz: currentQuestions.length = ${currentQuestions.length}`);

    if (currentQuestions.length === 0) {
        quizViewContainer.innerHTML = `
            <div class="text-center p-4">
                <p class="text-red-500 mb-4">이 레벨(${currentQuizLevel})에 대한 문제가 충분하지 않습니다. <br/>words.js 파일에 단어를 추가해주세요.</p>
                <button onclick="renderLevelSelector()" class="level-button bg-slate-500 hover:bg-slate-600 focus:ring-slate-400">레벨 선택으로 돌아가기</button>
            </div>`;
        return;
    }
    
    currentQuestionIndex = 0;
    score = 0;
    renderQuestion();
}

// quizViewContainer 내부의 주요 요소들이 있는지 확인하고, 없으면 초기 HTML로 복원
function ensureQuizViewStructure() {
    if (!document.getElementById('question-card')) { // 주요 요소 중 하나만 체크
        console.warn("[DEBUG] Quiz view structure seems missing or incomplete. Restoring from initial HTML.");
        if (initialQuizViewHTML) {
            quizViewContainer.innerHTML = initialQuizViewHTML;
            reassignQuizViewElements(); // DOM 재생성 후 참조 갱신
        } else {
            console.error("[DEBUG] initialQuizViewHTML is not set. Cannot restore quiz view structure.");
            // 비상: 사용자에게 오류 알리고 레벨 선택으로 유도
            quizViewContainer.innerHTML = `<div class="text-center p-4"><p class="text-red-500">퀴즈 화면 로드 오류. 레벨을 다시 선택해주세요.</p><button onclick="renderLevelSelector()" class="level-button bg-slate-500 hover:bg-slate-600 focus:ring-slate-400 mt-2">레벨 선택</button></div>`;
        }
    } else {
        // 이미 구조가 있다면, 참조만 갱신 (선택적, 이미 전역 변수들이 최신 DOM을 가리키고 있다면 불필요)
        reassignQuizViewElements();
    }
}

// quizViewContainer 내부의 전역 변수 DOM 요소 참조를 갱신하는 함수
function reassignQuizViewElements() {
    currentLevelDisplay = document.getElementById('current-level-display');
    scoreDisplay = document.getElementById('score-display');
    progressBar = document.getElementById('progress-bar');
    questionNumberDisplay = document.getElementById('question-number-display');
    questionTextElement = document.getElementById('question-text');
    optionsGrid = document.getElementById('options-grid');
    feedbackMessageElement = document.getElementById('feedback-message');
    // nextQuestionButton은 이벤트 위임으로 처리하므로, 여기서의 전역 참조는 덜 중요함.
    // 필요하다면: nextQuestionButton = document.getElementById('next-question-button');
    console.log("[DEBUG] Quiz view elements reassigned.");
}


function renderQuestion() {
    isAnswered = false;

    // ensureQuizViewStructure() 호출로 요소들이 준비되었는지 확인 후 진행
    // 또는, reassignQuizViewElements()가 startQuiz에서 이미 호출되었다면 여기서 생략 가능
    // 여기서는 renderQuestion이 독립적으로 호출될 수도 있다고 가정하고, 참조 확인
    if (!questionTextElement || !optionsGrid || !feedbackMessageElement ) {
        console.error("[DEBUG] renderQuestion: One or more critical UI elements are null. Attempting to reassign.");
        reassignQuizViewElements(); // 참조 재시도
        if (!questionTextElement || !optionsGrid || !feedbackMessageElement ) {
            console.error("[DEBUG] renderQuestion: Reassign failed. Aborting render.");
             quizViewContainer.innerHTML = `<div class="text-center p-4"><p class="text-red-500">퀴즈 표시 오류. 레벨을 다시 선택해주세요.</p><button onclick="renderLevelSelector()" class="level-button bg-slate-500 hover:bg-slate-600 focus:ring-slate-400 mt-2">레벨 선택</button></div>`;
            return;
        }
    }

    console.log(`[DEBUG] renderQuestion: currentQuestionIndex = ${currentQuestionIndex}, currentQuestions.length = ${currentQuestions.length}`);

    if (currentQuestionIndex >= currentQuestions.length) {
        console.log("[DEBUG] All questions answered. Rendering result screen.");
        renderResultScreen();
        return;
    }

    feedbackMessageElement.style.display = 'none';
    feedbackMessageElement.textContent = '';
    feedbackMessageElement.className = 'mt-6 p-3 rounded-md text-center font-semibold text-sm';
    
    // nextQuestionButton은 이벤트 위임으로 처리되므로, 직접 참조하여 display none 하는 부분은
    // initializeApp에서 설정한 이벤트 핸들러가 있는 버튼(#next-question-button)을 찾아야 함
    const actualNextButton = document.getElementById('next-question-button');
    if(actualNextButton) actualNextButton.style.display = 'none';

    optionsGrid.innerHTML = '';

    const questionData = currentQuestions[currentQuestionIndex];
    questionTextElement.textContent = `"${questionData.english}"`;
    currentLevelDisplay.textContent = `${currentQuizLevel} 퀴즈`;
    scoreDisplay.textContent = `점수: ${score} / ${currentQuestions.length}`;
    const progressPercent = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    progressBar.style.width = `${progressPercent}%`;
    questionNumberDisplay.textContent = `문제 ${currentQuestionIndex + 1} / ${currentQuestions.length}`;

    const options = generateOptions(questionData);
    options.forEach(optionText => {
        const optionButton = document.createElement('button');
        optionButton.innerHTML = `<span>${optionText}</span>`; 
        optionButton.classList.add('quiz-option-button', 'default', 'relative'); 
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
        const additionalDistractors = WORDS_DATA
            .filter(word => word.korean !== correctAnswer && !distractors.includes(word.korean))
            .map(word => word.korean);
        distractors = [...new Set([...distractors, ...additionalDistractors])];
    }

    distractors = shuffleArray(distractors).slice(0, OPTIONS_COUNT - 1);

    let tempDistractorCount = 1;
    while (distractors.length < OPTIONS_COUNT - 1) {
        const tempDist = `오답${tempDistractorCount++}`;
        if (tempDist !== correctAnswer && !distractors.includes(tempDist)) {
            distractors.push(tempDist);
        } else if (tempDistractorCount > 100) break; 
    }

    const finalOptions = shuffleArray([correctAnswer, ...distractors]);
    return finalOptions.slice(0, OPTIONS_COUNT);
}

function handleAnswer(selectedButton, selectedAnswer, correctAnswer) {
    if (isAnswered) return;
    isAnswered = true;
    
    // DOM 요소 참조 갱신 (만약을 위해)
    const currentFeedbackMessageElement = document.getElementById('feedback-message');
    const currentNextQuestionButton = document.getElementById('next-question-button');
    const currentOptionsGrid = document.getElementById('options-grid');

    if (!currentFeedbackMessageElement || !currentNextQuestionButton || !currentOptionsGrid) {
        console.error("[DEBUG] handleAnswer: Critical UI elements not found.");
        return;
    }


    const optionButtons = Array.from(currentOptionsGrid.children);
    optionButtons.forEach(btn => {
        btn.classList.add('answered'); 
        btn.onclick = null;
        btn.classList.remove('default', 'selected', 'hover:bg-sky-50'); 

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

    let feedbackIcon = '';
    if (selectedAnswer === correctAnswer) {
        score++;
        feedbackIcon = svgIconCheckCircleLarge.replace('class="w-8 h-8 text-green-500"', 'class="w-6 h-6 text-green-600 mr-2 inline-block"');
        currentFeedbackMessageElement.innerHTML = `${feedbackIcon} 정답입니다! 🎉`;
        currentFeedbackMessageElement.className = 'mt-6 p-3 rounded-md text-center font-semibold text-sm bg-green-100 text-green-700 flex items-center justify-center';
    } else {
        feedbackIcon = svgIconXCircleLarge.replace('class="w-8 h-8 text-red-500"', 'class="w-6 h-6 text-red-600 mr-2 inline-block"');
        currentFeedbackMessageElement.innerHTML = `${feedbackIcon} 오답입니다. 정답: ${correctAnswer}`;
        currentFeedbackMessageElement.className = 'mt-6 p-3 rounded-md text-center font-semibold text-sm bg-red-100 text-red-700 flex items-center justify-center';
    }
    currentFeedbackMessageElement.style.display = 'flex'; 
    currentNextQuestionButton.style.display = 'block';

    if (currentQuestionIndex >= currentQuestions.length - 1) {
        currentNextQuestionButton.textContent = '결과 보기';
    } else {
        currentNextQuestionButton.textContent = '다음 문제로';
    }
}

function renderResultScreen() {
    showScreen(resultScreenContainer);
    const percentage = currentQuestions.length > 0 ? (score / currentQuestions.length) * 100 : 0;
    const passed = percentage >= LEVEL_UP_THRESHOLD_PERCENTAGE;

    resultLevel.textContent = `${currentQuizLevel} 결과`;
    resultPercentage.textContent = `${percentage.toFixed(0)}%`;
    resultScore.textContent = `${score} / ${currentQuestions.length} 문제 정답`;

    resultDetails.className = `my-6 p-6 rounded-lg ${passed ? 'bg-green-50' : 'bg-red-50'}`;
    resultPercentage.className = `text-5xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`;
    resultScore.className = `mt-2 text-lg ${passed ? 'text-green-700' : 'text-red-700'}`;

    resultMessageIcon.innerHTML = passed ? svgIconCheckCircleLarge : svgIconXCircleLarge;
    resultMessageText.textContent = passed ? '축하합니다! 레벨을 통과했습니다.' : `아쉬워요! (${LEVEL_UP_THRESHOLD_PERCENTAGE}% 이상 필요)`;
    resultMessage.className = `font-semibold mb-6 flex items-center justify-center ${passed ? 'text-green-700' : 'text-red-700'}`;

    const currentLevelIdx = LEVEL_ORDER.indexOf(currentQuizLevel);
    if (passed && currentLevelIdx < LEVEL_ORDER.length - 1) {
        const nextLevel = LEVEL_ORDER[currentLevelIdx + 1];
        saveProgress(); 
        resultMessageText.textContent += ` 다음 '${nextLevel}' 레벨로 도전해보세요!`;
        proceedNextLevelButton.textContent = `다음 레벨 (${nextLevel})`;
        proceedNextLevelButton.style.display = 'inline-flex';
        proceedNextLevelButton.onclick = () => selectLevel(nextLevel);
    } else if (passed && currentLevelIdx === LEVEL_ORDER.length - 1) {
        resultMessageText.textContent = '모든 레벨을 통과했습니다! 대단해요!';
        proceedNextLevelButton.style.display = 'none';
    }
    else {
        proceedNextLevelButton.style.display = 'none';
    }

    retryQuizButton.onclick = () => startQuiz(currentQuizLevel); 
    backToLevelsButton.onclick = renderLevelSelector;
}

function loadProgress() {
    if (LEVEL_ORDER.length > 0) {
        unlockedLevels = new Set(LEVEL_ORDER);
    } else {
        unlockedLevels = new Set();
        console.error("LEVEL_ORDER is empty in words.js. Cannot unlock a default level.");
    }
}

function saveProgress() {
    localStorage.setItem('simpleQuizUnlockedLevels', JSON.stringify(Array.from(unlockedLevels)));
}

// --- 앱 시작 ---
function initializeApp() {
    if (typeof WORDS_DATA === 'undefined' || typeof LEVEL_ORDER === 'undefined') {
        document.body.innerHTML = '<div class="h-screen flex flex-col items-center justify-center p-4"><p class="text-red-500 text-center text-lg">Error: words.js 파일이 제대로 로드되지 않았거나, 필요한 변수(WORDS_DATA, LEVEL_ORDER)가 없습니다. <br/>words.js 파일을 확인해주세요.</p> <p class="mt-4 text-slate-600">콘솔(F12)에서 자세한 오류를 확인할 수 있습니다.</p></div>';
        console.error("WORDS_DATA or LEVEL_ORDER is missing. Check words.js loading and content.");
        return;
    }
    
    const tempQuizViewContainer = document.getElementById('quiz-view-container');
    if (tempQuizViewContainer) {
        initialQuizViewHTML = tempQuizViewContainer.innerHTML;
        console.log("[DEBUG] Initial quiz view HTML saved.");
    } else {
        console.error("[DEBUG] initializeApp: quiz-view-container not found. Cannot save initial HTML.");
    }
    reassignQuizViewElements(); // 앱 시작 시 전역 참조 설정

    quizViewContainer.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'next-question-button') {
            console.log("[DEBUG] Next question button clicked via event delegation.");
            currentQuestionIndex++;
            renderQuestion();
        }
    });
    
    resetProgressButton.onclick = () => {
        if (confirm("정말로 모든 진행 상황을 초기화하시겠습니까? (모든 레벨이 열린 상태로 유지됩니다)")) {
            localStorage.removeItem('simpleQuizUnlockedLevels'); 
            loadProgress(); 
            renderLevelSelector(); 
            const notification = document.createElement('div');
            notification.textContent = '진행 상황이 초기화되었습니다.';
            notification.className = 'fixed bottom-4 right-4 bg-slate-700 text-white p-3 rounded-lg shadow-md animate-pulse';
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    };

    loadProgress(); 
    renderLevelSelector();
}

document.addEventListener('DOMContentLoaded', initializeApp);