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

// NEW: 설정 모달 관련 UI 요소들
const settingsButton = document.getElementById('settings-button');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsButton = document.getElementById('close-settings-button');
const saveSettingsButton = document.getElementById('save-settings-button');
const questionsPerQuizInput = document.getElementById('questions-per-quiz-input');
const questionsPerQuizValue = document.getElementById('questions-per-quiz-value');
const optionsCountGroup = document.getElementById('options-count-group');
const levelUpPercentageInput = document.getElementById('level-up-percentage-input');
const levelUpPercentageValue = document.getElementById('level-up-percentage-value');


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
let speakButton; // 발음 듣기 버튼

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
let ALL_WORDS_DATA = []; // NEW: word_bank.txt에서 로드한 모든 단어 데이터
let availableVoices = []; // NEW: Web Speech API에서 사용 가능한 목소리 목록

// NEW: 정답 맞춘 문제와 틀린 문제 ID를 관리
let answeredCorrectlyWordIdsByLevel = {}; // { '초급': Set<string>, '중급': Set<string> } - 이전에 정답을 맞춘 문제 ID
let incorrectWordIdsByLevel = {};       // { '초급': Set<string>, '중급': Set<string> } - 이전에 틀렸던 문제 ID

let isAnswered = false; // 사용자가 현재 질문에 답했는지 여부

// NEW: 사용자 설정
let userConfig = {
    questionsPerQuiz: QUESTIONS_PER_QUIZ, // config.js의 기본값으로 시작
    optionsCount: OPTIONS_COUNT,
    levelUpThreshold: LEVEL_UP_THRESHOLD_PERCENTAGE
};

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

// --- 발음 듣기 함수 (Web Speech API) ---
function speak(text) {
    if ('speechSynthesis' in window) {
        // 진행 중인 다른 발음이 있다면 중지
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US'; // 언어 설정
        utterance.rate = 0.9;     // 발음 속도 (기본값 1)
        utterance.pitch = 1;    // 음높이 (기본값 1)

        // NEW: 특정 목소리 지정 (사용 가능한 경우)
        if (availableVoices.length > 0) {
            // 선호하는 목소리 목록 (품질이 좋은 순서대로)
            const preferredVoices = [
                'Google US English', // Google Chrome (PC/Android)
                'Samantha',          // Apple (macOS/iOS) - 기본 목소리
                'Alex',              // Apple (macOS) - 고품질 목소리
                'Microsoft Zira - English (United States)', // Microsoft Edge
                'Microsoft David - English (United States)' // Microsoft Edge
            ];

            let selectedVoice = null;

            // 1. 선호하는 목소리가 있는지 확인
            for (const voiceName of preferredVoices) {
                selectedVoice = availableVoices.find(voice => voice.name === voiceName && voice.lang === 'en-US');
                if (selectedVoice) break;
            }

            // 2. 선호하는 목소리가 없으면, 해당 언어의 기본(default) 목소리 찾기
            if (!selectedVoice) {
                selectedVoice = availableVoices.find(voice => voice.lang === 'en-US' && voice.default);
            }
            
            // 3. 그것도 없으면, 사용 가능한 첫 번째 en-US 목소리 사용
            if (!selectedVoice) {
                selectedVoice = availableVoices.find(voice => voice.lang === 'en-US');
            }

            utterance.voice = selectedVoice;
        }

        window.speechSynthesis.speak(utterance);
    } else {
        console.warn('Web Speech API is not supported in this browser.');
    }
}

// --- 화면 전환 함수 ---
function showScreen(screenToShow) {
    levelSelectorContainer.style.display = 'none';
    quizViewContainer.style.display = 'none';
    resultScreenContainer.style.display = 'none';
    quizModeSelector.style.display = 'none'; // 퀴즈 모드 선택 UI도 숨김

    screenToShow.style.display = 'block';
}

// --- 설정 모달 함수 ---
function openSettingsModal() {
    if (!settingsModal || !questionsPerQuizInput || !questionsPerQuizValue) return;
    
    // 현재 설정값으로 UI 업데이트
    questionsPerQuizInput.value = userConfig.questionsPerQuiz;
    questionsPerQuizValue.textContent = userConfig.questionsPerQuiz;
    levelUpPercentageInput.value = userConfig.levelUpThreshold;
    levelUpPercentageValue.textContent = `${userConfig.levelUpThreshold}%`;

    // 라디오 버튼 활성화 상태 업데이트
    if (optionsCountGroup) {
        const buttons = optionsCountGroup.querySelectorAll('.settings-radio-button');
        buttons.forEach(btn => {
            if (parseInt(btn.dataset.value, 10) === userConfig.optionsCount) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    settingsModal.style.display = 'flex';
    // 애니메이션을 위해 약간의 딜레이 후 클래스 추가
    setTimeout(() => {
        settingsModal.classList.add('visible');
    }, 10); 
}

function closeSettingsModal() {
    if (!settingsModal) return;

    settingsModal.classList.remove('visible');
    // 애니메이션이 끝난 후 display: none 처리
    setTimeout(() => {
        settingsModal.style.display = 'none';
    }, 300); // style.css의 transition 시간과 일치
}

// NEW: 사용 가능한 목소리를 로드하는 함수
function loadVoices() {
    if ('speechSynthesis' in window) {
        availableVoices = window.speechSynthesis.getVoices();
        console.log("[DEBUG] Voices loaded:", availableVoices.map(v => `${v.name} (${v.lang})`));
    }
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
    speakButton = document.getElementById('speak-button');
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
                               .map(id => ALL_WORDS_DATA.find(word => word.id === id))
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
        const allLevelWords = ALL_WORDS_DATA.filter(word => word.level === currentQuizLevel);
        
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
        if (newWords.length < userConfig.questionsPerQuiz) {
            console.warn(`[DEBUG] Not enough new words (${newWords.length}) for ${userConfig.questionsPerQuiz} questions. Reusing answered words.`);
            wordsToChooseFrom = allLevelWords; // 모든 단어를 다시 포함
            // 사용자에게 알림을 줄 수도 있습니다: "새로운 문제가 모두 소진되어, 이전에 맞췄던 문제가 포함됩니다."
        } else {
            wordsToChooseFrom = newWords;
        }
    }
    
    currentQuestions = shuffleArray(wordsToChooseFrom).slice(0, userConfig.questionsPerQuiz);
    console.log(`[DEBUG] Final questions for quiz: ${currentQuestions.length}`);

    // 최종적으로 문제가 0개일 경우 처리
    if (currentQuestions.length === 0) {
        quizViewContainer.innerHTML = `
            <div class="text-center p-4 text-white">
                <p class="text-red-300 mb-4">선택하신 레벨(${currentQuizLevel})에 출제할 문제가 현재 없습니다. <br/>word_bank.txt 파일에 단어를 추가하거나, 진행 상황을 초기화해보세요.</p>
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

    // 질문이 나타날 때 자동으로 발음 재생
    speak(questionData.english);

    // 스피커 아이콘을 클릭하면 발음이 다시 나오도록 이벤트 리스너 추가
    if (speakButton) {
        speakButton.onclick = () => speak(questionData.english);
    }

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
    let distractors = ALL_WORDS_DATA
        .filter(word => word.korean !== correctAnswer && word.level === correctWord.level)
        .map(word => word.korean);

    if (distractors.length < userConfig.optionsCount - 1) {
        const globalDistractors = ALL_WORDS_DATA
            .filter(word => word.korean !== correctAnswer && !distractors.includes(word.korean))
            .map(word => word.korean);
        distractors = [...new Set([...distractors, ...globalDistractors])]; 
    }

    distractors = shuffleArray(distractors).slice(0, userConfig.optionsCount - 1);

    let tempDistractorCount = 1;
    while (distractors.length < userConfig.optionsCount - 1) {
        const tempDist = `오답${tempDistractorCount++}`;
        if (tempDist !== correctAnswer && !distractors.includes(tempDist)) {
            distractors.push(tempDist);
        } else if (tempDistractorCount > 200) { 
            console.warn("Could not generate enough unique distractors. Using generic fallbacks.");
            break; 
        }
    }

    const finalOptions = shuffleArray([correctAnswer, ...distractors]);
    return finalOptions.slice(0, userConfig.optionsCount);
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
    const passed = percentage >= userConfig.levelUpThreshold;

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

    resultMessageText.textContent = passed ? '축하합니다! 레벨을 통과했습니다.' : `아쉬워요! (${userConfig.levelUpThreshold}% 이상 필요)`;
    
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

function loadUserConfig() {
    try {
        const storedConfig = localStorage.getItem('simpleQuizUserConfig');
        if (storedConfig) {
            const parsedConfig = JSON.parse(storedConfig);
            // 저장된 값이 유효한지 확인하고 병합
            if (parsedConfig.questionsPerQuiz && typeof parsedConfig.questionsPerQuiz === 'number') {
                userConfig.questionsPerQuiz = parsedConfig.questionsPerQuiz;
            }
            if (parsedConfig.optionsCount && typeof parsedConfig.optionsCount === 'number') {
                userConfig.optionsCount = parsedConfig.optionsCount;
            }
            if (parsedConfig.levelUpThreshold && typeof parsedConfig.levelUpThreshold === 'number') {
                userConfig.levelUpThreshold = parsedConfig.levelUpThreshold;
            }
            console.log("[DEBUG] Loaded user config:", userConfig);
        } else {
            console.log("[DEBUG] No user config found, using defaults.");
        }
    } catch (e) {
        console.error("Failed to load user config from localStorage:", e);
        // 기본값 사용
        userConfig.questionsPerQuiz = QUESTIONS_PER_QUIZ;
        userConfig.optionsCount = OPTIONS_COUNT;
        userConfig.levelUpThreshold = LEVEL_UP_THRESHOLD_PERCENTAGE;
    }
}

function saveUserConfig() {
    localStorage.setItem('simpleQuizUserConfig', JSON.stringify(userConfig));
    console.log("[DEBUG] Saved user config:", userConfig);
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
async function initializeApp() {
    // config.js의 필수 변수들이 로드되었는지 확인
    if (typeof LEVEL_ORDER === 'undefined' || typeof QUESTIONS_PER_QUIZ === 'undefined' || 
        typeof DifficultyLevel === 'undefined' || 
        typeof OPTIONS_COUNT === 'undefined' || typeof LEVEL_UP_THRESHOLD_PERCENTAGE === 'undefined') {
        document.body.innerHTML = `
            <div class="min-h-screen flex flex-col items-center justify-center p-4 text-white">
                <p class="text-red-300 text-center text-lg">
                    오류: config.js 파일이 제대로 로드되지 않았거나, <br/>
                    필요한 설정 변수(LEVEL_ORDER 등)가 없습니다. <br/>
                    config.js 파일을 확인해주세요.
                </p> 
                <p class="mt-4 text-white/60">콘솔(F12)에서 자세한 오류를 확인할 수 있습니다.</p>
            </div>`;
        console.error("Critical variables from config.js are missing. Check config.js loading and content.");
        return;
    }

    // NEW: word_bank.txt에서 단어 데이터 로드 및 파싱
    try {
        // Cache-busting: Add a unique query parameter to prevent the browser from using an old, cached version of the file.
        // This ensures that any changes to the word bank are immediately reflected in the app.
        const cacheBuster = `v=${new Date().getTime()}`;
        const response = await fetch(`word_bank.txt?${cacheBuster}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const textData = await response.text();

        let currentLevel = '';
        const levelMapping = {
            '초급': DifficultyLevel.BEGINNER,
            '중급': DifficultyLevel.INTERMEDIATE,
            '고급': DifficultyLevel.ADVANCED
        };

        const lines = textData.split('\n');
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('// ---')) {
                const levelName = trimmedLine.replace('// ---', '').replace('---', '').trim();
                currentLevel = levelMapping[levelName] || '';
            } else if (trimmedLine && currentLevel) {
                // 쉼표(,)를 기준으로 영어와 한글 부분을 나눔 (더 견고한 방식)
                const firstCommaIndex = trimmedLine.indexOf(',');
                if (firstCommaIndex !== -1) {
                    const englishPart = trimmedLine.substring(0, firstCommaIndex).trim();
                    const koreanPart = trimmedLine.substring(firstCommaIndex + 1).trim();

                    // '/'로 구분된 여러 항목 처리
                    const englishEntries = englishPart.split('/').map(s => s.trim());
                    const koreanEntries = koreanPart.split('/').map(s => s.trim());

                    // 영어와 한글 항목의 수가 일치하는 경우, 각각을 별도의 단어로 추가
                    if (englishEntries.length > 1 && englishEntries.length === koreanEntries.length) {
                        for (let i = 0; i < englishEntries.length; i++) {
                            const english = englishEntries[i];
                            const korean = koreanEntries[i];
                            if (english && korean) {
                                ALL_WORDS_DATA.push({ id: english, english: english, korean: korean, level: currentLevel });
                            }
                        }
                    } else {
                        // 항목 수가 맞지 않거나 '/'가 없는 경우, 전체를 하나의 단어로 처리
                        if (englishPart && koreanPart) {
                            ALL_WORDS_DATA.push({
                                id: englishPart,
                                english: englishPart,
                                korean: koreanPart,
                                level: currentLevel
                            });
                        }
                    }
                }
            }
        }
        console.log(`[DEBUG] Successfully loaded and parsed ${ALL_WORDS_DATA.length} words and phrases.`);

    } catch (error) {
        document.body.innerHTML = `
            <div class="min-h-screen flex flex-col items-center justify-center p-4 text-white">
                <p class="text-red-300 text-center text-lg">
                    오류: word_bank.txt 파일을 불러올 수 없습니다. <br/>
                    파일이 올바른 위치에 있는지, 서버가 파일을 제공하는지 확인해주세요.
                </p> 
            </div>`;
        console.error("Failed to fetch or parse word_bank.txt:", error);
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
    
    // 모든 이벤트 리스너를 한 곳에서 초기화
    initializeEventListeners();

    // 앱 시작 시 진행 상황 로드 및 레벨 선택 화면 렌더링
    loadUserConfig();
    loadProgress(); 
    renderLevelSelector();

    // NEW: Web Speech API 목소리 로드
    if ('speechSynthesis' in window) {
        // 브라우저에 따라 getVoices()가 비동기적으로 작동하므로,
        // voiceschanged 이벤트가 발생했을 때 목소리 목록을 가져옵니다.
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }
        loadVoices(); // 초기 로드 시도 (일부 브라우저에서는 즉시 목록 반환)
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = 'fixed bottom-4 right-4 glass text-white p-3 rounded-lg shadow-md animate-pulse z-50';
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// --- 이벤트 리스너 초기화 ---
function initializeEventListeners() {
    if (!settingsButton || !closeSettingsButton || !saveSettingsButton || !questionsPerQuizInput || !settingsModal || !nextQuestionButton || !resetProgressButton || !optionsCountGroup || !levelUpPercentageInput) {
        console.error("One or more UI elements for event listeners are missing.");
        return;
    }

    // 설정 모달 이벤트 리스너
    settingsButton.addEventListener('click', openSettingsModal);
    closeSettingsButton.addEventListener('click', closeSettingsModal);
    saveSettingsButton.addEventListener('click', () => {
        userConfig.questionsPerQuiz = parseInt(questionsPerQuizInput.value, 10);
        const activeOptionButton = optionsCountGroup.querySelector('.active');
        if (activeOptionButton) {
            userConfig.optionsCount = parseInt(activeOptionButton.dataset.value, 10);
        }
        userConfig.levelUpThreshold = parseInt(levelUpPercentageInput.value, 10);
        saveUserConfig();
        closeSettingsModal();
        showNotification('설정이 저장되었습니다.');
    });
    questionsPerQuizInput.addEventListener('input', (e) => {
        questionsPerQuizValue.textContent = e.target.value;
    });
    levelUpPercentageInput.addEventListener('input', (e) => {
        levelUpPercentageValue.textContent = `${e.target.value}%`;
    });
    optionsCountGroup.addEventListener('click', (e) => {
        if (e.target.classList.contains('settings-radio-button')) {
            // 모든 버튼에서 active 클래스 제거
            optionsCountGroup.querySelectorAll('.settings-radio-button').forEach(btn => btn.classList.remove('active'));
            // 클릭된 버튼에만 active 클래스 추가
            e.target.classList.add('active');
        }
    });
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettingsModal();
        }
    });

    // 다음 문제 버튼 (한 번만 연결)
    // 참고: 이 버튼은 퀴즈 뷰가 다시 렌더링될 때 DOM에서 제거될 수 있습니다.
    // 더 견고한 방법은 상위 컨테이너에 이벤트 위임을 사용하는 것입니다.
    nextQuestionButton.addEventListener('click', () => {
        currentQuestionIndex++;
        renderQuestion();
    });

    // 진행 상황 초기화 버튼 (onclick 대신 addEventListener 사용으로 통일)
    resetProgressButton.addEventListener('click', () => {
        if (confirm("정말로 모든 진행 상황을 초기화하시겠습니까? (레벨 잠금 해제, 정답/오답 문제 기록이 모두 초기화됩니다)")) {
            localStorage.removeItem('simpleQuizUnlockedLevels');
            localStorage.removeItem('simpleQuizAnsweredCorrectlyWords');
            localStorage.removeItem('simpleQuizIncorrectWords');
            localStorage.removeItem('simpleQuizUserConfig'); // 설정도 초기화

            // 메모리상의 변수도 초기화
            unlockedLevels = new Set();
            answeredCorrectlyWordIdsByLevel = {};
            incorrectWordIdsByLevel = {};
            userConfig.questionsPerQuiz = QUESTIONS_PER_QUIZ; // 기본값으로 복원
            userConfig.optionsCount = OPTIONS_COUNT;
            userConfig.levelUpThreshold = LEVEL_UP_THRESHOLD_PERCENTAGE;

            loadProgress();
            renderLevelSelector();
            showNotification('진행 상황이 초기화되었습니다.');
        }
    });
}

// DOM이 완전히 로드된 후 앱 초기화 함수를 실행
document.addEventListener('DOMContentLoaded', initializeApp);