import SubscriptionTest from '../../lib/test-subscription';

/**
 * 订阅状态测试页面
 * 仅在开发环境中使用
 */
export default function SubscriptionTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <SubscriptionTest />
      </div>
    </div>
  );
}