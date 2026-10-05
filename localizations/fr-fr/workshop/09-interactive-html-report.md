# Étape 9 : Générez un rapport HTML interactif

> **Durée :** 15 minutes  
> **Prérequis :** Terminez l'étape 8 : Sélectionnez un modèle.

## Ce que vous allez créer

Le rapport Markdown est utile dans un terminal, mais ses constats sont plus faciles à explorer dans
un navigateur. Vous allez laisser la même session de rapport créer un fichier autonome
`accessibility-report.html`, puis l'ouvrir localement et filtrer ses constats.

## Ajoutez une capacité d'écriture ciblée

Les outils précédents propres à l'application sont en lecture seule, et Playwright ne peut naviguer
que vers une URL exacte. Cette étape ajoute deux outils intégrés du runtime : `builtin:apply_patch`
et `builtin:create`. Chacun de ces outils peut créer le fichier de rapport.

Cela ne signifie **pas** qu'il faut approuver chaque modification de fichier. Conservez la règle
existante de navigation du navigateur et approuvez une écriture uniquement lorsqu'elle cible
`accessibility-report.html` directement dans le dossier de travail de l'application. Rejetez les
commandes shell, les autres écritures de fichiers et toutes les autres demandes d'autorisation.

Le prompt de rapport reste fondé sur des preuves : il doit naviguer, lire l'instantané de
l'exécution en cours et consulter les consignes du catalogue avant d'écrire l'artefact HTML.

:::language dotnet
## Délimitez l'autorisation d'écriture .NET

Remplacez `CreateForTarget` dans `Helpers/WorkshopPermissionHandler.cs`. L'utilitaire reçoit
maintenant aussi le dossier de l'application et autorise uniquement le chemin de rapport normalisé :

```csharp
public static Func<PermissionRequest, PermissionInvocation, Task<PermissionDecision>> CreateForTarget(
    Uri allowedTarget,
    string workingDirectory)
{
    ArgumentNullException.ThrowIfNull(allowedTarget);
    var reportPath = Path.GetFullPath(Path.Combine(workingDirectory, "accessibility-report.html"));

    return (request, _) =>
    {
        var decision = request switch
        {
            PermissionRequestMcp { ServerName: "playwright" } navigation
                when IsPlaywrightTool(navigation, "browser_navigate") &&
                     IsNavigationToTarget(navigation.Args, allowedTarget) =>
                PermissionDecision.ApproveOnce(),
            PermissionRequestWrite write
                when Path.GetFullPath(write.FileName).Equals(reportPath, StringComparison.OrdinalIgnoreCase) =>
                PermissionDecision.ApproveOnce(),
            _ => PermissionDecision.Reject(
                "This workshop allows only exact target navigation and writing accessibility-report.html.")
        };

        return Task.FromResult(decision);
    };
}
```

Conservez les méthodes utilitaires existantes. Dans `Program.cs`, passez le `workingDirectory`
existant et ajoutez les outils intégrés qualifiés par leur source :

```csharp
OnPermissionRequest = WorkshopPermissionHandler.CreateForTarget(targetUri, workingDirectory),
AvailableTools =
[
    "accessibility_rule_lookup",
    "read_latest_accessibility_snapshot",
    "playwright-browser_navigate",
    "builtin:apply_patch",
    "builtin:create"
],
```

Remplacez le corps de `CreateReportPrompt` dans `Helpers/Prompts.cs` :

```csharp
public static string CreateReportPrompt(Uri targetUri) => $"""
    Prepare an evidence-based accessibility review of {targetUri.AbsoluteUri}.

    1. Use browser_navigate to open that exact URL.
    2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
    3. Identify three to five high-confidence issues supported by the snapshot.
    4. Call accessibility_rule_lookup for each issue before recommending a fix.
    5. Use apply_patch or create to create exactly accessibility-report.html in the current working directory.

    Write one complete, standalone HTML document. Use semantic HTML, embedded CSS, and embedded
    JavaScript only; do not use external assets, URLs, or libraries. Include a title, target URL,
    finding count, review limits, and one finding card per supported issue with its evidence, WCAG
    criterion, and remediation. Add an accessible text filter that updates a visible result count
    and filters cards by finding name, criterion, or evidence. Escape all finding text before
    inserting it into HTML. Make keyboard focus visible.

    Do not write any other file. After the write succeeds, respond only with:
    Created accessibility-report.html
    """;
```
:::

:::language nodejs
## Délimitez l'autorisation d'écriture Node.js

Dans `src/workshop.ts`, remplacez `permissionForTarget` par une version qui conserve la navigation
exacte et ajoute uniquement le chemin de rapport normalisé :

```typescript
export function permissionForTarget(target: URL, workingDirectory: string): PermissionHandler {
  const reportPath = resolve(workingDirectory, "accessibility-report.html");
  return (request) => {
    if (request.kind === "mcp" && request.serverName === "playwright" &&
      (request.toolName === "browser_navigate" || request.toolName === "playwright-browser_navigate") &&
      typeof request.args?.url === "string" && sameUrl(request.args.url, target)) {
      return { kind: "approve-once" };
    }
    if (request.kind === "write" && typeof request.fileName === "string" &&
      resolve(workingDirectory, request.fileName) === reportPath) {
      return { kind: "approve-once" };
    }
    return { kind: "reject", feedback: "This workshop allows only exact target navigation and writing accessibility-report.html." };
  };
}
```

Dans `src/report.ts`, passez le dossier de travail au gestionnaire et ajoutez les outils intégrés à
`availableTools` :

```typescript
onPermissionRequest: permissionForTarget(target, process.cwd()),
availableTools: [
  "accessibility_rule_lookup",
  "read_latest_accessibility_snapshot",
  "playwright-browser_navigate",
  "builtin:apply_patch",
  "builtin:create",
],
```

Remplacez `reportPrompt` dans `src/workshop.ts` :

```typescript
export function reportPrompt(target: URL): string {
  return `Prepare an evidence-based accessibility review of ${target.href}.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.
5. Use apply_patch or create to create exactly accessibility-report.html in the current working directory.

Write one complete, standalone HTML document. Use semantic HTML, embedded CSS, and embedded
JavaScript only; do not use external assets, URLs, or libraries. Include a title, target URL,
finding count, review limits, and one finding card per supported issue with its evidence, WCAG
criterion, and remediation. Add an accessible text filter that updates a visible result count
and filters cards by finding name, criterion, or evidence. Escape all finding text before
inserting it into HTML. Make keyboard focus visible.

Do not write any other file. After the write succeeds, respond only with:
Created accessibility-report.html`;
}
```
:::

:::language python
## Délimitez l'autorisation d'écriture Python

Dans `workshop.py`, remplacez `permission_for_target` par cette version qui tient compte des chemins :

```python
def permission_for_target(target: str, working_directory: str):
    report_path = Path(working_directory, "accessibility-report.html").resolve()

    def handler(request, _invocation):
        if getattr(request, "kind", None) == "mcp" and request.server_name == "playwright" and request.tool_name in {"browser_navigate", "playwright-browser_navigate"} and isinstance(request.args, dict) and isinstance(request.args.get("url"), str) and _same_url(request.args["url"], target):
            return PermissionDecisionApproveOnce()
        if getattr(request, "kind", None) == "write" and isinstance(getattr(request, "file_name", None), str):
            candidate = Path(request.file_name)
            candidate = candidate if candidate.is_absolute() else Path(working_directory, candidate)
            if candidate.resolve() == report_path:
                return PermissionDecisionApproveOnce()
        return PermissionDecisionReject(
            feedback="This workshop allows only exact target navigation and writing accessibility-report.html.")

    return handler
```

Dans `report.py`, passez le dossier actuel au gestionnaire d'autorisations et ajoutez les outils
intégrés qualifiés par leur source :

```python
on_permission_request=permission_for_target(target, "."),
available_tools=[
    "accessibility_rule_lookup",
    "read_latest_accessibility_snapshot",
    "playwright-browser_navigate",
    "builtin:apply_patch",
    "builtin:create",
],
```

Remplacez `report_prompt` dans `workshop.py` :

```python
def report_prompt(target: str) -> str:
    return f"""Prepare an evidence-based accessibility review of {target}.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.
5. Use apply_patch or create to create exactly accessibility-report.html in the current working directory.

Write one complete, standalone HTML document. Use semantic HTML, embedded CSS, and embedded
JavaScript only; do not use external assets, URLs, or libraries. Include a title, target URL,
finding count, review limits, and one finding card per supported issue with its evidence, WCAG
criterion, and remediation. Add an accessible text filter that updates a visible result count
and filters cards by finding name, criterion, or evidence. Escape all finding text before
inserting it into HTML. Make keyboard focus visible.

Do not write any other file. After the write succeeds, respond only with:
Created accessibility-report.html"""
```
:::

:::language go
## Délimitez l'autorisation d'écriture Go

Remplacez `permissionForTarget` dans `main.go`. La branche d'écriture résout les noms de fichiers
relatifs par rapport au dossier de travail de l'application ; un chemin frère ou parent est donc
rejeté :

```go
func permissionForTarget(target, workingDirectory string) copilot.PermissionHandlerFunc {
	reportPath := filepath.Join(workingDirectory, "accessibility-report.html")
	return func(request copilot.PermissionRequest, _ copilot.PermissionInvocation) (rpc.PermissionDecision, error) {
		raw, _ := json.Marshal(request)
		var value map[string]any
		if json.Unmarshal(raw, &value) == nil && value["kind"] == "mcp" && value["serverName"] == "playwright" {
			toolName, _ := value["toolName"].(string)
			args, _ := value["args"].(map[string]any)
			requested, _ := args["url"].(string)
			if (toolName == "browser_navigate" || toolName == "playwright-browser_navigate") && sameURL(requested, target) {
				return &rpc.PermissionDecisionApproveOnce{}, nil
			}
		}
		if json.Unmarshal(raw, &value) == nil && value["kind"] == "write" {
			if fileName, ok := value["fileName"].(string); ok {
				candidate := fileName
				if !filepath.IsAbs(candidate) {
					candidate = filepath.Join(workingDirectory, candidate)
				}
				if filepath.Clean(candidate) == reportPath {
					return &rpc.PermissionDecisionApproveOnce{}, nil
				}
			}
		}
		feedback := "This workshop allows only exact target navigation and writing accessibility-report.html."
		return &rpc.PermissionDecisionReject{Feedback: &feedback}, nil
	}
}
```

Passez `workingDirectory` à l'utilitaire et ajoutez les outils intégrés qualifiés par leur source :

```go
AvailableTools:      []string{"accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate", "builtin:apply_patch", "builtin:create"},
OnPermissionRequest: permissionForTarget(target, workingDirectory),
```

Remplacez `reportPrompt` :

```go
func reportPrompt(target string) string {
	return fmt.Sprintf(`Prepare an evidence-based accessibility review of %s.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.
5. Use apply_patch or create to create exactly accessibility-report.html in the current working directory.

Write one complete, standalone HTML document. Use semantic HTML, embedded CSS, and embedded
JavaScript only; do not use external assets, URLs, or libraries. Include a title, target URL,
finding count, review limits, and one finding card per supported issue with its evidence, WCAG
criterion, and remediation. Add an accessible text filter that updates a visible result count
and filters cards by finding name, criterion, or evidence. Escape all finding text before
inserting it into HTML. Make keyboard focus visible.

Do not write any other file. After the write succeeds, respond only with:
Created accessibility-report.html`, target)
}
```
:::

:::language rust
## Délimitez l'autorisation d'écriture Rust

Ajoutez `report_path: PathBuf` à `ScopedPermissions`. Conservez l'extraction `permission_payload` de
l'étape 4 : elle préfère l'objet `permissionRequest` imbriqué lorsque le SDK en envoie un, se rabat
sur l'objet direct pour les anciennes charges utiles et rejette les valeurs imbriquées mal formées.
Ajoutez ensuite cette branche d'écriture avant son `else` de rejet :

```rust
let file_name = permission_payload(&request.extra)
    .and_then(|payload| payload.get("fileName"))
    .and_then(serde_json::Value::as_str);
let report_write = request.kind == Some(PermissionRequestKind::Write)
    && file_name.is_some_and(|name| {
    let candidate = Path::new(name);
    let candidate = if candidate.is_absolute() {
        candidate.to_path_buf()
    } else {
        self.report_path.parent().unwrap_or(Path::new("")).join(candidate)
    };
    candidate == self.report_path
    });

if report_write {
    PermissionResult::approve_once()
} else if server == Some("playwright")
    && matches!(tool, Some("browser_navigate" | "playwright-browser_navigate"))
    && requested.as_ref().is_some_and(|url| same_url(url, &self.target))
{
    PermissionResult::approve_once()
} else {
    PermissionResult::reject(Some(
        "This workshop allows only exact target navigation and writing accessibility-report.html."
            .to_owned(),
    ))
}
```

Lorsque vous créez le gestionnaire d'autorisations, définissez le nouveau champ et ajoutez les outils intégrés :

```rust
config.available_tools = Some(vec![
    "accessibility_rule_lookup".to_owned(),
    "read_latest_accessibility_snapshot".to_owned(),
    "playwright-browser_navigate".to_owned(),
    "builtin:apply_patch".to_owned(),
    "builtin:create".to_owned(),
]);
let config = config.with_permission_handler(Arc::new(ScopedPermissions {
    target: target.clone(),
    report_path: working_directory.join("accessibility-report.html"),
}));
```

Remplacez `report_prompt` :

```rust
fn report_prompt(target: &Url) -> String {
    format!(
        r#"Prepare an evidence-based accessibility review of {target}.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.
5. Use apply_patch or create to create exactly accessibility-report.html in the current working directory.

Write one complete, standalone HTML document. Use semantic HTML, embedded CSS, and embedded
JavaScript only; do not use external assets, URLs, or libraries. Include a title, target URL,
finding count, review limits, and one finding card per supported issue with its evidence, WCAG
criterion, and remediation. Add an accessible text filter that updates a visible result count
and filters cards by finding name, criterion, or evidence. Escape all finding text before
inserting it into HTML. Make keyboard focus visible.

Do not write any other file. After the write succeeds, respond only with:
Created accessibility-report.html"#
    )
}
```
:::

:::language java
## Délimitez l'autorisation d'écriture Java

Dans `src/main/java/workshop/AccessibilityReport.java`, ajoutez cet utilitaire à côté de `isExactNavigation` :

```java
private static boolean isReportWrite(Map<String, Object> request, Path workingDirectory) {
    if (request == null || !(request.get("fileName") instanceof String fileName)) {
        return false;
    }
    Path candidate = Path.of(fileName);
    if (!candidate.isAbsolute()) {
        candidate = workingDirectory.resolve(candidate);
    }
    return candidate.normalize().equals(
            workingDirectory.resolve("accessibility-report.html").normalize());
}
```

> **Avertissement de sécurité Java important :** Le gestionnaire par défaut reste fermé en cas d'échec : il approuve une demande MCP
> uniquement après validation de la cible exacte et une demande d'écriture uniquement après
> validation du chemin `accessibility-report.html`. Les versions actuelles du SDK Java n'exposent pas ces
> champs de demande d'autorisation ([github/copilot-sdk#2273](https://github.com/github/copilot-sdk/issues/2273)).
> L'option `--allow-local-demo-mcp` existante est limitée au type `mcp`. L'étape 9 nécessite en plus
> `--allow-local-demo-write`, qui est limitée au type `write` et à la
> liste d'autorisation des outils `builtin:apply_patch` / `builtin:create`, mais **ne peut pas imposer le chemin de sortie**.
> Activez les deux options
> uniquement pour cette cible locale contrôlée et jetable de l'atelier. N'utilisez jamais l'une ou l'autre solution de repli pour
> des worktrees de production, partagés ou non fiables.

Pour ajouter la solution de repli d'écriture séparée, remplacez l'analyseur de l'étape 4 par :

```java
private static final String LOCAL_DEMO_MCP_FLAG = "--allow-local-demo-mcp";
private static final String LOCAL_DEMO_WRITE_FLAG = "--allow-local-demo-write";

private static RunOptions parseRunOptions(String[] args) throws URISyntaxException {
    boolean allowLocalDemoMcp = false;
    boolean allowLocalDemoWrite = false;
    String target = null;
    for (String arg : args) {
        if (LOCAL_DEMO_MCP_FLAG.equals(arg)) {
            if (allowLocalDemoMcp) {
                throw new IllegalArgumentException("Specify " + LOCAL_DEMO_MCP_FLAG + " at most once.");
            }
            allowLocalDemoMcp = true;
            continue;
        }
        if (LOCAL_DEMO_WRITE_FLAG.equals(arg)) {
            if (allowLocalDemoWrite) {
                throw new IllegalArgumentException("Specify " + LOCAL_DEMO_WRITE_FLAG + " at most once.");
            }
            allowLocalDemoWrite = true;
            continue;
        }
        if (target == null) {
            target = arg;
        } else {
            throw new IllegalArgumentException(usage());
        }
    }
    if (target == null) {
        throw new IllegalArgumentException(usage());
    }
    return new RunOptions(parseTarget(target), allowLocalDemoMcp, allowLocalDemoWrite);
}

private record RunOptions(URI target, boolean allowLocalDemoMcp, boolean allowLocalDemoWrite) {
}
```

Étendez l'appel `setAvailableTools` existant et le callback d'autorisation :

```java
.setAvailableTools(List.of(
        "accessibility_rule_lookup",
        "read_latest_accessibility_snapshot",
        "playwright-browser_navigate",
        "builtin:apply_patch",
        "builtin:create"))
// Keep the existing MCP server configuration.
.setOnPermissionRequest((request, ignored) -> {
    if ("mcp".equals(request.getKind())
            && isExactNavigation(request.getExtensionData(), target)) {
        return java.util.concurrent.CompletableFuture.completedFuture(
                PermissionRequestResult.approveOnce());
    }
    if ("write".equals(request.getKind())
            && isReportWrite(request.getExtensionData(), workingDirectory)) {
        return java.util.concurrent.CompletableFuture.completedFuture(
                PermissionRequestResult.approveOnce());
    }
    if (options.allowLocalDemoMcp() && "mcp".equals(request.getKind())) {
        return java.util.concurrent.CompletableFuture.completedFuture(
                PermissionRequestResult.approveOnce());
    }
    if (options.allowLocalDemoWrite() && "write".equals(request.getKind())) {
        return java.util.concurrent.CompletableFuture.completedFuture(
                PermissionRequestResult.approveOnce());
    }
    return java.util.concurrent.CompletableFuture.completedFuture(
            PermissionRequestResult.reject(
                    "This workshop allows only exact target navigation and writing accessibility-report.html. "
                            + "Requests without target or path data remain denied unless the explicit "
                            + "local-demo fallback for that permission kind is enabled."));
})
```

Remplacez `reportPrompt` :

```java
private static String reportPrompt(URI target) {
    return """
            Prepare an evidence-based accessibility review of %s.
            1. Use browser_navigate to open that exact URL.
            2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
            3. Identify three to five high-confidence issues supported by the snapshot.
            4. Call accessibility_rule_lookup for each issue before recommending a fix.
            5. Use apply_patch or create to create exactly accessibility-report.html in the current working directory.

            Write one complete, standalone HTML document. Use semantic HTML, embedded CSS, and embedded
            JavaScript only; do not use external assets, URLs, or libraries. Include a title, target URL,
            finding count, review limits, and one finding card per supported issue with its evidence, WCAG
            criterion, and remediation. Add an accessible text filter that updates a visible result count
            and filters cards by finding name, criterion, or evidence. Escape all finding text before
            inserting it into HTML. Make keyboard focus visible.

            Do not write any other file. After the write succeeds, respond only with:
            Created accessibility-report.html""".formatted(target);
}
```
:::

## Exécutez-le

:::language dotnet
```bash
dotnet run
```
:::
:::language nodejs
```bash
npm start -- "{{TARGET_APP_URL}}"
```
:::
:::language python
```bash
python main.py "{{TARGET_APP_URL}}"
```
:::
:::language go
```bash
go run . "{{TARGET_APP_URL}}"
```
:::
:::language rust
```bash
cargo run -- "{{TARGET_APP_URL}}"
```
:::
:::language java
```bash
./mvnw compile exec:java -Dexec.args="--allow-local-demo-mcp --allow-local-demo-write {{TARGET_APP_URL}}"
```
:::

Utilisez la cible de l'atelier :

```text
{{TARGET_APP_URL}}
```

La transcription des outils doit inclure les appels existants de navigation, d'instantané et de
catalogue, plus une écriture avec `apply_patch` ou `create`. Ouvrez `accessibility-report.html` dans
un navigateur. Saisissez dans le filtre un mot provenant d'un constat, d'un critère WCAG ou d'une
ligne de preuve, puis confirmez que les cartes visibles et le nombre de résultats se mettent à jour.

<details>
<summary>Dépannage de cette étape</summary>

| Symptôme | Correction |
|---|---|
| L'écriture est rejetée | Le gestionnaire par défaut exige le chemin `accessibility-report.html` exact. Si les champs de charge utile du SDK Java ne sont pas disponibles, utilisez `--allow-local-demo-write` uniquement pour la démonstration locale contrôlée ; elle approuve le type `write` mais ne peut pas vérifier le chemin. |
| Plus d'un fichier est demandé | Conservez uniquement `builtin:apply_patch` et `builtin:create` dans la nouvelle capacité intégrée. Le gestionnaire par défaut rejette les autres chemins ; la solution de repli d'écriture Java local-demo ne peut pas offrir cette garantie. |
| Le filtre ne fonctionne pas | Le document généré doit inclure du JavaScript intégré qui filtre les cartes et met à jour son nombre de résultats en direct. Réexécutez une fois si l'agent a omis un élément obligatoire. |
| Le rapport se charge sans style | Gardez CSS et JavaScript intégrés dans l'unique fichier HTML ; le prompt interdit intentionnellement les ressources et bibliothèques externes. |

</details>

> **Cette étape est terminée lorsque :** `accessibility-report.html` s'ouvre localement et
> filtre les constats étayés par des preuves. Avec le gestionnaire exact par défaut, la session n'approuve aucun autre
> chemin de fichier ; la solution de repli d'écriture Java local-demo ne peut délibérément pas offrir cette garantie.

## Vérifiez votre compréhension

Pourquoi autoriser deux outils d'écriture intégrés nommés est-il plus sûr que d'approuver largement l'accès au système de fichiers ?

<details>
<summary>Vérifiez votre réponse</summary>

`builtin:apply_patch` et `builtin:create` exposent uniquement les capacités d'écriture de fichier
requises. Le callback d'autorisation par défaut lie les deux capacités à un seul chemin de sortie
normalisé. Le modèle ne peut pas utiliser de commandes shell ni écrire un autre fichier, tandis que
les outils locaux existants et la navigation Playwright à périmètre limité restent inchangés. La
solution de repli Java local-demo est une exception explicite tant que le SDK omet les champs de
charge utile d'autorisation ; elle doit donc rester limitée à une cible locale contrôlée.

</details>

## En savoir plus

- [Hook avant utilisation d'un outil](https://github.com/github/copilot-sdk/blob/main/docs/hooks/pre-tool-use.md) :
  approuver, refuser ou réécrire un appel d'outil avant son exécution, dans le code plutôt que dans un prompt.
- [Référence des hooks](https://github.com/github/copilot-sdk/blob/main/docs/hooks/README.md) :
  tous les hooks que le SDK expose, et l'entrée que chacun reçoit.
- [Configuration du CLI local](https://github.com/github/copilot-sdk/blob/main/docs/setup/local-cli.md) :
  contrôler quel CLI le SDK démarre, ce qui détermine où un fichier écrit est déposé.

Continuez avec [Étape 10 : Vous avez réussi !](10-complete.md) pour célébrer et trouver des ressources afin de continuer à créer.
