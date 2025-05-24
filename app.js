// app.js

// --- HTML 요소 참조 ---
const appContainer = document.getElementById('app-container');
const levelSelectorContainer = document.getElementById('level-selector-container');
const levelButtonsWrapper = document.getElementById('level-buttons-wrapper');
const quizViewContainer = document.getElementById('quiz-view-container');
const resultScreenContainer = document.getElementById('result-screen-container');
const resetProgressButton = document.getElementById('reset-progress-button');

const currentLevelDisplay = document.getElementById('current-level-display');
const scoreDisplay = document.getElementById('score-display');
const progressBar = document.getElementById('progress-bar');
const questionNumberDisplay = document.getElementById('question-number-display');
const questionTextElement = document.getElementById('question-text');
const optionsGrid = document.getElementById('options-grid');
const feedbackMessageElement = document.getElementById('feedback-message');
const nextQuestionButton = document.getElementById('next-question-button');

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
let unlockedLevels = new Set(); // loadProgress에서 모든 레벨을 추가할 예정
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
        button.textContent = levelName; // 텍스트만 설정
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

function startQuiz() {
    showScreen(quizViewContainer);
    
    // 퀴즈 화면의 기본 구조가 있는지 확인하고, 없다면 (예: 이전 오류로 인해 내용이 변경된 경우)
    // 원래의 퀴즈 화면 구조로 복원하거나, 오류 메시지를 표시합니다.
    // quizViewContainer 내부에 특정 ID를 가진 요소가 있는지 확인하는 것이 더 견고할 수 있습니다.
    const quizElementsExist = document.getElementById('question-card') && 
                              document.getElementById('options-grid') &&
                              document.getElementById('feedback-message') &&
                              document.getElementById('next-question-button');

    if (!quizElementsExist) {
        // quizViewContainer의 내용을 원래 HTML 구조로 다시 설정합니다.
        // 이 부분은 index.html의 quiz-view-container 내부 구조와 동일해야 합니다.
        quizViewContainer.innerHTML = `
            <div class="flex justify-between items-center mb-2 text-slate-600">
                <span id="current-level-display" class="text-lg font-semibold"></span>
                <span id="score-display" class="text-lg font-semibold"></span>
            </div>
            <div id="progress-bar-container" class="w-full bg-slate-200 rounded-full h-3 md:h-4 overflow-hidden shadow-inner mb-1">
                <div id="progress-bar" class="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full transition-all duration-300 ease-out" style="width: 0%;"></div>
            </div>
            <p id="question-number-display" class="text-xs text-slate-500 text-right mb-4"></p>
            <div id="question-card" class="p-2 bg-slate-50 rounded-lg">
                <h3 id="question-text" class="text-2xl md:text-3xl font-bold text-center text-slate-800 mb-2"></h3>
                <p class="text-center text-slate-500 mb-6 md:mb-8">위 영어 단어의 뜻으로 알맞은 것은?</p>
                <div id="options-grid" class="grid grid-cols-2 gap-3 md:gap-4"></div>
            </div>
            <div id="feedback-message" class="mt-6 p-3 rounded-md text-center font-semibold text-sm" style="display:none;"></div>
            <button id="next-question-button" class="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2" style="display:none;">다음 문제로</button>
        `;
        // HTML 요소 참조를 다시 설정해야 할 수 있습니다. (위에서 전역으로 선언했으므로, DOM 재생성 후에는 다시 찾아야 함)
        // 하지만 여기서는 일단 renderQuestion에서 해당 요소들에 접근하므로, 그 전에 DOM이 생성되도록 합니다.
        // 더 나은 방법은 initializeApp에서 초기 HTML 구조를 문자열로 저장해두고 필요시 사용하는 것입니다.
    }


    const levelWords = WORDS_DATA.filter(word => word.level === currentQuizLevel);
    currentQuestions = shuffleArray(levelWords).slice(0, QUESTIONS_PER_QUIZ);

    if (currentQuestions.length === 0) {
        // quizViewContainer 내용을 변경하여 오류 메시지 표시
        // (이전 오류 메시지 표시 코드가 이미 quizViewContainer 내용을 덮어썼을 수 있으므로,
        //  위에서 quizElementsExist 체크 후 복원하는 로직과 함께 고려)
        const qc = document.getElementById('quiz-view-container'); // 이미 전역 변수 사용 가능
        qc.innerHTML = `
            <div class="text-center p-4">
                <p class="text-red-500 mb-4">이 레벨(${currentQuizLevel})에 대한 문제가 충분하지 않습니다. <br/>words.js 파일에 단어를 추가해주세요.</p>
                <button onclick="renderLevelSelector()" class="level-button bg-slate-500 hover:bg-slate-600 focus:ring-slate-400">레벨 선택으로 돌아가기</button>
            </div>`;
        return;
    }
    
    currentQuestionIndex = 0;
    score = 0;
    renderQuestion(); // 이제 정상적으로 퀴즈 렌더링
}

function renderQuestion() {
    isAnswered = false;
    
    // HTML 요소들이 제대로 참조되는지 확인 (startQuiz에서 DOM이 재생성되었을 수 있으므로)
    // 전역 변수로 선언된 요소들을 이 함수 범위에서 다시 할당할 필요는 없지만,
    // 만약 startQuiz에서 DOM 구조가 완전히 바뀐다면, 해당 요소들에 대한 참조가 유효한지 확인해야 함.
    // 현재 구조에서는 renderQuestion 호출 시점에는 quizViewContainer 내부 요소들이 존재한다고 가정.
    const feedbackMsgEl = document.getElementById('feedback-message');
    const nextQBtn = document.getElementById('next-question-button');
    const optsGrid = document.getElementById('options-grid');
    const qTextEl = document.getElementById('question-text');
    const currLvlDisplay = document.getElementById('current-level-display');
    const scrDisplay = document.getElementById('score-display');
    const progBar = document.getElementById('progress-bar');
    const qNumDisplay = document.getElementById('question-number-display');


    if (!feedbackMsgEl || !nextQBtn || !optsGrid || !qTextEl || !currLvlDisplay || !scrDisplay || !progBar || !qNumDisplay) {
        console.error("Quiz elements are missing. Cannot render question.");
        // 사용자에게 오류를 알리거나 레벨 선택 화면으로 돌아가도록 처리
        quizViewContainer.innerHTML = `<p class="text-red-500 text-center">퀴즈를 표시하는 데 문제가 발생했습니다. 레벨을 다시 선택해주세요.</p><button onclick="renderLevelSelector()" class="level-button bg-slate-500 hover:bg-slate-600 focus:ring-slate-400 mt-4">레벨 선택</button>`;
        return;
    }


    feedbackMsgEl.style.display = 'none';
    feedbackMsgEl.textContent = '';
    feedbackMsgEl.className = 'mt-6 p-3 rounded-md text-center font-semibold text-sm'; // Reset class
    nextQBtn.style.display = 'none';
    optsGrid.innerHTML = '';

    if (currentQuestionIndex >= currentQuestions.length) {
        renderResultScreen();
        return;
    }

    const questionData = currentQuestions[currentQuestionIndex];
    qTextEl.textContent = `"${questionData.english}"`;
    currLvlDisplay.textContent = `${currentQuizLevel} 퀴즈`;
    scrDisplay.textContent = `점수: ${score} / ${currentQuestions.length}`;
    const progressPercent = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    progBar.style.width = `${progressPercent}%`;
    qNumDisplay.textContent = `문제 ${currentQuestionIndex + 1} / ${currentQuestions.length}`;

    const options = generateOptions(questionData);
    options.forEach(optionText => {
        const optionButton = document.createElement('button');
        optionButton.innerHTML = `<span>${optionText}</span>`; 
        optionButton.classList.add('quiz-option-button', 'default', 'relative'); 
        optionButton.onclick = (event) => handleAnswer(event.currentTarget, optionText, questionData.korean);
        optsGrid.appendChild(optionButton);
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
    
    const feedbackMsgEl = document.getElementById('feedback-message'); // Ensure it's the current one
    const nextQBtn = document.getElementById('next-question-button');   // Ensure it's the current one
    const optsGrid = document.getElementById('options-grid');           // Ensure it's the current one

    const optionButtons = Array.from(optsGrid.children);
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
        feedbackMsgEl.innerHTML = `${feedbackIcon} 정답입니다! 🎉`;
        feedbackMsgEl.className = 'mt-6 p-3 rounded-md text-center font-semibold text-sm bg-green-100 text-green-700 flex items-center justify-center';
    } else {
        feedbackIcon = svgIconXCircleLarge.replace('class="w-8 h-8 text-red-500"', 'class="w-6 h-6 text-red-600 mr-2 inline-block"');
        feedbackMsgEl.innerHTML = `${feedbackIcon} 오답입니다. 정답: ${correctAnswer}`;
        feedbackMsgEl.className = 'mt-6 p-3 rounded-md text-center font-semibold text-sm bg-red-100 text-red-700 flex items-center justify-center';
    }
    feedbackMsgEl.style.display = 'flex'; 
    nextQBtn.style.display = 'block';
    if (currentQuestionIndex >= currentQuestions.length - 1) {
        nextQBtn.textContent = '결과 보기';
    } else {
        nextQBtn.textContent = '다음 문제로';
    }
}

document.getElementById('next-question-button').onclick = () => { // 이 참조는 DOM 로드 시점에 한번 설정되므로, quizViewContainer가 재생성되면 문제가 될 수 있음.
                                                                  // 이벤트 위임이나, 함수 내에서 매번 요소를 찾는 것이 더 안전.
                                                                  // 여기서는 일단 유지하되, startQuiz에서 quizViewContainer가 재생성되는 경우를 위해
                                                                  // nextQuestionButton 참조를 startQuiz 또는 renderQuestion 내부에서 갱신하는 것을 고려.
                                                                  // 또는 initializeApp에서 이벤트 리스너를 설정.
    currentQuestionIndex++;
    renderQuestion();
};
// 위 nextQuestionButton.onclick 핸들러를 initializeApp 내부로 옮기는 것이 더 안전합니다.

// --- 결과 화면 ---
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

// --- 진행 상황 관리 ---
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

// resetProgressButton 이벤트 핸들러는 initializeApp에서 설정하는 것이 좋습니다.
// resetProgressButton.onclick = ...

// --- 앱 시작 ---
function initializeApp() {
    if (typeof WORDS_DATA === 'undefined' || typeof LEVEL_ORDER === 'undefined') {
        document.body.innerHTML = '<div class="h-screen flex flex-col items-center justify-center p-4"><p class="text-red-500 text-center text-lg">Error: words.js 파일이 제대로 로드되지 않았거나, 필요한 변수(WORDS_DATA, LEVEL_ORDER)가 없습니다. <br/>words.js 파일을 확인해주세요.</p> <p class="mt-4 text-slate-600">콘솔(F12)에서 자세한 오류를 확인할 수 있습니다.</p></div>';
        console.error("WORDS_DATA or LEVEL_ORDER is missing. Check words.js loading and content.");
        return;
    }

    // quizViewContainer의 초기 HTML 구조를 저장 (선택적, startQuiz에서 DOM 재생성 시 사용)
    // const initialQuizViewHTML = quizViewContainer.innerHTML; 

    // next-question-button 이벤트 핸들러 설정
    // 전역 변수로 이미 선언된 nextQuestionButton 사용.
    // 만약 quizViewContainer가 동적으로 완전히 재생성되는 경우가 있다면,
    // 이 버튼에 대한 참조가 유효한지 확인하거나, 이벤트 위임을 사용해야 함.
    // 현재 startQuiz에서 quizViewContainer.innerHTML을 덮어쓰는 경우가 있으므로 주의 필요.
    // 가장 안전한 방법은 quizViewContainer에 이벤트 리스너를 달고, #next-question-button 클릭을 감지하는 것(이벤트 위임)
    // 또는 renderQuestion 할 때마다 이벤트 리스너를 새로 할당.
    // 여기서는 initializeApp에서 한번만 설정. startQuiz에서 DOM 재생성 시 이 핸들러가 유실될 수 있음.
    // -> 수정: nextQuestionButton 이벤트 핸들러를 quizViewContainer에 위임하거나 renderQuestion에서 재할당.
    //    여기서는 간단하게, quizViewContainer에 이벤트 리스너 추가하여 위임.

    quizViewContainer.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'next-question-button') {
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