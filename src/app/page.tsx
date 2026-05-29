import { AddCardButton } from "@/components/AddCardButton";
import { CardGrid } from "@/components/CardGrid";
import { Greeting } from "@/components/Greeting";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getStoredName } from "@/lib/cookies";

export default async function HomePage() {
  const name = await getStoredName();

  return (
    <main className="min-h-screen mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 py-8 sm:py-12 lg:py-16 overflow-x-hidden">
      <header className="flex items-start justify-between gap-4 mb-8 sm:mb-12">
        <Greeting initialName={name} />
        <div className="flex items-center gap-2 shrink-0">
          <AddCardButton />
          <ThemeToggle />
        </div>
      </header>
      <CardGrid />
    </main>
  );
}
