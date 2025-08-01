import CoinDetailPage from "@/components/CoinDetail";

export default function CoinPage({ params }: { params: { id: string } }) {
  return <CoinDetailPage id={params.id} />;
}
