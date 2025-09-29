# 보안 정책 기반 동적 로그인 시스템 설계

## 개요

관리자가 보안 설정에서 구성한 정책이 로그인 프로세스에 실시간으로 반영되는 동적 인증 시스템을 설계합니다.

## 현재 시스템 분석

### 보안 정책 설정 (SecurityTab)
- **Google Authenticator 정책**: 필수/선택 설정
- **SMS 인증 정책**: 필수/선택 설정
- **IP 접근 제어**: 활성화/비활성화
- **세션 타임아웃**: 15분/30분/1시간/2시간

### 로그인 시스템 (AuthContext)
- **고정된 3단계**: 이메일 → OTP → SMS
- **시도 제한**: 5회 실패 시 차단
- **세션 관리**: 30분 고정

## 설계 목표

1. **동적 인증 플로우**: 보안 정책에 따라 필요한 인증 단계만 활성화
2. **실시간 반영**: 정책 변경 시 즉시 로그인 프로세스에 적용
3. **유연한 구성**: 다양한 보안 요구사항에 대응 가능
4. **사용자 경험**: 불필요한 인증 단계 제거로 UX 개선

## 아키텍처 설계

### 1. SecurityPolicyContext 신규 생성

```typescript
// src/contexts/SecurityPolicyContext.tsx

interface SecurityPolicy {
  // 인증 정책
  authenticatorRequired: boolean    // OTP 필수 여부
  smsRequired: boolean             // SMS 필수 여부

  // 접근 제어
  ipWhitelistEnabled: boolean      // IP 화이트리스트 활성화

  // 세션 관리
  sessionTimeout: number           // 세션 타임아웃 (분)

  // 보안 설정
  maxAttempts: number             // 최대 시도 횟수
}

interface SecurityPolicyContextType {
  policy: SecurityPolicy
  updatePolicy: (updates: Partial<SecurityPolicy>) => void
  getRequiredAuthSteps: () => AuthStep[]
}
```

### 2. AuthContext 업데이트

```typescript
// 동적 인증 단계 결정
const getRequiredAuthSteps = (policy: SecurityPolicy): AuthStep[] => {
  const steps: AuthStep[] = ['email'] // 이메일은 항상 필수

  if (policy.authenticatorRequired) {
    steps.push('otp')
  }

  if (policy.smsRequired) {
    steps.push('sms')
  }

  return steps
}

// 세션 타임아웃 동적 설정
const getSessionTimeout = (policy: SecurityPolicy): number => {
  return policy.sessionTimeout * 60 * 1000 // 분을 밀리초로 변환
}
```

### 3. 로그인 페이지 업데이트

```typescript
// 단계 표시기 동적 생성
const renderStepIndicator = () => {
  const { policy } = useSecurityPolicy()
  const requiredSteps = policy.getRequiredAuthSteps()

  const stepConfig = {
    email: { label: '이메일', icon: EnvelopeIcon },
    otp: { label: 'OTP 인증', icon: KeyIcon },
    sms: { label: 'SMS 인증', icon: DevicePhoneMobileIcon }
  }

  return requiredSteps.map(stepKey => stepConfig[stepKey])
}
```

## 구현 단계

### Phase 1: SecurityPolicyContext 구현
1. **컨텍스트 생성**: 보안 정책 상태 관리
2. **데이터 저장**: localStorage 또는 API 연동
3. **SecurityTab 연동**: 정책 변경 시 컨텍스트 업데이트

### Phase 2: AuthContext 연동
1. **정책 기반 플로우**: getRequiredAuthSteps 구현
2. **동적 세션 타임아웃**: 정책 기반 세션 만료 시간 설정
3. **시도 횟수 제한**: 정책 기반 maxAttempts 적용

### Phase 3: 로그인 UI 업데이트
1. **동적 단계 표시**: 실제 필요한 단계만 표시
2. **조건부 렌더링**: 비활성화된 인증 방법 건너뛰기
3. **UX 최적화**: 단순화된 인증 플로우

### Phase 4: 고급 보안 기능
1. **IP 화이트리스트**: 접근 IP 검증
2. **실시간 정책 반영**: 정책 변경 즉시 적용
3. **보안 로그**: 정책 변경 및 인증 시도 기록

## 예상 시나리오

### 시나리오 1: 간소화된 인증
- **정책**: OTP 비활성화, SMS 활성화
- **플로우**: 이메일 → SMS → 완료
- **효과**: OTP 단계 제거로 사용자 편의성 향상

### 시나리오 2: 강화된 보안
- **정책**: OTP 활성화, SMS 활성화, IP 제어 활성화
- **플로우**: IP 검증 → 이메일 → OTP → SMS → 완료
- **효과**: 다중 인증으로 보안 강화

### 시나리오 3: 최소 인증
- **정책**: OTP 비활성화, SMS 비활성화 (비추천)
- **플로우**: 이메일 → 완료
- **효과**: 빠른 로그인, 낮은 보안 수준

## 기술적 고려사항

### 데이터 일관성
- 정책 변경 시 기존 인증 세션 처리 방안
- 여러 탭에서 정책 변경 시 동기화

### 보안 강화
- 정책 변경 권한 제어 (관리자만 가능)
- 최소 보안 수준 강제 (이메일만으로는 불충분)

### 사용자 경험
- 정책 변경 시 사용자에게 알림
- 인증 단계 변경에 대한 명확한 안내

## 구현 우선순위

1. **높음**: SecurityPolicyContext 구현 및 기본 연동
2. **높음**: AuthContext 동적 플로우 구현
3. **중간**: 로그인 UI 동적 업데이트
4. **낮음**: IP 화이트리스트 및 고급 기능

## 결론

이 설계를 통해 관리자가 보안 요구사항에 따라 유연하게 인증 프로세스를 구성할 수 있으며, 사용자는 불필요한 인증 단계 없이 효율적으로 로그인할 수 있습니다. 또한 보안 정책이 실시간으로 반영되어 즉각적인 보안 강화가 가능합니다.