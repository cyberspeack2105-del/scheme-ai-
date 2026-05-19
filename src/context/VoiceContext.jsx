import React, { createContext, useContext, useState, useEffect } from 'react';

const VoiceContext = createContext();

export const useVoice = () => useContext(VoiceContext);

export const VoiceProvider = ({ children }) => {
    const [formData, setFormData] = useState(() => {
        const savedData = localStorage.getItem('voiceSessionData');
        return savedData ? JSON.parse(savedData) : {
            fullName: '',
            age: '',
            occupation: '',
            disability: '',
            income: '',
            fatherName: '',
            motherName: ''
        };
    });

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const setBulkFormData = (data) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const saveSession = () => {
        localStorage.setItem('voiceSessionData', JSON.stringify(formData));
    };

    const resetForm = () => {
        const initialData = {
            fullName: '',
            age: '',
            occupation: '',
            disability: '',
            income: '',
            fatherName: '',
            motherName: ''
        };
        setFormData(initialData);
        localStorage.removeItem('voiceSessionData');
    };

    return (
        <VoiceContext.Provider value={{ formData, updateField, setBulkFormData, saveSession, resetForm }}>
            {children}
        </VoiceContext.Provider>
    );
};
