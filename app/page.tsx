import { ArrowRight, Leaf, LockKeyhole, Sprout, Users, Wheat } from "lucide-react"
import Link from "next/link"
import { connectDB } from "@/lib/mongodb"

export const dynamic = "force-dynamic"

async function getPublicStats() {
  const db = await connectDB()

  const [users, plants, seedResult] = await Promise.all([
    db.collection("users").countDocuments(),
    db.collection("plants").countDocuments(),
    db.collection("seeds").aggregate([{ $group: { _id: null, total: { $sum: "$plant_given" } } }]).toArray(),
  ])

  return {
    users,
    plants,
    seeds: Number(seedResult[0]?.total ?? 0),
  }
}

function formatStat(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

export default async function Home() {
  const stats = await getPublicStats()

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_32%),radial-gradient(circle_at_10%_80%,color-mix(in_oklab,var(--accent)_28%,transparent),transparent_30%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-tight">
            <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Leaf className="size-5" aria-hidden="true" />
            </span>
            <span>Alpha Garden</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <LockKeyhole className="size-3.5" aria-hidden="true" />
            <span>Growing together</span>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-20">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary">
              <Sprout className="size-3.5" aria-hidden="true" />
              A living record of every garden
            </div>
            <h1 className="max-w-xl text-5xl font-semibold leading-[0.98] tracking-[-0.06em] text-foreground sm:text-6xl lg:text-7xl">
              Small seeds. <span className="text-primary">Shared growth.</span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              Alpha Garden helps people nurture plants, keep their progress visible, and celebrate the impact of growing together.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5">
                Enter your garden
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/admin" className="inline-flex items-center justify-center rounded-xl border border-border bg-card/70 px-5 py-3 text-sm font-semibold transition-colors hover:bg-accent">
                Admin dashboard
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[3rem] bg-primary/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-card/80 p-6 shadow-2xl shadow-primary/10 backdrop-blur sm:p-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">The garden today</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">Rooted in real progress</p>
                </div>
                <div className="rounded-2xl bg-accent p-3 text-accent-foreground">
                  <Wheat className="size-5" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <StatCard icon={Sprout} value={stats.plants} label="Plants planted" />
                <StatCard icon={Users} value={stats.users} label="Gardeners" />
                <StatCard icon={Wheat} value={stats.seeds} label="Seeds shared" />
              </div>
              <div className="mt-8 rounded-2xl bg-secondary/70 p-4">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-muted-foreground">A community in motion</span>
                  <span className="text-primary">Live totals</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-background">
                  <div className="h-full w-[78%] rounded-full bg-primary" />
                </div>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">Every number above is read securely on the server from the garden database.</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-border/70 py-5 text-xs text-muted-foreground">
          A calmer way to keep every plant moving forward.
        </footer>
      </div>
    </main>
  )
}

function StatCard({ icon: Icon, value, label }: { icon: typeof Sprout; value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
      <Icon className="size-4 text-primary" aria-hidden="true" />
      <p className="mt-5 text-2xl font-semibold tracking-tight">{formatStat(value)}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
