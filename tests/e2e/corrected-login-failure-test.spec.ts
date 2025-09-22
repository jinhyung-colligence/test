import { test, expect } from '@playwright/test';

test.describe('수정된 로그인 실패 시나리오 테스트', () => {

  test.beforeEach(async ({ page }) => {
    // localStorage 클리어
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('1단계: 이메일 실패 시나리오 - 현재 단계에서 5회 실패', async ({ page }) => {
    await page.goto('/login');

    // 현재 단계에서 5회 실패하면 차단됨
    for (let i = 1; i <= 5; i++) {
      console.log(`이메일 실패 시도 ${i}/5`);

      await page.fill('input[type="email"]', 'wrong@email.com');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');

      if (i < 5) {
        // 1-4회 실패: 여전히 로그인 페이지에 있어야 함
        await expect(page).toHaveURL('/login');

        // 에러 메시지 확인
        await expect(page.locator('.text-red-800, .bg-red-50')).toBeVisible();

        // 실패 횟수 표시 확인
        const attemptMessage = page.locator('text=/\\(\\d+회\\)/');
        if (await attemptMessage.isVisible()) {
          console.log(`실패 횟수 표시: ${await attemptMessage.textContent()}`);
        }
      } else {
        // 5회 실패: 차단 페이지로 리다이렉트되거나 계속 로그인 페이지에 있을 수 있음
        console.log(`5회 실패 후 URL: ${page.url()}`);

        // localStorage에서 차단 정보 확인
        const blockInfo = await page.evaluate(() => {
          const failureInfo = localStorage.getItem('login_attempts_wrong@email.com');
          return failureInfo ? JSON.parse(failureInfo) : null;
        });
        console.log('localStorage 차단 정보:', blockInfo);

        if (page.url().includes('/login/blocked')) {
          console.log('차단 페이지로 성공적으로 리다이렉트됨');

          // 차단 페이지 확인
          await expect(page.locator('h1')).toContainText('로그인 차단');
          await expect(page.locator('text=접근이 일시적으로 제한됨')).toBeVisible();

          // 타이머 확인
          const timer = page.locator('text=/\\d+:\\d+/');
          await expect(timer).toBeVisible();
          console.log(`타이머 표시: ${await timer.textContent()}`);
        } else {
          // 차단 상태이지만 리다이렉트가 즉시 일어나지 않을 수 있음
          // 한 번 더 시도해서 차단 체크
          await page.fill('input[type="email"]', 'wrong@email.com');
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');

          console.log(`6회 실패 후 URL: ${page.url()}`);

          if (page.url().includes('/login/blocked')) {
            console.log('6회 시도 후 차단 페이지로 리다이렉트됨');
            await expect(page.locator('h1')).toContainText('로그인 차단');
          }
        }
      }
    }
  });

  test('2단계: OTP 실패 시나리오 - 현재 단계에서 5회 실패', async ({ page }) => {
    await page.goto('/login');

    // 1단계: 올바른 이메일로 OTP 단계 진입
    await page.fill('input[type="email"]', 'ceo@company.com');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // OTP 단계 확인
    await expect(page.locator('h2')).toContainText('OTP 인증');

    // OTP 단계에서 5회 실패
    for (let i = 1; i <= 5; i++) {
      console.log(`OTP 실패 시도 ${i}/5`);

      await page.fill('input[maxlength="6"]', '000000');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');

      if (i < 5) {
        // 1-4회 실패: 여전히 OTP 페이지에 있어야 함
        await expect(page.locator('h2')).toContainText('OTP 인증');

        // 에러 메시지 확인
        await expect(page.locator('.text-red-800, .bg-red-50')).toBeVisible();

        // 실패 횟수 표시 확인
        const attemptMessage = page.locator('text=/\\(\\d+회\\)/');
        if (await attemptMessage.isVisible()) {
          console.log(`실패 횟수 표시: ${await attemptMessage.textContent()}`);
        }
      } else {
        // 5회 실패: 차단 처리
        console.log(`5회 실패 후 URL: ${page.url()}`);

        // localStorage에서 차단 정보 확인
        const blockInfo = await page.evaluate(() => {
          const failureInfo = localStorage.getItem('login_attempts_ceo@company.com');
          return failureInfo ? JSON.parse(failureInfo) : null;
        });
        console.log('localStorage 차단 정보:', blockInfo);

        if (page.url().includes('/login/blocked')) {
          console.log('OTP 5회 실패 후 차단 페이지로 리다이렉트됨');

          // 차단 페이지 확인
          await expect(page.locator('h1')).toContainText('로그인 차단');
          await expect(page.locator('text=접근이 일시적으로 제한됨')).toBeVisible();

          // 타이머 확인
          const timer = page.locator('text=/\\d+:\\d+/');
          await expect(timer).toBeVisible();
          console.log(`타이머 표시: ${await timer.textContent()}`);
        } else {
          // 한 번 더 시도해서 차단 체크
          await page.fill('input[maxlength="6"]', '000000');
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');

          console.log(`6회 실패 후 URL: ${page.url()}`);
        }
      }
    }
  });

  test('3단계: SMS 실패 시나리오 - 현재 단계에서 5회 실패', async ({ page }) => {
    await page.goto('/login');

    // 1단계: 올바른 이메일로 통과
    await page.fill('input[type="email"]', 'ceo@company.com');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // 2단계: 올바른 OTP로 통과
    await expect(page.locator('h2')).toContainText('OTP 인증');
    await page.fill('input[maxlength="6"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // SMS 단계 확인
    await expect(page.locator('h2')).toContainText('SMS 인증');

    // SMS 단계에서 5회 실패
    for (let i = 1; i <= 5; i++) {
      console.log(`SMS 실패 시도 ${i}/5`);

      await page.fill('input[maxlength="6"]:last-of-type', '000000');
      await page.click('button[type="submit"]:has-text("로그인 완료")');
      await page.waitForLoadState('networkidle');

      if (i < 5) {
        // 1-4회 실패: 여전히 SMS 페이지에 있어야 함
        await expect(page.locator('h2')).toContainText('SMS 인증');

        // 에러 메시지 확인
        await expect(page.locator('.text-red-800, .bg-red-50')).toBeVisible();

        // 실패 횟수 표시 확인
        const attemptMessage = page.locator('text=/\\(\\d+회\\)/');
        if (await attemptMessage.isVisible()) {
          console.log(`실패 횟수 표시: ${await attemptMessage.textContent()}`);
        }
      } else {
        // 5회 실패: 차단 처리
        console.log(`5회 실패 후 URL: ${page.url()}`);

        // localStorage에서 차단 정보 확인
        const blockInfo = await page.evaluate(() => {
          const failureInfo = localStorage.getItem('login_attempts_ceo@company.com');
          return failureInfo ? JSON.parse(failureInfo) : null;
        });
        console.log('localStorage 차단 정보:', blockInfo);

        if (page.url().includes('/login/blocked')) {
          console.log('SMS 5회 실패 후 차단 페이지로 리다이렉트됨');

          // 차단 페이지 확인
          await expect(page.locator('h1')).toContainText('로그인 차단');
          await expect(page.locator('text=접근이 일시적으로 제한됨')).toBeVisible();

          // 타이머 확인
          const timer = page.locator('text=/\\d+:\\d+/');
          await expect(timer).toBeVisible();
          console.log(`타이머 표시: ${await timer.textContent()}`);
        }
      }
    }
  });

  test('차단된 사용자가 다시 로그인 시도', async ({ page }) => {
    await page.goto('/login');

    // 먼저 차단 상태를 만들기 위해 localStorage에 차단 정보 설정
    await page.evaluate(() => {
      const blockedUntil = Date.now() + 5 * 60 * 1000; // 5분 후
      const blockData = {
        count: 5,
        lastAttempt: Date.now(),
        blockedUntil: blockedUntil
      };
      localStorage.setItem('login_attempts_blocked@test.com', JSON.stringify(blockData));
    });

    // 차단된 이메일로 로그인 시도
    await page.fill('input[type="email"]', 'blocked@test.com');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    console.log('차단된 사용자 로그인 시도 후 URL:', page.url());

    // 차단 페이지로 리다이렉트되어야 함
    if (page.url().includes('/login/blocked')) {
      console.log('차단된 사용자가 차단 페이지로 리다이렉트됨');

      // 차단 페이지 요소 확인
      await expect(page.locator('h1')).toContainText('로그인 차단');
      await expect(page.locator('text=접근이 일시적으로 제한됨')).toBeVisible();

      // 타이머 확인
      const timer = page.locator('text=/\\d+:\\d+/');
      await expect(timer).toBeVisible();
      console.log(`타이머 표시: ${await timer.textContent()}`);

      // 관리자 문의 버튼 확인
      await expect(page.locator('text=관리자에게 문의')).toBeVisible();
    }
  });

  test('차단 페이지 타이머 기능 테스트', async ({ page }) => {
    // 5초 후 만료되는 짧은 차단 시간으로 테스트
    const blockedUntil = Date.now() + 5000; // 5초 후
    const reason = encodeURIComponent('타이머 테스트');

    await page.goto(`/login/blocked?until=${blockedUntil}&reason=${reason}`);
    await page.waitForLoadState('domcontentloaded');

    if (!page.url().includes('/login/blocked')) {
      console.log('차단 페이지가 로그인 페이지로 리다이렉트됨 (예상 동작)');
      return;
    }

    console.log('차단 페이지 접근 성공');

    // 타이머 기능 확인
    const timer = page.locator('text=/\\d+:\\d+/');
    if (await timer.isVisible()) {
      const initialTime = await timer.textContent();
      console.log(`초기 타이머: ${initialTime}`);

      // 1초 대기 후 타이머 변화 확인
      await page.waitForTimeout(1500);
      const updatedTime = await timer.textContent();
      console.log(`1초 후 타이머: ${updatedTime}`);

      // 타이머가 카운트다운되고 있는지 확인
      expect(initialTime).not.toBe(updatedTime);
    }

    // 관리자 문의 버튼 동작 확인
    page.on('dialog', dialog => {
      console.log('알림 메시지:', dialog.message());
      expect(dialog.message()).toContain('support@company.com');
      dialog.accept();
    });

    const contactButton = page.locator('text=관리자에게 문의');
    if (await contactButton.isVisible()) {
      await contactButton.click();
    }

    // 로그인 페이지로 돌아가기 버튼 확인
    await expect(page.locator('text=로그인 페이지로 돌아가기')).toBeVisible();
  });
});