import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ name: '', contact: '', email: '', history: '' });
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [salesForm, setSalesForm] = useState({
    productName: '',
    revenue: '',
    dealDate: '',
    salesRep: '',
    status: 'closed'
  });
  const [customerSales, setCustomerSales] = useState([]);
  const [showSalesChart, setShowSalesChart] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [editingSale, setEditingSale] = useState(null);

  useEffect(() => {
    fetchCustomers();
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:5000/auth/user', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setUserRole(response.data.role);
      })
      .catch(error => {
        console.error('Error fetching user role:', error);
      });
    }
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(res.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/customers', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({ name: '', contact: '', email: '', history: '' });
      fetchCustomers();
    } catch (error) {
      console.error('Error adding customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const fetchCustomerSales = async (customerId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/customers/${customerId}/sales`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomerSales(res.data);
    } catch (error) {
      console.error('Error fetching customer sales:', error);
    }
  };

  const handleAddSale = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!salesForm.productName || !salesForm.revenue || !salesForm.dealDate || !salesForm.salesRep) {
      alert('Please fill in all required sales fields');
      return;
    }
    
    // Convert string values to numbers
    const salesData = {
      productName: salesForm.productName.trim(),
      revenue: parseFloat(salesForm.revenue),
      dealDate: salesForm.dealDate,
      salesRep: salesForm.salesRep.trim(),
      status: salesForm.status
    };
    
    // Validate numeric values
    if (isNaN(salesData.revenue) || salesData.revenue <= 0) {
      alert('Please enter a valid revenue greater than 0');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/customers/${selectedCustomer._id}/sales`, salesData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Reset form and close modal
      setSalesForm({ productName: '', revenue: '', dealDate: '', salesRep: '', status: 'closed' });
      setShowSalesModal(false);
      fetchCustomers();
      fetchCustomerSales(selectedCustomer._id);
      
      // Show success message
      alert('Sale added successfully!');
      
    } catch (error) {
      console.error('Error adding sale:', error);
      if (error.response?.status === 403) {
        alert('Only administrators can add new sales records.');
      } else {
        alert(`Error adding sale: ${error.response?.data?.error || error.message}`);
      }
    }
  };

  const handleUpdateSale = async (saleId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/customers/${selectedCustomer._id}/sales/${saleId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCustomers();
      fetchCustomerSales(selectedCustomer._id);
    } catch (error) {
      console.error('Error updating sale:', error);
    }
  };

  const handleDeleteSale = async (saleId) => {
    if (!window.confirm('Are you sure you want to delete this sale record?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/customers/${selectedCustomer._id}/sales/${saleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCustomers();
      fetchCustomerSales(selectedCustomer._id);
    } catch (error) {
      console.error('Error deleting sale:', error);
    }
  };

  const openSalesModal = (customer) => {
    setSelectedCustomer(customer);
    setShowSalesModal(true);
    fetchCustomerSales(customer._id);
  };

  const getSalesChartData = () => {
    if (!customerSales.length) return null;
    
    const salesLabels = customerSales.map(sale => sale.productName);
    const salesData = customerSales.map(sale => sale.revenue);
    
    return {
      labels: salesLabels,
      datasets: [
        {
          label: 'Revenue',
          data: salesData,
          borderColor: 'rgb(102, 126, 234)',
          backgroundColor: 'rgba(102, 126, 234, 0.2)',
          tension: 0.1,
        }
      ]
    };
  };

  const getSalesPieData = () => {
    if (!customerSales.length) return null;
    
    const labels = customerSales.map(sale => sale.productName);
    const data = customerSales.map(sale => sale.revenue);
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
            'rgba(40, 167, 69, 0.8)',
            'rgba(255, 193, 7, 0.8)',
            'rgba(220, 53, 69, 0.8)',
            'rgba(23, 162, 184, 0.8)',
          ],
          borderColor: [
            'rgb(102, 126, 234)',
            'rgb(118, 75, 162)',
            'rgb(40, 167, 69)',
            'rgb(255, 193, 7)',
            'rgb(220, 53, 69)',
            'rgb(23, 162, 184)',
          ],
          borderWidth: 2,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sales Revenue Comparison',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue (₹)'
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Sales Distribution',
      },
    }
  };

  return (
    <div className="container">
      <div className="page-header fade-in">
        <h1 className="page-title">Customer Management</h1>
        <p className="page-subtitle">Manage your customer relationships and contacts</p>
      </div>

      {/* Add Customer Form */}
      <div className="content-section">
        <div className="content-section-header">
          <div>
            <h3 className="content-section-title">Add New Customer</h3>
            <p className="content-section-subtitle">Enter customer information</p>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-row-straight">
              <div className="form-group">
                <label className="form-label">Customer Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter customer name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Number</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Enter contact number"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row-straight">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Customer History</label>
                <textarea
                  className="form-control"
                  placeholder="Enter customer history or notes"
                  value={form.history}
                  onChange={(e) => setForm({ ...form, history: e.target.value })}
                  rows="3"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading"></span> Adding Customer...
                </>
              ) : (
                'Add Customer'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Customer List */}
      <div className="table-container hover-lift">
        <div className="card-header">
          <h3 className="card-title">Customer List</h3>
          <p className="card-subtitle">
            {customers.length} customers
          </p>
        </div>
        {loading ? (
          <div className="text-center p-4">
            <div className="loading"></div>
            <p className="text-muted mt-2">Loading customers...</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Customer Information</th>
                <th>Contact Details</th>
                <th>Sales Records</th>
                <th>History</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer._id}>
                  <td>
                    <div>
                      <strong>{customer.name}</strong><br />
                      <small className="text-muted">ID: {customer._id}</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div><strong>Email:</strong> {customer.email}</div>
                      <div><strong>Phone:</strong> {customer.contact}</div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div><strong>Sales:</strong> {customer.sales ? customer.sales.length : 0}</div>
                      <div><strong>Total Revenue:</strong> ₹{customer.totalSalesValue ? customer.totalSalesValue.toFixed(2) : '0.00'}</div>
                      {customer.sales && customer.sales.length > 0 && (
                        <button 
                          onClick={() => openSalesModal(customer)}
                          className="btn btn-info btn-sm mt-2"
                        >
                          Manage Sales
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <div>
                      {customer.history ? (
                        <small>{customer.history}</small>
                      ) : (
                        <span className="text-muted">No history available</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="actions-straight">
                      <button 
                        onClick={() => openSalesModal(customer)}
                        className="btn btn-primary btn-sm"
                      >
                        Sales
                      </button>
                      <button 
                        onClick={() => deleteCustomer(customer._id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {customers.length === 0 && !loading && (
          <div className="text-center p-4">
            <p className="text-muted">
              No customers found. Add your first customer above.
            </p>
          </div>
        )}
      </div>
      
      {/* Sales Management Modal */}
      {showSalesModal && selectedCustomer && (
        <div className="modal-professional show">
          <div className="modal-content-professional">
            <div className="modal-header">
              <div className="modal-header-content">
                <h3>Sales Management - {selectedCustomer.name}</h3>
              </div>
              <div className="modal-header-actions">
                <button 
                  onClick={() => setShowSalesModal(false)} 
                  className="btn btn-secondary btn-sm"
                  type="button"
                >
                  × Close
                </button>
              </div>
            </div>
            <div className="modal-body">
              {/* Add Sales Form - Admin Only */}
              {userRole === 'admin' ? (
                <div className="content-section">
                  <h4>Add New Sales Record</h4>
                  <form onSubmit={handleAddSale}>
                    <div className="form-row-straight">
                      <div className="form-group">
                        <label className="form-label">Product Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g., CRM Pro"
                          value={salesForm.productName}
                          onChange={(e) => setSalesForm({ ...salesForm, productName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Revenue</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          placeholder="Revenue amount"
                          value={salesForm.revenue}
                          onChange={(e) => setSalesForm({ ...salesForm, revenue: e.target.value })}
                          min="0.01"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row-straight">
                      <div className="form-group">
                        <label className="form-label">Deal Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={salesForm.dealDate}
                          onChange={(e) => setSalesForm({ ...salesForm, dealDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Sales Representative</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g., John Doe"
                          value={salesForm.salesRep}
                          onChange={(e) => setSalesForm({ ...salesForm, salesRep: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select
                          className="form-control"
                          value={salesForm.status}
                          onChange={(e) => setSalesForm({ ...salesForm, status: e.target.value })}
                          required
                        >
                          <option value="pending">Pending</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary">Add Sales Record</button>
                  </form>
                </div>
              ) : (
                <div className="content-section">
                  <div className="alert alert-info">
                    <h4>Sales Management</h4>
                    <p>Only administrators can add new sales records. As a user, you can view existing sales information below.</p>
                  </div>
                </div>
              )}
              
              {/* Sales Charts */}
              {customerSales.length > 0 && (
                <div className="content-section">
                  <div className="flex-between mb-3">
                    <h4>Sales Charts</h4>
                    <button 
                      onClick={() => setShowSalesChart(!showSalesChart)}
                      className="btn btn-info btn-sm"
                    >
                      {showSalesChart ? 'Hide Charts' : 'Show Charts'}
                    </button>
                  </div>
                  
                  {showSalesChart && (
                    <div className="charts-container">
                      <div className="row">
                        <div className="col-md-8">
                          <div className="card">
                            <h5>Revenue Overview</h5>
                            <Line data={getSalesChartData()} options={chartOptions} />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="card">
                            <h5>Sales Distribution</h5>
                            <Pie data={getSalesPieData()} options={pieOptions} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Existing Sales */}
              {customerSales.length > 0 && (
                <div className="content-section">
                  <h4>Current Sales</h4>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Revenue</th>
                        <th>Deal Date</th>
                        <th>Sales Rep</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerSales.map(sale => (
                        <tr key={sale._id}>
                          <td><strong>{sale.productName}</strong></td>
                          <td>₹{sale.revenue.toFixed(2)}</td>
                          <td>{new Date(sale.dealDate).toLocaleDateString()}</td>
                          <td>{sale.salesRep}</td>
                          <td>
                            {editingSale === sale._id ? (
                              <select
                                value={sale.status}
                                onChange={(e) => handleUpdateSale(sale._id, { status: e.target.value })}
                                onBlur={() => setEditingSale(null)}
                                className="form-control form-control-sm"
                                style={{ width: '100px' }}
                              >
                                <option value="pending">Pending</option>
                                <option value="closed">Closed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            ) : (
                              <span className={`badge ${
                                sale.status === 'closed' ? 'bg-success' : 
                                sale.status === 'pending' ? 'bg-warning' : 'bg-info'
                              }`}>
                                {sale.status}
                              </span>
                            )}
                          </td>
                          <td>
                            <button 
                              onClick={() => setEditingSale(sale._id)}
                              className="btn btn-primary btn-sm me-2"
                            >
                              Edit Status
                            </button>
                            <button 
                              onClick={() => handleDeleteSale(sale._id)}
                              className="btn btn-danger btn-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;