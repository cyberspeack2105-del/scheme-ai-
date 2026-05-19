import { useState, useCallback, useEffect } from 'react';

export const useTextToSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [supported, setSupported] = useState(false);
    const [voices, setVoices] = useState([]);

    useEffect(() => {
        if ('speechSynthesis' in window) {
            setSupported(true);

            const updateVoices = () => {
                const availableVoices = window.speechSynthesis.getVoices();
                if (availableVoices.length > 0) {
                    setVoices(availableVoices);
                }
            };

            // Try to load voices immediately
            updateVoices();

            // Add listener for async loading (Chrome/others)
            window.speechSynthesis.onvoiceschanged = updateVoices;

            return () => {
                window.speechSynthesis.onvoiceschanged = null;
            };
        }
    }, []);

    const speak = useCallback((text, onEnd, lang = 'en-US') => {
        if (!supported) return;

        // Cancel any current speaking to reset with new voice if needed
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Voice Selection - now using the state or fallback
        const currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();

        // Find voice matching language
        let preferredVoice = currentVoices.find(voice => voice.lang === lang || voice.lang.startsWith(lang.split('-')[0]));

        // Fallback for English to specific female voices if no specific lang match or if lang is English
        if (lang.startsWith('en')) {
            preferredVoice = currentVoices.find(voice => voice.name.includes("Microsoft Zira")) ||
                currentVoices.find(voice => voice.name.includes("Google UK English Female")) ||
                currentVoices.find(voice => voice.name.includes("Female")) ||
                currentVoices.find(voice => voice.name.includes("Samantha")) || preferredVoice;
        }

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.lang = lang; // Set utterance language explicitly as backup

        // Slight adjustments for AI-like tone
        utterance.pitch = 1.1;
        utterance.rate = 1.05;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            if (onEnd) onEnd();
        };
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [supported, voices]); // Re-create 'speak' when voices load

    const cancel = useCallback(() => {
        if (supported) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, [supported]);

    return { speak, cancel, isSpeaking, supported };
};
