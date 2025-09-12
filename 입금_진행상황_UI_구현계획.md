# 📊 입금 진행 상황 UI 구현 계획

## 🎯 목표
- `http://localhost:3000/deposit`에 입금 진행 상황을 실시간으로 보여주는 UI 구현
- 전체 입금 히스토리 관리 기능 추가
- 사용자 친화적인 진행 상황 추적 시스템 구축

## 📁 파일 구조
```
src/
├── types/
│   └── deposit.ts (신규)
├── utils/
│   └── depositHelpers.ts (신규)
└── components/
    ├── DepositManagement.tsx (수정)
    └── deposit/ (신규)
        ├── DepositProgressCard.tsx
        ├── DepositHistoryTable.tsx
        ├── DepositStatusBadge.tsx
        ├── DepositTimeline.tsx
        └── DepositStatistics.tsx
```

## 1. 타입 정의 추가 (`src/types/deposit.ts`)

### DepositStatus
```typescript
export type DepositStatus = 
  | "detected"      // 블록체인에서 감지됨
  | "confirming"    // 컨펌 진행 중
  | "confirmed"     // 컨펌 완료
  | "credited"      // 입금 처리 완료
  | "failed";       // 실패
```

### DepositTransaction
```typescript
export interface DepositTransaction {
  id: string;
  txHash: string;
  asset: string;
  network: string;
  amount: string;
  fromAddress: string;
  toAddress: string;
  status: DepositStatus;
  currentConfirmations: number;
  requiredConfirmations: number;
  detectedAt: string;
  confirmedAt?: string;
  creditedAt?: string;
  failedReason?: string;
  estimatedTime?: number; // 예상 완료 시간 (분)
  blockHeight?: number;
  fee?: string;
}
```

### DepositHistory
```typescript
export interface DepositHistory extends DepositTransaction {
  valueInKRW?: number;
  valueInUSD?: number;
}
```

## 2. 진행 상황 추적 컴포넌트 (`src/components/deposit/`)

### a. `DepositProgressCard.tsx` - 실시간 진행 상황 카드
**기능:**
- 현재 진행 중인 입금 표시
- 프로그레스 바 (컨펌 진행도)
- 예상 완료 시간 표시
- 상태별 아이콘과 색상 구분

**UI 요소:**
- 카드 레이아웃
- 원형 또는 선형 프로그레스 바
- 실시간 업데이트 애니메이션

### b. `DepositHistoryTable.tsx` - 전체 입금 히스토리
**기능:**
- 페이지네이션 지원
- 다중 필터링 (상태, 날짜, 자산)
- 검색 기능
- 상세 보기 모달

**UI 요소:**
- 테이블 헤더와 정렬 기능
- 필터 드롭다운
- 검색 입력창
- 모달 다이얼로그

### c. `DepositStatusBadge.tsx` - 상태 표시 배지
**기능:**
- 상태별 색상과 아이콘 표시
- 진행 중 상태 애니메이션 효과

### d. `DepositTimeline.tsx` - 입금 프로세스 타임라인
**기능:**
- 각 단계별 시각화
- 완료/진행중/대기 상태 구분 표시
- 시간 정보 표시

### e. `DepositStatistics.tsx` - 통계 대시보드
**기능:**
- 오늘/이번주/이번달 입금 총액
- 자산별 입금 통계
- 평균 처리 시간 표시

## 3. 메인 페이지 수정 (`src/components/DepositManagement.tsx`)

### 레이아웃 구조
```
┌─────────────────────────────────────────┐
│ 상단: 진행 중인 입금 현황               │
│ - 진행 중인 입금 카드 리스트           │
│ - 실시간 업데이트                       │
│ - 알림 설정                            │
├─────────────────────────────────────────┤
│ 중간: 입금 주소 관리 (기존 유지)       │
│ - 현재 자산 테이블                     │
│ - QR 코드 및 주소 복사                │
├─────────────────────────────────────────┤
│ 하단: 입금 히스토리                    │
│ - 전체 히스토리 테이블                 │
│ - 고급 필터링                          │
│ - 통계 요약                            │
└─────────────────────────────────────────┘
```

## 4. 실시간 업데이트 구현

### Mock 데이터 시뮬레이션
- 5초마다 컨펌 수 자동 증가
- 상태 자동 전환 로직
- 랜덤 새로운 입금 생성

### 업데이트 로직
```typescript
// 예시 구조
useEffect(() => {
  const interval = setInterval(() => {
    updateDepositProgress();
  }, 5000);
  
  return () => clearInterval(interval);
}, []);
```

## 5. UI/UX 특징

### 시각적 요소
- **진행 표시기**: 원형/선형 프로그레스 바
- **알림 시스템**: 입금 완료 시 토스트 알림
- **반응형 디자인**: 모바일 및 데스크톱 최적화

### 색상 코드 시스템
- 🔵 **detected**: 파란색 - 블록체인에서 감지
- 🟡 **confirming**: 노란색 - 컨펌 진행 중  
- 🟢 **confirmed**: 초록색 - 컨펌 완료
- ✅ **credited**: 진한 초록색 - 입금 처리 완료
- 🔴 **failed**: 빨간색 - 처리 실패

### 애니메이션
- 로딩 스피너 (진행 중 상태)
- 프로그레스 바 애니메이션
- 상태 전환 효과

## 6. 데이터 구조 예시

### 진행 중인 입금 Mock 데이터
```typescript
const mockProgressDeposits = [
  {
    id: "dep_001",
    txHash: "0x1234...abcd",
    asset: "BTC",
    amount: "0.05000000",
    status: "confirming",
    currentConfirmations: 3,
    requiredConfirmations: 6,
    estimatedTime: 15
  }
];
```

### 완료된 입금 히스토리
```typescript
const mockDepositHistory = [
  {
    id: "dep_002",
    txHash: "0x5678...efgh",
    asset: "ETH",
    amount: "2.5000000",
    status: "credited",
    valueInKRW: 6500000,
    creditedAt: "2025-01-15T10:30:00Z"
  }
];
```

## 7. 구현 순서

1. ✅ **타입 정의** - `deposit.ts` 작성
2. ✅ **헬퍼 유틸리티** - `depositHelpers.ts` 작성
3. ✅ **기본 컴포넌트** - StatusBadge, Timeline 구현
4. ✅ **진행 상황 카드** - DepositProgressCard 구현
5. ✅ **히스토리 테이블** - DepositHistoryTable 구현
6. ✅ **통계 대시보드** - DepositStatistics 구현
7. ✅ **메인 컴포넌트 통합** - DepositManagement 업데이트

## 8. 기술적 고려사항

### 성능 최적화
- React.memo 활용한 불필요한 리렌더링 방지
- 가상화(Virtualization)를 통한 대용량 테이블 처리
- 검색/필터링 디바운스 처리

### 접근성
- ARIA 레이블 적용
- 키보드 네비게이션 지원
- 스크린 리더 호환성

### 반응형 디자인
- Tailwind CSS 반응형 클래스 활용
- 모바일 우선 설계
- 터치 인터페이스 최적화

## 9. 확장 가능성

### 향후 개선 사항
- WebSocket을 통한 실제 실시간 업데이트
- 푸시 알림 지원
- 고급 차트 및 분석 기능
- CSV/Excel 내보내기 기능
- 다국어 지원

### API 연동 준비
- RESTful API 엔드포인트 설계
- GraphQL 쿼리 구조 준비
- 에러 핸들링 및 재시도 로직

---

## 📝 참고사항

- 기존 출금 관리 컴포넌트의 패턴을 참고하여 일관성 있는 UI/UX 구현
- TypeScript 엄격 모드 준수
- 모든 컴포넌트에 대한 Props 인터페이스 명시적 정의
- 재사용 가능한 컴포넌트 구조 유지