"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Star,
  StarOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const COINS_PER_PAGE = 50;

export default function CoinTable({ initialcoins }: { initialcoins: Coin[] }) {
  const [coins, setCoins] = useState(initialcoins);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("market_cap_rank");
  const [filterBy, setFilterBy] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // Load watchlist from localStorage
  useEffect(() => {
    const savedWatchlist = localStorage.getItem("crypto-watchlist");
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  // Fetch coins data
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch coins");
        }

        const data = await response.json();
        setCoins(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, []);

  // Filter and sort coins
  const filteredAndSortedCoins = useMemo(() => {
    let filtered = coins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply filters
    if (filterBy === "gainers") {
      filtered = filtered.filter(
        (coin) => coin.price_change_percentage_24h > 0
      );
    } else if (filterBy === "losers") {
      filtered = filtered.filter(
        (coin) => coin.price_change_percentage_24h < 0
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "market_cap_rank":
          return a.market_cap_rank - b.market_cap_rank;
        case "price_desc":
          return b.current_price - a.current_price;
        case "price_asc":
          return a.current_price - b.current_price;
        case "change_desc":
          return b.price_change_percentage_24h - a.price_change_percentage_24h;
        case "change_asc":
          return a.price_change_percentage_24h - b.price_change_percentage_24h;
        default:
          return a.market_cap_rank - b.market_cap_rank;
      }
    });

    return filtered;
  }, [coins, searchTerm, sortBy, filterBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCoins.length / COINS_PER_PAGE);
  const paginatedCoins = filteredAndSortedCoins.slice(
    (currentPage - 1) * COINS_PER_PAGE,
    currentPage * COINS_PER_PAGE
  );

  // Toggle watchlist
  const toggleWatchlist = (coinId: string) => {
    const newWatchlist = watchlist.includes(coinId)
      ? watchlist.filter((id) => id !== coinId)
      : [...watchlist, coinId];

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-xl font-semibold mb-2">
                  Error Loading Data
                </h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CryptexIQ
              </h1>
              <p className="text-muted-foreground mt-3">
                Track and analyze cryptocurrency markets in real-time
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/watchlist">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Star className="w-4 h-4" />
                  Watchlist ({watchlist.length})
                </Button>
              </Link>
            </div>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Coins</p>
                    <p className="text-2xl font-bold">{coins.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">24h Gainers</p>
                    <p className="text-2xl font-bold text-green-600">
                      {
                        coins.filter(
                          (coin) => coin.price_change_percentage_24h > 0
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                    <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">24h Losers</p>
                    <p className="text-2xl font-bold text-red-600">
                      {
                        coins.filter(
                          (coin) => coin.price_change_percentage_24h < 0
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search cryptocurrencies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market_cap_rank">
                      Market Cap Rank
                    </SelectItem>
                    <SelectItem value="price_desc">
                      Price (High to Low)
                    </SelectItem>
                    <SelectItem value="price_asc">
                      Price (Low to High)
                    </SelectItem>
                    <SelectItem value="change_desc">
                      24h Change (High to Low)
                    </SelectItem>
                    <SelectItem value="change_asc">
                      24h Change (Low to High)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-full lg:w-32">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="gainers">Gainers</SelectItem>
                    <SelectItem value="losers">Losers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coins Table */}
        <Card>
          <CardHeader>
            <CardTitle>Market Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
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
            ) : (
              <>
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
                          Watch
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCoins.map((coin) => (
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
                              onClick={() => toggleWatchlist(coin.id)}
                              className="hover:bg-yellow-100 dark:hover:bg-yellow-900"
                            >
                              {watchlist.includes(coin.id) ? (
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ) : (
                                <StarOff className="w-4 h-4" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * COINS_PER_PAGE + 1} to{" "}
                      {Math.min(
                        currentPage * COINS_PER_PAGE,
                        filteredAndSortedCoins.length
                      )}{" "}
                      of {filteredAndSortedCoins.length} coins
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            const page = i + 1;
                            return (
                              <Button
                                key={page}
                                variant={
                                  currentPage === page ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="w-8 h-8 p-0"
                              >
                                {page}
                              </Button>
                            );
                          }
                        )}
                        {totalPages > 5 && (
                          <span className="text-muted-foreground">...</span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
