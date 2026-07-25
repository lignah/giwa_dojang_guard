export function StorySection() {
  const steps = [
    {
      n: "01",
      title: "감사",
      body: "감사자가 컨트랙트를 리뷰하고 점수·위험도·통과 여부를 산정합니다.",
    },
    {
      n: "02",
      title: "온체인 기록",
      body: "결과를 GIWA EAS attestation으로 발행합니다. PDF만 믿지 않습니다.",
    },
    {
      n: "03",
      title: "조회·뱃지",
      body: "누구나 주소로 검색해 GIWA Verified Secure 여부를 확인합니다.",
    },
    {
      n: "04",
      title: "업비트 신뢰 신호",
      body: "Dojang Verified Address로 지갑 KYC 신뢰도까지 함께 표시합니다.",
    },
  ];

  return (
    <section className="mt-16">
      <div className="mb-8 text-center">
        <p className="text-xs font-medium tracking-widest text-indigo-300/80 uppercase">
          Why Dojang Guard
        </p>
        <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
          PDF 감사 리포트의 한계를
          <br className="sm:hidden" /> 온체인 신뢰로
        </h3>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
          한국 사용자는 업비트 수준의 신뢰를 온체인 앱에도 기대합니다. Dojang
          Guard는 GIWA의{" "}
          <span className="text-zinc-200">Dojang + EAS</span> 위에 스마트
          컨트랙트 <span className="text-zinc-200">보안 인증 레이어</span>를
          올립니다. GASOK이 찾는{" "}
          <span className="text-cyan-300/90">GIWA-native 인프라</span>입니다.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <div
            key={s.n}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="font-mono text-xs text-cyan-400/70">{s.n}</div>
            <h4 className="mt-1 font-semibold text-zinc-100">{s.title}</h4>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <TrustCard
          title="문제"
          items={[
            "감사 결과가 링크·PDF에만 존재",
            "위조·링크 소실·버전 혼동",
            "tx 전 신뢰 신호 부재",
          ]}
        />
        <TrustCard
          title="솔루션"
          items={[
            "EAS 영구 attestation",
            "표준 스키마 + 뱃지 정책",
            "주소 한 줄 검색 UX",
          ]}
        />
        <TrustCard
          title="GIWA 시너지"
          items={[
            "Dojang trust stack 재사용",
            "업비트 생태계 온보딩",
            "월렛 pre-tx 탑재 가능",
          ]}
        />
      </div>
    </section>
  );
}

function TrustCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h4 className="text-xs font-medium tracking-widest text-zinc-500 uppercase">
        {title}
      </h4>
      <ul className="mt-3 space-y-2">
        {items.map((t) => (
          <li key={t} className="flex gap-2 text-sm text-zinc-300">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400/80" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
