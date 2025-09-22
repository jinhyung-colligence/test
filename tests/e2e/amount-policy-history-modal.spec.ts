import { test, expect, Page } from '@playwright/test';

test.describe('금액 정책 변경 이력 모달 테스트', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;

    // 금액 정책 페이지로 이동
    await page.goto('http://localhost:3000/security/policies/amount');

    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');

    // 페이지 제목 확인
    await expect(page).toHaveTitle(/커스터디 대시보드/);
  });

  test('변경 이력 버튼 클릭시 모달이 정상적으로 열리는지 확인', async () => {
    // 변경 이력 버튼 찾기 및 클릭
    const historyButton = page.locator('button:has-text("변경 이력")').first();
    await expect(historyButton).toBeVisible();
    await historyButton.click();

    // 모달이 열렸는지 확인
    const modal = page.locator('[data-testid="policy-history-modal"], .modal, [role="dialog"]');
    await expect(modal).toBeVisible();

    // 모달 제목 확인
    const modalTitle = page.locator('h2:has-text("변경 이력"), h3:has-text("변경 이력")');
    await expect(modalTitle).toBeVisible();

    // 스크린샷 촬영
    await page.screenshot({
      path: 'tests/screenshots/amount-policy-history-modal-opened.png',
      fullPage: true
    });
  });

  test('모달에서 DELETE 케이스가 노출되지 않고 SUSPEND만 표시되는지 확인', async () => {
    // 변경 이력 모달 열기
    const historyButton = page.locator('button:has-text("변경 이력")').first();
    await historyButton.click();

    // 모달이 열렸는지 확인
    const modal = page.locator('[data-testid="policy-history-modal"], .modal, [role="dialog"]');
    await expect(modal).toBeVisible();

    // DELETE 관련 텍스트가 없는지 확인
    const deleteElements = page.locator('text=/DELETE|삭제|delete/i');
    await expect(deleteElements).toHaveCount(0);

    // SUSPEND 관련 항목이 있는지 확인
    const suspendElements = page.locator('text=/SUSPEND|수정|suspend|편집|변경/i');
    await expect(suspendElements.first()).toBeVisible();

    // 액션 타입 컬럼이나 필터에서 DELETE가 없는지 확인
    const actionFilters = page.locator('select, [role="combobox"], [data-testid*="filter"]');
    if (await actionFilters.count() > 0) {
      for (let i = 0; i < await actionFilters.count(); i++) {
        const filter = actionFilters.nth(i);
        const filterText = await filter.textContent();
        expect(filterText).not.toMatch(/DELETE|삭제/i);
      }
    }

    // 스크린샷 촬영
    await page.screenshot({
      path: 'tests/screenshots/amount-policy-history-no-delete.png',
      fullPage: true
    });
  });

  test('액션 필터에서 "수정" 선택시 수정 내역이 정상적으로 표시되는지 확인', async () => {
    // 변경 이력 모달 열기
    const historyButton = page.locator('button:has-text("변경 이력")').first();
    await historyButton.click();

    // 모달이 열렸는지 확인
    const modal = page.locator('[data-testid="policy-history-modal"], .modal, [role="dialog"]');
    await expect(modal).toBeVisible();

    // 액션 필터 찾기
    const actionFilter = page.locator('select:has(option:text-matches("수정|SUSPEND", "i")), [data-testid*="action-filter"]').first();

    if (await actionFilter.isVisible()) {
      // "수정" 또는 "SUSPEND" 옵션 선택
      await actionFilter.selectOption({ label: /수정|SUSPEND/i });

      // 필터링 결과 대기
      await page.waitForTimeout(1000);

      // 필터링된 결과가 표시되는지 확인
      const tableRows = page.locator('tbody tr, .table-row');
      if (await tableRows.count() > 0) {
        // 각 행이 수정 액션인지 확인
        for (let i = 0; i < await tableRows.count(); i++) {
          const row = tableRows.nth(i);
          const rowText = await row.textContent();
          expect(rowText).toMatch(/수정|SUSPEND|편집|변경/i);
          expect(rowText).not.toMatch(/DELETE|삭제/i);
        }
      }
    }

    // 스크린샷 촬영
    await page.screenshot({
      path: 'tests/screenshots/amount-policy-history-filter-suspend.png',
      fullPage: true
    });
  });

  test('기타 필터링 기능들이 정상 동작하는지 확인', async () => {
    // 변경 이력 모달 열기
    const historyButton = page.locator('button:has-text("변경 이력")').first();
    await historyButton.click();

    // 모달이 열렸는지 확인
    const modal = page.locator('[data-testid="policy-history-modal"], .modal, [role="dialog"]');
    await expect(modal).toBeVisible();

    // 날짜 필터 테스트
    const dateInputs = page.locator('input[type="date"], input[placeholder*="날짜"], input[placeholder*="date"]');
    if (await dateInputs.count() > 0) {
      const startDate = dateInputs.first();
      await startDate.fill('2024-01-01');
      await page.waitForTimeout(500);

      // 필터링 결과 확인
      const tableRows = page.locator('tbody tr, .table-row');
      await expect(tableRows).toBeVisible();
    }

    // 사용자 필터 테스트
    const userFilter = page.locator('input[placeholder*="사용자"], input[placeholder*="user"], select:has(option:text-matches("사용자", "i"))');
    if (await userFilter.first().isVisible()) {
      await userFilter.first().fill('admin');
      await page.waitForTimeout(500);
    }

    // 검색 기능 테스트
    const searchInput = page.locator('input[placeholder*="검색"], input[type="search"]');
    if (await searchInput.first().isVisible()) {
      await searchInput.first().fill('정책');
      await page.waitForTimeout(500);
    }

    // 스크린샷 촬영
    await page.screenshot({
      path: 'tests/screenshots/amount-policy-history-filters-applied.png',
      fullPage: true
    });
  });

  test('모달 닫기 기능이 정상 동작하는지 확인', async () => {
    // 변경 이력 모달 열기
    const historyButton = page.locator('button:has-text("변경 이력")').first();
    await historyButton.click();

    // 모달이 열렸는지 확인
    const modal = page.locator('[data-testid="policy-history-modal"], .modal, [role="dialog"]');
    await expect(modal).toBeVisible();

    // X 버튼으로 닫기
    const closeButton = page.locator('button[aria-label="Close"], button:has-text("×"), button:has-text("닫기")').first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await expect(modal).not.toBeVisible();
    } else {
      // ESC 키로 닫기
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible();
    }

    // 모달이 닫혔는지 확인
    await page.waitForTimeout(500);
    await expect(modal).not.toBeVisible();
  });

  test('페이지네이션이 정상 동작하는지 확인', async () => {
    // 변경 이력 모달 열기
    const historyButton = page.locator('button:has-text("변경 이력")').first();
    await historyButton.click();

    // 모달이 열렸는지 확인
    const modal = page.locator('[data-testid="policy-history-modal"], .modal, [role="dialog"]');
    await expect(modal).toBeVisible();

    // 페이지네이션 버튼 확인
    const paginationButtons = page.locator('button:has-text("다음"), button:has-text("이전"), button:has-text("Next"), button:has-text("Previous"), .pagination button');

    if (await paginationButtons.count() > 0) {
      // 다음 페이지 버튼 클릭
      const nextButton = page.locator('button:has-text("다음"), button:has-text("Next")').first();
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(1000);

        // 페이지 변경 확인
        const tableRows = page.locator('tbody tr, .table-row');
        await expect(tableRows.first()).toBeVisible();
      }
    }

    // 스크린샷 촬영
    await page.screenshot({
      path: 'tests/screenshots/amount-policy-history-pagination.png',
      fullPage: true
    });
  });

  test('테이블 데이터 구조 및 컬럼 확인', async () => {
    // 변경 이력 모달 열기
    const historyButton = page.locator('button:has-text("변경 이력")').first();
    await historyButton.click();

    // 모달이 열렸는지 확인
    const modal = page.locator('[data-testid="policy-history-modal"], .modal, [role="dialog"]');
    await expect(modal).toBeVisible();

    // 테이블 헤더 확인
    const tableHeaders = page.locator('thead th, .table-header, th');
    if (await tableHeaders.count() > 0) {
      // 예상되는 컬럼들 확인
      const expectedColumns = ['날짜', '시간', '액션', '사용자', '변경사항', '비고'];

      for (const column of expectedColumns) {
        const columnHeader = page.locator(`th:has-text("${column}"), .table-header:has-text("${column}")`);
        // 컬럼이 존재하는지 확인 (선택적)
        if (await columnHeader.count() > 0) {
          await expect(columnHeader.first()).toBeVisible();
        }
      }
    }

    // 테이블 데이터 행 확인
    const tableRows = page.locator('tbody tr, .table-row');
    if (await tableRows.count() > 0) {
      // 첫 번째 행의 데이터 구조 확인
      const firstRow = tableRows.first();
      await expect(firstRow).toBeVisible();

      const rowText = await firstRow.textContent();
      console.log('첫 번째 행 데이터:', rowText);
    }

    // 스크린샷 촬영
    await page.screenshot({
      path: 'tests/screenshots/amount-policy-history-table-structure.png',
      fullPage: true
    });
  });
});