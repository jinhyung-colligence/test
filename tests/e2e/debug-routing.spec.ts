import { test, expect } from '@playwright/test';

test.describe('라우팅 디버깅', () => {
  test('차단 페이지 라우팅 디버깅', async ({ page }) => {
    console.log('=== 차단 페이지 라우팅 디버깅 ===');

    // 콘솔 로그 수집
    const consoleLogs: string[] = [];
    const errors: string[] = [];

    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    page.on('pageerror', error => {
      errors.push(`[PAGE ERROR] ${error.message}`);
    });

    // 1. 로그인 페이지 접근 테스트
    console.log('\n1. 로그인 페이지 접근 테스트');
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    console.log('로그인 페이지 URL:', page.url());

    // 2. 차단 페이지 직접 접근 (파라미터 없이)
    console.log('\n2. 차단 페이지 직접 접근 (파라미터 없이)');
    await page.goto('http://localhost:3000/login/blocked');
    await page.waitForTimeout(3000);
    console.log('차단 페이지 URL (파라미터 없음):', page.url());

    // 3. 차단 페이지 직접 접근 (유효한 파라미터와 함께)
    console.log('\n3. 차단 페이지 직접 접근 (유효한 파라미터와 함께)');
    const blockedUntil = Date.now() + (5 * 60 * 1000);
    const reason = encodeURIComponent('테스트용 차단');
    await page.goto(`http://localhost:3000/login/blocked?until=${blockedUntil}&reason=${reason}`);
    await page.waitForTimeout(3000);
    console.log('차단 페이지 URL (파라미터 있음):', page.url());

    // 4. 페이지 소스 확인
    console.log('\n4. 페이지 소스 확인');
    const pageTitle = await page.title();
    console.log('페이지 타이틀:', pageTitle);

    const h1Elements = await page.locator('h1').allTextContents();
    console.log('H1 요소들:', h1Elements);

    // 5. 오류 및 콘솔 로그 출력
    console.log('\n=== 오류 로그 ===');
    errors.forEach(error => console.log(error));

    console.log('\n=== 브라우저 콘솔 로그 ===');
    consoleLogs.forEach(log => console.log(log));
  });

  test('네트워크 요청 모니터링', async ({ page }) => {
    console.log('=== 네트워크 요청 모니터링 ===');

    const requests: string[] = [];
    const responses: string[] = [];

    page.on('request', request => {
      requests.push(`REQUEST: ${request.method()} ${request.url()}`);
    });

    page.on('response', response => {
      responses.push(`RESPONSE: ${response.status()} ${response.url()}`);
    });

    const blockedUntil = Date.now() + (5 * 60 * 1000);
    const reason = encodeURIComponent('테스트용 차단');
    const url = `http://localhost:3000/login/blocked?until=${blockedUntil}&reason=${reason}`;

    console.log('접근할 URL:', url);
    await page.goto(url);
    await page.waitForTimeout(3000);

    console.log('최종 URL:', page.url());

    console.log('\n=== 네트워크 요청 ===');
    requests.forEach(req => console.log(req));

    console.log('\n=== 네트워크 응답 ===');
    responses.forEach(res => console.log(res));
  });
});