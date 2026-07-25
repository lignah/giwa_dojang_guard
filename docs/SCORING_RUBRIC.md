# Dojang Guard — 보안 감사 점수 기준 (v1.0)

온체인 `score`(0–100)는 **감사자가 이 rubric으로 산정한 종합 점수**입니다.  
체인은 점수를 “계산”하지 않고, **감사 결과의 커밋먼트**로 기록합니다.  
세부 근거는 반드시 `reportURI`(IPFS/HTTPS 리포트)에 남깁니다.

---

## 1. 배점 구조 (총 100점)

| 영역 | 배점 | 무엇을 보나 |
|------|------|-------------|
| **A. Critical 취약점** | 0–35 | 재진입, 권한 탈취, 무한 발행, 자금 동결/탈취 경로 |
| **B. 접근제어·권한** | 0–20 | owner/role, upgrade 키, multisig, timelock |
| **C. 경제·로직** | 0–20 | 가격/oracle 조작, 정산 오류, 인센티브 공격 |
| **D. 운영·업그레이드** | 0–15 | proxy 패턴, pause, 키 로테이션, 사고 대응 |
| **E. 엔지니어링 품질** | 0–10 | 테스트 커버리지, 문서, 알려진 패턴·라이브러리 |

**감점 규칙 (권장)**  
- Critical 미해결 1건 이상 → 영역 A 최대 10점 이하, 전체 `isPassed = false` 권장  
- High 미해결 다수 → `riskLevel = High` 이상, 점수 상한 69

---

## 2. 점수 밴드

| 점수 | 의미 | 권장 riskLevel | isPassed |
|------|------|----------------|----------|
| **90–100** | 이슈 거의 없음 / 잔여 Low만 | Low | true |
| **70–89** | 통과 가능, 경미~중간 잔여 이슈 | Low / Medium | true |
| **50–69** | 중요 이슈 잔존, 프로덕션 비권장 | Medium / High | false 권장 |
| **0–49** | 심각 결함 | High / Critical | false |

---

## 3. riskLevel 정의

| Level | 정의 |
|-------|------|
| **Low** | 악용 난이도 높음, 영향 제한적, 모니터링으로 충분 |
| **Medium** | 조건부 악용 가능, 패치 권고, 한도/가드 필요 |
| **High** | 현실적 공격 경로 존재, 배포 전 수정 필수 |
| **Critical** | 직접 자금/권한 침해 가능, 즉시 조치 |

점수와 risk는 **함께 기록**합니다.  
예: 점수 78이어도 Critical 잔여가 있으면 risk는 Critical, `isPassed=false`가 맞습니다.

---

## 4. 「GIWA Verified Secure」 뱃지 규칙 (제품)

뱃지는 “마케팅 스티커”가 아니라 **온체인 attestation + 정책 필터**입니다.

| 조건 | 값 |
|------|-----|
| isPassed | `true` |
| score | **≥ 70** |
| riskLevel | **Low 또는 Medium** |
| 상태 | revoked / expired 아님 |
| attester | 공식 Auditor 주소 권장 |

```
뱃지 = isPassed && score >= 70 && risk ∈ {Low, Medium} && !revoked && !expired
```

---

## 5. 데모 케이스 (이 rubric 기준 시나리오)

| 케이스 | score | risk | pass | 뱃지 | 시나리오 |
|--------|-------|------|------|------|----------|
| Safe Vault | 92 | Low | ✅ | ✅ | A 32 + B 18 + C 18 + D 14 + E 10 |
| AMM v2 | 78 | Medium | ✅ | ✅ | A 28 + B 16 + C 14 + D 12 + E 8 |
| Broken Token | 34 | Critical | ❌ | ❌ | Critical mint bug, A 5 + 나머지 낮음 |

---

## 6. 감사 프로세스 (운영)

1. 대상 컨트랙트 주소·소스·커밋 해시 수집  
2. 정적/수동 리뷰 + (가능 시) 퍼즈/심볼릭  
3. 이슈 등급표 작성 → rubric 합산  
4. 리포트 IPFS/웹 업로드 → `reportURI`  
5. EAS `attest` (recipient = 컨트랙트 주소)  
6. 프론트/월렛에서 최신 attestation 조회 → 뱃지

---

## 7. 한계 (피치 때 솔직히)

- v1 MVP는 **감사자 신뢰**에 의존 (누가 attester인가가 중요)  
- 다음 단계: 복수 감사사 가중, 스키마 버전 업, 자동 스캐너 보조 점수  
- 점수는 면책 보증이 아님 — **리스크 신호**

---

## 8. 온체인 필드 매핑

```text
score       → 위 합산 0–100
riskLevel   → Low|Medium|High|Critical
isPassed    → 감사 정책상 배포 가능 여부
reportURI   → 상세 근거
auditor     → 감사 수행 주소
version     → rubric/스키마 버전 (v1.0)
```
