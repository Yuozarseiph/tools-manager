import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ff6b6b", "#4ecdc4"];

interface ChartProps {
  data: any[];
  xAxisKey: string;
  dataKey: string;
  theme: any;
}

export default function PieChartComponent({ data, xAxisKey, dataKey, theme }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={5}
          dataKey={dataKey}
          nameKey={xAxisKey}
          animationDuration={1500}
          label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={theme.name.includes("تاریک") ? "#1f2937" : "#fff"} strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            backgroundColor: theme.name.includes("تاریک") ? "#1f2937" : "#fff",
          }}
        />
        <Legend wrapperStyle={{ paddingTop: "20px" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
