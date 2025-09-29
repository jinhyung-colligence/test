# 신규 사용자 초기 GA 설정 플로우 설계

## 1. 개요

관리자가 생성한 신규 사용자의 최초 로그인 시 GA(Google Authenticator) 설정이 안되어 있어서 로그인할 수 없는 문제를 해결하기 위한 시스템 설계입니다.

### 목표
- 신규 사용자도 최초 로그인 가능
- GA 설정 완료 후 정상 보안 플로우 적용
- 최소한의 코드 변경으로 구현
- 보안성 유지

## 2. 초기 로그인 플로우 다이어그램

```
[신규 사용자 로그인 시도]
          ↓
[이메일 인증] → [실패 시 종료]
          ↓ [성공]
[사용자 GA 설정 상태 확인]
          ↓
    [GA 설정됨?] → [예] → [기존 플로우: 이메일+OTP+SMS]
          ↓ [아니오]
[신규 사용자 플로우: 이메일+SMS만]
          ↓
[SMS 인증 성공]
          ↓
[GA 설정 강제 페이지로 이동]
          ↓
[GA 설정 완료]
          ↓
[사용자 GA 상태 업데이트]
          ↓
[대시보드 접근 허용]
```

## 3. 데이터 구조 변경사항

### 3.1 User 타입 확장

```typescript
// src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  permissions: string[];
  department: string;
  position: string;

  // 새로 추가
  hasGASetup: boolean;          // GA 설정 완료 여부
  gaSetupDate?: string;         // GA 설정 완료 일시
  isFirstLogin: boolean;        // 최초 로그인 여부
}
```

### 3.2 AuthStep 확장

```typescript
// src/contexts/AuthContext.tsx
interface AuthStep {
  step: 'email' | 'otp' | 'sms' | 'ga_setup' | 'completed' | 'blocked'
  email?: string
  user?: User
  attempts: number
  maxAttempts: number
  blockedUntil?: number
  blockReason?: string
  requiredSteps?: AuthStepType[]
  currentStepIndex?: number

  // 새로 추가
  isFirstTimeUser?: boolean;    // 신규 사용자 여부
  skipOTP?: boolean;           // OTP 단계 스킵 여부
}
```

## 4. 컴포넌트 설계

### 4.1 GA 설정 강제 페이지

```typescript
// src/app/login/setup-ga/page.tsx
interface GASetupPageProps {
  user: User;
  onComplete: () => void;
}

export default function GASetupPage({ user, onComplete }: GASetupPageProps) {
  // AuthenticatorManagement 컴포넌트 재사용
  // 설정 완료 시 사용자 상태 업데이트
  // 완료 후 대시보드로 리다이렉트
}
```

### 4.2 GA 설정 강제 모달

```typescript
// src/components/auth/GASetupModal.tsx
interface GASetupModalProps {
  isOpen: boolean;
  user: User;
  onComplete: () => void;
  onCancel?: never; // 취소 불가
}

export default function GASetupModal({ isOpen, user, onComplete }: GASetupModalProps) {
  // 닫기 버튼 없음 (강제 설정)
  // AuthenticatorManagement 로직 포함
  // 설정 완료까지 다른 페이지 접근 차단
}
```

### 4.3 라우팅 가드

```typescript
// src/components/auth/RouteGuard.tsx
export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthenticated && user && !user.hasGASetup) {
      // GA 미설정 사용자는 설정 페이지로 강제 이동
      if (pathname !== '/login/setup-ga') {
        router.replace('/login/setup-ga');
      }
    }
  }, [user, isAuthenticated, pathname]);

  return <>{children}</>;
}
```

## 5. 보안 정책 로직 수정

### 5.1 SecurityPolicyContext 수정

```typescript
// src/contexts/SecurityPolicyContext.tsx

// 신규 사용자를 위한 인증 단계 결정
const getRequiredAuthSteps = (user?: User): AuthStepType[] => {
  // 신규 사용자 (GA 미설정)인 경우
  if (user && !user.hasGASetup) {
    return ['email', 'sms']; // OTP 제외
  }

  // 기존 사용자 (GA 설정 완료)
  return ['email', 'otp', 'sms'];
};

// 신규 사용자 감지
const isFirstTimeUser = (user: User): boolean => {
  return user.isFirstLogin && !user.hasGASetup;
};
```

### 5.2 AuthContext 로직 수정

```typescript
// src/contexts/AuthContext.tsx

const login = async (email: string) => {
  // ... 기존 로직 ...

  const user = getUserByEmail(email);

  // 신규 사용자인 경우 특별 처리
  const requiredSteps = getRequiredAuthSteps(user);
  const isFirstTime = user ? isFirstTimeUser(user) : false;

  setAuthStep({
    step: 'email',
    email,
    user,
    attempts: 0,
    maxAttempts: 5,
    requiredSteps,
    currentStepIndex: 0,
    isFirstTimeUser: isFirstTime,
    skipOTP: isFirstTime
  });
};

// OTP 단계에서 신규 사용자는 자동으로 SMS로 진행
const handleAuthStepProgression = () => {
  if (authStep.isFirstTimeUser && authStep.step === 'otp') {
    // 신규 사용자는 OTP를 스킵하고 SMS로
    setAuthStep(prev => ({ ...prev, step: 'sms', currentStepIndex: 2 }));
  }
};
```

## 6. 라우팅 및 보안 검증

### 6.1 새로운 라우트 추가

```
/login/setup-ga       # GA 설정 강제 페이지
```

### 6.2 미들웨어 수정

```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 인증된 사용자의 GA 설정 상태 확인
  const userCookie = request.cookies.get('user');
  if (userCookie) {
    const user = JSON.parse(userCookie.value);

    // GA 미설정 사용자는 설정 페이지로만 접근 가능
    if (!user.hasGASetup && pathname !== '/login/setup-ga' && pathname !== '/login') {
      return NextResponse.redirect(new URL('/login/setup-ga', request.url));
    }
  }

  return NextResponse.next();
}
```

## 7. 사용자 경험 플로우

### 7.1 신규 사용자 시나리오

1. **관리자가 신규 사용자 계정 생성**
   - `hasGASetup: false`
   - `isFirstLogin: true`

2. **신규 사용자 최초 로그인**
   - 이메일 입력
   - SMS 인증만 진행 (OTP 스킵)
   - 로그인 성공

3. **GA 설정 강제 페이지**
   - QR 코드 스캔
   - 인증번호 입력
   - 백업 코드 저장

4. **설정 완료 후**
   - `hasGASetup: true` 업데이트
   - `isFirstLogin: false` 업데이트
   - 대시보드 접근 허용

### 7.2 기존 사용자 시나리오

1. **기존 사용자 로그인**
   - 이메일 + OTP + SMS (기존과 동일)
   - 정상 대시보드 접근

## 8. 구현 우선순위

### Phase 1: 기본 구조
1. User 타입 확장
2. AuthStep 확장
3. getRequiredAuthSteps 로직 수정

### Phase 2: 컴포넌트 개발
1. GASetupModal 컴포넌트
2. GASetupPage 컴포넌트
3. RouteGuard 컴포넌트

### Phase 3: 라우팅 및 보안
1. 미들웨어 수정
2. 라우팅 가드 적용
3. 전체 플로우 테스트

## 9. 보안 고려사항

### 9.1 위험 요소
- 신규 사용자의 경우 OTP 없이 로그인 가능
- SMS만으로 인증하는 구간 존재

### 9.2 완화 방안
- SMS 인증 강화 (더 긴 코드, 짧은 유효시간)
- GA 설정 완료까지 다른 기능 접근 완전 차단
- 설정 페이지에서 세션 타임아웃 강화
- GA 설정 완료 로그 기록

### 9.3 감사 로깅
```typescript
// 로그 기록 항목
- 신규 사용자 최초 로그인 시도
- GA 설정 페이지 접근
- GA 설정 완료
- GA 설정 중 이탈/실패
```

## 10. 테스트 시나리오

### 10.1 정상 플로우
1. 신규 사용자 생성 → 로그인 → GA 설정 → 대시보드 접근
2. 기존 사용자 로그인 → 정상 플로우

### 10.2 예외 상황
1. GA 설정 중 브라우저 종료
2. GA 설정 완료 전 다른 페이지 접근 시도
3. 잘못된 QR 코드 스캔
4. 인증번호 입력 실패

### 10.3 보안 테스트
1. GA 설정 페이지 직접 URL 접근
2. 쿠키/세션 조작 시도
3. 동시 다중 세션 테스트

## 11. 성능 고려사항

### 11.1 최적화 포인트
- GA 설정 페이지는 사전 로드
- QR 코드 생성 캐싱
- 백업 코드 생성 최적화

### 11.2 모니터링
- GA 설정 완료율 추적
- 설정 소요 시간 측정
- 설정 중 이탈률 분석

이 설계를 통해 신규 사용자도 안전하게 로그인하고 GA를 설정할 수 있으며, 기존 보안 정책을 유지하면서도 사용자 경험을 개선할 수 있습니다.