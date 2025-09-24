# 기업용 가상자산 커스터디 시스템 - 사용자 권한 시스템

## 개요

사용자 관리 페이지(`/users`)에서 제공하는 권한 관리 시스템의 상세 구조와 기능을 정리한 문서입니다.

## 사용자 역할 (User Roles)

### 역할 계층 구조

```
Admin (관리자)        ← 최고 권한
  ↓
Manager (매니저)      ← 정책 설정, 사용자 관리
  ↓
Operator (운영자)     ← 일반 거래 처리, 승인
  ↓
Viewer (조회자)       ← 데이터 조회, 리포트 확인
```

### 역할별 상세 정보

#### 1. Admin (관리자)
- **한국어명**: 관리자
- **권한 레벨**: 4 (최고)
- **특징**: 모든 시스템 권한 자동 보유 (`permission.all`)
- **설명**: 시스템 전체 관리
- **색상**: `text-red-600 bg-red-50 border-red-200`

#### 2. Manager (매니저)
- **한국어명**: 매니저
- **권한 레벨**: 3
- **설명**: 정책 설정, 사용자 관리
- **색상**: `text-blue-600 bg-blue-50 border-blue-200`

#### 3. Operator (운영자)
- **한국어명**: 운영자
- **권한 레벨**: 2
- **설명**: 일반 거래 처리, 승인
- **색상**: `text-indigo-600 bg-indigo-50 border-indigo-200`

#### 4. Viewer (조회자)
- **한국어명**: 조회자
- **권한 레벨**: 1 (최소)
- **설명**: 데이터 조회, 리포트 확인
- **색상**: `text-gray-600 bg-gray-50 border-gray-200`

## 권한 카테고리 시스템

### 4개 주요 카테고리

#### 1. 자산 관리 (Assets)
- **카테고리 ID**: `assets`
- **아이콘**: `ChartBarIcon`
- **설명**: 가상자산 관련 모든 작업

**세부 권한:**
- `permission.assets.view` - 자산 조회: 자산 현황 및 잔액 조회
- `permission.assets.view_transactions` - 거래 내역 조회: 입출금 거래 내역 확인
- `permission.assets.create_transactions` - 거래 신청: 신규 거래 신청 및 실행

#### 2. 사용자 관리 (Users)
- **카테고리 ID**: `users`
- **아이콘**: `UserIcon`
- **설명**: 시스템 사용자 관련 작업

**세부 권한:**
- `permission.users.view` - 사용자 조회: 사용자 목록 및 정보 조회
- `permission.users.create` - 사용자 추가: 신규 사용자 등록
- `permission.users.edit` - 사용자 수정: 사용자 정보 수정
- `permission.users.manage_permissions` - 권한 설정: 사용자 권한 및 역할 관리

#### 3. 정책 관리 (Policies)
- **카테고리 ID**: `policies`
- **아이콘**: `DocumentTextIcon`
- **설명**: 보안 정책 관련 작업

**세부 권한:**
- `permission.policies.view` - 정책 조회: 보안 정책 확인
- `permission.policies.create` - 정책 생성: 신규 정책 작성
- `permission.policies.edit` - 정책 수정: 기존 정책 편집

#### 4. 시스템 관리 (System)
- **카테고리 ID**: `system`
- **아이콘**: `CogIcon`
- **설명**: 시스템 전반 관리 작업

**세부 권한:**
- `permission.system.view_audit` - 감사 로그: 시스템 감사 로그 조회
- `permission.system.notifications` - 알림 설정: 시스템 알림 관리
- `permission.system.security_settings` - 보안 설정: 보안 구성 관리
- `permission.system.admin` - 시스템 관리: 전체 시스템 관리자 권한

## 역할별 기본 권한 매핑

### Admin (관리자)
```typescript
permissions: ['permission.all']
```
- 모든 권한 자동 보유

### Manager (매니저)
```typescript
permissions: [
  'permission.assets.view',
  'permission.assets.view_transactions',
  'permission.assets.create_transactions',
  'permission.users.view',
  'permission.users.create',
  'permission.users.edit',
  'permission.users.manage_permissions',
  'permission.policies.view',
  'permission.system.view_audit'
]
```

### Operator (운영자)
```typescript
permissions: [
  'permission.assets.view',
  'permission.assets.view_transactions',
  'permission.assets.create_transactions',
  'permission.system.view_audit'
]
```

### Viewer (조회자)
```typescript
permissions: [
  'permission.assets.view',
  'permission.assets.view_transactions',
  'permission.system.view_audit'
]
```

## 사용자 상태 (User Status)

### 상태 유형

#### 1. Active (활성)
- **한국어명**: 활성
- **설명**: 정상 작동 중인 계정
- **색상**: `text-sky-600 bg-sky-50`

#### 2. Inactive (비활성)
- **한국어명**: 비활성
- **설명**: 비활성화된 계정 (로그인 불가)
- **색상**: `text-gray-600 bg-gray-50`

#### 3. Pending (대기중)
- **한국어명**: 대기중
- **설명**: 승인 대기 중인 계정
- **색상**: `text-yellow-600 bg-yellow-50`

## 권한 검증 시스템

### 권한 확인 함수들

#### 1. hasPermission(user, permission)
- 사용자가 특정 권한을 가지고 있는지 확인
- Admin은 자동으로 모든 권한 보유

#### 2. hasAllPermissions(user, permissions)
- 사용자가 여러 권한을 모두 가지고 있는지 확인

#### 3. hasAnyPermission(user, permissions)
- 사용자가 여러 권한 중 하나라도 가지고 있는지 확인

#### 4. hasMinimumRole(user, minRole)
- 사용자가 특정 역할 이상의 권한을 가지고 있는지 확인

#### 5. checkPermission(user, requiredPermissions, minRole)
- 포괄적인 권한 확인 및 결과 반환

## 사용자 관리 기능

### 주요 기능

#### 1. 사용자 추가
- **필수 정보**: 이름, 이메일, 전화번호
- **선택 정보**: 부서, 직책
- **권한 설정**: 역할 선택 + 커스텀 권한 설정
- **권한 미리보기**: 설정된 권한의 실시간 미리보기

#### 2. 사용자 정보 수정
- **수정 가능**: 기본 정보 (이름, 이메일, 전화번호, 부서, 직책)
- **제한사항**: 역할 변경은 별도 권한 관리에서만 가능

#### 3. 권한 관리
- **역할 변경**: 4개 역할 중 선택
- **커스텀 권한**: 역할별 기본 권한 외 추가/제거 가능
- **권한 미리보기**: 변경 내용 실시간 확인

#### 4. 권한 변경 이력
- **추적 정보**: 변경자, 변경 시간, 변경 유형, 사유
- **변경 유형**: 역할 변경, 권한 추가/제거, 정책 승인 권한 변경

#### 5. 사용자 비활성화
- **경고**: 시스템 로그인 불가, 모든 권한 제거, 진행 중인 작업 중단
- **제한**: 비활성화 후 재활성화 불가 (시스템 정책)

### 사용자 인터페이스

#### 1. 통계 카드
- 역할별 사용자 수 표시
- 시각적 구분을 위한 색상 코딩

#### 2. 검색 및 필터
- **검색**: 이름, 이메일로 검색
- **필터**: 역할별 필터링

#### 3. 사용자 목록 테이블
- **표시 정보**: 사용자 정보, 역할, 상태, 최근 로그인
- **액션 버튼**: 수정, 권한 관리, 이력 조회, 비활성화

#### 4. 모달 시스템
- **사용자 추가 모달**: 4단계 구성 (기본 정보 → 역할 선택 → 권한 커스터마이징 → 미리보기)
- **권한 편집 모달**: 역할 변경 + 세부 권한 조정
- **이력 조회 모달**: 권한 변경 이력 시간순 표시

## 권한 커스터마이징 시스템

### 특징

#### 1. 역할 기반 기본 권한
- 각 역할별 기본 권한 자동 설정
- 역할 변경 시 기본 권한으로 초기화

#### 2. 세부 권한 조정
- 카테고리별 권한 그룹화 표시
- 개별 권한 체크박스로 선택/해제
- 권한별 상세 설명 제공

#### 3. 관리자 권한 보호
- 관리자는 권한 커스터마이징 불가
- 모든 권한 자동 보유 (`permission.all`)

#### 4. 실시간 미리보기
- 선택된 권한의 요약 정보 표시
- 카테고리별 권한 개수 표시

## 보안 고려사항

### 권한 검증
- 모든 권한 확인은 서버 사이드에서 재검증 필요
- 클라이언트 권한 표시는 UI 편의성을 위한 것

### 감사 로그
- 모든 권한 변경 사항 로깅
- 변경자, 변경 시간, 변경 사유 필수 기록

### 권한 상속
- 상위 역할은 하위 역할의 모든 권한 포함
- 역할 계층 구조 기반 권한 상속

## 기술적 구현

### 주요 컴포넌트
- `UserManagement.tsx`: 메인 사용자 관리 컴포넌트
- `UserPermissionEditor.tsx`: 권한 편집 인터페이스
- `PermissionPreview.tsx`: 권한 미리보기
- `PermissionHistory.tsx`: 권한 변경 이력

### 유틸리티 함수
- `permissionUtils.ts`: 권한 검증 및 관리 함수
- `userHelpers.ts`: 사용자 관련 헬퍼 함수

### 타입 정의
- `user.ts`: 사용자 및 권한 타입 정의
- `permission.ts`: 세부 권한 및 정책 타입 정의

## 확장성

### 권한 추가
- 새로운 권한은 `PERMISSION_DETAILS`에 추가
- 카테고리별 그룹화 자동 처리

### 역할 추가
- `UserRole` 타입 확장
- `ROLE_NAMES` 및 `DEFAULT_PERMISSIONS_BY_ROLE` 업데이트

### 정책 연동
- 권한 변경 시 정책 엔진과 연동
- 실시간 권한 검증 시스템 구축 가능