import { test, expect } from '@playwright/test';

test.describe('로그인 페이지 기능 테스트 시나리오', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
  });

  test('시나리오 1: 빈 필드로 로그인 시도', async ({ page }) => {
    console.log('=== 시나리오 1: 빈 필드로 로그인 시도 ===');

    // 빈 필드 상태에서 제출 버튼 클릭
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // 5초간 대기하여 validation 메시지나 상태 변화 관찰
    await page.waitForTimeout(5000);

    // 페이지 상태 확인
    const currentUrl = page.url();
    console.log('제출 후 URL:', currentUrl);

    // 에러 메시지나 validation 관련 요소 확인
    const errorElements = await page.locator('[class*="error"], [class*="invalid"], [role="alert"], .text-red, .text-destructive').all();
    console.log('표시된 에러 메시지 개수:', errorElements.length);

    for (let i = 0; i < errorElements.length; i++) {
      const text = await errorElements[i].textContent();
      console.log(`에러 메시지 ${i + 1}:`, text?.trim());
    }

    // 입력 필드 상태 확인
    const emailInput = page.locator('input[type="email"]');
    const emailValue = await emailInput.inputValue();
    const hasInvalidState = await emailInput.getAttribute('aria-invalid');
    console.log('이메일 입력값:', emailValue);
    console.log('이메일 필드 invalid 상태:', hasInvalidState);

    // 스크린샷 저장
    await page.screenshot({ path: 'tests/screenshots/scenario-1-empty-submit.png' });
  });

  test('시나리오 2: 잘못된 이메일 형식으로 로그인 시도', async ({ page }) => {
    console.log('=== 시나리오 2: 잘못된 이메일 형식으로 로그인 시도 ===');

    const emailInput = page.locator('input[type="email"]');
    const submitButton = page.locator('button[type="submit"]');

    // 잘못된 이메일 형식들 테스트
    const invalidEmails = [
      'invalid-email',
      'test@',
      '@domain.com',
      'test..test@domain.com',
      'test@domain',
      'test@domain.'
    ];

    for (const invalidEmail of invalidEmails) {
      console.log(`테스트 중인 잘못된 이메일: ${invalidEmail}`);

      // 이메일 입력
      await emailInput.clear();
      await emailInput.fill(invalidEmail);

      // 제출 시도
      await submitButton.click();
      await page.waitForTimeout(2000);

      // 브라우저 기본 validation 메시지 확인
      const validationMessage = await emailInput.evaluate((input: HTMLInputElement) => {
        return input.validationMessage;
      });
      console.log(`브라우저 validation 메시지: ${validationMessage}`);

      // 커스텀 에러 메시지 확인
      const errorElements = await page.locator('[class*="error"], [class*="invalid"], [role="alert"]').all();
      for (const element of errorElements) {
        const text = await element.textContent();
        if (text && text.trim()) {
          console.log(`커스텀 에러 메시지: ${text.trim()}`);
        }
      }
    }

    await page.screenshot({ path: 'tests/screenshots/scenario-2-invalid-email.png' });
  });

  test('시나리오 3: 올바른 이메일 형식으로 로그인 시도', async ({ page }) => {
    console.log('=== 시나리오 3: 올바른 이메일 형식으로 로그인 시도 ===');

    const emailInput = page.locator('input[type="email"]');
    const submitButton = page.locator('button[type="submit"]');

    // 올바른 이메일 형식들 테스트
    const validEmails = [
      'test@example.com',
      'user.name@company.co.kr',
      'admin@custody.service.com',
      'manager+test@domain.org'
    ];

    for (const validEmail of validEmails) {
      console.log(`테스트 중인 올바른 이메일: ${validEmail}`);

      // 이메일 입력
      await emailInput.clear();
      await emailInput.fill(validEmail);

      // 네트워크 요청 모니터링
      let apiRequestMade = false;
      page.on('request', request => {
        if (request.url().includes('api') || request.method() === 'POST') {
          console.log('API 요청 감지:', request.method(), request.url());
          apiRequestMade = true;
        }
      });

      // 제출
      await submitButton.click();
      await page.waitForTimeout(3000);

      // 페이지 변화 확인
      const currentUrl = page.url();
      console.log('제출 후 URL:', currentUrl);

      // 로딩 상태나 성공 메시지 확인
      const loadingElements = page.locator('[class*="loading"], [class*="spinner"]');
      const successElements = page.locator('[class*="success"], .text-sky');

      const loadingCount = await loadingElements.count();
      const successCount = await successElements.count();

      console.log('로딩 요소 개수:', loadingCount);
      console.log('성공 메시지 요소 개수:', successCount);
      console.log('API 요청 발생:', apiRequestMade);

      // 다음 테스트를 위해 페이지 새로고침
      await page.reload();
      await page.waitForLoadState('networkidle');
    }

    await page.screenshot({ path: 'tests/screenshots/scenario-3-valid-email.png' });
  });

  test('시나리오 4: 폼 상호작용 및 사용성 테스트', async ({ page }) => {
    console.log('=== 시나리오 4: 폼 상호작용 및 사용성 테스트 ===');

    const emailInput = page.locator('input[type="email"]');
    const submitButton = page.locator('button[type="submit"]');
    const contactButton = page.locator('button:has-text("관리자에게 문의")');

    // 1. 포커스 순서 테스트
    console.log('포커스 순서 테스트');
    await page.keyboard.press('Tab');
    const focusedElement1 = await page.evaluate(() => document.activeElement?.tagName);
    console.log('첫 번째 Tab으로 포커스된 요소:', focusedElement1);

    await page.keyboard.press('Tab');
    const focusedElement2 = await page.evaluate(() => document.activeElement?.tagName);
    console.log('두 번째 Tab으로 포커스된 요소:', focusedElement2);

    // 2. 키보드 네비게이션 테스트
    console.log('키보드 네비게이션 테스트');
    await emailInput.focus();
    await emailInput.type('test@example.com');

    // Enter 키로 제출 시도
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    const urlAfterEnter = page.url();
    console.log('Enter 키 제출 후 URL:', urlAfterEnter);

    // 3. 버튼 상호작용 테스트
    console.log('버튼 상호작용 테스트');

    // 제출 버튼 상태 확인
    const submitButtonEnabled = await submitButton.isEnabled();
    const submitButtonText = await submitButton.textContent();
    console.log('제출 버튼 활성화 상태:', submitButtonEnabled);
    console.log('제출 버튼 텍스트:', submitButtonText?.trim());

    // 문의 버튼 클릭 테스트
    await contactButton.click();
    await page.waitForTimeout(2000);

    // 문의 버튼 클릭 후 변화 확인
    const urlAfterContact = page.url();
    console.log('문의 버튼 클릭 후 URL:', urlAfterContact);

    // 4. 입력 필드 상호작용 테스트
    console.log('입력 필드 상호작용 테스트');

    await emailInput.clear();
    await emailInput.fill('very-long-email-address-that-might-cause-layout-issues@very-long-domain-name.example.com');

    // 입력 필드 스크롤 테스트
    const inputValue = await emailInput.inputValue();
    console.log('긴 이메일 입력 후 값 길이:', inputValue.length);

    await page.screenshot({ path: 'tests/screenshots/scenario-4-interaction.png' });
  });

  test('시나리오 5: 접근성 및 사용자 경험 테스트', async ({ page }) => {
    console.log('=== 시나리오 5: 접근성 및 사용자 경험 테스트 ===');

    // 1. 스크린 리더 지원 확인
    console.log('접근성 속성 확인');
    const emailInput = page.locator('input[type="email"]');
    const label = page.locator('label');

    const labelText = await label.textContent();
    const inputAriaLabel = await emailInput.getAttribute('aria-label');
    const inputAriaLabelledBy = await emailInput.getAttribute('aria-labelledby');
    const inputRequired = await emailInput.getAttribute('required');

    console.log('라벨 텍스트:', labelText?.trim());
    console.log('입력 필드 aria-label:', inputAriaLabel);
    console.log('입력 필드 aria-labelledby:', inputAriaLabelledBy);
    console.log('입력 필드 required 속성:', inputRequired !== null);

    // 2. 색상 대비 및 시각적 피드백 확인
    console.log('시각적 피드백 확인');

    // 포커스 상태 확인
    await emailInput.focus();
    await page.screenshot({ path: 'tests/screenshots/scenario-5-focus-state.png' });

    // 에러 상태 확인 (빈 값으로 제출)
    await emailInput.clear();
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/scenario-5-error-state.png' });

    // 3. 모바일 뷰포트에서 사용성 테스트
    console.log('모바일 사용성 테스트');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // 모바일에서 터치 대상 크기 확인
    const submitButtonBoundingBox = await page.locator('button[type="submit"]').boundingBox();
    console.log('모바일에서 제출 버튼 크기:', submitButtonBoundingBox);

    // 모바일에서 입력 필드 접근성
    await emailInput.tap();
    await emailInput.type('mobile-test@example.com');

    await page.screenshot({ path: 'tests/screenshots/scenario-5-mobile-usability.png' });

    // 4. 고대비 모드 시뮬레이션
    console.log('고대비 모드 테스트');
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/scenario-5-dark-mode.png' });
  });

  test('시나리오 6: 성능 및 로딩 테스트', async ({ page }) => {
    console.log('=== 시나리오 6: 성능 및 로딩 테스트 ===');

    // 1. 페이지 로딩 성능 측정
    const startTime = Date.now();
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    console.log('페이지 로딩 시간:', loadTime, 'ms');

    // 2. 리소스 로딩 모니터링
    let resourceCount = 0;
    let totalResourceSize = 0;

    page.on('response', response => {
      if (response.url().includes('localhost:3000')) {
        resourceCount++;
        console.log('로드된 리소스:', response.url(), response.status());
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    console.log('총 로드된 리소스 개수:', resourceCount);

    // 3. 자바스크립트 에러 모니터링
    let jsErrors: string[] = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
      console.log('JavaScript 에러:', error.message);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
        console.log('콘솔 에러:', msg.text());
      }
    });

    // 폼 상호작용으로 에러 유발 시도
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('test@example.com');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);

    console.log('발견된 JavaScript 에러 개수:', jsErrors.length);

    // 4. 메모리 사용량 체크 (개발자 도구 이용)
    const client = await page.context().newCDPSession(page);
    await client.send('Performance.enable');

    const metrics = await client.send('Performance.getMetrics');
    const jsHeapUsed = metrics.metrics.find(metric => metric.name === 'JSHeapUsedSize')?.value;
    const jsHeapTotal = metrics.metrics.find(metric => metric.name === 'JSHeapTotalSize')?.value;

    console.log('JavaScript 힙 사용량:', jsHeapUsed, 'bytes');
    console.log('JavaScript 힙 총 크기:', jsHeapTotal, 'bytes');
  });
});