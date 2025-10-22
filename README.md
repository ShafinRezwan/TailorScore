# TailorScore  
**Smart resume feedback & ATS scoring**  
Your personal assistant to optimize your resume for your dream job.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🚀 Features  
- 📄 **Upload PDF resumes** for real-time feedback and scoring.  
- 🤖 **AI-powered analysis** with detailed keyword and structure insights.  
- 📊 **ATS compatibility score** and actionable suggestions.  
- 🧠 **Interactive editor** to modify and reanalyze your resume in the browser.  
- 💾 **Persistent storage** of results using Puter.js KV & FileSystem APIs.  
- 🎨 Built with **React**, **Vite**, and **Tailwind CSS** for speed and elegance.

---

## 🔍 Screenshots  
<div align="center">  
  <img src="./public/screenshots/upload.png" alt="Upload page" width="300" />  
  <img src="./public/screenshots/feedback.png" alt="Feedback page" width="300" />  
</div>

---

## 🧩 How it works  
1. You upload your resume as a PDF.  
2. TailorScore converts it to an image for preview.  
3. AI analyzes it against job descriptions.  
4. Insights and scores are displayed interactively.  
5. Data is stored securely via **Puter.js** backend services.

---
## 🛠️ Local Development
### Prerequisites
- Node.js ≥ 18  
- npm ≥ 9  
- Puter.js credentials (for storage and API access)
### 🛠️ Installation  
```bash
git clone https://github.com/ShafinRezwan/TailorScore.git
cd TailorScore
npm install
cp .env.example .env   # fill in backend/API keys
npm run dev
```
## 🕹️ Docker Instructions 
1. Build the image
```bash
docker build -t tailorscore:latest .
```
2. Run the container
```bash
docker run -d -p 8080:3000 --name tailorscore tailorscore:latest
```

## 🌐 Connect

💼 GitHub: ShafinRezwan

🌍 Website: https://shafinrezwan.github.io



