interface NavbarProps {
  apiConnected: boolean;
  loading: boolean;
  onRefresh: () => void | Promise<void>;
  onCreate: () => void;
}

function Navbar({ apiConnected, loading, onRefresh, onCreate }: NavbarProps) {
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
            <span className={`badge-status ${apiConnected ? 'badge-online' : 'badge-offline'} me-1`}></span>
            <span>{apiConnected ? 'API Connected (MySQL)' : 'API Disconnected'}</span>
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

export default Navbar;
