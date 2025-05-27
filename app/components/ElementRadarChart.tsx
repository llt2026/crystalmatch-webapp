import React from 'react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';

export type ElementData = {
  element: string;
  value: number;
  fullName: string;
};

// 映射元素简写到完整名称
const elementFullNames: Record<string, string> = {
  'S': 'Stability Energy',
  'F': 'Fluid Energy',
  'G': 'Growth Energy',
  'C': 'Clarity Energy',
  'P': 'Passion Energy'
};

// Convert element data to recharts format
const formatDataForChart = (data: ElementData[]) => {
  return data.map(item => ({
    subject: elementFullNames[item.element] || item.fullName,
    A: item.value,
    fullMark: 100,
    fullName: item.fullName
  }));
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

// Custom tooltip component
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-purple-800 p-3 rounded-lg shadow-lg border border-purple-500">
        <p className="font-medium text-white">{`${data.subject}: ${data.A}%`}</p>
      </div>
    );
  }
  return null;
};

interface ElementRadarChartProps {
  data: ElementData[];
}

const ElementRadarChart: React.FC<ElementRadarChartProps> = ({ data }) => {
  const chartData = formatDataForChart(data);
  
  return (
    <div className="w-full h-80 flex flex-col items-center mb-8">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="#6b46c1" strokeOpacity={0.3} />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'white', fontSize: 14, fontWeight: 500 }} 
            axisLine={{ stroke: '#6b46c1', strokeOpacity: 0.3 }}
            tickLine={false}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: 'white' }} 
            stroke="#6b46c1" 
            strokeOpacity={0.3}
            axisLine={false} 
            tickCount={4}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar 
            name="Element Strength" 
            dataKey="A" 
            stroke="#8884d8" 
            fill="#8884d8" 
            fillOpacity={0.6} 
            activeDot={{ r: 8, fill: '#c4b5fd' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ElementRadarChart; 