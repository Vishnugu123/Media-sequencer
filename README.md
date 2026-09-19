# 🎬 Multi-Window Media Sequencer

A full-stack media sequencing application that allows multiple display windows to independently play their configured media playlists while also supporting synchronized playback of a selected media item across all windows.

The project is built using React for the frontend and Go for the backend.

---

## 🚀 Live Demo

### Frontend

https://media-sequencer-six.vercel.app/

### Backend

https://media-sequencer-124f.onrender.com

### Backend Health Check

https://media-sequencer-124f.onrender.com/health

---

## ✨ Features

- Multiple independent media windows
- Image and video playback
- Continuous playlist playback
- Configurable media duration
- Dynamic media addition to any window
- Blank media support
- Select any media item for synchronized playback
- Configurable synchronization duration
- All windows switch to the selected media during synchronization
- Windows automatically return to their normal playlists after synchronization
- REST API built using Go
- Persistent application data using JSON storage
- Responsive dashboard-style interface
- Frontend deployed on Vercel
- Backend deployed on Render

---

## 🏗️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Go
- Go `net/http`
- REST APIs
- JSON-based storage

### Deployment

- Frontend: Vercel
- Backend: Render

---

## 📁 Project Structure

```text
media-sequencer/
│
├── backend/
│   ├── main.go
│   ├── playlist.go
│   │
│   ├── models/
│   │   └── models.go
│   │
│   ├── storage/
│   │   └── storage.go
│   │
│   ├── data.json
│   ├── go.mod
│   └── go.sum
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── MediaPlayer.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```
