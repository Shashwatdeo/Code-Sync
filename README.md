# ⚡ Code Sync

![GitHub Repo stars](https://img.shields.io/github/stars/Shashwatdeo/Code-Sync?style=for-the-badge)
![GitHub Forks](https://img.shields.io/github/forks/Shashwatdeo/Code-Sync?style=for-the-badge)
![GitHub Issues](https://img.shields.io/github/issues/Shashwatdeo/Code-Sync?style=for-the-badge)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/Shashwatdeo/Code-Sync?style=for-the-badge)

---

## 📌 About the Project

**Code Sync** is a collaborative real-time code editor that allows multiple users to work on the same code simultaneously.  
It provides instant synchronization, modern UI, and supports multiple programming languages — ideal for coding interviews, live sessions, and team projects.

---

## 🚀 Live Preview

🔗 **[View Live Demo](#)** (Add your deployment link here)

---

## 🎯 Features

- **Real-Time Collaboration** — Code updates instantly across all users in a room.
- **Multi-Language Syntax Highlighting** — Powered by Monaco Editor.
- **Room Creation & Joining** — Join using a unique room ID.
- **User Presence Tracking** — See active participants in real-time.
- **Responsive Interface** — Works across devices.

---

## 🛠️ Tech Stack

**Frontend:**
- React.js
- Tailwind CSS
- Socket.IO Client
- Monaco Editor

**Backend:**
- Node.js
- Express.js
- Socket.IO
- MongoDB Atlas

---

## ⚙️ Installation Guide

### Method 1: Manual Installation (with MongoDB Atlas)

1. **Fork this repository**  
   Click the **Fork** button on the top-right corner.

2. **Clone your forked repository**
   ```bash
   git clone https://github.com/Shashwatdeo/Code-Sync.git
   ```

3. **Set up MongoDB Atlas (Cloud Database)**  
   1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).  
   2. Create a **new cluster** (Free tier).  
   3. In **Database Access**, add a new user with a username & password (save them).  
   4. In **Network Access**, allow your IP or use `0.0.0.0/0` for development.  
   5. Go to **Database → Connect → Connect your application**, copy the connection string (`mongodb+srv://...`).  
   6. Replace `<username>` and `<password>` with your MongoDB credentials.

4. **Create `.env` files**

   **Frontend (`client/.env`):**
   ```env
   VITE_BACKEND_URL=http://localhost:3000
   ```

   **Backend (`server/.env`):**
   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/code-sync?retryWrites=true&w=majority
   ```

5. **Install dependencies**
   ```bash
   cd client
   npm install
   cd ../server
   npm install
   ```

6. **Start the app**

   **Frontend:**
   ```bash
   cd client
   npm run dev
   ```

   **Backend:**
   ```bash
   cd server
   npm run dev
   ```

7. **Visit in your browser**
   ```
   http://localhost:5173/
   ```

---

## 📸 Screenshots

*(Add your project screenshots here)*

---

## 📌 Roadmap

- [ ] Add authentication
- [ ] Enable video/voice chat
- [ ] Add code execution support
- [ ] Improve UI with themes
- [ ] Support more languages

---

## 🤝 Contributing

Contributions are welcome!

1. Fork this repo  
2. Create a branch:  
   ```bash
   git checkout -b feature/YourFeature
   ```
3. Commit changes:  
   ```bash
   git commit -m "Describe your changes"
   ```
4. Push branch:  
   ```bash
   git push origin feature/YourFeature
   ```
5. Submit a Pull Request

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Developer

**Name:** *Shashwat Deo*  
**GitHub:** [Shashwatdeo](https://github.com/Shashwatdeo)

---
