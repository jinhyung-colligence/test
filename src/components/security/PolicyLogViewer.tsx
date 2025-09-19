"use client";

import React, { useState, useEffect } from 'react';
import {
  PolicyLog,
  PolicyLogFilter,
  PolicyLogSummary
} from '@/types/policyLog';
import {
  getPolicyLogs,
  getFilteredPolicyLogs,
  getPolicyLogSummary,
  downloadLogsAsCSV
} from '@/utils/policyLogUtils';
import { Modal } from '@/components/common/Modal';

interface PolicyLogViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PolicyLogViewer({ isOpen, onClose }: PolicyLogViewerProps) {
  const [logs, setLogs] = useState<PolicyLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<PolicyLog[]>([]);
  const [summary, setSummary] = useState<PolicyLogSummary | null>(null);
  const [filter, setFilter] = useState<PolicyLogFilter>({
    action: 'ALL'
  });
  const [selectedLog, setSelectedLog] = useState<PolicyLog | null>(null);

  // 로그 데이터 로드
  useEffect(() => {
    if (isOpen) {
      const allLogs = getPolicyLogs();
      setLogs(allLogs);
      setFilteredLogs(allLogs);
      setSummary(getPolicyLogSummary());
    }
  }, [isOpen]);

  // 필터 적용
  useEffect(() => {
    const filtered = getFilteredPolicyLogs(filter);
    setFilteredLogs(filtered);
  }, [filter, logs]);

  const handleFilterChange = (field: keyof PolicyLogFilter, value: any) => {
    setFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExportCSV = () => {
    downloadLogsAsCSV(filteredLogs, `policy_logs_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getFieldDisplayName = (field: string) => {
    const fieldMap: { [key: string]: string } = {
      'description': '정책 설명',
      'minAmount': '최소 금액',
      'maxAmount': '최대 금액',
      'requiredApprovers': '필요 결재자',
      'entire_policy': '전체 정책',
      'status': '상태'
    };
    return fieldMap[field] || field;
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-blue-100 text-blue-800';
      case 'UPDATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUSPEND':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'CREATE':
        return '생성';
      case 'UPDATE':
        return '수정';
      case 'SUSPEND':
        return '정지';
      default:
        return action;
    }
  };

  const formatChangeValue = (value: any) => {
    if (value === null || value === undefined) {
      return '없음';
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return '없음';
      }
      return value.join(', ');
    }

    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }

    if (typeof value === 'number') {
      if (value === Infinity) {
        return '무제한';
      }
      return value.toLocaleString();
    }

    return String(value);
  };

  const renderPolicyFields = (policyObject: any, title: string) => {
    if (!policyObject || typeof policyObject !== 'object') {
      return null;
    }

    const fields = [
      { key: 'description', label: '정책 설명' },
      { key: 'minAmount', label: '최소 금액' },
      { key: 'maxAmount', label: '최대 금액' },
      { key: 'requiredApprovers', label: '필요 결재자' }
    ];

    return (
      <div className="space-y-2">
        <div className="font-medium text-sm text-gray-700 mb-2">{title}</div>
        {fields.map((field) => (
          <div key={field.key} className="bg-gray-50 p-3 rounded">
            <div className="font-medium text-sm text-gray-700 mb-1">{field.label}</div>
            <div className="text-sm">
              <span className="text-red-600">삭제된 값: {formatChangeValue(policyObject[field.key])}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-[60vw] max-w-none max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">정책 변경 이력</h2>
              <p className="text-gray-600 text-sm mt-1">모든 정책 변경사항을 확인할 수 있습니다</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Summary Stats */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-gray-900">{summary.totalLogs}</div>
                <div className="text-sm text-gray-600">전체 로그</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">{summary.createCount}</div>
                <div className="text-sm text-gray-600">생성</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-yellow-600">{summary.updateCount}</div>
                <div className="text-sm text-gray-600">수정</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-orange-600">{summary.suspendCount || 0}</div>
                <div className="text-sm text-gray-600">정지</div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">액션</label>
              <select
                value={filter.action || 'ALL'}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="ALL">전체</option>
                <option value="CREATE">생성</option>
                <option value="UPDATE">수정</option>
                <option value="SUSPEND">정지</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시작 날짜</label>
              <input
                type="date"
                value={filter.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">종료 날짜</label>
              <input
                type="date"
                value={filter.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex-1"></div>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>CSV 내보내기</span>
            </button>
          </div>
        </div>

        {/* Log List */}
        <div className="flex-1 overflow-hidden">
          <div className="h-96 overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                조건에 맞는 로그가 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionBadgeColor(log.action)}`}>
                          {getActionText(log.action)}
                        </span>
                        <span className="font-medium text-gray-900">{log.policyDescription}</span>
                        <span className="text-sm text-gray-500">by {log.userName}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </div>
                    {log.changes.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        변경: {log.changes.map(c => getFieldDisplayName(c.field)).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Log Detail Modal */}
        {selectedLog && (
          <Modal isOpen={true} onClose={() => setSelectedLog(null)}>
            <div className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">로그 상세 정보</h3>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-96">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">액션:</span>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getActionBadgeColor(selectedLog.action)}`}>
                        {getActionText(selectedLog.action)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">시간:</span>
                      <span className="ml-2 text-sm text-gray-600">{formatTimestamp(selectedLog.timestamp)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">정책:</span>
                      <span className="ml-2 text-sm text-gray-600">{selectedLog.policyDescription}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">사용자:</span>
                      <span className="ml-2 text-sm text-gray-600">{selectedLog.userName}</span>
                    </div>
                  </div>

                  {selectedLog.metadata.reason && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">사유:</span>
                      <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {selectedLog.metadata.reason}
                      </p>
                    </div>
                  )}

                  {selectedLog.changes.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">변경 내용:</span>
                      <div className="mt-2 space-y-2">
                        {selectedLog.changes.map((change, index) => (
                          <div key={index}>
                            <div className="bg-gray-50 p-3 rounded">
                              <div className="font-medium text-sm text-gray-700 mb-1">{getFieldDisplayName(change.field)}</div>
                              <div className="text-sm">
                                {selectedLog.action === 'CREATE' ? (
                                  // 생성 시에는 이후 값만 표시
                                  <span className="text-green-600">값: {formatChangeValue(change.newValue)}</span>
                                ) : selectedLog.action === 'SUSPEND' ? (
                                  // 정지 시에는 정지 상태만 표시
                                  <span className="text-orange-600">정지됨</span>
                                ) : (
                                  // 수정 시에는 이전/이후 값 모두 표시
                                  <>
                                    <span className="text-red-600">이전: {formatChangeValue(change.oldValue)}</span>
                                    <br />
                                    <span className="text-green-600">이후: {formatChangeValue(change.newValue)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Modal>
        )}
        </div>
    </Modal>
  );
}