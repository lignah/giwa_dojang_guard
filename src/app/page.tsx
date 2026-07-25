import { SearchPanel } from "@/components/SearchPanel";
import { StorySection } from "@/components/StorySection";
import { RubricSection } from "@/components/RubricSection";
import {
  AUDITOR_ADDRESS,
  AUDIT_SCHEMA,
  CHAIN_ID,
  EAS_ADDRESS,
  EXPLORER_URL,
  PROJECT_NAME,
  SCHEMA_REGISTRY_ADDRESS,
  BADGE_NAME,
  BADGE_MIN_SCORE,
} from "@/lib/config";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Decorative bg only — never capture taps */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-40 left-1/2 h-[480px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-1/3 right-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 pb-24 pt-10 sm:px-6">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-500 text-lg font-bold text-slate-950 shadow-lg shadow-cyan-500/30">
              道
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">
                {PROJECT_NAME}
              </h1>
              <p className="text-xs text-zinc-500">
                On-chain security attestations for GIWA
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1.5 text-[11px] font-medium text-indigo-200">
              GASOK · GIWA-native
            </span>
            <a
              href={EXPLORER_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-cyan-500/40 hover:text-cyan-300"
            >
              GIWA Sepolia · {CHAIN_ID}
            </a>
          </div>
        </header>

        {/* Hero */}
        <section className="mb-10 text-center">
          <div className="mb-4 inline-flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              {BADGE_NAME}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
              UPBIT × GIWA trust layer
            </span>
          </div>
          <h2 className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            이 컨트랙트,
            <br />
            믿어도 될까요?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">
            보안 감사 결과를{" "}
            <span className="text-zinc-200">GIWA 온체인 증명(EAS)</span>으로
            남기고, 통과한 컨트랙트에{" "}
            <span className="text-amber-200/90">{BADGE_NAME}</span> 뱃지를
            붙입니다. 주소만 검색하면 점수·위험도·Dojang 연동 신뢰도를 한눈에
            확인하세요.
          </p>
          <p className="mx-auto mt-3 max-w-lg text-xs text-zinc-600">
            점수 70+ · 통과 · Low/Medium 위험도일 때만 뱃지 발급 (기준 점수{" "}
            {BADGE_MIN_SCORE})
          </p>
        </section>

        {/* Search */}
        <SearchPanel />

        <StorySection />
        <RubricSection />

        {/* Network / schema info */}
        <section className="mt-14 grid gap-4 sm:grid-cols-2">
          <InfoCard title="Network">
            <ul className="space-y-1.5 font-mono text-xs text-zinc-400">
              <li>
                <span className="text-zinc-600">Chain ID</span> · {CHAIN_ID}
              </li>
              <li>
                <span className="text-zinc-600">EAS</span> ·{" "}
                <MonoLink href={`${EXPLORER_URL}/address/${EAS_ADDRESS}`}>
                  {short(EAS_ADDRESS)}
                </MonoLink>
              </li>
              <li>
                <span className="text-zinc-600">Registry</span> ·{" "}
                <MonoLink
                  href={`${EXPLORER_URL}/address/${SCHEMA_REGISTRY_ADDRESS}`}
                >
                  {short(SCHEMA_REGISTRY_ADDRESS)}
                </MonoLink>
              </li>
            </ul>
          </InfoCard>
          <InfoCard title="Auditor / Attester">
            <ul className="space-y-1.5 font-mono text-xs text-zinc-400">
              <li className="font-sans text-sm text-zinc-200">
                Dojang Guard Auditor
              </li>
              <li>
                <MonoLink href={`${EXPLORER_URL}/address/${AUDITOR_ADDRESS}`}>
                  {AUDITOR_ADDRESS}
                </MonoLink>
              </li>
            </ul>
          </InfoCard>
          <InfoCard title="EAS Schema" className="sm:col-span-2">
            <code className="block break-all rounded-lg bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-cyan-200/80">
              {AUDIT_SCHEMA}
            </code>
          </InfoCard>
        </section>

        <footer className="mt-16 space-y-2 border-t border-white/5 pt-8 text-center text-xs text-zinc-600">
          <p>
            {PROJECT_NAME} · GASOK MVP · Powered by EAS + Dojang on GIWA
          </p>
          <p>
            Built for{" "}
            <a
              href="https://giwa.io/gasok"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 hover:text-cyan-400"
            >
              UPBIT × GIWA GASOK
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 ${className}`}
    >
      <h3 className="mb-3 text-xs font-medium tracking-widest text-zinc-500 uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
}

function MonoLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="hover:text-cyan-400"
    >
      {children}
    </a>
  );
}

function short(a: string) {
  return `${a.slice(0, 8)}…${a.slice(-6)}`;
}
