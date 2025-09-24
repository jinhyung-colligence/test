# 기업용 가상자산 커스터디 시스템 - 메뉴 구조

## 전체 메뉴 구성

### 1. 개요 (Overview)

- **경로**: `/overview`
- **접근 권한**: 모든 플랜
- **설명**: 대시보드 홈페이지, 전체 현황 요약

### 2. 거래 내역 (Transactions)

- **경로**: `/transactions`
- **접근 권한**: 모든 플랜
- **설명**: 모든 거래 내역 조회 및 관리

### 3. 사용자 관리 (Users)

- **경로**: `/users`
- **아이콘**: UsersIcon
- **접근 권한**: Premium, Enterprise 플랜
- **설명**: 시스템 사용자 계정 관리

### 4. 그룹 관리 (Groups)

- **경로**: `/groups`
- **아이콘**: UserGroupIcon
- **접근 권한**: Enterprise 플랜만
- **하위 라우팅**: `/groups/[tab]`
- **설명**: 사용자 그룹 및 권한 관리

#### 그룹 관리 하위 탭

##### 4.1 그룹 목록 (groups)

- **경로**: `/groups/groups`
- **설명**: 그룹 생성, 수정, 삭제 관리

##### 4.2 승인 대기 (approval)

- **경로**: `/groups/approval`
- **설명**: 그룹 관련 승인 요청 관리

##### 4.3 예산 관리 (budget)

- **경로**: `/groups/budget`
- **설명**: 그룹별 예산 설정 및 관리

##### 4.4 거부 내역 (rejected)

- **경로**: `/groups/rejected`
- **설명**: 거부된 그룹 요청 내역 조회

### 5. 입금 관리 (Deposit)

- **경로**: `/deposit`
- **아이콘**: ArrowDownOnSquareIcon
- **접근 권한**: Enterprise 플랜만
- **설명**: 가상자산 입금 요청 및 처리 관리

### 6. 출금 관리 (Withdrawal)

- **경로**: `/withdrawal`
- **아이콘**: ArrowUpOnSquareIcon
- **접근 권한**: Enterprise 플랜만
- **하위 라우팅**: `/withdrawal/[tab]`
- **설명**: 가상자산 출금 요청 및 승인 관리

#### 출금 관리 하위 탭

##### 6.1 승인 대기 (approval)

- **경로**: `/withdrawal/approval`
- **설명**: 출금 요청 승인 처리

##### 6.2 에어갭 (airgap)

- **경로**: `/withdrawal/airgap`
- **설명**: 에어갭 시스템을 통한 출금 처리

##### 6.3 거부 내역 (rejected)

- **경로**: `/withdrawal/rejected`
- **설명**: 거부된 출금 요청 내역

##### 6.4 감사 로그 (audit)

- **경로**: `/withdrawal/audit`
- **설명**: 출금 관련 감사 로그 및 기록

### 7. 서비스 (Services)

- **경로**: `/services`
- **아이콘**: CogIcon
- **접근 권한**: 모든 플랜
- **하위 라우팅**: `/services/[tab]`
- **설명**: 추가 서비스 및 기능 설정

#### 서비스 하위 탭

##### 7.1 스테이킹 (staking)

- **경로**: `/services/staking`
- **설명**: 가상자산 스테이킹 서비스 관리

##### 7.2 대출 (lending)

- **경로**: `/services/lending`
- **설명**: 가상자산 대출 서비스 관리

##### 7.3 스왑 (swap)

- **경로**: `/services/swap`
- **설명**: 가상자산 교환 서비스 관리

##### 7.4 원화 연동 (krw)

- **경로**: `/services/krw`
- **설명**: 원화 연동 서비스 및 설정

### 8. 보안 설정 (Security)

- **경로**: `/security`
- **아이콘**: ShieldCheckIcon
- **접근 권한**: 모든 플랜
- **설명**: 보안 정책 및 설정 관리

#### 보안 설정 하위 탭

##### 8.1 기본 보안 (security)

- **경로**: `/security/security`
- **설명**: 기본 보안 설정 관리

##### 8.2 계정 관리 (accounts)

- **경로**: `/security/accounts`
- **설명**: 계정 보안 설정 및 관리

##### 8.3 정책 관리 (policies)

- **경로**: `/security/policies`
- **하위 경로**: `/security/policies/[subtab]`
- **설명**: 보안 정책 규칙 및 설정

###### 8.3.1 금액 정책 (amount)

- **경로**: `/security/policies/amount`
- **설명**: 거래 금액 기반 보안 정책

###### 8.3.2 유형 정책 (type)

- **경로**: `/security/policies/type`
- **설명**: 거래 유형별 보안 정책

##### 8.4 알림 설정 (notifications)

- **경로**: `/security/notifications`
- **하위 경로**: `/security/notifications/[subtab]`
- **설명**: 보안 알림 및 통지 설정

###### 8.4.1 로그 (logs)

- **경로**: `/security/notifications/logs`
- **설명**: 알림 로그 조회 및 관리

###### 8.4.2 템플릿 (templates)

- **경로**: `/security/notifications/templates`
- **설명**: 알림 템플릿 관리

###### 8.4.3 설정 (settings)

- **경로**: `/security/notifications/settings`
- **설명**: 알림 발송 설정

##### 8.5 주소 관리 (addresses)

- **경로**: `/security/addresses`
- **하위 경로**: `/security/addresses/[tab]`
- **설명**: 입출금 주소 화이트리스트 관리

###### 8.5.1 개인 주소 (personal)

- **경로**: `/security/addresses/personal`
- **설명**: 개인 지갑 주소 관리

###### 8.5.2 기관 주소 (vasp)

- **경로**: `/security/addresses/vasp`
- **설명**: VASP(Virtual Asset Service Provider) 주소 관리

###### 8.5.3 주소 이력 (history)

- **경로**: `/security/addresses/history`
- **설명**: 주소 등록/수정 이력 조회

### 9. 로그인 (Login)

- **경로**: `/login`
- **별도 레이아웃**: `login/layout.tsx`
- **하위 페이지**: `/login/blocked` (계정 차단 페이지)
- **설명**: 사용자 인증 및 로그인

## 라우팅 구조

### 정적 라우팅

- `/` → `/overview` (홈페이지 리다이렉트)
- `/overview`
- `/transactions`
- `/users`
- `/deposit`
- `/services`
- `/security`
- `/login`
- `/login/blocked`

### 동적 라우팅

#### 1차 라우팅 (탭)

- `/groups/[tab]` - `groups`, `approval`, `budget`, `rejected`
- `/withdrawal/[tab]` - `approval`, `airgap`, `rejected`, `audit`
- `/services/[tab]` - `staking`, `lending`, `swap`, `krw`
- `/security/[tab]` - `security`, `accounts`, `policies`, `notifications`, `addresses`

#### 2차 라우팅 (서브탭)

- `/security/notifications/[subtab]` - `logs`, `templates`, `settings`
- `/security/policies/[subtab]` - `amount`, `type`
- `/security/addresses/[tab]` - `personal`, `vasp`, `history`

## 기술적 특징

### 사이드바 구현

- **파일**: `src/components/Sidebar.tsx`
- **상태 관리**: Context API (`SidebarContext`)
- **반응형**: 접기/펼치기 기능
- **플랜 선택**: 드롭다운 방식

### 권한 제어

- 플랜별 메뉴 항목 표시/숨김
- 동적 라우팅을 통한 세부 기능 접근
- 현재 경로 기반 활성 상태 표시

### 국제화 지원

- 다국어 지원 (`useLanguage` Context)
- 한국어 우선 설정
- 메뉴명 동적 번역
