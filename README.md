# Dojang Guard

**스마트 컨트랙트 보안 감사 결과를 GIWA 체인에 남기고, 주소만 검색하면 신뢰도를 보여주는 서비스 (GASOK MVP)**

배지 이름: **GIWA Verified Secure**

---

## 이게 뭐 하는 프로젝트인가요?

블록체인 앱(디파이 등)을 쓸 때 가장 큰 불안은 이것입니다.

> “이 컨트랙트 주소, 보안 감사 받은 거 맞아? 믿어도 돼?”

보통 감사 결과는 PDF·블로그 링크에만 있어서  
**위조·링크 소실·버전 혼동**이 생기기 쉽습니다.

**Dojang Guard**는 감사 결과(점수, 위험도, 통과 여부, 리포트 링크 등)를  
GIWA에 이미 있는 **EAS(증명 서비스)** 로 온체인에 기록합니다.

| 역할 | 하는 일 |
|------|---------|
| **감사자** | 코드를 보고 점수·위험도를 매긴 뒤, 체인에 증명(attestation) 발행 |
| **이 웹앱** | 컨트랙트 주소를 넣으면 최신 감사 결과를 조회하고 뱃지 표시 |
| **일반 유저** | 스왑/민팅 전에 “검증됐는지” 한눈에 확인 |

> 이 앱이 코드를 **자동으로 해킹 검사**하는 도구는 아닙니다.  
> **감사 결과를 표준 형식으로 기록·조회**하는 신뢰 레이어입니다.

---

## 사용 흐름 (한눈에)

```text
1. 감사자가 컨트랙트를 검토
2. 점수·위험도·리포트를 EAS attestation 으로 발행 (GIWA)
3. 누구나 주소 검색 → 점수 / 위험도 / 통과 여부 확인
4. 조건을 충족하면 「GIWA Verified Secure」 뱃지 표시
```

### 뱃지가 붙는 조건 (MVP)

- 감사 **통과** (`isPassed = true`)
- **점수 70 이상**
- 위험도 **Low 또는 Medium**
- 증명이 철회·만료되지 않음

자세한 배점: [`docs/SCORING_RUBRIC.md`](./docs/SCORING_RUBRIC.md)

---

## 데모로 바로 보기

```bash
pnpm install
pnpm dev
```

브라우저: [http://localhost:3456](http://localhost:3456)

화면의 데모 버튼을 누르면 됩니다.

| 데모 | 주소 | 결과 |
|------|------|------|
| Safe | `0x1111…1111` | 점수 92 · Low · **뱃지 O** |
| Medium | `0x2222…2222` | 점수 78 · Medium · **뱃지 O** |
| Critical | `0x3333…3333` | 점수 34 · Critical · **뱃지 X** |

### 감사 리포트 (HTML)

결과 화면의 **Open audit report** 를 누르면 짧은 리포트 페이지가 열립니다.  
(앱이 직접 서빙 — `/reports/….html`)

| 케이스 | 경로 |
|--------|------|
| Safe | `/reports/safe-v1.html` |
| Medium | `/reports/medium-v1.html` |
| Critical | `/reports/critical-v1.html` |

> GitHub raw / jsDelivr 링크로 열면 브라우저가 HTML을 **평문**으로 보여줄 수 있습니다.  
> 반드시 **이 앱 주소** 기준 `/reports/...` 로 여세요.

---

## 네트워크 · 주소

| 항목 | 값 |
|------|-----|
| 체인 | GIWA Sepolia |
| Chain ID | `91342` |
| RPC | https://sepolia-rpc.giwa.io |
| Explorer | https://sepolia-explorer.giwa.io |
| SchemaRegistry | `0x4200000000000000000000000000000000000020` |
| EAS | `0x4200000000000000000000000000000000000021` |
| Auditor (데모 attester) | `0xa59C77f05A10719a374b7667DAbcfd2f9b1C2549` |

### EAS 스키마 (온체인에 저장되는 필드)

```text
address contractAddress,   // 감사 대상 컨트랙트
address auditor,           // 감사자 지갑
string auditorName,        // 감사자/기관 이름
uint8 score,               // 0~100
string riskLevel,          // Low | Medium | High | Critical
bool isPassed,             // 통과 여부
string reportURI,          // 상세 리포트 경로/URL
uint64 auditedAt,          // 감사 시각 (unix)
string version             // 예: v1.0
```

---

## 온체인 발행 (개발자용)

조회 UI만 보려면 키 없이 `pnpm dev` 로 충분합니다.  
스키마 등록·증명 발행은 attester 키가 필요합니다.

```bash
cp .env.example .env
# PRIVATE_KEY=0x...   # GIWA Sepolia ETH 필요. 깃에 올리지 말 것

pnpm schema:register   # 스키마 등록 → SCHEMA_UID 저장
pnpm attest:issue      # 데모 컨트랙트 3건 증명 발행
pnpm attest:lookup 0x1111111111111111111111111111111111111111
```

조회 우선순위:

1. 온체인 attestation (UID / 최근 로그)
2. `deployments/attestations.json`
3. 내장 데모 데이터

---

## 폴더 구조 (요약)

```text
scripts/          스키마 등록 · 증명 발행 · CLI 조회
src/app/          Next.js 페이지 + /api/lookup
src/components/   검색 · 결과 · 뱃지 UI
src/lib/          EAS, 스키마, 뱃지 규칙, Dojang 연동
public/reports/   짧은 HTML 감사 리포트
deployments/      등록·발행 결과 JSON (스키마 UID, tx 등)
docs/             공개: SCORING_RUBRIC.md
```

## 기술 스택

- 프론트: Next.js (App Router) + Tailwind + viem  
- 스크립트: TypeScript + tsx + viem  
- 체인: GIWA Sepolia 프리디플로이 EAS (별도 컨트랙트 배포 불필요)

## Dojang Verified Address (추가 신호)

컨트랙트 감사와 **별개**로, 검색한 주소가 Dojang **지갑 KYC 검증**을 받았는지도 UI에 표시합니다.

- DojangScroll: `0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9`

---

## GASOK

UPBIT × GIWA 빌더 프로그램 **GASOK** 지원용 MVP입니다.  
트랙: **GIWA-NATIVE IDEAS** (Dojang + EAS 활용)

- 공지: https://www.upbit.com/service_center/notice?id=1629960096  

---

## License

MIT
