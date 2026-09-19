package models

type Media struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Type     string `json:"type"`
	URL      string `json:"url"`
	Duration int    `json:"duration"`
}

type Window struct {
	ID    int     `json:"id"`
	Name  string  `json:"name"`
	Media []Media `json:"media"`
}

type SyncState struct {
	Active   bool   `json:"active"`
	MediaID  int    `json:"media_id"`
	Duration int    `json:"duration"`
	StartAt  string `json:"start_at"`
}
