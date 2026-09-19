package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"media-sequencer/models"
	"media-sequencer/storage"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprint(w, `{"status":"ok"}`)
}

func windowsHandler(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	data, err := storage.Load()
	if err != nil {
		http.Error(w, "Failed to load windows", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(data.Windows)
}

func addMediaHandler(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// URL: /media/1
	parts := strings.Split(r.URL.Path, "/")

	if len(parts) != 3 {
		http.Error(w, "Use /media/{windowId}", http.StatusBadRequest)
		return
	}

	windowID, err := strconv.Atoi(parts[2])
	if err != nil {
		http.Error(w, "Invalid window ID", http.StatusBadRequest)
		return
	}

	var media models.Media

	err = json.NewDecoder(r.Body).Decode(&media)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	data, err := storage.Load()
	if err != nil {
		http.Error(w, "Failed to load data", http.StatusInternalServerError)
		return
	}

	found := false

	for i := range data.Windows {

		if data.Windows[i].ID == windowID {

			data.Windows[i].Media = append(
				data.Windows[i].Media,
				media,
			)

			found = true
			break
		}
	}

	if !found {
		http.Error(w, "Window not found", http.StatusNotFound)
		return
	}

	err = storage.Save(data)
	if err != nil {
		http.Error(w, "Failed to save data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(media)
}

func syncHandler(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var request struct {
		MediaID  int `json:"media_id"`
		Duration int `json:"duration"`
	}

	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if request.MediaID <= 0 || request.Duration <= 0 {
		http.Error(w, "media_id and duration must be positive", http.StatusBadRequest)
		return
	}

	data, err := storage.Load()
	if err != nil {
		http.Error(w, "Failed to load data", http.StatusInternalServerError)
		return
	}

	data.SyncState = models.SyncState{
		Active:   true,
		MediaID:  request.MediaID,
		Duration: request.Duration,
		StartAt:  time.Now().UTC().Format(time.RFC3339Nano),
	}

	err = storage.Save(data)
	if err != nil {
		http.Error(w, "Failed to save sync state", http.StatusInternalServerError)
		return
	}

	// Automatically stop sync after duration
	go func(mediaID int, duration int) {

		time.Sleep(time.Duration(duration) * time.Second)

		data, err := storage.Load()
		if err != nil {
			return
		}

		if data.SyncState.Active &&
			data.SyncState.MediaID == mediaID {

			data.SyncState.Active = false
			storage.Save(data)
		}

	}(request.MediaID, request.Duration)

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(data.SyncState)
}

func syncStatusHandler(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	data, err := storage.Load()
	if err != nil {
		http.Error(w, "Failed to load sync state", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(data.SyncState)
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		origin := r.Header.Get("Origin")

		// Local development + deployed frontend
		if origin == "http://localhost:5173" ||
			origin == "http://127.0.0.1:5173" {

			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set(
				"Access-Control-Allow-Headers",
				"Content-Type",
			)
		}

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {

	data, err := storage.Load()
	if err != nil {
		fmt.Println("Failed to load data:", err)
		return
	}

	fmt.Println("Windows loaded:", len(data.Windows))

	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/windows", windowsHandler)
	http.HandleFunc("/media/", addMediaHandler)
	http.HandleFunc("/sync", syncHandler)
	http.HandleFunc("/sync/status", syncStatusHandler)

	fmt.Println("Server running on port 8080")

	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	fmt.Println("Server running on port", port)

	err = http.ListenAndServe(":"+port, enableCORS(http.DefaultServeMux))
	if err != nil {
		fmt.Println("Server error:", err)
	}
}
