# 정책 기반 필수 결재자 설정 UI 설계안

## 개요

그룹 생성 시 예산 설정을 먼저 하고, 설정된 예산 금액(KRW 환산)에 따라 정책에서 필요한 결재자를 자동으로 매칭하는 UI로 개선

## 현재 상황 분석

### 기존 시스템
1. **정책 관리 (`PolicyManagement.tsx`)**
   - `APPROVAL_POLICIES` 배열에 거래금액별 정책 저장
   - 각 정책: `minAmount`, `maxAmount`, `requiredApprovers[]`
   - 위험도별 추천 결재자 시스템 존재

2. **그룹 생성 (`GroupManagement.tsx`)**
   - 수동 필수 결재자 선택 방식
   - 예산 설정과 정책이 연결되지 않음
   - 순서: 기본정보 → 관리자 → 필수결재자 → 예산설정

### 문제점
- 예산 금액과 정책이 분리되어 있음
- 수동으로 결재자를 선택해야 함
- 정책과 일관성 없는 결재자 설정 가능

## 개선 설계안

### 1. UI 플로우 변경

#### 기존 플로우
```
기본정보 → 관리자 → 필수결재자(수동) → 예산설정
```

#### 개선된 플로우
```
기본정보 → 관리자 → 예산설정 → 정책 기반 필수결재자(자동+수동조정)
```

### 2. 핵심 컴포넌트 설계

#### A. 예산 기반 정책 매칭 유틸리티

```typescript
// src/utils/policyMatcher.ts

interface PolicyMatchResult {
  matchedPolicy: ApprovalPolicy | null;
  requiredApprovers: string[];
  riskLevel: string;
  budgetAmountKRW: number;
}

/**
 * 예산 금액(가상자산)을 KRW로 환산하고 해당하는 정책을 찾음
 */
export function matchPolicyByBudget(
  budgetAmount: number,
  currency: CryptoCurrency,
  exchangeRates?: Record<CryptoCurrency, number>
): PolicyMatchResult {
  // 1. 가상자산을 KRW로 환산
  const krwAmount = convertToKRW(budgetAmount, currency, exchangeRates);

  // 2. 금액에 해당하는 정책 찾기
  const matchedPolicy = APPROVAL_POLICIES
    .filter(policy => policy.currency === 'KRW')
    .find(policy =>
      krwAmount >= policy.minAmount &&
      krwAmount <= policy.maxAmount
    );

  // 3. 결과 반환
  return {
    matchedPolicy,
    requiredApprovers: matchedPolicy?.requiredApprovers || [],
    riskLevel: getRiskLevelByApproverCount(matchedPolicy?.requiredApprovers.length || 0),
    budgetAmountKRW: krwAmount
  };
}

/**
 * 가상자산을 KRW로 환산
 */
function convertToKRW(
  amount: number,
  currency: CryptoCurrency,
  exchangeRates?: Record<CryptoCurrency, number>
): number {
  // 실시간 환율 또는 고정 환율 사용
  const defaultRates: Record<CryptoCurrency, number> = {
    BTC: 45000000,  // 1 BTC = 45,000,000 KRW
    ETH: 3000000,   // 1 ETH = 3,000,000 KRW
    USDT: 1300,     // 1 USDT = 1,300 KRW
    USDC: 1300,     // 1 USDC = 1,300 KRW
    SOL: 150000,    // 1 SOL = 150,000 KRW
  };

  const rates = exchangeRates || defaultRates;
  return Math.round(amount * (rates[currency] || 1));
}
```

#### B. 정책 기반 결재자 설정 컴포넌트

```typescript
// src/components/groups/PolicyBasedApproverSetup.tsx

interface PolicyBasedApproverSetupProps {
  budgetAmount: number;
  currency: CryptoCurrency;
  onApproversChange: (approvers: string[]) => void;
  managerId?: string;
  disabled?: boolean;
}

export default function PolicyBasedApproverSetup({
  budgetAmount,
  currency,
  onApproversChange,
  managerId,
  disabled = false
}: PolicyBasedApproverSetupProps) {
  const [policyMatch, setPolicyMatch] = useState<PolicyMatchResult | null>(null);
  const [customApprovers, setCustomApprovers] = useState<string[]>([]);
  const [showCustomization, setShowCustomization] = useState(false);

  // 예산이 변경될 때마다 정책 매칭
  useEffect(() => {
    if (budgetAmount > 0) {
      const match = matchPolicyByBudget(budgetAmount, currency);
      setPolicyMatch(match);
      setCustomApprovers(match.requiredApprovers);
      onApproversChange(match.requiredApprovers);
    }
  }, [budgetAmount, currency, onApproversChange]);

  return (
    <div className="space-y-4">
      {/* 정책 매칭 결과 표시 */}
      {policyMatch && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">
                정책 기반 자동 설정
              </h4>
              <div className="mt-1 text-sm text-blue-600">
                <p>예산 금액: {formatCurrency(policyMatch.budgetAmountKRW)} KRW</p>
                <p>적용 정책: {policyMatch.matchedPolicy?.description}</p>
                <p>위험도: {policyMatch.riskLevel} (필요 결재자 {policyMatch.requiredApprovers.length}명)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 자동 설정된 결재자 목록 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            필수 결재자 {policyMatch && `(정책 기반 ${policyMatch.requiredApprovers.length}명)`}
          </label>
          <button
            type="button"
            onClick={() => setShowCustomization(!showCustomization)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {showCustomization ? '기본값으로 되돌리기' : '사용자 정의'}
          </button>
        </div>

        {/* 결재자 목록 */}
        <div className="space-y-2">
          {customApprovers.map((approverId, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
              <select
                value={approverId}
                onChange={(e) => handleApproverChange(index, e.target.value)}
                disabled={disabled || (!showCustomization && policyMatch?.requiredApprovers.includes(approverId))}
                className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  disabled || (!showCustomization && policyMatch?.requiredApprovers.includes(approverId))
                    ? 'bg-gray-50 text-gray-600'
                    : ''
                }`}
              >
                <option value="">결재자 선택</option>
                {getEligibleApprovers(managerId, customApprovers, index).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.department}) - {ROLE_NAMES[user.role]}
                  </option>
                ))}
              </select>

              {/* 정책 기반 자동 설정 표시 */}
              {!showCustomization && policyMatch?.requiredApprovers.includes(approverId) && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  정책 기반
                </span>
              )}

              {/* 사용자 정의 모드에서만 추가/제거 버튼 */}
              {showCustomization && customApprovers.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveApprover(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          {/* 사용자 정의 모드에서만 결재자 추가 버튼 */}
          {showCustomization && (
            <button
              type="button"
              onClick={handleAddApprover}
              className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
            >
              + 결재자 추가
            </button>
          )}
        </div>
      </div>

      {/* 정책 불일치 경고 */}
      {showCustomization && policyMatch && customApprovers.length !== policyMatch.requiredApprovers.length && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex">
            <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                정책 권장 결재자 수({policyMatch.requiredApprovers.length}명)와 다릅니다.
                현재: {customApprovers.filter(id => id).length}명
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 3. GroupManagement.tsx 통합 수정

#### 주요 변경사항

1. **UI 순서 변경**: 예산 설정을 필수 결재자 설정 이전으로 이동
2. **정책 기반 자동 설정**: 예산이 설정되면 자동으로 필수 결재자 추천
3. **실시간 업데이트**: 예산 변경 시 결재자 재계산

```typescript
// GroupManagement.tsx의 주요 수정 부분

// 예산 설정 후 정책 매칭
useEffect(() => {
  if (newGroup.budgetSetup && newGroup.budgetSetup.baseAmount > 0) {
    const policyMatch = matchPolicyByBudget(
      newGroup.budgetSetup.baseAmount,
      newGroup.currency
    );

    // 자동으로 필수 결재자 설정
    if (policyMatch.requiredApprovers.length > 0) {
      setRequiredApprovers(policyMatch.requiredApprovers);
    }
  }
}, [newGroup.budgetSetup, newGroup.currency]);

// UI 렌더링 순서 변경
return (
  // ... 기본 정보, 관리자 ...

  {/* 예산 설정 - 필수 결재자보다 먼저 */}
  <div className="pt-4 border-t border-gray-200">
    <BudgetSetupForm />
    <BudgetDistribution />
  </div>

  {/* 정책 기반 필수 결재자 설정 */}
  {newGroup.budgetSetup && newGroup.budgetSetup.baseAmount > 0 && (
    <div className="pt-4 border-t border-gray-200">
      <PolicyBasedApproverSetup
        budgetAmount={newGroup.budgetSetup.baseAmount}
        currency={newGroup.currency}
        onApproversChange={setRequiredApprovers}
        managerId={newGroup.manager}
        disabled={isEditMode}
      />
    </div>
  )}

  // ...
);
```

### 4. 데이터 구조 확장

#### 정책 매칭 결과 저장
```typescript
// types/groups.ts에 추가

interface PolicyMatchInfo {
  matchedPolicyId?: string;
  budgetAmountKRW: number;
  riskLevel: string;
  autoAssignedApprovers: string[];
  customApprovers?: string[];
  isCustomized: boolean;
}

interface WalletGroup {
  // ... 기존 필드들
  policyMatchInfo?: PolicyMatchInfo;
}
```

### 5. 구현 단계

#### Phase 1: 기반 유틸리티 구현
1. ✅ 정책 매칭 유틸리티 (`policyMatcher.ts`)
2. ✅ 환율 변환 로직
3. ✅ 위험도 계산 함수

#### Phase 2: UI 컴포넌트 개발
1. ✅ `PolicyBasedApproverSetup` 컴포넌트
2. ✅ 정책 정보 표시 UI
3. ✅ 사용자 정의 모드 UI

#### Phase 3: 통합 및 테스트
1. ✅ `GroupManagement.tsx` 수정
2. ✅ UI 순서 변경
3. ✅ 유효성 검사 로직 업데이트
4. ✅ 테스트 및 디버깅

### 6. 사용자 경험 개선

#### 직관적인 피드백
- 예산 입력 즉시 정책 매칭 결과 표시
- 위험도별 색상 코딩
- 정책 기반 vs 사용자 정의 구분 표시

#### 유연성 제공
- 정책 기반 자동 설정을 기본으로 하되
- 필요시 사용자 정의 가능
- 정책과 다를 경우 경고 표시

#### 검증 및 안전성
- 예산 금액과 정책의 일관성 검증
- 필수 결재자 수 권장사항 표시
- 위험도 기반 추가 검증

### 7. 추후 확장 고려사항

#### 실시간 환율 연동
```typescript
// 실시간 환율 API 연동
async function fetchRealTimeExchangeRates(): Promise<Record<CryptoCurrency, number>> {
  // CoinGecko, Binance API 등 활용
}
```

#### 정책 변경 알림
```typescript
// 정책이 변경되었을 때 기존 그룹에 영향 알림
function notifyPolicyChanges(changedPolicy: ApprovalPolicy) {
  // 영향받는 그룹 찾기
  // 사용자에게 알림
}
```

#### 승인 히스토리 추적
```typescript
// 정책 기반 vs 수동 설정 추적
interface ApproverAssignmentLog {
  groupId: string;
  assignmentType: 'policy-based' | 'manual';
  originalPolicy?: string;
  finalApprovers: string[];
  timestamp: string;
}
```

## 결론

이 설계안을 통해:
1. **일관성**: 예산 금액에 따른 정책 기반 일관된 결재자 설정
2. **효율성**: 자동 설정으로 수동 작업 최소화
3. **유연성**: 필요시 사용자 정의 가능
4. **투명성**: 정책 적용 과정의 가시화
5. **안전성**: 위험도 기반 적절한 결재자 수 보장

이를 통해 사용자가 요청한 "예산 설정 → 정책 기반 필수 결재자 자동 설정" 플로우를 구현할 수 있습니다.