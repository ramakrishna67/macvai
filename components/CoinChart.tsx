"use client";

import {
  Chart as ChartJS,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
  Legend,
  CategoryScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
  Legend,
  CategoryScale
);

export default function CoinChart({ prices }: { prices: [number, number][] }) {
  const data = {
    labels: prices.map(([timestamp]) => new Date(timestamp)),
    datasets: [
      {
        label: "Price (USD)",
        data: prices.map(([_, price]) => price),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: "day" as const,
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        ticks: {
          callback: function (tickValue: string | number) {
            return `$${tickValue}`;
          },
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `$${ctx.raw.toFixed(2)}`,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}
