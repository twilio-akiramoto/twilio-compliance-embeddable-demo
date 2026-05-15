import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getCustomers } from '../services/dashboard';
import StatusBadge from '../components/StatusBadge';
import '../styles/CustomerList.css';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCustomers();
  }, [statusFilter]);

  const loadCustomers = async (page = 1) => {
    setLoading(true);
    try {
      const filters = { page, limit: 20 };
      if (statusFilter) filters.status = statusFilter;

      const data = await getCustomers(filters);
      setCustomers(data.customers);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredCustomers = customers.filter(customer =>
    !searchTerm ||
    customer.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>ISV Dashboard</h1>
          <p>Welcome back, {user?.username || 'CSM'}</p>
        </div>
        <nav className="header-nav">
          <button onClick={() => navigate('/dashboard')} className="nav-link">
            Dashboard
          </button>
          <button onClick={() => navigate('/customers')} className="nav-link active">
            Customers
          </button>
          <button onClick={() => navigate('/invitations')} className="nav-link">
            Send Invitation
          </button>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </nav>
      </header>

      <main className="page-content">
        <div className="page-header">
          <h2>Customers</h2>
          <button
            onClick={() => navigate('/invitations')}
            className="btn btn-primary"
          >
            + Send New Invitation
          </button>
        </div>

        <div className="filters-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by business name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All</option>
              <option value="sent">Sent</option>
              <option value="logged_in">Logged In</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            Loading customers...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <p>No customers found. Send an invitation to get started!</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Business Name</th>
                    <th>Contact Email</th>
                    <th>Status</th>
                    <th>Assigned CSM</th>
                    <th>Invitation Sent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <strong>{customer.businessName}</strong>
                        {customer.businessWebsite && (
                          <div className="secondary-text">{customer.businessWebsite}</div>
                        )}
                      </td>
                      <td>{customer.contactEmail}</td>
                      <td>
                        <StatusBadge status={customer.invitationStatus} />
                      </td>
                      <td>
                        {customer.csm?.username || 'Unassigned'}
                      </td>
                      <td>{formatDate(customer.invitationSentAt)}</td>
                      <td>
                        <button
                          onClick={() => navigate(`/customers/${customer.id}`)}
                          className="btn btn-small"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => loadCustomers(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => loadCustomers(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
