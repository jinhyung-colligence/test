import React, { useState, useEffect } from 'react';
import { NotificationSystem, NotificationLog, NotificationTemplate, DEFAULT_CONFIG } from "@/utils/notificationSystem";
import { APPROVAL_POLICIES, TRANSACTION_TYPE_POLICIES } from "@/utils/approverAssignment";

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

  useEffect(() => {
    setLogs(notificationSystem.getNotificationLogs());
    setTemplates(notificationSystem.getTemplates());
  }, [notificationSystem]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "text-green-600 bg-green-100";
      case "failed": return "text-red-600 bg-red-100";
      case "retry": return "text-yellow-600 bg-yellow-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email": return "📧";
      case "slack": return "📱";
      case "teams": return "💬";
      case "webhook": return "🔗";
      case "in_app": return "🔔";
      default: return "❓";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString('ko-KR');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">알림 센터</h2>
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
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">알림 발송 로그</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">총 {logs.length}건</span>
                  <button
                    onClick={() => setLogs(notificationSystem.getNotificationLogs())}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                  >
                    새로고침
                  </button>
                </div>
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  아직 발송된 알림이 없습니다.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">수신자</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">채널</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">템플릿</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">발송시간</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">재시도</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs.slice(0, 50).map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.recipient}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <span>{getChannelIcon(log.channel)}</span>
                              <span>{log.channel}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.template}
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
              )}
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
                    
                    <div className="flex items-center space-x-1 mb-3">
                      {template.channels.map(channel => (
                        <span key={channel} className="text-sm" title={channel}>
                          {getChannelIcon(channel)}
                        </span>
                      ))}
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
              <h3 className="text-lg font-medium">알림 설정</h3>
              
              <div className="grid gap-6 md:grid-cols-2">
                {/* 이메일 설정 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">이메일 주소</h4>
                  <div className="space-y-2">
                    {Object.entries(DEFAULT_CONFIG.approverEmail).map(([name, email]) => (
                      <div key={name} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{name}</span>
                        <span className="text-sm text-gray-500">{email}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 알림 정책 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">알림 정책</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">지연 임계시간</span>
                      <span className="text-gray-500">{DEFAULT_CONFIG.overdueThresholdHours}시간</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">재시도 횟수</span>
                      <span className="text-gray-500">{DEFAULT_CONFIG.retryAttempts}회</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">재시도 간격</span>
                      <span className="text-gray-500">{DEFAULT_CONFIG.retryDelayMinutes}분</span>
                    </div>
                  </div>
                </div>

                {/* Slack 설정 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Slack 채널</h4>
                  <div className="space-y-2">
                    {Object.entries(DEFAULT_CONFIG.slackWebhooks).map(([channel, webhook]) => (
                      <div key={channel} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">#{channel}</span>
                        <span className="text-xs text-gray-500 truncate max-w-32" title={webhook}>
                          {webhook.substring(0, 20)}...
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 기본 채널 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">기본 알림 채널</h4>
                  <div className="flex items-center space-x-2">
                    {DEFAULT_CONFIG.defaultChannels.map(channel => (
                      <span key={channel} className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                        <span>{getChannelIcon(channel)}</span>
                        <span>{channel}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 통계 정보 */}
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">통계</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {logs.filter(l => l.status === 'sent').length}
                    </div>
                    <div className="text-xs text-gray-500">성공</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {logs.filter(l => l.status === 'failed').length}
                    </div>
                    <div className="text-xs text-gray-500">실패</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {logs.filter(l => l.retryCount > 0).length}
                    </div>
                    <div className="text-xs text-gray-500">재시도</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {templates.filter(t => t.enabled).length}
                    </div>
                    <div className="text-xs text-gray-500">활성 템플릿</div>
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