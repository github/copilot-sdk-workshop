# de-de

These rules apply to **both roles**: the `translator` agent uses them as generation directives (how to write the German text), and the `evaluator` agent uses them as review criteria (what to check and flag). Wherever a rule says "flag" or "look for", the translator should read it as "produce text that satisfies this".

In general, producing and evaluating translation quality requires both accuracy of meaning and natural flow. Verify that the text passes core tests for accuracy, fluency, consistency, and cultural appropriateness.

The four core pillars are:

- **Accuracy:** Preserve the source meaning exactly, without additions, distortions, or omissions.
- **Fluency:** Follow German grammar, spelling, punctuation, and idiom so the text reads as native German from Germany.
- **Terminology & Consistency:** Use specialized terms, names, and recurring phrases uniformly.
- **Cultural Appropriateness:** Adapt idioms, examples, register, and regional vocabulary for readers in Germany.

## English to German (Germany) Localization Scenario

English-to-German translation quality is best evaluated by checking case, gender, and number agreement, verb placement, compound formation, consistent treatment of the reader, and terminology appropriate to Germany. Avoid both English calques and unintended Swiss or Austrian usage.

### Key Evaluation Pillars for German (Germany)

- **Regional Standard:** Use `de-DE` spelling under the current orthography, including **ß** where it applies (**schließen**, **groß**), not the Swiss **ss** forms. Prefer vocabulary understood naturally in Germany, such as **Datei**, **Ordner**, **anmelden**, **speichern**, and **herunterladen**.
- **Reader Address and Register:** For technical documentation, use a professional, direct style with formal **Sie**. Do not alternate between **Sie**, **du**, and impersonal **man** as forms of address within a document. Capitalize **Sie**, **Ihr**, and **Ihnen**.
- **Grammatical Agreement:** Verify case, gender, number, article and adjective endings, and the gender assigned to untranslated product names and code terms (for example **das SDK**, **die API**, **der Prompt**). Keep the chosen gender stable.
- **Natural Syntax:** Place the finite verb correctly in main and subordinate clauses, keep separable prefixes with their verbs (**Führen Sie … aus**), and split long English sentences instead of building nested clause chains.
- **Compounds and Hyphens:** Write compounds as one word or with hyphens under German rules. Join a foreign-language name or abbreviation to a German noun with a hyphen (**MCP-Server**, **SDK-Sitzung**, **Copilot-Sitzung**). Never leave an English-style open compound such as *Copilot Sitzung*.
- **Capitalization and Punctuation:** Capitalize all nouns, use German comma rules for subordinate and infinitive clauses, and use German quotation marks (**„…“**) in prose. Do not copy English title case into headings.

### Common Translation Mistakes to Flag

- **English Calques:** Flag literal renderings such as *Sinn machen* for "make sense", *in 2024*, *es gibt keinen Weg* for "there is no way", or *adressieren* for "address an issue". Prefer **sinnvoll sein/Sinn ergeben**, **2024/im Jahr 2024**, **es ist nicht möglich**, and **beheben/behandeln**.
- **False Friends:** Check terms such as *actual*, *eventually*, *to control*, *consistent*, and *library*. Depending on context, use **tatsächlich**, **schließlich**, **steuern**, **einheitlich/konsistent**, and **Bibliothek**, not misleading cognates such as *aktuell*, *eventuell*, or *kontrollieren*.
- **Nominal Style and Passive Overuse:** Avoid chains of nouns ending in **-ung** and stacked genitives. Prefer a verb, and prefer active voice or a construction with **lässt sich** when responsibility is unchanged.
- **Anglicism Overuse:** Do not keep an English word when an established German term is normal developer usage (**Datei**, not *File*; **Abhängigkeit**, not *Dependency*). Conversely, do not force a German term on an established loanword such as **Prompt** or **Streaming**.
- **Possessive Overuse:** English repeats "your" and "its" more often than German. Use the definite article when the referent is clear, but preserve ownership where it affects meaning.

### Practical Evaluation Framework

| Evaluation Metric | What to Look For (English to German Context) |
| :--- | :--- |
| **Accuracy (Genauigkeit)** | Are every fact, condition, number, name, and logical relationship preserved? |
| **Fluency (Sprachfluss)** | Would a reader in Germany understand each sentence immediately without detecting English syntax? |
| **Style Guide (Stil)** | Are agreement, capitalization, compounds, punctuation, and regional conventions correct? |

## Markdown Syntaxes

Keep Markdown delimiters attached to the text they format, while placing German punctuation outside or inside the formatted span according to what is semantically emphasized. Do not allow translated punctuation, articles, or hyphens to enter URLs, code spans, or link targets.

- Correct: `Lesen Sie die [**Node.js-Dokumentation**](https://nodejs.org/).`
- Incorrect: `Lesen Sie die **[Node.js-Dokumentation](https://nodejs.org/).**` when the final period is not part of the link text.

A code span may form a compound with a following German noun through a hyphen placed outside the span (**die `SendAsync`-Methode**), or stand in apposition (**die Methode `SendAsync`**). Never attach a German ending to the span itself (*`SendAsync`s*) and never move the hyphen inside the backticks.

When a translated heading changes its generated slug, update every same-document link to the localized anchor. Preserve external URLs exactly.

## Localization for Technical Documents for Developers

German developer documentation should be precise and concise. Translate established concepts when the German term is conventional, but retain product names, API names, identifiers, commands, and widely recognized technology terms when translating them would reduce clarity.

### Developer-Specific Evaluation Rules

#### Terminology and English Terms

- Use established equivalents such as **Zeichenfolge**, **Array**, **Abhängigkeit**, **Thread**, **Instanz**, **Repository**, **Bibliothek**, **Sitzung**, and **Berechtigung** according to the product glossary. Do not vary synonyms casually within one file.
- Keep recognized forms such as **API**, **SDK**, **Framework**, **Runtime/Laufzeit** according to the glossary, **Prompt**, **Streaming**, **Tool**, product names, and protocol names when that is the normal developer usage or the product glossary requires it.
- For critical or unfamiliar jargon, the first occurrence in a file may include the English source term in parentheses when it improves lookup, for example **Laufzeitumgebung (runtime)**. Apply this selectively.
- Keep variables, function names, APIs, CLI commands (`npm install`), file names, and code exactly as in the source. Translate only human-language comments and explanatory prose inside code blocks.

#### Tone and Instructions

- Use concise professional prose. Write instructions in the imperative with **Sie**, such as **Führen Sie den folgenden Befehl aus**. The infinitive is acceptable for short UI labels and list headings (**Datei speichern**), but keep one pattern per list.
- Avoid unnecessary courtesy formulas. Do not make instructions less direct by padding them with **bitte** unless the source is itself a request.
- Preserve distinctions among requirements (**muss/müssen**), recommendations (**sollte/es wird empfohlen**), and possibilities (**kann/können**). Never weaken or strengthen normative language. Note that **muss nicht** means "need not", and **darf nicht** means "must not".

#### Syntactic Readability for Code Logic

- Put prerequisites and conditions before outcomes when that improves comprehension: **Wenn der Schlüssel fehlt, tritt ein Fehler auf.**
- Treat variables as grammatical units without changing them: **Hier identifiziert `userId` den Benutzer.**
- Avoid ambiguous pronouns after sentences containing several possible antecedents; repeat the precise noun where needed.

### Quick Quality Checklist for Developer Docs

| What to Flag (Bad) | What to Approve (Good) | Why it Matters |
| :--- | :--- | :--- |
| **"der MCP Server"** | **"der MCP-Server"** | German compounds with a foreign name take a hyphen. |
| **"Das macht Sinn, weil das SDK kontrolliert die Sitzung"** | **"Das ist sinnvoll, weil das SDK die Sitzung steuert"** | Avoids a calque, a false friend, and wrong verb placement. |
| Switching between **du** and **Sie** | One consistent treatment (**Sie**) | Keeps the documentation voice stable. |
| Translating `StringBuilder` | Keeping `StringBuilder` unchanged | Preserves the identifier exactly. |

## Evaluator Scoring Rubric

This is the **definitive pass/fail gate** for the `evaluator` role. Criteria are split into two tiers:

- **Tier A — Hard-fail criteria:** any material defect makes the document unusable, so these **must score 5 to pass**.
- **Tier B — Graded criteria:** scored on the 1–5 scale below; these **pass at 4 or 5**.

A document **PASSES only when every applicable Tier A criterion scores 5 and every applicable Tier B criterion scores 4 or 5.** Otherwise it FAILS and is returned to the translator with specific notes that cite the offending source/target snippets and criterion. If the same subjective criterion still fails after **3 iterations**, escalate to a human.

Tier B scale:

- **5 — Excellent:** Fully meets the criterion; no issues.
- **4 — Good (pass):** At most 1–2 trivial, non-blocking nits per ~1,000 words.
- **3 — Borderline (fail):** Several noticeable issues, or any issue that changes how a sentence reads.
- **2 — Poor (fail):** Frequent or significant violations.
- **1 — Unacceptable (fail):** The criterion is largely unmet.

### Determining Content Type

- **Technical documentation** is content for developers/operators or any document containing code, commands, or API identifiers. Criteria 7–8 apply.
- **Non-technical content** is UI, marketing, narrative, or conversational copy without code. Criteria 7–8 do not apply, and Criterion 4 uses the audience-appropriate register.

If otherwise non-technical content contains occasional code or links, Criterion 2 and Criterion 7 still apply to those spans.

### Tier A — Hard-Fail Criteria (Must Score 5)

| # | Criterion | Passes (5) when… | Fails (<5) when… |
| :-- | :--- | :--- | :--- |
| 1 | **Accuracy (Genauigkeit)** | Meaning matches the source exactly; all facts, numbers, names, conditions, and modality are preserved. | Any mistranslation, negation flip, fabricated/dropped fact, altered number/name, or changed requirement level occurs. |
| 2 | **Markdown & Structural Integrity** | Frontmatter keys, Markdown, tables, external URLs, and heading order are preserved; localized anchors resolve; image paths point to real assets. | Any link or asset path is broken, a frontmatter key is translated, an English anchor remains after its heading changes, or Markdown/table structure is corrupted. |

### Tier B — Graded Criteria (Must Score at Least 4)

| # | Criterion | Scores 5 when… | Pass floor — Score 4 | Fail ceiling — Score 3 | Scores 1 when… |
| :-- | :--- | :--- | :--- | :--- | :--- |
| 3 | **Fluency (Sprachfluss)** | Reads as native `de-DE`; grammar, case endings, verb placement, compounds, and punctuation are correct; no calques. | At most 2 minor slips that do not impede reading. | Any awkward calque requiring rereading, or 3+ language errors. | English-shaped or ungrammatical prose is pervasive. |
| 4 | **Register & Reader Address** | Professional register and treatment (**Sie**) fit the audience and remain uniform. | One isolated treatment slip that does not shift the perceived voice. | Two or more treatment shifts, or an audience-inappropriate tone. | Register and reader address are inconsistent throughout. |
| 5 | **Terminology & Consistency** | Terms follow `de-DE` conventions and the product glossary; each concept is rendered consistently, with a stable gender for retained English nouns. | One minor inconsistency remains understandable. | Two or more inconsistent renderings, a false friend, or one misleading term. | Terminology is unreliable throughout. |
| 6 | **Regional & Linguistic Naturalness** | Idioms, possessives, passives, compounds, and regional vocabulary are natural for Germany without unnecessary source-language interference. | One or two harmless regional or stylistic nits. | Several calques, open compounds, heavy nominal style, or inconsistent regional forms. | The text consistently sounds translated or targets the wrong locale. |
| 7 | **Code & Command Integrity** *(technical only — Tier A severity: any violation caps this at ≤2)* | Variables, identifiers, APIs, file names, and commands are unchanged; only human-language comments are translated. | — (no trivial tolerance) | A single identifier, file name, or command is altered. | Code and commands are repeatedly translated or corrupted. |
| 8 | **Developer Terminology Convention** *(technical only)* | Established German and retained English terms match actual developer usage; over-translation is avoided. | One borderline but recognizable choice. | A forced translation or nonstandard term would confuse a developer. | Technical concepts are consistently rendered unnaturally. |

> Criterion 7 has Tier A severity in practice: any altered command or identifier fails the document.

**Overall result:** PASS only if Criteria 1–2 equal 5 and every applicable Criterion 3–8 is at least 4, with no Criterion 7 violation. Otherwise FAIL and iterate, up to the 3-iteration escalation cap. Score each defect under the most specific criterion and do not double-penalize it.
