# Riziková matice — AI chatbot FuturBank CZ

**Projekt:** BankBot CZ AI Testing Portfolio  
**Verze:** 1.0 | **Datum:** Březen 2026

---

## Metodologie hodnocení

| Úroveň | Pravděpodobnost | Popis |
|--------|----------------|-------|
| **1** | Velmi nízká | Ojediněle, teoretické riziko |
| **2** | Nízká | Výjimečně, do 1x ročně |
| **3** | Střední | Příležitostně, několikrát ročně |
| **4** | Vysoká | Pravidelně, měsíčně |
| **5** | Velmi vysoká | Téměř jistě, denně |

| Úroveň | Dopad | Popis |
|--------|-------|-------|
| **1** | Zanedbatelný | Žádný vliv na zákazníky nebo operace |
| **2** | Nízký | Drobná nepohodlí, bez finančního dopadu |
| **3** | Střední | Stížnosti zákazníků, reputační škoda |
| **4** | Vysoký | Finanční ztráty, regulatorní šetření |
| **5** | Kritický | Regulatorní sankce, masivní reputační škoda, soudní spory |

---

## Vizuální riziková matice (Pravděpodobnost × Dopad)

```
DOPAD →        1-Zanedbat.   2-Nízký    3-Střední    4-Vysoký    5-Kritický
                ─────────────────────────────────────────────────────────────
P 5-Velmi vys. │    🟡  5   │  🟠  10  │  🔴  15   │  🔴  20   │  🔴  25  │
R 4-Vysoká     │    🟢  4   │  🟡   8  │  🟠  12   │  🟠  16   │  🔴  20  │
A 3-Střední    │    🟢  3   │  🟡   6  │  🟡   9   │  🟠  12   │  🔴  15  │
V 2-Nízká      │    🟢  2   │  🟢   4  │  🟡   6   │  🟡   8   │  🟠  10  │
D 1-Velmi níz. │    🟢  1   │  🟢   2  │  🟢   3   │  🟢   4   │  🟡   5  │
                ─────────────────────────────────────────────────────────────
```

**Legenda:** 🔴 Kritické (15-25) | 🟠 Vysoké (10-14) | 🟡 Střední (5-9) | 🟢 Nízké (1-4)

---

## Přehled všech rizik

| ID rizika | Název | Kategorie | Pravděp. | Dopad | Skóre | Úroveň | Testovací pokrytí |
|-----------|-------|-----------|----------|-------|-------|--------|-------------------|
| RISK-SEC-001 | Prompt Injection útok | Bezpečnost | 4 | 5 | **20** | 🔴 Kritické | SEC-001–006 |
| RISK-SEC-002 | Odhalení system promptu | Bezpečnost | 3 | 4 | **12** | 🟠 Vysoké | SEC-002, SEC-SUMMARY |
| RISK-SEC-003 | Jailbreak přes fiktivní kontext | Bezpečnost | 3 | 4 | **12** | 🟠 Vysoké | SEC-005 |
| RISK-HAL-001 | Vymýšlení finančních produktů | Halucinace | 3 | 5 | **15** | 🔴 Kritické | HAL-001–005 |
| RISK-HAL-002 | Uvádění konkrétních úrokových sazeb | Halucinace | 4 | 5 | **20** | 🔴 Kritické | HAL-002 |
| RISK-HAL-003 | Informace o konkurenci | Halucinace | 2 | 3 | **6** | 🟡 Střední | HAL-003 |
| RISK-HAL-004 | Smyšlená historická/budoucí data | Halucinace | 2 | 4 | **8** | 🟡 Střední | HAL-004 |
| RISK-BIAS-001 | Diferenciální přístup k zákazníkům | Bias | 3 | 5 | **15** | 🔴 Kritické | BIAS-001–CROSS |
| RISK-BIAS-002 | Jazyková nerovnost | Bias | 2 | 3 | **6** | 🟡 Střední | LANG-001–003 |
| RISK-CON-001 | Nekonzistentní odpovědi | Konzistence | 4 | 3 | **12** | 🟠 Vysoké | CON-001–002 |
| RISK-CON-002 | Nedodržení jazykové instrukce | Konzistence | 2 | 2 | **4** | 🟢 Nízké | LANG-001–MIXED |
| RISK-REG-001 | EU AI Act — High-Risk klasifikace | Regulace | 3 | 5 | **15** | 🔴 Kritické | — |
| RISK-REG-002 | GDPR — PII v konverzaci | Regulace | 4 | 4 | **16** | 🟠 Vysoké | — |

---

## Souhrn podle kategorií

| Kategorie | 🔴 Kritické | 🟠 Vysoké | 🟡 Střední | 🟢 Nízké | Celkem |
|-----------|------------|----------|-----------|---------|--------|
| Bezpečnost | 1 | 2 | 0 | 0 | **3** |
| Halucinace | 2 | 0 | 2 | 0 | **4** |
| Bias / Etika | 1 | 0 | 1 | 0 | **2** |
| Konzistence | 0 | 1 | 0 | 1 | **2** |
| Regulace | 1 | 1 | 0 | 0 | **2** |
| **CELKEM** | **5** | **4** | **3** | **1** | **13** |

---

## Prioritizovaný akční plán

### 🔴 Kritická rizika — okamžité řešení (blokuje nasazení)

| # | Riziko | Skóre | Hlavní opatření |
|---|--------|-------|-----------------|
| 1 | RISK-SEC-001: Prompt Injection | 20 | Anti-injection instrukce v system promptu + monitoring |
| 2 | RISK-HAL-002: Konkrétní úrokové sazby | 20 | Explicitní zákaz + regex filter v post-processingu |
| 3 | RISK-HAL-001: Vymyšlené produkty | 15 | System prompt + pravidelné testy HAL série |
| 4 | RISK-BIAS-001: Diskriminace zákazníků | 15 | Bias testy v CI/CD + quarterly audit |
| 5 | RISK-REG-001: EU AI Act | 15 | Compliance assessment + dokumentace |

### 🟠 Vysoká rizika — řešení před nasazením

| # | Riziko | Skóre | Hlavní opatření |
|---|--------|-------|-----------------|
| 1 | RISK-REG-002: GDPR | 16 | DPA s OpenAI + PII masking |
| 2 | RISK-SEC-002: System prompt odhalení | 12 | Instrukce + red-team test |
| 3 | RISK-SEC-003: Jailbreak | 12 | System prompt hardening |
| 4 | RISK-CON-001: Nekonzistentní odpovědi | 12 | Low temperature + consistency testy |

---

## Residuální rizika po implementaci opatření

Po implementaci všech zmírňujících opatření jsou očekávána residuální rizika:

| ID | Původní skóre | Residuální skóre | Úroveň po zmírnění |
|----|--------------|-----------------|---------------------|
| RISK-SEC-001 | 20 | **8** | 🟡 Střední |
| RISK-HAL-002 | 20 | **6** | 🟡 Střední |
| RISK-HAL-001 | 15 | **6** | 🟡 Střední |
| RISK-BIAS-001 | 15 | **9** | 🟡 Střední |
| RISK-REG-001 | 15 | **6** | 🟡 Střední |
| RISK-REG-002 | 16 | **8** | 🟡 Střední |

> Nulové riziko u AI systémů není dosažitelné. Cílem je udržet všechna residuální rizika na úrovni Střední nebo Nízké při plném zavedení zmírňujících opatření.

---

*Riziková matice je živý dokument — aktualizovat po každém větším releasu chatbota a po výsledcích quarterly audit.*
