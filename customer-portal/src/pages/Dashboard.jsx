import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Customer Portal</h1>
          <p>Update your Australia Alphanumeric Sender ID</p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="iframe-container">
          <iframe
            src="http://localhost:3010/au-alphanumeric"
            title="Australia Alphanumeric Sender ID Registration"
            style={{
              width: '100%',
              height: 'calc(100vh - 200px)',
              border: 'none',
              borderRadius: '8px'
            }}
          />
        </div>
      </div>
    </div>
  );
}
