"use client";

import { useState, useEffect } from "react";
import { Star, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  total_volume: number;
}

export default function WatchlistPage() {
  const [watchlistCoins, setWatchlistCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    const savedWatchlist = localStorage.getItem("crypto-watchlist");
    if (savedWatchlist) {
      const watchlistIds = JSON.parse(savedWatchlist);
      setWatchlist(watchlistIds);

      if (watchlistIds.length > 0) {
        fetchWatchlistCoins(watchlistIds);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchWatchlistCoins = async (coinIds: string[]) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds.join(
          ","
        )}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch watchlist coins");
      }

      const data = await response.json();
      setWatchlistCoins(data);
    } catch (err) {
      console.error("Error fetching watchlist coins:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = (coinId: string) => {
    const newWatchlist = watchlist.filter((id) => id !== coinId);
    setWatchlist(newWatchlist);
    setWatchlistCoins((prev) => prev.filter((coin) => coin.id !== coinId));
    localStorage.setItem("crypto-watchlist", JSON.stringify(newWatchlist));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: value < 1 ? 6 : 2,
      maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value);
  };

  const formatLargeNumber = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

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
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                My Watchlist
              </h1>
              <p className="text-muted-foreground mt-2">
                Track your favorite cryptocurrencies
              </p>
            </div>
          </div>
        </div>

        {/* Watchlist Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              Watchlist ({watchlist.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : watchlistCoins.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Your watchlist is empty
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start adding cryptocurrencies to track their performance
                </p>
                <Link href="/">
                  <Button>Browse Markets</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        #
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        Coin
                      </th>
                      <th className="text-right p-4 font-medium text-muted-foreground">
                        Price
                      </th>
                      <th className="text-right p-4 font-medium text-muted-foreground">
                        24h %
                      </th>
                      <th className="text-right p-4 font-medium text-muted-foreground">
                        Market Cap
                      </th>
                      <th className="text-right p-4 font-medium text-muted-foreground">
                        Volume
                      </th>
                      <th className="text-center p-4 font-medium text-muted-foreground">
                        Remove
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {watchlistCoins.map((coin) => (
                      <tr
                        key={coin.id}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-4 text-muted-foreground">
                          {coin.market_cap_rank}
                        </td>
                        <td className="p-4">
                          <Link
                            href={`/coin/${coin.id}`}
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                          >
                            <Image
                              src={coin.image || "/placeholder.svg"}
                              alt={coin.name}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                            <div>
                              <div className="font-medium">{coin.name}</div>
                              <div className="text-sm text-muted-foreground uppercase">
                                {coin.symbol}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="p-4 text-right font-medium">
                          {formatCurrency(coin.current_price)}
                        </td>
                        <td className="p-4 text-right">
                          <Badge
                            variant={
                              coin.price_change_percentage_24h >= 0
                                ? "default"
                                : "destructive"
                            }
                            className={
                              coin.price_change_percentage_24h >= 0
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : ""
                            }
                          >
                            {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                            {coin.price_change_percentage_24h.toFixed(2)}%
                          </Badge>
                        </td>
                        <td className="p-4 text-right font-medium">
                          {formatLargeNumber(coin.market_cap)}
                        </td>
                        <td className="p-4 text-right text-muted-foreground">
                          {formatLargeNumber(coin.total_volume)}
                        </td>
                        <td className="p-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromWatchlist(coin.id)}
                            className="hover:bg-red-100 dark:hover:bg-red-900 text-red-600"
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
