import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Send, User, Cpu } from 'lucide-react';
import { API_URL } from '../api/config';

const MockInterviewModal = ({ isOpen, onClose, role }) => {
    if (!isOpen) return null;

    const [messages, setMessages] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState('full'); // 'full' or 'intro'
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [feedback, setFeedback] = useState(null);

    const messagesEndRef = useRef(null);

    // Voice Synthesis (TTS)
    const speak = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop previous
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }
    };

    // Voice Recognition (STT) - Basic implementation
    const recognitionRef = useRef(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Start Interview
    useEffect(() => {
        startInterview();
    }, [role]); // Restart if role changes (or on mount if open)

    const startInterview = async () => {
        setMessages([{ role: 'system', content: `Starting ${mode === 'intro' ? 'Self-Introduction Coach' : 'Mock Interview'} for ${role}...` }]);
        setIsLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL || '${API_URL}'}/interview/start`, { role, mode });
            const question = res.data.question;
            setCurrentQuestion(question);
            setMessages(prev => [...prev, { role: 'bot', content: question }]);
            speak(question);
        } catch (error) {
            console.error("Error starting interview:", error);
            setMessages(prev => [...prev, { role: 'system', content: 'Error connecting to interviewer. Please check backend.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!transcript.trim()) return;

        // Stop listening if active
        if (isListening) toggleListening();

        const answer = transcript;
        setMessages(prev => [...prev, { role: 'user', content: answer }]);
        setTranscript('');
        setIsLoading(true);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL || '${API_URL}'}/interview/submit`, {
                role,
                question: currentQuestion,
                answer,
                mode
            });

            const { evaluation, next_question } = res.data;

            // Show Feedback
            setFeedback(evaluation);
            setMessages(prev => [...prev, { role: 'feedback', content: evaluation }]);

            // Delay next question slightly for readability
            setTimeout(() => {
                const nextQ = next_question.question;
                setCurrentQuestion(nextQ);
                setMessages(prev => [...prev, { role: 'bot', content: nextQ }]);
                speak(nextQ);
            }, 3000);

        } catch (error) {
            console.error("Error submitting answer:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0f2223] w-full max-w-2xl h-[80vh] rounded-3xl border border-white/10 flex flex-col shadow-2xl relative overflow-hidden">

                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <Cpu size={24} />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg">AI Interviewer</h2>
                            <p className="text-xs text-slate-400">Role: <span className="text-primary">{role}</span></p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={mode}
                            onChange={(e) => setMode(e.target.value)}
                            className="bg-black/40 text-xs text-white border border-white/10 rounded-lg px-2 py-1 outline-none focus:border-primary"
                        >
                            <option value="full">Technical Interview</option>
                            <option value="intro">Intro Coach</option>
                        </select>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'feedback' ? (
                                <div className="max-w-[85%] bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 text-xs space-y-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-yellow-400 uppercase tracking-wider">Feedback</span>
                                        <div className="flex gap-2">
                                            <span className="bg-black/40 px-2 py-0.5 rounded text-yellow-200">Content: {msg.content.content_score}/100</span>
                                            <span className="bg-black/40 px-2 py-0.5 rounded text-yellow-200">Presentation: {msg.content.presentation_score}/100</span>
                                        </div>
                                    </div>
                                    <p className="text-slate-300 italic">"{msg.content.feedback}"</p>
                                    {msg.content.tips && (
                                        <ul className="list-disc list-inside text-slate-400 mt-2 space-y-1">
                                            {msg.content.tips.map((tip, tIdx) => <li key={tIdx}>{tip}</li>)}
                                        </ul>
                                    )}
                                </div>
                            ) : (
                                <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user'
                                    ? 'bg-primary/20 text-white rounded-br-none border border-primary/20'
                                    : msg.role === 'system'
                                        ? 'bg-white/5 text-slate-400 text-xs text-center w-full max-w-full'
                                        : 'bg-white/10 text-slate-200 rounded-bl-none border border-white/5'
                                    }`}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1">
                                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-black/20 border-t border-white/10">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-2 flex items-end gap-2 relative">
                        {isListening && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500/90 text-white text-xs px-3 py-1 rounded-full animate-pulse font-bold">
                                LISTENING...
                            </div>
                        )}

                        <button
                            onClick={toggleListening}
                            className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                        >
                            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>

                        <textarea
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            placeholder={isListening ? "Listening to your answer..." : "Type your answer or use microphone..."}
                            className="flex-1 bg-transparent border-none outline-none text-white p-3 resize-none h-[48px] custom-scrollbar"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmitAnswer();
                                }
                            }}
                        />

                        <button
                            onClick={handleSubmitAnswer}
                            disabled={!transcript.trim() || isLoading}
                            className="p-3 bg-primary text-background-dark rounded-xl hover:brightness-110 disabled:opacity-50 disabled:grayscale transition-all font-bold"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-slate-500 mt-3">
                        Speak clearly. The AI evaluates both content and presentation.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default MockInterviewModal;
