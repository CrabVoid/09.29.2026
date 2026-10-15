import { useState, useEffect, useRef, useCallback } from 'react';
import type { FormEvent } from 'react';
import Navbar from './components/Navbar';
import AlertBanner from './components/AlertBanner';
import PostCard from './components/PostCard';
import PostModal from './components/PostModal';
import type { AlertData, ModalData, Post } from './types';

const API_URL = 'http://127.0.0.1:8000/api/posts';

// ----- Normalize errors -----
// A thrown value is not guaranteed to be an Error, so convert it to displayable text.
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// ----- Validate API data -----
// JSON from fetch is untrusted. Check the fields the UI needs before treating an
// object as a Post; the type predicate then lets TypeScript narrow the value.
function isPost(value: unknown): value is Post {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const post = value as Record<string, unknown>;

  return (
    typeof post.id === 'number' &&
    typeof post.title === 'string' &&
    typeof post.body === 'string' &&
    (post.created_at === undefined ||
      post.created_at === null ||
      typeof post.created_at === 'string')
  );
}

function isPostArray(value: unknown): value is Post[] {
  return Array.isArray(value) && value.every(isPost);
}

// ----- App state and element references -----
// App owns the post list and coordinates requests, alerts, and the Bootstrap modal.
function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [alert, setAlert] = useState<AlertData | null>(null);
  const [modalData, setModalData] = useState<ModalData>({ id: null, title: '', body: '' });
  const [saving, setSaving] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const bsModalInstance = useRef<bootstrap.Modal | null>(null);

  // ----- Alerts and post loading -----
  // Keep alert display and fetching in reusable callbacks so effects and buttons
  // can invoke the same behavior.
  const showAlert = useCallback((message: string, type: AlertData['type'] = 'danger') => {
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

      const data: unknown = await response.json();
      if (!isPostArray(data)) {
        throw new Error('The posts API returned data in an unexpected format.');
      }

      setPosts(data);
      setApiConnected(true);
    } catch (error) {
      console.error('Fetch Error:', error);
      setApiConnected(false);
      showAlert(`Failed to fetch posts: ${getErrorMessage(error)}`, 'danger');
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  // ----- Initialize the Bootstrap modal and load initial data -----
  // The ref connects React's modal element to Bootstrap's imperative API.
  useEffect(() => {
    if (modalRef.current) {
      bsModalInstance.current = new window.bootstrap.Modal(modalRef.current);
    }

    loadPosts();
  }, [loadPosts]);

  // ----- Create and edit handlers -----
  // Update one modal field at a time while retaining the other field's value.
  const handleChangeModal = (field: 'title' | 'body', value: string) => {
    setModalData((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const handleSavePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!modalData.title.trim() || !modalData.body.trim()) {
      showAlert('Please fill out both Title and Content fields.', 'warning');
      return;
    }

    setSaving(true);

    // A null ID selects POST (create); an existing ID selects PUT (update).
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
      showAlert(`Failed to save post: ${getErrorMessage(error)}`, 'danger');
    } finally {
      setSaving(false);
    }
  };

  // ----- Delete handler -----
  // Ask for confirmation before sending the DELETE request to the API.
  const handleDeletePost = async (id: Post['id']) => {
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
      showAlert(`Failed to delete: ${getErrorMessage(error)}`, 'danger');
    }
  };

  // ----- Modal open handlers -----
  // Reset the form for creation, or prefill it with the chosen post for editing.
  const openCreateModal = () => {
    setModalData({ id: null, title: '', body: '' });
    if (bsModalInstance.current) {
      bsModalInstance.current.show();
    }
  };

  const openEditModal = (post: Post) => {
    setModalData({ id: post.id, title: post.title || '', body: post.body || '' });
    if (bsModalInstance.current) {
      bsModalInstance.current.show();
    }
  };

  // ----- Render the page -----
  // Pass state and callbacks to small presentational components; keep API work
  // and state changes centralized in this parent component.
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
