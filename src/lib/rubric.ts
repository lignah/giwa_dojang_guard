/** Public scoring rubric v1.0 — mirrors docs/SCORING_RUBRIC.md */

export const RUBRIC_VERSION = "v1.0";

export const SCORE_CATEGORIES = [
  {
    id: "A",
    name: "Critical 취약점",
    max: 35,
    description: "재진입, 권한 탈취, 자금 동결/탈취 경로",
  },
  {
    id: "B",
    name: "접근제어·권한",
    max: 20,
    description: "owner/role, upgrade 키, multisig, timelock",
  },
  {
    id: "C",
    name: "경제·로직",
    max: 20,
    description: "oracle 조작, 정산 오류, 인센티브 공격",
  },
  {
    id: "D",
    name: "운영·업그레이드",
    max: 15,
    description: "proxy, pause, 키 관리, 사고 대응",
  },
  {
    id: "E",
    name: "엔지니어링 품질",
    max: 10,
    description: "테스트, 문서, 검증된 패턴",
  },
] as const;

export const SCORE_BANDS = [
  {
    min: 90,
    max: 100,
    label: "Excellent",
    risk: "Low",
    meaning: "이슈 거의 없음 · 배포 적합",
  },
  {
    min: 70,
    max: 89,
    label: "Pass band",
    risk: "Low / Medium",
    meaning: "통과 가능 · 경미~중간 잔여 이슈",
  },
  {
    min: 50,
    max: 69,
    label: "Weak",
    risk: "Medium / High",
    meaning: "중요 이슈 · 프로덕션 비권장",
  },
  {
    min: 0,
    max: 49,
    label: "Fail band",
    risk: "High / Critical",
    meaning: "심각 결함 · 배포 불가 권고",
  },
] as const;

export const BADGE_RULES = {
  minScore: 70,
  allowedRisks: ["Low", "Medium"] as const,
  requirePassed: true,
} as const;
