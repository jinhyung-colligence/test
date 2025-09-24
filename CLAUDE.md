# Claude 설정

## 언어 설정

- 모든 피드백과 응답은 한국어로 제공

## 응답 설정

- 모든 피드백에 이모지(🚀, ⚠️, ✅ 등) 문자 사용하지 않음

## 프로젝트 기술 스택

- **Framework**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS + shadcn/ui
- **UI 컴포넌트**: shadcn/ui (완전 마이그레이션 완료)
- **아이콘**: Heroicons + Lucide React

## 개발 규칙

### 기본 원칙

- 요청된 범위만 구현 (범위 외 코드 작성 금지)
- 코드 생성 후 TypeScript 검사 필수
- 서버 컴포넌트 우선 사용 (클라이언트 컴포넌트는 필요시만)
- 한국어 우선 사용
- UTF-8 인코딩으로 파일 생성

### UI/UX 가이드

- **이모지 아이콘 사용 금지**: 코드 내에서 이모지(🚀, ⚠️, ✅ 등) 문자 사용하지 않음
<!-- - **shadcn/ui 우선 사용**: 모든 UI 컴포넌트는 shadcn/ui 컴포넌트 활용
- **디자인 일관성**: 기존 shadcn/ui 마이그레이션 패턴 준수 -->

### 컬러 정책

- **초록색 계열 사용 금지**: `bg-green-*`, `text-green-*`, `border-green-*` 등
- **프라이머리 컬러**: 파란색 계열 (`--primary: 199 89% 48%` - sky-500)
- **대체 컬러**:
  - 성공/긍정: `text-sky-600`, `bg-sky-50`, `border-sky-200`
  - 정보/알림: `text-indigo-600`, `bg-indigo-50`, `border-indigo-200`
  - 중요/강조: `text-primary-600`, `bg-primary-50`, `border-primary-200`

## 비즈니스 로직

### 가상자산 커스터디 정책 관리 시스템

**핵심 원칙**: 거래는 가상자산 단위로 실행하되, 모든 정책과 통제는 KRW 환산 금액을 기준으로 관리

#### 거래 실행 단위

- **실제 거래**: 가상자산 단위로 실행 (BTC, ETH, USDT 등)
- **출금/입금/교환**: 가상자산으로 처리

#### 정책 관리 기준

- **금액 기준**: KRW 환산 금액으로 통제
- **한도 설정**: KRW 기준으로 정책 수립
- **승인 기준**: KRW 환산 금액 기준으로 승인 프로세스

#### 예시 시나리오

```
사용자가 1 BTC 출금 요청
→ 실제 거래: 1 BTC 출금
→ 정책 검증: 1 BTC의 KRW 환산 금액이 설정된 한도 내인지 확인
→ 승인 프로세스: KRW 기준 금액에 따른 승인 단계 적용
```

## 프로젝트 명령어

- 빌드: `npm run build`
- 개발 서버: `npm run dev`
- 린트: `npm run lint`

## 블록체인 주소/해시 표시 규칙

### 기본 원칙

- **동적 truncate 방식**: 모든 블록체인 데이터(주소, 트랜잭션 해시 등)
- **컨테이너 반응형**: 화면 크기에 맞춰 최대한 표시
- **일관된 표시**: 앞 65%, 뒤 35% 비율로 분배

### 핵심 구현

```typescript
// 동적 truncate 함수
const truncateDynamic = (text: string, maxChars: number) => {
  if (!text || text.length <= maxChars) return text;

  const dotsLength = 3;
  const availableChars = maxChars - dotsLength;
  const frontChars = Math.ceil(availableChars * 0.65);
  const backChars = availableChars - frontChars;

  return `${text.slice(0, frontChars)}...${text.slice(-backChars)}`;
};

// ResizeObserver로 반응형 처리
useEffect(() => {
  const observer = new ResizeObserver(() => {
    // 컨테이너 크기 변경시 maxChars 재계산
  });
  return () => observer.disconnect();
}, []);
```

### 표시 예시

- **이더리움**: `0x742d35Cc6634C0532925a3b844Bc9e7595...f0bEb0`
- **비트코인**: `bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx...x0wlh`

## 가상자산 아이콘 시스템

### 기본 원칙

- **CryptoIcon 컴포넌트 사용**: 모든 가상자산 아이콘은 `src/components/ui/CryptoIcon.tsx` 컴포넌트 사용
- **로컬 파일 시스템**: 외부 CDN 의존성 제거, 로컬 cryptocurrency-icons 패키지 활용
- **Fallback 시스템**: 지원되지 않는 자산에 대한 텍스트 기반 fallback 제공

### 구현 방식

```typescript
// CryptoIcon 컴포넌트 사용 예시
import CryptoIcon from "@/components/ui/CryptoIcon";

<CryptoIcon symbol="BTC" size={24} className="mr-2 flex-shrink-0" />;
```

### 아이콘 파일 위치

- **패키지**: `cryptocurrency-icons@^0.18.1`
- **로컬 경로**: `public/cryptocurrency-icons/32/color/`
- **지원 형식**: PNG 파일 (32x32 픽셀)

### 지원 가상자산

- **BTC** (Bitcoin): `btc.png`
- **ETH** (Ethereum): `eth.png`
- **USDC** (USD Coin): `usdc.png`
- **USDT** (Tether): `usdt.png`
- **SOL** (Solana): `sol.png`
- **기타**: 500+ 가상자산 지원

### Fallback 처리

- **지원되지 않는 자산**: KRW, KRD, WON 등은 텍스트 기반 원형 아이콘으로 표시
- **로딩 실패**: 자동으로 텍스트 fallback으로 전환
- **일관된 디자인**: 모든 fallback은 회색 배경에 자산 심볼 표시

### 사용 금지 사항

- **직접 img 태그 사용 금지**: 가상자산 아이콘에 대해서는 반드시 CryptoIcon 컴포넌트 사용
- **외부 CDN URL 사용 금지**: GitHub raw URL 등 외부 링크 사용 금지
- **하드코딩된 아이콘 URL 금지**: 동적 아이콘 로딩을 위해 CryptoIcon 컴포넌트 활용

## 통합 배지 시스템 (Badge System)

사용자 관리 페이지의 배지 디자인을 기준으로 한 프로젝트 전체 배지 시스템. 일관된 시각적 계층과 눈의 피로감 완화를 목적으로 설계되었습니다.

### 🎨 핵심 배지 컬러 팔레트

#### 계층별 색상 (우선순위/중요도 순)

```typescript
const badgeColors = {
  // 최고 우선순위 - 관리자/긴급/중요
  highest: 'text-indigo-600 bg-indigo-50 border-indigo-200',

  // 높은 우선순위 - 매니저/승인 필요/주의
  high: 'text-blue-600 bg-blue-50 border-blue-200',

  // 중간 우선순위 - 운영자/처리중/보통
  medium: 'text-purple-600 bg-purple-50 border-purple-200',

  // 성공/활성/긍정 상태 (초록색 대체)
  positive: 'text-sky-600 bg-sky-50 border-sky-200',

  // 경고/대기/보류 상태
  warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',

  // 오류/거부/위험 상태
  danger: 'text-red-600 bg-red-50 border-red-200',

  // 중성/비활성/기본 상태
  neutral: 'text-gray-600 bg-gray-50 border-gray-200'
};
```

### 📋 용도별 배지 매핑

#### 사용자 역할 배지

```typescript
const roleColors = {
  admin: badgeColors.highest,     // 관리자
  manager: badgeColors.high,      // 매니저
  operator: badgeColors.medium,   // 운영자
  viewer: badgeColors.neutral     // 뷰어
};
```

#### 상태 배지

```typescript
const statusColors = {
  // 일반 상태
  active: badgeColors.positive,     // 활성/연결됨/성공
  inactive: badgeColors.neutral,    // 비활성/연결끊김
  pending: badgeColors.warning,     // 대기/보류/처리중
  error: badgeColors.danger,        // 오류/실패/거부

  // 승인 상태
  approved: badgeColors.positive,   // 승인됨
  rejected: badgeColors.danger,     // 거부됨
  review: badgeColors.warning,      // 검토중

  // 트랜잭션 상태
  completed: badgeColors.positive,  // 완료
  failed: badgeColors.danger,       // 실패
  processing: badgeColors.warning,  // 처리중

  // 계좌/연결 상태
  connected: badgeColors.positive,  // 연결됨
  expired: badgeColors.warning,     // 만료됨
  blocked: badgeColors.danger       // 차단됨
};
```

#### 우선순위/레벨 배지

```typescript
const priorityColors = {
  critical: badgeColors.danger,     // 긴급/중요
  high: badgeColors.highest,        // 높음
  medium: badgeColors.high,         // 보통
  low: badgeColors.neutral,         // 낮음

  // 보안 레벨
  level1: badgeColors.neutral,      // 기본
  level2: badgeColors.medium,       // 중간
  level3: badgeColors.high,         // 높음
  level4: badgeColors.highest       // 최고
};
```

#### 권한/기능 배지

```typescript
const permissionColors = {
  granted: badgeColors.positive,    // 권한 있음
  denied: badgeColors.neutral,      // 권한 없음
  limited: badgeColors.warning,     // 제한적 권한

  // 기능 상태
  enabled: badgeColors.positive,    // 활성화
  disabled: badgeColors.neutral,    // 비활성화
  beta: badgeColors.medium,         // 베타 기능
  new: badgeColors.high             // 신규 기능
};
```

### 🎯 배지 컴포넌트 패턴

#### 기본 배지

```typescript
// 기본 소형 배지 (텍스트 전용)
<span className="px-2 py-1 text-xs font-semibold rounded-full bg-sky-50 text-sky-600">
  활성
</span>

// 테두리 포함 배지 (강조용)
<span className="px-2 py-1 text-xs font-semibold rounded-full border bg-indigo-50 text-indigo-600 border-indigo-200">
  관리자
</span>

// 아이콘 포함 배지
<span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-sky-50 text-sky-600">
  <CheckCircleIcon className="w-3 h-3 mr-1" />
  승인됨
</span>
```

#### 크기 변형

```typescript
// 미니 배지
<span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-600">

// 일반 배지
<span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600">

// 중형 배지
<span className="px-3 py-1.5 text-sm font-semibold rounded-full bg-blue-50 text-blue-600">
```

### ⚙️ 적용 원칙

#### 색상 선택 가이드

1. **성공/긍정**: `positive` (하늘색) - 초록색 대신 사용
2. **경고/대기**: `warning` (노란색) - 주의가 필요한 상태
3. **오류/위험**: `danger` (빨간색) - 즉시 조치 필요
4. **중성/기본**: `neutral` (회색) - 일반적인 상태
5. **계층별**: `highest` > `high` > `medium` > `neutral`

#### 시각적 일관성

- **투명도**: 모든 배경은 50 레벨 사용 (`-50`)
- **텍스트**: 600 레벨 사용 (`-600`)
- **테두리**: 200 레벨 사용 (`-200`, 강조시만)
- **폰트**: `text-xs font-semibold` 기본

#### 접근성 고려사항

- 충분한 색상 대비율 확보 (4.5:1 이상)
- 색상만으로 정보 전달하지 않기 (텍스트/아이콘 병행)
- 색맹 사용자 고려한 색상 조합

### 🔄 마이그레이션 가이드

현재 프로젝트에서 아래 색상들을 새로운 시스템으로 교체:

```typescript
// 교체 대상 (Old → New)
'bg-green-100 text-green-800' → badgeColors.positive
'bg-green-600 text-white' → '배경형 버튼으로 변경 권장'
'bg-blue-100 text-blue-800' → badgeColors.high
'bg-yellow-100 text-yellow-800' → badgeColors.warning
'bg-red-100 text-red-800' → badgeColors.danger
'bg-gray-100 text-gray-800' → badgeColors.neutral
```

### 📍 적용 우선순위

필요할 때마다 점진적으로 적용:

1. **사용자 관리** - ✅ 완료 (참조 기준)
2. **출금/승인 시스템** - 승인 상태 배지
3. **트랜잭션 관리** - 거래 상태 배지
4. **주소 관리** - 권한/한도 상태 배지
5. **보안 설정** - 인증/연결 상태 배지
6. **알림 센터** - 우선순위/타입 배지
