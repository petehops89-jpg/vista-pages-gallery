import HubMenu from "@/components/HubMenu";

export const metadata = {
  title: "Hub · Fortnite Collection",
  description: "Control-room hub landing — 16:9 bento menu.",
};

export default function HubPage() {
  return (
    <main className="relative mx-auto max-w-3xl px-4 pb-24 pt-6">
      <HubMenu />
    </main>
  );
}
