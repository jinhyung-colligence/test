import { test, expect } from '@playwright/test';

test.describe('Blocked 페이지 디버깅', () => {

  test('실시간 디버깅 테스트', async ({ page }) => {
    console.log('=== 실시간 디버깅 시작 ===');

    // JavaScript 콘솔에서 현재 시간 확인
    const browserTime = await page.evaluate(() => Date.now());
    const nodeTime = Date.now();

    console.log(`브라우저 시간: ${browserTime}`);
    console.log(`Node.js 시간: ${nodeTime}`);
    console.log(`시간 차이: ${Math.abs(browserTime - nodeTime)}ms`);

    // 올바른 미래 시간 생성 (브라우저 기준)
    const futureTime = browserTime + (3 * 60 * 1000); // 3분 후
    const testUrl = `http://localhost:3000/login/blocked?until=${futureTime}&reason=debug_test`;

    console.log(`테스트 URL: ${testUrl}`);
    console.log(`차단 해제 시간: ${new Date(futureTime).toLocaleString()}`);

    // 페이지 네비게이션 전에 콘솔 로그 캡처
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        console.log(`Browser Console [${msg.type()}]: ${msg.text()}`);
      }
    });

    // blocked 페이지로 이동
    console.log('blocked 페이지로 이동 중...');
    await page.goto(testUrl);

    // 페이지 로딩 대기
    await page.waitForTimeout(2000);

    // 현재 URL 확인
    const currentUrl = page.url();
    console.log(`현재 URL: ${currentUrl}`);

    // useEffect 내부 로직을 브라우저에서 직접 실행해보기
    const debugInfo = await page.evaluate((futureTime) => {
      const urlParams = new URLSearchParams(window.location.search);
      const blockedUntil = parseInt(urlParams.get('until') || '0');
      const currentTime = Date.now();

      const result = {
        urlUntil: urlParams.get('until'),
        parsedUntil: blockedUntil,
        currentTime: currentTime,
        isNaN: isNaN(blockedUntil),
        isExpired: blockedUntil <= currentTime,
        timeDiff: blockedUntil - currentTime,
        maxBlockTime: 60 * 60 * 1000,
        isTooLong: (blockedUntil - currentTime) > (60 * 60 * 1000),
        shouldRedirect: !blockedUntil || isNaN(blockedUntil) || blockedUntil <= currentTime || (blockedUntil - currentTime) > (60 * 60 * 1000)
      };

      return result;
    }, futureTime);

    console.log('=== 디버그 정보 ===');
    console.log('URL until 파라미터:', debugInfo.urlUntil);
    console.log('파싱된 until:', debugInfo.parsedUntil);
    console.log('현재 시간:', debugInfo.currentTime);
    console.log('isNaN 체크:', debugInfo.isNaN);
    console.log('만료 여부:', debugInfo.isExpired);
    console.log('시간 차이:', debugInfo.timeDiff, 'ms');
    console.log('최대 차단 시간:', debugInfo.maxBlockTime, 'ms');
    console.log('너무 긴 시간 여부:', debugInfo.isTooLong);
    console.log('리다이렉트 해야 하는가:', debugInfo.shouldRedirect);

    // 페이지 상태 확인
    if (currentUrl.includes('/login/blocked')) {
      console.log('✓ blocked 페이지에 머물러 있음');

      // 검증 중 상태 확인
      const isValidating = await page.locator('text=접근 권한을 확인하는 중').isVisible().catch(() => false);
      console.log('검증 중 상태:', isValidating);

      if (!isValidating) {
        // 타이머 확인
        const timer = await page.locator('.font-mono.font-bold').textContent().catch(() => '없음');
        console.log('카운트다운 타이머:', timer);
      }

    } else {
      console.log('✗ 다른 페이지로 리다이렉트됨');
    }

    console.log('=== 디버깅 완료 ===');
  });

  test('다양한 시간 시나리오 테스트', async ({ page }) => {
    console.log('=== 다양한 시간 시나리오 테스트 ===');

    const currentTime = await page.evaluate(() => Date.now());

    const scenarios = [
      {
        name: '1분 후 (유효)',
        time: currentTime + (1 * 60 * 1000),
        expectedResult: 'blocked 페이지 유지'
      },
      {
        name: '30분 후 (유효)',
        time: currentTime + (30 * 60 * 1000),
        expectedResult: 'blocked 페이지 유지'
      },
      {
        name: '59분 후 (유효, 경계값)',
        time: currentTime + (59 * 60 * 1000),
        expectedResult: 'blocked 페이지 유지'
      },
      {
        name: '61분 후 (무효, 너무 긴 시간)',
        time: currentTime + (61 * 60 * 1000),
        expectedResult: '로그인 페이지로 리다이렉트'
      },
      {
        name: '현재 시간 (만료)',
        time: currentTime,
        expectedResult: '로그인 페이지로 리다이렉트'
      },
      {
        name: '1분 전 (만료)',
        time: currentTime - (1 * 60 * 1000),
        expectedResult: '로그인 페이지로 리다이렉트'
      }
    ];

    for (const scenario of scenarios) {
      console.log(`\n--- ${scenario.name} ---`);

      const testUrl = `http://localhost:3000/login/blocked?until=${scenario.time}&reason=scenario_test`;
      await page.goto(testUrl);
      await page.waitForTimeout(2000);

      const finalUrl = page.url();
      const isBlocked = finalUrl.includes('/login/blocked');
      const actualResult = isBlocked ? 'blocked 페이지 유지' : '로그인 페이지로 리다이렉트';

      console.log(`예상 결과: ${scenario.expectedResult}`);
      console.log(`실제 결과: ${actualResult}`);
      console.log(`테스트: ${actualResult === scenario.expectedResult ? '✓ 통과' : '✗ 실패'}`);
    }

    console.log('=== 시나리오 테스트 완료 ===');
  });
});