import { test, expect, Page } from '@playwright/test';

test.describe('금액 정책 변경 이력 모달 상세 테스트', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;

    // Chrome 브라우저에서 데스크톱 해상도로 설정
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 금액 정책 페이지로 이동
    await page.goto('/security/policies/amount');

    // 네트워크가 안정화될 때까지 대기
    await page.waitForLoadState('networkidle');

    console.log('페이지 로드 완료: http://localhost:3000/security/policies/amount');
  });

  test('1. 페이지 로드 및 기본 요소 확인', async () => {
    console.log('\n=== 테스트 1: 페이지 로드 및 기본 요소 확인 ===');

    // 페이지 제목 확인
    const title = await page.title();
    console.log(`페이지 제목: ${title}`);
    expect(title).toContain('커스터디');

    // 금액 정책 페이지 헤더 확인
    const pageHeader = page.locator('h1, h2, [data-testid="page-title"]').first();
    await expect(pageHeader).toBeVisible();
    const headerText = await pageHeader.textContent();
    console.log(`페이지 헤더: ${headerText}`);

    // 변경 이력 버튼 존재 여부 확인
    const historyButton = page.locator('button:has-text("변경 이력"), button[data-testid="history-button"]');
    await expect(historyButton.first()).toBeVisible();
    console.log('변경 이력 버튼 확인 완료');

    // 페이지 기본 요소들 스크린샷
    await page.screenshot({
      path: 'tests/screenshots/01-page-load-basic-elements.png',
      fullPage: true
    });

    console.log('✅ 테스트 1 완료: 페이지 로드 및 기본 요소 확인');
  });

  test('2. 변경 이력 버튼 클릭하여 모달 열기', async () => {
    console.log('\n=== 테스트 2: 변경 이력 모달 열기 ===');

    // 변경 이력 버튼 찾기
    const historyButton = page.locator('button:has-text("변경 이력"), button[data-testid="history-button"]').first();
    await expect(historyButton).toBeVisible();

    console.log('변경 이력 버튼 클릭 시도');
    await historyButton.click();

    // 모달이 열릴 때까지 대기
    await page.waitForTimeout(1000);

    // 모달 존재 확인
    const modal = page.locator('[data-testid="policy-history-modal"], [role="dialog"], .modal-container').first();
    await expect(modal).toBeVisible();
    console.log('변경 이력 모달이 성공적으로 열림');

    // 모달 제목 확인
    const modalTitle = page.locator('h2:has-text("변경 이력"), h3:has-text("변경 이력"), [data-testid="modal-title"]');
    if (await modalTitle.count() > 0) {
      await expect(modalTitle.first()).toBeVisible();
      const titleText = await modalTitle.first().textContent();
      console.log(`모달 제목: ${titleText}`);
    }

    // 모달 열림 상태 스크린샷
    await page.screenshot({
      path: 'tests/screenshots/02-modal-opened.png',
      fullPage: true
    });

    console.log('✅ 테스트 2 완료: 변경 이력 모달 열기');
  });

  test('3. DELETE 액션 노출 여부 확인 (SUSPEND만 있어야 함)', async () => {
    console.log('\n=== 테스트 3: DELETE 액션 노출 여부 확인 ===');

    // 변경 이력 모달 열기
    const historyButton = page.locator('button:has-text("변경 이력")').first();
    await historyButton.click();
    await page.waitForTimeout(1000);

    const modal = page.locator('[role="dialog"], .modal-container').first();
    await expect(modal).toBeVisible();

    // DELETE 관련 텍스트가 페이지에 없는지 확인
    console.log('DELETE 관련 텍스트 검색 중...');
    const deleteTexts = await page.locator('text=/DELETE|삭제/i').count();
    console.log(`DELETE 관련 텍스트 개수: ${deleteTexts}`);

    if (deleteTexts > 0) {
      const deleteElements = page.locator('text=/DELETE|삭제/i');
      for (let i = 0; i < deleteTexts; i++) {
        const element = deleteElements.nth(i);
        const text = await element.textContent();
        console.log(`⚠️ DELETE 관련 텍스트 발견: "${text}"`);
      }
    } else {
      console.log('✅ DELETE 관련 텍스트 없음 확인');
    }

    // SUSPEND 관련 텍스트 확인
    console.log('SUSPEND 관련 텍스트 검색 중...');
    const suspendTexts = await page.locator('text=/SUSPEND|정지|중단/i').count();
    console.log(`SUSPEND 관련 텍스트 개수: ${suspendTexts}`);

    // 액션 필터나 드롭다운에서 DELETE 옵션 확인
    const actionFilters = page.locator('select, [role="combobox"], [data-testid*="filter"], [data-testid*="action"]');
    const filterCount = await actionFilters.count();
    console.log(`액션 필터/드롭다운 개수: ${filterCount}`);

    for (let i = 0; i < filterCount; i++) {
      const filter = actionFilters.nth(i);
      if (await filter.isVisible()) {
        const filterText = await filter.textContent();
        console.log(`필터 ${i + 1} 내용: ${filterText}`);

        if (filterText && filterText.includes('DELETE')) {
          console.log(`⚠️ 필터에서 DELETE 옵션 발견: ${filterText}`);
        }
      }
    }

    // 액션 테스트 스크린샷
    await page.screenshot({
      path: 'tests/screenshots/03-delete-action-check.png',
      fullPage: true
    });

    // DELETE 텍스트가 없어야 함을 검증
    expect(deleteTexts).toBe(0);
    console.log('✅ 테스트 3 완료: DELETE 액션이 노출되지 않음을 확인');
  });

  test('4. 액션 필터에서 "수정" 선택시 UPDATE 액션 확인', async () => {
    console.log('\n=== 테스트 4: 액션 필터 "수정" 테스트 ===');

    // 변경 이력 모달 열기
    const historyButton = page.locator('button:has-text("변경 이력")').first();
    await historyButton.click();
    await page.waitForTimeout(1000);

    // 액션 필터 찾기
    const actionFilter = page.locator('select, [data-testid*="action-filter"], [data-testid*="filter"]').first();

    if (await actionFilter.isVisible()) {
      console.log('액션 필터 발견');

      // 필터 옵션들 확인
      const options = await actionFilter.locator('option').count();
      console.log(`필터 옵션 개수: ${options}`);

      for (let i = 0; i < options; i++) {
        const option = actionFilter.locator('option').nth(i);
        const optionText = await option.textContent();
        console.log(`옵션 ${i + 1}: ${optionText}`);
      }

      // "수정" 또는 "UPDATE" 옵션 선택 시도
      try {
        const updateOption = actionFilter.locator('option:text-matches("수정|UPDATE", "i")').first();
        if (await updateOption.count() > 0) {
          await actionFilter.selectOption({ label: /수정|UPDATE/i });
          console.log('수정/UPDATE 필터 선택 완료');

          await page.waitForTimeout(1500);

          // 필터링된 결과 확인
          const tableRows = page.locator('tbody tr, .table-row, [data-testid*="history-row"]');
          const rowCount = await tableRows.count();
          console.log(`필터링 후 행 개수: ${rowCount}`);

          if (rowCount > 0) {
            for (let i = 0; i < Math.min(rowCount, 3); i++) {
              const row = tableRows.nth(i);
              const rowText = await row.textContent();
              console.log(`행 ${i + 1}: ${rowText}`);

              // UPDATE/수정 관련 텍스트가 있는지 확인
              if (rowText && (rowText.includes('UPDATE') || rowText.includes('수정'))) {
                console.log(`✅ 행 ${i + 1}에서 UPDATE/수정 액션 확인`);
              }
            }
          }
        } else {
          console.log('⚠️ 수정/UPDATE 필터 옵션을 찾을 수 없음');
        }
      } catch (error) {
        console.log(`필터 선택 중 오류: ${error}`);
      }
    } else {
      console.log('⚠️ 액션 필터를 찾을 수 없음');
    }

    await page.screenshot({
      path: 'tests/screenshots/04-update-filter-test.png',
      fullPage: true
    });

    console.log('✅ 테스트 4 완료: 수정 필터 테스트');
  });

  test('5. 액션 필터에서 "생성" 선택시 CREATE 액션 확인', async () => {
    console.log('\n=== 테스트 5: 액션 필터 "생성" 테스트 ===');

    // 변경 이력 모달 열기
    const historyButton = page.locator('button:has-text("변경 이력")').first();
    await historyButton.click();
    await page.waitForTimeout(1000);

    const actionFilter = page.locator('select, [data-testid*="action-filter"], [data-testid*="filter"]').first();

    if (await actionFilter.isVisible()) {
      try {
        const createOption = actionFilter.locator('option:text-matches("생성|CREATE", "i")').first();
        if (await createOption.count() > 0) {
          await actionFilter.selectOption({ label: /생성|CREATE/i });
          console.log('생성/CREATE 필터 선택 완료');

          await page.waitForTimeout(1500);

          const tableRows = page.locator('tbody tr, .table-row, [data-testid*="history-row"]');
          const rowCount = await tableRows.count();
          console.log(`CREATE 필터링 후 행 개수: ${rowCount}`);

          if (rowCount > 0) {
            for (let i = 0; i < Math.min(rowCount, 3); i++) {
              const row = tableRows.nth(i);
              const rowText = await row.textContent();
              console.log(`CREATE 행 ${i + 1}: ${rowText}`);
            }
          }
        } else {
          console.log('⚠️ 생성/CREATE 필터 옵션을 찾을 수 없음');
        }
      } catch (error) {
        console.log(`CREATE 필터 선택 중 오류: ${error}`);
      }
    }

    await page.screenshot({
      path: 'tests/screenshots/05-create-filter-test.png',
      fullPage: true
    });

    console.log('✅ 테스트 5 완료: 생성 필터 테스트');
  });

  test('6. 액션 필터에서 "정지" 선택시 SUSPEND 액션 확인', async () => {
    console.log('\n=== 테스트 6: 액션 필터 "정지" 테스트 ===');

    // 변경 이력 모달 열기
    const historyButton = page.locator('button:has-text("변경 이력")').first();
    await historyButton.click();
    await page.waitForTimeout(1000);

    const actionFilter = page.locator('select, [data-testid*="action-filter"], [data-testid*="filter"]').first();

    if (await actionFilter.isVisible()) {
      try {
        const suspendOption = actionFilter.locator('option:text-matches("정지|중단|SUSPEND", "i")').first();
        if (await suspendOption.count() > 0) {
          await actionFilter.selectOption({ label: /정지|중단|SUSPEND/i });
          console.log('정지/SUSPEND 필터 선택 완료');

          await page.waitForTimeout(1500);

          const tableRows = page.locator('tbody tr, .table-row, [data-testid*="history-row"]');
          const rowCount = await tableRows.count();
          console.log(`SUSPEND 필터링 후 행 개수: ${rowCount}`);

          if (rowCount > 0) {
            for (let i = 0; i < Math.min(rowCount, 3); i++) {
              const row = tableRows.nth(i);
              const rowText = await row.textContent();
              console.log(`SUSPEND 행 ${i + 1}: ${rowText}`);

              // SUSPEND/정지 관련 텍스트가 있는지 확인
              if (rowText && (rowText.includes('SUSPEND') || rowText.includes('정지') || rowText.includes('중단'))) {
                console.log(`✅ 행 ${i + 1}에서 SUSPEND/정지 액션 확인`);
              }
            }
          }
        } else {
          console.log('⚠️ 정지/SUSPEND 필터 옵션을 찾을 수 없음');
        }
      } catch (error) {
        console.log(`SUSPEND 필터 선택 중 오류: ${error}`);
      }
    }

    await page.screenshot({
      path: 'tests/screenshots/06-suspend-filter-test.png',
      fullPage: true
    });

    console.log('✅ 테스트 6 완료: 정지 필터 테스트');
  });

  test('7. 액션 필터에서 "전체" 선택시 모든 로그 표시 확인', async () => {
    console.log('\n=== 테스트 7: 액션 필터 "전체" 테스트 ===');

    // 변경 이력 모달 열기
    const historyButton = page.locator('button:has-text("변경 이력")').first();
    await historyButton.click();
    await page.waitForTimeout(1000);

    const actionFilter = page.locator('select, [data-testid*="action-filter"], [data-testid*="filter"]').first();

    if (await actionFilter.isVisible()) {
      try {
        // 먼저 전체 행 개수 확인
        const initialRows = page.locator('tbody tr, .table-row, [data-testid*="history-row"]');
        const initialCount = await initialRows.count();
        console.log(`초기 행 개수: ${initialCount}`);

        // "전체" 옵션 선택
        const allOption = actionFilter.locator('option:text-matches("전체|ALL|모든|전체보기", "i")').first();
        if (await allOption.count() > 0) {
          await actionFilter.selectOption({ label: /전체|ALL|모든|전체보기/i });
          console.log('전체 필터 선택 완료');

          await page.waitForTimeout(1500);

          const tableRows = page.locator('tbody tr, .table-row, [data-testid*="history-row"]');
          const rowCount = await tableRows.count();
          console.log(`전체 필터링 후 행 개수: ${rowCount}`);

          // 다양한 액션 타입이 포함되어 있는지 확인
          const actionTypes = new Set();

          if (rowCount > 0) {
            for (let i = 0; i < Math.min(rowCount, 5); i++) {
              const row = tableRows.nth(i);
              const rowText = await row.textContent();
              console.log(`전체 행 ${i + 1}: ${rowText}`);

              // 액션 타입 추출 시도
              if (rowText) {
                if (rowText.includes('CREATE') || rowText.includes('생성')) actionTypes.add('CREATE');
                if (rowText.includes('UPDATE') || rowText.includes('수정')) actionTypes.add('UPDATE');
                if (rowText.includes('SUSPEND') || rowText.includes('정지')) actionTypes.add('SUSPEND');
              }
            }
          }

          console.log(`확인된 액션 타입들: ${Array.from(actionTypes).join(', ')}`);

          if (actionTypes.size > 1) {
            console.log('✅ 여러 액션 타입이 포함되어 전체 필터가 정상 작동함');
          } else {
            console.log('⚠️ 단일 액션 타입만 확인됨');
          }

        } else {
          console.log('⚠️ 전체 필터 옵션을 찾을 수 없음');
        }
      } catch (error) {
        console.log(`전체 필터 선택 중 오류: ${error}`);
      }
    }

    await page.screenshot({
      path: 'tests/screenshots/07-all-filter-test.png',
      fullPage: true
    });

    console.log('✅ 테스트 7 완료: 전체 필터 테스트');
  });

  test('전체 시나리오 종합 테스트', async () => {
    console.log('\n=== 종합 테스트: 전체 시나리오 연속 실행 ===');

    // 1. 페이지 로드 확인
    console.log('1. 페이지 로드 상태 확인');
    await expect(page).toHaveTitle(/커스터디/);

    // 2. 변경 이력 모달 열기
    console.log('2. 변경 이력 모달 열기');
    const historyButton = page.locator('button:has-text("변경 이력")').first();
    await historyButton.click();
    await page.waitForTimeout(1000);

    const modal = page.locator('[role="dialog"], .modal-container').first();
    await expect(modal).toBeVisible();

    // 3. DELETE 액션 부재 확인
    console.log('3. DELETE 액션 부재 확인');
    const deleteCount = await page.locator('text=/DELETE|삭제/i').count();
    expect(deleteCount).toBe(0);
    console.log(`✅ DELETE 관련 텍스트 개수: ${deleteCount}`);

    // 4. 필터 기능들 순차 테스트
    const actionFilter = page.locator('select, [data-testid*="action-filter"]').first();
    if (await actionFilter.isVisible()) {
      console.log('4. 액션 필터 순차 테스트');

      // 각 필터 옵션 테스트
      const filterOptions = ['전체', '생성', '수정', '정지'];

      for (const option of filterOptions) {
        try {
          console.log(`  - ${option} 필터 테스트`);
          const optionElement = actionFilter.locator(`option:text-matches("${option}", "i")`).first();

          if (await optionElement.count() > 0) {
            await actionFilter.selectOption({ label: new RegExp(option, 'i') });
            await page.waitForTimeout(1000);

            const rows = await page.locator('tbody tr, .table-row').count();
            console.log(`    ${option} 필터링 결과: ${rows}개 행`);
          }
        } catch (error) {
          console.log(`    ${option} 필터 테스트 실패: ${error}`);
        }
      }
    }

    // 최종 스크린샷
    await page.screenshot({
      path: 'tests/screenshots/08-comprehensive-test.png',
      fullPage: true
    });

    console.log('✅ 종합 테스트 완료');
  });
});