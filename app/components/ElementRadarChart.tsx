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

// Convert element data to recharts format
const formatDataForChart = (data: ElementData[]) => {
  return data.map(item => ({
    subject: item.element,
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
        <p className="font-medium text-white">{`${data.fullName}: ${data.A}%`}</p>
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
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="#a78bfa" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'white', fontSize: 14 }} 
            axisLine={{ stroke: '#a78bfa' }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: 'white' }} 
            stroke="#a78bfa" 
            axisLine={false} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar 
            name="Element Strength" 
            dataKey="A" 
            stroke="#6366f1" 
            fill="#6366f1" 
            fillOpacity={0.6} 
            activeDot={{ r: 8, fill: '#c4b5fd' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ElementRadarChart; 