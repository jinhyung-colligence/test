import { test, expect } from '@playwright/test';

test.describe('간단한 로그인 테스트', () => {

  test.beforeEach(async ({ page }) => {
    // localStorage 클리어
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('이메일 실패 동작 확인', async ({ page }) => {
    await page.goto('/login');

    // 현재 페이지 상태 확인
    console.log('현재 URL:', page.url());

    // 잘못된 이메일로 1회 시도
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    console.log('1회 실패 후 URL:', page.url());

    // 에러 메시지가 표시되는지 확인
    const errorMessage = page.locator('.text-red-800, .bg-red-50');
    if (await errorMessage.isVisible()) {
      console.log('에러 메시지:', await errorMessage.textContent());
    }

    // localStorage 확인
    const localStorage1 = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const data = {};
      keys.forEach(key => {
        try {
          data[key] = JSON.parse(localStorage.getItem(key));
        } catch {
          data[key] = localStorage.getItem(key);
        }
      });
      return data;
    });
    console.log('1회 실패 후 localStorage:', localStorage1);

    // 실패 횟수 표시 확인
    const attemptMessage = page.locator('text=/\\(\\d+회\\)/');
    if (await attemptMessage.isVisible()) {
      console.log('실패 횟수 표시:', await attemptMessage.textContent());
    }

    // 5회 더 시도해서 차단 확인
    for (let i = 2; i <= 6; i++) {
      console.log(`실패 시도 ${i}/6`);
      await page.fill('input[type="email"]', 'wrong@email.com');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');

      console.log(`${i}회 실패 후 URL:`, page.url());

      // 차단 페이지로 리다이렉트되었는지 확인
      if (page.url().includes('/login/blocked')) {
        console.log(`${i}회 실패 후 차단 페이지로 이동됨`);
        break;
      }

      // localStorage 확인
      const localStorageI = await page.evaluate(() => {
        const keys = Object.keys(localStorage);
        const data = {};
        keys.forEach(key => {
          try {
            data[key] = JSON.parse(localStorage.getItem(key));
          } catch {
            data[key] = localStorage.getItem(key);
          }
        });
        return data;
      });
      console.log(`${i}회 실패 후 localStorage:`, localStorageI);
    }
  });

  test('차단 페이지 직접 접근 테스트', async ({ page }) => {
    // 5분 후 만료되는 차단 시간으로 설정
    const blockedUntil = Date.now() + 5 * 60 * 1000;
    const reason = encodeURIComponent('테스트 차단');

    await page.goto(`/login/blocked?until=${blockedUntil}&reason=${reason}`);
    await page.waitForLoadState('domcontentloaded');

    console.log('차단 페이지 접근 후 URL:', page.url());

    // 차단 페이지 요소들 확인
    const h1 = page.locator('h1');
    if (await h1.isVisible()) {
      console.log('제목:', await h1.textContent());
    }

    const timer = page.locator('text=/\\d+:\\d+/');
    if (await timer.isVisible()) {
      console.log('타이머:', await timer.textContent());
    }

    const reasonText = page.locator('text=테스트 차단');
    if (await reasonText.isVisible()) {
      console.log('차단 이유 표시됨');
    }
  });

  test('정상 로그인 플로우 확인', async ({ page }) => {
    await page.goto('/login');

    // 1단계: 정상 이메일
    await page.fill('input[type="email"]', 'ceo@company.com');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    console.log('이메일 입력 후 URL:', page.url());

    // OTP 단계 확인
    const otpTitle = page.locator('h2:has-text("OTP 인증")');
    if (await otpTitle.isVisible()) {
      console.log('OTP 단계로 이동됨');

      // 2단계: 정상 OTP
      await page.fill('input[maxlength="6"]', '123456');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');

      console.log('OTP 입력 후 URL:', page.url());

      // SMS 단계 확인
      const smsTitle = page.locator('h2:has-text("SMS 인증")');
      if (await smsTitle.isVisible()) {
        console.log('SMS 단계로 이동됨');

        // 3단계: 정상 SMS
        await page.fill('input[maxlength="6"]:last-of-type', '987654');
        await page.click('button[type="submit"]:has-text("로그인 완료")');
        await page.waitForLoadState('networkidle');

        console.log('SMS 입력 후 URL:', page.url());
      }
    }
  });
});