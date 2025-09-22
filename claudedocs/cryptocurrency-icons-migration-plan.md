# 가상자산 아이콘 cryptocurrency-icons 패키지 마이그레이션 계획서

## 📋 현황 분석

### 현재 상태
- **완료**: `src/components/TransactionHistory.tsx` - CryptoIcon 컴포넌트 적용 완료
- **마이그레이션 대상**: 11개 파일에서 외부 CDN URL 사용 중

### 발견된 문제점
1. **외부 의존성**: GitHub CDN URL 사용으로 네트워크 장애 시 아이콘 로딩 실패
2. **성능 저하**: 외부 요청으로 인한 로딩 지연
3. **일관성 부족**: 각 컴포넌트별로 다른 방식의 에러 처리
4. **유지보수성**: 중복된 URL 패턴 관리

## 🎯 마이그레이션 목표

1. **통합성**: 모든 가상자산 아이콘을 CryptoIcon 컴포넌트로 통일
2. **성능**: 로컬 파일 시스템 사용으로 로딩 속도 개선
3. **안정성**: 네트워크 의존성 제거
4. **확장성**: 새로운 가상자산 추가 시 쉬운 확장

## 📁 마이그레이션 대상 파일 분석

### 1. 입금 관련 컴포넌트 (우선순위: 높음)
- **DepositManagement.tsx** - 메인 입금 관리 페이지 (5개 자산 아이콘)
- **deposit/DepositProgressCard.tsx** - 입금 진행 카드
- **deposit/DepositHistoryTable.tsx** - 입금 내역 테이블

### 2. 출금 관련 컴포넌트 (우선순위: 높음)
- **withdrawal/WithdrawalTableRow.tsx** - 출금 테이블 행
- **withdrawal/CreateWithdrawalModal.tsx** - 출금 생성 모달
- **withdrawal/CreateGroupWithdrawalModal.tsx** - 그룹 출금 생성 모달
- **withdrawal/RejectedTableRow.tsx** - 거절된 출금 테이블 행
- **withdrawal/ProcessingTableRow.tsx** - 처리 중 출금 테이블 행

### 3. 기타 컴포넌트 (우선순위: 중간)
- **AssetOverview.tsx** - 자산 개요 (차트 및 통계)
- **AdditionalServices.tsx** - 추가 서비스
- **groups/RejectedManagementTab.tsx** - 그룹 거절 관리 탭

## 🚀 단계별 실행 계획

### Phase 1: 핵심 컴포넌트 마이그레이션 (1-2일)
**대상**: 입금/출금 관련 주요 컴포넌트

#### 1.1 DepositManagement.tsx 개선
- 하드코딩된 아이콘 URL 제거 (5개 자산: BTC, ETH, SOL, USDT, USDC)
- CryptoIcon 컴포넌트 적용
- 동적 자산 추가 로직에서도 CryptoIcon 사용

#### 1.2 출금 관련 컴포넌트 일괄 수정
- WithdrawalTableRow.tsx
- CreateWithdrawalModal.tsx
- CreateGroupWithdrawalModal.tsx
- RejectedTableRow.tsx
- ProcessingTableRow.tsx

**예상 작업량**: 각 파일당 30-60분

### Phase 2: 기타 컴포넌트 마이그레이션 (1일)
**대상**: AssetOverview, AdditionalServices, 그룹 관리

#### 2.1 AssetOverview.tsx
- 자산 목록 표시 부분에 CryptoIcon 적용
- 차트 범례에 아이콘 추가 고려

#### 2.2 나머지 컴포넌트들
- AdditionalServices.tsx
- groups/RejectedManagementTab.tsx

### Phase 3: 검증 및 최적화 (0.5일)
- 전체 앱 테스트
- 성능 측정 및 비교
- 에러 처리 검증
- 문서화 업데이트

## 🛠 기술적 구현 방안

### CryptoIcon 컴포넌트 확장
현재 구현된 CryptoIcon.tsx를 기반으로 다음 기능 추가:

```typescript
interface CryptoIconProps {
  symbol: string
  size?: number
  className?: string
  showFallback?: boolean  // fallback 표시 여부
  priority?: 'high' | 'low'  // 이미지 로딩 우선순위
}
```

### 지원 자산 목록
현재 확인된 아이콘 파일:
- BTC (bitcoin.png)
- ETH (eth.png)
- USDC (usdc.png)
- SOL (sol.png)
- USDT (usdt.png)

### Fallback 처리 개선
- KRW 등 지원되지 않는 자산에 대한 텍스트 기반 fallback
- 로딩 실패 시 기본 아이콘 제공
- 에러 로깅 및 모니터링

## 📊 마이그레이션 체크리스트

### 파일별 작업 상태
- [x] **TransactionHistory.tsx** - ✅ 완료
- [ ] **DepositManagement.tsx** - 🔄 대기
- [ ] **deposit/DepositProgressCard.tsx** - 🔄 대기
- [ ] **deposit/DepositHistoryTable.tsx** - 🔄 대기
- [ ] **withdrawal/WithdrawalTableRow.tsx** - 🔄 대기
- [ ] **withdrawal/CreateWithdrawalModal.tsx** - 🔄 대기
- [ ] **withdrawal/CreateGroupWithdrawalModal.tsx** - 🔄 대기
- [ ] **withdrawal/RejectedTableRow.tsx** - 🔄 대기
- [ ] **withdrawal/ProcessingTableRow.tsx** - 🔄 대기
- [ ] **AssetOverview.tsx** - 🔄 대기
- [ ] **AdditionalServices.tsx** - 🔄 대기
- [ ] **groups/RejectedManagementTab.tsx** - 🔄 대기

### 검증 항목
- [ ] 모든 아이콘이 정상 로딩되는지 확인
- [ ] Fallback 동작 검증
- [ ] 반응형 디자인에서 아이콘 크기 적절성 확인
- [ ] 접근성(alt 텍스트) 확인
- [ ] 성능 측정 (로딩 시간 비교)
- [ ] 에러 처리 동작 확인

## 🚨 위험 요소 및 대응 방안

### 잠재적 위험
1. **새로운 자산 추가 시**: cryptocurrency-icons 패키지에 없는 자산
2. **디자인 일관성**: 기존 아이콘과 새 아이콘의 스타일 차이
3. **성능 영향**: 초기 번들 크기 증가

### 대응 방안
1. **확장성 확보**: CryptoIcon에 custom 아이콘 지원 기능 추가
2. **점진적 적용**: 단계별 적용으로 문제 발생 시 롤백 가능
3. **모니터링**: 성능 지표 모니터링 및 최적화

## 📈 기대 효과

### 정량적 효과
- **로딩 시간**: 외부 요청 제거로 아이콘 로딩 속도 50% 이상 개선
- **안정성**: 네트워크 장애 시에도 100% 아이콘 표시 보장
- **번들 크기**: 필요한 아이콘만 포함하여 최적화

### 정성적 효과
- **개발 효율성**: 통일된 컴포넌트로 유지보수 용이성 향상
- **사용자 경험**: 일관된 아이콘 표시로 UX 개선
- **확장성**: 새로운 가상자산 추가 시 작업량 최소화

## 🔄 마이그레이션 후 운영 방안

### 신규 자산 추가 프로세스
1. cryptocurrency-icons 패키지에서 아이콘 확인
2. 없는 경우 custom 아이콘 추가 가이드라인 적용
3. CryptoIcon 컴포넌트 테스트 후 배포

### 유지보수 가이드라인
- CryptoIcon 컴포넌트는 모든 가상자산 아이콘의 단일 진입점
- 새로운 컴포넌트 개발 시 반드시 CryptoIcon 사용
- 직접적인 img 태그 사용 금지

---

**작성일**: 2025-09-22
**작성자**: Claude Code
**검토 필요**: Phase 1 완료 후 중간 검토 예정