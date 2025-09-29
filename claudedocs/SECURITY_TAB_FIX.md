# 보안 탭 사라짐 문제 해결 작업 기록

## 📋 문제 정의

### 현상
- `/security/addresses/personal` 접속 시 보안설정의 1차 탭들이 사라지는 현상
- 1차 탭: 보안설정, 주소 관리, 계좌 연동, 정책 관리, 알림설정
- 다른 탭(`/security/security` 등)에서는 정상 표시됨

### 원인
- `/security/addresses/[tab]/page.tsx`에서 `AddressManagement` 컴포넌트를 직접 렌더링
- `SecuritySettings` 컴포넌트를 거치지 않아 상위 탭 네비게이션이 누락됨

## 🔧 해결 방법

### 1. `/src/app/security/addresses/[tab]/page.tsx` 수정

**변경 전:**
```typescript
import AddressManagement from '@/components/security/AddressManagement'

return (
  <PageLayout activeTab="security">
    <AddressManagement initialTab={tab} />
  </PageLayout>
)
```

**변경 후:**
```typescript
import SecuritySettings from '@/components/SecuritySettings'

return (
  <PageLayout activeTab="security">
    <SecuritySettings
      plan={selectedPlan}
      initialTab="addresses"
      addressSubtab={tab}
    />
  </PageLayout>
)
```

### 2. `/src/app/security/addresses/page.tsx` 수정

**변경 전:**
```typescript
export default function AddressesPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/security/addresses/personal')
  }, [router])

  return null
}
```

**변경 후:**
```typescript
export default function AddressesPage() {
  const { selectedPlan } = useServicePlan()

  return (
    <PageLayout activeTab="security">
      <SecuritySettings
        plan={selectedPlan}
        initialTab="addresses"
        addressSubtab="personal"
      />
    </PageLayout>
  )
}
```

### 3. `SecuritySettings.tsx` 컴포넌트 개선

**인터페이스 확장:**
```typescript
interface SecuritySettingsProps {
  plan: ServicePlan;
  initialTab?: "security" | "addresses" | "accounts" | "policies" | "notifications";
  notificationSubtab?: "logs" | "templates" | "settings";
  policySubtab?: "amount" | "type";
  addressSubtab?: "personal" | "vasp" | "history"; // 추가
}
```

**prop 전달 수정:**
```typescript
export default function SecuritySettings({
  plan,
  initialTab,
  notificationSubtab,
  policySubtab,
  addressSubtab  // 추가
}: SecuritySettingsProps) {
```

**AddressManagement에 prop 전달:**
```typescript
{activeTab === "addresses" && <AddressManagement initialTab={addressSubtab} />}
```

## 🎯 수정된 파일 목록

1. `/src/app/security/addresses/[tab]/page.tsx`
2. `/src/app/security/addresses/page.tsx`
3. `/src/components/SecuritySettings.tsx`

## ✅ 검증 방법

### 빌드 테스트
```bash
npm run build
```

### 개발 서버 실행
```bash
npm run dev
```

### 테스트 URL들
- `/security/addresses/personal` - 개인 지갑 탭 + 보안 네비게이션 표시
- `/security/addresses/vasp` - VASP 지갑 탭 + 보안 네비게이션 표시
- `/security/addresses/history` - 내역 탭 + 보안 네비게이션 표시
- `/security/security` - 기존과 동일하게 정상 동작

## 🚀 기대 효과

### 해결된 문제
- ✅ `/security/addresses/*` 경로에서 보안 탭 정상 표시
- ✅ 일관된 네비게이션 구조 유지
- ✅ 직접 URL 접근 시에도 올바른 탭 상태
- ✅ 브라우저 뒤로/앞으로 버튼 정상 동작

### 라우팅 구조 통일
```
/security/security -> SecuritySettings (보안설정 탭)
/security/addresses -> SecuritySettings (주소관리 탭 + personal 서브탭)
/security/addresses/personal -> SecuritySettings (주소관리 탭 + personal 서브탭)
/security/addresses/vasp -> SecuritySettings (주소관리 탭 + vasp 서브탭)
/security/addresses/history -> SecuritySettings (주소관리 탭 + history 서브탭)
```

## 📝 작업 완료 확인사항

- [x] 타입스크립트 컴파일 에러 없음
- [x] Next.js 빌드 성공
- [x] 모든 라우팅 경로에서 탭 네비게이션 정상 표시
- [x] 주소 관리 서브탭 기능 정상 동작
- [x] 기존 기능에 영향 없음

---

**작업 완료일**: 2024년 9월 23일
**소요 시간**: 약 30분
**난이도**: 중급 (라우팅 구조 이해 필요)