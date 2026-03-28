import { Link } from "react-router-dom";
import { AcademicCapIcon, ClockIcon, ChartBarIcon, SparklesIcon } from "@heroicons/react/24/solid";

export default function LandingPage() {
  return (
    // Main wrapper with the new dark background
    <div className="min-h-screen flex flex-col bg-slate-900 text-gray-300">
      
      {/* Hero Section */}
      <section className="relative bg-slate-900 py-36 px-6 flex flex-col items-center text-center">
        {/* New gradient text effect for the main title */}
        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            AI Interview Coach
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl">
          Prepare for your dream job with hyper-realistic, company-specific interviews. 
          Get instant feedback and level up your confidence.
        </p>
        <Link 
          to="/interview-form"
          // New accent color button style
          className="bg-cyan-500 text-slate-900 font-semibold px-10 py-4 rounded-full shadow-lg hover:bg-cyan-400 hover:scale-105 transform transition-all duration-300"
        >
          Start Your Journey
        </Link>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-slate-800">
        <h2 className="text-4xl font-bold tracking-tight text-center mb-16 text-white">
          Everything you need to succeed
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          
          {/* Feature Card 1 (with new styling) */}
          <div className="group bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-700 transform transition-all duration-300 hover:shadow-cyan-500/10 hover:border-cyan-400 hover:-translate-y-1">
            <div className="mb-4 inline-block p-3 rounded-full bg-cyan-400/10">
              <AcademicCapIcon className="h-8 w-8 text-cyan-400 transition-transform duration-300 group-hover:scale-110"/>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Main Event</h3>
            <p className="text-slate-400">
              Experience a full company-specific interview simulation tailored to your resume and job description.
            </p>
          </div>

          {/* Feature Card 2 */}
          <div className="group bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-700 transform transition-all duration-300 hover:shadow-cyan-500/10 hover:border-cyan-400 hover:-translate-y-1">
            <div className="mb-4 inline-block p-3 rounded-full bg-cyan-400/10">
              <ChartBarIcon className="h-8 w-8 text-cyan-400 transition-transform duration-300 group-hover:scale-110"/>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">The Gym</h3>
            <p className="text-slate-400">
              Practice mode gives instant AI feedback on your answers so you can iterate and improve on the fly.
            </p>
          </div>

          {/* Feature Card 3 */}
          <div className="group bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-700 transform transition-all duration-300 hover:shadow-cyan-500/10 hover:border-cyan-400 hover:-translate-y-1">
            <div className="mb-4 inline-block p-3 rounded-full bg-cyan-400/10">
              <ClockIcon className="h-8 w-8 text-cyan-400 transition-transform duration-300 group-hover:scale-110"/>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">The Arena</h3>
            <p className="text-slate-400">
              Immersive full-screen interview mode with live timer and progress indicators for realistic pressure.
            </p>
          </div>

          {/* Feature Card 4 */}
          <div className="group bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-700 transform transition-all duration-300 hover:shadow-cyan-500/10 hover:border-cyan-400 hover:-translate-y-1">
            <div className="mb-4 inline-block p-3 rounded-full bg-cyan-400/10">
              <SparklesIcon className="h-8 w-8 text-cyan-400 transition-transform duration-300 group-hover:scale-110"/>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Debrief</h3>
            <p className="text-slate-400">
              Receive a detailed evaluation report with scores, strengths, weaknesses, and actionable feedback.
            </p>
          </div>

        </div>
      </section>

      {/* Call to Action - Now uses the accent gradient as a background */}
      <section className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-24 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Ready to ace your interview?</h2>
        <p className="text-lg text-slate-800 mb-8 max-w-xl mx-auto">
          Start your personalized practice today and land your dream job with confidence.
        </p>
        <Link 
          to="/interview-form"
          // Inverted button style for the light background
          className="bg-white text-cyan-600 font-semibold px-10 py-4 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300"
        >
          Get Started
        </Link>
      </section>

      {/* Footer - Matched to the dark theme */}
      <footer className="bg-slate-900 text-slate-500 py-8 px-6 text-center border-t border-slate-700">
        <p>&copy; {new Date().getFullYear()} AI Interview Coach. All rights reserved.</p>
        <p className="mt-2">
          <Link to="#" className="hover:text-cyan-400 mx-2 transition-colors">Privacy Policy</Link> | 
          <Link to="#" className="hover:text-cyan-400 mx-2 transition-colors">Terms of Service</Link>
        </p>
      </footer>
    </div>
  );
}