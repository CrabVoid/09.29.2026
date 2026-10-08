const { useState, useEffect, useRef, useCallback } = React;
const API_URL = "http://127.0.0.1:8000/api/posts";

function Navbar({ apiConnected, loading, onRefresh, onCreate }) {
    return (
        <header className="hero shadow-sm">
            <div className="container d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div>
                    <h1 className="h3 fw-bold mb-1">
                        <i className="bi bi-code-slash me-2"></i>React 18 + Laravel CRUD
                    </h1>
                    <p className="mb-0 opacity-75 small">
                        Declarative UI with React State, Hooks &amp; Laravel MySQL REST API
                    </p>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-dark bg-opacity-50 px-3 py-2 text-white">
                        <span className={`badge-status ${apiConnected ? "badge-online" : "badge-offline"} me-1`}></span>
                        <span>{apiConnected ? "API Connected (MySQL)" : "API Disconnected"}</span>
                    </span>
                    <button className="btn btn-light fw-semibold shadow-sm" onClick={onRefresh} disabled={loading}>
                        <i className="bi bi-arrow-clockwise me-1"></i> Refresh
                    </button>
                    <button className="btn btn-warning fw-semibold shadow-sm" onClick={onCreate}>
                        <i className="bi bi-plus-lg me-1"></i> New Post
                    </button>
                </div>
            </div>
        </header>
    );
}

function AlertBanner({ alert }) {
    if (!alert) return null;

    return (
        <div className={`alert alert-${alert.type} shadow-sm`} role="alert">
            {alert.message}
        </div>
    );
}

function PostCard({ post, onEdit, onDelete }) {
    return (
        <div className="card h-100 border-0 shadow-sm p-3">
            <div className="d-flex justify-content-between align-items-start mb-2">
                <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold">#{post.id}</span>
                <small className="text-muted">
                    {post.created_at ? new Date(post.created_at).toLocaleDateString() : ""}
                </small>
            </div>
            <h5 className="card-title fw-bold text-dark">{post.title || "Untitled"}</h5>
            <p className="card-text text-secondary flex-grow-1">{post.body || "(no content)"}</p>
            <div className="d-flex justify-content-end gap-2 border-top pt-3 mt-2">
                <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(post)}>
                    <i className="bi bi-pencil me-1"></i>Edit
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(post.id)}>
                    <i className="bi bi-trash me-1"></i>Delete
                </button>
            </div>
        </div>
    );
}

function PostModal({ modalData, saving, onSubmit, onChange, onClose }) {
    return (
        <div className="modal fade" id="postModal" ref={onClose.modalRef} tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content border-0 shadow">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">
                            {modalData.id ? `Edit Post #${modalData.id}` : "Create New Post"}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <form onSubmit={onSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. React + Laravel"
                                    value={modalData.title}
                                    onChange={(e) => onChange("title", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Content</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="Write post body here..."
                                    value={modalData.body}
                                    onChange={(e) => onChange("body", e.target.value)}
                                    required
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                                {saving ? "Saving..." : "Save Post"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function App() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [apiConnected, setApiConnected] = useState(false);
    const [flashMessage, setFlashMessage] = useState(null);
    const [modalData, setModalData] = useState({ id: null, title: "", body: "" });
    const [saving, setSaving] = useState(false);

    const modalRef = useRef(null);
    const bsModalInstance = useRef(null);

    const showAlert = useCallback((message, type = "danger") => {
        setFlashMessage({ message, type });
        setTimeout(() => setFlashMessage(null), 4000);
    }, []);

    const loadPosts = useCallback(async () => {
        setLoading(true);

        try {
            const response = await fetch(API_URL, {
                method: "GET",
                headers: { Accept: "application/json" }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            setPosts(Array.isArray(data) ? data : []);
            setApiConnected(true);
        } catch (error) {
            console.error("Fetch Error:", error);
            setApiConnected(false);
            showAlert(`Failed to fetch posts: ${error.message}`, "danger");
        } finally {
            setLoading(false);
        }
    }, [showAlert]);

    useEffect(() => {
        if (modalRef.current) {
            bsModalInstance.current = new bootstrap.Modal(modalRef.current);
        }

        loadPosts();
    }, [loadPosts]);

    const handleChangeModal = (field, value) => {
        setModalData((previous) => ({
            ...previous,
            [field]: value
        }));
    };

    const handleSavePost = async (event) => {
        event.preventDefault();

        if (!modalData.title.trim() || !modalData.body.trim()) {
            showAlert("Please fill out both Title and Content fields.", "warning");
            return;
        }

        setSaving(true);

        const isEditing = Boolean(modalData.id);
        const url = isEditing ? `${API_URL}/${modalData.id}` : API_URL;
        const method = isEditing ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify({
                    title: modalData.title.trim(),
                    body: modalData.body.trim()
                })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            if (bsModalInstance.current) {
                bsModalInstance.current.hide();
            }

            showAlert(isEditing ? "Post updated successfully!" : "Post created successfully!", "success");
            loadPosts();
        } catch (error) {
            console.error("Save Error:", error);
            showAlert(`Failed to save post: ${error.message}`, "danger");
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePost = async (id) => {
        if (!window.confirm(`Are you sure you want to delete post #${id}?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                headers: { Accept: "application/json" }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            showAlert(`Post #${id} deleted successfully.`, "success");
            loadPosts();
        } catch (error) {
            console.error("Delete Error:", error);
            showAlert(`Failed to delete: ${error.message}`, "danger");
        }
    };

    const openCreateModal = () => {
        setModalData({ id: null, title: "", body: "" });
        if (bsModalInstance.current) {
            bsModalInstance.current.show();
        }
    };

    const openEditModal = (post) => {
        setModalData({ id: post.id, title: post.title || "", body: post.body || "" });
        if (bsModalInstance.current) {
            bsModalInstance.current.show();
        }
    };

    return (
        <div>
            <Navbar
                apiConnected={apiConnected}
                loading={loading}
                onRefresh={loadPosts}
                onCreate={openCreateModal}
            />

            <main className="container my-4">
                <AlertBanner alert={flashMessage} />

                {loading && (
                    <div className="text-center my-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted mt-2">Connecting to API...</p>
                    </div>
                )}

                {!loading && posts.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <i className="bi bi-folder2-open display-4 d-block mb-2"></i>
                        <h5>No posts found in database</h5>
                        <p>
                            Click <strong>"New Post"</strong> above to create your first item.
                        </p>
                    </div>
                ) : (
                    <div className="row g-3">
                        {posts.map((post) => (
                            <div key={post.id} className="col-md-6 col-lg-4">
                                <PostCard post={post} onEdit={openEditModal} onDelete={handleDeletePost} />
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <PostModal
                modalData={modalData}
                saving={saving}
                onSubmit={handleSavePost}
                onChange={handleChangeModal}
                onClose={{ modalRef }}
            />
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
