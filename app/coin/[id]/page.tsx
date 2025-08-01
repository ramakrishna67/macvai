import { use } from "react";
import CoinDetailPage from "@/components/CoinDetail";

export default function CoinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <CoinDetailPage id={id} />;
}
