import React from 'react';
import { useNavigate } from 'react-router-dom';

const Preview = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold mb-4">Preview Page</h1>
            <p className="text-slate-400 mb-8">This page is currently being restored or is no longer in use.</p>
            <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-primary text-background-dark rounded-lg font-bold"
            >
                Go Home
            </button>
        </div>
    );
};

export default Preview;
