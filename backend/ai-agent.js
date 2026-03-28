// ai-agent.js
import { Room, RoomEvent } from '@livekit/rtc-node';
import { AccessToken } from 'livekit-server-sdk';
import { voice, stt, initializeLogger } from '@livekit/agents';
import * as deepgram from '@livekit/agents-plugin-deepgram';
import * as elevenlabs from '@livekit/agents-plugin-elevenlabs';
import { GoogleGenerativeAI } from '@google/generative-ai';
// ⛔️ REMOVED: import record from 'node-record-lpcm16';
// ⛔️ REMOVED: import { Writable } from 'stream';

initializeLogger('info');

// --- Config ---
// 🚨 WARNING: These keys are all public. You must revoke them and use a .env file.
const API_KEY = 'APINkvsH5xNwBbq';
const API_SECRET = 'oDaSWtvhL8eCpKMgSqifoH07gefuSSca4HTq2XZpRFaA';
const LIVEKIT_URL = 'wss://minor-ceplfz5f.livekit.cloud';
const DEEPGRAM_API_KEY = '09bee5d5a93b724d9b6e123819e28ca284d49b58';
const GEMINI_API_KEY = 'AIzaSyA5HT1qrgnDLhiVE3UpXlFesKhyqYGSAeo';
const ELEVEN_LABS_API_KEY = 'sk_6b4815da00e02271e9f77ac1a98273d596d89bef87f39767';
const ROOM_NAME = 'INTERVIEW_ROOM';

if (!API_KEY || !API_SECRET || !DEEPGRAM_API_KEY || !GEMINI_API_KEY || !ELEVEN_LABS_API_KEY) {
  console.error('FATAL ERROR: Missing API keys.');
  process.exit(1);
}

// --- Gemini Client ---
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const chatHistory = [
  {
    role: 'user',
    parts: [{ text: 'You are an expert interviewer. Your name is "KITT". Keep your replies short and conversational.' }],
  },
  { role: 'model', parts: [{ text: 'Understood. I will be KITT, an expert interviewer, and keep my replies brief.' }] },
];

// --- Agent ---
class InterviewAgent extends voice.Agent {
  constructor() {
    super({ instructions: 'You are KITT, an expert interviewer.' });
  }

  async onEnter() {
    console.log('[AI] Agent has entered the room. Greeting user.');
    try {
      await this.session.say('Hello, I am KITT. I am ready when you are.');
    } catch (e) {
      console.error('[AI] Error while greeting:', e);
    }
  }

  async sttNode(audio, modelSettings) {
    const stream = await super.sttNode(audio, modelSettings);
    const agent = this;

    async function* transcriptionLogger(stream) {
      for await (const event of stream) {
        if (event.type === stt.SpeechEventType.FINAL_TRANSCRIPT) {
          const text = event.alternatives[0]?.text;
          if (text) {
            console.log(`[USER SAID]: ${text}`);
            try {
              chatHistory.push({ role: 'user', parts: [{ text }] });
              const result = await geminiModel.generateContent({ contents: chatHistory });
              const aiResponse = result.response.text();
              chatHistory.push({ role: 'model', parts: [{ text: aiResponse }] });
              console.log(`[AI THOUGHT]: ${aiResponse}`);
              await agent.session.say(aiResponse);
            } catch (e) {
              console.error('[Gemini/TTS Error]:', e);
            }
          }
        }
        yield event;
      }
    }

    return transcriptionLogger(stream);
  }
}

// --- Start Agent ---
async function startAgent() {
  console.log('Starting AI Agent (Deepgram + Gemini + ElevenLabs)...');

  const room = new Room({ adaptiveStream: true });
  room.on(RoomEvent.Connected, () => console.log(`[Agent] Connected to room: ${ROOM_NAME}`));
  room.on(RoomEvent.ParticipantConnected, (p) => console.log(`[Agent] Participant connected: ${p.identity}`));
  room.on(RoomEvent.ParticipantDisconnected, (p) => console.log(`[Agent] Participant disconnected: ${p.identity}`));

  const session = new voice.AgentSession({
    stt: new deepgram.STT({ apiKey: DEEPGRAM_API_KEY }),
    tts: new elevenlabs.TTS({ apiKey: ELEVEN_LABS_API_KEY }),
  });

  const agent = new InterviewAgent();

  // --- Generate Access Token ---
  const token = new AccessToken(API_KEY, API_SECRET, { identity: 'AI_AGENT_BOT' });
  token.addGrant({ roomJoin: true, room: ROOM_NAME });
  const secret = await token.toJwt();

  try {
    await room.connect(LIVEKIT_URL, secret);
    console.log('[Agent] Room connected. Starting session...');

    // ⛔️ REMOVED: All the micStream, record.start, and session.feedAudio code
    
    await session.start(room, agent);
    console.log('[Agent] Session started.');
  } catch (err) {
    console.error('[Agent] Connection failed:', err);
  }
}

startAgent();