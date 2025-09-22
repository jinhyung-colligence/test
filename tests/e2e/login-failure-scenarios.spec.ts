import { test, expect } from '@playwright/test';

test.describe('로그인 실패 시나리오 테스트', () => {

  test.beforeEach(async ({ page }) => {
    // localStorage 클리어
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('1단계: 이메일 5회 실패 후 차단 페이지 이동', async ({ page }) => {
    await page.goto('/login');

    // 잘못된 이메일로 5회 연속 시도
    for (let i = 1; i <= 5; i++) {
      console.log(`이메일 실패 시도 ${i}/5`);

      await page.fill('input[type="email"]', 'wrong@email.com');
      await page.click('button[type="submit"]');

      // 로딩 완료 대기
      await page.waitForLoadState('networkidle');

      if (i < 5) {
        // 1-4회 실패: 여전히 로그인 페이지에 있어야 함
        await expect(page).toHaveURL('/login');

        // 에러 메시지 확인
        await expect(page.locator('.text-red-800, .bg-red-50')).toBeVisible();

        // 실패 횟수 표시 확인 (AttemptLimitMessage 컴포넌트에서)
        const attemptMessage = page.locator('text=/\\(\\d+회\\)/');
        if (await attemptMessage.isVisible()) {
          console.log(`실패 횟수 표시: ${await attemptMessage.textContent()}`);
        }
      } else {
        // 5회 실패: 차단 페이지로 리다이렉트
        await expect(page).toHaveURL(/\/login\/blocked/);
        console.log('차단 페이지로 성공적으로 리다이렉트됨');
      }
    }

    // 차단 페이지 확인
    await expect(page.locator('h1')).toContainText('로그인 차단');
    await expect(page.locator('text=접근이 일시적으로 제한됨')).toBeVisible();

    // 타이머 확인
    const timer = page.locator('text=/\\d+:\\d+/');
    await expect(timer).toBeVisible();
    console.log(`타이머 표시: ${await timer.textContent()}`);

    // localStorage에서 차단 정보 확인 (실제 키 형태)
    const blockInfo = await page.evaluate(() => {
      const failureInfo = localStorage.getItem('login_attempts_wrong@email.com');
      return failureInfo ? JSON.parse(failureInfo) : null;
    });
    console.log('localStorage 차단 정보:', blockInfo);

    // 관리자 문의 버튼 확인
    await expect(page.locator('text=관리자에게 문의')).toBeVisible();
  });

  test('2단계: OTP 5회 실패 후 차단 페이지 이동', async ({ page }) => {
    await page.goto('/login');

    // 1단계: 올바른 이메일로 통과
    await page.fill('input[type="email"]', 'ceo@company.com');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // OTP 단계로 이동 확인
    await expect(page.locator('h2')).toContainText('OTP 인증');

    // 잘못된 OTP로 5회 연속 시도
    for (let i = 1; i <= 5; i++) {
      console.log(`OTP 실패 시도 ${i}/5`);

      await page.fill('input[maxlength="6"]', '000000');
      await page.click('button[type="submit"]');

      // 로딩 완료 대기
      await page.waitForLoadState('networkidle');

      if (i < 5) {
        // 1-4회 실패: 여전히 OTP 페이지에 있어야 함
        await expect(page.locator('h2')).toContainText('OTP 인증');

        // 에러 메시지 확인
        await expect(page.locator('[data-testid="error-message"], .text-red-800, .bg-red-50')).toBeVisible();

        // 실패 횟수 표시 확인 (AttemptLimitMessage 컴포넌트에서)
        const attemptMessage = page.locator('text=/\\(\\d+회\\)/');
        if (await attemptMessage.isVisible()) {
          console.log(`실패 횟수 표시: ${await attemptMessage.textContent()}`);
        }
      } else {
        // 5회 실패: 차단 페이지로 리다이렉트
        await expect(page).toHaveURL(/\/login\/blocked/);
        console.log('차단 페이지로 성공적으로 리다이렉트됨');
      }
    }

    // 차단 페이지 확인
    await expect(page.locator('h1')).toContainText('로그인 차단');
    await expect(page.locator('text=접근이 일시적으로 제한됨')).toBeVisible();

    // 타이머 확인
    const timer = page.locator('text=/\\d+:\\d+/');
    await expect(timer).toBeVisible();
    console.log(`타이머 표시: ${await timer.textContent()}`);

    // localStorage에서 차단 정보 확인 (실제 키 형태)
    const blockInfo = await page.evaluate(() => {
      const failureInfo = localStorage.getItem('login_attempts_ceo@company.com');
      return failureInfo ? JSON.parse(failureInfo) : null;
    });
    console.log('localStorage 차단 정보:', blockInfo);
  });

  test('3단계: SMS 5회 실패 후 차단 페이지 이동', async ({ page }) => {
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

    // SMS 단계로 이동 확인
    await expect(page.locator('h2')).toContainText('SMS 인증');

    // 잘못된 SMS 코드로 5회 연속 시도
    for (let i = 1; i <= 5; i++) {
      console.log(`SMS 실패 시도 ${i}/5`);

      await page.fill('input[maxlength="6"]:last-of-type', '000000');
      await page.click('button[type="submit"]:has-text("로그인 완료")');

      // 로딩 완료 대기
      await page.waitForLoadState('networkidle');

      if (i < 5) {
        // 1-4회 실패: 여전히 SMS 페이지에 있어야 함
        await expect(page.locator('h2')).toContainText('SMS 인증');

        // 에러 메시지 확인
        await expect(page.locator('[data-testid="error-message"], .text-red-800, .bg-red-50')).toBeVisible();

        // 실패 횟수 표시 확인 (AttemptLimitMessage 컴포넌트에서)
        const attemptMessage = page.locator('text=/\\(\\d+회\\)/');
        if (await attemptMessage.isVisible()) {
          console.log(`실패 횟수 표시: ${await attemptMessage.textContent()}`);
        }
      } else {
        // 5회 실패: 차단 페이지로 리다이렉트
        await expect(page).toHaveURL(/\/login\/blocked/);
        console.log('차단 페이지로 성공적으로 리다이렉트됨');
      }
    }

    // 차단 페이지 확인
    await expect(page.locator('h1')).toContainText('로그인 차단');
    await expect(page.locator('text=접근이 일시적으로 제한됨')).toBeVisible();

    // 타이머 확인
    const timer = page.locator('text=/\\d+:\\d+/');
    await expect(timer).toBeVisible();
    console.log(`타이머 표시: ${await timer.textContent()}`);

    // localStorage에서 차단 정보 확인 (실제 키 형태)
    const blockInfo = await page.evaluate(() => {
      const failureInfo = localStorage.getItem('login_attempts_ceo@company.com');
      return failureInfo ? JSON.parse(failureInfo) : null;
    });
    console.log('localStorage 차단 정보:', blockInfo);
  });

  test('차단 페이지 기능 검증', async ({ page }) => {
    // 임의로 차단 페이지에 접근 (5분 차단)
    const blockedUntil = Date.now() + 5 * 60 * 1000; // 5분 후
    const reason = encodeURIComponent('테스트용 차단');
    await page.goto(`/login/blocked?until=${blockedUntil}&reason=${reason}`);

    // 페이지 로딩 대기
    await page.waitForLoadState('domcontentloaded');

    // 차단 페이지 요소들 확인
    await expect(page.locator('h1')).toContainText('로그인 차단');
    await expect(page.locator('text=테스트용 차단')).toBeVisible();

    // 타이머 기능 확인
    const timer = page.locator('text=/\\d+:\\d+/');
    await expect(timer).toBeVisible();

    const initialTime = await timer.textContent();
    console.log(`초기 타이머: ${initialTime}`);

    // 1초 대기 후 타이머 변화 확인
    await page.waitForTimeout(1500);
    const updatedTime = await timer.textContent();
    console.log(`1초 후 타이머: ${updatedTime}`);

    // 타이머가 카운트다운되고 있는지 확인
    expect(initialTime).not.toBe(updatedTime);

    // 관리자 문의 버튼 동작 확인
    page.on('dialog', dialog => {
      console.log('알림 메시지:', dialog.message());
      expect(dialog.message()).toContain('support@company.com');
      dialog.accept();
    });
    await page.click('text=관리자에게 문의');

    // 로그인 페이지로 돌아가기 버튼 확인
    await expect(page.locator('text=로그인 페이지로 돌아가기')).toBeVisible();
  });

  test('차단 시간 만료 후 자동 리다이렉트', async ({ page }) => {
    // 이미 만료된 차단 시간으로 접근
    const expiredTime = Date.now() - 1000; // 1초 전
    const reason = encodeURIComponent('만료된 차단');
    await page.goto(`/login/blocked?until=${expiredTime}&reason=${reason}`);

    // 페이지 로딩 대기
    await page.waitForLoadState('domcontentloaded');

    // 자동으로 로그인 페이지로 리다이렉트되어야 함
    await expect(page).toHaveURL('/login');
    console.log('만료된 차단 시간으로 인해 로그인 페이지로 자동 리다이렉트됨');
  });

  test('각 단계별 독립적인 실패 횟수 관리', async ({ page }) => {
    await page.goto('/login');

    // 1단계에서 2회 실패
    for (let i = 1; i <= 2; i++) {
      await page.fill('input[type="email"]', 'wrong@email.com');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
    }

    // 올바른 이메일로 통과
    await page.fill('input[type="email"]', 'ceo@company.com');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // OTP 단계에서 3회 실패
    for (let i = 1; i <= 3; i++) {
      await page.fill('input[maxlength="6"]', '000000');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
    }

    // 올바른 OTP로 통과
    await page.fill('input[maxlength="6"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // SMS 단계에서 4회 실패 (아직 차단되지 않아야 함)
    for (let i = 1; i <= 4; i++) {
      await page.fill('input[maxlength="6"]:last-of-type', '000000');
      await page.click('button[type="submit"]:has-text("로그인 완료")');
      await page.waitForLoadState('networkidle');

      // 아직 SMS 페이지에 있어야 함
      await expect(page.locator('h2')).toContainText('SMS 인증');
    }

    // localStorage에서 각 단계별 실패 횟수 확인
    const failureStats = await page.evaluate(() => {
      return {
        email: localStorage.getItem('auth_failure_email'),
        otp: localStorage.getItem('auth_failure_otp'),
        sms: localStorage.getItem('auth_failure_sms')
      };
    });

    console.log('각 단계별 실패 통계:', failureStats);

    // 5번째 SMS 실패로 차단
    await page.fill('input[maxlength="6"]:last-of-type', '000000');
    await page.click('button[type="submit"]:has-text("로그인 완료")');
    await page.waitForLoadState('networkidle');

    // 차단 페이지로 이동해야 함
    await expect(page).toHaveURL(/\/login\/blocked/);
    console.log('각 단계별 독립적인 실패 카운트 검증 완료');
  });
});