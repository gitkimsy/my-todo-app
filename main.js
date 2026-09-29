/**
 * 나의 할 일 목록 (To-Do List) 메인 스크립트
 * - LocalStorage 자동 저장
 * - 할 일 중복 방지 알림
 * - 전체 / 진행중 / 완료 필터링 기능
 * - 완료 항목 일괄 삭제 기능
 */

// 1. 상태 관리 변수
let todos = []; // 할 일 항목 목록
let currentFilter = 'all'; // 'all', 'active', 'completed'

// LocalStorage 저장 키 정의
const STORAGE_KEY = 'aether_todo_app_data';

// 2. DOM 엘리먼트 참조
const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const totalCountEl = document.getElementById('total-count');
const completedCountEl = document.getElementById('completed-count');
const filterGroup = document.getElementById('filter-group');
const clearCompletedBtn = document.getElementById('clear-completed-btn');

/**
 * 앱 초기화 함수
 */
function initApp() {
    loadTodos();
    bindEvents();
    renderTodos();
}

/**
 * LocalStorage에서 데이터 불러오기
 */
function loadTodos() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        try {
            todos = JSON.parse(savedData);
        } catch (error) {
            console.error('LocalStorage 데이터 로드 실패:', error);
            todos = [];
        }
    }
}

/**
 * LocalStorage에 현재 할 일 데이터 저장
 */
function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

/**
 * 이벤트 리스너 바인딩
 */
function bindEvents() {
    // 1) 추가 버튼 클릭 이벤트
    addBtn.addEventListener('click', handleAddTodo);

    // 2) Enter 키 입력 처리
    todoInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            handleAddTodo();
        }
    });

    // 3) 필터 버튼 그룹 클릭 처리 (전체 / 진행중 / 완료)
    if (filterGroup) {
        filterGroup.addEventListener('click', (e) => {
            const targetBtn = e.target.closest('.filter-btn');
            if (!targetBtn) return;

            // 필터 버튼 활성화 스타일 업데이트
            filterGroup.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            targetBtn.classList.add('active');

            // 현재 선택된 필터 변경 후 리렌더링
            currentFilter = targetBtn.getAttribute('data-filter');
            renderTodos();
        });
    }

    // 4) 완료 항목 일괄 삭제 버튼 클릭 처리
    if (clearCompletedBtn) {
        clearCompletedBtn.addEventListener('click', handleClearCompleted);
    }
}

/**
 * 새로운 할 일 추가 처리 함수 (중복 검사 포함)
 */
function handleAddTodo() {
    const text = todoInput.value.trim();

    // 1. 빈 값 입력 방지
    if (text === '') {
        alert('할 일을 입력하세요');
        todoInput.focus();
        return;
    }

    // 2. 중복 방지 검사 (대소문자 및 띄어쓰기 기준 비교)
    const isDuplicate = todos.some(todo => todo.text.toLowerCase() === text.toLowerCase());
    if (isDuplicate) {
        alert('이미 등록된 할 일입니다');
        todoInput.focus();
        return;
    }

    // 새로운 할 일 객체 생성
    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false
    };

    // 배열 추가 및 저장
    todos.push(newTodo);
    saveTodos();

    // 입력창 초기화
    todoInput.value = '';
    todoInput.focus();

    // 화면 업데이트
    renderTodos();
}

/**
 * 완료 상태 토글 함수
 */
function toggleTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });

    saveTodos();
    renderTodos();
}

/**
 * 항목 삭제 함수
 */
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);

    saveTodos();
    renderTodos();
}

/**
 * 완료된 모든 항목 일괄 삭제 함수
 */
function handleClearCompleted() {
    const completedCount = todos.filter(t => t.completed).length;

    if (completedCount === 0) {
        alert('삭제할 완료 항목이 없습니다.');
        return;
    }

    todos = todos.filter(t => !t.completed);
    saveTodos();
    renderTodos();
}

/**
 * 통계 숫자 업데이트
 */
function updateStats() {
    const totalCount = todos.length;
    const completedCount = todos.filter(t => t.completed).length;

    if (totalCountEl) totalCountEl.textContent = totalCount;
    if (completedCountEl) completedCountEl.textContent = completedCount;
}

/**
 * 할 일 목록 렌더링 함수 (필터링 적용)
 */
function renderTodos() {
    // 통계 업데이트
    updateStats();

    // 현재 선택된 필터에 맞춰 목록 필터링
    let filteredTodos = todos;
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    }

    // 빈 목록 처리
    if (filteredTodos.length === 0) {
        todoList.innerHTML = '';
        emptyState.style.display = 'block';

        const emptyMessage = emptyState.querySelector('p');
        if (emptyMessage) {
            if (currentFilter === 'active') {
                emptyMessage.textContent = '진행 중인 할 일이 없습니다.';
            } else if (currentFilter === 'completed') {
                emptyMessage.textContent = '완료된 할 일이 없습니다.';
            } else {
                emptyMessage.textContent = '등록된 할 일이 없습니다.';
            }
        }
        return;
    }

    emptyState.style.display = 'none';

    // 필터링된 항목 HTML 생성
    todoList.innerHTML = filteredTodos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}">
            <div class="todo-left">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
                <span class="todo-text">${escapeHTML(todo.text)}</span>
            </div>
            <button class="delete-btn" data-id="${todo.id}" title="삭제">
                <i class="fa-solid fa-trash"></i>
            </button>
        </li>
    `).join('');

    // 이벤트 리스너 바인딩 (체크박스 & 삭제 버튼)
    todoList.querySelectorAll('.todo-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const id = Number(e.target.getAttribute('data-id'));
            toggleTodo(id);
        });
    });

    todoList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = Number(e.currentTarget.getAttribute('data-id'));
            deleteTodo(id);
        });
    });
}

/**
 * HTML 이스케이프 (XSS 예방)
 */
function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// DOM 로드 완료 시 initApp 실행
document.addEventListener('DOMContentLoaded', initApp);
