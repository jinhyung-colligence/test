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

## 배지 및 상태 표시 컬러 시스템

### 역할 배지 컬러 (사용자 관리 페이지 기준)

사용자 역할에 따른 배지 색상 체계로, 계층적 시각 구분과 눈의 피로감 완화를 목적으로 설계

```typescript
// 역할별 배지 색상 (getRoleColor 함수 참조)
const roleColors = {
  admin: 'text-indigo-600 bg-indigo-50 border-indigo-200',    // 관리자: 보라-파랑 계열
  manager: 'text-blue-600 bg-blue-50 border-blue-200',        // 매니저: 파란 계열
  operator: 'text-purple-600 bg-purple-50 border-purple-200', // 운영자: 보라 계열
  viewer: 'text-gray-600 bg-gray-50 border-gray-200'          // 뷰어: 회색 계열
};
```

### 상태 배지 컬러

사용자 활동 상태에 따른 배지 색상 체계

```typescript
// 상태별 배지 색상 (getStatusColor 함수 참조)
const statusColors = {
  active: 'text-sky-600 bg-sky-50',      // 활성: 하늘색 (초록색 대체)
  inactive: 'text-gray-600 bg-gray-50',  // 비활성: 회색
  pending: 'text-yellow-600 bg-yellow-50' // 대기: 노란색
};
```

### 권한 상태 표시 컬러

권한 보유 여부에 따른 표시 색상

```typescript
// 권한 상태 색상 (getPermissionStatusColor 함수 참조)
const permissionStatusColors = {
  hasPermission: 'text-sky-600',  // 권한 보유: 하늘색
  noPermission: 'text-gray-400'   // 권한 없음: 회색
};
```

### 적용 원칙

- **계층적 구분**: 역할의 중요도에 따라 색상 강도 차별화 (admin > manager > operator > viewer)
- **눈의 피로감 완화**: 모든 배지는 50 투명도 배경 사용으로 부드러운 시각 효과
- **접근성 고려**: 충분한 대비율 확보로 가독성 보장
- **일관성 유지**: 프로젝트 전반에서 동일한 색상 체계 사용

### 사용 예시

```typescript
// 역할 배지 적용
<span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getRoleColor(user.role)}`}>
  {getRoleName(user.role)}
</span>

// 상태 배지 적용
<span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
  {getStatusName(user.status)}
</span>
```

### 확장 가능성

이 컬러 시스템은 다른 컴포넌트에서도 활용 가능:
- 정책 승인 상태 배지
- 트랜잭션 상태 표시
- 알림 우선순위 배지
- 계좌 연결 상태 표시
