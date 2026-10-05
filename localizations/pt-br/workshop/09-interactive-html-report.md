# Etapa 9: Gere um relatório HTML interativo

> **Tempo:** 15 minutos  
> **Pré-requisito:** Conclua a Etapa 8: Selecione um modelo.

## O que você vai criar

O relatório Markdown é útil em um terminal, mas seus achados são mais fáceis de explorar em um
navegador. Você permitirá que a mesma sessão de relatório crie um arquivo
`accessibility-report.html` autônomo e, em seguida, o abrirá localmente e filtrará seus achados.

## Adicione uma capacidade restrita de escrita

As ferramentas anteriores pertencentes ao aplicativo são somente leitura, e o Playwright pode
navegar apenas para uma URL exata. Esta etapa adiciona duas ferramentas internas do runtime:
`builtin:apply_patch` e `builtin:create`. Qualquer uma das ferramentas pode criar o arquivo de
relatório.

Isso **não** significa aprovar todas as alterações de arquivo. Mantenha a regra existente de
navegação no navegador e aprove uma escrita somente quando ela apontar para
`accessibility-report.html` diretamente no diretório de trabalho do aplicativo. Rejeite comandos de
shell, outras escritas de arquivo e todas as outras solicitações de permissão.

O prompt do relatório permanece baseado em evidências: ele deve navegar, ler o snapshot da execução
atual e consultar as orientações do catálogo antes de escrever o artefato HTML.

:::language dotnet
## Defina o escopo da permissão de escrita em .NET

Substitua `CreateForTarget` em `Helpers/WorkshopPermissionHandler.cs`. O auxiliar agora também
recebe o diretório do aplicativo e permite apenas o único caminho de relatório normalizado:

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

Mantenha os métodos auxiliares existentes. Em `Program.cs`, passe o `workingDirectory` existente e
adicione as ferramentas internas qualificadas pela origem:

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

Substitua o corpo de `CreateReportPrompt` em `Helpers/Prompts.cs`:

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
## Defina o escopo da permissão de escrita em Node.js

Em `src/workshop.ts`, substitua `permissionForTarget` por uma versão que preserve a navegação exata
e adicione apenas o caminho de relatório normalizado:

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

Em `src/report.ts`, passe o diretório de trabalho para o manipulador e acrescente as ferramentas
internas a `availableTools`:

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

Substitua `reportPrompt` em `src/workshop.ts`:

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
## Defina o escopo da permissão de escrita em Python

Em `workshop.py`, substitua `permission_for_target` por esta versão ciente de caminho:

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

Em `report.py`, passe o diretório atual para o manipulador de permissões e acrescente as ferramentas
internas qualificadas pela origem:

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

Substitua `report_prompt` em `workshop.py`:

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
## Defina o escopo da permissão de escrita em Go

Substitua `permissionForTarget` em `main.go`. O ramo de escrita resolve nomes de arquivo relativos
em relação ao diretório de trabalho do aplicativo, portanto um caminho irmão ou pai é rejeitado:

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

Passe `workingDirectory` para o auxiliar e acrescente as ferramentas internas qualificadas pela origem:

```go
AvailableTools:      []string{"accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate", "builtin:apply_patch", "builtin:create"},
OnPermissionRequest: permissionForTarget(target, workingDirectory),
```

Substitua `reportPrompt`:

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
## Defina o escopo da permissão de escrita em Rust

Adicione `report_path: PathBuf` a `ScopedPermissions`. Mantenha a extração de `permission_payload`
da Etapa 4: ela prefere o objeto `permissionRequest` aninhado quando o SDK envia um, recorre ao
objeto direto para payloads mais antigos e rejeita valores aninhados malformados. Em seguida,
adicione este ramo de escrita antes do `else` de rejeição:

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

Ao criar o manipulador de permissões, defina o novo campo e acrescente as ferramentas internas:

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

Substitua `report_prompt`:

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
## Defina o escopo da permissão de escrita em Java

Em `src/main/java/workshop/AccessibilityReport.java`, adicione este auxiliar ao lado de `isExactNavigation`:

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

> **Aviso de segurança em destaque para Java:** O manipulador padrão continua falhando em modo fechado: ele aprova uma solicitação MCP
> somente após validação de destino exato e uma solicitação de escrita somente após
> validação do caminho de `accessibility-report.html`. As versões atuais do Java SDK não expõem esses
> campos de solicitação de permissão ([github/copilot-sdk#2273](https://github.com/github/copilot-sdk/issues/2273)).
> O sinalizador `--allow-local-demo-mcp` existente é limitado ao tipo `mcp`. A Etapa 9 também
> exige `--allow-local-demo-write`, que é limitado ao tipo `write` e à lista de permissões das ferramentas
> `builtin:apply_patch` / `builtin:create`, mas **não consegue impor o caminho de saída**.
> Habilite os dois sinalizadores
> apenas para este destino local descartável e controlado do workshop. Nunca use nenhum dos fallbacks para
> produção, worktrees compartilhadas ou não confiáveis.

Para adicionar o fallback separado de escrita, substitua o parser da Etapa 4 por:

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

Estenda a chamada `setAvailableTools` existente e o callback de permissão:

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

Substitua `reportPrompt`:

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

## Execute

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

Use o destino do workshop:

```text
{{TARGET_APP_URL}}
```

A transcrição da ferramenta deve incluir as chamadas existentes de navegação, snapshot e catálogo,
além de uma escrita usando `apply_patch` ou `create`. Abra `accessibility-report.html` em um
navegador. Digite uma palavra de um achado, critério WCAG ou linha de evidência no filtro e confirme
se os cartões visíveis e a contagem de resultados são atualizados.

<details>
<summary>Solucionar problemas desta etapa</summary>

| Sintoma | Correção |
|---|---|
| A escrita é rejeitada | O manipulador padrão exige o caminho exato de `accessibility-report.html`. Se os campos de payload do Java SDK não estiverem disponíveis, use `--allow-local-demo-write` apenas para a demonstração local controlada; ele aprova o tipo `write`, mas não consegue comprovar o caminho. |
| Mais de um arquivo é solicitado | Mantenha apenas `builtin:apply_patch` e `builtin:create` na nova capacidade interna. O manipulador padrão rejeita outros caminhos; o fallback de escrita de demonstração local em Java não consegue oferecer essa garantia. |
| O filtro não funciona | O documento gerado deve incluir JavaScript incorporado que filtre cartões e atualize a contagem de resultados em tempo real. Execute novamente uma vez se o agente omitiu um elemento obrigatório. |
| O relatório carrega sem estilo | Mantenha CSS e JavaScript incorporados no único arquivo HTML; o prompt proíbe intencionalmente ativos e bibliotecas externos. |

</details>

> **Esta etapa estará concluída quando:** `accessibility-report.html` abrir localmente e
> filtrar achados fundamentados em evidências. Com o manipulador exato padrão, a sessão não aprova nenhum outro
> caminho de arquivo; o fallback de escrita de demonstração local em Java deliberadamente não consegue oferecer essa garantia.

## Verifique seu entendimento

Por que permitir duas ferramentas internas de escrita nomeadas é mais seguro do que aprovar amplamente o acesso ao sistema de arquivos?

<details>
<summary>Verifique sua resposta</summary>

`builtin:apply_patch` e `builtin:create` expõem apenas as capacidades necessárias de escrita de
arquivo. O callback de permissão padrão vincula as duas capacidades a um único caminho de saída
normalizado. O modelo não consegue usar comandos de shell nem escrever outro arquivo, enquanto as
ferramentas locais existentes e a navegação Playwright com escopo permanecem inalteradas. O fallback
de demonstração local em Java é uma exceção explícita enquanto o SDK omite campos de payload de
permissão, portanto deve permanecer limitado a um destino local controlado.

</details>

## Saiba mais

- [Hook antes do uso de ferramentas](https://github.com/github/copilot-sdk/blob/main/docs/hooks/pre-tool-use.md):
  aprovação, negação ou reescrita de uma chamada de ferramenta antes que ela seja executada, em código, não em um prompt.
- [Referência de hooks](https://github.com/github/copilot-sdk/blob/main/docs/hooks/README.md):
  todos os hooks que o SDK expõe e a entrada que cada um recebe.
- [Configuração da CLI local](https://github.com/github/copilot-sdk/blob/main/docs/setup/local-cli.md):
  controle de qual CLI o SDK inicia, o que decide onde um arquivo escrito será colocado.

Continue para [Etapa 10: Você conseguiu!](10-complete.md) para uma comemoração e recursos para continuar criando.
