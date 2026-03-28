import { useEffect, useState } from 'react';
import { LightBulbIcon } from "@heroicons/react/24/solid";

// --- Spinner Component ---
// This is the same modern SVG spinner used in the chat screen.
function Spinner() {
  return (
    <svg
      className="animate-spin h-16 w-16 text-cyan-400" // Made spinner larger
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

// --- Main Loading Screen ---
export default function LoadingScreen({ message }) {
  const tips = [
    "Breathe deeply and stay calm.",
    "Focus on clarity over complexity.",
    "Remember your achievements and experiences.",
    "Keep answers concise and structured.",
    "Confidence is key — believe in yourself.",
    "Listen carefully before answering."
  ];

  const [currentTip, setCurrentTip] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false); // For entry animation
  const [tipOpacity, setTipOpacity] = useState(1); // For tip fading

  // Rotate tips with fade effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTipOpacity(0); // Start fade out
      
      setTimeout(() => {
        setCurrentTip((prev) => (prev + 1) % tips.length);
        setTipOpacity(1); // Start fade in
      }, 500); // Wait for fade out to complete
      
    }, 3500); // Total time per tip

    return () => clearInterval(interval);
  }, [tips.length]);

  // Trigger entry animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100); // Small delay to ensure render
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-900 text-white z-50 p-6">
      
      {/* Main content container with entry animation */}
      <div 
        className={`flex flex-col items-center space-y-8 transition-all duration-700 ease-in-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        {/* Spinner */}
        <div className="flex flex-col items-center space-y-6">
          <Spinner />
          <p className="text-xl font-semibold text-slate-300">
            {message || "Preparing Your Interview..."}
          </p>
        </div>

        {/* Tip / Quote */}
        <div className="mt-12 max-w-xl text-center px-4">
          <LightBulbIcon className="h-10 w-10 mx-auto mb-4 text-cyan-400" />
          <p 
            className="text-lg italic text-slate-400 transition-opacity duration-500"
            style={{ opacity: tipOpacity }}
          >
            {tips[currentTip]}
          </p>
        </div>
      </div>

    </div>
  );
}