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
