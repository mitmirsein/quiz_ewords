# 영단어 쑥쑥 (Quiz E-Words) 🚀

"영단어 쑥쑥"은 사용자가 재미있게 영어 단어를 학습할 수 있도록 돕는 웹 기반 퀴즈 애플리케이션입니다. 초급, 중급, 고급 레벨별로 단어 퀴즈를 제공하며, 사용자는 자신의 수준에 맞는 퀴즈를 선택하여 어휘력을 향상시킬 수 있습니다.

✨ **데모 사이트 (Netlify)**: <a href="https://quizeword.netlify.app/" target="_blank" rel="noopener noreferrer">https://quizeword.netlify.app/</a>

## 🌟 주요 기능

*   **레벨별 퀴즈**: 초급, 중급, 고급의 세 가지 난이도로 구분된 단어 학습을 제공합니다.
    *   각 레벨은 한국 중학생 수준에 맞춰 엄선된 100개의 필수 어휘로 구성되어 있습니다.
*   **객관식 퀴즈**: 제시된 영어 단어의 뜻을 4개의 한국어 보기 중에서 선택하는 방식입니다.
*   **즉각적인 피드백**: 정답/오답 여부를 바로 알려주고, 오답 시 정답을 표시합니다.
*   **진행 상황 표시**: 현재 풀고 있는 문제 번호와 전체 문제 수, 누적 점수를 실시간으로 보여줍니다.
*   **결과 화면**: 퀴즈 완료 후 정답률, 맞힌 문제 수, 통과 여부를 상세히 안내합니다.
    *   통과 기준(기본 70%)을 넘으면 다음 레벨 도전을 격려합니다. (현재는 모든 레벨이 기본적으로 열려 있습니다.)
*   **반응형 디자인**: 데스크톱, 태블릿, 모바일 등 다양한 기기에서 학습할 수 있도록 반응형으로 제작되었습니다.
*   **진행 상황 초기화**: 학습 기록을 초기화하고 처음부터 다시 시작할 수 있는 기능을 제공합니다. (단, 현재 모든 레벨은 기본적으로 접근 가능합니다.)

## 🛠️ 사용 기술

*   **Frontend**:
    *   HTML5
    *   CSS3 (Tailwind CSS 프레임워크 활용)
    *   JavaScript (ES6+)
*   **데이터**:
    *   `words.js` 파일 내 JavaScript 배열 형태로 단어 데이터 관리 (초급/중급/고급 각 100단어)
*   **호스팅**:
    *   Netlify

## 🚀 시작하기

### 요구 사항

*   웹 브라우저 (Chrome, Firefox, Safari, Edge 등 최신 버전 권장)

### 로컬에서 실행 방법

1.  이 저장소를 클론하거나 다운로드합니다:
    ```bash
    git clone https://github.com/mitmirsein/quiz_ewords.git
    ```
2.  프로젝트 디렉토리로 이동합니다:
    ```bash
    cd quiz_ewords
    ```
3.  `index.html` 파일을 웹 브라우저에서 엽니다. (별도의 빌드 과정이 필요 없는 순수 HTML/CSS/JS 프로젝트입니다.)

## ⚙️ 프로젝트 구조
Use code with caution.
Markdown
quiz_ewords/
├── index.html # 메인 HTML 파일
├── app.js # 퀴즈 로직 및 애플리케이션 상태 관리
├── words.js # 단어 데이터 및 퀴즈 설정 (레벨, 문제 수 등)
├── style.css # 커스텀 CSS 스타일 (Tailwind CSS와 함께 사용)
└── README.md # 프로젝트 설명 문서
## 📝 주요 설정값 (words.js)

`words.js` 파일 내에서 다음과 같은 주요 설정값을 조정할 수 있습니다:

*   `WORDS_DATA`: 각 레벨별 단어 목록 (영어, 한국어 뜻, 레벨)
*   `QUESTIONS_PER_QUIZ`: 각 퀴즈당 출제되는 문제 수 (현재 `10`으로 설정)
*   `OPTIONS_COUNT`: 각 문제당 보기 개수 (현재 `4`로 설정)
*   `LEVEL_UP_THRESHOLD_PERCENTAGE`: 퀴즈 통과 기준 정답률 (현재 `70`으로 설정)

## 💡 향후 개선 아이디어

*   다양한 퀴즈 유형 추가 (예: 영어 단어 보고 스펠링 맞추기, 한국어 뜻 보고 영어 단어 입력하기)
*   사용자 계정 시스템 도입 및 학습 데이터 저장/분석 기능
*   오답 노트 기능
*   단어장 관리 기능 (단어 추가/수정/삭제 UI)
*   타이머 기능 추가
*   소리 효과 (정답/오답 시)
*   Tailwind CSS 최적화를 위한 빌드 프로세스 도입 (운영 환경 배포 시)

## 🤝 기여하기

이 프로젝트에 기여하고 싶으시다면 언제든지 환영합니다! 다음 방법으로 기여할 수 있습니다:

1.  이 저장소를 Fork합니다.
2.  새로운 기능이나 버그 수정을 위한 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`).
3.  변경 사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`).
4.  브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`).
5.  Pull Request를 생성합니다.

버그를 발견하거나 개선 아이디어가 있다면 언제든지 [Issues](https://github.com/mitmirsein/quiz_ewords/issues) 탭을 통해 알려주세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참고해주세요. (만약 `LICENSE` 파일이 없다면, "특별히 지정된 라이선스가 없습니다." 또는 원하는 라이선스를 명시해주세요.)
Use code with caution.
위와 같이 수정하시면 GitHub에서 README를 볼 때 데모 사이트 링크가 새 창(탭)에서 열릴 것입니다.