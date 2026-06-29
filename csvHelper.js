const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_PATH = path.join(DATA_DIR, 'users.csv');
const QUESTIONS_PATH = path.join(DATA_DIR, 'questions.csv');
const ANSWERS_PATH = path.join(DATA_DIR, 'answers.csv');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure CSV files exist with headers if they don't exist
function initFile(filePath, headerRow) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, stringifyCSVRow(headerRow) + '\n', 'utf8');
    }
}

function parseCSV(content) {
    if (!content || !content.trim()) return [];
    const rows = [];
    let row = [];
    let insideQuote = false;
    let entry = '';
    
    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const nextChar = content[i + 1];
        
        if (insideQuote) {
            if (char === '"') {
                if (nextChar === '"') {
                    entry += '"';
                    i++; // skip next quote
                } else {
                    insideQuote = false;
                }
            } else {
                entry += char;
            }
        } else {
            if (char === '"') {
                insideQuote = true;
            } else if (char === ',') {
                row.push(entry);
                entry = '';
            } else if (char === '\r' || char === '\n') {
                row.push(entry);
                entry = '';
                if (row.length > 0 && row.some(x => x !== '')) {
                    rows.push(row);
                }
                row = [];
                if (char === '\r' && nextChar === '\n') {
                    i++; // skip LF
                }
            } else {
                entry += char;
            }
        }
    }
    if (entry || row.length > 0) {
        row.push(entry);
        if (row.some(x => x !== '')) {
            rows.push(row);
        }
    }
    return rows;
}

function stringifyCSVRow(row) {
    return row.map(val => {
        let str = String(val === undefined || val === null ? '' : val);
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
            str = '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    }).join(',');
}

function readFileRows(filePath, headers) {
    initFile(filePath, headers);
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = parseCSV(content);
    if (parsed.length <= 1) return [];
    
    const fileHeaders = parsed[0];
    const dataRows = parsed.slice(1);
    
    return dataRows.map(row => {
        const obj = {};
        headers.forEach((h, index) => {
            obj[h] = row[index] || '';
        });
        return obj;
    });
}

function appendFileRow(filePath, headers, dataObj) {
    initFile(filePath, headers);
    const row = headers.map(h => dataObj[h] || '');
    fs.appendFileSync(filePath, stringifyCSVRow(row) + '\n', 'utf8');
}

// Seed Users helper
function seedUsers() {
    initFile(USERS_PATH, ['username', 'password', 'role']);
    const users = readFileRows(USERS_PATH, ['username', 'password', 'role']);
    if (users.length === 0) {
        // Seed default accounts
        appendFileRow(USERS_PATH, ['username', 'password', 'role'], { username: 'admin', password: 'admin123', role: 'admin' });
        appendFileRow(USERS_PATH, ['username', 'password', 'role'], { username: 'user1', password: 'user123', role: 'user' });
        appendFileRow(USERS_PATH, ['username', 'password', 'role'], { username: 'user2', password: 'user234', role: 'user' });
    }
}

// Seed Questions helper
function seedQuestions() {
    initFile(QUESTIONS_PATH, ['id', 'type', 'questionText', 'options', 'isAnonymous', 'creator']);
    const questions = readFileRows(QUESTIONS_PATH, ['id', 'type', 'questionText', 'options', 'isAnonymous', 'creator']);
    if (questions.length === 0) {
        appendFileRow(QUESTIONS_PATH, ['id', 'type', 'questionText', 'options', 'isAnonymous', 'creator'], {
            id: 'q1',
            type: 'multiple',
            questionText: '대한민국의 수도는 어디인가요?',
            options: '서울;부산;대구;인천',
            isAnonymous: 'false',
            creator: 'admin'
        });
        appendFileRow(QUESTIONS_PATH, ['id', 'type', 'questionText', 'options', 'isAnonymous', 'creator'], {
            id: 'q2',
            type: 'subjective',
            questionText: '물(H2O)을 구성하고 있는 두 가지 화학 원소의 이름을 적어주세요.',
            options: '',
            isAnonymous: 'false',
            creator: 'admin'
        });
        appendFileRow(QUESTIONS_PATH, ['id', 'type', 'questionText', 'options', 'isAnonymous', 'creator'], {
            id: 'q3',
            type: 'essay',
            questionText: '인공지능(AI)이 미래 사회와 일자리에 미칠 영향에 대한 자신의 생각을 논술해 주세요.',
            options: '',
            isAnonymous: 'false',
            creator: 'admin'
        });
    }
}

// Initialize seed data
seedUsers();
seedQuestions();
initFile(ANSWERS_PATH, ['username', 'questionId', 'answer', 'timestamp']);

module.exports = {
    getUsers: () => readFileRows(USERS_PATH, ['username', 'password', 'role']),
    addUser: (username, password, role) => appendFileRow(USERS_PATH, ['username', 'password', 'role'], { username, password, role }),
    getQuestions: () => readFileRows(QUESTIONS_PATH, ['id', 'type', 'questionText', 'options', 'isAnonymous', 'creator']),
    addQuestion: (id, type, questionText, options, isAnonymous, creator) => appendFileRow(QUESTIONS_PATH, ['id', 'type', 'questionText', 'options', 'isAnonymous', 'creator'], { id, type, questionText, options, isAnonymous: String(isAnonymous), creator }),
    getAnswers: () => readFileRows(ANSWERS_PATH, ['username', 'questionId', 'answer', 'timestamp']),
    addAnswer: (username, questionId, answer) => {
        const answers = readFileRows(ANSWERS_PATH, ['username', 'questionId', 'answer', 'timestamp']);
        const filtered = answers.filter(a => !(a.username === username && a.questionId === questionId));
        filtered.push({ username, questionId, answer, timestamp: new Date().toISOString() });
        
        const headers = ['username', 'questionId', 'answer', 'timestamp'];
        const content = [stringifyCSVRow(headers)].concat(filtered.map(a => stringifyCSVRow(headers.map(h => a[h])))).join('\n') + '\n';
        fs.writeFileSync(ANSWERS_PATH, content, 'utf8');
    },
    updateQuestion: (id, type, questionText, options, isAnonymous, creator) => {
        const questions = readFileRows(QUESTIONS_PATH, ['id', 'type', 'questionText', 'options', 'isAnonymous', 'creator']);
        const index = questions.findIndex(q => q.id === id);
        if (index !== -1) {
            questions[index] = { id, type, questionText, options, isAnonymous: String(isAnonymous), creator };
            const headers = ['id', 'type', 'questionText', 'options', 'isAnonymous', 'creator'];
            const content = [stringifyCSVRow(headers)].concat(questions.map(q => stringifyCSVRow(headers.map(h => q[h])))).join('\n') + '\n';
            fs.writeFileSync(QUESTIONS_PATH, content, 'utf8');
            return true;
        }
        return false;
    },
    deleteQuestion: (id) => {
        // Delete the question
        const questions = readFileRows(QUESTIONS_PATH, ['id', 'type', 'questionText', 'options', 'isAnonymous', 'creator']);
        const filteredQuestions = questions.filter(q => q.id !== id);
        const qHeaders = ['id', 'type', 'questionText', 'options', 'isAnonymous', 'creator'];
        const qContent = [stringifyCSVRow(qHeaders)].concat(filteredQuestions.map(q => stringifyCSVRow(qHeaders.map(h => q[h])))).join('\n') + '\n';
        fs.writeFileSync(QUESTIONS_PATH, qContent, 'utf8');

        // Delete associated answers
        const answers = readFileRows(ANSWERS_PATH, ['username', 'questionId', 'answer', 'timestamp']);
        const filteredAnswers = answers.filter(a => a.questionId !== id);
        const aHeaders = ['username', 'questionId', 'answer', 'timestamp'];
        const aContent = [stringifyCSVRow(aHeaders)].concat(filteredAnswers.map(a => stringifyCSVRow(aHeaders.map(h => a[h])))).join('\n') + '\n';
        fs.writeFileSync(ANSWERS_PATH, aContent, 'utf8');
    },
    updateAnswer: (username, questionId, newAnswer) => {
        const answers = readFileRows(ANSWERS_PATH, ['username', 'questionId', 'answer', 'timestamp']);
        const index = answers.findIndex(a => a.username === username && a.questionId === questionId);
        if (index !== -1) {
            answers[index].answer = newAnswer;
            answers[index].timestamp = new Date().toISOString();
            const headers = ['username', 'questionId', 'answer', 'timestamp'];
            const content = [stringifyCSVRow(headers)].concat(answers.map(a => stringifyCSVRow(headers.map(h => a[h])))).join('\n') + '\n';
            fs.writeFileSync(ANSWERS_PATH, content, 'utf8');
            return true;
        }
        return false;
    },
    deleteAnswer: (username, questionId) => {
        const answers = readFileRows(ANSWERS_PATH, ['username', 'questionId', 'answer', 'timestamp']);
        const filtered = answers.filter(a => !(a.username === username && a.questionId === questionId));
        const headers = ['username', 'questionId', 'answer', 'timestamp'];
        const content = [stringifyCSVRow(headers)].concat(filtered.map(a => stringifyCSVRow(headers.map(h => a[h])))).join('\n') + '\n';
        fs.writeFileSync(ANSWERS_PATH, content, 'utf8');
        return true;
    }
};
