# TailorScore  
**Smart resume feedback & ATS scoring**  
Your personal assistant to optimize your resume for your dream job.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Twitter](https://img.shields.io/twitter/url?label=@YourHandle&url=https%3A%2F%2Ftwitter.com%2FYourHandle)](https://twitter.com/YourHandle)

---

## 🚀 Features  
- Upload PDF resume → Preview, analysis & interactive feedback.  
- ATS score with breakdown and suggestions.  
- Edit & reanalyze your resume in-place.  
- Store your past submissions and track improvements.  
- Uses **Puter.js** backend, Tailwind CSS & React.

---

## 🔍 Screenshots  
<div align="center">  
  <img src="./public/screenshots/upload.png" alt="Upload page" width="300" />  
  <img src="./public/screenshots/feedback.png" alt="Feedback page" width="300" />  
</div>

---

## 🧩 How it works  
1. You upload a PDF resume.  
2. It’s converted to a image for preview, stored via Puter FS.  
3. AI analyzes using it with job description/context.  
4. Results stored in Puter KV & shown in UI.

---

## 🛠️ Installation  
```bash
git clone https://github.com/ShafinRezwan/TailorScore.git
cd TailorScore
npm install
cp .env.example .env   # fill in backend/API keys
npm run dev
