# Enterprise 가상자산 커스터디 시스템 - 권한 관리 체계

## 개요

Enterprise 환경에 최적화된 역할 기반 권한 관리 시스템입니다.
모든 메뉴는 Enterprise 환경에서 제공되며, 역할에 따라 접근 권한이 차등 부여됩니다.

## 시스템 구조

### 권한 관리 원칙

- **단일 플랜 집중**: Enterprise 플랜만 고려
- **역할 기반 접근 제어**: 4개 역할로 모든 권한 관리
- **기능별 세분화**: 메뉴 접근과 기능 실행 권한 분리
- **계층적 권한 구조**: 상위 역할은 하위 역할 권한 포함

## 역할 정의 및 책임

### 1. Admin (관리자)

- **책임**: 시스템 전체 관리 및 감독
- **주요 업무**: 시스템 설정, 보안 정책 수립, 전체 감사
- **권한 수준**: 최고 (Level 4)
- **특징**: 모든 메뉴와 기능에 무제한 접근

### 2. Manager (매니저)

- **책임**: 운영 정책 관리 및 주요 승인
- **주요 업무**: 사용자 관리, 거래 승인, 정책 설정, 예산 관리
- **권한 수준**: 높음 (Level 3)
- **특징**: 승인 권한 보유, 정책 수정 가능

### 3. Operator (운영자)

- **책임**: 일상 거래 처리 및 운영
- **주요 업무**: 거래 생성, 입출금 처리, 서비스 실행
- **권한 수준**: 중간 (Level 2)
- **특징**: 실행 권한 보유, 승인 권한 없음

### 4. Viewer (조회자)

- **책임**: 모니터링 및 보고
- **주요 업무**: 데이터 조회, 리포트 생성, 감사 지원
- **권한 수준**: 기본 (Level 1)
- **특징**: 읽기 전용, 실행 권한 없음

## Enterprise 메뉴별 권한 매트릭스

### 메뉴 접근 권한 (✅ 전체 접근 | ⚠️ 부분 접근 | ❌ 접근 불가)

| 메뉴            | Admin | Manager | Operator | Viewer | 설명                |
| --------------- | ----- | ------- | -------- | ------ | ------------------- |
| **개요**        | ✅    | ✅      | ✅       | ✅     | 대시보드, 전체 현황 |
| **거래 내역**   | ✅    | ✅      | ✅       | ✅     | 거래 이력 조회      |
| **사용자 관리** | ✅    | ✅      | ❌       | ❌     | 사용자 계정 관리    |
| **그룹 관리**   | ✅    | ✅      | ❌       | ❌     | 그룹 및 예산 설정   |
| **입금 관리**   | ✅    | ✅      | ✅       | ❌     | 입금 처리           |
| **출금 관리**   | ✅    | ✅      | ⚠️       | ⚠️     | 출금 승인 프로세스  |
| **서비스**      | ✅    | ✅      | ⚠️       | ❌     | 부가 서비스 관리    |
| **보안 설정**   | ✅    | ⚠️      | ❌       | ❌     | 보안 정책 설정      |

### 세부 기능별 권한

#### 1. 개요 (/overview)

| 기능             | Admin | Manager | Operator | Viewer |
| ---------------- | ----- | ------- | -------- | ------ |
| 대시보드 조회    | ✅    | ✅      | ✅       | ✅     |
| 통계 데이터 조회 | ✅    | ✅      | ✅       | ✅     |
| 실시간 모니터링  | ✅    | ✅      | ✅       | ✅     |

#### 2. 거래 내역 (/transactions)

| 기능               | Admin | Manager | Operator | Viewer |
| ------------------ | ----- | ------- | -------- | ------ |
| 거래 내역 조회     | ✅    | ✅      | ✅       | ✅     |
| 거래 상세 조회     | ✅    | ✅      | ✅       | ✅     |
| 거래 내역 내보내기 | ✅    | ✅      | ✅       | ✅     |
| 거래 취소/수정     | ✅    | ✅      | ❌       | ❌     |

#### 3. 사용자 관리 (/users)

| 기능             | Admin | Manager | Operator | Viewer |
| ---------------- | ----- | ------- | -------- | ------ |
| 사용자 목록 조회 | ✅    | ✅      | ❌       | ❌     |
| 사용자 추가      | ✅    | ✅      | ❌       | ❌     |
| 사용자 정보 수정 | ✅    | ✅      | ❌       | ❌     |
| 권한 설정        | ✅    | ✅      | ❌       | ❌     |
| 사용자 비활성화  | ✅    | ✅      | ❌       | ❌     |

#### 4. 그룹 관리 (/groups)

| 기능           | Admin | Manager | Operator | Viewer |
| -------------- | ----- | ------- | -------- | ------ |
| 그룹 목록 조회 | ✅    | ✅      | ❌       | ❌     |
| 그룹 생성/수정 | ✅    | ✅      | ❌       | ❌     |
| 예산 설정      | ✅    | ✅      | ❌       | ❌     |
| 그룹 요청 승인 | ✅    | ✅      | ❌       | ❌     |
| 거부 내역 관리 | ✅    | ✅      | ❌       | ❌     |

#### 5. 입금 관리 (/deposit)

| 기능           | Admin | Manager | Operator | Viewer |
| -------------- | ----- | ------- | -------- | ------ |
| 입금 요청 생성 | ✅    | ✅      | ✅       | ❌     |
| 입금 승인      | ✅    | ✅      | ❌       | ❌     |
| 입금 내역 조회 | ✅    | ✅      | ✅       | ❌     |
| 입금 주소 관리 | ✅    | ✅      | ✅       | ❌     |

#### 6. 출금 관리 (/withdrawal)

| 기능                  | Admin | Manager | Operator | Viewer |
| --------------------- | ----- | ------- | -------- | ------ |
| **승인 대기**         |       |         |          |        |
| - 출금 요청 조회      | ✅    | ✅      | ✅       | ❌     |
| - 출금 요청 생성      | ✅    | ✅      | ✅       | ❌     |
| - 출금 승인           | ✅    | ✅      | ❌       | ❌     |
| **출금 대기(에어갭)** |       |         |          |        |
| - 출금 대기 접근      | ✅    | ✅      | ❌       | ❌     |
| **거부 내역**         |       |         |          |        |
| - 거부 내역 조회      | ✅    | ✅      | ✅       | ❌     |
| **감사 로그**         |       |         |          |        |
| - 감사 로그 조회      | ✅    | ✅      | ✅       | ✅     |

#### 7. 서비스 (/services)

| 기능            | Admin | Manager | Operator | Viewer |
| --------------- | ----- | ------- | -------- | ------ |
| **스테이킹**    |       |         |          |        |
| - 스테이킹 설정 | ✅    | ✅      | ❌       | ❌     |
| - 스테이킹 실행 | ✅    | ✅      | ✅       | ❌     |
| - 스테이킹 조회 | ✅    | ✅      | ✅       | ❌     |
| **대출**        |       |         |          |        |
| - 대출 설정     | ✅    | ✅      | ❌       | ❌     |
| - 대출 실행     | ✅    | ✅      | ❌       | ❌     |
| **스왑**        |       |         |          |        |
| - 스왑 설정     | ✅    | ✅      | ❌       | ❌     |
| - 스왑 실행     | ✅    | ✅      | ✅       | ❌     |
| **원화 연동**   |       |         |          |        |
| - KRW 설정      | ✅    | ✅      | ❌       | ❌     |
| - KRW 거래      | ✅    | ✅      | ✅       | ❌     |

#### 8. 보안 설정 (/security)

| 기능             | Admin | Manager | Operator | Viewer |
| ---------------- | ----- | ------- | -------- | ------ |
| **기본 보안**    |       |         |          |        |
| - 보안 설정 조회 | ✅    | ✅      | ❌       | ❌     |
| - 보안 설정 변경 | ✅    | ❌      | ❌       | ❌     |
| **계정 관리**    |       |         |          |        |
| - 계정 보안 설정 | ✅    | ✅      | ❌       | ❌     |
| - 2FA 관리       | ✅    | ✅      | ❌       | ❌     |
| **정책 관리**    |       |         |          |        |
| - 정책 조회      | ✅    | ✅      | ❌       | ❌     |
| - 정책 생성      | ✅    | ✅      | ❌       | ❌     |
| - 정책 수정      | ✅    | ✅      | ❌       | ❌     |
| **알림 설정**    |       |         |          |        |
| - 알림 로그 조회 | ✅    | ✅      | ❌       | ❌     |
| - 템플릿 관리    | ✅    | ✅      | ❌       | ❌     |
| - 알림 설정      | ✅    | ✅      | ❌       | ❌     |
| **주소 관리**    |       |         |          |        |
| - 개인 주소 관리 | ✅    | ✅      | ✅       | ❌     |
| - VASP 주소 관리 | ✅    | ✅      | ❌       | ❌     |
| - 주소 이력 조회 | ✅    | ✅      | ✅       | ❌     |

## 필요 권한 정의

### 권한 카테고리 및 세부 권한

#### 1. 자산 관리 권한

```typescript
permission.assets.view; // 자산 조회
permission.assets.view_transactions; // 거래 내역 조회
permission.assets.create_transactions; // 거래 생성
permission.assets.approve_transactions; // 거래 승인
permission.assets.cancel_transactions; // 거래 취소
```

#### 2. 사용자 관리 권한

```typescript
permission.users.view; // 사용자 조회
permission.users.create; // 사용자 생성
permission.users.edit; // 사용자 수정
permission.users.manage_permissions; // 권한 관리
permission.users.deactivate; // 사용자 비활성화
```

#### 3. 그룹 관리 권한

```typescript
permission.groups.view; // 그룹 조회
permission.groups.manage; // 그룹 생성/수정
permission.groups.manage_budget; // 예산 관리
permission.groups.approve_requests; // 요청 승인
```

#### 4. 입출금 권한

```typescript
permission.deposit.manage; // 입금 관리
permission.withdrawal.create; // 출금 요청
permission.withdrawal.approve; // 출금 승인
permission.withdrawal.airgap; // 에어갭 접근
```

#### 5. 서비스 권한

```typescript
permission.services.staking.view; // 스테이킹 조회
permission.services.staking.manage; // 스테이킹 설정
permission.services.staking.execute; // 스테이킹 실행
permission.services.lending.manage; // 대출 관리
permission.services.swap.execute; // 스왑 실행
permission.services.krw.manage; // 원화 연동 관리
```

#### 6. 보안 권한

```typescript
permission.security.view; // 보안 설정 조회
permission.security.manage; // 보안 설정 관리
permission.policies.view; // 정책 조회
permission.policies.create; // 정책 생성
permission.policies.edit; // 정책 수정
permission.notifications.manage; // 알림 관리
permission.addresses.personal; // 개인 주소 관리
permission.addresses.vasp; // VASP 주소 관리
```

#### 7. 시스템 권한

```typescript
permission.system.view_audit; // 감사 로그 조회
permission.system.admin; // 시스템 관리
permission.system.settings; // 시스템 설정
```

## 역할별 권한 매핑

### Admin (관리자)

```typescript
permissions: ["permission.all"]; // 모든 권한
```

### Manager (매니저)

```typescript
permissions: [
  // 자산 관리
  "permission.assets.view",
  "permission.assets.view_transactions",
  "permission.assets.create_transactions",
  "permission.assets.approve_transactions",
  "permission.assets.cancel_transactions",

  // 사용자 관리
  "permission.users.view",
  "permission.users.create",
  "permission.users.edit",
  "permission.users.manage_permissions",
  "permission.users.deactivate",

  // 그룹 관리
  "permission.groups.view",
  "permission.groups.manage",
  "permission.groups.manage_budget",
  "permission.groups.approve_requests",

  // 입출금
  "permission.deposit.manage",
  "permission.withdrawal.create",
  "permission.withdrawal.approve",

  // 서비스
  "permission.services.staking.view",
  "permission.services.staking.manage",
  "permission.services.staking.execute",
  "permission.services.lending.manage",
  "permission.services.swap.execute",
  "permission.services.krw.manage",

  // 보안
  "permission.policies.view",
  "permission.policies.create",
  "permission.policies.edit",
  "permission.notifications.manage",
  "permission.addresses.personal",
  "permission.addresses.vasp",

  // 시스템
  "permission.system.view_audit",
];
```

### Operator (운영자)

```typescript
permissions: [
  // 자산 관리
  "permission.assets.view",
  "permission.assets.view_transactions",
  "permission.assets.create_transactions",

  // 입출금
  "permission.deposit.manage",
  "permission.withdrawal.create",

  // 서비스 (실행만)
  "permission.services.staking.view",
  "permission.services.staking.execute",
  "permission.services.swap.execute",
  "permission.services.krw.manage",

  // 주소 관리 (개인만)
  "permission.addresses.personal",

  // 시스템
  "permission.system.view_audit",
];
```

### Viewer (조회자)

```typescript
permissions: [
  // 자산 조회만
  "permission.assets.view",
  "permission.assets.view_transactions",

  // 시스템
  "permission.system.view_audit",
];
```

## 구현 가이드

### 1. 권한 체크 구현

```typescript
// 메뉴 접근 체크
function canAccessMenu(user: User, menuPath: string): boolean {
  const menuPermissions = {
    "/users": "permission.users.view",
    "/groups": "permission.groups.view",
    "/deposit": "permission.deposit.manage",
    // ...
  };

  return hasPermission(user, menuPermissions[menuPath]);
}

// 기능 실행 체크
function canExecuteAction(user: User, action: string): boolean {
  return hasPermission(user, action);
}
```

### 2. UI 컴포넌트 권한 적용

```typescript
// 조건부 렌더링
{
  hasPermission(user, "permission.withdrawal.approve") && (
    <Button onClick={handleApprove}>승인</Button>
  );
}

// 메뉴 필터링
const visibleMenus = menuItems.filter((menu) => canAccessMenu(user, menu.path));
```

### 3. API 레벨 권한 검증

```typescript
// API 미들웨어
async function checkPermission(req, res, next) {
  const requiredPermission = getRequiredPermission(req.path, req.method);

  if (!hasPermission(req.user, requiredPermission)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  next();
}
```

## 권한 에스컬레이션 경로

### 역할 승격 절차

1. **Viewer → Operator**: Manager 승인 필요
2. **Operator → Manager**: Admin 승인 필요
3. **Manager → Admin**: 시스템 소유자 승인 필요

### 임시 권한 부여

- **목적**: 긴급 상황 대응
- **승인자**: Manager 이상
- **유효 기간**: 최대 24시간
- **감사**: 모든 임시 권한 부여 로깅

## 보안 고려사항

### 권한 검증 원칙

1. **최소 권한 원칙**: 업무 수행에 필요한 최소한의 권한만 부여
2. **권한 분리**: 중요 작업은 복수 역할 승인 필요
3. **정기 검토**: 분기별 권한 적절성 검토
4. **감사 추적**: 모든 권한 변경 이력 기록

### 주요 통제 포인트

- **출금 승인**: Operator 요청 → Manager 승인
- **정책 변경**: Manager 작성 → Admin 최종 승인
- **에어갭 접근**: Admin만 가능, 모든 활동 로깅
- **사용자 권한 변경**: Manager 이상, 변경 사유 필수

## 모니터링 및 감사

### 권한 사용 모니터링

- 비정상적인 권한 사용 패턴 감지
- 권한 상승 시도 추적
- 실패한 권한 체크 로깅

### 정기 감사 항목

- [ ] 미사용 권한 보유자 확인
- [ ] 과도한 권한 보유자 식별
- [ ] 권한 변경 이력 검토
- [ ] 임시 권한 만료 확인

## 향후 고려사항

### 확장 가능한 영역

1. **동적 권한 관리**: 시간대별, 상황별 권한 조정
2. **워크플로우 기반 권한**: 프로세스 단계별 권한 부여
3. **AI 기반 이상 탐지**: 비정상 권한 사용 자동 감지
4. **제로 트러스트**: 모든 액션에 대한 실시간 권한 검증

### 개선 계획

- Phase 1: 현재 권한 체계 구현 및 안정화
- Phase 2: 세분화된 권한 추가
- Phase 3: 동적 권한 관리 시스템 도입
- Phase 4: AI 기반 보안 강화
