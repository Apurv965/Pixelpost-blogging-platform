import React, {useState, useEffect} from "react";
import { Link, useNavigate } from 'react-router-dom';
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import sendIcon from "../assets/send-icon.svg";
import blankHeart from "../assets/blank-heart.svg";
import filledHeart from "../assets/filled-heart.svg";

const Feed = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [likingId, setLikingId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [posts, setPosts] = useState([]);

    const fetchPosts = async () => {
        try {
            const res = await api.get("/posts");
            setPosts(res.data.posts);
        } catch (error) {
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(()=>{
        fetchPosts();
    },[])

    const handleLike = async (e, postId) => {
        e.preventDefault();
        
        if (!user) {
            alert("Please sign in to like posts");
            return;
        }

        try {
            setLikingId(postId);
            const res = await api.post(`/posts/${postId}/like`);
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post._id === postId ? res.data.post : post
                )
            );
        } catch (error) {
            alert(error.response?.data?.message || "Error liking post");
        } finally {
            setLikingId(null);
        }
    };

    const handleShare = async (e, postId) => {
        e.preventDefault();
        const postUrl = `${window.location.origin}/post/${postId}`;
        try {
            await navigator.clipboard.writeText(postUrl);
            setCopiedId(postId);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (error) {
            alert("Failed to copy link");
        }
    };

    return (
        <section className="feed-section">
            {loading ? (
                <h1>Loading posts...</h1>
            ) : (
                posts.length > 0 ? (
                    posts.map((post) => {
                        const hasLiked = post.likes?.some(likeId => likeId === user?.id || likeId._id === user?.id);
                        const likeCount = post.likes?.length || 0;
                        const commentCount = post.comments?.length || 0;
                        
                        return (
                            <article className='post-card' key={post._id}>
                                <Link to={`/post/${post._id}`} className='post-card-link'>
                                    <img src={post.image} alt={post.caption} />
                                    <p className="post-card-title">{post.caption}</p>
                                    <p className="post-card-meta">
                                        {post.authorName || post.user?.name || "Unknown author"}
                                    </p>
                                </Link>
                                <div className="post-card-stats">
                                    {likeCount > 0 && (
                                        <span className="stat">{likeCount} {likeCount === 1 ? "like" : "likes"}</span>
                                    )}
                                </div>
                                <div className="post-card-footer">
                                    <div className="post-card-reactions post-reactions">
                                        <button
                                            type="button"
                                            className={`heart-button ${hasLiked ? 'active' : ''}`}
                                            onClick={(e) => handleLike(e, post._id)}
                                            disabled={likingId === post._id || !user}
                                            title={hasLiked ? 'Unlike' : 'Like'}
                                        >
                                            {hasLiked ? <img src={filledHeart} alt="Liked" className="heart-icon" /> : <img src={blankHeart} alt="Like" className="heart-icon" />}
                                        </button>
                                        <span className="reaction-separator" aria-hidden="true">|</span>
                                        <button
                                            type="button"
                                            className="comment-button-icon"
                                            onClick={() => navigate(`/post/${post._id}#comments`)}
                                            title="Comment on post"
                                        >
                                            <svg viewBox="0 0 24 24" aria-hidden="true" className="comment-icon-svg">
                                                <path
                                                    d="M7 18.5H5.5A2.5 2.5 0 0 1 3 16V6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5V16a2.5 2.5 0 0 1-2.5 2.5H12l-5 3v-3Z"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            {commentCount > 0 && <span className="comment-count">{commentCount}</span>}
                                        </button>
                                        <span className="reaction-separator" aria-hidden="true">|</span>
                                        <button
                                            type="button"
                                            className="share-button-icon"
                                            onClick={(e) => handleShare(e, post._id)}
                                            title={copiedId === post._id ? 'Copied!' : 'Share post'}
                                        >
                                            <img src={sendIcon} alt="Share" className="share-icon-img" />
                                        </button>
                                        {copiedId === post._id && <span className="copied-notification">Link copied!</span>}
                                    </div>
                                </div>
                            </article>
                        );
                    })
                ) : (
                    <h1>No posts available</h1>
                )
            )}
        </section>
    )
}

export default Feed
