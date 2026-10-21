import type { Post } from '../types';

// ----- Component props -----
// Receive the post to display and typed callbacks for editing or deleting it.
interface PostCardProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (id: Post['id']) => void;
}

// ----- Post card -----
// Present a single post; delegate mutations to App through the supplied callbacks.
function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  return (
    <div className="card h-100 border-0 shadow-sm p-3">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold">#{post.id}</span>
        <small className="text-muted">
          {post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}
        </small>
      </div>

      <h5 className="card-title fw-bold text-dark">{post.title || 'Untitled'}</h5>
      <p className="card-text text-secondary flex-grow-1">{post.body || '(no content)'}</p>

      <div className="d-flex justify-content-end gap-2 border-top pt-3 mt-2">
        <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(post)}>
          <i className="bi bi-pencil me-1"></i>Edit
        </button>
        <button
          className="btn btn-sm btn-outline-danger"
          aria-label={`Delete post #${post.id}`}
          onClick={() => onDelete(post.id)}
        >
          <i className="bi bi-trash me-1"></i>Delete
        </button>
      </div>
    </div>
  );
}

export default PostCard;
