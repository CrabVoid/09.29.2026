import { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import AlertBanner from './components/AlertBanner';
import PostCard from './components/PostCard';
import PostModal from './components/PostModal';

const API_URL = 'http://127.0.0.1:8000/api/posts';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [alert, setAlert] = useState(null);
  const [modalData, setModalData] = useState({ id: null, title: '', body: '' });
  const [saving, setSaving] = useState(false);

  const modalRef = useRef(null);
  const bsModalInstance = useRef(null);

  const showAlert = useCallback((message, type = 'danger') => {
    setAlert({ message, type });
    window.setTimeout(() => setAlert(null), 4000);
  }, []);

  const loadPosts = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
      setApiConnected(true);
    } catch (error) {
      console.error('Fetch Error:', error);
      setApiConnected(false);
      showAlert(`Failed to fetch posts: ${error.message}`, 'danger');
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
      showAlert('Please fill out both Title and Content fields.', 'warning');
      return;
    }

    setSaving(true);

    const isEditing = Boolean(modalData.id);
    const url = isEditing ? `${API_URL}/${modalData.id}` : API_URL;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          title: modalData.title.trim(),
          body: modalData.body.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (bsModalInstance.current) {
        bsModalInstance.current.hide();
      }

      showAlert(
        isEditing ? 'Post updated successfully!' : 'Post created successfully!',
        'success'
      );
      loadPosts();
    } catch (error) {
      console.error('Save Error:', error);
      showAlert(`Failed to save post: ${error.message}`, 'danger');
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
        method: 'DELETE',
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      showAlert(`Post #${id} deleted successfully.`, 'success');
      loadPosts();
    } catch (error) {
      console.error('Delete Error:', error);
      showAlert(`Failed to delete: ${error.message}`, 'danger');
    }
  };

  const openCreateModal = () => {
    setModalData({ id: null, title: '', body: '' });
    if (bsModalInstance.current) {
      bsModalInstance.current.show();
    }
  };

  const openEditModal = (post) => {
    setModalData({ id: post.id, title: post.title || '', body: post.body || '' });
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
        <AlertBanner alert={alert} />

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
        modalRef={modalRef}
        saving={saving}
        onSubmit={handleSavePost}
        onChange={handleChangeModal}
      />
    </div>
  );
}

export default App;
