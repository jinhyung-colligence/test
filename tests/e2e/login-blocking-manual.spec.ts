import { test, expect } from '@playwright/test';

test.describe('로그인 차단 기능 수동 검증', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 localStorage 초기화
    await page.goto('http://localhost:3000/login');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('차단 기능 작동 확인 - 올바른 localStorage 키 사용', async ({ page }) => {
    console.log('=== 차단 기능 작동 확인 ===');

    // 콘솔 로그 수집
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    await page.goto('http://localhost:3000/login');

    const testEmail = 'wrong@example.com';

    // 5회 연속 실패 시도
    for (let i = 1; i <= 5; i++) {
      console.log(`\n--- ${i}번째 로그인 실패 시도 ---`);

      // 이메일 입력
      await page.fill('input[type="email"]', testEmail);

      // 로그인 버튼 클릭
      await page.click('button[type="submit"]');

      // API 응답 대기
      await page.waitForTimeout(2000);

      // localStorage 상태 확인 (올바른 키 사용)
      const attempts = await page.evaluate((email) => {
        const data = localStorage.getItem(`login_attempts_${email}`);
        return data ? JSON.parse(data) : null;
      }, testEmail);

      console.log(`${i}번째 시도 후 localStorage:`, attempts);

      // 현재 URL 확인
      const currentUrl = page.url();
      console.log(`${i}번째 시도 후 URL:`, currentUrl);

      // 에러 메시지 확인
      const errorMessage = page.locator('.bg-red-50');
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        console.log(`${i}번째 시도 에러 메시지:`, errorText);
      }

      // 5번째 시도 후 차단 상태 확인
      if (i === 5) {
        console.log('5번째 시도 완료 - 차단 상태 확인 중...');

        // 잠시 대기 후 다시 확인
        await page.waitForTimeout(1000);

        const finalUrl = page.url();
        console.log('최종 URL:', finalUrl);

        // 차단 로직이 작동했는지 확인 (URL 파라미터 체크)
        if (finalUrl.includes('until=') && finalUrl.includes('reason=')) {
          console.log('✓ 차단 로직 작동: URL에 차단 정보 포함됨');
        } else {
          console.log('✗ 차단 로직 미작동: URL에 차단 정보 없음');
        }
      }
    }

    // 브라우저 콘솔 로그 출력
    console.log('\n=== 브라우저 콘솔 로그 ===');
    consoleLogs.forEach(log => console.log(log));
  });

  test('차단 페이지 직접 접근 테스트', async ({ page }) => {
    console.log('=== 차단 페이지 직접 접근 테스트 ===');

    // 차단 페이지로 직접 이동 (유효한 파라미터와 함께)
    const blockedUntil = Date.now() + (5 * 60 * 1000); // 5분 후
    const reason = encodeURIComponent('5번의 로그인 시도가 실패했습니다');

    const blockedUrl = `http://localhost:3000/login/blocked?until=${blockedUntil}&reason=${reason}`;
    console.log('차단 페이지 URL:', blockedUrl);

    await page.goto(blockedUrl);

    // 페이지 로딩 대기
    await page.waitForTimeout(3000);

    console.log('현재 페이지 URL:', page.url());

    // 차단 메시지 확인
    const pageTitle = page.locator('h1:has-text("로그인 차단")');
    await expect(pageTitle).toBeVisible();
    console.log('✓ 차단 페이지 제목 확인됨');

    // 제한 메시지 확인
    const restrictionMessage = page.locator('h2:has-text("접근이 일시적으로 제한됨")');
    await expect(restrictionMessage).toBeVisible();
    console.log('✓ 제한 메시지 확인됨');

    // 카운트다운 타이머 확인
    const countdownElement = page.locator('.text-4xl.font-mono.font-bold');
    if (await countdownElement.isVisible()) {
      const countdownText = await countdownElement.textContent();
      console.log('카운트다운 표시:', countdownText);

      // 1초 후 카운트다운이 변경되는지 확인
      await page.waitForTimeout(1100);
      const updatedCountdownText = await countdownElement.textContent();
      console.log('1초 후 카운트다운:', updatedCountdownText);

      if (countdownText !== updatedCountdownText) {
        console.log('✓ 카운트다운 타이머 정상 작동');
      } else {
        console.log('✗ 카운트다운 타이머 작동하지 않음');
      }
    } else {
      console.log('✗ 카운트다운 요소를 찾을 수 없음');
    }

    // 안내 메시지 확인
    const infoMessage = page.locator('text=이런 경우에 차단됩니다');
    if (await infoMessage.isVisible()) {
      console.log('✓ 안내 메시지 확인됨');
    } else {
      console.log('✗ 안내 메시지를 찾을 수 없음');
    }
  });

  test('차단 해제 후 로그인 재시도', async ({ page }) => {
    console.log('=== 차단 해제 후 로그인 재시도 ===');

    await page.goto('http://localhost:3000/login');

    const testEmail = 'wrong@example.com';

    // localStorage에 만료된 차단 정보 설정 (이미 해제된 상태)
    await page.evaluate((email) => {
      const expiredBlockData = {
        count: 5,
        lastAttempt: Date.now() - 10000, // 10초 전
        blockedUntil: Date.now() - 1000   // 1초 전에 해제됨
      };
      localStorage.setItem(`login_attempts_${email}`, JSON.stringify(expiredBlockData));
    }, testEmail);

    // 차단 해제 상태에서 로그인 시도
    await page.fill('input[type="email"]', testEmail);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // 결과 확인
    const currentUrl = page.url();
    console.log('차단 해제 후 로그인 시도 URL:', currentUrl);

    const errorMessage = page.locator('.bg-red-50');
    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent();
      console.log('에러 메시지:', errorText);

      if (errorText && errorText.includes('등록되지 않은 이메일')) {
        console.log('✓ 차단 해제 후 정상적인 로그인 시도 가능');
      } else {
        console.log('✗ 예상과 다른 에러 메시지');
      }
    }

    // localStorage 상태 확인
    const updatedAttempts = await page.evaluate((email) => {
      const data = localStorage.getItem(`login_attempts_${email}`);
      return data ? JSON.parse(data) : null;
    }, testEmail);

    console.log('차단 해제 후 localStorage:', updatedAttempts);
  });
});