import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { evaluateInterview } from "../services/geminiService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  SparklesIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";



function Spinner() {
  return (
    <svg
      className="animate-spin h-16 w-16 text-cyan-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}

function LoadingScreen({ message }) {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-900 text-white z-50 p-6">
      <div
        className={`flex flex-col items-center space-y-8 transition-all duration-700 ease-in-out ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <Spinner />
        <p className="text-xl font-semibold text-slate-300">
          {message || "Loading..."}
        </p>
      </div>
    </div>
  );
}
// --- End LoadingScreen Component ---

export default function EvaluationReport() {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [interviewData, setInterviewData] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false); // For entry animation

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("interviewData"));
      const history = JSON.parse(localStorage.getItem("chatHistory"));

      if (!history || history.length === 0 || !data) {
        navigate("/interview-form");
        return;
      }
      
      setInterviewData(data);

      evaluateInterview(history, data.interviewType)
        .then((res) => setReport(res))
        .catch((err) => {
          console.error(err);
        })
        .finally(() => setLoading(false));
    } catch (e) {
      console.error("Failed to load data from storage", e);
      navigate("/interview-form");
    }
  }, [navigate]);

  // Trigger entry animation
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading) {
    return <LoadingScreen message="Generating detailed AI evaluation..." />;
  }

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-red-400">
        <ExclamationTriangleIcon className="h-12 w-12 mb-4" />
        <h1 className="text-2xl mb-4">Failed to load evaluation report.</h1>
        <button
          onClick={() => navigate("/interview-form")}
          className="bg-cyan-500 text-slate-900 font-semibold px-10 py-3 rounded-full shadow-lg hover:bg-cyan-400 hover:scale-105 transform transition-all duration-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  // --- Chart Data & Styling ---
  const questionScores = report.questions.map((q, i) => ({
    name: `Q${i + 1}`,
    score: q.score,
  }));

  const skillRadarData = [
    { subject: "Communication", A: report.confidenceScore || 70 },
    { subject: "Problem Solving", A: (report.overallScore + report.confidenceScore) / 2 || 75 },
    { subject: "Technical", A: report.overallScore || 80 },
    { subject: "Clarity", A: report.confidenceScore - 5 || 65 },
    { subject: "STAR Method", A: report.overallScore - 10 || 70 },
  ];
  
  const chartTickFill = "#94a3b8"; // slate-400
  const chartStroke = "#334155"; // slate-700
  const accentColor = "#22d3ee"; // cyan-400

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="label text-slate-300">{`${label} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 p-6 md:p-12">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 tracking-tight">
        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Interview Evaluation Report
        </span>
      </h1>

      {/* Main content wrapper for animation */}
      <div
        className={`transition-all duration-700 ease-in-out ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Score Overview */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-slate-800 shadow-lg rounded-2xl p-6 text-center border border-slate-700">
            <h2 className="text-xl font-semibold mb-2 text-cyan-400">Overall Score</h2>
            <p className="text-6xl font-bold text-white">
              {report.overallScore}/100
            </p>
          </div>
          <div className="bg-slate-800 shadow-lg rounded-2xl p-6 text-center border border-slate-700">
            <h2 className="text-xl font-semibold mb-2 text-green-400">Confidence Score</h2>
            <p className="text-6xl font-bold text-white">
              {report.confidenceScore}/100
            </p>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700">
            <h3 className="text-2xl font-semibold mb-4 text-green-400 flex items-center">
              <CheckCircleIcon className="h-7 w-7 mr-2" /> Strengths
            </h3>
            <ul className="list-inside space-y-2 text-slate-300">
              {report.strengths.map((s, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-400 mr-2">✔</span> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700">
            <h3 className="text-2xl font-semibold mb-4 text-red-400 flex items-center">
              <ExclamationTriangleIcon className="h-7 w-7 mr-2" /> Areas to Improve
            </h3>
            <ul className="list-inside space-y-2 text-slate-300">
              {report.weaknesses.map((w, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-red-400 mr-2">!</span> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* --- Charts Section --- */}
        <div className="max-w-6xl mx-auto bg-slate-800 rounded-2xl shadow-lg p-6 md:p-8 mb-12 border border-slate-700">
          <h2 className="text-3xl font-semibold text-white mb-8 text-center">
            Performance Analytics
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Chart 1: Question Performance */}
            <div>
              <h3 className="text-xl font-semibold text-cyan-400 mb-4 text-center">
                Question-wise Performance
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={questionScores}>
                  <XAxis dataKey="name" stroke={chartStroke} tick={{ fill: chartTickFill }} />
                  <YAxis domain={[0, 100]} stroke={chartStroke} tick={{ fill: chartTickFill }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155' }} />
                  <Bar dataKey="score" fill={accentColor} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Chart 2: Skill Radar */}
            <div>
              <h3 className="text-xl font-semibold text-cyan-400 mb-4 text-center">
                Skill Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillRadarData}>
                  <PolarGrid stroke={chartStroke} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: chartTickFill }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke={chartStroke} />
                  <Radar
                    name="Candidate"
                    dataKey="A"
                    stroke={accentColor}
                    fill={accentColor}
                    fillOpacity={0.6}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="max-w-6xl mx-auto space-y-6 mb-12">
          <h2 className="text-3xl font-semibold text-white text-center">
            Detailed Question Breakdown
          </h2>
          {report.questions.map((q, idx) => (
            <div key={idx} className="bg-slate-800 shadow-lg rounded-xl p-6 border border-slate-700">
              <h4 className="text-lg font-semibold mb-3 text-white">
                Q{idx + 1}: {q.question}
              </h4>
              <p className="text-slate-400 mb-3 p-3 bg-slate-900 rounded-lg">
                <span className="font-semibold text-slate-300">Your Answer:</span>{" "}
                {q.userAnswer || "No answer provided"}
              </p>
              <div className="flex justify-between items-center">
                 <p className="text-slate-300">
                  <span className="font-semibold text-cyan-400">Feedback:</span> {q.feedback}
                </p>
                <p
                  className={`font-bold text-2xl ${
                    q.score > 70 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {q.score}/100
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary / Recommendation */}
        <div className="max-w-6xl mx-auto bg-slate-800 rounded-2xl p-8 shadow-lg text-slate-300 mb-12 border border-cyan-500/30">
          <h3 className="text-2xl font-semibold mb-4 text-cyan-400 flex items-center">
            <SparklesIcon className="h-7 w-7 mr-2" /> AI Recommendations
          </h3>
          <p className="leading-relaxed">
            For your interview at{" "}
            <span className="font-semibold text-white">{interviewData?.company}</span>,
            your key strengths were in{" "}
            <span className="font-semibold text-green-400">
              {report.strengths.slice(0, 1).join(", ")}
            </span>
            .
          </p>
          <p className="leading-relaxed mt-2">
            To improve, focus on:{" "}
            <span className="font-semibold text-red-400">
              {report.weaknesses.slice(0, 2).join(", ")}
            </span>
            . Try practicing these areas in the "Gym" to build more confidence and
            provide more structured (STAR method) answers.
          </p>
        </div>

        {/* Back Button */}
        <div className="max-w-6xl mx-auto text-center mt-12">
          <button
            onClick={() => navigate("/interview-form")}
            className="bg-cyan-500 text-slate-900 font-semibold px-10 py-3 rounded-full shadow-lg hover:bg-cyan-400 hover:scale-105 transform transition-all duration-300 flex items-center justify-center mx-auto"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Try Another Interview
          </button>
        </div>
      </div>
    </div>
  );
}
