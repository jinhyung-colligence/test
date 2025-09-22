import { test, expect } from '@playwright/test';

test.describe('수동 차단 페이지 테스트', () => {
  test('차단 페이지 수동 접근 및 검증', async ({ page }) => {
    console.log('=== 수동 차단 페이지 접근 테스트 ===');

    // 현재 시간에서 10분 후로 차단 시간 설정 (충분한 시간)
    const blockedUntil = Date.now() + (10 * 60 * 1000); // 10분 후
    const reason = encodeURIComponent('5번의 로그인 시도가 실패했습니다');

    const blockedUrl = `http://localhost:3000/login/blocked?until=${blockedUntil}&reason=${reason}`;
    console.log('접근할 차단 페이지 URL:', blockedUrl);
    console.log('현재 시간:', new Date().toISOString());
    console.log('차단 해제 시간:', new Date(blockedUntil).toISOString());

    // 콘솔 로그 수집
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    await page.goto(blockedUrl);

    // 페이지 로딩 대기
    await page.waitForTimeout(5000);

    console.log('페이지 로딩 후 현재 URL:', page.url());

    // 브라우저 콘솔 로그 출력
    console.log('\n=== 브라우저 콘솔 로그 ===');
    consoleLogs.forEach(log => console.log(log));

    // 현재 페이지가 차단 페이지인지 확인
    if (page.url().includes('/login/blocked')) {
      console.log('✓ 차단 페이지에 성공적으로 접근함');

      // 페이지 요소들 확인
      const title = page.locator('h1:has-text("로그인 차단")');
      if (await title.isVisible()) {
        console.log('✓ 차단 페이지 제목 확인됨');
      } else {
        console.log('✗ 차단 페이지 제목을 찾을 수 없음');
      }

      const restrictionMsg = page.locator('h2:has-text("접근이 일시적으로 제한됨")');
      if (await restrictionMsg.isVisible()) {
        console.log('✓ 제한 메시지 확인됨');
      } else {
        console.log('✗ 제한 메시지를 찾을 수 없음');
      }

      // 카운트다운 확인
      const countdown = page.locator('.text-4xl.font-mono.font-bold');
      if (await countdown.isVisible()) {
        const countdownText = await countdown.textContent();
        console.log('✓ 카운트다운 표시:', countdownText);
      } else {
        console.log('✗ 카운트다운을 찾을 수 없음');
      }
    } else {
      console.log('✗ 차단 페이지로 리다이렉트되지 않음');
      console.log('현재 URL:', page.url());
    }
  });
});