# 🐍 Snake Revolution  
### The Ultimate Modern Snake Experience

Snake Revolution is a fully modernized remake of the classic Snake game — rebuilt for the web using **HTML5 Canvas**, **JavaScript**, and **Firebase**.  
It features **12 unique arcade modes**, global leaderboards, polished UI, dynamic themes, and responsive gameplay designed for desktop browsers.

Play it, improve it, or fork it — this is Snake like you've never seen before.

---

## 🌟 Features

### 🎮 **12 Arcade Modes**
Each game mode comes with unique rules, mechanics, and difficulty:

1. **Classic Mode** — Endless gameplay with progressive speed-up  
2. **Time Attack** — 60s timer, wrap-around walls  
3. **Obstacle** — Static & moving obstacles  
4. **Speed Rush** — Speed increases every 3 foods  
5. **Maze** — Predefined maze layout  
6. **Boss Food** — Every 10th food becomes a 5-hit boss  
7. **Survival** — Health bar; wall hits drain HP  
8. **Dark Mode** — Limited visibility with flashlight effect  
9. **Poison Mode** — Purple food reduces score & length  
10. **Reverse Mode** — Controls flip every 5s  
11. **Portal Mode** — Linked teleport portals  
12. **Multi-Food** — 5 foods spawn and disappear quickly  

---

## 🕹️ Controls

- **Arrow Keys** — Move the Snake  
- **ESC** — Pause / Resume  
- **Mouse** — Navigate UI menus

---

## 🧩 Tech Stack

### 🖥️ Frontend
- HTML5 Canvas  
- CSS3 with themes, animations, glassmorphism  
- Vanilla JavaScript (ES6+)  

### 🎮 Rendering & Game Engine
- Fully custom rendering engine (Canvas 2D)  
- Sprite support (head, body, tail, food, boss, portals, obstacles)  
- Tile-based movement (30×30 grid)  

### ☁️ Backend
- Firebase Firestore database (real-time leaderboards)  
- Input sanitization & banned-word filtering  

### 🚀 Hosting
Works seamlessly with:
- GitHub Pages  
- Netlify  
- Vercel  

---

## 🏆 Leaderboards

The leaderboard automatically shows:  
- **Top 10 (real-time)** on Mode Selection screen  
- **Top 100** inside modal view  

Score entries include:
- Player Name (filtered & cleaned)  
- Score  
- Game Mode  
- Timestamp  

All powered by Firestore live updates.

---

## 📂 Project Structure



```text
/
├── index.html           # Main game entry point and HTML structure
├── style.css            # Styling, themes, and animations
├── game.js              # Core game engine (Loop, Logic, Rendering)
├── ui.js                # UI handling (Modals, DOM manipulation)
├── firebase-utils.js    # Firebase configuration and Database logic
└── assets/              # (Required) Folder containing game images
    ├── head.png
    ├── body.png
    ├── tail.png
    ├── food.png
    ├── poison.png
    ├── obstacle.png
    ├── portal.png
    └── boss.png
```
---


## 👨‍💻 Credits

- **Lead Developer:** Sanjib Das  
- **AI Assistant:** Gemini AI  
- **Infrastructure:** GitHub & Firebase  

---

## 📄 License

© **2025 Snake Revolution. All Rights Reserved.**  

---
