import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

const CreatePost = () => {

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        const formData = new FormData(e.target)

        api.post("/create-post", formData)
        .then((res) => {

            navigate("/feed")

        })
        .catch((err) => {
            alert(err.response?.data?.message || "Error creating post")
        })
    }

  return (
    <section className="create-post-section">
        <h1>Create post</h1>

        <form onSubmit={handleSubmit}>
            <input type="file" name="image" accept="image/*" required />
            <input type="text" name="caption" placeholder="Enter caption" required />
            <textarea
                name="description"
                placeholder="Write a paragraph about this post"
                rows="5"
                required
            />
            <button type="submit">Submit</button>
        </form>

    </section>
  )
}

export default CreatePost
