import { test, expect } from '@playwright/test';

test.describe('로그인 페이지 종합 분석', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
  });

  test('페이지 기본 구조 확인', async ({ page }) => {
    // 페이지 타이틀 확인
    const title = await page.title();
    console.log('페이지 타이틀:', title);

    // 메타 태그 확인
    const description = await page.getAttribute('meta[name="description"]', 'content');
    console.log('페이지 설명:', description);

    // 페이지 URL 확인
    console.log('현재 URL:', page.url());

    // 페이지 스크린샷
    await page.screenshot({ path: 'tests/screenshots/login-page-overview.png', fullPage: true });
  });

  test('로그인 폼 구조 분석', async ({ page }) => {
    // 로그인 폼 존재 확인
    const loginForm = page.locator('form');
    const formCount = await loginForm.count();
    console.log('폼 개수:', formCount);

    if (formCount > 0) {
      // 첫 번째 폼 분석
      const form = loginForm.first();
      const formAction = await form.getAttribute('action');
      const formMethod = await form.getAttribute('method');
      console.log('폼 액션:', formAction);
      console.log('폼 메서드:', formMethod);

      // 폼 내부 요소들 스크린샷
      await form.screenshot({ path: 'tests/screenshots/login-form.png' });
    }
  });

  test('입력 필드 식별 및 분석', async ({ page }) => {
    // 모든 입력 필드 찾기
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    console.log('입력 필드 개수:', inputCount);

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      const placeholder = await input.getAttribute('placeholder');
      const required = await input.getAttribute('required');
      const autocomplete = await input.getAttribute('autocomplete');

      console.log(`입력 필드 ${i + 1}:`, {
        type,
        name,
        id,
        placeholder,
        required: required !== null,
        autocomplete
      });
    }

    // 라벨 확인
    const labels = page.locator('label');
    const labelCount = await labels.count();
    console.log('라벨 개수:', labelCount);

    for (let i = 0; i < labelCount; i++) {
      const label = labels.nth(i);
      const text = await label.textContent();
      const htmlFor = await label.getAttribute('for');
      console.log(`라벨 ${i + 1}:`, { text: text?.trim(), htmlFor });
    }
  });

  test('버튼 및 상호작용 요소 확인', async ({ page }) => {
    // 모든 버튼 찾기
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log('버튼 개수:', buttonCount);

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const type = await button.getAttribute('type');
      const disabled = await button.getAttribute('disabled');
      const className = await button.getAttribute('class');

      console.log(`버튼 ${i + 1}:`, {
        text: text?.trim(),
        type,
        disabled: disabled !== null,
        className
      });
    }

    // 링크 확인
    const links = page.locator('a');
    const linkCount = await links.count();
    console.log('링크 개수:', linkCount);

    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const href = await link.getAttribute('href');

      console.log(`링크 ${i + 1}:`, {
        text: text?.trim(),
        href
      });
    }
  });

  test('유효성 검증 메시지 영역 확인', async ({ page }) => {
    // 에러 메시지 관련 요소들 찾기
    const errorElements = await page.locator('[class*="error"], [class*="invalid"], [role="alert"], .text-red, .text-destructive').all();
    console.log('에러 메시지 관련 요소 개수:', errorElements.length);

    // 성공 메시지 관련 요소들
    const successElements = await page.locator('[class*="success"], [class*="valid"], .text-green, .text-sky').all();
    console.log('성공 메시지 관련 요소 개수:', successElements.length);

    // aria-describedby 확인
    const describedElements = await page.locator('[aria-describedby]').all();
    console.log('aria-describedby가 있는 요소 개수:', describedElements.length);

    for (const element of describedElements) {
      const describedBy = await element.getAttribute('aria-describedby');
      console.log('aria-describedby:', describedBy);
    }
  });

  test('페이지 UI 요소 및 레이아웃 분석', async ({ page }) => {
    // 헤더 확인
    const header = page.locator('header, [role="banner"], nav');
    const headerExists = await header.count() > 0;
    console.log('헤더 존재:', headerExists);

    // 로고 확인
    const logo = page.locator('img[alt*="logo"], img[alt*="Logo"], .logo, [class*="logo"]');
    const logoCount = await logo.count();
    console.log('로고 요소 개수:', logoCount);

    if (logoCount > 0) {
      const logoSrc = await logo.first().getAttribute('src');
      const logoAlt = await logo.first().getAttribute('alt');
      console.log('로고 정보:', { src: logoSrc, alt: logoAlt });
    }

    // 메인 컨텐츠 영역
    const main = page.locator('main, [role="main"], .main-content');
    const mainExists = await main.count() > 0;
    console.log('메인 컨텐츠 영역 존재:', mainExists);

    // 푸터 확인
    const footer = page.locator('footer, [role="contentinfo"]');
    const footerExists = await footer.count() > 0;
    console.log('푸터 존재:', footerExists);

    // 전체 페이지 구조 스크린샷
    await page.screenshot({ path: 'tests/screenshots/page-layout.png', fullPage: true });
  });

  test('반응형 및 접근성 요소 확인', async ({ page }) => {
    // 뷰포트 크기별 테스트
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500); // 레이아웃 안정화 대기

      // 각 화면 크기별 스크린샷
      await page.screenshot({
        path: `tests/screenshots/login-${viewport.name}.png`,
        fullPage: true
      });

      console.log(`${viewport.name} 뷰포트 (${viewport.width}x${viewport.height}) 스크린샷 저장됨`);
    }

    // 기본 뷰포트로 복원
    await page.setViewportSize({ width: 1280, height: 720 });

    // 접근성 관련 속성 확인
    const ariaElements = await page.locator('[aria-label], [aria-labelledby], [aria-describedby], [role]').all();
    console.log('접근성 속성이 있는 요소 개수:', ariaElements.length);

    // 탭 인덱스 확인
    const focusableElements = await page.locator('[tabindex], input, button, a, select, textarea').all();
    console.log('포커스 가능한 요소 개수:', focusableElements.length);
  });

  test('페이지 로딩 상태 확인', async ({ page }) => {
    // 네트워크 활동 모니터링
    page.on('request', request => {
      console.log('요청:', request.method(), request.url());
    });

    page.on('response', response => {
      console.log('응답:', response.status(), response.url());
    });

    // 페이지 새로고침으로 로딩 상태 확인
    await page.reload({ waitUntil: 'networkidle' });

    // 로딩 스피너나 스켈레톤 UI 확인
    const loadingElements = page.locator('[class*="loading"], [class*="spinner"], [class*="skeleton"]');
    const loadingCount = await loadingElements.count();
    console.log('로딩 관련 요소 개수:', loadingCount);

    // JavaScript 에러 확인
    page.on('pageerror', error => {
      console.log('JavaScript 에러:', error.message);
    });

    // 콘솔 메시지 확인
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('콘솔 에러:', msg.text());
      }
    });
  });
});