# 기업용 커스터디 관리자 페이지 구현 계획서

## 프로젝트 개요

### 서비스 구조
- **대상**: 기업용 가상자산 커스터디 서비스
- **핵심 역할**: 회원사 관리, 자산 모니터링, 출금 처리
- **운영 주체**: 커스터디 서비스 제공 회사 (내부 관리자용)

### 현재 구현 상태
**기업 회원용 대시보드 (완료)**
- 자산 모니터링: AssetOverview 컴포넌트
- 출금 관리: WithdrawalManagement (내부 승인)
- 사용자 관리: UserManagement (기업 내부)
- 그룹 관리: GroupManagement (부서별 지갑)
- 보안 설정: SecuritySettings (2FA, 정책)

**관리자 페이지 (미구현)**
- 회원사 온보딩 시스템 ❌
- Hot/Cold 지갑 관리 ❌
- 출금 처리 관리자 인터페이스 ❌
- 실시간 알림 시스템 ❌
- 컴플라이언스 대시보드 ❌

### 비즈니스 플로우
```
1. 회원사 온보딩 → 2. 전용 입금 주소 할당 → 3. 입금 감지
→ 4. Hot/Cold 지갑 자동 배분 (20%/80%) → 5. 출금 요청 수신
→ 6. AML 검증 → 7. Hot/Cold 리밸런싱 → 8. Air-gap 서명 → 9. 출금 실행
```

### 커스터디 볼트 구조
**이중 보안 아키텍처**
- **Hot Wallet (20%)**: 즉시 출금 가능, 온라인 보관
- **Cold Wallet (80%)**: 장기 보관, 오프라인 보관 (Air-gap)
- **자동 리밸런싱**: 설정 비율 유지를 위한 자동 이체

---

## 상세 기능 명세

### 1. 회원사 관리 시스템

#### 1.1 온보딩 프로세스
**기능 요구사항**
- 회원사 가입 신청 목록 관리
- KYC/KYB 문서 업로드 및 검증
  - 사업자등록증
  - 법인등기부등본
  - 대표자 신분증
  - AML 관련 서류
- 승인/반려/보류 처리 워크플로우
- 승인 시 자동 지갑 생성 (BTC, ETH, USDT 등)

**화면 구성**
```
/admin/members/onboarding
├── 신청 목록 (대기/진행중/완료)
├── 상세 검토 페이지
├── 문서 뷰어
└── 승인 처리 모달
```

#### 1.2 회원사 정보 관리
**기능 요구사항**
- 회원사 기본 정보 CRUD
- 계약 정보 관리 (요금제, 수수료율)
- 회원사 담당자 정보 관리
- 출금 승인자 설정 및 권한 관리
- 지갑 주소 관리
- 거래 한도 설정
- 알림 수신 설정

**데이터 구조**
```typescript
interface Member {
  id: string;
  companyName: string;
  businessNumber: string;
  status: 'active' | 'suspended' | 'terminated';
  contractInfo: {
    plan: 'basic' | 'premium' | 'enterprise';
    feeRate: number;
    monthlyLimit: number;
    dailyLimit: number;
  };
  wallets: {
    asset: string;
    address: string;
    balance: string;
  }[];
  contacts: {
    name: string;
    email: string;
    phone: string;
    role: 'admin' | 'approver' | 'viewer';
    status: 'active' | 'inactive';
  }[];
  approvalSettings: {
    requiredApprovers: number;
    approvalThreshold: string; // KRW 기준
    emergencyContacts: string[];
  };
  notificationSettings: {
    email: boolean;
    sms: boolean;
    slack?: string;
  };
}
```

#### 1.3 오프보딩 프로세스
**기능 요구사항**
- 계약 해지 신청 처리
- 잔여 자산 정산 워크플로우
- 데이터 보관/삭제 정책 적용
- 감사 로그 보존

---

### 2. 자산 모니터링 대시보드

#### 2.1 실시간 모니터링
**메인 대시보드 (/admin/dashboard)**
```
┌─────────────────────────────────────┐
│  총 관리 자산 (TVL)                 │
│  ₿ 125.5 BTC | Ξ 2,450 ETH        │
│  $ 45,250,000 USDT                 │
└─────────────────────────────────────┘

┌─────────────┬─────────────┬─────────┐
│ Hot Wallet  │ Cold Wallet │ 리밸런싱│
│ 20% 활성    │ 80% 보관    │ 정상    │
│ ₩90억       │ ₩360억      │ 자동    │
└─────────────┴─────────────┴─────────┘

┌──────────────┬──────────────────────┐
│ 입금 현황    │ 출금 대기           │
│ 15건 / 1시간 │ 3건 / ₩5억          │
└──────────────┴──────────────────────┘

[실시간 트랜잭션 피드]
- 10:23:45 | A사 | +1.5 BTC | 입금→분배 완료
- 10:20:12 | B사 | -500 USDT | Hot→출금 처리중
- 10:15:30 | 시스템 | Cold→Hot | 리밸런싱 실행
```

#### 2.2 회원사별 자산 현황
**기능 요구사항**
- 회원사별 보유 자산 실시간 조회
- 입출금 히스토리
- 자산 변동 추이 차트
- CSV 내보내기

**모니터링 지표**
```typescript
interface AssetMetrics {
  memberId: string;
  assets: {
    symbol: string;
    balance: string;
    valueInKRW: string;
    lastUpdated: Date;
  }[];
  transactions24h: number;
  volume24h: string;
  alerts: Alert[];
}

interface VaultMetrics {
  hotWallet: {
    totalValue: string;
    assets: AssetBalance[];
    utilizationRate: number; // 사용률
  };
  coldWallet: {
    totalValue: string;
    assets: AssetBalance[];
    securityLevel: 'high' | 'critical';
  };
  rebalancing: {
    status: 'normal' | 'pending' | 'executing';
    lastRebalance: Date;
    nextScheduled: Date;
  };
}

interface AssetBalance {
  symbol: string;
  balance: string;
  percentage: number;
}
```

#### 2.3 입금 처리 및 자동 배분 시스템
**입금 감지 및 처리**
- 회원사별 전용 입금 주소 생성 (BTC, ETH, USDT 등)
- 블록체인 스캔을 통한 실시간 입금 감지
- 입금 확인 후 자동 이체 시작 (Hot:20%, Cold:80%)
- 입금-배분 완료까지 전 과정 추적

**자동 리밸런싱 시스템**
```typescript
interface RebalancingConfig {
  hotWalletTarget: number; // 20%
  coldWalletTarget: number; // 80%
  thresholds: {
    minHotBalance: string; // 최소 Hot 잔액
    maxHotBalance: string; // 최대 Hot 잔액
    rebalanceThreshold: number; // 리밸런싱 트리거 임계값 (예: 5%)
  };
  schedule: {
    frequency: 'daily' | 'weekly';
    time: string; // "02:00"
  };
}
```

**모니터링 화면**
```
/admin/vault-management
├── Hot/Cold 잔액 현황
├── 입금 감지 및 배분 로그
├── 리밸런싱 히스토리
└── 자동화 설정 관리
```

#### 2.4 블록체인 네트워크 모니터링
**기능 요구사항**
- 네트워크 상태 (Bitcoin, Ethereum 등)
- 가스비/수수료 현황
- 컨펌 시간 모니터링
- 네트워크 혼잡도 알림

---

### 3. 출금 처리 워크플로우

#### 3.1 출금 요청 관리
**출금 요청 대기열 (/admin/withdrawals)**
```
상태: [대기] [AML검토] [서명대기] [처리중] [완료]

┌─────┬────────┬────────┬─────────┬────────┬────────┐
│ 우선│ 회원사 │ 자산   │ 금액    │ 상태   │ 작업   │
├─────┼────────┼────────┼─────────┼────────┼────────┤
│ 🔴  │ A기업  │ BTC    │ 5.2     │ AML검토│ [처리] │
│ 🟡  │ B기업  │ USDT   │ 100,000 │ 대기   │ [처리] │
└─────┴────────┴────────┴─────────┴────────┴────────┘
```

**처리 단계**
1. **요청 접수**: 회원사 내부 승인 완료 알림
2. **AML 검증**: 자동 스크리닝 + 수동 검토
3. **잔액 확인**: Hot Wallet 잔액 체크
4. **Cold→Hot 이체**: 필요 시 Cold에서 Hot으로 자동 이체
5. **트랜잭션 생성**: UTXO 선택, 수수료 계산
6. **Air-gap 서명**: 오프라인 서명 요청
7. **브로드캐스트**: 블록체인 전송
8. **모니터링**: 컨펌 추적 및 리밸런싱

#### 3.2 AML/컴플라이언스
**자동화 검증**
```typescript
interface AMLCheck {
  withdrawalId: string;
  checks: {
    blacklist: boolean;
    riskScore: number; // 0-100
    sanctionsList: boolean;
    travelRule: boolean;
  };
  manualReview: boolean;
  reviewNotes: string;
}
```

**검증 항목**
- 블랙리스트 주소 확인
- 리스크 점수 산출 (Chainalysis API)
- 제재 대상 확인
- Travel Rule 준수
- 대량 출금 알림 (1억원 이상)

#### 3.3 Air-gap 서명 시스템
**보안 요구사항**
- 오프라인 서명 장치와 통신
- QR 코드 기반 트랜잭션 전송
- 다중 서명 지원 (2-of-3, 3-of-5)
- 서명 검증 및 로깅

**워크플로우**
```
온라인 시스템          Air-gap 시스템
     │                      │
     ├─[TX 생성]──QR코드───→│
     │                      ├─[서명]
     │←──QR코드──[서명된TX]─┤
     ├─[검증 및 전송]       │
```

---

### 4. 알림 및 커뮤니케이션

#### 4.1 실시간 알림 시스템
**알림 유형**
- 🔴 긴급: 대량 출금, 시스템 오류
- 🟡 주의: AML 플래그, 한도 초과
- 🔵 정보: 입금 확인, 처리 완료

**알림 채널**
- 웹 푸시 알림
- 이메일
- Slack/Telegram 웹훅
- SMS (긴급 건만)

#### 4.2 티켓 시스템
**기능 요구사항**
- 회원사 문의 접수
- 우선순위 분류
- 담당자 배정
- 처리 현황 추적

---

### 5. 보안 및 권한 관리

#### 5.1 역할 기반 접근 제어 (RBAC)
**권한 레벨**
```typescript
enum AdminRole {
  SUPER_ADMIN = 'super_admin',     // 전체 권한
  OPERATIONS = 'operations',       // 출금 처리
  COMPLIANCE = 'compliance',       // AML/KYC
  SUPPORT = 'support',             // 고객 지원
  VIEWER = 'viewer'                // 읽기 전용
}
```

**권한 매트릭스**
| 기능 | Super Admin | Operations | Compliance | Support | Viewer |
|------|------------|------------|------------|---------|--------|
| 회원사 승인 | ✓ | - | ✓ | - | - |
| 출금 처리 | ✓ | ✓ | - | - | - |
| AML 검토 | ✓ | ✓ | ✓ | - | - |
| 자산 조회 | ✓ | ✓ | ✓ | ✓ | ✓ |

#### 5.2 보안 기능
**필수 보안 요구사항**
- 2FA 인증 (Google OTP)
- IP 화이트리스트
- 세션 타임아웃 (30분)
- 감사 로그 (모든 작업 기록)
- 민감 작업 시 재인증

---

### 6. 보고서 및 분석

#### 6.1 운영 보고서
**일일 보고서**
- 총 관리 자산 (TVL)
- 입출금 건수 및 금액
- 수수료 수익
- 이상 거래 탐지

**월간 보고서**
- 회원사별 거래 통계
- 자산 성장률
- 컴플라이언스 리포트
- 시스템 가용성

#### 6.2 분석 대시보드
**주요 지표**
- 거래량 추이
- 회원사 활성도
- 자산 분포
- 수수료 수익 분석

---

## 기술 스택

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- React Query (데이터 페칭)
- Socket.io (실시간 통신)

### Backend 연동
- REST API
- WebSocket (실시간 알림)
- GraphQL (복잡한 쿼리)

### 보안
- JWT + Refresh Token
- 2FA (TOTP)
- E2E 암호화 (민감 데이터)

### 모니터링
- Sentry (에러 트래킹)
- DataDog (APM)
- CloudWatch (인프라)

---

## 구현 로드맵

### 기존 자산 활용 계획
**재사용 가능한 컴포넌트**
- AssetOverview → AdminAssetOverview (Hot/Cold 지갑용)
- WithdrawalManagement → AdminWithdrawalQueue
- UserManagement → MemberManagement (회원사용)
- CryptoIcon, StatusBadge 등 UI 컴포넌트

### Phase 1: 관리자 기본 구조 (4주)
**Week 1-2: 관리자 인프라**
- [x] 프로젝트 셋업 (기존 활용)
- [ ] 관리자 전용 인증 시스템
- [ ] 관리자 레이아웃 및 네비게이션
- [ ] 권한 체계 (SUPER_ADMIN, OPERATIONS, COMPLIANCE)

**Week 3-4: 핵심 기능**
- [ ] 회원사 온보딩 관리 시스템
- [ ] Hot/Cold 지갑 모니터링 대시보드 (AssetOverview 확장)
- [ ] 입금 감지 및 자동 배분 시스템
- [ ] 관리자용 출금 처리 대기열

### Phase 2: 고도화 (4주)
**Week 5-6: AML/컴플라이언스**
- [ ] AML 자동 스크리닝
- [ ] 리스크 점수 시스템
- [ ] Travel Rule 구현

**Week 7-8: 실시간 기능**
- [ ] WebSocket 알림
- [ ] 실시간 대시보드
- [ ] 티켓 시스템

### Phase 3: 최적화 (4주)
**Week 9-10: Air-gap 통합**
- [ ] QR 코드 시스템
- [ ] 다중 서명 지원
- [ ] 서명 검증 자동화

**Week 11-12: 보고서 및 분석**
- [ ] 보고서 생성 자동화
- [ ] 분석 대시보드
- [ ] CSV 내보내기

---

## 리스크 및 대응 방안

### 기술적 리스크
| 리스크 | 영향도 | 대응 방안 |
|--------|--------|-----------|
| 블록체인 네트워크 장애 | 높음 | 다중 노드 운영, 폴백 시스템 |
| Air-gap 통신 실패 | 높음 | 수동 백업 프로세스 |
| 대량 트래픽 | 중간 | 로드 밸런싱, 캐싱 |

### 보안 리스크
| 리스크 | 영향도 | 대응 방안 |
|--------|--------|-----------|
| 내부자 위협 | 높음 | 다중 승인, 감사 로그 |
| 관리자 계정 탈취 | 높음 | 2FA 필수, IP 제한 |
| 세션 하이재킹 | 중간 | 세션 검증 강화 |
| 피싱 공격 | 중간 | 보안 교육, 이상 로그인 탐지 |

---

## 성공 지표 (KPI)

### 운영 효율성
- 출금 처리 시간: < 30분
- 시스템 가용성: > 99.9%
- AML 자동화율: > 80%

### 보안 지표
- 보안 사고: 0건
- 2FA 적용률: 100%
- 감사 로그 커버리지: 100%

### 비즈니스 지표
- 회원사 온보딩 시간: < 2일
- 고객 만족도: > 4.5/5
- 수수료 수익: 목표 대비 100%+

---

## 기존 코드베이스 분석 상세

### 활용 가능한 기존 구조

#### 1. UI 컴포넌트 재사용
```typescript
// 재사용 가능한 컴포넌트들
- CryptoIcon: /src/components/ui/CryptoIcon.tsx
- StatusBadge: /src/components/withdrawal/StatusBadge.tsx
- PriorityBadge: /src/components/withdrawal/PriorityBadge.tsx
- Modal: /src/components/common/Modal.tsx
- PageLayout: /src/components/PageLayout.tsx
```

#### 2. 타입 정의 확장 필요
```typescript
// 기존: /src/types/withdrawal.ts
// 추가 필요: /src/types/admin.ts, /src/types/member.ts, /src/types/vault.ts
```

#### 3. Context 구조 활용
```typescript
// 기존: AuthContext, LanguageContext, CompanyContext
// 추가 필요: AdminContext, VaultContext
```

### 관리자 페이지 라우팅 구조
```
src/app/admin/
├── dashboard/                 # 관리자 메인 대시보드
├── members/                   # 회원사 관리
│   ├── onboarding/           # 온보딩 관리
│   └── [memberId]/           # 회원사 상세
├── vault/                     # 볼트 관리
│   ├── monitoring/           # Hot/Cold 모니터링
│   └── rebalancing/          # 리밸런싱 관리
├── withdrawals/               # 출금 처리
│   ├── queue/                # 대기열
│   ├── aml/                  # AML 검토
│   └── airgap/               # Air-gap 서명
├── compliance/                # 컴플라이언스
└── reports/                   # 보고서
```

---

## 다음 단계

1. **관리자 인증 시스템**: 기존 AuthContext 확장
2. **관리자 레이아웃**: PageLayout 컴포넌트 확장
3. **회원사 타입 정의**: /src/types/member.ts 생성
4. **볼트 관리 시스템**: AssetOverview 컴포넌트 확장
5. **출금 대기열**: WithdrawalManagement 컴포넌트 확장

---

## 참고 자료

- [Custody Best Practices](https://example.com)
- [AML Compliance Guide](https://example.com)
- [Air-gap Security](https://example.com)

---

*작성일: 2025-01-25*
*작성자: 커스터디 서비스 개발팀*