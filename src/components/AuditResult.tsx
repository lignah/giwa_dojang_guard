"use client";

import { VerifiedBadge } from "./Badge";
import {
  AUDITOR_ADDRESS,
  explorerAddress,
  EXPLORER_URL,
  resolveReportURI,
} from "@/lib/config";
import { riskTone } from "@/lib/badge";
import type { RiskLevel } from "@/lib/types";

export interface LookupResponse {
  attestation: {
    uid: string;
    schema: string;
    time: string;
    recipient: string;
    attester: string;
    isRevoked: boolean;
    isExpired: boolean;
    source: "onchain" | "local" | "demo";
    txHash?: string;
    data: {
      contractAddress: string;
      auditor: string;
      auditorName: string;
      score: number;
      riskLevel: RiskLevel;
      isPassed: boolean;
      reportURI: string;
      auditedAt: string;
      version: string;
    };
    badge: {
      eligible: boolean;
      name: string;
      reason: string;
    };
  } | null;
  dojang?: {
    isVerified: boolean;
    attesterId: string;
    attestationUid?: string;
    expirationTime?: string;
    time?: string;
    attester?: string;
  } | null;
  error?: string;
}

const riskClass: Record<string, string> = {
  good: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  warn: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  bad: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  critical: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

function scoreColor(score: number) {
  if (score >= 85) return "text-emerald-400";
  if (score >= 70) return "text-cyan-400";
  if (score >= 50) return "text-amber-400";
  return "text-rose-400";
}

function formatTs(unix: string) {
  const n = Number(unix);
  if (!n) return "—";
  return new Date(n * 1000).toLocaleString();
}

function short(addr: string) {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function AuditResultCard({ result }: { result: LookupResponse }) {
  const att = result.attestation;

  if (!att) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-lg text-zinc-300">No audit found</p>
        <p className="mt-2 text-sm text-zinc-500">
          {result.error ??
            "This address has no Dojang Guard security attestation yet."}
        </p>
        {result.dojang && (
          <div className="mt-6 border-t border-white/5 pt-6">
            <DojangChip dojang={result.dojang} />
          </div>
        )}
      </div>
    );
  }

  const tone = riskTone(att.data.riskLevel);
  const sourceLabel =
    att.source === "onchain"
      ? "On-chain (EAS)"
      : att.source === "local"
        ? "Local deployment record"
        : "Demo data";

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-2xl shadow-black/40">
      {/* Header strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-6 py-4">
        <div>
          <p className="text-xs font-medium tracking-widest text-cyan-400/80 uppercase">
            Security Audit Result
          </p>
          <a
            href={explorerAddress(att.data.contractAddress)}
            target="_blank"
            rel="noreferrer"
            className="mt-1 font-mono text-sm text-zinc-200 hover:text-cyan-300"
          >
            {att.data.contractAddress}
          </a>
        </div>
        <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-zinc-400">
          {sourceLabel}
        </span>
      </div>

      <div className="grid gap-8 p-6 md:grid-cols-[200px_1fr]">
        {/* Badge column */}
        <div className="flex flex-col items-center justify-start gap-4 pt-2">
          <VerifiedBadge
            eligible={att.badge.eligible}
            reason={att.badge.reason}
          />
          <div
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              att.data.isPassed
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-rose-500/40 bg-rose-500/10 text-rose-300"
            }`}
          >
            {att.data.isPassed ? "PASSED" : "FAILED"}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Score + risk */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Metric
              label="Score"
              value={
                <span className={`text-3xl font-bold tabular-nums ${scoreColor(att.data.score)}`}>
                  {att.data.score}
                  <span className="text-base font-normal text-zinc-500">/100</span>
                </span>
              }
            />
            <Metric
              label="Risk Level"
              value={
                <span
                  className={`inline-flex rounded-lg border px-2.5 py-1 text-sm font-semibold ${riskClass[tone]}`}
                >
                  {att.data.riskLevel}
                </span>
              }
            />
            <Metric label="Version" value={att.data.version} />
          </div>

          {/* Score bar */}
          <div>
            <div className="mb-1.5 flex justify-between text-xs text-zinc-500">
              <span>Audit score</span>
              <span>{att.data.score}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full transition-all ${
                  att.data.score >= 70
                    ? "bg-gradient-to-r from-cyan-500 to-emerald-400"
                    : "bg-gradient-to-r from-rose-600 to-orange-400"
                }`}
                style={{ width: `${Math.min(100, att.data.score)}%` }}
              />
            </div>
          </div>

          {/* Meta grid */}
          <dl className="grid gap-3 sm:grid-cols-2">
            <Row
              label="Auditor"
              value={
                <span>
                  {att.data.auditorName}
                  <br />
                  <a
                    href={explorerAddress(att.data.auditor)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-zinc-500 hover:text-cyan-400"
                  >
                    {short(att.data.auditor)}
                  </a>
                  {att.data.auditor.toLowerCase() ===
                    AUDITOR_ADDRESS.toLowerCase() && (
                    <span className="ml-2 rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] text-cyan-400">
                      official
                    </span>
                  )}
                </span>
              }
            />
            <Row label="Audited at" value={formatTs(att.data.auditedAt)} />
            <Row
              label="On-chain attester"
              value={
                <a
                  href={explorerAddress(att.attester)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs hover:text-cyan-400"
                >
                  {short(att.attester)}
                </a>
              }
            />
            <Row
              label="Report"
              value={
                <ReportLink uri={att.data.reportURI} />
              }
            />
            <Row
              label="Attestation UID"
              value={
                <span className="font-mono text-xs text-zinc-400">
                  {short(att.uid)}
                </span>
              }
            />
            {att.txHash && (
              <Row
                label="Transaction"
                value={
                  <a
                    href={`${EXPLORER_URL}/tx/${att.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-cyan-400 hover:underline"
                  >
                    {short(att.txHash)}
                  </a>
                }
              />
            )}
          </dl>

          {result.dojang && (
            <div className="border-t border-white/5 pt-4">
              <DojangChip dojang={result.dojang} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportLink({ uri }: { uri: string }) {
  const href =
    typeof window !== "undefined"
      ? resolveReportURI(uri, window.location.origin)
      : resolveReportURI(uri);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-cyan-400 hover:underline"
    >
      Open audit report ↗
      <span className="mt-0.5 block font-mono text-[10px] text-zinc-500 break-all">
        {href}
      </span>
    </a>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
      <div className="mb-1 text-[11px] tracking-wide text-zinc-500 uppercase">
        {label}
      </div>
      <div className="text-zinc-100">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/5 bg-black/10 px-3 py-2">
      <dt className="text-[11px] tracking-wide text-zinc-500 uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-zinc-200">{value}</dd>
    </div>
  );
}

function DojangChip({
  dojang,
}: {
  dojang: NonNullable<LookupResponse["dojang"]>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-indigo-500/5 px-4 py-3">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
          dojang.isVerified
            ? "bg-indigo-500/20 text-indigo-300"
            : "bg-zinc-700/40 text-zinc-500"
        }`}
      >
        {dojang.isVerified ? "✓" : "–"}
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-200">
          Dojang Verified Address
        </p>
        <p className="text-xs text-zinc-500">
          {dojang.isVerified
            ? "This address holds a KYC Verified Address attestation (Upbit Korea issuer)."
            : "No Dojang Verified Address attestation for this address."}
        </p>
      </div>
    </div>
  );
}
