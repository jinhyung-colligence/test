# 사용자 권한 시스템과 메뉴 접근 권한 분석 보고서

## 목차
1. [현재 시스템 분석](#현재-시스템-분석)
2. [역할별 메뉴 접근 현황](#역할별-메뉴-접근-현황)
3. [발견된 문제점](#발견된-문제점)
4. [개선 방안](#개선-방안)
5. [구현 계획](#구현-계획)

## 현재 시스템 분석

### 시스템 구조의 불일치

현재 시스템은 두 가지 독립적인 접근 제어 체계가 혼재되어 있습니다:

| 구분 | 메뉴 접근 제어 | 사용자 권한 관리 |
|------|---------------|----------------|
| **기준** | 플랜 (Plan) | 역할 (Role) |
| **종류** | Basic, Premium, Enterprise | Admin, Manager, Operator, Viewer |
| **관리 방식** | Sidebar 컴포넌트에서 플랜별 필터링 | 권한 시스템에서 역할별 권한 할당 |
| **문제점** | 서로 연결되지 않은 독립 시스템 | 메뉴 접근과 실제 기능 권한 불일치 |

### 현재 권한 체계

#### 4개 역할 정의
1. **Admin (관리자)**: 모든 권한 (`permission.all`)
2. **Manager (매니저)**: 정책 설정, 사용자 관리
3. **Operator (운영자)**: 일반 거래 처리
4. **Viewer (조회자)**: 데이터 조회만

#### 14개 세부 권한
- 자산 관리: 3개 권한
- 사용자 관리: 4개 권한
- 정책 관리: 3개 권한
- 시스템 관리: 4개 권한

## 역할별 메뉴 접근 현황

### Admin (관리자)
| 메뉴 | 접근 가능 | 실행 가능 기능 |
|------|---------|--------------|
| 개요 | ✅ | 모든 기능 |
| 거래 내역 | ✅ | 모든 기능 |
| 사용자 관리 | ✅ | 모든 기능 |
| 그룹 관리 | ✅ | 모든 기능 |
| 입금 관리 | ✅ | 모든 기능 |
| 출금 관리 | ✅ | 모든 기능 |
| 서비스 | ✅ | 모든 기능 |
| 보안 설정 | ✅ | 모든 기능 |

### Manager (매니저)
| 메뉴 | 접근 가능 | 제한 사항 |
|------|---------|----------|
| 개요 | ✅ | 전체 기능 사용 가능 |
| 거래 내역 | ✅ | 전체 기능 사용 가능 |
| 사용자 관리 | ✅ | 전체 기능 사용 가능 |
| 그룹 관리 | ❌ | **권한 부족** - 그룹 예산 관리 권한 없음 |
| 입금 관리 | ❌ | **권한 부족** - 승인 권한 없음 |
| 출금 관리 | ❌ | **권한 부족** - 승인 권한 없음 |
| 서비스 | ⚠️ | 일부만 가능 |
| 보안 설정 | ⚠️ | 정책 생성/수정 불가 |

### Operator (운영자)
| 메뉴 | 접근 가능 | 제한 사항 |
|------|---------|----------|
| 개요 | ✅ | 조회 및 기본 기능 |
| 거래 내역 | ✅ | 조회 및 거래 생성 |
| 사용자 관리 | ❌ | **권한 없음** |
| 그룹 관리 | ❌ | **권한 없음** |
| 입금 관리 | ⚠️ | 거래 생성만 가능, 승인 불가 |
| 출금 관리 | ⚠️ | 거래 생성만 가능, 승인 불가 |
| 서비스 | ⚠️ | 거래 관련 서비스만 |
| 보안 설정 | ❌ | 감사 로그 조회만 가능 |

### Viewer (조회자)
| 메뉴 | 접근 가능 | 제한 사항 |
|------|---------|----------|
| 개요 | ✅ | 조회만 가능 |
| 거래 내역 | ✅ | 조회만 가능 |
| 사용자 관리 | ❌ | **권한 없음** |
| 그룹 관리 | ❌ | **권한 없음** |
| 입금 관리 | ❌ | **권한 없음** |
| 출금 관리 | ❌ | **권한 없음** |
| 서비스 | ❌ | **권한 없음** |
| 보안 설정 | ❌ | 감사 로그 조회만 가능 |

## 발견된 문제점

### 1. 구조적 문제
- **이중 관리 체계**: 플랜과 역할이 독립적으로 운영
- **일관성 부족**: 메뉴 접근과 기능 권한이 불일치
- **관리 복잡성**: 두 시스템을 별도로 관리해야 함

### 2. 누락된 핵심 권한

#### 거래 관련
- `permission.assets.approve_transactions` - 거래 승인
- `permission.deposit.manage` - 입금 관리
- `permission.withdrawal.approve` - 출금 승인
- `permission.withdrawal.airgap` - 에어갭 시스템 접근

#### 그룹 관리 (완전 누락)
- `permission.groups.view` - 그룹 조회
- `permission.groups.manage` - 그룹 생성/수정
- `permission.groups.manage_budget` - 예산 관리
- `permission.groups.approve_requests` - 요청 승인

#### 서비스 관리 (완전 누락)
- `permission.services.staking` - 스테이킹
- `permission.services.lending` - 대출
- `permission.services.swap` - 스왑
- `permission.services.krw` - 원화 연동

#### 주소 관리 (세분화 필요)
- `permission.addresses.manage_personal` - 개인 주소
- `permission.addresses.manage_vasp` - VASP 주소

### 3. 권한 공백 영역
- 출금 승인 프로세스 권한 체계
- 에어갭 시스템 접근 권한
- 그룹별 예산 관리 권한
- VASP 주소 관리 권한

## 개선 방안

### 1. 통합된 권한 기반 시스템

플랜 기반 메뉴 제어를 권한 기반으로 전환:

```typescript
// 현재 (플랜 기반)
if (currentPlan === 'Enterprise') {
  showMenu('groups');
}

// 개선 (권한 기반)
if (hasPermission(user, 'permission.groups.view')) {
  showMenu('groups');
}
```

### 2. 확장된 권한 정의

총 29개 권한으로 확장 (기존 14개 → 29개):

#### 자산 관리 (6개)
- `permission.assets.view` - 자산 조회
- `permission.assets.view_transactions` - 거래 내역 조회
- `permission.assets.create_transactions` - 거래 신청
- `permission.assets.approve_transactions` - **[신규]** 거래 승인
- `permission.deposit.manage` - **[신규]** 입금 관리
- `permission.withdrawal.approve` - **[신규]** 출금 승인

#### 사용자 관리 (4개) - 변경 없음
- `permission.users.view`
- `permission.users.create`
- `permission.users.edit`
- `permission.users.manage_permissions`

#### 그룹 관리 (4개) - **[신규 카테고리]**
- `permission.groups.view` - 그룹 조회
- `permission.groups.manage` - 그룹 생성/수정
- `permission.groups.manage_budget` - 예산 관리
- `permission.groups.approve_requests` - 요청 승인

#### 정책 관리 (3개) - 변경 없음
- `permission.policies.view`
- `permission.policies.create`
- `permission.policies.edit`

#### 서비스 관리 (4개) - **[신규 카테고리]**
- `permission.services.staking` - 스테이킹
- `permission.services.lending` - 대출
- `permission.services.swap` - 스왑
- `permission.services.krw` - 원화 연동

#### 시스템 관리 (6개)
- `permission.system.view_audit` - 감사 로그
- `permission.system.notifications` - 알림 설정
- `permission.system.security_settings` - 보안 설정
- `permission.system.admin` - 시스템 관리
- `permission.withdrawal.airgap` - **[신규]** 에어갭 접근
- `permission.addresses.manage_vasp` - **[신규]** VASP 주소 관리

#### 주소 관리 (2개) - **[신규 카테고리]**
- `permission.addresses.manage_personal` - 개인 주소
- `permission.addresses.manage_vasp` - VASP 주소

### 3. 개선된 역할별 권한 매핑

#### Admin (관리자) - 변경 없음
```typescript
permissions: ['permission.all']
```

#### Manager (매니저) - 확장
```typescript
permissions: [
  // 기존 권한
  'permission.assets.view',
  'permission.assets.view_transactions',
  'permission.assets.create_transactions',
  'permission.users.view',
  'permission.users.create',
  'permission.users.edit',
  'permission.users.manage_permissions',
  'permission.policies.view',
  'permission.system.view_audit',

  // 추가 권한
  'permission.assets.approve_transactions',  // 거래 승인
  'permission.deposit.manage',               // 입금 관리
  'permission.groups.view',                  // 그룹 조회
  'permission.groups.manage',                // 그룹 관리
  'permission.groups.manage_budget',         // 예산 관리
  'permission.policies.create',              // 정책 생성
  'permission.policies.edit',                // 정책 수정
  'permission.services.staking',             // 스테이킹
  'permission.services.lending',             // 대출
  'permission.services.swap',                // 스왑
  'permission.services.krw'                  // 원화 연동
]
```

#### Operator (운영자) - 확장
```typescript
permissions: [
  // 기존 권한
  'permission.assets.view',
  'permission.assets.view_transactions',
  'permission.assets.create_transactions',
  'permission.system.view_audit',

  // 추가 권한
  'permission.deposit.manage',               // 입금 관리
  'permission.services.staking',             // 스테이킹
  'permission.services.swap',                // 스왑
  'permission.addresses.manage_personal'     // 개인 주소 관리
]
```

#### Viewer (조회자) - 유지
```typescript
permissions: [
  'permission.assets.view',
  'permission.assets.view_transactions',
  'permission.system.view_audit'
]
```

### 4. 메뉴별 필요 권한 매핑

| 메뉴 경로 | 필요 권한 | 설명 |
|-----------|----------|------|
| `/overview` | 없음 (로그인 필수) | 모든 로그인 사용자 |
| `/transactions` | `permission.assets.view_transactions` | 거래 내역 조회 |
| `/users` | `permission.users.view` | 사용자 목록 조회 |
| `/groups` | `permission.groups.view` | 그룹 목록 조회 |
| `/groups/budget` | `permission.groups.manage_budget` | 예산 관리 |
| `/groups/approval` | `permission.groups.approve_requests` | 요청 승인 |
| `/deposit` | `permission.deposit.manage` | 입금 관리 |
| `/withdrawal` | `permission.assets.create_transactions` | 출금 요청 |
| `/withdrawal/approval` | `permission.withdrawal.approve` | 출금 승인 |
| `/withdrawal/airgap` | `permission.withdrawal.airgap` | 에어갭 시스템 |
| `/services/staking` | `permission.services.staking` | 스테이킹 서비스 |
| `/services/lending` | `permission.services.lending` | 대출 서비스 |
| `/services/swap` | `permission.services.swap` | 스왑 서비스 |
| `/services/krw` | `permission.services.krw` | 원화 연동 |
| `/security/policies` | `permission.policies.view` | 정책 조회 |
| `/security/policies/[create]` | `permission.policies.create` | 정책 생성 |
| `/security/addresses/personal` | `permission.addresses.manage_personal` | 개인 주소 |
| `/security/addresses/vasp` | `permission.addresses.manage_vasp` | VASP 주소 |

## 구현 계획

### Phase 1: 권한 시스템 확장 (우선순위: 높음)

#### 1-1. 권한 상수 정의 (`src/types/permission.ts`)
```typescript
// 새로운 권한 카테고리 추가
export const PERMISSION_CATEGORIES = {
  assets: { ... },
  users: { ... },
  groups: { // 신규
    name: '그룹 관리',
    icon: UserGroupIcon
  },
  policies: { ... },
  services: { // 신규
    name: '서비스',
    icon: CogIcon
  },
  system: { ... },
  addresses: { // 신규
    name: '주소 관리',
    icon: MapPinIcon
  }
};

// 새로운 권한 상세 정의 추가
export const PERMISSION_DETAILS = {
  // ... 기존 권한들

  // 그룹 관리 권한
  'permission.groups.view': {
    category: 'groups',
    name: '그룹 조회',
    description: '그룹 목록 및 정보 조회'
  },
  // ... 나머지 신규 권한들
};
```

#### 1-2. 역할별 기본 권한 업데이트 (`src/utils/permissionUtils.ts`)
```typescript
export const DEFAULT_PERMISSIONS_BY_ROLE = {
  admin: ['permission.all'],
  manager: [
    // 기존 권한 + 신규 권한
  ],
  operator: [
    // 기존 권한 + 신규 권한
  ],
  viewer: [
    // 기존 권한 유지
  ]
};
```

### Phase 2: 메뉴 접근 제어 전환 (우선순위: 높음)

#### 2-1. Sidebar 컴포넌트 수정 (`src/components/Sidebar.tsx`)
```typescript
// 현재 코드
const menuItems = [
  {
    name: '그룹 관리',
    href: '/groups',
    icon: UserGroupIcon,
    plan: 'Enterprise', // 플랜 기반
  }
];

// 개선 코드
const menuItems = [
  {
    name: '그룹 관리',
    href: '/groups',
    icon: UserGroupIcon,
    permission: 'permission.groups.view', // 권한 기반
  }
];

// 메뉴 필터링 로직
const visibleMenuItems = menuItems.filter(item => {
  if (item.permission) {
    return hasPermission(currentUser, item.permission);
  }
  return true; // 권한이 없으면 기본 표시
});
```

### Phase 3: 페이지별 권한 검증 (우선순위: 중간)

#### 3-1. 권한 체크 훅 생성 (`src/hooks/usePermissionCheck.ts`)
```typescript
export function usePermissionCheck(requiredPermission: string) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hasPermission(user, requiredPermission)) {
      router.push('/unauthorized');
    }
  }, [user, requiredPermission]);

  return hasPermission(user, requiredPermission);
}
```

#### 3-2. 각 페이지에 권한 체크 적용
```typescript
// 예: 그룹 관리 페이지
export default function GroupsPage() {
  const hasAccess = usePermissionCheck('permission.groups.view');

  if (!hasAccess) {
    return <UnauthorizedMessage />;
  }

  // 페이지 컨텐츠
}
```

### Phase 4: UI 컴포넌트 업데이트 (우선순위: 중간)

#### 4-1. UserPermissionEditor 컴포넌트 확장
- 새로운 권한 카테고리 표시
- 그룹별 권한 토글
- 권한 의존성 표시 (예: 승인 권한은 조회 권한 필요)

#### 4-2. 권한 미리보기 개선
- 메뉴 접근 가능 여부 시각화
- 실행 가능 기능 목록 표시

### Phase 5: 문서화 및 마이그레이션 (우선순위: 낮음)

#### 5-1. 문서 업데이트
- `claudedocs/user-permission-system.md` - 새 권한 추가
- `claudedocs/menu-permission-mapping.md` - 신규 생성
- `claudedocs/migration-guide.md` - 마이그레이션 가이드

#### 5-2. 데이터 마이그레이션
- 기존 사용자 권한 마이그레이션 스크립트
- 플랜 정보를 권한으로 변환

### Phase 6: 테스트 및 검증 (우선순위: 높음)

#### 6-1. 단위 테스트
- 권한 체크 함수 테스트
- 역할별 권한 매핑 테스트

#### 6-2. 통합 테스트
- 각 역할별 메뉴 접근 테스트
- 권한 변경 시 즉시 반영 테스트
- 페이지 권한 체크 테스트

## 예상 영향도 및 위험 요소

### 영향도
- **높음**: Sidebar, 권한 시스템 핵심 로직
- **중간**: 각 페이지 컴포넌트
- **낮음**: 문서, 테스트

### 위험 요소
1. **하위 호환성**: 기존 플랜 기반 로직 제거 시 영향
2. **권한 공백**: 마이그레이션 중 일시적 권한 불일치
3. **성능**: 권한 체크 증가로 인한 성능 영향

### 리스크 완화 방안
1. **점진적 마이그레이션**: 플랜과 권한 병행 운영 후 전환
2. **Feature Flag**: 새 권한 시스템 점진적 활성화
3. **권한 캐싱**: 자주 사용되는 권한 체크 결과 캐싱

## 검토 필요 사항

### 비즈니스 검토
- [ ] 역할별 권한 매핑이 비즈니스 요구사항과 일치하는지
- [ ] 새로운 권한 카테고리가 적절한지
- [ ] Manager와 Operator 역할 구분이 명확한지

### 기술 검토
- [ ] 권한 체크 성능 최적화 필요 여부
- [ ] 서버 사이드 권한 검증 구현 방안
- [ ] 권한 변경 이력 추적 시스템 필요 여부

### 보안 검토
- [ ] 권한 상승 공격 방지 대책
- [ ] 세션 관리 및 권한 캐싱 정책
- [ ] API 레벨 권한 검증 구현

## 다음 단계

1. **이 문서 검토 및 피드백**
2. **비즈니스 요구사항 확인**
3. **구현 우선순위 결정**
4. **Phase 1부터 순차적 구현**
5. **각 Phase별 테스트 및 검증**
6. **프로덕션 배포 계획 수립**