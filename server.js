const express = require('express');
const session = require('express-session');
const path = require('path');
const csvHelper = require('./csvHelper');
const crypto = require('crypto');

const HASH_SALT = 'antigravity-anon-salt-2026';

function getAnonymousUsername(username, questionId) {
    return 'anon_' + crypto.createHash('sha256').update(username + '_' + questionId + '_' + HASH_SALT).digest('hex').substring(0, 16);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'antigravity-secret-key-1337',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware
function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: '로그인이 필요합니다.' });
    }
    next();
}

function requireAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
    }
    next();
}

// Auth endpoints
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: '사용자 이름과 비밀번호를 입력해주세요.' });
    }
    
    const users = csvHelper.getUsers();
    const existingUser = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    
    if (existingUser) {
        return res.status(400).json({ error: '이미 존재하는 아이디입니다.' });
    }
    
    csvHelper.addUser(username.trim(), password, 'user');
    res.status(201).json({ message: '회원가입이 완료되었습니다.' });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: '사용자 이름과 비밀번호를 입력해주세요.' });
    }
    
    const users = csvHelper.getUsers();
    const user = users.find(u => u.username === username.trim() && u.password === password);
    
    if (!user) {
        return res.status(401).json({ error: '사용자 이름 또는 비밀번호가 틀렸습니다.' });
    }
    
    req.session.user = {
        username: user.username,
        role: user.role
    };
    
    res.json({ message: '로그인 성공', user: req.session.user });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: '로그아웃 실패' });
        }
        res.json({ message: '로그아웃 성공' });
    });
});

app.get('/api/session', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

// Questions endpoints
app.get('/api/questions', requireAuth, (req, res) => {
    const questions = csvHelper.getQuestions();
    const answers = csvHelper.getAnswers();
    const username = req.session.user.username;
    const role = req.session.user.role;
    
    // Map answer status for normal users
    const mappedQuestions = questions.map(q => {
        const isAnonQ = q.isAnonymous === 'true' || q.isAnonymous === true;
        const targetUsername = isAnonQ ? getAnonymousUsername(username, q.id) : username;
        const userAnswerObj = answers.find(a => a.username === targetUsername && a.questionId === q.id);
        return {
            id: q.id,
            type: q.type,
            questionText: q.questionText,
            options: q.options ? q.options.split(';') : [],
            isAnonymous: isAnonQ,
            creator: q.creator,
            canEdit: q.creator === username || role === 'admin',
            answered: !!userAnswerObj,
            userAnswer: userAnswerObj ? userAnswerObj.answer : null,
            timestamp: userAnswerObj ? userAnswerObj.timestamp : null
        };
    });
    
    res.json(mappedQuestions);
});

app.post('/api/questions', requireAuth, (req, res) => {
    const { type, questionText, options, isAnonymous } = req.body;
    if (!type || !questionText) {
        return res.status(400).json({ error: '질문 유형과 내용을 모두 작성해주세요.' });
    }
    
    const id = 'q_' + Date.now();
    // options are passed as array, we join them with semicolon
    const optionsStr = Array.isArray(options) ? options.filter(o => o.trim() !== '').join(';') : '';
    const creator = req.session.user.username;
    
    csvHelper.addQuestion(id, type, questionText, optionsStr, isAnonymous === true || isAnonymous === 'true', creator);
    res.status(201).json({ message: '문제가 성공적으로 등록되었습니다.', id });
});

app.put('/api/questions/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const { type, questionText, options, isAnonymous } = req.body;
    if (!type || !questionText) {
        return res.status(400).json({ error: '질문 유형과 내용을 모두 작성해주세요.' });
    }
    
    const questions = csvHelper.getQuestions();
    const question = questions.find(q => q.id === id);
    if (!question) {
        return res.status(404).json({ error: '존재하지 않는 문제입니다.' });
    }
    
    const isCreator = question.creator === req.session.user.username;
    const isAdmin = req.session.user.role === 'admin';
    if (!isCreator && !isAdmin) {
        return res.status(403).json({ error: '수정 권한이 없습니다.' });
    }
    
    const optionsStr = Array.isArray(options) ? options.filter(o => o.trim() !== '').join(';') : '';
    const success = csvHelper.updateQuestion(id, type, questionText, optionsStr, isAnonymous === true || isAnonymous === 'true', question.creator);
    if (success) {
        res.json({ message: '문제가 성공적으로 수정되었습니다.' });
    } else {
        res.status(404).json({ error: '존재하지 않는 문제입니다.' });
    }
});

app.delete('/api/questions/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    
    const questions = csvHelper.getQuestions();
    const question = questions.find(q => q.id === id);
    if (!question) {
        return res.status(404).json({ error: '존재하지 않는 문제입니다.' });
    }
    
    const isCreator = question.creator === req.session.user.username;
    const isAdmin = req.session.user.role === 'admin';
    if (!isCreator && !isAdmin) {
        return res.status(403).json({ error: '삭제 권한이 없습니다.' });
    }
    
    csvHelper.deleteQuestion(id);
    res.json({ message: '문제가 성공적으로 삭제되었습니다.' });
});

// Submit answers endpoint
app.post('/api/answers', requireAuth, (req, res) => {
    const { questionId, answer } = req.body;
    if (!questionId || answer === undefined || answer === null || String(answer).trim() === '') {
        return res.status(400).json({ error: '답변을 올바르게 작성해주세요.' });
    }
    
    const username = req.session.user.username;
    
    // Verify question exists
    const questions = csvHelper.getQuestions();
    const question = questions.find(q => q.id === questionId);
    if (!question) {
        return res.status(404).json({ error: '존재하지 않는 문제입니다.' });
    }
    
    const isAnonQ = question.isAnonymous === 'true' || question.isAnonymous === true;
    const storedUsername = isAnonQ ? getAnonymousUsername(username, questionId) : username;
    
    csvHelper.addAnswer(storedUsername, questionId, String(answer).trim());
    res.json({ message: '답변이 저장되었습니다.' });
});

// Admin endpoint to view all answers
app.get('/api/admin/answers', requireAdmin, (req, res) => {
    const answers = csvHelper.getAnswers();
    const questions = csvHelper.getQuestions();
    
    // Map question text for convenience
    const detailedAnswers = answers.map(a => {
        const q = questions.find(question => question.id === a.questionId);
        const isAnonQ = q && (q.isAnonymous === 'true' || q.isAnonymous === true);
        return {
            username: a.username,
            displayUsername: isAnonQ ? '완전익명' : a.username,
            questionId: a.questionId,
            questionText: q ? q.questionText : '삭제된 문제',
            questionType: q ? q.type : 'N/A',
            isAnonymous: isAnonQ,
            answer: a.answer,
            timestamp: a.timestamp
        };
    });
    
    res.json(detailedAnswers);
});

app.put('/api/admin/answers', requireAuth, (req, res) => {
    const { username, questionId, answer } = req.body;
    if (!username || !questionId || answer === undefined || answer === null || String(answer).trim() === '') {
        return res.status(400).json({ error: '수정할 데이터가 올바르지 않습니다.' });
    }
    const success = csvHelper.updateAnswer(username, questionId, String(answer).trim());
    if (success) {
        res.json({ message: '답변이 성공적으로 수정되었습니다.' });
    } else {
        res.status(404).json({ error: '해당 답변을 찾을 수 없습니다.' });
    }
});

app.delete('/api/admin/answers', requireAuth, (req, res) => {
    const { username, questionId } = req.body;
    if (!username || !questionId) {
        return res.status(400).json({ error: '삭제할 데이터가 올바르지 않습니다.' });
    }
    csvHelper.deleteAnswer(username, questionId);
    res.json({ message: '답변이 성공적으로 삭제되었습니다.' });
});

app.get('/api/public-answers', requireAdmin, (req, res) => {
    const answers = csvHelper.getAnswers();
    const questions = csvHelper.getQuestions();
    
    res.json({
        questions: questions.map(q => ({
            id: q.id,
            type: q.type,
            questionText: q.questionText,
            options: q.options ? q.options.split(';') : [],
            isAnonymous: q.isAnonymous === 'true' || q.isAnonymous === true
        })),
        answers: answers.map(a => {
            const q = questions.find(question => question.id === a.questionId);
            const isAnonQ = q && (q.isAnonymous === 'true' || q.isAnonymous === true);
            return {
                username: isAnonQ ? '완전익명' : a.username,
                questionId: a.questionId,
                answer: a.answer,
                timestamp: a.timestamp
            };
        })
    });
});

// Fallback to index.html for frontend routing/SPA
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
