"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isAddress } from "viem";
import { AuditResultCard, type LookupResponse } from "./AuditResult";
import { DEMO_CONTRACTS } from "@/lib/demo-data";

const DEMO_CHIPS = [
  {
    label: "Safe 92점",
    hint: "뱃지 O · Low",
    addr: DEMO_CONTRACTS.safe,
    tone: "good" as const,
  },
  {
    label: "Medium 78점",
    hint: "뱃지 O · Medium",
    addr: DEMO_CONTRACTS.medium,
    tone: "warn" as const,
  },
  {
    label: "Critical 34점",
    hint: "뱃지 X · Fail",
    addr: DEMO_CONTRACTS.critical,
    tone: "bad" as const,
  },
] as const;

const toneClass = {
  good: "border-emerald-500/40 bg-emerald-500/10 active:bg-emerald-500/30",
  warn: "border-amber-500/40 bg-amber-500/10 active:bg-amber-500/30",
  bad: "border-rose-500/40 bg-rose-500/10 active:bg-rose-500/30",
};

function SearchPanelInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [jsReady, setJsReady] = useState(false);
  const lastQueried = useRef<string | null>(null);

  const lookup = useCallback(async (addr: string) => {
    const trimmed = addr.trim();
    if (!isAddress(trimmed)) {
      setError("유효한 이더리움 주소(0x…)를 입력하세요");
      setResult(null);
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    setActiveDemo(trimmed);
    lastQueried.current = trimmed.toLowerCase();
    try {
      const res = await fetch(
        `/api/lookup?address=${encodeURIComponent(trimmed)}`,
        { cache: "no-store" }
      );
      const data = (await res.json()) as LookupResponse;
      if (!res.ok && !data.attestation) {
        setResult(data);
        setError(data.error ?? "Not found");
      } else {
        setResult(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark hydration complete (debug aid on mobile)
  useEffect(() => {
    setJsReady(true);
  }, []);

  // Support /?address=0x... — works even if onClick is broken (real navigation)
  useEffect(() => {
    const q = searchParams.get("address");
    if (!q || !isAddress(q)) return;
    if (lastQueried.current === q.toLowerCase() && result) return;
    setAddress(q);
    void lookup(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const goDemo = (addr: string) => {
    setAddress(addr);
    // Update URL so refresh / share / no-JS path works
    router.push(`/?address=${addr}`, { scroll: false });
    void lookup(addr);
  };

  return (
    <div className="relative z-10 w-full space-y-6">
      {/* Mobile debug: if this stays gray, JS did not hydrate */}
      <p
        className={`text-[11px] ${jsReady ? "text-emerald-500/80" : "text-zinc-600"}`}
        aria-live="polite"
      >
        {jsReady ? "● 앱 준비됨 (터치 가능)" : "○ 로딩 중…"}
      </p>

      <form
        className="flex flex-col gap-3 sm:flex-row"
        action="/"
        method="get"
        onSubmit={(e) => {
          // If JS works: SPA lookup. If not: native GET /?address=
          if (jsReady) {
            e.preventDefault();
            void lookup(address);
            router.push(`/?address=${encodeURIComponent(address.trim())}`, {
              scroll: false,
            });
          }
        }}
      >
        <div className="relative min-w-0 flex-1">
          <input
            name="address"
            type="text"
            inputMode="text"
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x… contract address"
            spellCheck={false}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 font-mono text-base text-zinc-100 outline-none ring-cyan-500/40 placeholder:text-zinc-600 focus:border-cyan-500/40 focus:ring-2 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="min-h-12 cursor-pointer touch-manipulation rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition active:brightness-90 disabled:opacity-50"
        >
          {loading ? "Searching…" : "Lookup Audit"}
        </button>
      </form>

      <div className="relative z-20 space-y-2">
        <p className="text-xs font-medium text-zinc-400">
          데모 주소 — 탭하면 조회됩니다
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {DEMO_CHIPS.map((chip) => {
            const selected =
              activeDemo?.toLowerCase() === chip.addr.toLowerCase();
            // Real <a href> so mobile works even when React onClick is dead
            return (
              <a
                key={chip.addr}
                href={`/?address=${chip.addr}`}
                onClick={(e) => {
                  // SPA path when hydrated
                  if (jsReady) {
                    e.preventDefault();
                    goDemo(chip.addr);
                  }
                }}
                className={[
                  "block cursor-pointer touch-manipulation select-none rounded-xl border px-4 py-4 text-left no-underline transition",
                  "min-h-[3.5rem] active:scale-[0.98]",
                  toneClass[chip.tone],
                  selected ? "ring-2 ring-cyan-400/70" : "",
                ].join(" ")}
              >
                <div className="text-sm font-semibold text-zinc-100">
                  {chip.label}
                </div>
                <div className="mt-0.5 text-[11px] text-zinc-400">
                  {chip.hint}
                </div>
                <div className="mt-1 truncate font-mono text-[10px] text-zinc-500">
                  {chip.addr.slice(0, 10)}…{chip.addr.slice(-4)}
                </div>
              </a>
            );
          })}
        </div>
        <p className="text-[11px] leading-relaxed text-zinc-600">
          Safe·Medium → 뱃지 / Critical → 실패. 탭 후 URL에{" "}
          <code className="text-zinc-500">?address=0x…</code> 가 붙으면 정상.
        </p>
      </div>

      {error && !result?.attestation && (
        <p className="text-sm text-rose-400">{error}</p>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] py-16 text-sm text-zinc-400">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          조회 중… (EAS / Dojang)
        </div>
      )}

      {result && !loading && <AuditResultCard result={result} />}
    </div>
  );
}

export function SearchPanel() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-zinc-500">
          검색 패널 로딩…
        </div>
      }
    >
      <SearchPanelInner />
    </Suspense>
  );
}
