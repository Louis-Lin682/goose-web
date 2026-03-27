import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { AdminActionLoadingOverlay } from "./AdminActionLoadingOverlay";
import { useAuth } from "../context/useAuth";
import { getAdminProductStats } from "../lib/orders";
import type {
  AdminProductStatPoint,
  AdminProductStatsPreset,
  AdminProductStatsResponse,
} from "../types/order";

type StatsMetricMode = "quantity" | "revenue";

const variantLabels: Record<string, string> = {
  single: "單點",
  small: "小份",
  large: "大份",
};

const formatVariantLabel = (variant: string) =>
  variantLabels[variant] ?? variant;

const formatProductDisplayName = (product: AdminProductStatPoint) =>
  product.variant
    ? `${product.productName}｜${formatVariantLabel(product.variant)}`
    : product.productName;

const formatSubCategoryWithVariant = (product: AdminProductStatPoint) =>
  product.variant
    ? `${product.subCategory} · ${formatVariantLabel(product.variant)}`
    : product.subCategory;

const formatProductChartLabel = (product: AdminProductStatPoint) => {
  return product.productName.length > 6
    ? `${product.productName.slice(0, 6)}…`
    : product.productName;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(value);

const formatCompactCurrency = (value: number) => {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(value >= 100000 ? 0 : 1)}萬`;
  }

  return formatCurrency(value);
};

const getDateString = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const resolvePresetRange = (preset: Exclude<AdminProductStatsPreset, "custom">) => {
  const now = new Date();

  if (preset === "today") {
    const today = getDateString(now);
    return { startDate: today, endDate: today };
  }

  if (preset === "this-month") {
    return {
      startDate: getDateString(new Date(now.getFullYear(), now.getMonth(), 1)),
      endDate: getDateString(now),
    };
  }

  return {
    startDate: getDateString(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
    endDate: getDateString(new Date(now.getFullYear(), now.getMonth(), 0)),
  };
};

const presetLabels: Record<Exclude<AdminProductStatsPreset, "custom">, string> = {
  today: "本日",
  "this-month": "本月",
  "last-month": "上月",
};

const getMetricValue = (
  product: AdminProductStatPoint,
  metricMode: StatsMetricMode,
) => (metricMode === "quantity" ? product.quantitySold : product.revenue);

const formatMetricValue = (value: number, metricMode: StatsMetricMode) =>
  metricMode === "quantity"
    ? `${value.toLocaleString("zh-TW")} 件`
    : formatCompactCurrency(value);

const buildLinePath = (points: Array<{ x: number; y: number }>) => {
  if (points.length === 0) return "";

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
};

const buildAreaPath = (
  points: Array<{ x: number; y: number }>,
  chartBottom: number,
) => {
  if (points.length === 0) return "";

  const linePath = buildLinePath(points);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  return `${linePath} L ${lastPoint.x} ${chartBottom} L ${firstPoint.x} ${chartBottom} Z`;
};

const HotProductsChart = ({
  products,
  metricMode,
  onMetricModeChange,
}: {
  products: AdminProductStatPoint[];
  metricMode: StatsMetricMode;
  onMetricModeChange: (mode: StatsMetricMode) => void;
}) => {
  const chartWidth = 760;
  const chartHeight = 320;
  const leftPadding = 42;
  const rightPadding = 20;
  const topPadding = 30;
  const bottomPadding = 68;
  const chartBottom = chartHeight - bottomPadding;
  const chartInnerWidth = chartWidth - leftPadding - rightPadding;
  const chartInnerHeight = chartBottom - topPadding;
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const rankedProducts = useMemo(() => {
    const sorted = [...products].sort((left, right) => {
      const leftValue = getMetricValue(left, metricMode);
      const rightValue = getMetricValue(right, metricMode);

      if (rightValue !== leftValue) {
        return rightValue - leftValue;
      }

      return formatProductDisplayName(left).localeCompare(
        formatProductDisplayName(right),
      );
    });

    return sorted.slice(0, 10);
  }, [metricMode, products]);

  const maxMetric = Math.max(
    ...rankedProducts.map((product) => getMetricValue(product, metricMode)),
    1,
  );

  const highlightProduct =
    rankedProducts.length > 0
      ? rankedProducts.reduce((currentMax, product) =>
          getMetricValue(product, metricMode) >
          getMetricValue(currentMax, metricMode)
            ? product
            : currentMax,
        )
      : null;

  const points = rankedProducts.map((product, index) => {
    const x =
      rankedProducts.length === 1
        ? leftPadding + chartInnerWidth / 2
        : leftPadding +
          (chartInnerWidth / Math.max(rankedProducts.length - 1, 1)) * index;
    const metricValue = getMetricValue(product, metricMode);
    const y =
      chartBottom - (metricValue / maxMetric) * Math.max(chartInnerHeight - 16, 1);

    return { x, y, product };
  });

  const hoveredPoint =
    points.find((point) => point.product.productKey === hoveredKey) ?? null;
  const hoveredTitle = hoveredPoint
    ? formatProductDisplayName(hoveredPoint.product)
    : "";
  const hoveredValue = hoveredPoint
    ? formatMetricValue(
        getMetricValue(hoveredPoint.product, metricMode),
        metricMode,
      )
    : "";
  const tooltipWidth = Math.max(
    hoveredTitle.length * 8.2,
    hoveredValue.length * 7.2,
    56,
  );
  const tooltipHeight = 34;
  const tooltipX = hoveredPoint
    ? Math.min(
        Math.max(hoveredPoint.x - tooltipWidth / 2, 12),
        chartWidth - tooltipWidth - 12,
      )
    : 0;
  const tooltipY = hoveredPoint
    ? Math.max(hoveredPoint.y - tooltipHeight - 16, 10)
    : 0;

  if (rankedProducts.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-zinc-200 bg-zinc-50 px-6 py-16 text-center">
        <p className="text-2xl font-bold text-zinc-900">目前還沒有可統計的商品資料</p>
        <p className="mt-3 text-sm text-zinc-500">
          目前篩選條件內沒有有效訂單，調整日期後就能看到熱賣商品走勢。
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-zinc-100 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-zinc-100 px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.36em] text-orange-600">
            Hot Selling
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-900">
            熱賣商品走勢
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500">
            依商品規格拆分統計熱賣表現，快速查看單點、小份、大份各自的銷售件數與營收變化。
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:items-end">
          <div className="relative grid grid-cols-2 rounded-2xl bg-zinc-100 p-1">
            <motion.span
              layoutId="stats-metric-pill"
              transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.7 }}
              className={`absolute bottom-1 top-1 z-0 w-[calc(50%-0.25rem)] rounded-2xl bg-white shadow-sm ${
                metricMode === "quantity" ? "left-1" : "left-[calc(50%+0.25rem)]"
              }`}
            />
            {([
              ["quantity", "銷售件數"],
              ["revenue", "營收"],
            ] as const).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => onMetricModeChange(mode)}
                className={`relative z-10 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                  metricMode === mode ? "text-zinc-900" : "text-zinc-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {highlightProduct && (
            <div className="rounded-[1.75rem] bg-zinc-900 px-5 py-5 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/45">
                Top Product
              </p>
              <p className="mt-3 text-xl font-black">
                {formatProductDisplayName(highlightProduct)}
              </p>
              <p className="mt-2 text-sm text-white/70">
                {formatSubCategoryWithVariant(highlightProduct)} · {" "}
                {formatMetricValue(
                  getMetricValue(highlightProduct, metricMode),
                  metricMode,
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 pt-6 sm:px-6">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-[22rem] w-full"
          role="img"
          aria-label="熱賣商品走勢圖表"
        >
          <defs>
            <linearGradient id="product-stats-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#18181b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#18181b" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75, 1].map((gridValue) => {
            const y = chartBottom - chartInnerHeight * gridValue;
            const tickValue = Math.round(maxMetric * gridValue);

            return (
              <g key={gridValue}>
                <line
                  x1={leftPadding}
                  x2={chartWidth - rightPadding}
                  y1={y}
                  y2={y}
                  stroke="#e4e4e7"
                  strokeDasharray="6 8"
                />
                <text
                  x={0}
                  y={y + 4}
                  fill="#a1a1aa"
                  fontSize="12"
                  fontWeight="700"
                >
                  {metricMode === "quantity"
                    ? tickValue.toLocaleString("zh-TW")
                    : formatCompactCurrency(tickValue)}
                </text>
              </g>
            );
          })}

          <path d={buildAreaPath(points, chartBottom)} fill="url(#product-stats-area)" />
          <path
            d={buildLinePath(points)}
            fill="none"
            stroke="#3f3f46"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />

          {points.map((point) => (
            <g
              key={point.product.productKey}
              onMouseEnter={() => setHoveredKey(point.product.productKey)}
              onMouseMove={() => setHoveredKey(point.product.productKey)}
              onMouseLeave={() => setHoveredKey(null)}
              onFocus={() => setHoveredKey(point.product.productKey)}
              onBlur={() => setHoveredKey(null)}
            >
              <circle
                cx={point.x}
                cy={point.y}
                fill="#ffffff"
                r="7"
                stroke="#18181b"
                strokeWidth="3"
              />
              <circle cx={point.x} cy={point.y} fill="#18181b" r="2.5" />
              <text
                x={point.x}
                y={chartHeight - 24}
                fill="#71717a"
                fontSize="12"
                fontWeight="700"
                textAnchor="middle"
              >
                {formatProductChartLabel(point.product)}
              </text>
              <rect
                x={point.x - 24}
                y={point.y - 24}
                width="48"
                height="48"
                fill="transparent"
              />
            </g>
          ))}

          <AnimatePresence>
            {hoveredPoint && (
              <motion.g
                key={hoveredPoint.product.productKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{ pointerEvents: "none" }}
              >
                <rect
                  x={tooltipX}
                  y={tooltipY}
                  width={tooltipWidth}
                  height={tooltipHeight}
                  rx="10"
                  fill="rgba(250,250,250,0.9)"
                  stroke="rgba(228,228,231,0.85)"
                />
                <text
                  x={hoveredPoint.x}
                  y={tooltipY + 13}
                  fill="#71717a"
                  fontSize="8.5"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {hoveredTitle}
                </text>
                <text
                  x={hoveredPoint.x}
                  y={tooltipY + 25}
                  fill="#52525b"
                  fontSize="9.5"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {hoveredValue}
                </text>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </div>
    </div>
  );
};

export const AdminProductStats = () => {
  const { isAuthReady, isAuthenticated, user } = useAuth();
  const [preset, setPreset] = useState<AdminProductStatsPreset>("this-month");
  const [metricMode, setMetricMode] = useState<StatsMetricMode>("quantity");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [stats, setStats] = useState<AdminProductStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (
    nextPreset: AdminProductStatsPreset,
    range?: { startDate?: string; endDate?: string },
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getAdminProductStats({
        preset: nextPreset,
        startDate: range?.startDate,
        endDate: range?.endDate,
      });
      setStats(response);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "商品統計載入失敗，請稍後再試。",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthReady) return;

    if (!isAuthenticated || !user?.isAdmin) {
      setStats(null);
      setIsLoading(false);
      return;
    }

    const initialRange = resolvePresetRange("this-month");
    setCustomStartDate(initialRange.startDate);
    setCustomEndDate(initialRange.endDate);
    void fetchStats("this-month", initialRange);
  }, [isAuthReady, isAuthenticated, user?.isAdmin]);

  const handlePresetChange = async (nextPreset: Exclude<AdminProductStatsPreset, "custom">) => {
    setIsFilterLoading(true);
    setPreset(nextPreset);
    const range = resolvePresetRange(nextPreset);
    setCustomStartDate(range.startDate);
    setCustomEndDate(range.endDate);
    try {
      await fetchStats(nextPreset, range);
    } finally {
      window.setTimeout(() => setIsFilterLoading(false), 280);
    }
  };

  const handleDateSearch = async () => {
    if (!customStartDate || !customEndDate) {
      setError("請先選擇完整日期範圍。");
      return;
    }

    setPreset("custom");
    await fetchStats("custom", {
      startDate: customStartDate,
      endDate: customEndDate,
    });
  };

  const topProducts = stats?.topProducts ?? [];

  const summaryCards = useMemo(() => {
    if (!stats) return [];

    return [
      {
        label: "總營收",
        value: formatCurrency(stats.totalRevenue),
        accent: "text-zinc-900",
      },
      {
        label: "訂單數",
        value: `${stats.totalOrders} 筆`,
        accent: "text-zinc-900",
      },
      {
        label: "售出件數",
        value: `${stats.totalItemsSold} 件`,
        accent: "text-zinc-900",
      },
      {
        label: "熱賣第一",
        value: topProducts[0] ? formatProductDisplayName(topProducts[0]) : "暫無資料",
        accent: "text-orange-600",
      },
    ];
  }, [stats, topProducts]);

  const sortedProducts = useMemo(() => {
    return [...topProducts]
      .sort((left, right) => {
        const leftValue = getMetricValue(left, metricMode);
        const rightValue = getMetricValue(right, metricMode);

        if (rightValue !== leftValue) {
          return rightValue - leftValue;
        }

        return formatProductDisplayName(left).localeCompare(
          formatProductDisplayName(right),
        );
      })
      .slice(0, 5);
  }, [metricMode, topProducts]);

  if (!isAuthReady) {
    return (
      <main className="min-h-screen bg-white px-6 pb-24 pt-40">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-zinc-100 bg-zinc-50 px-8 py-16 text-center">
          <p className="text-sm text-zinc-500">正在載入商品統計...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  return (
    <main className="min-h-screen bg-white px-6 pb-24 pt-40 lg:h-full lg:overflow-hidden lg:pb-10 lg:pt-10">
      {isFilterLoading && <AdminActionLoadingOverlay title="篩選中..." />}
      <div className="mx-auto max-w-6xl lg:flex lg:h-full lg:flex-col">
        <div className="shrink-0">
          <div className="mb-7 flex flex-col gap-4 border-b border-zinc-100 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.4em] text-orange-600">
                Admin
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 md:text-5xl">
                商品統計
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                依不同日期範圍查看熱賣商品與總營收，現在也會區分單點、小份、大份等不同商品規格。
              </p>
            </div>

            {stats && (
              <div className="rounded-[1.75rem] bg-zinc-50 px-5 py-5 text-sm text-zinc-500">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-zinc-400">
                  目前範圍
                </p>
                <p className="mt-2 text-lg font-black text-zinc-900">
                  {stats.range.startDate} - {stats.range.endDate}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-2">
          {isLoading ? (
            <div className="rounded-[2rem] border border-zinc-100 bg-zinc-50 px-8 py-16 text-center text-sm text-zinc-500">
              正在載入商品統計...
            </div>
          ) : (
            <>
              <HotProductsChart
                products={topProducts}
                metricMode={metricMode}
                onMetricModeChange={setMetricMode}
              />

              <div className="rounded-[2rem] border border-zinc-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    {(["today", "this-month", "last-month"] as const).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => void handlePresetChange(item)}
                        className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                          preset === item
                            ? "bg-zinc-900 text-white"
                            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                        }`}
                      >
                        {presetLabels[item]}
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(event) => {
                        setPreset("custom");
                        setCustomStartDate(event.target.value);
                      }}
                      onClick={(event) => event.currentTarget.showPicker?.()}
                      onFocus={(event) => event.currentTarget.showPicker?.()}
                      className="h-10 rounded-full border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition-colors focus:border-orange-400"
                    />
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(event) => {
                        setPreset("custom");
                        setCustomEndDate(event.target.value);
                      }}
                      onClick={(event) => event.currentTarget.showPicker?.()}
                      onFocus={(event) => event.currentTarget.showPicker?.()}
                      className="h-10 rounded-full border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition-colors focus:border-orange-400"
                    />
                    <button
                      type="button"
                      onClick={() => void handleDateSearch()}
                      className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      搜尋
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => (
                  <article
                    key={card.label}
                    className="rounded-[1.35rem] border border-zinc-100 bg-white px-4 py-4 shadow-sm"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">
                      {card.label}
                    </p>
                    <p className={`mt-2 text-2xl font-black ${card.accent}`}>
                      {card.value}
                    </p>
                  </article>
                ))}
              </section>

              <section className="overflow-hidden rounded-[2rem] border border-zinc-100 bg-white shadow-sm">
                <div className="border-b border-zinc-100 px-6 py-5 text-center">
                  <h2 className="text-2xl font-black tracking-tight text-zinc-900">
                    商品排行
                  </h2>
                  <p className="mt-2 text-sm text-zinc-500">
                    顯示目前篩選範圍內的前 5 名熱賣商品，並拆分不同規格一起比較。
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-zinc-100 text-center">
                    <thead className="bg-zinc-50">
                      <tr className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">
                        <th className="px-6 py-4">商品</th>
                        <th className="px-6 py-4">分類</th>
                        <th className="px-6 py-4">售出件數</th>
                        <th className="px-6 py-4">訂單數</th>
                        <th className="px-6 py-4">營收</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {sortedProducts.map((product) => (
                        <tr key={product.productKey}>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-zinc-900">
                              {formatProductDisplayName(product)}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {formatSubCategoryWithVariant(product)}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-600">
                            {product.category}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-zinc-900">
                            {product.quantitySold}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-zinc-900">
                            {product.orderCount}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-zinc-900">
                            {formatCurrency(product.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

