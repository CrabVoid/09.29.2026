import type { FormEvent, RefObject } from 'react';
import type { ModalData } from '../types';

// ----- Component props -----
// Types describe the modal element reference, controlled form data, and handlers.
interface PostModalProps {
  modalData: ModalData;
  modalRef: RefObject<HTMLDivElement>;
  saving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (field: 'title' | 'body', value: string) => void;
}

// ----- Controlled create/edit form -----
// App supplies field values and handles changes/submission so it remains the
// single source of truth for the form.
function PostModal({ modalData, modalRef, saving, onSubmit, onChange }: PostModalProps) {
  return (
    <div className="modal fade" id="postModal" ref={modalRef} tabIndex={-1} aria-hidden="true">
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
                <label htmlFor="post-title" className="form-label fw-semibold">
                  Title
                </label>
                <input
                  id="post-title"
                  type="text"
                  className="form-control"
                  placeholder="e.g. React + Laravel"
                  value={modalData.title}
                  onChange={(event) => onChange('title', event.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="post-content" className="form-label fw-semibold">
                  Content
                </label>
                <textarea
                  id="post-content"
                  className="form-control"
                  rows={4}
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
