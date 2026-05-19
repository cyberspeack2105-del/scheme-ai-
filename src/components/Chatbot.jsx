import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User, Minimize2, Maximize2, VolumeX, Volume2, MinusSquare, MicOff, Mic } from 'lucide-react';
import { API_URL } from '../api/config';
import * as Lucide from 'lucide-react';
import axios from 'axios';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useSpeechToText } from '../hooks/useSpeechToText';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [language, setLanguage] = useState('English');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am Keran, your AI assistant. How can I help you today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const messagesEndRef = useRef(null);
    const { speak, cancel } = useTextToSpeech();
    const { transcript, isListening, startListening, stopListening, setTranscript } = useSpeechToText();

    // Map language names to codes for STT/TTS
    const langCodes = {
        'English': 'en-US',
        'Tamil': 'ta-IN',
        'Malayalam': 'ml-IN'
    };

    // Scroll to bottom whenever messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Update greeting when language changes
    useEffect(() => {
        const greetings = {
            'English': 'Hello! I am Keran, your AI assistant. How can I help you today?',
            'Tamil': 'வணக்கம்! நான் கேரன், உங்கள் AI உதவியாளர். நான் இன்று உங்களுக்கு எவ்வாறு உதவ முடியும்?',
            'Malayalam': 'നമസ്കാരം! ഞാൻ കേരൻ, നിങ്ങളുടെ AI സഹായിയാണ്. ഇന്ന് എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാനാകും?'
        };
        setMessages([{ role: 'assistant', content: greetings[language] }]);
    }, [language]);

    // Handle voice transcript
    useEffect(() => {
        if (transcript) {
            setInputValue(transcript);
        }
    }, [transcript]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        if (setTranscript) setTranscript('');

        try {
            const response = await axios.post(`${API_URL}/chat`, {
                message: inputValue,
                context: `The user is browsing the government scheme portal. The user has selected the language: ${language}. Please respond strictly in ${language}.`
            });

            // Clean response: remove markdown symbols and any deep thinking tags from model
            let cleanReply = response.data.reply;

            // Remove <thought> or similar tags if they appear
            cleanReply = cleanReply.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
            cleanReply = cleanReply.replace(/<[\s\S]*?>/g, '').trim();

            // Remove markdown characters
            cleanReply = cleanReply.replace(/[#*`_~]/g, '');

            const assistantMessage = { role: 'assistant', content: cleanReply };
            setMessages(prev => [...prev, assistantMessage]);

            if (!isMuted && speak) {
                speak(cleanReply, null, langCodes[language]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessages = {
                'English': 'I apologize, but I am having trouble connecting right now.',
                'Tamil': 'மன்னிக்கவும், என்னால் இப்போது இணைக்க முடியவில்லை.',
                'Malayalam': 'ക്ഷമിക്കണം, എനിക്ക് ഇപ്പോൾ കണക്ട് ചെയ്യാൻ കഴിയുന്നില്ല.'
            };
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: errorMessages[language]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleVoice = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening(langCodes[language]);
        }
    };

    const toggleMute = () => {
        if (!isMuted && cancel) cancel();
        setIsMuted(!isMuted);
    };

    // Helper to render icons safely
    const Icon = ({ name, size = 18, ...props }) => {
        const LucideIcon = Lucide[name];
        if (!LucideIcon) return null;
        return <LucideIcon size={size} {...props} />;
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-[9999] p-4 bg-[#00eaff] text-[#0f2223] rounded-full shadow-[0_4px_25px_rgba(0,234,255,0.5)] hover:scale-110 transition-all group border-2 border-white/20"
                title="Open Keran AI"
            >
                <Icon name="Infinity" size={32} strokeWidth={2.5} />
                <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-[#00eaff] text-[#0f2223] px-3 py-1.5 rounded-lg text-sm font-black opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-xl scale-90 group-hover:scale-100 origin-right">
                    Ask Keran AI
                </span>
            </button>
        );
    }

    return (
        <div
            className={`fixed bottom-6 right-6 z-[9999] flex flex-col bg-[#0f2223]/95 backdrop-blur-xl shadow-2xl transition-all duration-300 border border-white/20 ${isMinimized ? 'h-14 w-64' : 'h-[500px] w-[320px] md:w-[360px]'
                } rounded-3xl overflow-hidden`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-[#00eaff]/20 flex items-center justify-center text-[#00eaff] border border-[#00eaff]/30">
                        <Icon name="Infinity" size={22} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white leading-none">Keran AI</h3>
                        <div className="mt-1 flex items-center gap-2">
                            <span className="text-[10px] text-[#00eaff] flex items-center gap-1">
                                <span className="size-1.5 rounded-full bg-[#00eaff] animate-pulse"></span>
                                Live
                            </span>
                            <div className="h-2 w-[1px] bg-white/10"></div>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-transparent text-[10px] text-white/60 outline-none hover:text-[#00eaff] transition-colors cursor-pointer"
                            >
                                <option value="English" className="bg-[#1a2c2e]">English</option>
                                <option value="Tamil" className="bg-[#1a2c2e]">தமிழ்</option>
                                <option value="Malayalam" className="bg-[#1a2c2e]">മലയാളം</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={toggleMute} className="p-1.5 text-white/50 hover:text-white transition-colors" title={isMuted ? "Unmute" : "Mute"}>
                        <Icon name={isMuted ? "VolumeX" : "Volume2"} />
                    </button>
                    <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 text-white/50 hover:text-white transition-colors">
                        <Icon name={isMinimized ? "Maximize2" : "MinusSquare"} />
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 text-white/50 hover:text-red-400 transition-colors">
                        <Icon name="X" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20 custom-scrollbar">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] whitespace-pre-wrap leading-relaxed ${msg.role === 'user'
                                    ? 'bg-[#00eaff] text-[#0f2223] font-bold rounded-tr-none'
                                    : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                                    } shadow-lg`}>
                                    {msg.content.split('\n').map((line, idx) => (
                                        <div key={idx} className={line.trim().startsWith('-') || line.trim().startsWith('*') ? 'ml-3' : 'mb-1'}>
                                            {line}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex gap-2">
                                    <div className="size-1.5 bg-[#00eaff]/60 rounded-full animate-bounce"></div>
                                    <div className="size-1.5 bg-[#00eaff]/60 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="size-1.5 bg-[#00eaff]/60 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-5 bg-white/5 border-t border-white/10">
                        <div className="relative flex items-center gap-3">
                            <button
                                type="button"
                                onClick={toggleVoice}
                                className={`p-2.5 rounded-xl transition-all shadow-lg ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/5'
                                    }`}
                                title={isListening ? 'Stop listening' : `Voice input (${language})`}
                            >
                                <Icon name={isListening ? "MicOff" : "Mic"} size={20} />
                            </button>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={language === 'Tamil' ? 'இங்கே தட்டச்சு செய்க...' : language === 'Malayalam' ? 'ഇവിടെ ടൈപ്പ് ചെയ്യുക...' : 'Ask me anything...'}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#00eaff]/50 transition-all font-medium"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isLoading}
                                className="p-2.5 bg-[#00eaff] text-[#0f2223] rounded-xl hover:brightness-110 disabled:opacity-30 disabled:grayscale transition-all shadow-[0_0_15px_rgba(0,234,255,0.3)]"
                            >
                                <Icon name="Send" size={20} />
                            </button>
                        </div>
                        {isListening && (
                            <div className="mt-2 text-[10px] text-[#00eaff] animate-pulse text-center font-bold tracking-wider">
                                {language === 'Tamil' ? 'நான் கேட்டுக்கொண்டிருக்கிறேன்...' : language === 'Malayalam' ? 'ഞാൻ കേൾക്കുന്നു...' : 'LISTENING...'}
                            </div>
                        )}
                    </form>
                </>
            )}
        </div>
    );
};

export default Chatbot;
