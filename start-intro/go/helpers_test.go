package main

import (
	"errors"
	"net"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"
	"time"
)

type feedTransport struct {
	target *url.URL
}

func (transport feedTransport) RoundTrip(request *http.Request) (*http.Response, error) {
	redirected := request.Clone(request.Context())
	redirected.URL = transport.target
	return http.DefaultTransport.RoundTrip(redirected)
}

func TestPodcastFeedDeadline(t *testing.T) {
	if podcastHTTPClient.Timeout != 10*time.Second {
		t.Fatalf("RSS timeout must be ten seconds, got %v", podcastHTTPClient.Timeout)
	}
	original := podcastHTTPClient
	t.Cleanup(func() { podcastHTTPClient = original })
	for _, sendHeaders := range []bool{false, true} {
		name := "stalled headers"
		if sendHeaders {
			name = "stalled body"
		}
		t.Run(name, func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
				if sendHeaders {
					writer.WriteHeader(http.StatusOK)
					writer.(http.Flusher).Flush()
				}
				select {
				case <-request.Context().Done():
				case <-time.After(2 * time.Second):
				}
			}))
			defer server.Close()
			target, err := url.Parse(server.URL)
			if err != nil {
				t.Fatal(err)
			}
			client := *original
			client.Timeout = 100 * time.Millisecond
			client.Transport = feedTransport{target: target}
			podcastHTTPClient = &client
			start := time.Now()
			_, err = getItems()
			var timeout net.Error
			if !errors.As(err, &timeout) || !timeout.Timeout() {
				t.Fatalf("Expected a timeout, got %v", err)
			}
			if elapsed := time.Since(start); elapsed > time.Second {
				t.Fatalf("RSS request exceeded its deadline: %v", elapsed)
			}
		})
	}
}
