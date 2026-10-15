function PostModal({ modalData, modalRef, saving, onSubmit, onChange }) {
  return (
    <div className="modal fade" id="postModal" ref={modalRef} tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content border-0 shadow">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              {modalData.id ? `Edit Post #${modalData.id}` : 'Create New Post'}
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
                  onChange={(event) => onChange('title', event.target.value)}
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
                  onChange={(event) => onChange('body', event.target.value)}
                  required
                ></textarea>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                {saving ? 'Saving...' : 'Save Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PostModal;
