import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface ChartProps {
  data: any[];
  xAxisKey: string;
  dataKeys: string[];
  theme: any;
  minWidth?: number;
}

export default function BarChartComponent({
  data,
  xAxisKey,
  dataKeys,
  theme,
  minWidth = 1000,
}: ChartProps) {
  const isDark = theme.name.includes("تاریک");
  const gridColor = isDark ? "#333" : "#eee";
  const textColor = isDark ? "#aaa" : "#666";
  const tooltipBg = isDark ? "#1f2937" : "#fff";
  const tooltipText = isDark ? "#fff" : "#000";

  return (
    <div style={{ width: `${Math.max(100, minWidth)}%`, height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={gridColor}
          />

          <XAxis
            dataKey={xAxisKey}
            stroke={textColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={10}
          />

          <YAxis
            stroke={textColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dx={-10}
          />

          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              backgroundColor: tooltipBg,
              color: tooltipText,
            }}
            cursor={{
              fill: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
            }}
          />

          <Legend wrapperStyle={{ paddingTop: "20px", color: textColor }} />
          {dataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={COLORS[index % COLORS.length]}
              radius={[4, 4, 0, 0]}
              barSize={dataKeys.length > 1 ? 30 : 50}
              animationDuration={1500}
            >
              {" "}
              {dataKeys.length === 1 &&
                data.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
