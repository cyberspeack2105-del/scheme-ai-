import React from 'react';

const BackgroundEffect = () => {
    return (
        <div className="bubbles-container">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="bubble"></div>
            ))}
        </div>
    );
};

export default BackgroundEffect;
