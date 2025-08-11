document.addEventListener('DOMContentLoaded', () => {

    // --- 1. 게임 상태 및 데이터 정의 ---
    const state = {
        solvedPuzzles: new Set(),
        foundHints: {}
    };

    // ✨ 수정: 각 퍼즐이 업데이트할 힌트창의 ID를 추가
    const puzzles = {
        'window-obj': {
            title: '🧩 창문 퍼즐',
            puzzle: "창틀에 희미하게 글자가 새겨져 있다.<br>'이 교실에 있는 '이것'의 개수가 비밀번호의 첫 번째 숫자다.'<br>글자 아래에는 스피커 모양의 작은 그림이 그려져 있다.",
            actionText: "단서 확인",
            result: "교실을 둘러보니 스피커는 총 2개다.<br><br><b>[힌트 1] 비밀번호의 첫 번째 숫자는 '2'입니다.</b>",
            hint: '2',
            hintSlotId: 'hint-slot-1' // 첫 번째 힌트 슬롯
        },
        'speaker-obj': {
            title: '🎵 스피커 퍼즐',
            puzzle: "스피커 그릴 안에서 작은 쪽지를 발견했다.<br>'시작과 끝이 없는 도형. 아무것도 없음을 의미하는 숫자. 이것이 바로 두 번째 암호.'",
            actionText: "암호 해독",
            result: "시작과 끝이 없고 '없음'을 의미하는 숫자는 '0'이다.<br><br><b>[힌트 2] 비밀번호의 두 번째 숫자는 '0'입니다.</b>",
            hint: '0',
            hintSlotId: 'hint-slot-2' // 두 번째 힌트 슬롯
        },
        'projector-obj': {
            title: '📽️ 빔프로젝터 퍼즐',
            puzzle: "빔프로젝터를 켜자 스크린에 손바닥 그림과 문장이 나타났다.<br>'교탁 맨 앞줄에 놓인 의자의 수 - 선생님 의자의 수는?'",
            actionText: "개수 세기",
            result: "교탁 바로 앞줄의 의자는 총 6개다.<br> 교탁 뒤 선생님 의자는 1개다.<br><br><b>[힌트 3] 비밀번호의 네 번째 숫자는 '5'입니다.</b>",
            hint: '5',
            hintSlotId: 'hint-slot-4' // 세 번째 힌트 슬롯
        },
        'lectern-obj': {
            title: '📖 교탁 퍼즐',
            puzzle: "교탁 서랍 안의 낡은 일기장 마지막 페이지에 이렇게 적혀있다.<br>'나는 혼자가 아니다. 나와 똑같이 생긴 존재가 항상 나와 함께한다. 우리는 몇 명일까? 이것이 마지막 숫자다.'",
            actionText: "의미 추리",
            result: "'나'와 '나와 똑같이 생긴 존재'가 함께 있다는 것은 쌍둥이, 즉 2명을 의미한다.<br><br><b>[힌트 4] 비밀번호의 세 번째 숫자는 '2'입니다.</b>",
            hint: '2',
            hintSlotId: 'hint-slot-3' // 네 번째 힌트 슬롯
        }
    };

    // --- 2. DOM 요소 선택 ---
    const introModalOverlay = document.getElementById('intro-modal-overlay');
    const startButton = document.getElementById('start-button');

    const clickableObjects = document.querySelectorAll('.clickable-object');
    const puzzleModalOverlay = document.getElementById('puzzle-modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalPuzzle = document.getElementById('modal-puzzle');
    const modalResult = document.getElementById('modal-result');
    const actionButton = document.getElementById('action-button');
    const closeButton = document.getElementById('close-button');
    const passwordSection = document.getElementById('password-section');
    const passwordInput = document.getElementById('password-input');

    const winModalOverlay = document.getElementById('win-modal-overlay');
    const restartButton = document.getElementById('restart-button');

    let currentObjectId = null;

    // --- 3. 이벤트 리스너 설정 ---
    startButton.addEventListener('click', () => { introModalOverlay.style.display = 'none'; });
    restartButton.addEventListener('click', () => { location.reload(); });

    clickableObjects.forEach(obj => {
        obj.addEventListener('click', () => {
            currentObjectId = obj.id;
            if (currentObjectId === 'door-obj') {
                openDoorModal();
            } else {
                openPuzzleModal(currentObjectId);
            }
        });
    });

    closeButton.addEventListener('click', () => { puzzleModalOverlay.style.display = 'none'; });

    actionButton.addEventListener('click', () => {
        if (currentObjectId === 'door-obj') {
            checkPassword();
        } else {
            solvePuzzle();
        }
    });

    // --- 4. 함수 정의 ---
    function openPuzzleModal(objectId) {
        const puzzleData = puzzles[objectId];
        modalTitle.textContent = puzzleData.title;
        modalPuzzle.innerHTML = puzzleData.puzzle;
        actionButton.textContent = puzzleData.actionText;
        passwordSection.classList.add('hidden');

        if (state.solvedPuzzles.has(objectId)) {
            modalResult.innerHTML = puzzleData.result;
            actionButton.classList.add('hidden');
        } else {
            modalResult.innerHTML = "";
            actionButton.classList.remove('hidden');
        }
        puzzleModalOverlay.style.display = 'flex';
    }

    function openDoorModal() {
        if (state.solvedPuzzles.size < Object.keys(puzzles).length) {
            alert(`아직 모든 단서를 찾지 못했습니다.\n현재까지 찾은 단서: ${state.solvedPuzzles.size} / ${Object.keys(puzzles).length}`);
            return;
        }

        modalTitle.textContent = "🚪 탈출구";
        modalPuzzle.textContent = "모든 단서를 찾았다. 힌트 안내판을 참고하여 비밀번호를 입력하고 탈출하자.";
        modalResult.innerHTML = "";
        passwordSection.classList.remove('hidden');
        passwordInput.value = "";
        actionButton.textContent = "탈출 시도";
        actionButton.classList.remove('hidden');
        puzzleModalOverlay.style.display = 'flex';
    }

    // ✨ 수정: 퍼즐 풀이 시 힌트 안내창 업데이트 로직 추가
    function solvePuzzle() {
        const puzzleData = puzzles[currentObjectId];
        modalResult.innerHTML = puzzleData.result;
        actionButton.classList.add('hidden');

        // 처음 푼 문제일 경우에만 상태 업데이트 및 힌트창 갱신
        if (!state.solvedPuzzles.has(currentObjectId)) {
            state.solvedPuzzles.add(currentObjectId);
            state.foundHints[currentObjectId] = puzzleData.hint;
            updateHintPanel(puzzleData.hintSlotId, puzzleData.hint);
        }
    }
    
    // ✨ 추가: 힌트 안내창 업데이트 함수
    function updateHintPanel(slotId, hint) {
        const hintSlot = document.getElementById(slotId);
        if(hintSlot) {
            const label = hintSlot.textContent.split(':')[0]; // '첫 번째 숫자' 같은 라벨 텍스트 추출
            hintSlot.innerHTML = `${label}: <strong>${hint}</strong>`;
        }
    }

    function checkPassword() {
        const correctPassword = "2025";
        if (passwordInput.value === correctPassword) {
            puzzleModalOverlay.style.display = 'none';
            winModalOverlay.style.display = 'flex';
        } else {
            alert("비밀번호가 틀렸습니다. 다시 시도해보세요.");
            passwordInput.value = "";
            passwordInput.focus();
        }
    }
});