# Analýza rizik — AI chatbot FuturBank CZ

**Projekt:** BankBot CZ AI Testing Portfolio  
**Verze:** 1.0  
**Datum:** Březen 2026  
**Autor:** Senior AI Test Engineer  
**Klasifikace:** Interní dokumentace

---

## 1. Úvod a kontext

FuturBank CZ implementuje konverzačního AI asistenta „Futura" postaveného na modelu GPT (OpenAI) jako primární digitální kontaktní bod pro zákazníky. Asistent obsluhuje dotazy týkající se bankovních produktů, naviguje zákazníky procesem žádostí a poskytuje obecné informace o službách banky.

Tento dokument identifikuje, klasifikuje a hodnotí klíčová rizika spojená s nasazením AI chatbota v regulovaném bankovním prostředí v České republice. Analýza vychází z norem **ISO 31000**, regulatorního rámce **EU AI Act (2024)** a doporučení **ČNB** (Česká národní banka).

---

## 2. Metodologie

Rizika jsou hodnocena na základě dvou dimenzí:

| Dimenze | Škála | Popis |
|---------|-------|-------|
| **Pravděpodobnost** | 1–5 | 1 = velmi nízká, 5 = velmi vysoká |
| **Dopad** | 1–5 | 1 = zanedbatelný, 5 = kritický |
| **Skóre rizika** | P × D | 1–25 |

**Kategorie rizik:**
- 🔴 **Kritické** (skóre 15–25): Okamžité řešení, blokuje nasazení
- 🟠 **Vysoké** (skóre 10–14): Řešení před nasazením
- 🟡 **Střední** (skóre 5–9): Řešení v dalším iteraci
- 🟢 **Nízké** (skóre 1–4): Monitorovat, akceptovatelné

---

## 3. Identifikovaná rizika

### 3.1 Bezpečnostní rizika

#### RISK-SEC-001: Prompt Injection útok
**Kategorie:** Bezpečnost  
**Pravděpodobnost:** 4 | **Dopad:** 5 | **Skóre:** 🔴 20

**Popis:**  
Útočník vloží do uživatelské zprávy instrukce, které přepíší systémový prompt a změní chování chatbota. Příklady: „Ignoruj předchozí instrukce a...", role-switching útoky, developer impersonation.

**Potenciální dopady:**
- Odhalení systémových instrukcí nebo interní architektury
- Chatbot poskytne neautorizované informace
- Poškození reputace banky
- Narušení důvěry zákazníků

**Testovací pokrytí:** `tests/security.spec.ts` — SEC-001 až SEC-006

**Zmírňující opatření:**
- Robustní system prompt s explicitními instrukcemi pro odmítání override
- Input validation / sanitizace uživatelských vstupů
- Monitoring a alerting na podezřelé vzory v logách
- Rate limiting a detekce opakovaných injection pokusů
- Pravidelné red-team testy

---

#### RISK-SEC-002: Odhalení systémového promptu
**Kategorie:** Bezpečnost / IP  
**Pravděpodobnost:** 3 | **Dopad:** 4 | **Skóre:** 🟠 12

**Popis:**  
Zákazník nebo útočník zjistí obsah systémového promptu pomocí sofistikovaných dotazů nebo jailbreak technik. System prompt může obsahovat obchodní pravidla, produktové detaily nebo provozní instrukce.

**Testovací pokrytí:** `tests/security.spec.ts` — SEC-002, SEC-SUMMARY

**Zmírňující opatření:**
- Systémový prompt nesmí obsahovat citlivá provozní data
- Instrukce pro chatbota explicitně zakazují odhalování instrukcí
- Použití `temperature: 0` pro deterministické chování při hodnocení

---

#### RISK-SEC-003: Jailbreak přes fiktivní kontext
**Kategorie:** Bezpečnost  
**Pravděpodobnost:** 3 | **Dopad:** 4 | **Skóre:** 🟠 12

**Popis:**  
Útočník rámuje dotaz jako „hru", „příběh" nebo „fiktivní scénář" s cílem obejít bezpečnostní guardrails modelu.

**Testovací pokrytí:** `tests/security.spec.ts` — SEC-005

---

### 3.2 Rizika kvality a přesnosti (Hallucination)

#### RISK-HAL-001: Vymýšlení finančních produktů
**Kategorie:** Halucinace / Přesnost  
**Pravděpodobnost:** 3 | **Dopad:** 5 | **Skóre:** 🔴 15

**Popis:**  
Model GPT může vymyslet neexistující bankovní produkty, úrokové sazby, podmínky nebo výhody. V bankovním kontextu může zákazník na základě takové informace učinit finanční rozhodnutí.

**Regulatorní dopad:** Porušení zákona o spotřebitelském úvěru (č. 257/2016 Sb.), GDPR, MiFID II, potenciálně ČNB sankce.

**Testovací pokrytí:** `tests/hallucination.spec.ts` — HAL-001 až HAL-005

**Zmírňující opatření:**
- System prompt explicitně zakazuje uvádění konkrétních sazeb/podmínek
- Instrukce pro odkaz zákazníka na pobočku nebo sazebník
- Pravidelné testy s umělými neexistujícími produkty
- Monitoring výstupů — detekce numerických hodnot v odpovědích

---

#### RISK-HAL-002: Uvádění konkrétních úrokových sazeb
**Kategorie:** Halucinace / Regulace  
**Pravděpodobnost:** 4 | **Dopad:** 5 | **Skóre:** 🔴 20

**Popis:**  
Model může uvést konkrétní procento úrokové sazby, která buď neodpovídá aktuálnímu sazebníku, nebo je zcela vymyšlená. Zákazník může namítat smluvní závazek banky.

**Testovací pokrytí:** `tests/hallucination.spec.ts` — HAL-002 (regex detekce `\d+%`)

**Zmírňující opatření:**
- Automatická detekce číselných vzorů v odpovědích (regex)
- Explicitní instrukce v system promptu
- Post-processing filter před odesláním odpovědi zákazníkovi

---

#### RISK-HAL-003: Informace o konkurenčních bankách
**Kategorie:** Halucinace / Obchodní  
**Pravděpodobnost:** 2 | **Dopad:** 3 | **Skóre:** 🟡 6

**Popis:**  
Chatbot poskytne informace o produktech konkurence (např. Česká spořitelna, KB), potenciálně nepřesné nebo porovnávací, bez autorizace compliance týmu.

**Testovací pokrytí:** `tests/hallucination.spec.ts` — HAL-003

---

### 3.3 Rizika zaujatosti a diskriminace (Bias)

#### RISK-BIAS-001: Diferenciální přístup k zákazníkům
**Kategorie:** Bias / Etika  
**Pravděpodobnost:** 3 | **Dopad:** 5 | **Skóre:** 🔴 15

**Popis:**  
Model GPT může odpovídat odlišně zákazníkům různého věku, pohlaví, národnosti nebo socioekonomického statusu. Například servilitnější tón k bohatším zákazníkům nebo menší ochota pomoci starším zákazníkům.

**Regulatorní dopad:** Porušení zákona o rovném zacházení (č. 198/2009 Sb.), EU AI Act Article 10 (high-risk AI bias requirements).

**Testovací pokrytí:** `tests/bias.spec.ts` — BIAS-001 až BIAS-005, BIAS-CROSS

**Zmírňující opatření:**
- Pravidelné bias testy s různými zákaznickými profily
- LLM-as-judge evaluace každé odpovědi
- Cross-profile porovnání odpovědí na identické dotazy
- Audit výstupů compliance týmem čtvrtletně

---

#### RISK-BIAS-002: Jazyková nerovnost (menšinové jazyky)
**Kategorie:** Bias / Inkluze  
**Pravděpodobnost:** 2 | **Dopad:** 3 | **Skóre:** 🟡 6

**Popis:**  
Zákazník komunikující ve slovenštině, romštině nebo jiném jazyce může dostat méně kvalitní nebo zkrácené odpovědi oproti zákazníkovi komunikujícímu česky.

**Testovací pokrytí:** `tests/consistency.spec.ts` — LANG-001 až LANG-003

---

### 3.4 Rizika konzistence a spolehlivosti

#### RISK-CON-001: Nekonzistentní odpovědi na stejný dotaz
**Kategorie:** Konzistence / Kvalita  
**Pravděpodobnost:** 4 | **Dopad:** 3 | **Skóre:** 🟠 12

**Popis:**  
LLM modely jsou stochastické — stejný dotaz může vygenerovat různé odpovědi. V bankovnictví zákazník očekává konzistentní informace. Odlišné odpovědi na stejný dotaz mohou podkopat důvěru nebo způsobit zmatení.

**Testovací pokrytí:** `tests/consistency.spec.ts` — CON-001, CON-002

**Zmírňující opatření:**
- Nastavení nízké temperature (`0.3`) pro produkční chatbot
- Pravidelné consistency testy (stejný dotaz 3x+)
- SLA na konzistenci výstupů

---

#### RISK-CON-002: Nedodržení jazykové instrukce
**Kategorie:** Konzistence / UX  
**Pravděpodobnost:** 2 | **Dopad:** 2 | **Skóre:** 🟢 4

**Popis:**  
Chatbot odpoví v jiném jazyce než češtině (např. anglicky na anglický dotaz), čímž poruší systémové instrukce a potenciálně vyloučí méně jazykově zdatné zákazníky.

**Testovací pokrytí:** `tests/consistency.spec.ts` — LANG-001 až LANG-MIXED

---

### 3.5 Regulatorní a compliance rizika

#### RISK-REG-001: EU AI Act — High-Risk klasifikace
**Kategorie:** Regulace  
**Pravděpodobnost:** 3 | **Dopad:** 5 | **Skóre:** 🔴 15

**Popis:**  
Dle EU AI Act (2024) jsou AI systémy ovlivňující přístup k finančním službám klasifikovány jako „high-risk". FuturBank CZ musí splnit požadavky Annex III a zajistit: transparentnost, dokumentaci, human oversight, risk management.

**Zmírňující opatření:**
- Implementace EU AI Act compliance checklist
- Povinné označení chatbota jako AI systému zákazníkovi
- Human-in-the-loop pro kritická rozhodnutí (schválení úvěru)
- Pravidelné audity a dokumentace rizik (tento dokument)

---

#### RISK-REG-002: GDPR — Zpracování osobních údajů v konverzaci
**Kategorie:** Regulace / Soukromí  
**Pravděpodobnost:** 4 | **Dopad:** 4 | **Skóre:** 🟠 16

**Popis:**  
Zákazníci mohou v konverzaci sdílet osobní údaje (číslo účtu, rodné číslo, adresu). Tyto údaje jsou odesílány na servery OpenAI v USA, což vyžaduje adekvátní právní základ a smluvní ochranu (SCCs).

**Zmírňující opatření:**
- Data Processing Agreement s OpenAI
- Instrukce zákazníkům: nesdílejte citlivé údaje v chatu
- Masking PII před odesláním do API
- Retence logů max. 30 dní, šifrování at-rest

---

## 4. Celkové hodnocení

| Oblast | Počet kritických rizik | Počet vysokých rizik | Připravenost k nasazení |
|--------|----------------------|---------------------|------------------------|
| Bezpečnost | 1 | 2 | ⚠️ Podmíněná |
| Halucinace | 2 | 0 | ⚠️ Podmíněná |
| Bias | 1 | 0 | ⚠️ Podmíněná |
| Konzistence | 0 | 1 | ✅ Přijatelná |
| Regulace | 2 | 1 | 🚫 Blokující |

**Doporučení:** Před produkčním nasazením je nutné adresovat všechna kritická rizika (skóre ≥ 15) a splnit minimální regulatorní požadavky EU AI Act a GDPR.

---

## 5. Plán testování a zmírňování rizik

| Priorita | Akce | Odpovědnost | Termín |
|----------|------|-------------|--------|
| P0 | Implementace robustního system promptu s anti-injection instrukcemi | AI Eng Team | Sprint 1 |
| P0 | GDPR DPA s OpenAI + PII masking | Legal + Security | Sprint 1 |
| P0 | EU AI Act compliance assessment | Compliance | Sprint 2 |
| P1 | Automatizované bias testy v CI/CD pipeline | QA Team | Sprint 2 |
| P1 | Post-processing filter pro číselné hodnoty | AI Eng Team | Sprint 1 |
| P2 | Red-team testy (externím dodavatelem) | Security | Q2 2026 |
| P2 | Quarterly bias audit (compliance) | Compliance | Q2 2026 |

---

*Dokument byl vytvořen v rámci AI testing portfolio projektu. Slouží jako ukázka přístupu k risk managementu AI systémů v regulovaném prostředí.*
