import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Imports removed, components and services will be integrated below
import { getInterviewPlan, getFeedback } from "../services/geminiService";
import LoadingScreen from "./LoadingScreen.jsx"; 

import {
  PaperAirplaneIcon,
  XCircleIcon,
  LightBulbIcon,
  ChartBarIcon,
  SparklesIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/solid";



function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-slate-900"
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



export default function InterviewChat() {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Preparing Interview...");
  const [timer, setTimer] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Retrieve and parse data safely
  const [interviewData, setInterviewData] = useState(null);
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("interviewData"));
      if (data) {
        setInterviewData(data);
      } else {
        navigate("/interview-form");
      }
    } catch (e) {
      console.error("Failed to parse interview data", e);
      navigate("/interview-form");
    }
  }, [navigate]);

  // Auto-scroll
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Timer
  useEffect(() => {
    if (status === "In Progress") {
      const interval = setInterval(() => setTimer((t) => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  // Fetch questions
  useEffect(() => {
    if (!interviewData) return;

    const fetchQuestions = async () => {
      setLoading(true);
      setStatus("Generating Questions...");
      try {
        const plan = await getInterviewPlan(interviewData);
        setQuestions(plan);
        setChatHistory([
          {
            type: "ai",
            text: plan[0],
            id: crypto.randomUUID(),
          },
        ]);
        setStatus("In Progress");
      } catch (err) {
        console.error("Error loading questions:", err);
        setError("Error generating interview. Please try again.");
        setTimeout(() => navigate("/interview-form"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [interviewData, navigate]);

  // Handle answer submission
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim() || isSubmitting) return;

    const currentQuestion = questions[currentQIndex];
    setIsSubmitting(true);
    setError(null);

    const userAnswerMsg = {
      type: "user",
      text: userAnswer,
      id: crypto.randomUUID(),
    };
    setChatHistory((prev) => [...prev, userAnswerMsg]);
    setUserAnswer("");

    try {
      // ✅ FIXED: Pass all required parameters to getFeedback
      const res = await getFeedback(
        currentQuestion,
        userAnswerMsg.text,
        chatHistory,
        interviewData.interviewType,
        interviewData.resumeText,
        interviewData.company
      );

      const parsed = {
        feedback: res.feedback || "No feedback available.",
        score: res.score !== undefined ? res.score : "N/A",
        analysis: res.analysis || "",
      };

      // Add AI feedback
      const newFeedback = {
        type: "ai-feedback",
        feedback: parsed.feedback,
        score: parsed.score,
        analysis: parsed.analysis,
        id: crypto.randomUUID(),
      };

      // ✅ MODIFICATION: Only add feedback to chat if NOT in company mode
      if (interviewData?.interviewType !== "company") {
        setChatHistory((prev) => [...prev, newFeedback]);
      }

      // Store per-question feedback (always store, even if not shown)
      const updatedHistory = JSON.parse(
        localStorage.getItem("chatHistory") || "[]"
      );
      updatedHistory.push({
        question: currentQuestion,
        userAnswer: userAnswerMsg.text,
        ...parsed,
      });
      localStorage.setItem("chatHistory", JSON.stringify(updatedHistory));

      // Move to next question or end
      if (currentQIndex < questions.length - 1) {
        setTimeout(() => {
          setChatHistory((prev) => [
            ...prev,
            {
              type: "ai",
              text: questions[currentQIndex + 1],
              id: crypto.randomUUID(),
            },
          ]);
          setCurrentQIndex((i) => i + 1);
        }, 1500); // Pause before next question
      } else {
        endInterview();
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong while evaluating your answer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format Timer
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // End Interview handler
  const endInterview = () => {
    setStatus("Interview Completed 🎉");
    if (interviewData?.interviewType === "company") {
      navigate("/evaluation-report");
    } else {
      // For practice mode, just show completion
      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          text: "Practice session complete! Feel free to review your feedback.",
          id: crypto.randomUUID(),
        },
      ]);
    }
  };

  if (loading && chatHistory.length === 0)
    return <LoadingScreen message={status} />;

  // --- Render Logic ---
  const progressPercent =
    questions.length > 0 ? ((currentQIndex + 1) / questions.length) * 100 : 0;
  
  // ✅ This const is used to conditionally render feedback
  const isCompanyMode = interviewData?.interviewType === "company";

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 text-white px-6 py-4 shadow-md sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            AI Interview Arena
          </h2>

          <div className="flex items-center space-x-6">
            <span className="text-slate-400">
              Timer:{" "}
              <span className="font-mono font-semibold text-white">
                {formatTime(timer)}
              </span>
            </span>

            {status !== "Interview Completed 🎉" && (
              <button
                onClick={endInterview}
                className="bg-red-600 text-white px-5 py-2 rounded-full font-medium hover:bg-red-500 transition-all duration-300 flex items-center space-x-2"
              >
                <XCircleIcon className="h-5 w-5" />
                <span>End</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-700 rounded-full h-2.5">
          <div
            className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-slate-400 mt-1">
          <span>
            Question {currentQIndex + 1} of {questions.length}
          </span>
          <span>{status}</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex animate-fade-in-up ${
              msg.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {/* AI Feedback Message */}
            {/* ✅ MODIFIED: This entire block is now skipped if isCompanyMode is true */}
            {msg.type === "ai-feedback" ? (
              isCompanyMode ? null : ( // <-- This is the logic you requested
                <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl max-w-xl shadow-lg">
                  <div className="space-y-3">
                    {/* Practice mode — show full feedback */}
                    {msg.feedback && (
                      <p className="text-slate-300 flex items-start">
                        <LightBulbIcon className="h-5 w-5 mr-2 text-cyan-400 flex-shrink-0" />
                        <span>
                          <span className="font-semibold text-cyan-400">
                            Suggestion:
                          </span>{" "}
                          {msg.feedback}
                        </span>
                      </p>
                    )}
                    {msg.analysis && (
                      <p className="text-slate-300 flex items-start">
                        <SparklesIcon className="h-5 w-5 mr-2 text-yellow-400 flex-shrink-0" />
                        <span>
                          <span className="font-semibold text-yellow-400">
                            Analysis:
                          </span>{" "}
                          {msg.analysis}
                        </span>
                      </p>
                    )}
                    {msg.score !== "N/A" && (
                      <p
                        className={`font-semibold flex items-center ${
                          msg.score > 60
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        <ChartBarIcon className="h-5 w-5 mr-2" />
                        Score: {msg.score} / 100
                      </p>
                    )}
                  </div>
                </div>
              )
            ) : (
              // Regular AI and User Messages
              <div
                className={`p-4 rounded-xl max-w-xl shadow-md ${
                  msg.type === "user"
                    ? "bg-cyan-500 text-slate-900 font-medium"
                    : "bg-slate-700 text-white"
                }`}
              >
                {/* Simple markdown for newlines */}
                {msg.text.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input Section */}
      {status === "In Progress" && (
        <form
          onSubmit={handleSubmitAnswer}
          className="bg-slate-800 p-6 flex space-x-4 border-t border-slate-700 sticky bottom-0"
        >
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder={isSubmitting ? "Evaluating..." : "Type your answer..."}
            disabled={isSubmitting}
            className="flex-1 bg-slate-700 border border-slate-600 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={isSubmitting || !userAnswer.trim()}
            className="bg-cyan-500 text-slate-900 px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-cyan-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Spinner />
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </form>
      )}

      {/* Global Error */}
      {error && (
        <div className="bg-red-800/50 border-t border-red-700 text-red-300 p-3 text-center">
          {error}
        </div>
      )}
    </div>
  );
}

// Add this to your main CSS or Tailwind config if you want the animation
/*
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fade-in-up 0.3s ease-out;
}
*/