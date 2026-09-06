import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepare chart data
  const statusChartData = {
    labels: data.leadsByStatus?.map(item => item._id) || [],
    datasets: [
      {
        data: data.leadsByStatus?.map(item => item.count) || [],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const barChartData = {
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

  const doughnutChartData = {
    labels: ['Total Customers', 'Total Leads'],
    datasets: [
      {
        data: [data.totalCustomers || 0, data.totalLeads || 0],
        backgroundColor: ['#36A2EB', '#FF6384'],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  // Sales chart data
  const salesChartData = {
    labels: data.salesData?.map(sale => sale.month) || [],
    datasets: [
      {
        label: 'Revenue',
        data: data.salesData?.map(sale => sale.revenue) || [],
        backgroundColor: 'rgba(102, 126, 234, 0.6)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2,
      },
      {
        label: 'Deals',
        data: data.salesData?.map(sale => sale.deals * 1000) || [],
        backgroundColor: 'rgba(40, 167, 69, 0.6)',
        borderColor: 'rgba(40, 167, 69, 1)',
        borderWidth: 2,
      },
    ],
  };

  const salesPieData = {
    labels: data.salesByProduct?.map(product => product.product) || [],
    datasets: [
      {
        data: data.salesByProduct?.map(product => product.revenue) || [],
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'CRM Analytics',
      },
    },
  };

  return (
    <div className="container">
      <div className="page-header fade-in">
        <h1 className="page-title">User Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's an overview of your CRM activity.</p>
      </div>

      <div style={{ marginBottom: '2rem' }}></div>

      {loading ? (
        <div className="text-center mt-4">
          <div className="loading"></div>
          <p className="text-muted mt-2">Loading dashboard data...</p>
        </div>
      ) : (
        <div className="dashboard-layout-straight">
          {/* Stats Cards Row */}
          <div className="stats-row-straight">
            <div className="stat-card hover-lift">
              <div className="stat-number">{data.totalCustomers || 0}</div>
              <div className="stat-label">Total Customers</div>
            </div>
            <div className="stat-card success hover-lift">
              <div className="stat-number">{data.totalLeads || 0}</div>
              <div className="stat-label">Total Leads</div>
            </div>
            <div className="stat-card info hover-lift">
              <div className="stat-number">
                {data.totalCustomers && data.totalLeads ? Math.round((data.totalCustomers / data.totalLeads) * 100) : 0}%
              </div>
              <div className="stat-label">Conversion Rate</div>
            </div>
            <div className="stat-card warning hover-lift">
              <div className="stat-number">{data.leadsByStatus?.filter(l => l._id === 'new').length || 0}</div>
              <div className="stat-label">New Leads</div>
            </div>
            <div className="stat-card primary hover-lift">
              <div className="stat-number">₹{(data.monthlyRevenue || 0).toLocaleString()}</div>
              <div className="stat-label">Monthly Revenue</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="charts-row-straight">
            <div className="chart-container hover-lift">
              <h3 className="chart-title">Lead Status Distribution</h3>
              {data.leadsByStatus && data.leadsByStatus.length > 0 ? (
                <Pie data={statusChartData} options={chartOptions} />
              ) : (
                <p className="text-muted">No lead data available</p>
              )}
            </div>
            <div className="chart-container hover-lift">
              <h3 className="chart-title">Customer vs Leads</h3>
              <Doughnut data={doughnutChartData} options={chartOptions} />
            </div>
          </div>

          {/* Sales Charts Row */}
          <div className="charts-row-straight">
            <div className="chart-container hover-lift">
              <h3 className="chart-title">Sales Performance</h3>
              {data.salesData && data.salesData.length > 0 ? (
                <Bar data={salesChartData} options={chartOptions} />
              ) : (
                <p className="text-muted">No sales data available</p>
              )}
            </div>
            <div className="chart-container hover-lift">
              <h3 className="chart-title">Sales Distribution</h3>
              {data.salesByProduct && data.salesByProduct.length > 0 ? (
                <Pie data={salesPieData} options={chartOptions} />
              ) : (
                <p className="text-muted">No sales data available</p>
              )}
            </div>
          </div>

          {/* Lead Status Details Section */}
          <div className="content-section">
            <div className="content-section-header">
              <div>
                <h3 className="content-section-title">Lead Status Details</h3>
                <p className="content-section-subtitle">Breakdown of leads by status</p>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-4">
                {data.leadsByStatus?.map(item => (
                  <div key={item._id} className="straight-section text-center">
                    <h4 style={{ margin: '0 0 1rem 0', textTransform: 'capitalize', color: '#333' }}>{item._id}</h4>
                    <div className="stat-number" style={{ fontSize: '2rem', margin: '0', fontWeight: 'bold' }}>{item.count}</div>
                    <div className="stat-label" style={{ fontSize: '0.9rem' }}>leads</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="content-section">
            <div className="content-section-header">
              <div>
                <h3 className="content-section-title">Quick Actions</h3>
                <p className="content-section-subtitle">Common tasks you can perform</p>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-3">
                <Link to="/customers" className="btn btn-primary">
                  Manage Customers
                </Link>
                <Link to="/leads" className="btn btn-success">
                  Track Leads
                </Link>
                <Link to="/reminders" className="btn btn-warning">
                  View Reminders
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;