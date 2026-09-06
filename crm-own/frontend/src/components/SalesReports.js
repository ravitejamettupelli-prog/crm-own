import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';

import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const SalesReports = () => {
  const [salesData, setSalesData] = useState({
    monthly: [],
    quarterly: [],
    yearly: [],
    byProduct: [],
    byRegion: [],
    bySalesRep: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedChart, setSelectedChart] = useState('revenue');

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/sales/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSalesData(res.data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      // Set empty data on error
      setSalesData({
        monthly: [],
        quarterly: [],
        yearly: [],
        byProduct: [],
        byRegion: [],
        bySalesRep: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getRevenueChartData = () => {
    const data = selectedPeriod === 'monthly' ? salesData.monthly : 
                  selectedPeriod === 'quarterly' ? salesData.quarterly : salesData.yearly;
    
    return {
      labels: data.map(item => selectedPeriod === 'monthly' ? item.month : 
                         selectedPeriod === 'quarterly' ? item.quarter : item.year),
      datasets: [
        {
          label: 'Revenue (₹)',
          data: data.map(item => item.revenue),
          backgroundColor: 'rgba(102, 126, 234, 0.6)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 2,
        },
        {
          label: 'Deals Count',
          data: data.map(item => item.deals * 1000), // Scale for visibility
          backgroundColor: 'rgba(40, 167, 69, 0.6)',
          borderColor: 'rgba(40, 167, 69, 1)',
          borderWidth: 2,
        }
      ]
    };
  };

  const getDealsTrendData = () => {
    const data = selectedPeriod === 'monthly' ? salesData.monthly : 
                  selectedPeriod === 'quarterly' ? salesData.quarterly : salesData.yearly;
    
    return {
      labels: data.map(item => selectedPeriod === 'monthly' ? item.month : 
                         selectedPeriod === 'quarterly' ? item.quarter : item.year),
      datasets: [
        {
          label: 'Deals',
          data: data.map(item => item.deals),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'New Customers',
          data: data.map(item => item.customers),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  const getProductDistributionData = () => {
    // Aggregate period-specific data for selected period
    let periodData = [];
    salesData.byProduct.forEach(product => {
      if (selectedPeriod === 'monthly' && product.monthly) {
        periodData = periodData.concat(product.monthly);
      } else if (selectedPeriod === 'quarterly' && product.quarterly) {
        periodData = periodData.concat(product.quarterly);
      } else if (selectedPeriod === 'yearly' && product.yearly) {
        periodData = periodData.concat(product.yearly);
      } else {
        // Default to overall data
        periodData.push({ product: product.product, revenue: product.revenue });
      }
    });

    // Group by product name for the selected period
    const groupedData = {};
    periodData.forEach(item => {
      const name = item.product || item.product;
      if (!groupedData[name]) {
        groupedData[name] = 0;
      }
      groupedData[name] += item.revenue || 0;
    });

    return {
      labels: Object.keys(groupedData),
      datasets: [
        {
          data: Object.values(groupedData),
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
        }
      ]
    };
  };

  const getRegionDistributionData = () => {
    return {
      labels: salesData.byRegion.map(item => item.region),
      datasets: [
        {
          data: salesData.byRegion.map(item => item.revenue),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0'
          ],
          borderWidth: 2,
          borderColor: '#fff',
        }
      ]
    };
  };

  const getSalesRepData = () => {
    // Aggregate period-specific data for selected period
    let periodData = [];
    salesData.bySalesRep.forEach(rep => {
      if (selectedPeriod === 'monthly' && rep.monthly) {
        periodData = periodData.concat(rep.monthly);
      } else if (selectedPeriod === 'quarterly' && rep.quarterly) {
        periodData = periodData.concat(rep.quarterly);
      } else if (selectedPeriod === 'yearly' && rep.yearly) {
        periodData = periodData.concat(rep.yearly);
      } else {
        // Default to overall data
        periodData.push({ name: rep.name, revenue: rep.revenue, commission: rep.commission });
      }
    });

    // Group by rep name for the selected period
    const groupedData = {};
    periodData.forEach(item => {
      const name = item.name;
      if (!groupedData[name]) {
        groupedData[name] = { revenue: 0, commission: 0 };
      }
      groupedData[name].revenue += item.revenue || 0;
      groupedData[name].commission += parseFloat(item.commission || 0);
    });

    const names = Object.keys(groupedData);

    return {
      labels: names,
      datasets: [
        {
          label: 'Revenue (₹)',
          data: names.map(name => groupedData[name].revenue),
          backgroundColor: 'rgba(102, 126, 234, 0.6)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 2,
        },
        {
          label: 'Commission (₹)',
          data: names.map(name => groupedData[name].commission),
          backgroundColor: 'rgba(255, 193, 7, 0.6)',
          borderColor: 'rgba(255, 193, 7, 1)',
          borderWidth: 2,
        }
      ]
    };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTotalRevenue = () => {
    const data = selectedPeriod === 'monthly' ? salesData.monthly : 
                  selectedPeriod === 'quarterly' ? salesData.quarterly : salesData.yearly;
    return data.reduce((sum, item) => sum + item.revenue, 0);
  };

  const getTotalDeals = () => {
    const data = selectedPeriod === 'monthly' ? salesData.monthly : 
                  selectedPeriod === 'quarterly' ? salesData.quarterly : salesData.yearly;
    return data.reduce((sum, item) => sum + item.deals, 0);
  };

  const getAverageDealSize = () => {
    const totalRevenue = getTotalRevenue();
    const totalDeals = getTotalDeals();
    return totalDeals > 0 ? totalRevenue / totalDeals : 0;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="text-center mt-4">
          <div className="colorful-loading"></div>
          <p className="text-muted mt-2">Loading sales reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="colorful-page-header">
        <h1 className="colorful-page-title">Sales Reports</h1>
        <p className="colorful-page-subtitle">Comprehensive sales analytics and performance metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="colorful-grid">
        <div className="colorful-card success">
          <div className="stat-number">{formatCurrency(getTotalRevenue())}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="colorful-card info">
          <div className="stat-number">{getTotalDeals()}</div>
          <div className="stat-label">Total Deals</div>
        </div>
        <div className="colorful-card warning">
          <div className="stat-number">{formatCurrency(getAverageDealSize())}</div>
          <div className="stat-label">Average Deal Size</div>
        </div>
        <div className="colorful-card primary">
          <div className="stat-number">{salesData.bySalesRep.length}</div>
          <div className="stat-label">Sales Reps</div>
        </div>
      </div>

      {/* Controls */}
      <div className="colorful-card mb-4">
        <div className="card-body">
          <div className="grid grid-3">
            <div>
              <label className="form-label">Period</label>
              <select 
                className="form-control"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="form-label">Chart Type</label>
              <select 
                className="form-control"
                value={selectedChart}
                onChange={(e) => setSelectedChart(e.target.value)}
              >
                <option value="revenue">Revenue Overview</option>
                <option value="trends">Deals Trends</option>
                <option value="products">Product Distribution</option>
                <option value="regions">Regional Distribution</option>
                <option value="reps">Sales Rep Performance</option>
              </select>
            </div>
            <div>
              <label className="form-label">Actions</label>
              <button className="btn btn-primary w-100" onClick={fetchSalesData}>
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="colorful-grid">
        {selectedChart === 'revenue' && (
          <div className="colorful-card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header">
              <h3 className="card-title">Revenue Overview</h3>
              <p className="card-subtitle">Revenue and deals count by {selectedPeriod}</p>
            </div>
            <div className="card-body">
              <Bar data={getRevenueChartData()} options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: `Revenue & Deals - ${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}`
                  }
                }
              }} />
            </div>
          </div>
        )}

        {selectedChart === 'trends' && (
          <div className="colorful-card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header">
              <h3 className="card-title">Deals & Customer Trends</h3>
              <p className="card-subtitle">Trend analysis over time</p>
            </div>
            <div className="card-body">
              <Line data={getDealsTrendData()} options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Deals and Customer Acquisition Trends'
                  }
                }
              }} />
            </div>
          </div>
        )}

        {selectedChart === 'products' && (
          <>
            <div className="colorful-card">
              <div className="card-header">
                <h3 className="card-title">Product Distribution</h3>
                <p className="card-subtitle">Revenue by product</p>
              </div>
              <div className="card-body">
                <Doughnut data={getProductDistributionData()} options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    title: {
                      display: true,
                      text: 'Revenue Distribution by Product'
                    }
                  }
                }} />
              </div>
            </div>
            <div className="colorful-card">
              <div className="card-header">
                <h3 className="card-title">Product Details</h3>
                <p className="card-subtitle">Performance metrics</p>
              </div>
              <div className="card-body">
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Revenue</th>
                        <th>Units</th>
                        <th>%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.byProduct.map((product, index) => (
                        <tr key={index}>
                          <td>{product.product}</td>
                          <td>{formatCurrency(product.revenue)}</td>
                          <td>{product.units}</td>
                          <td>{product.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedChart === 'regions' && (
          <>
            <div className="colorful-card">
              <div className="card-header">
                <h3 className="card-title">Regional Distribution</h3>
                <p className="card-subtitle">Revenue by region</p>
              </div>
              <div className="card-body">
                <Doughnut data={getRegionDistributionData()} options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    title: {
                      display: true,
                      text: 'Revenue Distribution by Region'
                    }
                  }
                }} />
              </div>
            </div>
            <div className="colorful-card">
              <div className="card-header">
                <h3 className="card-title">Regional Performance</h3>
                <p className="card-subtitle">Metrics by region</p>
              </div>
              <div className="card-body">
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Region</th>
                        <th>Revenue</th>
                        <th>Deals</th>
                        <th>%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.byRegion.map((region, index) => (
                        <tr key={index}>
                          <td>{region.region}</td>
                          <td>{formatCurrency(region.revenue)}</td>
                          <td>{region.deals}</td>
                          <td>{region.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedChart === 'reps' && (
          <div className="colorful-card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header">
              <h3 className="card-title">Sales Rep Performance</h3>
              <p className="card-subtitle">Revenue and commission by sales representative</p>
            </div>
            <div className="card-body">
              <Bar data={getSalesRepData()} options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Sales Representative Performance'
                  }
                }
              }} />
              <div className="mt-4">
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Sales Rep</th>
                        <th>Revenue</th>
                        <th>Deals</th>
                        <th>Commission</th>
                        <th>Avg Deal Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.bySalesRep.map((rep, index) => (
                        <tr key={index}>
                          <td>{rep.name}</td>
                          <td>{formatCurrency(rep.revenue)}</td>
                          <td>{rep.deals}</td>
                          <td>{formatCurrency(rep.commission)}</td>
                          <td>{formatCurrency(rep.revenue / rep.deals)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesReports;
