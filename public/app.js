// Global State
let currentUser = null;
let currentQuestions = [];
let adminViewMode = 'standard';
let adminAnswersFilter = '';

// Reveal Dashboard State
let revealViewMode = 'anon';
let revealViewModes = {}; // { questionId: 'anon' | 'standard' | 'select' }
let revealedIndividualUsers = {}; // { cacheKey: true }
let revealQuestions = [];
let revealAnswers = [];

// DOM Elements
const mainHeader = document.getElementById('main-header');
const headerLogo = document.getElementById('header-logo');
const headerUsername = document.getElementById('header-username');
const headerRole = document.getElementById('header-role');
const btnLogout = document.getElementById('btn-logout');
const btnRevealMode = document.getElementById('btn-reveal-mode');

// Views
const viewLogin = document.getElementById('view-login');
const viewUserDashboard = document.getElementById('view-user-dashboard');
const viewQuestionDetail = document.getElementById('view-question-detail');
const viewAdminDashboard = document.getElementById('view-admin-dashboard');
const viewRevealIntro = document.getElementById('view-reveal-intro');
const viewRevealDashboard = document.getElementById('view-reveal-dashboard');

// Auth: Cards
const cardLogin = document.getElementById('card-login');
const cardRegister = document.getElementById('card-register');
const linkGoRegister = document.getElementById('link-go-register');
const linkGoLogin = document.getElementById('link-go-login');

// Forms & Inputs
const loginForm = document.getElementById('login-form');
const loginUsernameInput = document.getElementById('login-username');
const loginPasswordInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');

const registerForm = document.getElementById('register-form');
const registerUsernameInput = document.getElementById('register-username');
const registerPasswordInput = document.getElementById('register-password');
const registerError = document.getElementById('register-error');
const registerSuccess = document.getElementById('register-success');

const answerForm = document.getElementById('answer-form');
const dynamicAnswerArea = document.getElementById('dynamic-answer-area');
const detailQId = document.getElementById('detail-q-id');
const detailQType = document.getElementById('detail-q-type');
const detailQStatus = document.getElementById('detail-q-status');
const detailQAnon = document.getElementById('detail-q-anon');
const detailQText = document.getElementById('detail-q-text');
const btnSubmitAnswer = document.getElementById('btn-submit-answer');
const answerSuccess = document.getElementById('answer-success');
const answerError = document.getElementById('answer-error');
const btnBackDashboard = document.getElementById('btn-back-dashboard');

// Admin Elements
const newQuestionForm = document.getElementById('new-question-form');
const qInputEditId = document.getElementById('q-input-edit-id');
const adminFormTitle = document.getElementById('admin-form-title');
const adminFormDesc = document.getElementById('admin-form-desc');
const qInputType = document.getElementById('q-input-type');
const qInputText = document.getElementById('q-input-text');
const qInputAnonymous = document.getElementById('q-input-anonymous');
const optionsFormGroup = document.getElementById('options-form-group');
const optionsContainer = document.getElementById('options-container');
const btnAddOptionField = document.getElementById('btn-add-option-field');
const adminCreateSuccess = document.getElementById('admin-create-success');
const adminCreateError = document.getElementById('admin-create-error');
const btnSubmitQuestion = document.getElementById('btn-submit-question');
const btnCancelEditQuestion = document.getElementById('btn-cancel-edit-question');

const adminQCount = document.getElementById('admin-q-count');
const adminQuestionsTbody = document.getElementById('admin-questions-tbody');
const adminAnsCount = document.getElementById('admin-ans-count');
const adminAnswersTbody = document.getElementById('admin-answers-tbody');

const adminAnswersQFilter = document.getElementById('admin-answers-q-filter');
const btnModeStandard = document.getElementById('btn-mode-standard');
const btnModeAnon = document.getElementById('btn-mode-anon');
const thUsername = document.getElementById('th-username');

// User Question Elements
const btnToggleUserQForm = document.getElementById('btn-toggle-user-q-form');
const userQFormContainer = document.getElementById('user-q-form-container');
const userNewQuestionForm = document.getElementById('user-new-question-form');
const userQInputEditId = document.getElementById('user-q-input-edit-id');
const userFormTitle = document.getElementById('user-form-title');
const userFormDesc = document.getElementById('user-form-desc');
const userQInputType = document.getElementById('user-q-input-type');
const userQInputText = document.getElementById('user-q-input-text');
const userQInputAnonymous = document.getElementById('user-q-input-anonymous');
const userOptionsFormGroup = document.getElementById('user-options-form-group');
const userOptionsContainer = document.getElementById('user-options-container');
const btnUserAddOptionField = document.getElementById('btn-user-add-option-field');
const userQCreateSuccess = document.getElementById('user-q-create-success');
const userQCreateError = document.getElementById('user-q-create-error');
const btnUserSubmitQuestion = document.getElementById('btn-user-submit-question');
const btnUserCancelQuestion = document.getElementById('btn-user-cancel-question');

// Reveal Dashboard Elements
const btnRevealProceed = document.getElementById('btn-reveal-proceed');
const btnRevealBack = document.getElementById('btn-reveal-back');
const btnRevealModeAnon = document.getElementById('btn-reveal-mode-anon');
const btnRevealModeStandard = document.getElementById('btn-reveal-mode-standard');
const revealQuestionsContainer = document.getElementById('reveal-questions-container');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    setupEventListeners();
});

// Setup Listeners
function setupEventListeners() {
    // Login Card toggling
    linkGoRegister?.addEventListener('click', () => {
        cardLogin?.classList.add('hidden');
        cardRegister?.classList.remove('hidden');
        registerError?.classList.add('hidden');
        registerSuccess?.classList.add('hidden');
        registerForm?.reset();
    });
    
    linkGoLogin?.addEventListener('click', () => {
        cardRegister?.classList.add('hidden');
        cardLogin?.classList.remove('hidden');
        loginError?.classList.add('hidden');
        loginForm?.reset();
    });

    // Login Form Submit
    loginForm?.addEventListener('submit', handleLogin);
    
    // Register Form Submit
    registerForm?.addEventListener('submit', handleRegister);
    
    // Logout
    btnLogout?.addEventListener('click', handleLogout);
    
    // Logo Click Navigation
    headerLogo?.addEventListener('click', () => {
        if (!currentUser) {
            showView(viewLogin);
            return;
        }
        if (currentUser.role === 'admin') {
            showView(viewAdminDashboard);
            loadAdminDashboard();
        } else {
            showView(viewUserDashboard);
            loadUserDashboard();
        }
    });
    
    // Header Answer Reveal click
    btnRevealMode?.addEventListener('click', () => {
        showView(viewRevealIntro);
    });
    
    // Reveal Intro proceed click
    btnRevealProceed?.addEventListener('click', () => {
        showView(viewRevealDashboard);
        loadRevealDashboard();
    });
    
    // Reveal Dashboard back click
    btnRevealBack?.addEventListener('click', () => {
        if (currentUser.role === 'admin') {
            showView(viewAdminDashboard);
            loadAdminDashboard();
        } else {
            showView(viewUserDashboard);
            loadUserDashboard();
        }
    });
    
    // Reveal Dashboard: Anon Mode Toggle
    btnRevealModeAnon?.addEventListener('click', () => {
        btnRevealModeAnon.classList.add('active');
        btnRevealModeAnon.style.background = 'var(--primary)';
        btnRevealModeAnon.style.color = 'white';
        btnRevealModeStandard.classList.remove('active');
        btnRevealModeStandard.style.background = 'transparent';
        btnRevealModeStandard.style.color = 'var(--text-muted)';
        
        revealViewMode = 'anon';
        // Set all cards to anonymous mode
        revealQuestions.forEach(q => {
            revealViewModes[q.id] = 'anon';
        });
        renderRevealDashboard();
    });
    
    // Reveal Dashboard: Standard Mode Toggle
    btnRevealModeStandard?.addEventListener('click', () => {
        btnRevealModeStandard.classList.add('active');
        btnRevealModeStandard.style.background = 'var(--primary)';
        btnRevealModeStandard.style.color = 'white';
        btnRevealModeAnon.classList.remove('active');
        btnRevealModeAnon.style.background = 'transparent';
        btnRevealModeAnon.style.color = 'var(--text-muted)';
        
        revealViewMode = 'standard';
        // Set all cards to standard/default mode
        revealQuestions.forEach(q => {
            revealViewModes[q.id] = 'standard';
        });
        renderRevealDashboard();
    });
    
    // Back to dashboard (Question details)
    btnBackDashboard?.addEventListener('click', () => {
        showView(viewUserDashboard);
        loadUserDashboard();
    });
    
    // Answer form submit
    answerForm?.addEventListener('submit', handleAnswerSubmit);
    
    // Admin Type dropdown change (show/hide options input)
    qInputType?.addEventListener('change', (e) => {
        if (e.target.value === 'multiple') {
            optionsFormGroup?.classList.remove('hidden');
            if (optionsContainer?.children.length === 0) {
                // Add initial 2 options
                addOptionField();
                addOptionField();
            }
        } else {
            optionsFormGroup?.classList.add('hidden');
        }
    });
    
    // Add option button in admin
    btnAddOptionField?.addEventListener('click', () => addOptionField());
    
    // Admin form submit (Create or Edit)
    newQuestionForm?.addEventListener('submit', handleQuestionSubmit);
    
    // Admin cancel editing
    btnCancelEditQuestion?.addEventListener('click', () => {
        exitEditMode();
    });

    // User Question Form toggling
    btnToggleUserQForm?.addEventListener('click', () => {
        if (userQFormContainer.classList.contains('hidden')) {
            userQFormContainer.classList.remove('hidden');
            btnToggleUserQForm.innerHTML = '<i class="fa-solid fa-xmark"></i> 닫기';
        } else {
            exitUserQuestionEditMode();
        }
    });

    // User Question Type dropdown change
    userQInputType?.addEventListener('change', (e) => {
        if (e.target.value === 'multiple') {
            userOptionsFormGroup?.classList.remove('hidden');
            if (userOptionsContainer?.children.length === 0) {
                addUserOptionField();
                addUserOptionField();
            }
        } else {
            userOptionsFormGroup?.classList.add('hidden');
        }
    });

    // User Question option field addition
    btnUserAddOptionField?.addEventListener('click', () => addUserOptionField());

    // User Question form submit
    userNewQuestionForm?.addEventListener('submit', handleUserQuestionSubmit);

    // User Question cancel editing
    btnUserCancelQuestion?.addEventListener('click', () => {
        exitUserQuestionEditMode();
    });
    
    // Admin answers dropdown filter
    adminAnswersQFilter?.addEventListener('change', (e) => {
        adminAnswersFilter = e.target.value;
        loadAdminAnswers();
    });
    
    // Admin standard mode toggle
    btnModeStandard?.addEventListener('click', () => {
        btnModeStandard.classList.add('active');
        btnModeStandard.style.background = 'var(--primary)';
        btnModeStandard.style.color = 'white';
        btnModeAnon.classList.remove('active');
        btnModeAnon.style.background = 'transparent';
        btnModeAnon.style.color = 'var(--text-muted)';
        
        adminViewMode = 'standard';
        if (thUsername) thUsername.textContent = '작성자';
        loadAdminAnswers();
    });
    
    // Admin anonymous mode toggle
    btnModeAnon?.addEventListener('click', () => {
        btnModeAnon.classList.add('active');
        btnModeAnon.style.background = 'var(--primary)';
        btnModeAnon.style.color = 'white';
        btnModeStandard.classList.remove('active');
        btnModeStandard.style.background = 'transparent';
        btnModeStandard.style.color = 'var(--text-muted)';
        
        adminViewMode = 'anon';
        if (thUsername) thUsername.textContent = '작성자 (익명)';
        loadAdminAnswers();
    });
    
    // Admin Tabs switcher
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId)?.classList.add('active');
            
            if (tabId === 'tab-answers') {
                loadAdminAnswers();
            } else if (tabId === 'tab-questions') {
                loadAdminQuestions();
            }
        });
    });
}

// Check session on load
async function checkSession() {
    try {
        const response = await fetch('/api/session');
        const data = await response.json();
        if (data.loggedIn) {
            currentUser = data.user;
            setupHeader(currentUser);
            if (currentUser.role === 'admin') {
                showView(viewAdminDashboard);
                loadAdminDashboard();
            } else {
                showView(viewUserDashboard);
                loadUserDashboard();
            }
        } else {
            currentUser = null;
            mainHeader.classList.add('hidden');
            showView(viewLogin);
        }
    } catch (err) {
        console.error('Session check failed', err);
        showView(viewLogin);
    }
}

// Show Header Details
function setupHeader(user) {
    mainHeader.classList.remove('hidden');
    // Only show public answers reveal button in header to admin
    if (user.role === 'admin') {
        btnRevealMode?.classList.remove('hidden');
    } else {
        btnRevealMode?.classList.add('hidden');
    }
    headerUsername.textContent = user.username;
    headerRole.textContent = user.role === 'admin' ? '관리자' : '일반사용자';
    headerRole.className = `role-tag ${user.role}`;
}

// Show Specific View Section
function showView(targetView) {
    [viewLogin, viewUserDashboard, viewQuestionDetail, viewAdminDashboard, viewRevealIntro, viewRevealDashboard].forEach(v => {
        v.classList.add('hidden');
    });
    targetView.classList.remove('hidden');
}

// Handle Register (Sign Up)
async function handleRegister(e) {
    e.preventDefault();
    registerError.classList.add('hidden');
    registerSuccess.classList.add('hidden');
    
    const username = registerUsernameInput.value.trim();
    const password = registerPasswordInput.value;
    
    // Validation
    if (!username) {
        registerError.querySelector('.alert-message').textContent = '아이디를 입력해 주세요.';
        registerError.classList.remove('hidden');
        return;
    }
    if (username.length < 3) {
        registerError.querySelector('.alert-message').textContent = '아이디는 최소 3자 이상이어야 합니다.';
        registerError.classList.remove('hidden');
        return;
    }
    if (!password) {
        registerError.querySelector('.alert-message').textContent = '비밀번호를 입력해 주세요.';
        registerError.classList.remove('hidden');
        return;
    }
    if (password.length < 4) {
        registerError.querySelector('.alert-message').textContent = '비밀번호는 최소 4자 이상이어야 합니다.';
        registerError.classList.remove('hidden');
        return;
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            registerSuccess.classList.remove('hidden');
            setTimeout(() => {
                cardRegister.classList.add('hidden');
                cardLogin.classList.remove('hidden');
                loginUsernameInput.value = username;
                loginPasswordInput.focus();
            }, 1000);
        } else {
            registerError.querySelector('.alert-message').textContent = data.error || '회원가입 실패';
            registerError.classList.remove('hidden');
        }
    } catch (err) {
        registerError.querySelector('.alert-message').textContent = '서버 통신에 실패했습니다.';
        registerError.classList.remove('hidden');
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    loginError.classList.add('hidden');
    
    const username = loginUsernameInput.value;
    const password = loginPasswordInput.value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        if (response.ok) {
            currentUser = data.user;
            setupHeader(currentUser);
            loginForm.reset();
            
            if (currentUser.role === 'admin') {
                showView(viewAdminDashboard);
                loadAdminDashboard();
            } else {
                showView(viewUserDashboard);
                loadUserDashboard();
            }
        } else {
            loginError.querySelector('.alert-message').textContent = data.error || '로그인에 실패했습니다.';
            loginError.classList.remove('hidden');
        }
    } catch (err) {
        loginError.querySelector('.alert-message').textContent = '서버 연결에 실패했습니다.';
        loginError.classList.remove('hidden');
    }
}

// Handle Logout
async function handleLogout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        currentUser = null;
        mainHeader.classList.add('hidden');
        showView(viewLogin);
    } catch (err) {
        console.error('Logout error', err);
    }
}

// Load User Dashboard Data
async function loadUserDashboard() {
    const totalEl = document.getElementById('stat-total');
    const compEl = document.getElementById('stat-completed');
    const pendEl = document.getElementById('stat-pending');
    const countEl = document.getElementById('questions-count');
    const gridEl = document.getElementById('questions-grid');
    
    document.getElementById('user-greeting').textContent = `${currentUser.username}님의 피드백 보드`;
    gridEl.innerHTML = '<div class="loading">질문을 불러오는 중...</div>';
    
    try {
        const response = await fetch('/api/questions');
        if (!response.ok) throw new Error();
        
        currentQuestions = await response.json();
        
        const total = currentQuestions.length;
        const completed = currentQuestions.filter(q => q.answered).length;
        const pending = total - completed;
        
        totalEl.textContent = total;
        compEl.textContent = completed;
        pendEl.textContent = pending;
        countEl.textContent = total;
        
        if (total === 0) {
            gridEl.innerHTML = `
                <div class="empty-state glass-card" style="grid-column: 1/-1; text-align: center; padding: 48px;">
                    <i class="fa-solid fa-folder-open" style="font-size: 40px; color: var(--text-muted); margin-bottom: 16px;"></i>
                    <h3>등록된 질문이 없습니다.</h3>
                    <p style="color: var(--text-muted); margin-top: 8px;">관리자가 질문을 생성할 때까지 대기해 주세요.</p>
                </div>
            `;
            return;
        }
        
        gridEl.innerHTML = '';
        currentQuestions.forEach(q => {
            const card = document.createElement('div');
            card.className = 'question-card';
            card.addEventListener('click', () => openQuestionDetail(q.id));
            
            const typeLabel = getQuestionTypeKorean(q.type);
            const isAnonQ = q.isAnonymous === 'true' || q.isAnonymous === true;
            const anonLabel = isAnonQ ? `<span class="badge-status" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); margin-left: 6px; padding: 2px 6px; font-size: 10px;"><i class="fa-solid fa-user-secret"></i> 익명</span>` : '';
            const statusLabel = q.answered 
                ? `<span class="badge-status completed"><i class="fa-solid fa-circle-check"></i> 완료</span>`
                : `<span class="badge-status pending"><i class="fa-solid fa-circle-notch fa-spin"></i> 미완료</span>`;
            
            const editActions = q.canEdit ? `
                <div class="card-edit-actions" style="display: flex; gap: 8px; align-items: center;">
                    <button class="btn-edit-user-q btn-secondary btn-sm" style="padding: 2px 8px; font-size: 11px;">
                        <i class="fa-solid fa-pen"></i> 수정
                    </button>
                    <button class="btn-delete-user-q btn-secondary btn-sm" style="padding: 2px 8px; font-size: 11px; color: var(--danger); border-color: rgba(239, 68, 68, 0.2);">
                        <i class="fa-solid fa-trash"></i> 삭제
                    </button>
                </div>
            ` : '';

            card.innerHTML = `
                <div>
                    <div class="card-top">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span class="badge-type ${q.type}">${typeLabel}</span>
                            ${anonLabel}
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            ${statusLabel}
                            ${editActions}
                        </div>
                    </div>
                    <div class="question-text-brief">${escapeHtml(q.questionText)}</div>
                </div>
                <div class="card-action-bar">
                    <span style="font-size: 12px; color: var(--text-muted);">
                        ${q.answered ? '답변 수정하기' : '답변하러 가기'}
                    </span>
                    <span class="btn-card-action">
                        ${q.answered ? '수정' : '작성'} <i class="fa-solid fa-arrow-right"></i>
                    </span>
                </div>
            `;
            
            if (q.canEdit) {
                const btnEdit = card.querySelector('.btn-edit-user-q');
                const btnDel = card.querySelector('.btn-delete-user-q');
                
                btnEdit?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    enterUserQuestionEditMode(q);
                });
                
                btnDel?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleDeleteUserQuestion(q.id);
                });
            }
            
            gridEl.appendChild(card);
        });
    } catch (err) {
        gridEl.innerHTML = '<div class="alert-box error">질문을 불러오는 데 실패했습니다.</div>';
    }
}

// Open Question Detail View
function openQuestionDetail(questionId) {
    const q = currentQuestions.find(question => question.id === questionId);
    if (!q) return;
    
    // Clear alerts
    answerSuccess.classList.add('hidden');
    answerError.classList.add('hidden');
    
    detailQId.value = q.id;
    detailQText.textContent = q.questionText;
    
    // Type badge
    detailQType.className = `badge-type ${q.type}`;
    detailQType.textContent = getQuestionTypeKorean(q.type);
    
    // Status badge
    if (q.answered) {
        detailQStatus.className = 'badge-status completed';
        detailQStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> 완료됨';
    } else {
        detailQStatus.className = 'badge-status pending';
        detailQStatus.innerHTML = '<i class="fa-solid fa-clock"></i> 미완료';
    }
    
    // Anonymous badge
    if (q.isAnonymous === 'true' || q.isAnonymous === true) {
        detailQAnon.style.display = 'inline-block';
    } else {
        detailQAnon.style.display = 'none';
    }
    
    // Render answer area dynamically based on question type
    dynamicAnswerArea.innerHTML = '';
    
    if (q.type === 'subjective') {
        dynamicAnswerArea.innerHTML = `
            <div class="subjective-input-wrapper">
                <label for="answer-input" style="display:none;">주관식 답변</label>
                <input type="text" id="answer-input" placeholder="답변을 입력해 주세요 (단답형)" required value="${escapeHtml(q.userAnswer || '')}">
            </div>
        `;
    } else if (q.type === 'essay') {
        dynamicAnswerArea.innerHTML = `
            <div class="essay-textarea-wrapper">
                <label for="answer-input" style="display:none;">서술형 답변</label>
                <textarea id="answer-input" rows="6" placeholder="답변을 구체적으로 서술해 주세요..." required>${escapeHtml(q.userAnswer || '')}</textarea>
            </div>
        `;
    } else if (q.type === 'multiple') {
        const container = document.createElement('div');
        container.className = 'multiple-options-list';
        
        q.options.forEach((opt, idx) => {
            const isChecked = q.userAnswer === opt;
            const optionDiv = document.createElement('div');
            optionDiv.className = `option-item ${isChecked ? 'selected' : ''}`;
            
            const radioId = `opt_${idx}`;
            optionDiv.innerHTML = `
                <input type="radio" name="multiple-answer" id="${radioId}" value="${escapeHtml(opt)}" ${isChecked ? 'checked' : ''}>
                <label for="${radioId}" style="width:100%; cursor:pointer; margin-bottom:0; font-weight:500;">
                    ${escapeHtml(opt)}
                </label>
            `;
            
            // Highlight selected option on click
            optionDiv.addEventListener('click', (e) => {
                if (e.target.tagName !== 'INPUT') {
                    const radio = optionDiv.querySelector('input[type="radio"]');
                    radio.checked = true;
                }
                document.querySelectorAll('.option-item').forEach(el => el.classList.remove('selected'));
                optionDiv.classList.add('selected');
            });
            
            container.appendChild(optionDiv);
        });
        
        dynamicAnswerArea.appendChild(container);
    }
    
    showView(viewQuestionDetail);
}

// Handle Answer Submit (Create/Update answer)
async function handleAnswerSubmit(e) {
    e.preventDefault();
    answerSuccess.classList.add('hidden');
    answerError.classList.add('hidden');
    btnSubmitAnswer.disabled = true;
    
    const questionId = detailQId.value;
    let answer = '';
    
    const q = currentQuestions.find(question => question.id === questionId);
    if (q.type === 'multiple') {
        const checkedRadio = document.querySelector('input[name="multiple-answer"]:checked');
        if (checkedRadio) {
            answer = checkedRadio.value;
        }
    } else {
        const inputEl = document.getElementById('answer-input');
        if (inputEl) {
            answer = inputEl.value;
        }
    }
    
    if (!answer || answer.trim() === '') {
        answerError.querySelector('.alert-message').textContent = '답변 내용을 입력하거나 문항을 선택해 주세요.';
        answerError.classList.remove('hidden');
        btnSubmitAnswer.disabled = false;
        return;
    }
    
    try {
        const response = await fetch('/api/answers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionId, answer })
        });
        
        const data = await response.json();
        if (response.ok) {
            answerSuccess.classList.remove('hidden');
            setTimeout(() => {
                btnSubmitAnswer.disabled = false;
                showView(viewUserDashboard);
                loadUserDashboard();
            }, 1500);
        } else {
            answerError.querySelector('.alert-message').textContent = data.error || '답변 제출 도중 오류가 발생했습니다.';
            answerError.classList.remove('hidden');
            btnSubmitAnswer.disabled = false;
        }
    } catch (err) {
        answerError.querySelector('.alert-message').textContent = '서버 연결에 실패했습니다.';
        answerError.classList.remove('hidden');
        btnSubmitAnswer.disabled = false;
    }
}

// Load Admin Dashboard
function loadAdminDashboard() {
    loadAdminQuestions();
    populateQuestionsFilter();
    loadAdminAnswers();
}

// Populate Admin Question Selection Dropdown
async function populateQuestionsFilter() {
    try {
        const response = await fetch('/api/questions');
        if (!response.ok) return;
        const questions = await response.json();
        
        const prevValue = adminAnswersQFilter.value;
        adminAnswersQFilter.innerHTML = '<option value="">모든 질문 답변 보기</option>';
        
        questions.forEach(q => {
            const opt = document.createElement('option');
            opt.value = q.id;
            opt.textContent = `[${getQuestionTypeKorean(q.type)}] ${q.questionText}`;
            adminAnswersQFilter.appendChild(opt);
        });
        
        // Restore selection if question still exists
        if (questions.some(q => q.id === prevValue)) {
            adminAnswersQFilter.value = prevValue;
        } else {
            adminAnswersFilter = '';
        }
    } catch (err) {
        console.error('Failed to populate dropdown filter', err);
    }
}

// Admin: Load Registered Questions
async function loadAdminQuestions() {
    adminQuestionsTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">불러오는 중...</td></tr>';
    
    try {
        const response = await fetch('/api/questions');
        if (!response.ok) throw new Error();
        
        const questions = await response.json();
        adminQCount.textContent = questions.length;
        
        if (questions.length === 0) {
            adminQuestionsTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">등록된 질문이 없습니다.</td></tr>';
            return;
        }
        
        adminQuestionsTbody.innerHTML = '';
        questions.forEach(q => {
            const tr = document.createElement('tr');
            const typeLabel = getQuestionTypeKorean(q.type);
            const optCount = q.type === 'multiple' ? q.options.length : '-';
            
            const isAnonQ = q.isAnonymous === 'true' || q.isAnonymous === true;
            const anonBadge = isAnonQ ? `<span class="badge-status" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); margin-left: 6px; padding: 2px 6px; font-size: 10px;"><i class="fa-solid fa-user-secret"></i> 익명</span>` : '';
            
            const actionTd = document.createElement('td');
            actionTd.style.display = 'flex';
            actionTd.style.gap = '8px';
            
            const btnEdit = document.createElement('button');
            btnEdit.className = 'btn-secondary btn-sm';
            btnEdit.innerHTML = '<i class="fa-solid fa-pen"></i> 수정';
            btnEdit.addEventListener('click', () => enterEditMode(q));
            
            const btnDel = document.createElement('button');
            btnDel.className = 'btn-secondary btn-sm';
            btnDel.style.borderColor = 'rgba(239, 68, 68, 0.2)';
            btnDel.style.color = 'var(--danger)';
            btnDel.innerHTML = '<i class="fa-solid fa-trash"></i> 삭제';
            btnDel.addEventListener('click', () => handleDeleteQuestion(q.id));
            
            actionTd.appendChild(btnEdit);
            actionTd.appendChild(btnDel);
            
            tr.innerHTML = `
                <td>
                    <div style="display:flex; align-items:center;">
                        <span class="badge-type ${q.type}">${typeLabel}</span>
                        ${anonBadge}
                    </div>
                </td>
                <td style="font-weight: 500;">${escapeHtml(q.questionText)}</td>
                <td><code>${optCount}</code></td>
            `;
            tr.appendChild(actionTd);
            adminQuestionsTbody.appendChild(tr);
        });
    } catch (err) {
        adminQuestionsTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: var(--danger);">불러오기 실패</td></tr>';
    }
}

// Enter Edit Mode (fills form)
function enterEditMode(q) {
    qInputEditId.value = q.id;
    adminFormTitle.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> 질문 수정하기';
    adminFormDesc.textContent = '선택한 질문의 유형과 내용을 수정합니다.';
    btnSubmitQuestion.innerHTML = '<i class="fa-solid fa-circle-check"></i> 수정 완료';
    btnCancelEditQuestion.classList.remove('hidden');
    
    qInputType.value = q.type;
    qInputText.value = q.questionText;
    qInputAnonymous.checked = q.isAnonymous === 'true' || q.isAnonymous === true;
    
    optionsContainer.innerHTML = '';
    if (q.type === 'multiple') {
        optionsFormGroup.classList.remove('hidden');
        q.options.forEach((opt, idx) => {
            const row = document.createElement('div');
            row.className = 'option-field-row';
            row.id = `option_row_${idx}`;
            row.innerHTML = `
                <label for="opt_input_${idx}" style="display:none;">문항 ${idx + 1}</label>
                <input type="text" id="opt_input_${idx}" class="multiple-option-input" placeholder="문항 ${idx + 1} 내용을 입력하세요" required value="${escapeHtml(opt)}">
                <button type="button" class="btn-remove-option" onclick="removeOptionField(${idx})">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;
            optionsContainer.appendChild(row);
        });
    } else {
        optionsFormGroup.classList.add('hidden');
    }
}

// Exit Edit Mode
function exitEditMode() {
    newQuestionForm.reset();
    qInputEditId.value = '';
    adminFormTitle.innerHTML = '<i class="fa-solid fa-plus-circle"></i> 새 질문 생성하기';
    adminFormDesc.textContent = '다양한 형식의 질문을 만들어 사용자에게 배정하세요.';
    btnSubmitQuestion.innerHTML = '<i class="fa-solid fa-circle-plus"></i> 질문 등록하기';
    btnCancelEditQuestion.classList.add('hidden');
    optionsContainer.innerHTML = '';
    optionsFormGroup.classList.add('hidden');
    qInputAnonymous.checked = false;
}

// Admin delete question handler
async function handleDeleteQuestion(qId) {
    if (!confirm('정말로 이 질문을 삭제하시겠습니까? 관련된 답변 정보도 모두 삭제됩니다.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/questions/${qId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            if (qInputEditId.value === qId) {
                exitEditMode();
            }
            loadAdminQuestions();
            populateQuestionsFilter();
            loadAdminAnswers();
        } else {
            alert('삭제에 실패했습니다.');
        }
    } catch (err) {
        console.error('Delete question error', err);
    }
}

// Admin: Load User Submissions
async function loadAdminAnswers() {
    adminAnswersTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">불러오는 중...</td></tr>';
    
    try {
        const response = await fetch('/api/admin/answers');
        if (!response.ok) throw new Error();
        
        let answers = await response.json();
        
        // Filter by question if filter is set
        if (adminAnswersFilter) {
            answers = answers.filter(ans => ans.questionId === adminAnswersFilter);
        }
        
        adminAnsCount.textContent = answers.length;
        
        if (answers.length === 0) {
            adminAnswersTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">제출된 답변이 없습니다.</td></tr>';
            return;
        }
        
        // Sort by timestamp desc
        answers.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        adminAnswersTbody.innerHTML = '';
        answers.forEach(ans => {
            const tr = document.createElement('tr');
            const typeLabel = getQuestionTypeKorean(ans.questionType);
            const dateStr = formatDate(ans.timestamp);
            const displayUser = adminViewMode === 'anon' ? '익명' : ans.displayUsername;
            
            const actionTd = document.createElement('td');
            actionTd.style.display = 'flex';
            actionTd.style.gap = '8px';
            
            const btnEdit = document.createElement('button');
            btnEdit.className = 'btn-secondary btn-sm';
            btnEdit.innerHTML = '<i class="fa-solid fa-pen"></i> 수정';
            btnEdit.addEventListener('click', () => handleEditAnswer(displayUser, ans.username, ans.questionId, ans.answer));
            
            const btnDel = document.createElement('button');
            btnDel.className = 'btn-secondary btn-sm';
            btnDel.style.borderColor = 'rgba(239, 68, 68, 0.2)';
            btnDel.style.color = 'var(--danger)';
            btnDel.innerHTML = '<i class="fa-solid fa-trash"></i> 삭제';
            btnDel.addEventListener('click', () => handleDeleteAnswer(displayUser, ans.username, ans.questionId));
            
            actionTd.appendChild(btnEdit);
            actionTd.appendChild(btnDel);
            
            tr.innerHTML = `
                <td><strong>${escapeHtml(displayUser)}</strong></td>
                <td><span class="badge-type ${ans.questionType}">${typeLabel}</span></td>
                <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(ans.questionText)}">${escapeHtml(ans.questionText)}</td>
                <td style="font-weight:500; color: var(--primary-light); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(ans.answer)}">
                    ${escapeHtml(ans.answer)}
                </td>
                <td><span style="font-size:12px; color:var(--text-muted);">${dateStr}</span></td>
            `;
            tr.appendChild(actionTd);
            adminAnswersTbody.appendChild(tr);
        });
    } catch (err) {
        adminAnswersTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--danger);">불러오기 실패</td></tr>';
    }
}

// Admin edit answer handler
async function handleEditAnswer(displayName, username, questionId, currentAnswer) {
    const newAnswer = prompt(`${displayName}님의 답변을 수정합니다:`, currentAnswer);
    if (newAnswer === null) return; // cancel
    if (newAnswer.trim() === '') {
        alert('답변 내용은 비워둘 수 없습니다.');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/answers', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, questionId, answer: newAnswer.trim() })
        });
        const data = await response.json();
        if (response.ok) {
            loadAdminAnswers();
        } else {
            alert(data.error || '답변 수정에 실패했습니다.');
        }
    } catch (err) {
        console.error('Edit answer error', err);
        alert('서버와의 통신에 실패했습니다.');
    }
}

// Admin delete answer handler
async function handleDeleteAnswer(displayName, username, questionId) {
    if (!confirm(`${displayName}님의 답변을 삭제하시겠습니까?`)) {
        return;
    }
    
    try {
        const response = await fetch('/api/admin/answers', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, questionId })
        });
        const data = await response.json();
        if (response.ok) {
            loadAdminAnswers();
        } else {
            alert(data.error || '답변 삭제에 실패했습니다.');
        }
    } catch (err) {
        console.error('Delete answer error', err);
        alert('서버와의 통신에 실패했습니다.');
    }
}

// Add multiple choice option input row
function addOptionField() {
    const index = optionsContainer.children.length;
    const row = document.createElement('div');
    row.className = 'option-field-row';
    row.id = `option_row_${index}`;
    
    row.innerHTML = `
        <label for="opt_input_${index}" style="display:none;">문항 ${index + 1}</label>
        <input type="text" id="opt_input_${index}" class="multiple-option-input" placeholder="문항 ${index + 1} 내용을 입력하세요" required>
        <button type="button" class="btn-remove-option" onclick="removeOptionField(${index})">
            <i class="fa-solid fa-trash-can"></i>
        </button>
    `;
    optionsContainer.appendChild(row);
    updateOptionPlaceholders();
}

// Global removal function since onclick uses global namespace
window.removeOptionField = function(index) {
    const row = document.getElementById(`option_row_${index}`);
    if (row) {
        row.remove();
        updateOptionPlaceholders();
    }
};

function updateOptionPlaceholders() {
    const rows = optionsContainer.querySelectorAll('.option-field-row');
    rows.forEach((row, i) => {
        row.id = `option_row_${i}`;
        const input = row.querySelector('.multiple-option-input');
        input.id = `opt_input_${i}`;
        input.placeholder = `문항 ${i + 1} 내용을 입력하세요`;
        const removeBtn = row.querySelector('.btn-remove-option');
        removeBtn.setAttribute('onclick', `removeOptionField(${i})`);
    });
}

// User option setup functions
function addUserOptionField() {
    const index = userOptionsContainer.children.length;
    const row = document.createElement('div');
    row.className = 'option-field-row';
    row.id = `user_option_row_${index}`;
    
    row.innerHTML = `
        <label for="user_opt_input_${index}" style="display:none;">문항 ${index + 1}</label>
        <input type="text" id="user_opt_input_${index}" class="multiple-option-input user-multiple-option-input" placeholder="문항 ${index + 1} 내용을 입력하세요" required>
        <button type="button" class="btn-remove-option" onclick="removeUserOptionField(${index})">
            <i class="fa-solid fa-trash-can"></i>
        </button>
    `;
    userOptionsContainer.appendChild(row);
    updateUserOptionPlaceholders();
}

window.removeUserOptionField = function(index) {
    const row = document.getElementById(`user_option_row_${index}`);
    if (row) {
        row.remove();
        updateUserOptionPlaceholders();
    }
};

function updateUserOptionPlaceholders() {
    const rows = userOptionsContainer.querySelectorAll('.option-field-row');
    rows.forEach((row, i) => {
        row.id = `user_option_row_${i}`;
        const input = row.querySelector('.user-multiple-option-input');
        input.id = `user_opt_input_${i}`;
        input.placeholder = `문항 ${i + 1} 내용을 입력하세요`;
        const removeBtn = row.querySelector('.btn-remove-option');
        removeBtn.setAttribute('onclick', `removeUserOptionField(${i})`);
    });
}

function enterUserQuestionEditMode(q) {
    userQFormContainer.classList.remove('hidden');
    btnToggleUserQForm.innerHTML = '<i class="fa-solid fa-xmark"></i> 닫기';
    
    userQInputEditId.value = q.id;
    userFormTitle.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> 질문 수정하기';
    userFormDesc.textContent = '직접 등록한 질문의 유형과 내용을 수정합니다.';
    btnUserSubmitQuestion.innerHTML = '<i class="fa-solid fa-circle-check"></i> 수정 완료';
    
    userQInputType.value = q.type;
    userQInputText.value = q.questionText;
    userQInputAnonymous.checked = q.isAnonymous === 'true' || q.isAnonymous === true;
    
    userOptionsContainer.innerHTML = '';
    if (q.type === 'multiple') {
        userOptionsFormGroup.classList.remove('hidden');
        q.options.forEach((opt, idx) => {
            const row = document.createElement('div');
            row.className = 'option-field-row';
            row.id = `user_option_row_${idx}`;
            row.innerHTML = `
                <label for="user_opt_input_${idx}" style="display:none;">문항 ${idx + 1}</label>
                <input type="text" id="user_opt_input_${idx}" class="multiple-option-input user-multiple-option-input" placeholder="문항 ${idx + 1} 내용을 입력하세요" required value="${escapeHtml(opt)}">
                <button type="button" class="btn-remove-option" onclick="removeUserOptionField(${idx})">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;
            userOptionsContainer.appendChild(row);
        });
    } else {
        userOptionsFormGroup.classList.add('hidden');
    }
    
    userQFormContainer.scrollIntoView({ behavior: 'smooth' });
}

function exitUserQuestionEditMode() {
    userNewQuestionForm.reset();
    userQInputEditId.value = '';
    userFormTitle.innerHTML = '<i class="fa-solid fa-plus-circle"></i> 새 질문 만들기';
    userFormDesc.textContent = '직접 만든 질문을 등록하여 동료들의 답변을 확인해 보세요.';
    btnUserSubmitQuestion.innerHTML = '<i class="fa-solid fa-circle-plus"></i> 질문 등록하기';
    userOptionsContainer.innerHTML = '';
    userOptionsFormGroup.classList.add('hidden');
    userQInputAnonymous.checked = false;
    userQFormContainer.classList.add('hidden');
    btnToggleUserQForm.innerHTML = '<i class="fa-solid fa-plus-circle"></i> 질문 만들기';
}

async function handleUserQuestionSubmit(e) {
    e.preventDefault();
    userQCreateSuccess.classList.add('hidden');
    userQCreateError.classList.add('hidden');
    
    const editId = userQInputEditId.value;
    const isEdit = !!editId;
    
    const type = userQInputType.value;
    const questionText = userQInputText.value;
    const isAnonymous = userQInputAnonymous.checked;
    let options = [];
    
    if (type === 'multiple') {
        const optionInputs = userOptionsContainer.querySelectorAll('.user-multiple-option-input');
        optionInputs.forEach(input => {
            if (input.value.trim() !== '') {
                options.push(input.value.trim());
            }
        });
        
        if (options.length < 2) {
            userQCreateError.querySelector('.alert-message').textContent = '객관식 문항은 최소 2개 이상 등록하셔야 합니다.';
            userQCreateError.classList.remove('hidden');
            return;
        }
    }
    
    const url = isEdit ? `/api/questions/${editId}` : '/api/questions';
    const method = isEdit ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, questionText, options, isAnonymous })
        });
        
        const data = await response.json();
        if (response.ok) {
            userQCreateSuccess.querySelector('.alert-message').textContent = isEdit
                ? '질문이 성공적으로 수정되었습니다.'
                : '질문이 성공적으로 등록되었습니다.';
            userQCreateSuccess.classList.remove('hidden');
            
            exitUserQuestionEditMode();
            loadUserDashboard();
            
            setTimeout(() => {
                userQCreateSuccess.classList.add('hidden');
            }, 3000);
        } else {
            userQCreateError.querySelector('.alert-message').textContent = data.error || '저장에 실패했습니다.';
            userQCreateError.classList.remove('hidden');
        }
    } catch (err) {
        userQCreateError.querySelector('.alert-message').textContent = '서버 통신에 실패했습니다.';
        userQCreateError.classList.remove('hidden');
    }
}

async function handleDeleteUserQuestion(qId) {
    if (!confirm('정말로 이 질문을 삭제하시겠습니까? 관련된 답변 정보도 모두 삭제됩니다.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/questions/${qId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            if (userQInputEditId.value === qId) {
                exitUserQuestionEditMode();
            }
            loadUserDashboard();
        } else {
            alert('삭제에 실패했습니다.');
        }
    } catch (err) {
        console.error('Delete question error', err);
    }
}

// Handle Admin Question Submission (Create or Edit)
async function handleQuestionSubmit(e) {
    e.preventDefault();
    adminCreateSuccess.classList.add('hidden');
    adminCreateError.classList.add('hidden');
    
    const editId = qInputEditId.value;
    const isEdit = !!editId;
    
    const type = qInputType.value;
    const questionText = qInputText.value;
    const isAnonymous = qInputAnonymous.checked;
    let options = [];
    
    if (type === 'multiple') {
        const optionInputs = optionsContainer.querySelectorAll('.multiple-option-input');
        optionInputs.forEach(input => {
            if (input.value.trim() !== '') {
                options.push(input.value.trim());
            }
        });
        
        if (options.length < 2) {
            adminCreateError.querySelector('.alert-message').textContent = '객관식 문항은 최소 2개 이상 등록하셔야 합니다.';
            adminCreateError.classList.remove('hidden');
            return;
        }
    }
    
    const url = isEdit ? `/api/questions/${editId}` : '/api/questions';
    const method = isEdit ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, questionText, options, isAnonymous })
        });
        
        const data = await response.json();
        if (response.ok) {
            adminCreateSuccess.querySelector('.alert-message').textContent = isEdit
                ? '문제가 성공적으로 수정되었습니다.'
                : '문제가 성공적으로 등록되었습니다.';
            adminCreateSuccess.classList.remove('hidden');
            
            exitEditMode();
            
            // Reload questions list, dropdown, and answers
            loadAdminQuestions();
            populateQuestionsFilter();
            loadAdminAnswers();
            
            setTimeout(() => {
                adminCreateSuccess.classList.add('hidden');
            }, 3000);
        } else {
            adminCreateError.querySelector('.alert-message').textContent = data.error || '저장에 실패했습니다.';
            adminCreateError.classList.remove('hidden');
        }
    } catch (err) {
        adminCreateError.querySelector('.alert-message').textContent = '서버 통신에 실패했습니다.';
        adminCreateError.classList.remove('hidden');
    }
}

// Load Reveal Dashboard Data
async function loadRevealDashboard() {
    revealQuestionsContainer.innerHTML = '<div class="loading">결과를 불러오는 중...</div>';
    
    try {
        const response = await fetch('/api/public-answers');
        if (!response.ok) throw new Error();
        
        const data = await response.json();
        revealQuestions = data.questions;
        revealAnswers = data.answers;
        
        // Initialize individual view modes and individually revealed user lists
        revealViewModes = {};
        revealedIndividualUsers = {};
        revealQuestions.forEach(q => {
            revealViewModes[q.id] = 'anon';
        });
        
        // Sync global toggle active state to anon
        btnRevealModeAnon.classList.add('active');
        btnRevealModeAnon.style.background = 'var(--primary)';
        btnRevealModeAnon.style.color = 'white';
        btnRevealModeStandard.classList.remove('active');
        btnRevealModeStandard.style.background = 'transparent';
        btnRevealModeStandard.style.color = 'var(--text-muted)';
        revealViewMode = 'anon';
        
        renderRevealDashboard();
    } catch (err) {
        revealQuestionsContainer.innerHTML = '<div class="alert-box error">답변 공개 데이터를 불러오지 못했습니다.</div>';
    }
}

// Render Reveal Dashboard DOM
function renderRevealDashboard() {
    revealQuestionsContainer.innerHTML = '';
    
    if (revealQuestions.length === 0) {
        revealQuestionsContainer.innerHTML = `
            <div class="glass-card" style="text-align:center; padding: 48px;">
                <i class="fa-solid fa-folder-open" style="font-size: 40px; color: var(--text-muted); margin-bottom: 16px;"></i>
                <h3>등록된 질문이 없습니다.</h3>
            </div>
        `;
        return;
    }
    
    revealQuestions.forEach(q => {
        const qAnswers = revealAnswers.filter(a => a.questionId === q.id);
        const card = document.createElement('div');
        card.className = 'reveal-question-card';
        
        const typeLabel = getQuestionTypeKorean(q.type);
        const total = qAnswers.length;
        const mode = revealViewModes[q.id] || 'anon';
        
        let cardContentHtml = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <span class="badge-type ${q.type}">${typeLabel}</span>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="count-badge"><i class="fa-solid fa-users"></i> ${total}명 참여</span>
                    <div class="card-mode-toggle-group" style="display: flex; gap: 4px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 2px; border-radius: 4px;">
                        <button type="button" class="btn-card-mode ${mode === 'anon' ? 'active' : ''}" data-q-id="${q.id}" data-mode="anon" style="font-size: 11px; padding: 4px 8px; border: none; background: ${mode === 'anon' ? 'var(--primary)' : 'transparent'}; color: ${mode === 'anon' ? 'white' : 'var(--text-muted)'}; border-radius: 3px; cursor: pointer; font-weight:600;">익명</button>
                        <button type="button" class="btn-card-mode ${mode === 'standard' ? 'active' : ''}" data-q-id="${q.id}" data-mode="standard" style="font-size: 11px; padding: 4px 8px; border: none; background: ${mode === 'standard' ? 'var(--primary)' : 'transparent'}; color: ${mode === 'standard' ? 'white' : 'var(--text-muted)'}; border-radius: 3px; cursor: pointer; font-weight:600;">기본</button>
                        <button type="button" class="btn-card-mode ${mode === 'select' ? 'active' : ''}" data-q-id="${q.id}" data-mode="select" style="font-size: 11px; padding: 4px 8px; border: none; background: ${mode === 'select' ? 'var(--primary)' : 'transparent'}; color: ${mode === 'select' ? 'white' : 'var(--text-muted)'}; border-radius: 3px; cursor: pointer; font-weight:600;">선택</button>
                    </div>
                </div>
            </div>
            <h3 style="font-size: 20px; line-height: 1.5; margin-bottom: 24px; color: var(--text-main);">${escapeHtml(q.questionText)}</h3>
            <div class="content-divider" style="margin: 20px 0;"></div>
        `;
        
        // 1. Multiple Choice (객관식)
        if (q.type === 'multiple') {
            let chartHtml = '<div style="margin-top: 16px;">';
            q.options.forEach(opt => {
                const count = qAnswers.filter(a => a.answer === opt).length;
                const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                chartHtml += `
                    <div class="chart-bar-container">
                        <div class="chart-bar-label">
                            <span>${escapeHtml(opt)}</span>
                            <span class="chart-bar-count">${count}명 (${percent}%)</span>
                        </div>
                        <div class="chart-bar-outer">
                            <div class="chart-bar-inner" style="width: ${percent}%;"></div>
                        </div>
                    </div>
                `;
            });
            chartHtml += '</div>';
            cardContentHtml += chartHtml;
            
            // Multiple Choice Selection Mode - Details of who answered what (with reveal functionality)
            if (mode === 'select') {
                let selectDetailsHtml = `
                    <div class="multiple-select-details" style="margin-top: 20px; background: rgba(255,255,255,0.02); padding: 16px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.05);">
                        <h4 style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;"><i class="fa-solid fa-user-tag"></i> 문항별 선택 유저 확인 (선택 모드)</h4>
                `;
                
                q.options.forEach((opt, optIdx) => {
                    const optUsers = qAnswers.filter(a => a.answer === opt);
                    selectDetailsHtml += `
                        <div style="margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px dashed rgba(255,255,255,0.03);">
                            <div style="font-size: 12px; font-weight: 600; color: var(--primary-light); margin-bottom: 6px;">${escapeHtml(opt)}</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
                    `;
                    
                    if (optUsers.length === 0) {
                        selectDetailsHtml += `<span style="font-size: 11px; color: var(--text-muted);">선택한 유저가 없습니다.</span>`;
                    } else {
                        optUsers.forEach((ans, uIdx) => {
                            const cacheKey = `${q.id}_opt_${optIdx}_u_${uIdx}`;
                            let displayName = '익명';
                            if (revealedIndividualUsers[cacheKey]) {
                                displayName = ans.username;
                            } else {
                                displayName = `익명 <button type="button" class="btn-reveal-name-item btn-secondary btn-sm" data-reveal-key="${cacheKey}" style="font-size: 8px; padding: 2px 4px; line-height: 1; border-radius: 2px; margin-left: 4px; border-color: rgba(255,255,255,0.1); cursor:pointer;"><i class="fa-solid fa-eye" style="font-size:8px;"></i></button>`;
                            }
                            selectDetailsHtml += `
                                <span class="reveal-badge-user" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); padding: 4px 8px; border-radius: 4px; font-size: 11px; display: inline-flex; align-items: center; gap: 2px;">
                                    ${displayName}
                                </span>
                            `;
                        });
                    }
                    
                    selectDetailsHtml += `
                            </div>
                        </div>
                    `;
                });
                
                selectDetailsHtml += `</div>`;
                cardContentHtml += selectDetailsHtml;
            }
        }
        
        // 2. Subjective (주관식)
        else if (q.type === 'subjective') {
            // A. User submissions list
            let listHtml = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h4 style="font-size:14px; margin-bottom:0; color:var(--text-muted);"><i class="fa-solid fa-list-ul"></i> 작성자별 답변 목록</h4>
                </div>
            `;
            listHtml += '<div class="reveal-answers-list">';
            if (qAnswers.length === 0) {
                listHtml += '<div style="color:var(--text-muted); font-size:13px; text-align:center; padding:8px;">제출된 답변이 없습니다.</div>';
            } else {
                qAnswers.forEach((ans, ansIdx) => {
                    let name = '익명';
                    if (mode === 'standard') {
                        name = ans.username;
                    } else if (mode === 'select') {
                        const cacheKey = `${q.id}_ans_${ansIdx}`;
                        if (revealedIndividualUsers[cacheKey]) {
                            name = ans.username;
                        } else {
                            name = `익명 <button type="button" class="btn-reveal-name-item btn-secondary btn-sm" data-reveal-key="${cacheKey}" style="font-size: 9px; padding: 2px 6px; line-height: 1; border-radius: 3px; margin-left: 6px; border-color: rgba(255,255,255,0.1); cursor:pointer;"><i class="fa-solid fa-eye"></i> 확인</button>`;
                        }
                    }
                    
                    listHtml += `
                        <div class="reveal-answer-item">
                            <span class="reveal-answer-user" style="display: inline-flex; align-items: center;">${name}</span>
                            <span class="reveal-answer-text">${escapeHtml(ans.answer)}</span>
                        </div>
                    `;
                });
            }
            listHtml += '</div>';
            
            // B. Chart representing frequency of unique answers
            const freq = {};
            qAnswers.forEach(ans => {
                const key = ans.answer.trim();
                freq[key] = (freq[key] || 0) + 1;
            });
            
            const sortedFreq = Object.entries(freq).sort((a, b) => b[1] - a[1]);
            
            let chartHtml = '<h4 style="font-size:14px; margin-bottom:12px; color:var(--text-muted); margin-top:24px;"><i class="fa-solid fa-chart-pie"></i> 답변 빈도 차트</h4>';
            chartHtml += '<div style="margin-top: 8px;">';
            if (sortedFreq.length === 0) {
                chartHtml += '<div style="color:var(--text-muted); font-size:13px; text-align:center; padding:8px;">제출된 답변이 없습니다.</div>';
            } else {
                sortedFreq.forEach(([ansText, count]) => {
                    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                    chartHtml += `
                        <div class="chart-bar-container">
                            <div class="chart-bar-label">
                                <span>"${escapeHtml(ansText)}"</span>
                                <span class="chart-bar-count">${count}명 (${percent}%)</span>
                            </div>
                            <div class="chart-bar-outer">
                                <div class="chart-bar-inner" style="width: ${percent}%;"></div>
                            </div>
                        </div>
                    `;
                });
            }
            chartHtml += '</div>';
            
            cardContentHtml += listHtml + chartHtml;
        }
        
        // 3. Essay (서술형)
        else if (q.type === 'essay') {
            // A. User submissions list (Anonymous by default, Switchable, No Chart)
            let listHtml = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h4 style="font-size:14px; margin-bottom:0; color:var(--text-muted);"><i class="fa-solid fa-message"></i> 작성자별 서술형 답변 목록</h4>
                </div>
            `;
            listHtml += '<div class="reveal-answers-list" style="max-height: 360px;">';
            if (qAnswers.length === 0) {
                listHtml += '<div style="color:var(--text-muted); font-size:13px; text-align:center; padding:16px;">제출된 답변이 없습니다.</div>';
            } else {
                qAnswers.forEach((ans, ansIdx) => {
                    let name = '익명';
                    if (mode === 'standard') {
                        name = ans.username;
                    } else if (mode === 'select') {
                        const cacheKey = `${q.id}_ans_${ansIdx}`;
                        if (revealedIndividualUsers[cacheKey]) {
                            name = ans.username;
                        } else {
                            name = `익명 <button type="button" class="btn-reveal-name-item btn-secondary btn-sm" data-reveal-key="${cacheKey}" style="font-size: 9px; padding: 2px 6px; line-height: 1; border-radius: 3px; margin-left: 6px; border-color: rgba(255,255,255,0.1); cursor:pointer;"><i class="fa-solid fa-eye"></i> 확인</button>`;
                        }
                    }
                    
                    listHtml += `
                        <div class="reveal-answer-item" style="flex-direction: column; align-items: flex-start; gap: 8px; padding: 14px 18px;">
                            <span class="reveal-answer-user" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px; width: 100%; display:inline-flex; justify-content:space-between; align-items:center; font-size: 13px;">
                                <span><i class="fa-solid fa-user-circle"></i> ${name}</span>
                            </span>
                            <span class="reveal-answer-text" style="margin-left: 0; line-height: 1.6; color: var(--text-main); white-space: pre-wrap;">${escapeHtml(ans.answer)}</span>
                        </div>
                    `;
                });
            }
            listHtml += '</div>';
            
            cardContentHtml += listHtml;
        }
        
        card.innerHTML = cardContentHtml;
        revealQuestionsContainer.appendChild(card);
    });
    
    // Bind card-specific mode toggle events (익명 / 기본 / 선택)
    revealQuestionsContainer.querySelectorAll('.btn-card-mode').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const qId = btn.getAttribute('data-q-id');
            const newMode = btn.getAttribute('data-mode');
            revealViewModes[qId] = newMode;
            
            // Sync global toggle status if all match
            const allModes = Object.values(revealViewModes);
            if (allModes.every(m => m === 'anon')) {
                revealViewMode = 'anon';
                btnRevealModeAnon.classList.add('active');
                btnRevealModeAnon.style.background = 'var(--primary)';
                btnRevealModeAnon.style.color = 'white';
                btnRevealModeStandard.classList.remove('active');
                btnRevealModeStandard.style.background = 'transparent';
                btnRevealModeStandard.style.color = 'var(--text-muted)';
            } else if (allModes.every(m => m === 'standard')) {
                revealViewMode = 'standard';
                btnRevealModeStandard.classList.add('active');
                btnRevealModeStandard.style.background = 'var(--primary)';
                btnRevealModeStandard.style.color = 'white';
                btnRevealModeAnon.classList.remove('active');
                btnRevealModeAnon.style.background = 'transparent';
                btnRevealModeAnon.style.color = 'var(--text-muted)';
            } else {
                // Mixed state, deselect global toggles
                btnRevealModeAnon.classList.remove('active');
                btnRevealModeAnon.style.background = 'transparent';
                btnRevealModeAnon.style.color = 'var(--text-muted)';
                btnRevealModeStandard.classList.remove('active');
                btnRevealModeStandard.style.background = 'transparent';
                btnRevealModeStandard.style.color = 'var(--text-muted)';
            }
            
            renderRevealDashboard();
        });
    });
    
    // Bind individual user reveal buttons (선택 모드 내의 눈/확인 버튼)
    revealQuestionsContainer.querySelectorAll('.btn-reveal-name-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const cacheKey = btn.getAttribute('data-reveal-key');
            revealedIndividualUsers[cacheKey] = true;
            renderRevealDashboard();
        });
    });
    
    // Trigger transition widths for horizontal charts after DOM renders
    setTimeout(() => {
        const inners = revealQuestionsContainer.querySelectorAll('.chart-bar-inner');
        inners.forEach(el => {
            const widthVal = el.style.width;
            el.style.width = '0%';
            setTimeout(() => {
                el.style.width = widthVal;
            }, 100);
        });
    }, 100);
}

// Helper Utilities
function getQuestionTypeKorean(type) {
    switch (type) {
        case 'subjective': return '주관식';
        case 'multiple': return '객관식';
        case 'essay': return '서술형';
        default: return type;
    }
}

function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${m}-${d} ${hh}:${mm}`;
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
