export const dynamic = 'force-dynamic';

export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-black p-4">
      <div className="w-full max-w-md bg-black/30 backdrop-blur-xl rounded-2xl p-8 shadow-2xl text-center">
        <h1 className="text-2xl font-bold text-white mb-4">服务器测试页面</h1>
        <p className="text-purple-200">
          如果您看到此页面，表示Next.js服务器正在正常运行！
        </p>
      </div>
    </div>
  );
} 