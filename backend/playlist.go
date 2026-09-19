package main

import (
	"time"

	"media-sequencer/models"
)

const cycleDuration = 5 * time.Hour

func getCurrentMedia(window models.Window, startTime time.Time) *models.Media {

	if len(window.Media) == 0 {
		return nil
	}

	elapsed := time.Since(startTime)

	// 5-hour cycle ke andar wapas le aao
	elapsed = elapsed % cycleDuration

	var current time.Duration

	for i := range window.Media {

		duration := time.Duration(window.Media[i].Duration) * time.Second

		if elapsed < current+duration {
			return &window.Media[i]
		}

		current += duration
	}

	// Playlist 5 hours se chhoti hai,
	// isliye playlist repeat hogi.
	elapsed = elapsed % current

	current = 0

	for i := range window.Media {

		duration := time.Duration(window.Media[i].Duration) * time.Second

		if elapsed < current+duration {
			return &window.Media[i]
		}

		current += duration
	}

	return &window.Media[len(window.Media)-1]
}