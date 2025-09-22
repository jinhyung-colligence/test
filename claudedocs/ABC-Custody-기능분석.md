# ABC Custody - 기업용 가상자산 커스터디 서비스 기능 분석

## 📌 프로젝트 개요

### 서비스 정보
- **서비스명**: ABC Custody
- **설명**: 기업 및 개인용 디지털 자산 커스터디 플랫폼
- **버전**: 1.0.0
- **타겟 사용자**: 기업, 기관투자자, 고액 개인 투자자

### 기술 스택
- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS + shadcn/ui
- **UI 컴포넌트**: shadcn/ui (완전 마이그레이션 완료)
- **아이콘**: Heroicons + Lucide React
- **차트**: Recharts
- **가상자산 아이콘**: cryptocurrency-icons

### 서비스 플랜
1. **Enterprise(기업용)**: 대규모 기업을 위한 완전 기능
2. **Premium(프리미엄)**: 개인 고객을 위한 고급 기능
3. **Free(무료)**: 기본 기능 제공

## 🔑 핵심 기능 분석

### 1. 자산 관리 (Overview) - `/overview`
**주요 기능**:
- 보유 가상자산 현황 대시보드
- 지원 자산: BTC, ETH, USDT, USDC 등
- 실시간 자산 가치 및 변동률 표시
- Hot/Cold 월렛별 자산 분포 파이차트
- 시간별/일별/월별 자산 추이 라인차트
- 자산별 잔액 숨김/표시 토글 기능

**기술적 특징**:
- ResizeObserver를 이용한 반응형 차트
- CryptoIcon 컴포넌트로 가상자산 아이콘 표시
- 동적 숫자 포맷팅 (한국어 천자리 콤마)

### 2. 출금 관리 (Withdrawal) - `/withdrawal`
**주요 기능**:
- **승인 관리**: 다단계 승인 프로세스 구현
- **출금 요청**: 개인/그룹 출금 요청 생성 및 관리
- **우선순위 시스템**: critical, high, normal, low 4단계
- **에어갭 지원**: 오프라인 서명을 위한 에어갭 시스템
- **감사 추적**: 모든 출금 활동 로그 및 감사 기록
- **상태 관리**: submitted, approved, rejected, processing, completed

**하위 탭 구조**:
- `/withdrawal/approval`: 승인 대기 목록
- `/withdrawal/requests`: 출금 요청 내역
- `/withdrawal/rejected`: 거절된 요청
- `/withdrawal/audit`: 감사 로그
- `/withdrawal/airgap`: 에어갭 거래

**주요 컴포넌트**:
- `ApprovalTab`: 승인 처리 화면
- `WithdrawalTableRow`: 출금 요청 테이블 행
- `PriorityBadge`: 우선순위 배지
- `StatusBadge`: 상태 배지
- `ApprovalTimeline`: 승인 진행 상황

### 3. 입금 관리 (Deposit) - `/deposit`
**주요 기능**:
- 입금 주소 생성 및 관리
- 입금 내역 실시간 추적
- QR 코드 생성 기능
- 입금 확인 알림

### 4. 거래 내역 (Transactions) - `/transactions`
**주요 기능**:
- 전체 거래 내역 조회
- 거래 유형별 필터링 (입금/출금/내부이체)
- 블록체인 탐색기 연동
- 거래 상태 실시간 업데이트
- 거래 상세 정보 모달

### 5. 보안 설정 (Security) - `/security`
**탭 구조**:
- **보안 설정** (`/security/security`): 기본 보안 설정
- **주소 관리** (`/security/addresses`): 화이트리스트/블랙리스트
- **계좌 연동** (`/security/accounts`): 은행 계좌 연결
- **정책 관리** (`/security/policies`): 승인 정책 설정
- **알림 설정** (`/security/notifications`): 알림 관리

**정책 관리 세부 기능**:
- **금액별 정책** (`/security/policies/amount`): KRW 기준 승인 한도
- **유형별 정책** (`/security/policies/type`): 거래 유형별 정책

**주소 관리 기능**:
- **개인 주소** (`/security/addresses/personal`): 개인 화이트리스트
- **기업 주소** (`/security/addresses/enterprise`): 기업 화이트리스트

**알림 설정 기능**:
- **알림 로그** (`/security/notifications/logs`): 알림 기록
- **템플릿 관리** (`/security/notifications/templates`): 알림 템플릿
- **채널 설정** (`/security/notifications/settings`): 알림 채널

### 6. 그룹 관리 (Groups) - `/groups`
**주요 기능**:
- **예산 관리**: 가상자산별 예산 설정 및 추적
- **예산 계획**: 월별/분기별/연간 예산 분배
- **사용률 추적**: 실시간 예산 사용률 모니터링
- **그룹 승인**: 그룹 단위 거래 승인 프로세스
- **권한 관리**: 그룹별 사용자 권한 설정

**하위 탭**:
- `/groups/groups`: 그룹 목록 및 관리
- `/groups/approval`: 그룹 승인 대기
- `/groups/rejected`: 거절된 그룹 요청

**핵심 컴포넌트**:
- `GroupManagement`: 그룹 관리 메인 컴포넌트
- `BudgetSetupForm`: 예산 설정 폼
- `BudgetDistribution`: 예산 분배 차트
- `BudgetStatus`: 예산 사용 현황

### 7. 서비스 (Services) - `/services`
**주요 기능**:
- **스테이킹 서비스**: 가상자산 스테이킹
- **DeFi 연동**: 탈중앙화 금융 서비스
- **수익률 관리**: 투자 수익률 추적

**기본 탭**: `/services/staking`

### 8. 사용자 관리 (Users) - `/users`
**주요 기능**:
- 사용자 역할 관리
  - 관리자 (Admin)
  - 승인자 (Approver)
  - 요청자 (Requester)
  - 감사자 (Auditor)
- 권한 설정 및 접근 제어
- 사용자 활동 로그 추적
- 사용자 초대 및 관리

## 💡 주요 특징 분석

### 비즈니스 로직의 핵심 원칙
**이중 관리 체계**:
```
거래 실행 단위: 가상자산 (BTC, ETH, USDT 등)
정책 관리 기준: KRW 환산 금액
```

**실제 시나리오**:
1. 사용자가 1 BTC 출금 요청
2. 시스템이 1 BTC를 KRW로 환산 (예: 60,000,000원)
3. KRW 기준 정책으로 승인 프로세스 결정
4. 실제 출금은 1 BTC로 실행

### UI/UX 특징

#### 반응형 블록체인 주소 표시
```typescript
// 동적 truncate 방식
const truncateDynamic = (text: string, maxChars: number) => {
  if (!text || text.length <= maxChars) return text;

  const dotsLength = 3;
  const availableChars = maxChars - dotsLength;
  const frontChars = Math.ceil(availableChars * 0.65); // 앞 65%
  const backChars = availableChars - frontChars;       // 뒤 35%

  return `${text.slice(0, frontChars)}...${text.slice(-backChars)}`;
};
```

#### 가상자산 아이콘 시스템
- **로컬 파일 시스템**: cryptocurrency-icons 패키지 활용
- **Fallback 지원**: 지원되지 않는 자산은 텍스트 기반 아이콘
- **일관된 디자인**: 모든 아이콘 32x32 픽셀 PNG 형식

#### 컬러 정책
- **초록색 계열 사용 금지**: 브랜드 정책
- **프라이머리 컬러**: 파란색 계열 (sky-500)
- **대체 컬러 체계**:
  - 성공/긍정: `text-sky-600`, `bg-sky-50`
  - 정보/알림: `text-indigo-600`, `bg-indigo-50`
  - 중요/강조: `text-primary-600`, `bg-primary-50`

### 보안 기능

#### 다단계 보안 체계
1. **인증**: 로그인 + 2FA/MFA
2. **인가**: 역할 기반 접근 제어
3. **승인**: 금액별 다단계 승인
4. **감사**: 모든 활동 로그 추적

#### 에어갭 시스템
- 오프라인 서명 지원
- 하드웨어 월렛 연동
- 콜드 스토리지 관리

#### 정책 엔진
- 금액별 자동 승인 라우팅
- 시간대별 제한 설정
- 위험도 기반 제어

### 다국어 지원
- **기본 언어**: 한국어
- **지원 언어**: 영어
- **Context**: `LanguageContext`로 전역 관리

## 🎯 타겟 사용자 분석

### 기업 (Enterprise)
- **대상**: 대규모 가상자산 관리가 필요한 기업
- **요구사항**: 복잡한 승인 프로세스, 감사 추적, 정책 관리
- **주요 기능**: 그룹 관리, 예산 설정, 다단계 승인

### 기관 (Premium)
- **대상**: 투자 기관, 펀드 운용사, 거래소
- **요구사항**: 전문적인 거래 도구, 리스크 관리
- **주요 기능**: 포트폴리오 관리, 고급 보안 설정

### 개인 (Free/Premium)
- **대상**: 고액 자산가, 개인 투자자
- **요구사항**: 안전한 보관, 편리한 사용성
- **주요 기능**: 기본 입출금, 자산 현황 조회

## 📊 기술 아키텍처

### 프론트엔드 구조
```
src/
├── app/                 # Next.js App Router
├── components/          # UI 컴포넌트
├── contexts/           # React Context
├── data/               # 목업 데이터
├── types/              # TypeScript 타입
└── utils/              # 유틸리티 함수
```

### 상태 관리
- **전역 상태**: React Context 기반
  - `LanguageContext`: 다국어
  - `ServicePlanContext`: 서비스 플랜
  - `SidebarContext`: 사이드바 상태
  - `AuthContext`: 인증 상태

### 데이터 구조
- **가상자산**: BTC, ETH, USDT, USDC 등
- **통화 단위**: KRW 기준 정책 관리
- **사용자 역할**: Admin, Approver, Requester, Auditor
- **거래 상태**: 7단계 상태 관리

## 🚀 개발 환경

### 명령어
```bash
npm run dev        # 개발 서버 (포트 3000, 충돌시 자동 종료)
npm run build      # 프로덕션 빌드
npm run start      # 프로덕션 서버
npm run lint       # ESLint 검사
```

### 테스트
```bash
npm run test:e2e          # E2E 테스트
npm run test:e2e:ui       # E2E 테스트 UI
npm run test:e2e:debug    # E2E 테스트 디버그
npm run test:e2e:headed   # E2E 테스트 브라우저 표시
npm run test:e2e:report   # E2E 테스트 리포트
```

## 📝 프로젝트 규칙

### 개발 규칙
1. **범위 제한**: 요청된 범위만 구현
2. **TypeScript 필수**: 모든 코드에 타입 지정
3. **서버 컴포넌트 우선**: 클라이언트 컴포넌트는 필요시만
4. **한국어 우선**: UI 텍스트 및 주석
5. **이모지 금지**: 코드 내 이모지 사용 금지

### 파일 구조 규칙
- **Claude 문서**: `claudedocs/` 디렉토리
- **테스트**: `tests/`, `__tests__/`, `test/` 디렉토리
- **스크립트**: `scripts/`, `tools/`, `bin/` 디렉토리

이 문서는 ABC Custody 프로젝트의 전체적인 구조와 주요 기능을 파악하기 위한 종합 분석 자료입니다.