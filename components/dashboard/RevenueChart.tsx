/**
 * components/dashboard/RevenueChart.tsx
 *
 * Bar chart of daily revenue using Chart.js.
 * Groups by day, stacks receipt/invoice/order if needed.
 */
"use client";

import { useEffect, useRef } from "react";
import { DailyRevenue, DashboardPeriod } from "@/lib/types";

interface RevenueChartProps {
    data: DailyRevenue[];
    period: DashboardPeriod;
    currency: string;
}

function formatDay(dateStr: string, period: DashboardPeriod): string {
    const d = new Date(dateStr);
    if (period === "year") {
        return d.toLocaleDateString("en-NG", { month: "short" });
    }
    return d.toLocaleDateString("en-NG", { weekday: "short", day: "numeric" });
}

function formatCurrency(v: number, currency: string): string {
    if (currency === "NGN") return `₦${(v / 1000).toFixed(0)}k`;
    return `$${(v / 1000).toFixed(1)}k`;
}

export default function RevenueChart({ data, period, currency }: RevenueChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<any>(null);

    useEffect(() => {
        if (!canvasRef.current || !data.length) return;

        // Aggregate by day (sum across doc types)
        const byDay = data.reduce<Record<string, number>>((acc, row) => {
            acc[row.day] = (acc[row.day] ?? 0) + row.totalAmount;
            return acc;
        }, {});

        const labels = Object.keys(byDay).map(d => formatDay(d, period));
        const values = Object.values(byDay);
        const maxVal = Math.max(...values, 1);

        import("chart.js").then(({ Chart, registerables }) => {
            Chart.register(...registerables);

            if (chartRef.current) {
                chartRef.current.destroy();
            }

            chartRef.current = new Chart(canvasRef.current!, {
                type: "bar",
                data: {
                    labels,
                    datasets: [{
                        data: values,
                        backgroundColor: values.map(v =>
                            v === maxVal ? "#F97316" : "#FED7AA"
                        ),
                        borderRadius: 6,
                        borderSkipped: false,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (ctx) =>
                                    formatCurrency(ctx.parsed.y ?? 0, currency),
                            },
                        },
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: {
                                font: { size: 10, family: "var(--font-sans)" },
                                color: "#9ca3af",
                                maxRotation: 0,
                                autoSkip: true,
                                maxTicksLimit: 7,
                            },
                        },
                        y: {
                            grid: { color: "#f3f4f6" },
                            border: { display: false },
                            ticks: {
                                font: { size: 10, family: "var(--font-sans)" },
                                color: "#9ca3af",
                                callback: (v) => formatCurrency(Number(v), currency),
                            },
                        },
                    },
                },
            });
        });

        return () => { chartRef.current?.destroy(); };
    }, [data, period, currency]);

    if (!data.length) {
        return (
            <div className="h-[200px] flex items-center justify-center">
                <p className="text-sm text-surface-400 font-medium">
                    No revenue data for this period
                </p>
            </div>
        );
    }

    return (
        <div style={{ position: "relative", width: "100%", height: "200px" }}>
            <canvas ref={canvasRef} />
        </div>
    );
}