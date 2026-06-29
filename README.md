## Rolling-QnA
Rolling Q&amp;A는 소규모 모임(00명 이내)의 친구들과 대화를 나누고 즐거운 추억을 만들기 위해 기획된 소규모 프로젝트입니다. 등록한 질문에 친구들이 답변을 남기고, 이후 다 함께 답변을 확인하며 이야기꽃을 피울 수 있는 시간을 선물합니다.

*본 프로젝트는 AI Agent를 활용하여 아키텍처의 기반을 다진 프로젝트입니다.*
---

## ✨ 주요 기능

### 👤 일반 사용자 (Standard User)
* **대시보드**: 자신에게 배정된 질문 목록을 한눈에 확인하고 미완료/완료 상태를 트래킹합니다.
* **스마트 답변 제출 및 수정**:
  * **주관식(단답형)**
  * **객관식(선택형)**
  * **서술형(논술형)**
* 이미 제출한 답변도 대시보드에서 손쉽게 수정할 수 있습니다.

### 👑 관리자 (Admin)
* **질문 생성 및 관리**: 
  * 주관식, 객관식, 서술형 등 다양한 유형의 질문을 생성합니다.
  * 기존 질문 내용을 수정하거나 삭제(연관 답변도 일괄 삭제)할 수 있습니다.
* **실시간 답변 모니터링 및 편집**:
  * 사용자들이 제출한 답변을 실시간으로 확인합니다.
  * 기본 모드와 익명 모드 토글을 통해 관리의 투명성을 유지합니다.
  * **사용자 답변 강제 수정 및 삭제**: 관리자 권한으로 부적절한 사용자 답변 내용을 직접 수정하거나 완전히 삭제할 수 있습니다.
  * 질문 필터를 적용하여 특정 문항에 대한 답변만 따로 모아볼 수 있습니다.
* **답변 공개 모드 (Reveal Mode)**:
  * 실시간 답변 통계(선택 비율 차트, 주관식 답변 빈도 차트)를 비주얼 차트로 확인합니다.
  * 전체 공개 범위(익명/기본/선택적 공개)를 세부 설정하여 청중 피드백 환경을 구축할 수 있습니다.

---

## 🛠 기술 스택

### Frontend
* **Markup & Structure**: HTML5 (Semantic 태그 사용)
* **Styling**: Vanilla CSS3 (Custom Variables, CSS Grid/Flexbox, Glassmorphism, Responsive UI)
* **Logic**: Vanilla JavaScript (ES6+, SPA 구조 구현)
* **Assets**: Google Fonts (Outfit, Noto Sans KR), FontAwesome 6

### Backend & Database
* **Runtime**: Node.js
* **Framework**: Express (v5.2+)
* **Session Management**: Express-Session
* **Database**: CSV File System 
  (단순히 즐기기 위한 페이지이기에 DB와 연동되지 않고 .CSV 파일에서 동작합니다.)

---

## 🚀 시작하기

### 1. 필수 요구사항
* [Node.js](https://nodejs.org/) (버전 16 이상 권장)

### 2. 패키지 설치
프로젝트 루트 디렉토리에서 패키지를 설치합니다.
```bash
npm install
```

### 3. 서버 실행
개발용 서버 또는 프로덕션 서버를 시작합니다.

* **개발용 실행**:
  ```bash
  npm run dev
  ```
* **일반 실행**:
  ```bash
  npm start
  ```

서버가 실행되면 브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속할 수 있습니다.

---

## 🔐 테스트 계정 정보
데이터베이스 파일이 존재하지 않는 경우 최초 실행 시 자동으로 생성되는 테스트 계정입니다.

* **관리자 계정**:
  * **아이디**: `admin`
  * **비밀번호**: `admin123`
* **일반 사용자 1**:
  * **아이디**: `user1`
  * **비밀번호**: `user123`
* **일반 사용자 2**:
  * **아이디**: `user2`
  * **비밀번호**: `user234`

> 회원가입 화면을 통해 새로운 일반 사용자 계정을 즉시 생성해 이용할 수도 있습니다.

---

## 📂 프로젝트 구조

```text
web_mini_game/
├── data/                    # CSV 데이터 저장소
│   ├── users.csv
│   ├── questions.csv
│   └── answers.csv
├── public/                  # 프론트엔드 정적 파일
│   ├── index.html           # 메인 구조 및 SPA 템플릿
│   ├── style.css            # 모던 다크 테마 디자인 시스템
│   └── app.js               # 프론트엔드 라우팅 및 API 연동 스크립트
├── csvHelper.js             # CSV 파일 데이터 처리 헬퍼 라이브러리
├── server.js                # Express 백엔드 서버 및 세션/API 설정
├── package.json             # 의존성 및 스크립트 설정
└── README.md                # 프로젝트 안내 가이드
```
