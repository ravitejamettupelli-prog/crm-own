import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminDashboard = () => {
  const [data, setData] = useState({});
  const [userActivity, setUserActivity] = useState([]);
  const [salesData, setSalesData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
    fetchUserActivity();
    fetchSalesData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/admin-dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivity = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/admin-dashboard/user-activity', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserActivity(res.data);
    } catch (error) {
      console.error('Error fetching user activity:', error);
    }
  };

  const fetchSalesData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/sales/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSalesData(res.data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  // Chart data configurations
  const userRoleData = {
    labels: ['Admin Users', 'Regular Users'],
    datasets: [
      {
        data: [data.adminUsers || 0, data.regularUsers || 0],
        backgroundColor: ['#FF6384', '#36A2EB'],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const leadStatusData = {
    labels: data.leadsByStatus?.map(item => item._id) || [],
    datasets: [
      {
        label: 'Number of Leads',
        data: data.leadsByStatus?.map(item => item.count) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const userActivityData = {
    labels: userActivity.map(user => user.name),
    datasets: [
      {
        label: 'Customers Created',
        data: userActivity.map(user => user.customersCreated),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Leads Created',
        data: userActivity.map(user => user.leadsCreated),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div className="container">
      <div className="page-header fade-in">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Complete system overview and analytics</p>
      </div>

      {loading ? (
        <div className="text-center mt-4">
          <div className="loading"></div>
          <p className="text-muted mt-2">Loading admin dashboard...</p>
        </div>
      ) : (
        <>
          {/* Admin Summary Cards */}
          <div className="stats-grid">
            <div className="stat-card hover-lift">
              <div className="stat-number">{data.totalUsers || 0}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card success hover-lift">
              <div className="stat-number">{data.totalCustomers || 0}</div>
              <div className="stat-label">Total Customers</div>
            </div>
            <div className="stat-card warning hover-lift">
              <div className="stat-number">{data.totalLeads || 0}</div>
              <div className="stat-label">Total Leads</div>
            </div>
            <div className="stat-card info hover-lift">
              <div className="stat-number">${(salesData.currentMonthRevenue || 0).toLocaleString()}</div>
              <div className="stat-label">Monthly Revenue</div>
            </div>
            <div className="stat-card primary hover-lift">
              <div className="stat-number">{salesData.currentMonthDeals || 0}</div>
              <div className="stat-label">Monthly Deals</div>
            </div>
            <div className="stat-card secondary hover-lift">
              <div className="stat-number">${(salesData.averageDealSize || 0).toLocaleString()}</div>
              <div className="stat-label">Avg Deal Size</div>
            </div>
            <div className="stat-card info hover-lift">
              <div className="stat-number">{data.conversionRate || 0}%</div>
              <div className="stat-label">Conversion Rate</div>
            </div>
          </div>

          {/* Alert Cards */}
          <div className="grid grid-3">
            <div className="card hover-lift">
              <div className="card-header">
                <h5 className="card-title">Recent Customers</h5>
                <p className="card-subtitle">Last 7 days</p>
              </div>
              <div className="card-body text-center">
                <div className="stat-number" style={{ fontSize: '2rem' }}>{data.recentCustomers || 0}</div>
                <span className="badge badge-success">Active</span>
              </div>
            </div>
            <div className="card hover-lift">
              <div className="card-header">
                <h5 className="card-title">High Priority Leads</h5>
                <p className="card-subtitle">Require attention</p>
              </div>
              <div className="card-body text-center">
                <div className="stat-number" style={{ fontSize: '2rem' }}>{data.highPriorityLeads || 0}</div>
                <span className="badge badge-warning">Urgent</span>
              </div>
            </div>
            <div className="card hover-lift">
              <div className="card-header">
                <h5 className="card-title">Overdue Reminders</h5>
                <p className="card-subtitle">Past due</p>
              </div>
              <div className="card-body text-center">
                <div className="stat-number" style={{ fontSize: '2rem' }}>{data.overdueReminders || 0}</div>
                <span className="badge badge-danger">Overdue</span>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-2">
            <div className="chart-container hover-lift">
              <h3 className="chart-title">User Role Distribution</h3>
              <Pie data={userRoleData} options={chartOptions} />
            </div>
            <div className="chart-container hover-lift">
              <h3 className="chart-title">Lead Status Distribution</h3>
              {data.leadsByStatus && data.leadsByStatus.length > 0 ? (
                <Bar data={leadStatusData} options={chartOptions} />
              ) : (
                <p className="text-muted">No lead data available</p>
              )}
            </div>
          </div>

          {/* User Activity Chart */}
          <div className="chart-container hover-lift">
            <h3 className="chart-title">User Activity Overview</h3>
            {userActivity.length > 0 ? (
              <Bar data={userActivityData} options={chartOptions} />
            ) : (
              <p className="text-muted">No user activity data available</p>
            )}
          </div>

          {/* User Activity Table */}
          <div className="table-container hover-lift">
            <div className="card-header">
              <h3 className="card-title">User Activity Summary</h3>
              <p className="card-subtitle">Detailed user performance metrics</p>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>User Information</th>
                  <th>Role</th>
                  <th>Customers Created</th>
                  <th>Leads Created</th>
                  <th>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {userActivity.map(user => (
                  <tr key={user.userId}>
                    <td>
                      <div>
                        <strong>{user.name}</strong><br />
                        <small className="text-muted">{user.email}</small>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success">{user.customersCreated}</span>
                    </td>
                    <td>
                      <span className="badge badge-warning">{user.leadsCreated}</span>
                    </td>
                    <td>
                      <small>{new Date(user.lastLogin).toLocaleDateString()}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Actions */}
          <div className="card hover-lift">
            <div className="card-header">
              <h3 className="card-title">Admin Actions</h3>
              <p className="card-subtitle">Quick administrative tasks</p>
            </div>
            <div className="card-body">
              <div className="grid grid-4">
                <Link to="/user-management" className="btn btn-primary">
                  Manage Users
                </Link>
                <Link to="/customers" className="btn btn-success">
                  View Customers
                </Link>
                <Link to="/leads" className="btn btn-warning">
                  Track Leads
                </Link>
                <Link to="/reminders" className="btn btn-info">
                  Check Reminders
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
