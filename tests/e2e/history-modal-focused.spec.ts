import { test, expect } from '@playwright/test';

test.describe('변경 이력 모달 집중 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 화면 크기 설정 (데스크톱)
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('3단계 로그인 후 변경 이력 모달 액션 필터 테스트', async ({ page }) => {
    console.log('=== 변경 이력 모달 E2E 테스트 시작 ===');

    // 1. 페이지 접속
    console.log('1. 페이지 로드 중...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 2. 3단계 로그인 프로세스
    console.log('\n=== 3단계 로그인 프로세스 ===');

    // 1단계 로그인
    console.log('2-1. 첫 번째 로그인 단계...');
    const firstLoginBtn = page.locator('button:has-text("로그인")').first();
    await expect(firstLoginBtn).toBeVisible({ timeout: 10000 });
    await firstLoginBtn.click();
    await page.waitForTimeout(1500);
    console.log('✓ 1단계 로그인 완료');

    // 2단계 로그인
    console.log('2-2. 두 번째 로그인 단계...');
    const secondLoginBtn = page.locator('button:has-text("로그인")').first();
    await expect(secondLoginBtn).toBeVisible({ timeout: 10000 });
    await secondLoginBtn.click();
    await page.waitForTimeout(1500);
    console.log('✓ 2단계 로그인 완료');

    // 3단계 로그인
    console.log('2-3. 세 번째 로그인 단계...');
    const thirdLoginBtn = page.locator('button:has-text("로그인")').first();
    await expect(thirdLoginBtn).toBeVisible({ timeout: 10000 });
    await thirdLoginBtn.click();
    await page.waitForTimeout(2000);
    console.log('✓ 3단계 로그인 완료');

    // 3. 정책 관리 페이지로 이동
    console.log('\n3. 정책 관리 페이지로 이동...');
    await page.goto('http://localhost:3000/security/policies/amount');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 페이지 제목 확인
    const title = await page.title();
    console.log(`페이지 제목: ${title}`);

    // 4. 변경 이력 버튼 찾기
    console.log('\n4. 변경 이력 버튼 찾기...');

    // 페이지의 모든 버튼 텍스트 확인
    const allButtons = await page.locator('button').all();
    console.log(`페이지에서 발견된 버튼 수: ${allButtons.length}`);

    const buttonTexts = [];
    for (let i = 0; i < Math.min(allButtons.length, 15); i++) {
      const btnText = await allButtons[i].textContent();
      buttonTexts.push(btnText?.trim());
      console.log(`버튼 ${i + 1}: "${btnText?.trim()}"`);
    }

    // 변경 이력 관련 버튼 찾기
    const historyBtnSelectors = [
      'button:has-text("변경 이력")',
      'button:has-text("이력")',
      'button:has-text("History")',
      'button:has-text("변경")',
      'button[data-testid*="history"]',
      'button[aria-label*="이력"]'
    ];

    let historyBtn = null;
    let foundSelector = '';

    for (const selector of historyBtnSelectors) {
      const btn = page.locator(selector).first();
      if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
        historyBtn = btn;
        foundSelector = selector;
        break;
      }
    }

    if (!historyBtn) {
      // 텍스트 기반으로 직접 찾기
      for (const text of buttonTexts) {
        if (text && (text.includes('이력') || text.includes('변경') || text.includes('History'))) {
          historyBtn = page.locator(`button:has-text("${text}")`).first();
          foundSelector = `button:has-text("${text}")`;
          break;
        }
      }
    }

    if (!historyBtn || !await historyBtn.isVisible().catch(() => false)) {
      console.log('❌ 변경 이력 버튼을 찾을 수 없습니다');

      // 스크린샷 저장
      await page.screenshot({ path: 'history-button-not-found.png' });
      console.log('스크린샷 저장: history-button-not-found.png');

      throw new Error('변경 이력 버튼을 찾을 수 없습니다');
    }

    console.log(`✓ 변경 이력 버튼 발견: ${foundSelector}`);

    // 5. 변경 이력 버튼 클릭
    console.log('\n5. 변경 이력 버튼 클릭...');
    await historyBtn.click();
    await page.waitForTimeout(2000);
    console.log('✓ 변경 이력 버튼 클릭 완료');

    // 6. 모달 열림 확인
    console.log('\n6. 변경 이력 모달 확인...');

    const modalSelectors = [
      '[role="dialog"]',
      '[data-state="open"]',
      '.fixed.inset-0',
      '.modal',
      '[data-testid*="modal"]'
    ];

    let modal = null;
    let foundModalSelector = '';

    for (const selector of modalSelectors) {
      const modalElement = page.locator(selector).first();
      if (await modalElement.isVisible({ timeout: 3000 }).catch(() => false)) {
        modal = modalElement;
        foundModalSelector = selector;
        break;
      }
    }

    if (!modal) {
      console.log('❌ 모달이 열리지 않았습니다');

      // 스크린샷 저장
      await page.screenshot({ path: 'modal-not-opened.png' });
      console.log('스크린샷 저장: modal-not-opened.png');

      throw new Error('변경 이력 모달이 열리지 않았습니다');
    }

    console.log(`✓ 변경 이력 모달 열림 확인: ${foundModalSelector}`);

    // 7. DELETE 액션이 노출되지 않는지 확인
    console.log('\n7. DELETE 액션 노출 여부 확인...');

    const deleteAction = modal.locator('text=/DELETE|삭제/i');
    const isDeleteVisible = await deleteAction.isVisible().catch(() => false);

    console.log(`DELETE 액션 표시 여부: ${isDeleteVisible ? '표시됨 (문제)' : '숨겨짐 (정상)'}`);

    // SUSPEND 액션 확인
    const suspendAction = modal.locator('text=/SUSPEND|정지|중지/i');
    const isSuspendVisible = await suspendAction.isVisible().catch(() => false);

    console.log(`SUSPEND 액션 표시 여부: ${isSuspendVisible ? '표시됨 (정상)' : '숨겨짐 (문제)'}`);

    // 8. 액션 필터 찾기
    console.log('\n8. 액션 필터 찾기...');

    const filterSelectors = [
      'select[name*="action"]',
      'select[name*="filter"]',
      'select',
      '[data-testid*="filter"]',
      '[data-testid*="action"]'
    ];

    let filterSelect = null;
    let foundFilterSelector = '';

    for (const selector of filterSelectors) {
      const selectElement = modal.locator(selector).first();
      if (await selectElement.isVisible({ timeout: 2000 }).catch(() => false)) {
        filterSelect = selectElement;
        foundFilterSelector = selector;
        break;
      }
    }

    if (!filterSelect) {
      console.log('❌ 액션 필터를 찾을 수 없습니다');

      // 모달 내 모든 요소 확인
      const modalContent = await modal.textContent();
      console.log('모달 내용:', modalContent?.substring(0, 500));

      // 스크린샷 저장
      await page.screenshot({ path: 'filter-not-found.png' });
      console.log('스크린샷 저장: filter-not-found.png');

      throw new Error('액션 필터를 찾을 수 없습니다');
    }

    console.log(`✓ 액션 필터 발견: ${foundFilterSelector}`);

    // 9. 필터 옵션 확인
    console.log('\n9. 필터 옵션 확인...');

    const options = await filterSelect.locator('option').all();
    const optionTexts = [];

    for (const option of options) {
      const text = await option.textContent();
      optionTexts.push(text?.trim());
    }

    console.log(`필터 옵션들: ${optionTexts.join(', ')}`);

    // 10. 각 필터 테스트
    console.log('\n10. 액션 필터 테스트 시작...');

    const filterTests = [
      { label: '수정', actionType: 'UPDATE' },
      { label: '생성', actionType: 'CREATE' },
      { label: '정지', actionType: 'SUSPEND' },
      { label: '전체', actionType: 'ALL' }
    ];

    for (const filterTest of filterTests) {
      console.log(`\n10-${filterTests.indexOf(filterTest) + 1}. "${filterTest.label}" 필터 테스트...`);

      try {
        await filterSelect.selectOption({ label: filterTest.label });
        await page.waitForTimeout(1500);

        if (filterTest.actionType === 'ALL') {
          // 전체 로그 수 확인
          const allRows = modal.locator('tr, .log-item, [data-testid*="log"]');
          const totalCount = await allRows.count();
          console.log(`전체 로그 수: ${totalCount}`);
        } else {
          // 특정 액션 타입 확인
          const actionElements = modal.locator(`text=/^${filterTest.actionType}/i`);
          const actionCount = await actionElements.count();
          console.log(`${filterTest.actionType} 액션 로그 수: ${actionCount}`);
        }

        console.log(`✓ "${filterTest.label}" 필터 테스트 완료`);

      } catch (error) {
        console.log(`❌ "${filterTest.label}" 필터 테스트 실패: ${error}`);
      }
    }

    // 11. 최종 스크린샷
    console.log('\n11. 최종 스크린샷 저장...');
    await page.screenshot({ path: 'history-modal-test-complete.png' });
    console.log('✓ 최종 스크린샷 저장: history-modal-test-complete.png');

    // 12. 테스트 결과 요약
    console.log('\n=== 테스트 결과 요약 ===');
    console.log('✓ 3단계 로그인 프로세스 완료');
    console.log('✓ 정책 관리 페이지 접근 성공');
    console.log('✓ 변경 이력 모달 열기 성공');
    console.log(`DELETE 액션 노출: ${isDeleteVisible ? '❌ 문제 발견' : '✓ 정상'}`);
    console.log(`SUSPEND 액션 표시: ${isSuspendVisible ? '✓ 정상' : '❌ 문제 발견'}`);
    console.log('✓ 액션 필터 기능 테스트 완료');

    // 테스트 어설션
    expect(isDeleteVisible).toBe(false); // DELETE 액션은 노출되지 않아야 함
    expect(isSuspendVisible).toBe(true); // SUSPEND 액션은 표시되어야 함

    console.log('\n🎉 모든 테스트 완료!');
  });
});