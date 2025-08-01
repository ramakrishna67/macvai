"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Star,
  StarOff,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import CoinChart from "@/components/CoinChart";

interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  image: {
    large: string;
  };
  market_cap_rank: number;
  market_data: {
    current_price: {
      usd: number;
    };
    market_cap: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
    price_change_percentage_24h: number;
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
  };
  description: {
    en: string;
  };
}

interface ChartData {
  prices: [number, number][];
}

export default function CoinDetailPage({ id }: { id: string }) {
  const [coin, setCoin] = useState<CoinDetail | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [selectedRange, setSelectedRange] = useState("7");

  // Load watchlist from localStorage
  useEffect(() => {
    const savedWatchlist = localStorage.getItem("crypto-watchlist");
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  // Fetch coin details
  useEffect(() => {
    const fetchCoinDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch coin details");
        }

        const data = await response.json();
        setCoin(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCoinDetails();
    }
  }, [id]);

  // Fetch chart data
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setChartLoading(true);
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${selectedRange}&interval=daily`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch chart data");
        }

        const data = await response.json();
        setChartData(data);
      } catch (err) {
        console.error("Error fetching chart data:", err);
      } finally {
        setChartLoading(false);
      }
    };

    if (id) {
      fetchChartData();
    }
  }, [id, selectedRange]);

  // Toggle watchlist
  const toggleWatchlist = () => {
    if (!coin) return;

    const newWatchlist = watchlist.includes(coin.id)
      ? watchlist.filter((coinId) => coinId !== coin.id)
      : [...watchlist, coin.id];

    setWatchlist(newWatchlist);
    localStorage.setItem("crypto-watchlist", JSON.stringify(newWatchlist));
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: value < 1 ? 6 : 2,
      maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value);
  };

  // Format large numbers
  const formatLargeNumber = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  // Format supply numbers
  const formatSupply = (value: number) => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toLocaleString();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-xl font-semibold mb-2">
                  Error Loading Coin
                </h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Link href="/">
                  <Button>Back to Markets</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Markets
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          ) : coin ? (
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Image
                  src={coin.image.large || "/placeholder.svg"}
                  alt={coin.name}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <div>
                  <h1 className="text-4xl font-bold">{coin.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-muted-foreground uppercase text-lg">
                      {coin.symbol}
                    </span>
                    <Badge variant="outline">
                      Rank #{coin.market_cap_rank}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                onClick={toggleWatchlist}
                variant={watchlist.includes(coin.id) ? "default" : "outline"}
                className="gap-2"
              >
                {watchlist.includes(coin.id) ? (
                  <Star className="w-4 h-4 fill-current" />
                ) : (
                  <StarOff className="w-4 h-4" />
                )}
                {watchlist.includes(coin.id)
                  ? "Remove from Watchlist"
                  : "Add to Watchlist"}
              </Button>
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : coin ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Price Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <div className="text-3xl font-bold">
                        {formatCurrency(coin.market_data.current_price.usd)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {coin.market_data.price_change_percentage_24h >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <Badge
                          variant={
                            coin.market_data.price_change_percentage_24h >= 0
                              ? "default"
                              : "destructive"
                          }
                          className={
                            coin.market_data.price_change_percentage_24h >= 0
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : ""
                          }
                        >
                          {coin.market_data.price_change_percentage_24h >= 0
                            ? "+"
                            : ""}
                          {coin.market_data.price_change_percentage_24h.toFixed(
                            2
                          )}
                          %
                        </Badge>
                        <span className="text-muted-foreground text-sm">
                          24h
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chart Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Price Chart</CardTitle>
                    <div className="flex gap-1">
                      {["1", "7", "30", "90"].map((range) => (
                        <Button
                          key={range}
                          variant={
                            selectedRange === range ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setSelectedRange(range)}
                        >
                          {range}d
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {chartLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : chartData ? (
                    <div className="h-64">
                      <CoinChart prices={chartData.prices} />
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-muted-foreground">
                        Failed to load chart data
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Description */}
              {coin.description.en && (
                <Card>
                  <CardHeader>
                    <CardTitle>About {coin.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{
                        __html:
                          coin.description.en.split(".").slice(0, 3).join(".") +
                          ".",
                      }}
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Market Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Market Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market Cap</span>
                    <span className="font-medium">
                      {formatLargeNumber(coin.market_data.market_cap.usd)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">24h Volume</span>
                    <span className="font-medium">
                      {formatLargeNumber(coin.market_data.total_volume.usd)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Market Cap Rank
                    </span>
                    <span className="font-medium">#{coin.market_cap_rank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Circulating Supply
                    </span>
                    <span className="font-medium">
                      {formatSupply(coin.market_data.circulating_supply)}
                    </span>
                  </div>
                  {coin.market_data.total_supply && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Supply
                      </span>
                      <span className="font-medium">
                        {formatSupply(coin.market_data.total_supply)}
                      </span>
                    </div>
                  )}
                  {coin.market_data.max_supply && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Supply</span>
                      <span className="font-medium">
                        {formatSupply(coin.market_data.max_supply)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
