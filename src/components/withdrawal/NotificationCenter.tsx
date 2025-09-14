import React, { useState, useEffect } from 'react';
import { NotificationSystem, NotificationLog, NotificationTemplate, DEFAULT_CONFIG } from "@/utils/notificationSystem";
import { APPROVAL_POLICIES, TRANSACTION_TYPE_POLICIES } from "@/utils/approverAssignment";
import { MOCK_NOTIFICATION_LOGS, MOCK_NOTIFICATION_TEMPLATES } from "@/data/notificationMockData";

interface NotificationCenterProps {
  onClose?: () => void;
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState<'logs' | 'templates' | 'settings'>('logs');
  const [notificationSystem] = useState(() => new NotificationSystem(DEFAULT_CONFIG));
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // 필터 상태
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [templateFilter, setTemplateFilter] = useState<string>('all');

  useEffect(() => {
    // Mock 데이터 사용 (실제 시스템 데이터 대신)
    setLogs(MOCK_NOTIFICATION_LOGS);
    setTemplates(MOCK_NOTIFICATION_TEMPLATES);
  }, []);

  const handleTestNotification = async (templateId: string) => {
    // 테스트용 더미 데이터
    const dummyRequest = {
      id: "test-001",
      title: "테스트 출금 신청",
      fromAddress: "0x1234...",
      toAddress: "0x5678...",
      amount: 1000000,
      currency: "KRW" as const,
      groupId: "group-1",
      initiator: "테스트사용자",
      initiatedAt: new Date().toISOString(),
      status: "submitted" as const,
      priority: "medium" as const,
      description: "테스트용 출금 신청입니다.",
      requiredApprovals: ["박CFO", "이CISO"],
      approvals: [],
      rejections: [],
      auditTrail: []
    };

    switch (templateId) {
      case "approval_pending":
        await notificationSystem.sendApprovalPendingNotification(dummyRequest, "박CFO");
        break;
      case "approval_overdue":
        await notificationSystem.sendOverdueNotification(dummyRequest, "박CFO", 5);
        break;
      case "approval_completed":
        await notificationSystem.sendApprovalCompletedNotification({
          ...dummyRequest,
          approvals: [{ userId: "1", userName: "박CFO", role: "approver", approvedAt: new Date().toISOString() }]
        });
        break;
      case "approval_rejected":
        await notificationSystem.sendApprovalRejectedNotification(dummyRequest, {
          userName: "박CFO",
          rejectedAt: new Date().toISOString(),
          reason: "테스트 반려 사유"
        });
        break;
      case "emergency_approval":
        await notificationSystem.sendEmergencyApprovalNotification(dummyRequest, "박CFO", "긴급 테스트");
        break;
    }

    setLogs(notificationSystem.getNotificationLogs());
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "sent": return {
        label: "발송 완료",
        icon: "●",
        color: "text-green-600",
        dotColor: "text-green-500"
      };
      case "failed": return {
        label: "발송 실패",
        icon: "●",
        color: "text-red-600",
        dotColor: "text-red-500"
      };
      case "retry": return {
        label: "재발송 중",
        icon: "●",
        color: "text-amber-600",
        dotColor: "text-amber-500"
      };
      default: return {
        label: "알 수 없음",
        icon: "●",
        color: "text-gray-600",
        dotColor: "text-gray-400"
      };
    }
  };


  const getTemplateDisplay = (templateId: string) => {
    switch (templateId) {
      case "approval_pending": return "승인 대기 알림";
      case "approval_overdue": return "승인 지연 알림";
      case "approval_completed": return "승인 완료 알림";
      case "approval_rejected": return "승인 반려 알림";
      case "emergency_approval": return "긴급 승인 알림";
      default: return templateId;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString('ko-KR');
  };

  // 필터링된 로그 계산
  const filteredLogs = logs.filter(log => {
    const statusMatch = statusFilter === 'all' || log.status === statusFilter;
    const templateMatch = templateFilter === 'all' || log.template === templateFilter;
    return statusMatch && templateMatch;
  });

  // 페이징 계산
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 필터 변경 시 페이지 리셋
  const handleFilterChange = (filterType: 'status' | 'template', value: string) => {
    if (filterType === 'status') {
      setStatusFilter(value);
    } else {
      setTemplateFilter(value);
    }
    setCurrentPage(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">이메일 알림 센터</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b bg-gray-50">
          {[
            { key: 'logs', label: '알림 로그' },
            { key: 'templates', label: '템플릿 관리' },
            { key: 'settings', label: '설정' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ height: 'calc(100% - 180px)' }}>
          {/* 알림 로그 탭 */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">
                이메일 발송 로그
              </h3>
              {/* 필터 */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* 상태 필터 */}
                <select
                  value={statusFilter}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">전체 상태</option>
                  <option value="sent">발송 완료</option>
                  <option value="failed">발송 실패</option>
                  <option value="retry">재발송 중</option>
                </select>

                {/* 템플릿 필터 */}
                <select
                  value={templateFilter}
                  onChange={(e) => handleFilterChange('template', e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">전체 템플릿</option>
                  <option value="approval_pending">승인 대기 알림</option>
                  <option value="approval_overdue">승인 지연 알림</option>
                  <option value="approval_completed">승인 완료 알림</option>
                  <option value="approval_rejected">승인 반려 알림</option>
                  <option value="emergency_approval">긴급 승인 알림</option>
                </select>

                {/* 새로고침 버튼 */}
                <button
                  onClick={() => setLogs(MOCK_NOTIFICATION_LOGS)}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  새로고침
                </button>
              </div>
            </div>
          </div>

          {/* 데이터 표시 영역 */}
          <div className="p-6">

            {filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {logs.length === 0 ? "발송된 알림이 없습니다" : "필터 조건에 맞는 알림이 없습니다"}
                  </h4>
                  <p className="text-gray-500 text-center max-w-sm">
                    {logs.length === 0
                      ? "아직 발송된 이메일 알림이 없습니다. 출금 신청이나 승인이 발생하면 알림이 표시됩니다."
                      : "선택한 조건에 해당하는 알림이 없습니다. 필터를 조정해 보세요."
                    }
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">수신자</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">템플릿</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">발송시간</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">재시도</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className={`${getStatusDisplay(log.status).dotColor} text-sm`}>
                                {getStatusDisplay(log.status).icon}
                              </span>
                              <span className={`text-sm font-medium ${getStatusDisplay(log.status).color}`}>
                                {getStatusDisplay(log.status).label}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.recipient}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getTemplateDisplay(log.template)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(log.sentAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.retryCount > 0 ? `${log.retryCount}회` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 페이지네이션 */}
                {totalPages > 0 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                      <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                        총 {filteredLogs.length}개 중{" "}
                        {Math.min(startIndex + 1, filteredLogs.length)}
                        -{Math.min(startIndex + itemsPerPage, filteredLogs.length)}개 표시
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          이전
                        </button>

                        {[...Array(totalPages)].map((_, index) => {
                          const pageNumber = index + 1;
                          const isCurrentPage = pageNumber === currentPage;

                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`px-3 py-1 text-sm border rounded-md ${
                                isCurrentPage
                                  ? "bg-primary-600 text-white border-primary-600"
                                  : "border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          다음
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
            </div>
          )}

          {/* 템플릿 관리 탭 */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">알림 템플릿</h3>
                <button
                  onClick={() => {
                    setSelectedTemplate(null);
                    setIsEditing(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  새 템플릿
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <div key={template.id} className="bg-white border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <div className="flex items-center space-x-1">
                        <span className={`w-2 h-2 rounded-full ${template.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-xs text-gray-500">{template.enabled ? '활성' : '비활성'}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{template.trigger}</p>
                    
                    <div className="mb-3">
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        이메일 알림
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTestNotification(template.id)}
                        className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        테스트
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTemplate(template);
                          setIsEditing(true);
                        }}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        편집
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 설정 탭 */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">이메일 알림 설정</h3>
              
              <div className="grid gap-6 lg:grid-cols-2">
                {/* 이메일 설정 */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">승인자 이메일 주소</h4>
                  <div className="space-y-3">
                    {Object.entries(DEFAULT_CONFIG.approverEmail).map(([name, email]) => (
                      <div key={name} className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-sm font-medium text-gray-700">{name}</span>
                        <span className="text-sm text-gray-600">{email}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 알림 정책 */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">이메일 발송 정책</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between p-2 bg-white rounded border">
                      <span className="font-medium text-gray-700">지연 알림 기준</span>
                      <span className="text-gray-600">{DEFAULT_CONFIG.overdueThresholdHours}시간 후</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white rounded border">
                      <span className="font-medium text-gray-700">재발송 시도</span>
                      <span className="text-gray-600">최대 {DEFAULT_CONFIG.retryAttempts}회</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white rounded border">
                      <span className="font-medium text-gray-700">재발송 간격</span>
                      <span className="text-gray-600">{DEFAULT_CONFIG.retryDelayMinutes}분</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 이메일 발송 통계 */}
              <div className="bg-white border rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">이메일 발송 통계</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {logs.filter(l => l.status === 'sent').length}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">발송 완료</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">
                      {logs.filter(l => l.status === 'failed').length}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">발송 실패</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600">
                      {logs.filter(l => l.retryCount > 0).length}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">재발송</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {templates.filter(t => t.enabled).length}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">활성 템플릿</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}