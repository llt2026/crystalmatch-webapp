import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsProps {
  token: string;
}

interface OnlineStats {
  totalOnline: number;
  premiumOnline: number;
  premiumPercentage: string;
}

interface VisitStats {
  hourly: Array<{ hour: number; visits: number }>;
  daily: Array<{ day: string; visits: number }>;
  monthly: Array<{ month: number; visits: number }>;
}

export default function Analytics({ token }: AnalyticsProps) {
  const [onlineStats, setOnlineStats] = useState<OnlineStats | null>(null);
  const [visitStats, setVisitStats] = useState<VisitStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/analytics', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('获取数据失败');
        }

        const data = await response.json();
        setOnlineStats(data.online);
        setVisitStats(data.visits);
      } catch (err) {
        setError('获取统计数据失败');
        console.error(err);
      }
    };

    fetchStats();
    // 每分钟更新一次数据
    const interval = setInterval(fetchStats, 60000);

    return () => clearInterval(interval);
  }, [token]);

  if (error) {
    return (
      <div className="text-red-300 text-center p-4">
        {error}
      </div>
    );
  }

  if (!onlineStats || !visitStats) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Real-time Online Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-6">
        <div className="glass-card p-3 sm:p-6 rounded-xl">
          <h3 className="text-sm sm:text-lg font-medium text-purple-300 mb-1 sm:mb-2">Currently Online</h3>
          <p className="text-xl sm:text-3xl font-bold text-white">{onlineStats.totalOnline}</p>
        </div>
        <div className="glass-card p-3 sm:p-6 rounded-xl">
          <h3 className="text-sm sm:text-lg font-medium text-purple-300 mb-1 sm:mb-2">Premium Users Online</h3>
          <p className="text-xl sm:text-3xl font-bold text-white">{onlineStats.premiumOnline}</p>
        </div>
        <div className="glass-card p-3 sm:p-6 rounded-xl col-span-2 sm:col-span-1">
          <h3 className="text-sm sm:text-lg font-medium text-purple-300 mb-1 sm:mb-2">Premium Ratio</h3>
          <p className="text-xl sm:text-3xl font-bold text-white">{onlineStats.premiumPercentage}%</p>
        </div>
      </div>

      {/* Hourly Traffic */}
      <div className="glass-card p-3 sm:p-6 rounded-xl">
        <h3 className="text-sm sm:text-lg font-medium text-purple-300 mb-2 sm:mb-4">24-Hour Traffic Trend</h3>
        <div className="h-60 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visitStats.hourly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="hour" 
                stroke="#9CA3AF"
                tickFormatter={(hour: number) => `${hour}:00`}
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#9CA3AF" 
                tick={{ fontSize: 12 }}
                width={30}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  fontSize: '12px'
                }}
                labelStyle={{ color: '#9CA3AF' }}
                itemStyle={{ color: '#E5E7EB' }}
              />
              <Legend 
                wrapperStyle={{
                  fontSize: '12px',
                  paddingTop: '10px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="visits" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                name="Visits"
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Traffic */}
      <div className="glass-card p-3 sm:p-6 rounded-xl">
        <h3 className="text-sm sm:text-lg font-medium text-purple-300 mb-2 sm:mb-4">Weekly Traffic Trend</h3>
        <div className="h-60 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visitStats.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="day" 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#9CA3AF" 
                tick={{ fontSize: 12 }}
                width={30}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  fontSize: '12px'
                }}
                labelStyle={{ color: '#9CA3AF' }}
                itemStyle={{ color: '#E5E7EB' }}
              />
              <Legend 
                wrapperStyle={{
                  fontSize: '12px',
                  paddingTop: '10px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="visits" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                name="Visits"
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Traffic */}
      <div className="glass-card p-3 sm:p-6 rounded-xl">
        <h3 className="text-sm sm:text-lg font-medium text-purple-300 mb-2 sm:mb-4">Annual Traffic Trend</h3>
        <div className="h-60 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visitStats.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF"
                tickFormatter={(month: number) => `Month ${month}`}
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#9CA3AF" 
                tick={{ fontSize: 12 }}
                width={30}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  fontSize: '12px'
                }}
                labelStyle={{ color: '#9CA3AF' }}
                itemStyle={{ color: '#E5E7EB' }}
              />
              <Legend 
                wrapperStyle={{
                  fontSize: '12px',
                  paddingTop: '10px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="visits" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                name="Visits"
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 