import { JoinScreen } from "@/components/game/join-screen";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <JoinScreen roomId={roomId} />
    </main>
  );
}
