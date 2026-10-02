package demo;

import com.sun.net.httpserver.HttpServer;
import org.junit.Test;
import org.xml.sax.SAXParseException;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpTimeoutException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import static org.junit.Assert.*;

public class GitHubPodcastEpisodeToolTest {
    private static final String RSS = """
            <rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"><channel><item>
            <title>42: GitHub &amp; Copilot</title>
            <itunes:duration>00:30:00</itunes:duration>
            <description><![CDATA[<p>Grounded facts</p>]]></description>
            </item></channel></rss>
            """;

    @Test
    public void readsNamespacedDuration() throws Exception {
        var items = GitHubPodcastEpisodeTool.parseItems(RSS.getBytes(StandardCharsets.UTF_8));
        var episode = GitHubPodcastEpisodeTool.toEpisodeBrief(items.get(0));
        assertEquals(Integer.valueOf(42), episode.episodeNumber());
        assertEquals("42: GitHub & Copilot", episode.title());
        assertEquals("00:30:00", episode.duration());
        assertEquals("Grounded facts", episode.description());
    }

    @Test
    public void rejectsInternalAndExternalDoctypes() {
        for (var declaration : new String[]{
                "<!DOCTYPE rss [<!ENTITY unsafe 'expanded content'>]>",
                "<!DOCTYPE rss [<!ENTITY unsafe SYSTEM 'file:///must-not-be-read'>]>",
                "<!DOCTYPE rss SYSTEM 'https://example.invalid/must-not-be-requested'>"
        }) {
            var xml = declaration + "<rss><channel><item><title>&unsafe;</title></item></channel></rss>";
            assertThrows(SAXParseException.class,
                    () -> GitHubPodcastEpisodeTool.parseItems(xml.getBytes(StandardCharsets.UTF_8)));
        }
    }

    @Test(timeout = 10000)
    public void boundsBothHeadersAndBodyReads() throws Exception {
        for (var sendHeaders : new boolean[]{false, true}) {
            var release = new CountDownLatch(1);
            var headersSent = new CountDownLatch(1);
            var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            server.createContext("/", exchange -> {
                try {
                    if (sendHeaders) {
                        exchange.sendResponseHeaders(200, 0);
                        exchange.getResponseBody().flush();
                        headersSent.countDown();
                    }
                    release.await(2, TimeUnit.SECONDS);
                    if (!sendHeaders) {
                        exchange.sendResponseHeaders(200, 0);
                    }
                    exchange.getResponseBody().write(RSS.getBytes(StandardCharsets.UTF_8));
                } catch (InterruptedException exception) {
                    Thread.currentThread().interrupt();
                    throw new IOException(exception);
                } finally {
                    exchange.close();
                }
            });
            server.start();
            try {
                var uri = URI.create("http://127.0.0.1:" + server.getAddress().getPort() + "/");
                var start = System.nanoTime();
                var failure = assertThrows(Exception.class, () -> GitHubPodcastEpisodeTool.readItems(
                        HttpClient.newHttpClient(), uri, Duration.ofMillis(300)));
                assertTrue("Expected a request deadline failure",
                        failure instanceof IOException && failure.getMessage().contains("timed out")
                                || failure.getCause() instanceof HttpTimeoutException);
                assertTrue("The full RSS body must be deadline-bounded",
                        System.nanoTime() - start < TimeUnit.MILLISECONDS.toNanos(1500));
                if (sendHeaders) {
                    assertEquals("The body-stall fixture must send headers", 0, headersSent.getCount());
                }
            } finally {
                release.countDown();
                server.stop(0);
            }
        }
    }
}
