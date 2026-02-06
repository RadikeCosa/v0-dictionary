import { GameRoom } from "@/components/game/game-room";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return (
    <main className="min-h-screen flex flex-col items-center p-4 py-8">
      <GameRoom roomId={roomId} />
    </main>
  );
}
