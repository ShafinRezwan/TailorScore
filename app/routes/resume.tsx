import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Ats from "~/components/Ats";
import Details from "~/components/Details";
import FileUploader from "~/components/FileUploader";
import Summary from "~/components/Summary";
import { prepareInstructions } from "~/constants";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [
  { title: "Fix My Resume | Review " },
  { name: "description", content: "Detailed overview of your resume" },
];

const resume = () => {
  const { auth, isLoading, ai, fs, kv } = usePuterStore();
  const { id } = useParams();
  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // local state for editing & progress
  const [editingFile, setEditingFile] = useState<File | null>(null);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [statusText, setStatusText] = useState("");

  // Keep original metadata so we can re-use for reanalysis
  const [meta, setMeta] = useState<{
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    resumePath: string;
    imagePath: string;
  } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated)
      navigate(`/auth?next=/resume/${id}`);
  }, [isLoading]);

  useEffect(() => {
    const loadResume = async () => {
      const resume = await kv.get(`resume:${id}`);
      if (!resume) return;

      const data = JSON.parse(resume);
      setMeta({
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        jobDescription: data.jobDescription,
        resumePath: data.resumePath,
        imagePath: data.imagePath,
      });

      const resumeBlob = await fs.read(data.resumePath);
      if (!resumeBlob) return;
      const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
      const resumeUrl = URL.createObjectURL(pdfBlob);
      setResumeUrl(resumeUrl);

      const imageBlob = await fs.read(data.imagePath);
      if (!imageBlob) return;
      const imageUrl = URL.createObjectURL(imageBlob);
      setImageUrl(imageUrl);

      setFeedback(data.feedback);
    };
    loadResume();
  }, [id]);

  const FileSelecthandleEdit = (file: File | null) => {
    setEditingFile(file);
  };

  const handleReplaceAndReanalyze = async () => {
    if (!editingFile) {
      setStatusText("Please select a PDF to upload.");
      return;
    }
    if (!meta) {
      setStatusText("Missing resume context.");
      return;
    }

    setIsReanalyzing(true);
    setStatusText("Uploading new resume...");
    try {
      // 1) Upload new PDF
      const uploadedFile = await fs.upload([editingFile]);
      if (!uploadedFile) {
        setStatusText("Error: Failed to upload new resume.");
        setIsReanalyzing(false);
        return;
      }

      // Update resume preview in UI
      const newResumeBlob = await fs.read(uploadedFile.path);
      if (newResumeBlob) {
        const pdfBlob = new Blob([newResumeBlob], { type: "application/pdf" });
        setResumeUrl(URL.createObjectURL(pdfBlob));
      }

      // 2) Convert to image preview
      setStatusText("Converting to image...");
      const imageResult = await convertPdfToImage(editingFile);
      if (!imageResult.file) {
        setStatusText(
          `Error: Failed to convert PDF to image${
            imageResult.error ? ` – ${imageResult.error}` : ""
          }`
        );
        setIsReanalyzing(false);
        return;
      }

      // 3) Upload new image
      setStatusText("Uploading preview image...");
      const uploadedImage = await fs.upload([imageResult.file]);
      if (!uploadedImage) {
        setStatusText("Error: Failed to upload preview image.");
        setIsReanalyzing(false);
        return;
      }

      // Update image preview in UI
      const newImageBlob = await fs.read(uploadedImage.path);
      if (newImageBlob) {
        setImageUrl(URL.createObjectURL(newImageBlob));
      }

      // 4) Reanalyze
      // Show a friendly estimate countdown
      let remaining = 25;
      setStatusText(
        `Analyzing your updated resume... (≈ ${remaining}s remaining)`
      );
      const timer = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(timer);
          setStatusText("Finalizing analysis...");
        } else {
          setStatusText(
            `Analyzing your updated resume... (≈ ${remaining}s remaining)`
          );
        }
      }, 1000);

      let aiResponse;
      try {
        aiResponse = await ai.feedback(
          uploadedFile.path,
          prepareInstructions({
            jobTitle: meta.jobTitle,
            jobDescription: meta.jobDescription,
            // If supported, this helps deterministic parsing:
            // AIResponseFormat: "json",
          })
        );
      } finally {
        clearInterval(timer as unknown as number);
      }

      if (!aiResponse) {
        setStatusText("Error: Failed to analyze updated resume.");
        setIsReanalyzing(false);
        return;
      }

      const raw =
        typeof aiResponse.message?.content === "string"
          ? aiResponse.message.content
          : Array.isArray(aiResponse.message?.content) &&
              aiResponse.message.content[0]?.text
            ? aiResponse.message.content[0].text
            : "";

      if (!raw) {
        setStatusText("Error: Empty analysis response.");
        setIsReanalyzing(false);
        return;
      }

      let parsed: any;
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = { text: raw }; // fallback if not valid JSON
      }

      // 5) Persist updates
      const updatedRecord = {
        id,
        resumePath: uploadedFile.path,
        imagePath: uploadedImage.path,
        companyName: meta.companyName,
        jobTitle: meta.jobTitle,
        jobDescription: meta.jobDescription,
        feedback: parsed,
      };

      await kv.set(`resume:${id}`, JSON.stringify(updatedRecord));

      // 6) Reflect in UI
      setFeedback(parsed);
      setMeta({
        ...meta,
        resumePath: uploadedFile.path,
        imagePath: uploadedImage.path,
      });
      setStatusText("Reanalysis complete.");
    } catch (err: any) {
      setStatusText(
        `Error: Could not replace & reanalyze${
          err?.message ? ` - ${err.message}` : ""
        }`
      );
      console.error("Replace & Reanalyze error:", err);
    } finally {
      setIsReanalyzing(false);
    }
  };

  return (
    <main className="!pt-0">
      <nav className="resume-nav">
        <Link to="/" className="back-button">
          <img
            src="../app/assets/icons/back.svg"
            alt="logo"
            className="w-2.5 h-2.5"
          />
          <span className="text-gray-800 text-sm font-semibold">
            Back to HomePage
          </span>
        </Link>
      </nav>
      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        <section className="feedback-section h-[100vh] sticky top-0 items-center justify-center">
          {imageUrl && resumeUrl && (
            <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={imageUrl}
                  className="w-full h-full object-contain rounded-2xl"
                  title="resume"
                />
              </a>
            </div>
          )}
        </section>
        <section className="feedback-section">
          <h2 className="text-4xl !text-black font-bold">Resume Review</h2>

          {/* Edit & Reanalyze UI */}
          <div className="mt-4 p-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur">
            <h3 className="text-lg font-semibold mb-2">
              Edit resume & reanalyze
            </h3>
            <div className="flex flex-col gap-3">
              <FileUploader onFileSelect={setEditingFile} />
              <div className="flex items-center gap-3">
                <button
                  className="primary-button disabled:opacity-50"
                  onClick={handleReplaceAndReanalyze}
                  disabled={isReanalyzing || !editingFile}
                >
                  {isReanalyzing ? "Reanalyzing..." : "Replace & Reanalyze"}
                </button>
                {statusText && (
                  <span className="text-sm text-gray-700">{statusText}</span>
                )}
              </div>
              {!editingFile && (
                <p className="text-xs text-gray-500">
                  Choose a PDF to replace the current resume.
                </p>
              )}
            </div>
          </div>

          {feedback ? (
            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
              <Summary feedback={feedback}></Summary>
              <Ats
                score={feedback.ATS.score || 0}
                suggestions={feedback.ATS.tips || []}
              ></Ats>
              <Details feedback={feedback}></Details>
            </div>
          ) : (
            <img src="app/assets/images/resume-scan-2.gif" className="w-full" />
          )}
        </section>
      </div>
    </main>
  );
};

export default resume;
