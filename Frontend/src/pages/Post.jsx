import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import sendIcon from '../assets/send-icon.svg';
import blankHeart from '../assets/blank-heart.svg';
import filledHeart from '../assets/filled-heart.svg';

const Post = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/posts/${id}`);
        setPost(res.data.post || null);
      } catch (err) {
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  useEffect(() => {
    if (loading || location.hash !== "#comments") {
      return;
    }

    const commentBox = document.getElementById("post-comment-input");
    commentBox?.focus();
    commentBox?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [loading, location.hash]);

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this post permanently?");

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/posts/${id}`);
      navigate("/feed");
    } catch (error) {
      alert(error.response?.data?.message || "Error deleting post");
      setDeleting(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert("Please sign in to like posts");
      return;
    }

    try {
      setLiking(true);
      const res = await api.post(`/posts/${id}/like`);
      setPost(res.data.post);
    } catch (error) {
      alert(error.response?.data?.message || "Error liking post");
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${id}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      alert("Failed to copy link");
    }
  };

  const focusComments = () => {
    const commentBox = document.getElementById("post-comment-input");
    commentBox?.focus();
    commentBox?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please sign in to comment on posts");
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    try {
      setCommenting(true);
      const res = await api.post(`/posts/${id}/comments`, {
        text: commentText,
      });
      setPost(res.data.post);
      setCommentText("");
    } catch (error) {
      alert(error.response?.data?.message || "Error adding comment");
    } finally {
      setCommenting(false);
    }
  };

  if (loading) return <section className="post-detail-section"><p>Loading...</p></section>;
  if (!post) return <section className="post-detail-section"><p>Post not found</p><Link to="/feed">Back to feed</Link></section>;

  const hasLiked = post.likes?.some(likeId => likeId === user?.id || likeId._id === user?.id);
  const postOwnerId = typeof post.user === "string" ? post.user : post.user?._id;
  const likeCount = post.likes?.length || 0;
  const comments = post.comments || [];
  const commentCount = comments.length;

  return (
    <section className="post-detail-section full-page-post">
      <div className="post-detail-card full-screen-card">
        <img src={post.image} alt={post.caption} className="full-screen-image" />
        <div className="post-caption">
          <h2>{post.caption}</h2>
          <p className="post-author">Posted by {post.authorName || post.user?.name || "Unknown author"}</p>
          <p className="post-description">
            {post.description || "No description has been added for this post yet."}
          </p>
          <div className="post-card-stats">
            {likeCount > 0 && (
              <span className="stat">{likeCount} {likeCount === 1 ? "like" : "likes"}</span>
            )}
          </div>
          <div className="post-card-footer">
            <div className="post-card-reactions">
              <button
                type="button"
                className={`heart-button ${hasLiked ? 'active' : ''}`}
                onClick={handleLike}
                disabled={liking || !user}
                title={hasLiked ? 'Unlike' : 'Like'}
              >
                {hasLiked ? <img src={filledHeart} alt="Liked" className="heart-icon" /> : <img src={blankHeart} alt="Like" className="heart-icon" />}
              </button>
              <span className="reaction-separator" aria-hidden="true">|</span>
              <button
                type="button"
                className="comment-button-icon"
                onClick={focusComments}
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
                onClick={handleShare}
                title={copied ? 'Copied!' : 'Share post'}
              >
                <img src={sendIcon} alt="Share" className="share-icon-img" />
              </button>
              {copied && <span className="copied-notification">Link copied!</span>}
            </div>
            {user?.id === postOwnerId && (
              <div className="post-card-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => navigate(`/edit-post/${post._id}`)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>
          <section className="post-comments-section" id="comments">
            <h3>Comments</h3>
            <form className="post-comment-form" onSubmit={handleCommentSubmit}>
              <textarea
                id="post-comment-input"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={user ? "Write a comment..." : "Sign in to comment"}
                disabled={!user || commenting}
                rows={3}
              />
              <button type="submit" disabled={!user || commenting || !commentText.trim()}>
                {commenting ? "Posting..." : "Post comment"}
              </button>
            </form>
            <div className="post-comments-list">
              {comments.length > 0 ? (
                comments
                  .slice()
                  .reverse()
                  .map((comment) => (
                    <article className="post-comment-card" key={comment._id}>
                      <p className="post-comment-author">{comment.authorName || "Unknown user"}</p>
                      <p className="post-comment-text">{comment.text}</p>
                    </article>
                  ))
              ) : (
                <p className="post-comment-empty">No comments yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};

export default Post;
