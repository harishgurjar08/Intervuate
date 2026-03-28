import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function InterviewForm() {
  const navigate = useNavigate();

  // --- State ---
  // Form State
  const [company, setCompany] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [experience, setExperience] = useState("Entry");
  const [resumeText, setResumeText] = useState("");
  const [interviewType, setInterviewType] = useState("company"); // default to company-based
  
  // UI State
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // --- Data ---
  const companies = [
    "Google", "Microsoft", "Apple", "Amazon", "Facebook",
    "Goldman Sachs", "JPMorgan", "Tesla", "Netflix", "Adobe",
    "Salesforce", "Oracle", "IBM", "Intel", "Nvidia",
    "Uber", "Lyft", "Airbnb", "Spotify", "Twitter (X)",
    // ... you can add the rest here
  ];

  const experienceLevels = ["Entry", "Mid", "Senior", "Lead", "Manager"];

  const interviewTypes = [
    { value: "company", label: "Company-Based (Full Simulation)" },
    { value: "practice", label: "Practice-Based (Quick Feedback)" },
  ];

  // --- Effects ---
  // Trigger entry animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100); // Small delay to ensure render
    return () => clearTimeout(timer);
  }, []);

  // --- Handlers ---
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (!company || !jobDesc || !resumeText.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    // Store in localStorage for demo
    localStorage.setItem(
      "interviewData",
      JSON.stringify({ company, jobDesc, experience, resumeText, interviewType })
    );
    navigate("/interview-chat");
  };

  // --- Base Styling for Form Elements ---
  const formInputBaseStyle = "w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 placeholder-slate-500";

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center py-20 px-4">
      
      <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center tracking-tight">
        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Prepare Your Interview
        </span>
      </h1>

      {/* Animated Form Card */}
      <div 
        className={`w-full max-w-3xl bg-slate-800 rounded-2xl shadow-2xl p-8 md:p-10 transition-all duration-700 ease-in-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Interview Type */}
          <div>
            <label className="block text-slate-300 font-medium mb-2">Interview Type</label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className={formInputBaseStyle}
            >
              {interviewTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Company Selection */}
          <div>
            <label className="block text-slate-300 font-medium mb-2">Select Company</label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={formInputBaseStyle}
            >
              <option value="">-- Choose Company --</option>
              {companies.map((comp, idx) => (
                <option key={idx} value={comp}>{comp}</option>
              ))}
            </select>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-slate-300 font-medium mb-2">Paste Job Description</label>
            <textarea
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Paste the full job description here..."
              className={`${formInputBaseStyle} resize-none h-32`}
            />
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-slate-300 font-medium mb-2">Experience Level</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className={formInputBaseStyle}
            >
              {experienceLevels.map((level, idx) => (
                <option key={idx} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* Resume Text Area */}
          <div>
            <label className="block text-slate-300 font-medium mb-2">Paste Resume Content</label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="To give you the best questions, paste your full resume content here..."
              className={`${formInputBaseStyle} resize-none h-48`}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-center text-red-400 pt-2">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="bg-cyan-500 text-slate-900 font-semibold px-10 py-3 rounded-full shadow-lg hover:bg-cyan-400 hover:scale-105 transform transition-all duration-300"
            >
              Start Interview
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}