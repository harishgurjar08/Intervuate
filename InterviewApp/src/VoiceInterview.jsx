import { useState, useEffect, useRef } from 'react';
import { 
  Room, 
  RoomEvent, 
  RemoteParticipant,
  Track, // --- NEW: Import Track ---
  RemoteTrack, // --- NEW: Import RemoteTrack ---
} from 'livekit-client';

// --- Your Settings ---
const LIVEKIT_URL = "wss://minor-ceplfz5f.livekit.cloud"; 
const BACKEND_URL = "http://localhost:3000";

// --- NEW ---
// This is a helper component to manage playing remote audio.
// It creates an <audio> element and attaches the track to it.
function AudioTrack({ track }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      track.attach(audioRef.current);
    }

    return () => {
      track.detach();
    };
  }, [track]);

  return <audio ref={audioRef} autoPlay />;
}
// --- END NEW ---


export default function VoiceInterview() {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState("Disconnected");
  const [error, setError] = useState("");
  const roomRef = useRef(null);

  // --- NEW ---
  // We'll store all the remote audio tracks in state
  const [remoteTracks, setRemoteTracks] = useState([]);
  // --- END NEW ---

  useEffect(() => {
    return () => {
      roomRef.current?.disconnect();
    };
  }, []);

  const getLiveKitToken = async () => {
    // ... (This function is correct, no changes)
    try {
      const response = await fetch(`${BACKEND_URL}/api/livekit-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity: `USER_${Date.now()}`,
          room: "INTERVIEW_ROOM",
        }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      return data.token;
    } catch (e) {
      setError(`Failed to fetch token: ${e.message}`);
      return null;
    }
  };

  const handleStartInterview = async () => {
    setStatus("Connecting...");
    setError("");

    const token = await getLiveKitToken();
    if (!token) {
      setStatus("Failed to get token");
      return;
    }

    try {
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });
      roomRef.current = room;

      room
        .on(RoomEvent.Connected, () => {
          setStatus("Connected");
          setIsConnected(true);
        })
        .on(RoomEvent.Disconnected, () => {
          setStatus("Disconnected");
          setIsConnected(false);
          setRemoteTracks([]); // Clear tracks on disconnect
          roomRef.current = null;
        })
        // --- NEW: Add event listeners for hearing others ---
        .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          if (track.kind === Track.Kind.Audio) {
            console.log("Subscribed to new audio track:", track.sid);
            setRemoteTracks((prevTracks) => [...prevTracks, track]);
          }
        })
        .on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
          if (track.kind === Track.Kind.Audio) {
            console.log("Unsubscribed from audio track:", track.sid);
            setRemoteTracks((prevTracks) =>
              prevTracks.filter((t) => t.sid !== track.sid)
            );
          }
        });
        // --- END NEW ---

      await room.connect(LIVEKIT_URL, token);
      console.log("Connected to room:", room.name);

      await room.localParticipant.setMicrophoneEnabled(true);
      
    } catch (err) {
      console.error("Connection failed", err);
      setStatus("Connection Failed");
      setError(err.message || "Could not connect to LiveKit server.");
      roomRef.current = null;
    }
  };

  const handleDisconnect = () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto border rounded shadow-lg mt-10">
      <h2 className="text-xl font-bold mb-4">LiveKit Voice Interview</h2>
      {/* ... (error and status display is the same) ... */}
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p>Status: <span className="font-semibold">{status}</span></p>
        
        {!isConnected ? (
          <button 
            onClick={handleStartInterview}
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={status === "Connecting..."}
          >
            {status === "Connecting..." ? "Connecting..." : "Start Interview"}
          </button>
        ) : (
          <button 
            onClick={handleDisconnect}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            End Call
          </button>
        )}
      </div>

      {/* --- NEW: This is where the remote audio will be played --- */}
      <div id="remote-audio-container" style={{ display: 'none' }}>
        {remoteTracks.map((track) => (
          <AudioTrack key={track.sid} track={track} />
        ))}
      </div>
      {/* --- END NEW --- */}

    </div>
  );
}