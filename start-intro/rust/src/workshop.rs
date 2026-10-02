use std::io::{self, Write};
use std::sync::Arc;
use std::time::Duration;

use async_trait::async_trait;
use github_copilot_sdk::handler::{PermissionHandler, PermissionResult};
use github_copilot_sdk::tool::{ToolHandler, schema_for};
use github_copilot_sdk::types::{
    PermissionRequestData, PermissionRequestKind, RequestId, SessionId, Tool, ToolInvocation,
};
use github_copilot_sdk::{Client, Error, ToolResult};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

const FEED_URL: &str = "https://feeds.simplecast.com/ioCY0vfY";

struct Item {
    title: Option<String>,
    published: Option<String>,
    description: Option<String>,
    link: Option<String>,
    duration: Option<String>,
}

#[derive(Debug, Serialize, Clone)]
pub struct EpisodeBrief {
    pub episode_number: Option<i32>,
    pub title: String,
    pub published: String,
    pub duration: String,
    pub description: String,
    pub episode_url: String,
    pub source_feed_url: String,
}

#[derive(Deserialize, JsonSchema)]
struct EpisodeParams {
    /// Optional GitHub Podcast episode title. Omit for the latest episode.
    episode_title: Option<String>,
}

#[derive(Deserialize, JsonSchema)]
struct EmptyParams {}

struct EpisodeTool;

#[async_trait]
impl ToolHandler for EpisodeTool {
    async fn call(&self, invocation: ToolInvocation) -> Result<ToolResult, Error> {
        let params: EpisodeParams = serde_json::from_value(invocation.arguments)?;
        let episode = get_episode(params.episode_title).await?;
        Ok(ToolResult::Text(serde_json::to_string(&episode)?))
    }
}

struct LatestEpisodesTool;

#[async_trait]
impl ToolHandler for LatestEpisodesTool {
    async fn call(&self, _invocation: ToolInvocation) -> Result<ToolResult, Error> {
        let episodes = get_latest_episodes().await?;
        Ok(ToolResult::Text(serde_json::to_string(&episodes)?))
    }
}

pub fn episode_tool() -> Tool {
    Tool::new("get_github_podcast_episode")
        .with_description("Gets a GitHub Podcast episode from the official RSS feed.")
        .with_parameters(schema_for::<EpisodeParams>())
        .with_handler(Arc::new(EpisodeTool))
}

pub fn latest_episodes_tool() -> Tool {
    Tool::new("get_latest_github_podcast_episodes")
        .with_description("Gets the ten newest GitHub Podcast episodes from the official RSS feed.")
        .with_parameters(schema_for::<EmptyParams>())
        .with_handler(Arc::new(LatestEpisodesTool))
}

/// Keeps the presenter as the approval point. Anything that is not this demo's own
/// local tool is denied, and a tool call must be approved on stdin.
struct PermissionPrompt;

#[async_trait]
impl PermissionHandler for PermissionPrompt {
    async fn handle(
        &self,
        _session_id: SessionId,
        _request_id: RequestId,
        data: PermissionRequestData,
    ) -> PermissionResult {
        let tool_name = match requested_tool_name(data) {
            Ok(tool_name) => tool_name,
            Err(feedback) => return PermissionResult::reject(feedback),
        };
        let answer = read_on_thread(move || {
            print!("Approve {tool_name}? [y/N] ");
            io::stdout().flush()?;
            let mut answer = String::new();
            io::stdin().read_line(&mut answer)?;
            Ok(answer)
        })
        .await;
        let answer = match answer {
            Ok(answer) => answer,
            Err(error) => return PermissionResult::reject(format!("Permission prompt failed: {error}")),
        };

        if answer.trim().eq_ignore_ascii_case("y") {
            PermissionResult::approve_once()
        } else {
            PermissionResult::reject("The user did not approve the episode lookup.".to_owned())
        }
    }
}

fn requested_tool_name(data: PermissionRequestData) -> Result<String, String> {
    let request = match data.extra.get("permissionRequest") {
        Some(request) => serde_json::from_value::<PermissionRequestData>(request.clone())
            .map_err(|error| format!("Invalid permission request: {error}"))?,
        None => data,
    };
    if request.kind != Some(PermissionRequestKind::CustomTool) {
        return Err("This demo only permits its GitHub Podcast episode lookup tools.".to_owned());
    }
    Ok(request
        .extra
        .get("toolName")
        .and_then(|value| value.as_str())
        .unwrap_or("custom tool")
        .to_owned())
}

async fn read_on_thread<F>(read: F) -> io::Result<String>
where
    F: FnOnce() -> io::Result<String> + Send + 'static,
{
    let (sender, receiver) = tokio::sync::oneshot::channel();
    std::thread::Builder::new()
        .name("podcast-permission-input".to_owned())
        .spawn(move || {
            // A turn timeout may have already dropped the receiver.
            let _ = sender.send(read());
        })?;
    receiver.await.map_err(io::Error::other)?
}

pub fn permission_prompt() -> Arc<dyn PermissionHandler> {
    Arc::new(PermissionPrompt)
}

pub async fn get_latest_episodes() -> Result<Vec<EpisodeBrief>, Error> {
    let items = get_items().await?;
    Ok(items.iter().take(10).map(to_episode_brief).collect())
}

pub async fn get_episode(episode_title: Option<String>) -> Result<EpisodeBrief, Error> {
    let items = get_items().await?;
    let item = if let Some(title) = episode_title.filter(|title| !title.trim().is_empty()) {
        items.iter().find(|item| item.title.as_deref().is_some_and(|candidate| candidate.eq_ignore_ascii_case(&title)))
    } else {
        items.first()
    };

    item.map(to_episode_brief)
        .ok_or_else(|| std::io::Error::other("Episode was not found in the GitHub Podcast RSS feed").into())
}

pub fn pick_episode(episodes: &[EpisodeBrief]) -> Result<EpisodeBrief, Box<dyn std::error::Error>> {
    if episodes.is_empty() {
        return Err(std::io::Error::other("No GitHub Podcast episodes are available to select.").into());
    }

    println!("\nChoose a GitHub Podcast episode:");
    for (index, episode) in episodes.iter().enumerate() {
        println!("  {}. {}", index + 1, episode.title);
    }

    Ok(episodes[read_index("Episode [1]: ", episodes.len(), 0)?].clone())
}

pub async fn select_model(client: &Client, preferred_model: &str) -> Result<Option<String>, Box<dyn std::error::Error>> {
    let models = client.list_models().await?;
    if models.is_empty() {
        return Ok(None);
    }

    let default_index = models
        .iter()
        .position(|model| model.id.eq_ignore_ascii_case(preferred_model))
        .unwrap_or(0);

    println!("Choose a Copilot model:");
    for (index, model) in models.iter().enumerate() {
        println!("  {}. {}", index + 1, model.id);
    }

    Ok(Some(models[read_index(&format!("Model [{}]: ", default_index + 1), models.len(), default_index)?].id.clone()))
}

async fn get_items() -> Result<Vec<Item>, Error> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .map_err(|error| std::io::Error::other(error.to_string()))?;
    get_items_from(&client, FEED_URL).await
}

async fn get_items_from(client: &reqwest::Client, url: &str) -> Result<Vec<Item>, Error> {
    let response = client.get(url).send()
        .await
        .map_err(|error| std::io::Error::other(error.to_string()))?
        .error_for_status()
        .map_err(|error| std::io::Error::other(error.to_string()))?;
    let xml = response
        .text()
        .await
        .map_err(|error| std::io::Error::other(error.to_string()))?;
    let document = roxmltree::Document::parse(&xml)
        .map_err(|error| std::io::Error::other(error.to_string()))?;
    Ok(document
        .descendants()
        .filter(|node| node.has_tag_name("item"))
        .map(|item| Item {
            title: child_text(item, "title", None),
            published: child_text(item, "pubDate", None),
            description: child_text(item, "description", None),
            link: child_text(item, "link", None),
            duration: child_text(item, "duration", Some("http://www.itunes.com/dtds/podcast-1.0.dtd")),
        })
        .collect())
}

fn to_episode_brief(item: &Item) -> EpisodeBrief {
    EpisodeBrief {
        episode_number: episode_number_from_title(item),
        title: item.title.clone().unwrap_or_default(),
        published: item.published.clone().unwrap_or_default(),
        duration: item.duration.clone().unwrap_or_else(|| "Unknown".to_owned()),
        description: strip_html(&item.description.clone().unwrap_or_default()),
        episode_url: item.link.clone().unwrap_or_default(),
        source_feed_url: FEED_URL.to_owned(),
    }
}

fn episode_number_from_title(item: &Item) -> Option<i32> {
    item.title
        .as_ref()?
        .split_once(':')?
        .0
        .parse::<i32>()
        .ok()
}

fn child_text(item: roxmltree::Node<'_, '_>, name: &str, namespace: Option<&str>) -> Option<String> {
    item.children()
        .find(|node| node.is_element() && node.tag_name().name() == name && node.tag_name().namespace() == namespace)
        .and_then(|node| node.text())
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_owned)
}

fn strip_html(value: &str) -> String {
    let mut result = String::new();
    let mut inside_tag = false;
    for character in value.chars() {
        match character {
            '<' => inside_tag = true,
            '>' => inside_tag = false,
            _ if !inside_tag => result.push(character),
            _ => {}
        }
    }
    result.trim().to_owned()
}

fn read_index(prompt: &str, option_count: usize, default_index: usize) -> Result<usize, Box<dyn std::error::Error>> {
    loop {
        print!("{prompt}");
        io::stdout().flush()?;
        let mut answer = String::new();
        io::stdin().read_line(&mut answer)?;
        let answer = answer.trim();
        if answer.is_empty() {
            return Ok(default_index);
        }
        if let Ok(selection) = answer.parse::<usize>() {
            if (1..=option_count).contains(&selection) {
                return Ok(selection - 1);
            }
        }
        println!("Enter a number from 1 to {option_count}.");
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use std::io::Read;
    use std::net::TcpListener;
    use std::time::Instant;

    #[test]
    fn accepts_flat_and_nested_custom_tool_requests() {
        for name in ["get_github_podcast_episode", "get_latest_github_podcast_episodes"] {
            let request = json!({"kind": "custom-tool", "toolName": name});
            for payload in [request.clone(), json!({"permissionRequest": request})] {
                let data = serde_json::from_value(payload).unwrap();
                assert_eq!(requested_tool_name(data).unwrap(), name);
            }
        }
    }

    #[test]
    fn denies_other_kinds_and_malformed_nested_requests() {
        for payload in [
            json!({"kind": "shell"}),
            json!({"permissionRequest": {"kind": "mcp"}}),
            json!({"kind": "custom-tool", "permissionRequest": null}),
            json!({"kind": "custom-tool", "permissionRequest": "invalid"}),
            json!({"permissionRequest": {}}),
        ] {
            assert!(requested_tool_name(serde_json::from_value(payload).unwrap()).is_err());
        }
    }

    #[tokio::test]
    async fn reports_input_errors() {
        let result = read_on_thread(|| Err(io::Error::other("input unavailable"))).await;
        assert_eq!(result.unwrap_err().to_string(), "input unavailable");
    }

    #[test]
    fn canceled_input_does_not_block_runtime_shutdown() {
        let (sender, receiver) = std::sync::mpsc::channel::<String>();
        let release = std::thread::spawn(move || {
            std::thread::sleep(Duration::from_millis(1500));
            sender.send("n".to_owned()).unwrap();
        });
        let runtime = tokio::runtime::Builder::new_current_thread().enable_all().build().unwrap();
        let start = Instant::now();
        let result = runtime.block_on(async {
            tokio::time::timeout(
                Duration::from_millis(20),
                read_on_thread(move || receiver.recv().map_err(io::Error::other)),
            ).await
        });
        assert!(result.is_err());
        drop(runtime);
        let elapsed = start.elapsed();
        release.join().unwrap();
        assert!(elapsed < Duration::from_secs(1), "Shutdown waited for input: {elapsed:?}");
    }

    #[tokio::test]
    async fn bounds_stalled_headers_and_bodies() {
        for send_headers in [false, true] {
            let listener = TcpListener::bind("127.0.0.1:0").unwrap();
            let url = format!("http://{}/", listener.local_addr().unwrap());
            let server = std::thread::spawn(move || {
                let (mut stream, _) = listener.accept().unwrap();
                stream.set_read_timeout(Some(Duration::from_secs(2))).unwrap();
                let mut request = [0; 4096];
                stream.read(&mut request).unwrap();
                if send_headers {
                    stream.write_all(b"HTTP/1.1 200 OK\r\nContent-Length: 100\r\n\r\n").unwrap();
                    stream.flush().unwrap();
                }
                std::thread::sleep(Duration::from_millis(500));
            });
            let client = reqwest::Client::builder().no_proxy()
                .timeout(Duration::from_millis(100)).build().unwrap();
            let start = Instant::now();
            let result = get_items_from(&client, &url).await;
            assert!(result.is_err());
            assert!(start.elapsed() < Duration::from_millis(400));
            server.join().unwrap();
        }
    }
}
