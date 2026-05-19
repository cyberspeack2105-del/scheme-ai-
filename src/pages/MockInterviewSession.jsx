import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Mic, MicOff, Send, User, Cpu, ArrowLeft, Settings, Volume2, Upload, Code, Play } from 'lucide-react';
import { API_URL } from '../api/config';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const MockInterviewSession = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const userProfile = state?.userProfile;

    // Setup State
    const [step, setStep] = useState('setup'); // 'setup' | 'interview'
    const [config, setConfig] = useState({
        role: userProfile?.role || '',
        mode: 'practice', // 'practice' | 'interview'
        language: 'English', // 'English' | 'Tamil' | 'Malayalam'
    });

    const [isUploading, setIsUploading] = useState(false);

    // Interview State
    const [messages, setMessages] = useState([]);
    const [difficulty, setDifficulty] = useState(5); // New: Tracks difficulty (1-10)
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [showCodeEditor, setShowCodeEditor] = useState(false);
    const [code, setCode] = useState("# Write your solution here...\n\ndef solution():\n    pass");

    // Refs
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    // --- SETUP HANDLERS ---
    const handleStart = () => {
        if (!config.role.trim()) return;
        setStep('interview');
        startSession();
    };

    // --- VOICE LOGIC ---
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            // recognitionRef.current.lang = 'en-US'; // Default to English for input for now

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setTranscript(prev => prev + " " + finalTranscript);
                }
            };
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            setTranscript('');
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            window.speechSynthesis.speak(utterance);
        }
    };

    // --- INTERVIEW LOGIC ---
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => scrollToBottom(), [messages]);

    const startSession = async () => {
        setMessages([{ role: 'system', content: `Starting ${config.mode === 'practice' ? 'Practice' : 'Mock Interview'} for ${config.role} Role.` }]);
        setIsLoading(true);
        try {
            const apiBase = import.meta.env.VITE_API_URL || API_URL;
            const res = await axios.post(`${apiBase}/interview/start`, {
                role: config.role,
                mode: 'full',
                difficulty: 5 // Start at middle difficulty
            });
            const question = res.data.question;
            setCurrentQuestion(question);
            setMessages(prev => [...prev, { role: 'bot', content: question }]);
            speak(question);
        } catch (error) {
            console.error("Error starting:", error);
            setMessages(prev => [...prev, { role: 'system', content: 'Connection Error. Please check backend.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!transcript.trim() && !showCodeEditor) return;
        if (isListening) toggleListening();

        const answer = transcript.trim() || (showCodeEditor ? "Here is my code solution." : "");
        setMessages(prev => [...prev, { role: 'user', content: answer }]);
        setTranscript('');
        setIsLoading(true);

        try {
            const apiBase = import.meta.env.VITE_API_URL || API_URL;
            const res = await axios.post(`${apiBase}/interview/submit`, {
                role: config.role,
                question: currentQuestion,
                answer,
                code: showCodeEditor ? code : null,
                mode: config.mode,
                language: config.language,
                current_difficulty: difficulty
            });

            const { evaluation, next_question } = res.data;

            // Handle Feedback Display based on Mode
            if (config.mode === 'practice') {
                setMessages(prev => [...prev, { role: 'feedback', content: evaluation }]);
                setTimeout(() => loadNextQuestion(next_question), 8000);
            } else {
                setMessages(prev => [...prev, { role: 'system', content: "Response recorded." }]);
                setTimeout(() => loadNextQuestion(next_question), 2000);
            }

        } catch (error) {
            console.error("Error submitting:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadNextQuestion = (nextQsData) => {
        const nextQ = nextQsData.question;

        // Update difficulty if provided
        if (nextQsData.difficulty && nextQsData.difficulty !== difficulty) {
            setDifficulty(nextQsData.difficulty);
            // Optionally notify user of level change
            if (nextQsData.difficulty > difficulty) {
                setMessages(prev => [...prev, { role: 'system', content: `🔥 Level Up! Difficulty increased to ${nextQsData.difficulty}/10` }]);
            } else if (nextQsData.difficulty < difficulty) {
                setMessages(prev => [...prev, { role: 'system', content: `⬇️ Adjusting pace. Difficulty lowered to ${nextQsData.difficulty}/10` }]);
            }
        }

        setCurrentQuestion(nextQ);
        setMessages(prev => [...prev, { role: 'bot', content: nextQ }]);
        speak(nextQ);
    };



    // --- RENDER SETUP ---
    if (step === 'setup') {
        return (
            <div className="min-h-screen bg-transparent text-white flex items-center justify-center p-4">
                <div className="fixed inset-0 z-0 bg-mesh opacity-20 pointer-events-none"></div>

                <div className="relative z-10 w-full max-w-lg glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
                    <div className="text-center">
                        <div className="inline-flex p-4 rounded-full bg-primary/20 text-primary mb-4">
                            <Settings size={32} />
                        </div>
                        <h2 className="text-3xl font-bold">Configure Session</h2>
                    </div>

                    <div className="space-y-4">


                        {/* Role Input */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Role</label>
                            <input
                                type="text"
                                value={config.role}
                                onChange={(e) => setConfig({ ...config, role: e.target.value })}
                                placeholder="e.g. Flutter Developer, Accountant"
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none transition-colors"
                            />
                        </div>

                        {/* Mode Selection */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setConfig({ ...config, mode: 'practice' })}
                                className={`p-4 rounded-xl border text-left transition-all ${config.mode === 'practice' ? 'bg-primary/20 border-primary text-white' : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/5'}`}
                            >
                                <span className="block font-bold mb-1">Practice Mode</span>
                                <span className="text-[10px] opacity-70">Get feedback & explanations</span>
                            </button>
                            <button
                                onClick={() => setConfig({ ...config, mode: 'interview' })}
                                className={`p-4 rounded-xl border text-left transition-all ${config.mode === 'interview' ? 'bg-red-500/20 border-red-500 text-white' : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/5'}`}
                            >
                                <span className="block font-bold mb-1">Interview Mode</span>
                                <span className="text-[10px] opacity-70">Strict Q&A only</span>
                            </button>
                        </div>

                        {/* Language Selection */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Explanation Language</label>
                            <div className="flex gap-2">
                                {['English', 'Tamil', 'Malayalam'].map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => setConfig({ ...config, language: lang })}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${config.language === lang ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-black/20 border-white/10 text-slate-500'}`}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleStart}
                        disabled={!config.role}
                        className="w-full py-4 bg-primary text-[#0a1a1b] font-bold rounded-xl text-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {config.role ? 'Start Personalised Session' : 'Start Session'}
                    </button>

                    <button onClick={() => navigate(-1)} className="w-full py-2 text-slate-500 text-sm hover:text-white transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    // --- RENDER INTERVIEW ---
    return (
        <div className="min-h-screen bg-transparent text-white flex flex-col relative overflow-hidden">
            {/* Background Bubbles */}
            {/* Background Bubbles - Removed (Global) */}

            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/mock-interview', { state: { userProfile } })} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="font-bold text-lg flex items-center gap-2">
                            {config.mode === 'practice' ? <span className="text-primary">Practice Session</span> : <span className="text-red-400">Mock Interview</span>}
                        </h1>
                        <p className="text-xs text-slate-400">Role: {config.role} • Lang: {config.language}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Difficulty Badge - NEW */}
                    <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full flex items-center gap-2">
                        <span className="text-xs font-bold text-yellow-500">LEVEL {difficulty}</span>
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className={`w-1 h-3 rounded-full ${i < Math.ceil(difficulty / 2) ? 'bg-yellow-500' : 'bg-white/10'}`}></div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-mono text-green-500">LIVE</span>
                    </div>

                    <button
                        onClick={() => setShowCodeEditor(!showCodeEditor)}
                        className={`p-2 rounded-lg transition-all ${showCodeEditor ? 'bg-primary text-[#0a1a1b] shadow-lg shadow-primary/20' : 'bg-white/10 text-slate-400 hover:text-white'}`}
                        title={showCodeEditor ? "Close Code Editor" : "Open Code Editor"}
                    >
                        <Code size={18} />
                    </button>
                </div>
            </div>

            {/* Split View Container */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Left Side: Chat + Controls */}
                <div className={`flex flex-col flex-1 h-full transition-all duration-300 ${showCodeEditor ? 'w-[55%] border-r border-white/10' : 'w-full'}`}>
                    {/* Chat */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 scrollbar-hide">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                {msg.role === 'feedback' ? (
                                    <div className="max-w-2xl w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-4">
                                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                            <span className="text-yellow-400 font-bold uppercase tracking-wider text-sm">Analysis</span>
                                            <div className="flex gap-2 mb-2">
                                                <span className="text-xs bg-black/30 px-2 py-1 rounded text-yellow-200">Content: {msg.content.content_score}</span>
                                                <span className="text-xs bg-black/30 px-2 py-1 rounded text-yellow-200">Presentation: {msg.content.presentation_score}</span>
                                            </div>

                                            {/* Evaluation Badges */}
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-white/5 rounded p-2">
                                                    <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Confidence</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${msg.content.confidence_score || 0}%` }}></div>
                                                        </div>
                                                        <span className="text-xs font-mono text-blue-300">{msg.content.confidence_score || 0}%</span>
                                                    </div>
                                                </div>
                                                <div className="bg-white/5 rounded p-2 flex flex-col justify-center">
                                                    <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Emotion</span>
                                                    <span className={`text-xs font-bold ${['Confident', 'Enthusiastic'].includes(msg.content.emotion) ? 'text-green-400' :
                                                        ['Hesitant', 'Anxious', 'Nervous'].includes(msg.content.emotion) ? 'text-red-400' : 'text-slate-300'
                                                        }`}>
                                                        {msg.content.emotion || 'Neutral'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-slate-300 italic">"{msg.content.feedback}"</p>

                                        {msg.content.model_answer && (
                                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                                                <h4 className="text-green-400 font-bold text-xs uppercase mb-2">Model Answer ({config.language})</h4>
                                                <p className="text-slate-200 leading-relaxed">{msg.content.model_answer}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className={`max-w-[85%] md:max-w-xl p-4 md:p-6 rounded-3xl ${msg.role === 'user'
                                        ? 'bg-primary text-[#0a1a1b] rounded-tr-none font-medium'
                                        : msg.role === 'system'
                                            ? 'bg-white/5 text-slate-400 text-xs text-center w-full max-w-full'
                                            : 'bg-white/10 text-white rounded-tl-none border border-white/5'
                                        }`}>
                                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Controls */}
                    <div className="p-4 md:p-6 bg-black/40 backdrop-blur-md border-t border-white/10 flex justify-center">
                        <div className="w-full max-w-3xl flex gap-2">
                            <button
                                onClick={toggleListening}
                                className={`p-4 rounded-2xl transition-all ${isListening ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse' : 'bg-white/10 text-slate-400 hover:bg-white/20'}`}
                            >
                                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                            </button>

                            <textarea
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                placeholder="Say 'Skip' or 'I will learn' if stuck..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 outline-none focus:border-primary resize-none h-[64px]"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit();
                                    }
                                }}
                            />

                            <button
                                onClick={handleSubmit}
                                disabled={!transcript.trim() || isLoading}
                                className="p-4 bg-primary text-[#0a1a1b] rounded-2xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Send size={24} />
                            </button>
                        </div>
                    </div>

                </div>

                {/* Right Side: Code Editor */}
                {showCodeEditor && (
                    <div className="flex-1 bg-[#1e1e1e] flex flex-col animate-in slide-in-from-right duration-300 border-l border-white/10">
                        <div className="p-2 bg-[#252526] border-b border-white/10 flex justify-between items-center text-xs px-4 h-14">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-slate-400">PYTHON SANDBOX</span>
                                <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">Auto-Save On</span>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-green-900/20 hover:scale-105 active:scale-95"
                            >
                                <Play size={12} fill="currentColor" />
                                Run & Submit
                            </button>
                        </div>
                        <div className="flex-1">
                            <Editor
                                height="100%"
                                defaultLanguage="python"
                                defaultValue="# Write your code here..."
                                theme="vs-dark"
                                value={code}
                                onChange={(val) => setCode(val)}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 13,
                                    scrollBeyondLastLine: false,
                                    padding: { top: 16 }
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MockInterviewSession;
