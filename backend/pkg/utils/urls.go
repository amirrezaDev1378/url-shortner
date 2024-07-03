package utils

import (
	"golang.org/x/net/html"
	"strings"
)

const (
	UA_Android = "Mozilla/5.0 (Linux; Android 13; SAMSUNG SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.101 Mobile Safari/537.36"
	UA_IOS     = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Mobile/15E148 Safari/604.1"
	UA_Windows = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5672.126 Safari/537.36"
	UA_Mac     = "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5672.126 Safari/537.36"
	UA_Linux   = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5672.126 Safari/537.36"
)

// IsValidHTML TODO :this function does not work , fix it
func IsValidHTML(htmlStr string) bool {
	_, err := html.Parse(strings.NewReader(htmlStr))
	return err == nil
}
