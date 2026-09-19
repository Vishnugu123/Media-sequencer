import { useEffect, useRef, useState } from "react";
const CYCLE_DURATION = 5 * 60 * 60 * 1000;

const getCycleTime = (startTime) => {
  const elapsed = Date.now() - startTime;
  return elapsed % CYCLE_DURATION;
};

function MediaPlayer({
  media,
  syncing,
  syncMedia,
  syncStartAt,
}) {
  const [index, setIndex] = useState(0);
  const videoRef = useRef(null);

  const currentMedia = media[index];

  // Sync active hai to global sync media show hoga
  const displayMedia =
    syncing && syncMedia ? syncMedia : currentMedia;

  // -----------------------------
  // NORMAL PLAYLIST - IMAGE
  // -----------------------------
  useEffect(() => {
    if (!currentMedia || syncing) return;

    if (currentMedia.type === "image") {
      const timer = setTimeout(() => {
        setIndex((prev) => (prev + 1) % media.length);
      }, currentMedia.duration * 1000);

      return () => clearTimeout(timer);
    }
  }, [index, currentMedia, media, syncing]);

  // -----------------------------
  // NORMAL VIDEO AUTOPLAY
  // -----------------------------
  useEffect(() => {
    if (
      syncing ||
      !displayMedia ||
      displayMedia.type !== "video" ||
      !videoRef.current
    ) {
      return;
    }

    videoRef.current.currentTime = 0;

    videoRef.current.play().catch((error) => {
      console.log("Normal video autoplay:", error);
    });
  }, [displayMedia, syncing]);

  // -----------------------------
  // SYNC PLAYBACK
  // -----------------------------
  useEffect(() => {
    if (!syncing || !syncStartAt || !syncMedia) {
      return;
    }

    const startTime = new Date(syncStartAt).getTime();
    const elapsed = Math.max(0, Date.now() - startTime);

    console.log("Sync media:", syncMedia.name);
    console.log("Sync elapsed:", elapsed, "ms");

    if (
      syncMedia.type === "video" &&
      videoRef.current
    ) {
      const videoDuration = videoRef.current.duration;

      if (
        Number.isFinite(videoDuration) &&
        videoDuration > 0
      ) {
        const position =
          (elapsed / 1000) % videoDuration;

        videoRef.current.currentTime = position;

        videoRef.current.play().catch((error) => {
          console.log("Sync video play error:", error);
        });
      }
    }
  }, [syncing, syncStartAt, syncMedia]);

  // -----------------------------
  // NO MEDIA
  // -----------------------------
  if (!displayMedia) {
    return <div>No media configured</div>;
  }

  // -----------------------------
  // VIDEO ENDED
  // -----------------------------
  const handleVideoEnd = () => {
    if (!syncing) {
      setIndex((prev) => (prev + 1) % media.length);
    }
  };

  return (
    <div className="player">

      {/* IMAGE */}
      {displayMedia.type === "image" && (
        <img
          key={`${displayMedia.id}-${syncing}`}
          src={displayMedia.url}
          alt={displayMedia.name}
        />
      )}

      {/* VIDEO */}
      {displayMedia.type === "video" && (
        <video
          key={`${displayMedia.id}-${syncing}`}
          ref={videoRef}
          src={displayMedia.url}
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
        />
      )}

      {/* BLANK */}
      {displayMedia.type === "blank" && (
        <div className="blank-media"></div>
      )}

      {/* MEDIA NAME */}
      <div className="player-info">
        <strong>{displayMedia.name}</strong>
      </div>

    </div>
  );
}

export default MediaPlayer;