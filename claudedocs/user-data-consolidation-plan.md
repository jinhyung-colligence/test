# 🎯 사용자 목록 공통 mockData 통합 계획

## 📊 현재 상황 분석

### 1. 중복 정의된 사용자 데이터
- **UserManagement**: mockUsers (7명)
- **PolicyManagement**: availableUsers (8명)
- **NotificationCenter**: availableUsers (5명)
- **GroupMockData**: members/managers (문자열만)

### 2. 영향 받는 컴포넌트
- `/users` - UserManagement
- `/security/policies/amount/*` - PolicyManagement
- `/security/notifications/logs` - NotificationCenter
- `/withdrawal/approval` - WithdrawalManagement
- `/groups/*` - GroupManagement

## 📁 작업 계획

### 1️⃣ 공통 사용자 mockData 파일 생성
- **파일 경로**: `/src/data/userMockData.ts`
- **내용**:
  - User 타입 정의 (공통 인터페이스)
  - 통합된 사용자 목록 (10-15명)
  - 역할별 필터링 헬퍼 함수
  - 부서별 필터링 헬퍼 함수

### 2️⃣ 타입 정의 통합
- **파일 경로**: `/src/types/user.ts`
- User, UserRole, UserStatus 등 타입 통합
- 각 컴포넌트의 타입 정의 제거

### 3️⃣ 컴포넌트 수정

#### UserManagement.tsx
- mockUsers 제거
- userMockData import로 변경
- 타입 정의 제거, types/user import

#### PolicyManagement.tsx
- availableUsers 제거
- userMockData import로 변경
- 결재자 선택 드롭다운 수정

#### NotificationCenter.tsx
- availableUsers 제거
- userMockData import로 변경
- 승인자 선택 로직 수정

#### WithdrawalManagement.tsx
- 승인자 정보에 userMockData 활용
- 결재자 할당 로직 수정

#### GroupManagement.tsx
- 관리자/멤버 선택에 userMockData 활용
- 문자열 대신 User 객체 참조

### 4️⃣ 유틸리티 함수 추가
- **파일 경로**: `/src/utils/userHelpers.ts`
- getUserByName()
- getUsersByRole()
- getUsersByDepartment()
- formatUserDisplay()

## 📈 예상 효과
- 코드 중복 제거 (약 200줄 감소)
- 데이터 일관성 보장
- 유지보수성 향상
- 확장성 증가

## ⚠️ 주의사항
- 기존 기능 정상 작동 확인
- 타입 안정성 유지
- import 경로 정확히 수정

## 📋 작업 체크리스트

### Phase 1: 기반 구조 생성
- [ ] `/src/types/user.ts` 생성
- [ ] `/src/data/userMockData.ts` 생성
- [ ] `/src/utils/userHelpers.ts` 생성

### Phase 2: 컴포넌트 수정
- [ ] UserManagement.tsx 수정
- [ ] PolicyManagement.tsx 수정
- [ ] NotificationCenter.tsx 수정
- [ ] WithdrawalManagement.tsx 수정
- [ ] GroupManagement.tsx 수정

### Phase 3: 테스트 및 검증
- [ ] 각 페이지 정상 작동 확인
- [ ] 사용자 선택 기능 정상 작동 확인
- [ ] 타입 안정성 확인
- [ ] 빌드 성공 확인

### Phase 4: 정리
- [ ] 중복 코드 제거 확인
- [ ] import 경로 최적화
- [ ] 코드 리뷰 및 최종 검증

---

**작성일**: 2025-01-15
**예상 소요 시간**: 2-3시간
**우선순위**: 중간