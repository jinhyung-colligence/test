import { useState, useEffect } from "react";
import { CryptoCurrency } from "@/types/groups";

interface BudgetSetupFormProps {
  currency: CryptoCurrency;
  year: number;
  onCreateBudgetSetup: (
    baseType: 'yearly' | 'quarterly' | 'monthly',
    baseAmount: number,
    selectedQuarter?: number,
    selectedMonth?: number
  ) => void;
  className?: string;
}

export default function BudgetSetupForm({
  currency,
  year,
  onCreateBudgetSetup,
  className = ""
}: BudgetSetupFormProps) {
  const [baseType, setBaseType] = useState<'yearly' | 'quarterly' | 'monthly'>('yearly');
  const [baseAmountStr, setBaseAmountStr] = useState<string>('');

  // 현재 날짜 기준으로 남은 분기와 월 계산
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;
  const currentMonth = currentDate.getMonth() + 1;

  // 남은 분기 계산 - 현재 연도일 때 현재 분기부터, 미래 연도일 때 전체
  const availableQuarters = year === currentYear
    ? Array.from({ length: 4 - currentQuarter + 1 }, (_, i) => currentQuarter + i)
    : year > currentYear
      ? [1, 2, 3, 4]
      : []; // 과거 연도는 선택 불가

  // 남은 월 계산 - 현재 연도일 때 현재 월부터, 미래 연도일 때 전체
  const availableMonths = year === currentYear
    ? Array.from({ length: 12 - currentMonth + 1 }, (_, i) => currentMonth + i)
    : year > currentYear
      ? Array.from({ length: 12 }, (_, i) => i + 1)
      : []; // 과거 연도는 선택 불가

  const [selectedQuarter, setSelectedQuarter] = useState<number>(currentQuarter);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

  const baseAmount = baseAmountStr === '' ? 0 : Number(baseAmountStr);

  // year가 변경될 때만 선택된 분기와 월을 첫 번째 가능한 값으로 리셋
  useEffect(() => {
    if (availableQuarters.length > 0) {
      setSelectedQuarter(availableQuarters[0]);
    }
    if (availableMonths.length > 0) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [year, availableQuarters, availableMonths]);

  const handleAmountChange = (value: string) => {
    // 숫자와 빈 문자열만 허용
    if (value === '' || /^\d+$/.test(value)) {
      setBaseAmountStr(value);
    }
  };

  const handleSubmit = () => {
    if (baseAmount <= 0) {
      alert("예산 금액을 입력해주세요.");
      return;
    }

    // 선택 가능한 기간이 있는지 확인
    if (baseType === 'quarterly' && availableQuarters.length === 0) {
      alert("선택 가능한 분기가 없습니다.");
      return;
    }

    if (baseType === 'monthly' && availableMonths.length === 0) {
      alert("선택 가능한 월이 없습니다.");
      return;
    }

    onCreateBudgetSetup(
      baseType,
      baseAmount,
      baseType === 'quarterly' ? selectedQuarter : undefined,
      baseType === 'monthly' ? selectedMonth : undefined
    );
  };

  // 버튼 활성화 조건
  const isButtonDisabled = () => {
    if (baseAmount <= 0) return true;
    if (baseType === 'quarterly' && availableQuarters.length === 0) return true;
    if (baseType === 'monthly' && availableMonths.length === 0) return true;
    return false;
  };

  const getQuarterName = (quarter: number) => `${quarter}분기`;
  const getMonthName = (month: number) => `${month}월`;

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          예산 기준 선택 *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'yearly' as const, label: '연간 기준' },
            { value: 'quarterly' as const, label: '분기 기준' },
            { value: 'monthly' as const, label: '월간 기준' }
          ].map((option) => (
            <label key={option.value} className="cursor-pointer">
              <input
                type="radio"
                name="baseType"
                value={option.value}
                checked={baseType === option.value}
                onChange={(e) => setBaseType(e.target.value as typeof baseType)}
                className="sr-only"
              />
              <div className={`p-3 border-2 rounded-lg text-center transition-colors ${
                baseType === option.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="text-sm font-medium">{option.label}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 분기/월 선택 */}
      {baseType === 'quarterly' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            분기 선택 *
          </label>
          {availableQuarters.length > 0 ? (
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {availableQuarters.map((quarter) => (
                <option key={quarter} value={quarter}>
                  {getQuarterName(quarter)}
                </option>
              ))}
            </select>
          ) : (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
              선택 가능한 분기가 없습니다.
            </div>
          )}
        </div>
      )}

      {baseType === 'monthly' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            월 선택 *
          </label>
          {availableMonths.length > 0 ? (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {getMonthName(month)}
                </option>
              ))}
            </select>
          ) : (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
              선택 가능한 월이 없습니다.
            </div>
          )}
        </div>
      )}

      {/* 예산 금액 입력 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {baseType === 'yearly' ? '연간' : baseType === 'quarterly' ? '분기' : '월간'} 예산 금액 *
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={baseAmountStr}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="예산 금액을 입력하세요"
            inputMode="numeric"
          />
          <div className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-700 font-medium">
            {currency}
          </div>
        </div>
      </div>

      {/* 설명 */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <div className="text-sm text-blue-700">
          {baseType === 'yearly' && `${year}년 연간 예산을 설정하면 현재 시점부터 남은 분기와 월별로 자동 분배됩니다.`}
          {baseType === 'quarterly' && `${year}년 분기 예산을 설정하면 해당 분기의 남은 월별로 자동 분배됩니다.`}
          {baseType === 'monthly' && `${year}년 선택한 월의 예산만 설정됩니다.`}
        </div>
      </div>

      {/* 예산 생성 버튼 */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isButtonDisabled()}
        className={`w-full px-4 py-2 rounded-lg transition-colors ${
          isButtonDisabled()
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-primary-600 text-white hover:bg-primary-700'
        }`}
      >
        예산 생성
      </button>
    </div>
  );
}