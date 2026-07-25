import {
  BADGE_RULES,
  RUBRIC_VERSION,
  SCORE_BANDS,
  SCORE_CATEGORIES,
} from "@/lib/rubric";
import { BADGE_MIN_SCORE, BADGE_NAME } from "@/lib/config";

export function RubricSection() {
  return (
    <section className="mt-14 space-y-6">
      <div className="text-center">
        <p className="text-xs font-medium tracking-widest text-cyan-400/80 uppercase">
          Scoring · {RUBRIC_VERSION}
        </p>
        <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
          점수는 어떻게 매기나요?
        </h3>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-zinc-400">
          온체인 <code className="text-zinc-300">score</code>는 앱이 자동 채점한
          값이 아니라, 감사자가 아래 rubric으로 산정한{" "}
          <span className="text-zinc-200">종합 점수(0–100)</span>입니다. 세부
          근거는 리포트 URI에 남습니다.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-5">
        {SCORE_CATEGORIES.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
          >
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-xs font-semibold text-cyan-300">{c.id}</span>
              <span className="text-xs tabular-nums text-zinc-500">
                /{c.max}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-zinc-100">{c.name}</p>
            <p className="mt-1 text-[11px] leading-snug text-zinc-500">
              {c.description}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h4 className="text-xs font-medium tracking-widest text-zinc-500 uppercase">
            점수 밴드
          </h4>
          <ul className="mt-3 space-y-2">
            {SCORE_BANDS.map((b) => (
              <li
                key={b.label}
                className="flex items-start justify-between gap-3 rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium text-zinc-200">{b.label}</span>
                  <span className="ml-2 text-xs text-zinc-500">
                    risk {b.risk}
                  </span>
                  <p className="text-xs text-zinc-500">{b.meaning}</p>
                </div>
                <span className="shrink-0 font-mono text-xs text-cyan-300/90">
                  {b.min}–{b.max}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/10 to-emerald-500/5 p-5">
          <h4 className="text-xs font-medium tracking-widest text-amber-200/80 uppercase">
            {BADGE_NAME}
          </h4>
          <p className="mt-2 text-sm text-zinc-300">
            뱃지는 점수만으로 붙지 않습니다. 아래를{" "}
            <strong className="text-white">모두</strong> 만족해야 합니다.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-200">
            <li className="flex gap-2">
              <span className="text-emerald-400">✓</span>
              감사 통과 (<code className="text-xs">isPassed = true</code>)
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">✓</span>
              점수 ≥ {BADGE_MIN_SCORE} (현재{" "}
              {BADGE_RULES.minScore})
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">✓</span>
              위험도 Low 또는 Medium
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">✓</span>
              철회·만료되지 않은 attestation
            </li>
          </ul>
          <p className="mt-4 text-xs text-zinc-500">
            Critical 미해결 이슈가 있으면 점수가 높아 보여도 통과·뱃지를 주지
            않는 것이 권장 정책입니다.
          </p>
        </div>
      </div>
    </section>
  );
}
