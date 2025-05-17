import TestVerification from '@/app/components/TestVerification';

export default function TestVerificationPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">验证码系统测试</h1>
        <TestVerification />
      </div>
    </div>
  );
} 