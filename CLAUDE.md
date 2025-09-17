# Claude 설정

## 언어 설정

- 모든 피드백과 응답은 한국어로 제공

## UI/UX 스타일 가이드

- **이모지 아이콘 사용 금지**: 코드 내에서 이모지 문자(🚀, ⚠️, ✅ 등)를 사용하지 않음
- 시각적 표현이 필요한 경우 SVG 아이콘이나 CSS 클래스 사용 권장

### 컬러 사용 금지 규칙

- **초록색 계열 컬러 사용 금지**: `bg-green-*`, `text-green-*`, `border-green-*` 등 초록색 계열 클래스 사용 금지
- **금지 사유**: 시각적 피로감 유발 및 가독성 저하
- **대체 컬러**:
  - 성공/안전: `bg-blue-50 border-blue-200 text-blue-800` (파란색 계열)
  - 정보/알림: `bg-indigo-50 border-indigo-200 text-indigo-800` (인디고 계열)
  - 중요/강조: `bg-primary-50 border-primary-200 text-primary-800` (프라이머리 컬러)
  - 긍정적 상태: `bg-sky-50 border-sky-200 text-sky-800` (하늘색 계열)

## 자동화 규칙

- 필요 시 자동으로 빌드 실행
- 개발 서버 실행 시 명령어 종료 전에 자동으로 서버 종료
- 작업 완료 후 관련 프로세스들을 정리하여 시스템 리소스 확보

## 명령어

- 빌드: `npm run build`
- 개발 서버: `npm run dev`
- 타입 체크: `npm run typecheck`
- 린트: `npm run lint`

## 블록체인 주소/해시 표시 규칙

### 기본 원칙

- **모든 블록체인 관련 데이터**(주소, 트랜잭션 해시 등)는 동적 truncate 방식 사용
- **타입별 구분 없음**: 이더리움, 비트코인, 트랜잭션 해시 모두 동일한 로직 적용
- **컨테이너 너비에 맞춰 최대한 표시**: 여백 없이 꽉 찬 표시

### 구현 방법

#### 1. 필수 imports

```typescript
import { useState, useRef, useEffect } from "react";
```

#### 2. 상태 및 ref 설정

```typescript
// 각 필드별 ref
const fieldRef = useRef<HTMLDivElement>(null);

// 동적 문자 수 상태
const [maxChars, setMaxChars] = useState(45); // 기본값
```

#### 3. 너비 계산 함수

```typescript
const calculateMaxChars = (element: HTMLElement | null) => {
  if (!element) return 45; // 기본값

  const containerWidth = element.offsetWidth;
  const fontSize = 0.65; // rem - text-[0.65rem]
  const basePixelSize = 16; // 1rem = 16px
  const charWidth = fontSize * basePixelSize * 0.6; // monospace 문자 너비
  const padding = 16; // px-2 (8px * 2)
  const buttonWidth = 40; // 복사 버튼 너비

  const availableWidth = containerWidth - padding - buttonWidth;
  const maxChars = Math.floor(availableWidth / charWidth);

  // 최소 20자, 최대 100자로 제한
  return Math.max(20, Math.min(100, maxChars));
};
```

#### 4. 동적 truncate 함수

```typescript
const truncateDynamic = (text: string, maxChars: number) => {
  if (!text || text.length <= maxChars) {
    return text;
  }

  const dotsLength = 3;
  const availableChars = maxChars - dotsLength;

  // 앞 65%, 뒤 35% 비율로 분배
  const frontChars = Math.ceil(availableChars * 0.65);
  const backChars = availableChars - frontChars;

  return `${text.slice(0, frontChars)}...${text.slice(-backChars)}`;
};
```

#### 5. ResizeObserver 설정

```typescript
useEffect(() => {
  const updateMaxChars = () => {
    setMaxChars(calculateMaxChars(fieldRef.current));
  };

  updateMaxChars(); // 초기 계산

  const observer = new ResizeObserver(() => {
    updateMaxChars();
  });

  if (fieldRef.current) {
    observer.observe(fieldRef.current);
  }

  window.addEventListener("resize", updateMaxChars);

  return () => {
    observer.disconnect();
    window.removeEventListener("resize", updateMaxChars);
  };
}, []);
```

#### 6. JSX 적용

```typescript
<div className="space-y-2" ref={fieldRef}>
  <div className="flex items-center justify-between">
    <div className="flex items-center">
      <span className="text-sm font-medium text-gray-700">주소/해시</span>
    </div>
    <button onClick={() => copyToClipboard(fullText, "field")}>복사</button>
  </div>
  <div
    className="font-mono text-[0.65rem] leading-tight text-gray-900 bg-white px-2 py-1.5 rounded border break-all"
    title={fullText}
  >
    {truncateDynamic(fullText, maxChars)}
  </div>
</div>
```

### 사용 예시

- **이더리움 주소**: `0x742d35Cc6634C0532925a3b844Bc9e7595...f0bEb0`
- **비트코인 주소**: `bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx...x0wlh`
- **트랜잭션 해시**: `0xabcd12345678901234567890abcdef1234567...cdef01`

### 장점

1. **반응형**: 화면 크기에 따라 자동 조정
2. **일관성**: 모든 블록체인 데이터 동일한 방식
3. **최적화**: 여백 없이 최대한 많은 정보 표시
4. **사용성**: 복사 기능은 전체 데이터, 표시는 축약
5. **성능**: ResizeObserver로 효율적인 반응형 처리
