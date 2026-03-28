import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import InterviewForm from "./components/InterviewForm";
import InterviewChat from "./components/InterviewChat";
import EvaluationReport from "./components/EvaluationReport";
import VoiceInterview from "./VoiceInterview.jsx"; 


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/interview-form" element={<InterviewForm />} />
        <Route path="/interview-chat" element={<InterviewChat />} />
        <Route path="/evaluation-report" element={<EvaluationReport />} />
        {/* Voice interview route */}
        <Route
          path="/voice-interview"
          element={
            <>
              <VoiceInterview /> {/* User mic */}
            </>
          }
        />
      </Routes>
    </Router>
  );
}
