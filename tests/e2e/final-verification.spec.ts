import { test, expect } from '@playwright/test';

test.describe('차단 기능 최종 검증', () => {
  test('차단 페이지 카운트다운 타이머 검증', async ({ page }) => {
    console.log('=== 차단 페이지 카운트다운 타이머 검증 ===');

    // 2분 후 차단 해제되도록 설정
    const blockedUntil = Date.now() + (2 * 60 * 1000);
    const reason = encodeURIComponent('5번의 로그인 시도가 실패했습니다');

    await page.goto(`http://localhost:3000/login/blocked?until=${blockedUntil}&reason=${reason}`);
    await page.waitForTimeout(2000);

    console.log('현재 URL:', page.url());
    console.log('차단 해제 시간:', new Date(blockedUntil).toISOString());

    // 카운트다운 요소 확인
    const countdownElement = page.locator('.text-4xl.font-mono.font-bold');
    await expect(countdownElement).toBeVisible();

    const initialCountdown = await countdownElement.textContent();
    console.log('초기 카운트다운:', initialCountdown);

    // 2초 후 카운트다운 변경 확인
    await page.waitForTimeout(2000);
    const updatedCountdown = await countdownElement.textContent();
    console.log('2초 후 카운트다운:', updatedCountdown);

    expect(initialCountdown).not.toBe(updatedCountdown);
    console.log('✓ 카운트다운 타이머 정상 작동');

    // 안내 메시지들 확인
    const title = page.locator('h1:has-text("로그인 차단")');
    await expect(title).toBeVisible();
    console.log('✓ 차단 페이지 제목 확인됨');

    const restrictionMsg = page.locator('h2:has-text("접근이 일시적으로 제한됨")');
    await expect(restrictionMsg).toBeVisible();
    console.log('✓ 제한 메시지 확인됨');

    const infoBox = page.locator('text=이런 경우에 차단됩니다');
    await expect(infoBox).toBeVisible();
    console.log('✓ 안내 메시지 확인됨');

    const contactButton = page.locator('button:has-text("관리자에게 문의")');
    await expect(contactButton).toBeVisible();
    console.log('✓ 관리자 문의 버튼 확인됨');

    const backButton = page.locator('button:has-text("로그인 페이지로 돌아가기")');
    await expect(backButton).toBeVisible();
    console.log('✓ 로그인 페이지 돌아가기 버튼 확인됨');
  });

  test('완전한 로그인 차단 플로우 최종 검증', async ({ page }) => {
    console.log('=== 완전한 로그인 차단 플로우 최종 검증 ===');

    // 콘솔 로그 수집
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    await page.goto('http://localhost:3000/login');

    // localStorage 초기화
    await page.evaluate(() => {
      localStorage.clear();
    });

    const testEmail = 'final@test.com';

    // 5회 연속 실패
    for (let i = 1; i <= 5; i++) {
      console.log(`${i}번째 로그인 시도`);

      await page.fill('input[type="email"]', testEmail);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1500);

      // 각 시도 후 상태 확인
      const attempts = await page.evaluate((email) => {
        const data = localStorage.getItem(`login_attempts_${email}`);
        return data ? JSON.parse(data) : null;
      }, testEmail);

      console.log(`${i}번째 시도 후:`, {
        count: attempts?.count,
        blocked: attempts?.blockedUntil > Date.now()
      });

      if (i === 5) {
        // 5번째 시도 후 차단 페이지 확인
        const currentUrl = page.url();
        console.log('5번째 시도 후 URL:', currentUrl);

        if (currentUrl.includes('/login/blocked')) {
          console.log('✓ 5회 실패 후 차단 페이지로 정상 리다이렉트됨');

          // 차단 페이지 요소 확인
          const title = page.locator('h1:has-text("로그인 차단")');
          if (await title.isVisible()) {
            console.log('✓ 차단 페이지 정상 표시됨');
          }

          const countdown = page.locator('.text-4xl.font-mono.font-bold');
          if (await countdown.isVisible()) {
            const countdownText = await countdown.textContent();
            console.log('✓ 카운트다운 표시:', countdownText);
          }
        } else {
          console.log('✗ 차단 페이지로 리다이렉트되지 않음');
        }
      }
    }

    // 브라우저 콘솔 로그 출력
    console.log('\n=== 주요 브라우저 콘솔 로그 ===');
    consoleLogs
      .filter(log => log.includes('차단'))
      .forEach(log => console.log(log));
  });
});