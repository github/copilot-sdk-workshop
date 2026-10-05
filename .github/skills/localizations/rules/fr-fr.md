# fr-fr

These rules apply to **both roles**: the `translator` agent uses them as generation directives (how to write the French text), and the `evaluator` agent uses them as review criteria (what to check and flag). Wherever a rule says "flag" or "look for", the translator should read it as "produce text that satisfies this".

In general, producing and evaluating translation quality requires both accuracy of meaning and natural flow. Verify that the text passes core tests for accuracy, fluency, consistency, and cultural appropriateness.

The four core pillars are:

- **Accuracy:** Preserve the source meaning exactly, without additions, distortions, or omissions.
- **Fluency:** Follow French grammar, spelling, typography, and idiom so the text reads as native French from France.
- **Terminology & Consistency:** Use specialized terms, names, and recurring phrases uniformly.
- **Cultural Appropriateness:** Adapt idioms, examples, register, and regional vocabulary for readers in France.

## English to French (France) Localization Scenario

English-to-French translation quality is best evaluated by checking grammatical agreement, idiomatic sentence structure, consistent treatment of the reader, French typography, and terminology appropriate to France. Avoid both English calques and unintended Canadian French usage.

### Key Evaluation Pillars for French (France)

- **Regional Standard:** Use `fr-FR` vocabulary and conventions. Prefer forms understood naturally in France, such as **fichier**, **ordinateur**, **cliquer**, **se connecter**, **e-mail**, and **télécharger**, according to context. Do not use Canadian-specific forms such as **courriel** or **clavardage** unless the product glossary requires them.
- **Reader Address and Register:** For technical documentation, use a professional, direct style with **vous**. Do not alternate between **vous**, **tu**, and impersonal **on** as forms of address within a document.
- **Grammatical Agreement:** Verify gender, number, articles, elision and contractions (`l'`, `d'`, `au`, `du`, `des`), past participle agreement, and adjective agreement, especially around untranslated product names and code terms.
- **Natural Syntax:** Restructure dense English noun stacks and repeated possessives. French generally needs prepositions, articles, or relative clauses rather than long sequences of nominal modifiers.
- **Typography:** Put a non-breaking space before `:`, `;`, `?`, and `!`, and inside guillemets (`« »`). Use guillemets for quotations in prose. Do not capitalize the word after a colon unless it independently requires it, and capitalize only the first word of a heading (plus proper nouns).

### Common Translation Mistakes to Flag

- **English Calques:** Flag literal renderings such as *adresser un problème* for "address an issue", *supporter* for "support", *faire du sens*, or *définitivement* for "definitely". Prefer **traiter un problème**, **prendre en charge**, **avoir du sens**, and **sans aucun doute**.
- **False Friends:** Check terms such as *actually*, *eventually*, *library*, *consistent*, and *to assume*. Depending on context, use **en réalité**, **finalement**, **bibliothèque**, **cohérent**, and **supposer**, not misleading cognates such as *librairie* or *consistant*.
- **Present Participle and Passive Overuse:** Do not copy English `-ing` forms and passives mechanically. Prefer an infinitive, a relative clause, an active verb, or a construction with **on** or the reflexive when it reads more naturally and responsibility is unchanged.
- **Possessive Overuse:** English repeats "your" and "its" more often than French. Use the definite article when the referent is clear, but preserve ownership where it affects meaning.
- **Title Case:** Flag English-style capitalization of every word in headings and labels.

### Practical Evaluation Framework

| Evaluation Metric | What to Look For (English to French Context) |
| :--- | :--- |
| **Accuracy (exactitude)** | Are every fact, condition, number, name, and logical relationship preserved? |
| **Fluency (fluidité)** | Would a reader in France understand each sentence immediately without detecting English syntax? |
| **Style Guide (style)** | Are agreement, accents, typography, capitalization, and regional conventions correct? |

## Markdown Syntaxes

Keep Markdown delimiters attached to the text they format, while placing French punctuation outside or inside the formatted span according to what is semantically emphasized. Do not allow translated punctuation, articles, or the non-breaking space to enter URLs, code spans, or link targets.

- Correct: `Consultez la [**documentation de Node.js**](https://nodejs.org/).`
- Incorrect: `Consultez la **[documentation de Node.js](https://nodejs.org/).**` when the final period is not part of the link text.

A bold label that ends in a colon keeps the non-breaking space inside the bold span, for example `**Durée :**`. Elision applies before a code span or a Latin-script name only when the pronunciation calls for it; when in doubt, restructure the sentence rather than attaching `l'` or `d'` to a code span.

When a translated heading changes its generated slug, update every same-document link to the localized anchor. Preserve external URLs exactly.

## Localization for Technical Documents for Developers

French developer documentation should be precise and concise. Translate established concepts when the French term is conventional, but retain product names, API names, identifiers, commands, and widely recognized technology terms when translating them would reduce clarity.

### Developer-Specific Evaluation Rules

#### Terminology and English Terms

- Use established equivalents such as **chaîne (de caractères)**, **tableau**, **dépendance**, **thread/fil d'exécution** according to the product glossary, **instance**, **dépôt**, **bibliothèque**, and **prise en charge**. Do not vary synonyms casually within one file.
- Keep recognized forms such as **API**, **SDK**, **framework**, **runtime**, **prompt**, **streaming**, product names, and protocol names when that is the normal developer usage or the product glossary requires it. Give retained English nouns a stable gender (for example **le prompt**, **le SDK**, **l'API** feminine).
- For critical or unfamiliar jargon, the first occurrence in a file may include the English source term in parentheses when it improves lookup, for example **environnement d'exécution (runtime)**. Apply this selectively.
- Keep variables, function names, APIs, CLI commands (`npm install`), file names, and code exactly as in the source. Translate only human-language comments and explanatory prose inside code blocks.

#### Tone and Instructions

- Use concise professional prose. Write instructions in the imperative with **vous**, such as **Exécutez la commande suivante**. The infinitive is acceptable for short UI labels and list headings, but keep one pattern per list.
- Avoid unnecessary courtesy formulas. Do not make instructions less direct by padding them with **veuillez** or **merci de** unless the source is itself a request.
- Preserve distinctions among requirements (**doit/devez**), recommendations (**il est recommandé de/devrait**), and possibilities (**peut/pouvez**). Never weaken or strengthen normative language.

#### Syntactic Readability for Code Logic

- Put prerequisites and conditions before outcomes when that improves comprehension: **Si la clé est absente, une erreur se produit.**
- Treat variables as grammatical units without changing them: **Ici, `userId` identifie l'utilisateur.**
- Avoid ambiguous pronouns after sentences containing several possible antecedents; repeat the precise noun where needed.

### Quick Quality Checklist for Developer Docs

| What to Flag (Bad) | What to Approve (Good) | Why it Matters |
| :--- | :--- | :--- |
| **"le SDK supporte le streaming"** | **"le SDK prend en charge le streaming"** | Avoids a false friend while keeping the established loanword. |
| **"lancez `npm install`:"** | **"exécutez `npm install` :"** | Uses the conventional verb and French spacing before the colon. |
| Switching between **tu** and **vous** | One consistent treatment (**vous**) | Keeps the documentation voice stable. |
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
| 1 | **Accuracy (exactitude)** | Meaning matches the source exactly; all facts, numbers, names, conditions, and modality are preserved. | Any mistranslation, negation flip, fabricated/dropped fact, altered number/name, or changed requirement level occurs. |
| 2 | **Markdown & Structural Integrity** | Frontmatter keys, Markdown, tables, external URLs, and heading order are preserved; localized anchors resolve; image paths point to real assets. | Any link or asset path is broken, a frontmatter key is translated, an English anchor remains after its heading changes, or Markdown/table structure is corrupted. |

### Tier B — Graded Criteria (Must Score at Least 4)

| # | Criterion | Scores 5 when… | Pass floor — Score 4 | Fail ceiling — Score 3 | Scores 1 when… |
| :-- | :--- | :--- | :--- | :--- | :--- |
| 3 | **Fluency (fluidité)** | Reads as native `fr-FR`; grammar, accents, agreement, syntax, and typography are correct; no calques or participle misuse. | At most 2 minor slips that do not impede reading. | Any awkward calque requiring rereading, or 3+ language errors. | English-shaped or ungrammatical prose is pervasive. |
| 4 | **Register & Reader Address** | Professional register and treatment (**vous**) fit the audience and remain uniform. | One isolated treatment slip that does not shift the perceived voice. | Two or more treatment shifts, or an audience-inappropriate tone. | Register and reader address are inconsistent throughout. |
| 5 | **Terminology & Consistency** | Terms follow `fr-FR` conventions and the product glossary; each concept is rendered consistently. | One minor inconsistency remains understandable. | Two or more inconsistent renderings, a false friend, or one misleading term. | Terminology is unreliable throughout. |
| 6 | **Regional & Linguistic Naturalness** | Idioms, possessives, passives, typography, and regional vocabulary are natural for France without unnecessary source-language interference. | One or two harmless regional or stylistic nits. | Several calques, English-style title case or spacing, or inconsistent regional forms. | The text consistently sounds translated or targets the wrong locale. |
| 7 | **Code & Command Integrity** *(technical only — Tier A severity: any violation caps this at ≤2)* | Variables, identifiers, APIs, file names, and commands are unchanged; only human-language comments are translated. | — (no trivial tolerance) | A single identifier, file name, or command is altered. | Code and commands are repeatedly translated or corrupted. |
| 8 | **Developer Terminology Convention** *(technical only)* | Established French and retained English terms match actual developer usage; over-translation is avoided. | One borderline but recognizable choice. | A forced translation or nonstandard term would confuse a developer. | Technical concepts are consistently rendered unnaturally. |

> Criterion 7 has Tier A severity in practice: any altered command or identifier fails the document.

**Overall result:** PASS only if Criteria 1–2 equal 5 and every applicable Criterion 3–8 is at least 4, with no Criterion 7 violation. Otherwise FAIL and iterate, up to the 3-iteration escalation cap. Score each defect under the most specific criterion and do not double-penalize it.
