package storage

import (
	"encoding/json"
	"os"

	"media-sequencer/models"
)

type Data struct {
	Windows  []models.Window  `json:"windows"`
	SyncState models.SyncState `json:"sync_state"`
}

const dataFile = "data.json"

func Save(data Data) error {
	fileData, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(dataFile, fileData, 0644)
}

func Load() (Data, error) {
	fileData, err := os.ReadFile(dataFile)

	if os.IsNotExist(err) {
		data := SeedData()

		if err := Save(data); err != nil {
			return Data{}, err
		}

		return data, nil
	}

	if err != nil {
		return Data{}, err
	}

	var data Data

	err = json.Unmarshal(fileData, &data)
	if err != nil {
		return Data{}, err
	}

	return data, nil
}

func SeedData() Data {
	return Data{
		Windows: []models.Window{
			{
				ID:   1,
				Name: "Window 1",
				Media: []models.Media{
					{
						ID:       1,
						Name:     "Welcome Image",
						Type:     "image",
						URL:      "https://picsum.photos/id/1015/800/600",
						Duration: 5,
					},
					{
						ID:       2,
						Name:     "Nature Video",
						Type:     "video",
						URL:      "https://www.w3schools.com/html/mov_bbb.mp4",
						Duration: 10,
					},
				},
			},
			{
				ID:   2,
				Name: "Window 2",
				Media: []models.Media{
					{
						ID:       3,
						Name:     "City Image",
						Type:     "image",
						URL:      "https://picsum.photos/id/1011/800/600",
						Duration: 5,
					},
					{
						ID:       4,
						Name:     "Mountain Video",
						Type:     "video",
						URL:      "https://www.w3schools.com/html/mov_bbb.mp4",
						Duration: 10,
					},
				},
			},
			{
				ID:   3,
				Name: "Window 3",
				Media: []models.Media{
					{
						ID:       5,
						Name:     "Ocean Image",
						Type:     "image",
						URL:      "https://picsum.photos/id/1016/800/600",
						Duration: 5,
					},
				},
			},
			{
				ID:   4,
				Name: "Window 4",
				Media: []models.Media{
					{
						ID:       6,
						Name:     "Forest Image",
						Type:     "image",
						URL:      "https://picsum.photos/id/1018/800/600",
						Duration: 5,
					},
				},
			},
		},
	}
}