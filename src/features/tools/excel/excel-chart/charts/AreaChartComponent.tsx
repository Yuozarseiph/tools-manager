import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

interface ChartProps {
  data: any[];
  xAxisKey: string;
  dataKeys: string[];
  theme: any;
  minWidth?: number;
}

export default function AreaChartComponent({
  data,
  xAxisKey,
  dataKeys,
  theme,
  minWidth = 1000,
}: ChartProps) {
  return (
    <div style={{ width: `${Math.max(100, minWidth)}%`, height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            {dataKeys.map((key, index) => (
              <linearGradient
                key={key}
                id={`color-${index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={COLORS[index % COLORS.length]}
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor={COLORS[index % COLORS.length]}
                  stopOpacity={0}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={theme.name.includes("تاریک") ? "#333" : "#eee"}
          />
          <XAxis
            dataKey={xAxisKey}
            stroke="#888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="#888"
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
              backgroundColor: theme.name.includes("تاریک")
                ? "#1f2937"
                : "#fff",
            }}
          />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
          {dataKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#color-${index})`}
              animationDuration={1500}
              stackId="1"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
