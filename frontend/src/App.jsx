import { useEffect, useState } from "react";
import MediaPlayer from "./MediaPlayer";

const API_URL = "https://media-sequencer-124f.onrender.com";

function App() {
  const [windows, setWindows] = useState([]);

  // -----------------------------
  // SYNC STATES
  // -----------------------------
  const [syncing, setSyncing] = useState(false);
  const [syncMedia, setSyncMedia] = useState(null);
  const [syncStartAt, setSyncStartAt] = useState(null);

  // Selected media for sync
  const [selectedSyncMedia, setSelectedSyncMedia] = useState("");
  const [syncDuration, setSyncDuration] = useState(10);

  // -----------------------------
  // ADD MEDIA STATES
  // -----------------------------
  const [selectedWindow, setSelectedWindow] = useState(1);
  const [mediaName, setMediaName] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaDuration, setMediaDuration] = useState(5);

  // -----------------------------
  // FETCH WINDOWS
  // -----------------------------
  const fetchWindows = () => {
    fetch(`${API_URL}/windows`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch windows");
        }

        return response.json();
      })
      .then((data) => {
        setWindows(data);

        // Set first media as default sync media
        if (!selectedSyncMedia && data.length > 0) {
          const firstMedia = data[0]?.media?.[0];

          if (firstMedia) {
            setSelectedSyncMedia(String(firstMedia.id));
          }
        }
      })
      .catch((error) => {
        console.error("Failed to fetch windows:", error);
      });
  };

  useEffect(() => {
    fetchWindows();
  }, []);

  // -----------------------------
  // ALL MEDIA
  // -----------------------------
  const allMedia = windows.flatMap((window) => window.media || []);

  // -----------------------------
  // START SYNC
  // -----------------------------
  const startSync = () => {
    if (!selectedSyncMedia) {
      alert("Please select media for sync");
      return;
    }

    const duration = Number(syncDuration);

    if (!duration || duration <= 0) {
      alert("Please enter a valid sync duration");
      return;
    }

    const media = allMedia.find(
      (item) => item.id === Number(selectedSyncMedia)
    );

    if (!media) {
      alert("Selected media not found");
      return;
    }

    fetch(`${API_URL}/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        media_id: media.id,
        duration: duration,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Sync request failed");
        }

        return response.json();
      })
      .then((data) => {
        console.log("Sync started:", data);

        setSyncMedia(media);
        setSyncStartAt(data.start_at);
        setSyncing(true);

        setTimeout(() => {
          setSyncing(false);
          setSyncStartAt(null);
          setSyncMedia(null);
        }, data.duration * 1000);
      })
      .catch((error) => {
        console.error("Sync failed:", error);

        setSyncing(false);
        setSyncStartAt(null);
        setSyncMedia(null);

        alert("Failed to start sync");
      });
  };

  // -----------------------------
  // ADD MEDIA
  // -----------------------------
  const addMedia = () => {
    if (!mediaName.trim()) {
      alert("Please enter media name");
      return;
    }

    if (!mediaDuration || Number(mediaDuration) <= 0) {
      alert("Please enter a valid duration");
      return;
    }

    // Blank media does not need URL
    if (mediaType !== "blank" && !mediaUrl.trim()) {
      alert("Please enter media URL");
      return;
    }

    const newMedia = {
      id: Date.now(),
      name: mediaName.trim(),
      type: mediaType,
      url: mediaType === "blank" ? "" : mediaUrl.trim(),
      duration: Number(mediaDuration),
    };

    fetch(`${API_URL}/media/${selectedWindow}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMedia),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add media");
        }

        return response.json();
      })
      .then(() => {
        alert("Media added successfully!");

        // Refresh windows
        fetchWindows();

        // Reset form
        setMediaName("");
        setMediaUrl("");
        setMediaDuration(5);
        setMediaType("image");
      })
      .catch((error) => {
        console.error("Add media failed:", error);
        alert("Failed to add media");
      });
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="app">

      <h1>🎬 Multi-Window Media Sequencer</h1>

      {/* ========================= */}
      {/* SYNC CONTROL */}
      {/* ========================= */}

      <div className="add-media-form">
        <h2>⚡ Sync Media</h2>

        <select
          value={selectedSyncMedia}
          onChange={(e) => setSelectedSyncMedia(e.target.value)}
          disabled={syncing}
        >
          <option value="">Select Media</option>

          {allMedia.map((media) => (
            <option key={media.id} value={media.id}>
              {media.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          value={syncDuration}
          onChange={(e) => setSyncDuration(e.target.value)}
          placeholder="Sync duration (seconds)"
          disabled={syncing}
        />

        <button
          className={syncing ? "sync-button syncing" : "sync-button"}
          onClick={startSync}
          disabled={syncing}
        >
          {syncing ? "🔄 Sync Running..." : "⚡ Start Sync"}
        </button>

        {syncing && syncMedia && (
          <p style={{ textAlign: "center", color: "#60a5fa" }}>
            Currently syncing: <strong>{syncMedia.name}</strong>
          </p>
        )}
      </div>

      {/* ========================= */}
      {/* ADD MEDIA */}
      {/* ========================= */}

      <div className="add-media-form">
        <h2>➕ Add Media</h2>

        <select
          value={selectedWindow}
          onChange={(e) => setSelectedWindow(Number(e.target.value))}
        >
          {windows.map((window) => (
            <option key={window.id} value={window.id}>
              {window.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Media name"
          value={mediaName}
          onChange={(e) => setMediaName(e.target.value)}
        />

        <select
          value={mediaType}
          onChange={(e) => setMediaType(e.target.value)}
        >
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="blank">Blank</option>
        </select>

        {mediaType !== "blank" && (
          <input
            type="text"
            placeholder="Media URL"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
          />
        )}

        <input
          type="number"
          min="1"
          placeholder="Duration (seconds)"
          value={mediaDuration}
          onChange={(e) => setMediaDuration(e.target.value)}
        />

        <button onClick={addMedia}>
          ➕ Add Media
        </button>
      </div>

      {/* ========================= */}
      {/* WINDOWS */}
      {/* ========================= */}

      <div className="windows-grid">

        {windows.map((window) => (
          <div className="window-card" key={window.id}>

            <h2>{window.name}</h2>

            <MediaPlayer
              media={window.media || []}
              syncing={syncing}
              syncMedia={syncMedia}
              syncStartAt={syncStartAt}
            />

          </div>
        ))}

      </div>

    </div>
  );
}

export default App;