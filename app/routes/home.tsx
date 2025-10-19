import { useEffect } from "react";
import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { resumes } from "~/constants";
import { useLocation, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Fix My Resume" },
    { name: "description", content: "Resume Feedback to find you a job!" },
  ];
}

export default function Home() {
  const { auth } = usePuterStore();

  const naviagate = useNavigate();

  useEffect(() => {
    if (!auth.isAuthenticated) naviagate("/auth?next=/");
  }, [auth.isAuthenticated]);

  return (
    <main className="w-full h-full bg-animated-gradient">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1 className="text-gradient">
            Track Your Applications & Resume Ratings
          </h1>
          <h2>Review your submissions and check AI-powered feedback.</h2>
        </div>

        {resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
