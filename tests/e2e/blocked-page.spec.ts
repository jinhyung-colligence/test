import { test, expect } from '@playwright/test';

test.describe('/login/blocked 페이지 검증', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 브라우저 콘솔 로그 캡처
    page.on('console', msg => console.log(`Browser: ${msg.text()}`));
  });

  test('1. 직접 URL 접근 테스트 (파라미터 없음)', async ({ page }) => {
    console.log('테스트 1: 파라미터 없이 /login/blocked 접근');

    await page.goto('http://localhost:3000/login/blocked');

    // 로그인 페이지로 리다이렉트되는지 확인
    await expect(page).toHaveURL('http://localhost:3000/login');

    console.log('✓ 파라미터 없이 접근 시 로그인 페이지로 리다이렉트됨');
  });

  test('2. 유효하지 않은 파라미터로 접근 테스트', async ({ page }) => {
    console.log('테스트 2: 유효하지 않은 파라미터로 접근');

    // 잘못된 until 값 (과거 시간)
    const pastTime = Date.now() - 60000; // 1분 전
    await page.goto(`http://localhost:3000/login/blocked?until=${pastTime}&reason=test`);

    // 로그인 페이지로 리다이렉트되는지 확인
    await expect(page).toHaveURL('http://localhost:3000/login');

    console.log('✓ 과거 시간으로 접근 시 로그인 페이지로 리다이렉트됨');

    // 너무 긴 차단 시간 (1시간 이상)
    const tooLongTime = Date.now() + (2 * 60 * 60 * 1000); // 2시간 후
    await page.goto(`http://localhost:3000/login/blocked?until=${tooLongTime}&reason=test`);

    await expect(page).toHaveURL('http://localhost:3000/login');

    console.log('✓ 너무 긴 차단 시간으로 접근 시 로그인 페이지로 리다이렉트됨');

    // NaN 값
    await page.goto('http://localhost:3000/login/blocked?until=invalid&reason=test');

    await expect(page).toHaveURL('http://localhost:3000/login');

    console.log('✓ 잘못된 형식의 until 값으로 접근 시 로그인 페이지로 리다이렉트됨');
  });

  test('3. 유효한 파라미터로 접근 테스트', async ({ page }) => {
    console.log('테스트 3: 유효한 파라미터로 접근');

    // 현재 시간으로부터 5분 후 차단 해제
    const futureTime = Date.now() + (5 * 60 * 1000);
    const reason = 'login_failure';

    await page.goto(`http://localhost:3000/login/blocked?until=${futureTime}&reason=${reason}`);

    // URL이 변경되지 않고 blocked 페이지에 머물러 있는지 확인
    await expect(page).toHaveURL(`http://localhost:3000/login/blocked?until=${futureTime}&reason=${reason}`);

    console.log('✓ 유효한 파라미터로 접근 시 blocked 페이지가 정상 로드됨');
  });

  test('4. 페이지 UI 요소 검증', async ({ page }) => {
    console.log('테스트 4: 페이지 UI 요소 검증');

    const futureTime = Date.now() + (3 * 60 * 1000); // 3분 후
    const reason = 'login_failure';

    await page.goto(`http://localhost:3000/login/blocked?until=${futureTime}&reason=${reason}`);

    // 페이지 제목 확인
    await expect(page.locator('h1')).toContainText('로그인 차단');
    console.log('✓ 페이지 제목이 정상 표시됨');

    // 차단 상태 제목 확인
    await expect(page.locator('h2')).toContainText('접근이 일시적으로 제한됨');
    console.log('✓ 차단 상태 제목이 정상 표시됨');

    // 경고 아이콘 확인
    await expect(page.locator('svg')).toBeVisible();
    console.log('✓ 경고 아이콘이 정상 표시됨');

    // 카운트다운 타이머 영역 확인
    const timerElement = page.locator('.font-mono.font-bold');
    await expect(timerElement).toBeVisible();
    console.log('✓ 카운트다운 타이머 영역이 정상 표시됨');

    // 타이머 형식 확인 (MM:SS)
    const timerText = await timerElement.textContent();
    expect(timerText).toMatch(/^\d+:\d{2}$/);
    console.log(`✓ 타이머 형식이 올바름: ${timerText}`);

    // 안내 정보 확인
    await expect(page.locator('text=이런 경우에 차단됩니다:')).toBeVisible();
    await expect(page.locator('text=차단을 방지하려면:')).toBeVisible();
    console.log('✓ 안내 정보가 정상 표시됨');

    // 버튼들 확인
    await expect(page.locator('button', { hasText: '관리자에게 문의' })).toBeVisible();
    await expect(page.locator('button', { hasText: '로그인 페이지로 돌아가기' })).toBeVisible();
    console.log('✓ 액션 버튼들이 정상 표시됨');
  });

  test('5. 카운트다운 타이머 동작 검증', async ({ page }) => {
    console.log('테스트 5: 카운트다운 타이머 동작 검증');

    const futureTime = Date.now() + (10 * 1000); // 10초 후

    await page.goto(`http://localhost:3000/login/blocked?until=${futureTime}`);

    const timerElement = page.locator('.font-mono.font-bold');

    // 초기 시간 확인
    const initialTime = await timerElement.textContent();
    console.log(`초기 타이머 값: ${initialTime}`);

    // 2초 대기 후 시간이 줄어들었는지 확인
    await page.waitForTimeout(2000);

    const updatedTime = await timerElement.textContent();
    console.log(`2초 후 타이머 값: ${updatedTime}`);

    // 시간이 줄어들었는지 확인 (정확한 계산보다는 변화 확인)
    expect(initialTime).not.toBe(updatedTime);
    console.log('✓ 타이머가 실시간으로 업데이트됨');
  });

  test('6. 로그인 페이지 돌아가기 버튼 기능 검증', async ({ page }) => {
    console.log('테스트 6: 로그인 페이지 돌아가기 버튼 기능 검증');

    const futureTime = Date.now() + (5 * 60 * 1000); // 5분 후

    await page.goto(`http://localhost:3000/login/blocked?until=${futureTime}`);

    // 로그인 페이지로 돌아가기 버튼 클릭
    await page.click('button:has-text("로그인 페이지로 돌아가기")');

    // 로그인 페이지로 이동했는지 확인
    await expect(page).toHaveURL('http://localhost:3000/login');

    console.log('✓ 로그인 페이지로 돌아가기 버튼이 정상 작동함');
  });

  test('7. 관리자 문의 버튼 기능 검증', async ({ page }) => {
    console.log('테스트 7: 관리자 문의 버튼 기능 검증');

    const futureTime = Date.now() + (5 * 60 * 1000); // 5분 후

    await page.goto(`http://localhost:3000/login/blocked?until=${futureTime}`);

    // alert 이벤트 핸들러 설정
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    // 관리자 문의 버튼 클릭
    await page.click('button:has-text("관리자에게 문의")');

    // alert가 표시되었는지 확인
    expect(alertMessage).toContain('support@company.com');
    console.log(`✓ 관리자 문의 기능이 정상 작동함: ${alertMessage}`);
  });

  test('8. 차단 시간 만료 후 자동 리다이렉트 검증', async ({ page }) => {
    console.log('테스트 8: 차단 시간 만료 후 자동 리다이렉트 검증');

    // 3초 후 만료되도록 설정
    const futureTime = Date.now() + 3000;

    await page.goto(`http://localhost:3000/login/blocked?until=${futureTime}`);

    console.log('차단 시간 만료를 기다리는 중...');

    // 5초 대기 (차단 시간 만료 + 여유 시간)
    await page.waitForTimeout(5000);

    // 로그인 페이지로 자동 리다이렉트되었는지 확인
    await expect(page).toHaveURL('http://localhost:3000/login');

    console.log('✓ 차단 시간 만료 후 자동으로 로그인 페이지로 리다이렉트됨');
  });

  test('9. 반응형 디자인 검증', async ({ page }) => {
    console.log('테스트 9: 반응형 디자인 검증');

    const futureTime = Date.now() + (5 * 60 * 1000);

    // 모바일 뷰포트 테스트
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`http://localhost:3000/login/blocked?until=${futureTime}`);

    // 모든 주요 요소가 보이는지 확인
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.font-mono.font-bold')).toBeVisible();
    await expect(page.locator('button', { hasText: '관리자에게 문의' })).toBeVisible();

    console.log('✓ 모바일 뷰포트에서 정상 렌더링됨');

    // 데스크톱 뷰포트 테스트
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.font-mono.font-bold')).toBeVisible();

    console.log('✓ 데스크톱 뷰포트에서 정상 렌더링됨');
  });
});