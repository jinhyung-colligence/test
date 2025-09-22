import { test, expect } from '@playwright/test';

test.describe('로그인 차단 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 localStorage 초기화
    await page.goto('http://localhost:3000/login');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('5회 연속 로그인 실패 후 차단 페이지로 리다이렉트', async ({ page }) => {
    console.log('=== 5회 연속 로그인 실패 테스트 시작 ===');

    // 콘솔 로그 수집
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    await page.goto('http://localhost:3000/login');

    // 초기 localStorage 상태 확인
    const initialAttempts = await page.evaluate(() => {
      return localStorage.getItem('loginAttempts');
    });
    console.log('초기 loginAttempts:', initialAttempts);

    // 5회 연속 실패 시도
    for (let i = 1; i <= 5; i++) {
      console.log(`\n--- ${i}번째 로그인 실패 시도 ---`);

      // 이메일 입력 (비밀번호 필드는 첫 번째 단계에 없음)
      await page.fill('input[type="email"]', 'wrong@example.com');

      // 로그인 버튼 클릭
      await page.click('button[type="submit"]');

      // 잠시 대기 (API 응답 대기)
      await page.waitForTimeout(1000);

      // localStorage 상태 확인
      const attempts = await page.evaluate(() => {
        const data = localStorage.getItem('loginAttempts');
        return data ? JSON.parse(data) : null;
      });

      console.log(`${i}번째 시도 후 localStorage:`, attempts);

      // 현재 URL 확인
      const currentUrl = page.url();
      console.log(`${i}번째 시도 후 URL:`, currentUrl);

      // 5번째 시도 후 차단 페이지로 리다이렉트되는지 확인
      if (i === 5) {
        console.log('5번째 시도 완료 - 차단 페이지 확인 중...');

        // 리다이렉트 대기 (최대 5초)
        try {
          await page.waitForURL('**/login/blocked', { timeout: 5000 });
          console.log('차단 페이지로 성공적으로 리다이렉트됨');
        } catch (error) {
          console.log('차단 페이지 리다이렉트 실패:', error);
          console.log('현재 URL:', page.url());
        }
      }
    }

    // 최종 URL 확인
    const finalUrl = page.url();
    console.log('최종 URL:', finalUrl);

    // 콘솔 로그 출력
    console.log('\n=== 브라우저 콘솔 로그 ===');
    consoleLogs.forEach(log => console.log(log));

    // 차단 페이지로 리다이렉트되었는지 검증
    expect(finalUrl).toContain('/login/blocked');
  });

  test('차단 페이지 요소 확인', async ({ page }) => {
    console.log('=== 차단 페이지 요소 확인 테스트 ===');

    // localStorage에 차단 상태 설정
    await page.goto('http://localhost:3000/login');
    await page.evaluate(() => {
      const blockData = {
        email: 'test@example.com',
        attempts: 5,
        blockedUntil: Date.now() + (5 * 60 * 1000), // 5분 후
        lastAttempt: Date.now()
      };
      localStorage.setItem('loginAttempts', JSON.stringify(blockData));
    });

    // 차단 상태를 시뮬레이션하기 위해 URL 파라미터와 함께 차단 페이지로 직접 이동
    const blockedUntil = Date.now() + (5 * 60 * 1000); // 5분 후
    const reason = encodeURIComponent('너무 많은 로그인 시도로 인해 일시적으로 차단되었습니다');

    await page.goto(`http://localhost:3000/login/blocked?until=${blockedUntil}&reason=${reason}`);

    // 페이지 로딩 대기
    await page.waitForTimeout(3000);

    console.log('현재 페이지 URL:', page.url());

    // 차단 메시지 확인 (실제 텍스트 기반으로)
    const blockedTitle = page.locator('h2:has-text("접근이 일시적으로 제한됨")');
    await expect(blockedTitle).toBeVisible();
    console.log('차단 제목 표시 확인됨');

    // 카운트다운 타이머 확인 (시간 포맷 텍스트로)
    const countdownElement = page.locator('.text-4xl.font-mono.font-bold');
    if (await countdownElement.isVisible()) {
      const countdownText = await countdownElement.textContent();
      console.log('카운트다운 표시:', countdownText);

      // 1초 후 카운트다운이 변경되는지 확인
      await page.waitForTimeout(1100);
      const updatedCountdownText = await countdownElement.textContent();
      console.log('1초 후 카운트다운:', updatedCountdownText);

      expect(countdownText).not.toBe(updatedCountdownText);
      console.log('카운트다운 타이머 정상 작동 확인됨');
    } else {
      console.log('카운트다운 요소를 찾을 수 없음');
    }

    // 안내 메시지 확인
    const infoMessage = page.locator('text=이런 경우에 차단됩니다');
    await expect(infoMessage).toBeVisible();
    console.log('안내 메시지 확인됨');
  });

  test('localStorage 상태 직접 확인', async ({ page }) => {
    console.log('=== localStorage 상태 직접 확인 ===');

    await page.goto('http://localhost:3000/login');

    // localStorage 초기 상태
    const initial = await page.evaluate(() => localStorage.getItem('loginAttempts'));
    console.log('초기 localStorage:', initial);

    // 테스트 데이터 설정
    await page.evaluate(() => {
      const testData = {
        email: 'test@example.com',
        attempts: 5,
        blockedUntil: Date.now() + (5 * 60 * 1000),
        lastAttempt: Date.now()
      };
      localStorage.setItem('loginAttempts', JSON.stringify(testData));
    });

    // 설정된 데이터 확인
    const stored = await page.evaluate(() => {
      const data = localStorage.getItem('loginAttempts');
      return data ? JSON.parse(data) : null;
    });

    console.log('설정된 localStorage 데이터:', stored);

    // 차단 상태 확인
    if (stored) {
      const isBlocked = stored.attempts >= 5 && Date.now() < stored.blockedUntil;
      console.log('차단 상태:', isBlocked);
      console.log('현재 시간:', new Date().toISOString());
      console.log('차단 해제 시간:', new Date(stored.blockedUntil).toISOString());
    }
  });

  test('실제 로그인 실패 시뮬레이션', async ({ page }) => {
    console.log('=== 실제 로그인 실패 시뮬레이션 ===');

    await page.goto('http://localhost:3000/login');

    // 콘솔 로그 수집
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    console.log('페이지 로드 완료, 로그인 시도 시작');

    for (let i = 1; i <= 3; i++) {
      console.log(`\n--- ${i}번째 로그인 실패 시도 (실제 API 호출) ---`);

      // 잘못된 이메일 입력
      await page.fill('input[type="email"]', 'nonexistent@example.com');

      // 다음 단계 버튼 클릭
      await page.click('button[type="submit"]');

      // 응답 대기
      await page.waitForTimeout(3000);

      // 에러 메시지 확인
      const errorMessage = page.locator('.bg-red-50');
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        console.log(`${i}번째 시도 에러 메시지:`, errorText);
      }

      // localStorage 상태 확인
      const attempts = await page.evaluate(() => {
        const data = localStorage.getItem('loginAttempts');
        return data ? JSON.parse(data) : null;
      });

      console.log(`${i}번째 시도 후 localStorage:`, attempts);
    }

    // 콘솔 로그 출력
    console.log('\n=== 브라우저 콘솔 로그 ===');
    consoleLogs.forEach(log => console.log(log));
  });
});