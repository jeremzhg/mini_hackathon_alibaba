import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Server,
  Zap,
  SearchCheck,
  TrendingUp,
  ShieldAlert,
  AlertTriangle,
  Bot,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { useDashboardData } from "../hooks/useDashboardData";
import type { DashboardStat } from "../services/api";
import { PageHeader } from "./ui/PageHeader";
import { TransactionTable } from "./TransactionTable";

// ── Icon resolver ──────────────────────────────────────────────────────

const STAT_ICONS: Record<string, React.ReactNode> = {
  server: <Server className="w-5 h-5 text-emerald-500" />,
  search: <SearchCheck className="w-5 h-5 text-blue" />,
  shield: <ShieldAlert className="w-5 h-5 text-red-500" />,
  bot: <Bot className="w-5 h-5 text-yellow-500" />,
};

const SUBTITLE_ICONS: Record<string, React.ReactNode> = {
  emerald: <Zap className="w-4 h-4 text-emerald-500" />,
  red: <AlertTriangle className="w-4 h-4 text-red-500" />,
};

const SUBTITLE_COLORS: Record<string, string> = {
  emerald: "text-emerald-500",
  red: "text-red-500",
  slate: "text-slate",
};

// ── Custom Tooltip ─────────────────────────────────────────────────────

interface TooltipPayloadItem {
  dataKey: string;
  value: number;
  color: string;
}

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-darkish-grey border border-dark-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-slate mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.dataKey === "allowed" ? "Allowed" : "Blocked"}: {entry.value}
        </p>
      ))}
    </div>
  );
};

// ── Stat Card ──────────────────────────────────────────────────────────

const StatCard = ({ stat }: { stat: DashboardStat }) => (
  <article className="flex flex-col gap-4 p-5 bg-darkish-grey rounded-xl border border-dark-border shadow-sm min-w-[200px] flex-1">
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#ffffff0a]">
        {STAT_ICONS[stat.iconType]}
      </div>
      <h2 className="font-medium text-slate text-sm">{stat.title}</h2>
    </div>

    <div className="flex flex-col gap-1">
      <span className="font-bold text-white text-2xl leading-8">{stat.value}</span>
      <div className="flex items-center gap-1">
        {stat.trend === "up" && <TrendingUp className="w-4 h-4 text-emerald-500" />}
        {SUBTITLE_ICONS[stat.subtitleColor] && !stat.trend && SUBTITLE_ICONS[stat.subtitleColor]}
        <span className={`text-xs ${SUBTITLE_COLORS[stat.subtitleColor]}`}>{stat.subtitle}</span>
      </div>
    </div>
  </article>
);

// ── Loading skeleton ───────────────────────────────────────────────────

const LoadingSkeleton = () => (
  <div className="flex flex-col gap-6 animate-pulse">
    <div className="flex flex-wrap gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex-1 min-w-[200px] h-[130px] bg-darkish-grey rounded-xl border border-dark-border" />
      ))}
    </div>
    <div className="h-[380px] bg-darkish-grey rounded-xl border border-dark-border" />
    <div className="h-[320px] bg-darkish-grey rounded-xl border border-dark-border" />
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────

export const DashboardMainSection = () => {
  const { stats, chartData, transactions, isLoading, error, refetch } = useDashboardData();

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Overview"
          subtitle="Monitor your credit card spending and category limits."
        />
        <LoadingSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 flex-1">
        <div className="text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-white font-bold text-lg mb-1">Failed to load dashboard</h2>
          <p className="text-slate text-sm mb-4">{error}</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue hover:bg-blue-hover text-white rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Monitor your credit card spending and category limits."
      />

      {/* Stat Cards */}
      <div className="flex flex-wrap gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* Transaction Volume Chart */}
      <section className="flex flex-col gap-6 p-6 bg-darkish-grey rounded-xl border border-dark-border shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-bold text-white text-lg">Transaction Volume</h2>
            <p className="text-slate text-sm">
              Allowed vs Blocked activity over the last 24 hours
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#135bec] rounded-full" />
              <span className="font-medium text-slate text-xs">Allowed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="font-medium text-slate text-xs">Blocked</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 bg-[#101622] rounded border border-[#2d3648]">
              <span className="text-slate text-xs">Last 24 Hours</span>
              <Calendar className="w-3.5 h-3.5 text-slate" />
            </div>
          </div>
        </div>

        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="allowedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#135bec" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#135bec" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="blockedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d364840" vertical={false} />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#b5c1dc", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#b5c1dc", fontSize: 12 }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="allowed"
                stroke="#135bec"
                strokeWidth={2}
                fill="url(#allowedGradient)"
                dot={false}
                activeDot={{ r: 5, fill: "#135bec", stroke: "#0b0e14", strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="blocked"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#blockedGradient)"
                dot={false}
                activeDot={{ r: 5, fill: "#ef4444", stroke: "#0b0e14", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Recent Transactions (shared component) */}
      <div className="pb-8">
        <TransactionTable
          data={transactions}
          title="Recent Transactions"
          defaultPerPage={5}
          showStatusFilter
          showPerPageSelector
        />
      </div>
    </>
  );
};
