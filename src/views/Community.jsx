import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, MessageSquare, Star, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL, getImageUrl } from '../api/config';

const Community = () => {
    const { user, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState('reviews'); // reviews, feedback, chat
    const [reviews, setReviews] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);

    // Form States
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [feedbackForm, setFeedbackForm] = useState({ message: '' });
    const [chatMessage, setChatMessage] = useState('');

    const [feedbackList, setFeedbackList] = useState([]);

    useEffect(() => {
        if (activeTab === 'reviews') fetchReviews();
        if (activeTab === 'feedback') fetchFeedback();

        // Poll for chat messages every 3 seconds if active
        const interval = setInterval(() => {
            if (activeTab === 'chat') fetchChatMessages();
        }, 3000);
        return () => clearInterval(interval);
    }, [activeTab]);

    const fetchReviews = async () => {
        try {
            console.log("Fetching reviews...");
            const res = await fetch(`${API_URL}/community/reviews`);
            console.log("Fetch reviews status:", res.status);
            if (res.ok) {
                const data = await res.json();
                console.log("Fetched reviews data:", data);
                if (Array.isArray(data)) {
                    setReviews(data);
                } else {
                    console.error("Fetched reviews data is not an array:", data);
                    setReviews([]);
                }
            } else {
                console.error("Failed to fetch reviews, status:", res.status);
            }
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        }
    };

    const fetchFeedback = async () => {
        try {
            const res = await fetch(`${API_URL}/community/feedback`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setFeedbackList(data);
                }
            }
        } catch (error) {
            console.error("Failed to fetch feedback", error);
        }
    };

    const fetchChatMessages = async () => {
        try {
            // console.log("Fetching chat messages..."); // Commented out to reduce noise in polling
            const res = await fetch(`${API_URL}/community/chat`);
            if (res.ok) {
                const data = await res.json();
                // console.log("Fetched chat data:", data);
                if (Array.isArray(data)) {
                    setChatMessages(data);
                }
            } else {
                console.error("Failed to fetch chat messages:", res.status);
            }
        } catch (error) {
            console.error("Failed to fetch chat", error);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting review...", { user, isAuthenticated, reviewForm });

        if (!isAuthenticated) {
            alert("Please login to submit a review");
            return;
        }

        // Validation
        if (!reviewForm.comment.trim()) {
            alert("Please write a comment");
            return;
        }

        try {
            const payload = {
                user_name: user?.name || "Anonymous",
                user_email: user?.email || "",
                user_image: user?.image_url || "",
                role: user?.role || "User",
                rating: reviewForm.rating,
                comment: reviewForm.comment
            };
            console.log("Sending payload:", payload);

            const res = await fetch(`${API_URL}/community/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            console.log("Response status:", res.status);

            if (res.ok) {
                alert("Review submitted successfully!");
                setReviewForm({ rating: 5, comment: '' });
                fetchReviews();
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error("Submission failed:", errorData);
                alert(`Failed to submit review: ${errorData.detail || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error submitting review", error);
            alert("Network error: Failed to submit review. Check console for details.");
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;

        try {
            const res = await fetch(`${API_URL}/community/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // If you use token auth
                }
            });

            if (res.ok) {
                alert("Review deleted successfully");
                fetchReviews();
            } else {
                const error = await res.json();
                alert(error.detail || "Failed to delete review");
            }
        } catch (error) {
            console.error("Error deleting review", error);
            alert("Error deleting review");
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`${API_URL}/community/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: isAuthenticated ? user.name : "Guest",
                    email: isAuthenticated ? user.email : "guest@example.com",
                    message: feedbackForm.message
                })
            });
            if (res.ok) {
                alert("Feedback submitted! Thank you.");
                setFeedbackForm({ message: '' });
                fetchFeedback();
            }
        } catch (error) {
            console.error("Error submitting feedback", error);
        }
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting chat message...", { chatMessage, user });
        if (!chatMessage.trim()) return;

        const senderName = isAuthenticated ? user.name : "Guest";

        try {
            const payload = {
                user_name: senderName,
                user_image: isAuthenticated ? (user.image_url || "") : "",
                message: chatMessage,
                role: isAuthenticated ? user.role : 'guest'
            };
            console.log("Chat payload:", payload);

            const res = await fetch(`${API_URL}/community/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            console.log("Chat submit status:", res.status);
            if (res.ok) {
                setChatMessage('');
                fetchChatMessages();
            } else {
                console.error("Failed to send message");
            }
        } catch (error) {
            console.error("Error sending message", error);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-black text-white mb-8 text-center"
            >
                Community <span className="text-primary">Hub</span>
            </motion.h1>

            {/* Tabs */}
            <div className="flex justify-center mb-8 gap-4">
                {['reviews', 'feedback', 'chat'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === tab
                                ? 'bg-primary text-background-dark shadow-[0_0_15px_rgba(0,234,255,0.4)]'
                                : 'bg-white/5 text-slate-300 hover:bg-white/10'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            <div className="glass-panel p-6 md:p-8 rounded-2xl min-h-[500px]">

                {/* REVIEWS SECTION */}
                {activeTab === 'reviews' && (
                    <div className="max-w-4xl mx-auto space-y-10">
                        {/* Write Review Section */}
                        <div className="bg-white/5 p-6 md:p-8 rounded-2xl border border-white/10 shadow-lg">
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <Star className="text-yellow-400 fill-yellow-400" />
                                Write a Review
                            </h3>
                            <form onSubmit={handleReviewSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-slate-400 text-sm mb-3">Rate your experience</label>
                                    <div className="flex gap-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                className={`text-3xl transition-transform hover:scale-110 ${reviewForm.rating >= star ? 'text-yellow-400' : 'text-slate-600'}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Your Comments</label>
                                    <textarea
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none transition-colors min-h-[120px]"
                                        placeholder="Share your experience with the community..."
                                        required
                                    ></textarea>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className="bg-primary text-background-dark font-bold py-3 px-8 rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,234,255,0.3)]">
                                        Submit Review
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Recent Reviews List */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white mb-4 pl-2 border-l-4 border-primary">Recent Reviews</h3>
                            <div className="space-y-4">
                                {reviews.map((review, idx) => (
                                    <div key={idx} className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary font-bold border border-white/10 shadow-inner">
                                                    {review.user_image ? (
                                                        <img src={getImageUrl(review.user_image)} alt={review.user_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-lg">{review.user_name?.charAt(0).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white text-lg leading-tight">{review.user_name}</h4>
                                                    <span className="text-xs text-slate-400 font-medium bg-white/10 px-2 py-0.5 rounded-full">{review.role}</span>
                                                </div>
                                            </div>
                                            <div className="flex text-yellow-400 text-base bg-black/20 px-3 py-1 rounded-lg">
                                                {'★'.repeat(review.rating)}
                                                <span className="text-slate-700">{'★'.repeat(5 - review.rating)}</span>
                                            </div>
                                        </div>
                                        <p className="text-slate-300 leading-relaxed pl-[4rem]">{review.comment}</p>
                                        <div className="flex justify-between items-center mt-4 pl-[4rem]">
                                            <span className="text-xs text-slate-500 font-mono">
                                                {new Date(review.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                            {isAuthenticated && (user?.email === review.user_email || user?.role === 'admin') && (
                                                <button
                                                    onClick={() => handleDeleteReview(review._id)}
                                                    className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-full"
                                                    title="Delete Review"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {reviews.length === 0 && (
                                    <div className="text-center text-slate-500 py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                        <Star size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>No reviews yet. Be the first to share your thoughts!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* FEEDBACK SECTION */}
                {activeTab === 'feedback' && (
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="mb-8">
                            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                <MessageSquare size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">We Value Your Feedback</h3>
                            <p className="text-slate-400">Help us improve the platform by sharing your thoughts, suggestions, or reporting issues.</p>
                        </div>
                        <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-left">
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Your Message</label>
                                <textarea
                                    value={feedbackForm.message}
                                    onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                                    className="w-full bg-background-dark border border-white/10 rounded-lg p-4 text-white focus:border-primary focus:outline-none min-h-[200px]"
                                    placeholder="Tell us what you think..."
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="w-full bg-primary text-background-dark font-bold py-3 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2">
                                <Send size={20} />
                                Send Feedback
                            </button>
                        </form>

                        {/* Recent Feedback List */}
                        <div className="mt-12 text-left space-y-6">
                            <h3 className="text-xl font-bold text-white mb-4 pl-2 border-l-4 border-primary">Community Feedback</h3>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                {feedbackList.map((item, idx) => (
                                    <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                        <p className="text-slate-300 italic mb-2">"{item.message}"</p>
                                        <div className="flex justify-between items-center text-xs text-slate-500">
                                            <span className="font-bold text-primary">{item.name || "Anonymous"}</span>
                                            <span>{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Just now'}</span>
                                        </div>
                                    </div>
                                ))}
                                {feedbackList.length === 0 && (
                                    <div className="text-center text-slate-500 py-6 border border-dashed border-white/10 rounded-xl">
                                        No recent feedback to display.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* CHAT SECTION */}
                {activeTab === 'chat' && (
                    <div className="flex flex-col h-[600px]">
                        <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-black/20 rounded-xl mb-4 custom-scrollbar">
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} className={`flex items-end gap-2 ${msg.user_name === user?.name ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0 border border-white/20">
                                        {msg.user_image ? (
                                            <img src={getImageUrl(msg.user_image)} alt={msg.user_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                                                {msg.user_name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`flex flex-col ${msg.user_name === user?.name ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.user_name === user?.name
                                                ? 'bg-primary text-background-dark rounded-tr-none'
                                                : 'bg-white/10 text-white rounded-tl-none'
                                            }`}>
                                            <div className="text-xs font-bold opacity-70 mb-1">{msg.user_name}</div>
                                            <p>{msg.message}</p>
                                        </div>
                                        <span className="text-[10px] text-slate-500 mt-1">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {chatMessages.length === 0 && (
                                <div className="text-center text-slate-500 my-auto">Start the conversation!</div>
                            )}
                        </div>
                        <form onSubmit={handleChatSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                className="flex-1 bg-background-dark border border-white/10 rounded-lg px-4 text-white focus:border-primary focus:outline-none"
                                placeholder="Type a message..."
                            />
                            <button type="submit" className="bg-primary text-background-dark p-3 rounded-lg hover:brightness-110 transition-all">
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;
