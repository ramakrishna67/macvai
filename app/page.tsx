import CoinTable from "@/components/CoinTable";

export default async function HomePage() {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false",
    {
      cache: "no-store", // Disable caching for this request
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  const coins = await res.json();

  return <CoinTable initialcoins={coins} />;
}
