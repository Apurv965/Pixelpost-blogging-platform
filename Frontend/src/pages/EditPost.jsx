import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";

const EditPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        caption: "",
        description: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await api.get(`/posts/${id}`);
                setFormData({
                    caption: res.data.post.caption || "",
                    description: res.data.post.description || "",
                });
            } catch (error) {
                alert("Unable to load post");
                navigate("/feed");
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = new FormData();
            payload.append("caption", formData.caption);
            payload.append("description", formData.description);

            if (formData.image instanceof File) {
                payload.append("image", formData.image);
            }

            await api.put(`/posts/${id}`, payload);
            navigate(`/post/${id}`);
        } catch (error) {
            alert(error.response?.data?.message || "Error updating post");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <section className="create-post-section"><p>Loading post...</p></section>;
    }

    return (
        <section className="create-post-section">
            <h1>Edit post</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="caption"
                    placeholder="Enter caption"
                    value={formData.caption}
                    onChange={handleChange}
                    required
                />
                <textarea
                    name="description"
                    placeholder="Write a paragraph about this post"
                    rows="5"
                    value={formData.description}
                    onChange={handleChange}
                    required
                />
                <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Update post"}
                </button>
            </form>
        </section>
    );
};

export default EditPost;
