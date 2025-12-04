import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartProps {
  data: any[];
  xAxisKey: string;
  dataKey: string;
  theme: any;
  minWidth?: number;
}

export default function LineChartComponent({ data, xAxisKey, dataKey, theme, minWidth = 1000 }: ChartProps) {
  return (
    <div style={{ width: `${Math.max(100, minWidth)}%`, height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.name.includes("تاریک") ? "#333" : "#eee"} />
          <XAxis dataKey={xAxisKey} stroke="#888" fontSize={12} tickLine={false} axisLine={false} dy={10} />
          <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
          <Tooltip
            contentStyle={{
              borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              backgroundColor: theme.name.includes("تاریک") ? "#1f2937" : "#fff",
            }}
          />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
          <Line type="monotone" dataKey={dataKey} stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 8 }} animationDuration={1500} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
