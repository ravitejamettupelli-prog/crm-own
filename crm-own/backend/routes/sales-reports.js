const express = require('express');
const db = require('../db/memory-store');
const { auth } = require('../middleware/auth');

const router = express.Router();

console.log('Sales-reports router created successfully');

// Helper function to calculate sales reports from actual customer data
const calculateSalesReports = () => {
  const customers = db.customers || [];
  const allSales = [];
  
  // Collect all sales from all customers
  customers.forEach(customer => {
    if (customer.sales && customer.sales.length > 0) {
      customer.sales.forEach(sale => {
        allSales.push({
          ...sale,
          customerName: customer.name
        });
      });
    }
  });

  // Filter only closed sales for revenue calculations
  const closedSales = allSales.filter(sale => sale.status === 'closed');

  // Calculate monthly data
  const monthlyData = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  closedSales.forEach(sale => {
    const dealDate = new Date(sale.dealDate);
    const monthKey = `${dealDate.getFullYear()}-${dealDate.getMonth()}`;
    const monthLabel = monthNames[dealDate.getMonth()];
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthLabel,
        year: dealDate.getFullYear(),
        revenue: 0,
        deals: 0,
        customers: new Set()
      };
    }
    
    monthlyData[monthKey].revenue += sale.revenue;
    monthlyData[monthKey].deals += 1;
    monthlyData[monthKey].customers.add(sale.customerName);
  });

  const monthly = Object.values(monthlyData).map(m => ({
    month: m.month,
    revenue: m.revenue,
    deals: m.deals,
    customers: m.customers.size
  })).sort((a, b) => {
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
  });

  // Calculate quarterly data
  const quarterlyData = {};
  closedSales.forEach(sale => {
    const dealDate = new Date(sale.dealDate);
    const quarter = Math.floor(dealDate.getMonth() / 3) + 1;
    const quarterKey = `${dealDate.getFullYear()}-Q${quarter}`;
    
    if (!quarterlyData[quarterKey]) {
      quarterlyData[quarterKey] = {
        quarter: `Q${quarter} ${dealDate.getFullYear()}`,
        revenue: 0,
        deals: 0,
        customers: new Set()
      };
    }
    
    quarterlyData[quarterKey].revenue += sale.revenue;
    quarterlyData[quarterKey].deals += 1;
    quarterlyData[quarterKey].customers.add(sale.customerName);
  });

  const quarterly = Object.values(quarterlyData).map(q => ({
    quarter: q.quarter,
    revenue: q.revenue,
    deals: q.deals,
    customers: q.customers.size
  })).sort((a, b) => a.quarter.localeCompare(b.quarter));

  // Calculate yearly data
  const yearlyData = {};
  closedSales.forEach(sale => {
    const dealDate = new Date(sale.dealDate);
    const year = dealDate.getFullYear();
    
    if (!yearlyData[year]) {
      yearlyData[year] = {
        year: year.toString(),
        revenue: 0,
        deals: 0,
        customers: new Set()
      };
    }
    
    yearlyData[year].revenue += sale.revenue;
    yearlyData[year].deals += 1;
    yearlyData[year].customers.add(sale.customerName);
  });

  const yearly = Object.values(yearlyData).map(y => ({
    year: y.year,
    revenue: y.revenue,
    deals: y.deals,
    customers: y.customers.size
  })).sort((a, b) => a.year.localeCompare(b.year));

  // Calculate by product (with period breakdowns)
  const byProductData = {};
  const byProductMonthly = {};
  const byProductQuarterly = {};
  const byProductYearly = {};
  
  closedSales.forEach(sale => {
    const productName = sale.productName || 'Unknown';
    const dealDate = new Date(sale.dealDate);
    const monthKey = `${dealDate.getFullYear()}-${dealDate.getMonth()}`;
    const monthLabel = monthNames[dealDate.getMonth()];
    const quarter = Math.floor(dealDate.getMonth() / 3) + 1;
    const quarterKey = `${dealDate.getFullYear()}-Q${quarter}`;
    const year = dealDate.getFullYear();
    
    // Overall product data
    if (!byProductData[productName]) {
      byProductData[productName] = {
        product: productName,
        revenue: 0,
        units: 0
      };
    }
    byProductData[productName].revenue += sale.revenue;
    byProductData[productName].units += 1;
    
    // Monthly breakdown
    if (!byProductMonthly[productName]) {
      byProductMonthly[productName] = {};
    }
    if (!byProductMonthly[productName][monthKey]) {
      byProductMonthly[productName][monthKey] = { month: monthLabel, year: dealDate.getFullYear(), revenue: 0, units: 0 };
    }
    byProductMonthly[productName][monthKey].revenue += sale.revenue;
    byProductMonthly[productName][monthKey].units += 1;
    
    // Quarterly breakdown
    if (!byProductQuarterly[productName]) {
      byProductQuarterly[productName] = {};
    }
    if (!byProductQuarterly[productName][quarterKey]) {
      byProductQuarterly[productName][quarterKey] = { quarter: `Q${quarter} ${dealDate.getFullYear()}`, revenue: 0, units: 0 };
    }
    byProductQuarterly[productName][quarterKey].revenue += sale.revenue;
    byProductQuarterly[productName][quarterKey].units += 1;
    
    // Yearly breakdown
    if (!byProductYearly[productName]) {
      byProductYearly[productName] = {};
    }
    if (!byProductYearly[productName][year]) {
      byProductYearly[productName][year] = { year: year.toString(), revenue: 0, units: 0 };
    }
    byProductYearly[productName][year].revenue += sale.revenue;
    byProductYearly[productName][year].units += 1;
  });

  const totalProductRevenue = Object.values(byProductData).reduce((sum, p) => sum + p.revenue, 0);
  const byProduct = Object.values(byProductData).map(p => ({
    product: p.product,
    revenue: p.revenue,
    units: p.units,
    percentage: totalProductRevenue > 0 ? ((p.revenue / totalProductRevenue) * 100).toFixed(1) : 0,
    monthly: byProductMonthly[p.product] ? Object.values(byProductMonthly[p.product]) : [],
    quarterly: byProductQuarterly[p.product] ? Object.values(byProductQuarterly[p.product]) : [],
    yearly: byProductYearly[p.product] ? Object.values(byProductYearly[p.product]) : []
  }));

  // Calculate by sales rep (with period breakdowns)
  const bySalesRepData = {};
  const bySalesRepMonthly = {};
  const bySalesRepQuarterly = {};
  const bySalesRepYearly = {};
  
  closedSales.forEach(sale => {
    const salesRep = sale.salesRep || 'Unknown';
    const dealDate = new Date(sale.dealDate);
    const monthKey = `${dealDate.getFullYear()}-${dealDate.getMonth()}`;
    const monthLabel = monthNames[dealDate.getMonth()];
    const quarter = Math.floor(dealDate.getMonth() / 3) + 1;
    const quarterKey = `${dealDate.getFullYear()}-Q${quarter}`;
    const year = dealDate.getFullYear();
    
    // Overall rep data
    if (!bySalesRepData[salesRep]) {
      bySalesRepData[salesRep] = {
        name: salesRep,
        revenue: 0,
        deals: 0
      };
    }
    bySalesRepData[salesRep].revenue += sale.revenue;
    bySalesRepData[salesRep].deals += 1;
    
    // Monthly breakdown
    if (!bySalesRepMonthly[salesRep]) {
      bySalesRepMonthly[salesRep] = {};
    }
    if (!bySalesRepMonthly[salesRep][monthKey]) {
      bySalesRepMonthly[salesRep][monthKey] = { month: monthLabel, year: dealDate.getFullYear(), revenue: 0, deals: 0 };
    }
    bySalesRepMonthly[salesRep][monthKey].revenue += sale.revenue;
    bySalesRepMonthly[salesRep][monthKey].deals += 1;
    
    // Quarterly breakdown
    if (!bySalesRepQuarterly[salesRep]) {
      bySalesRepQuarterly[salesRep] = {};
    }
    if (!bySalesRepQuarterly[salesRep][quarterKey]) {
      bySalesRepQuarterly[salesRep][quarterKey] = { quarter: `Q${quarter} ${dealDate.getFullYear()}`, revenue: 0, deals: 0 };
    }
    bySalesRepQuarterly[salesRep][quarterKey].revenue += sale.revenue;
    bySalesRepQuarterly[salesRep][quarterKey].deals += 1;
    
    // Yearly breakdown
    if (!bySalesRepYearly[salesRep]) {
      bySalesRepYearly[salesRep] = {};
    }
    if (!bySalesRepYearly[salesRep][year]) {
      bySalesRepYearly[salesRep][year] = { year: year.toString(), revenue: 0, deals: 0 };
    }
    bySalesRepYearly[salesRep][year].revenue += sale.revenue;
    bySalesRepYearly[salesRep][year].deals += 1;
  });

  const bySalesRep = Object.values(bySalesRepData).map(rep => ({
    name: rep.name,
    revenue: rep.revenue,
    deals: rep.deals,
    commission: (rep.revenue * 0.10).toFixed(0),
    monthly: bySalesRepMonthly[rep.name] ? Object.values(bySalesRepMonthly[rep.name]) : [],
    quarterly: bySalesRepQuarterly[rep.name] ? Object.values(bySalesRepQuarterly[rep.name]) : [],
    yearly: bySalesRepYearly[rep.name] ? Object.values(bySalesRepYearly[rep.name]) : []
  })).sort((a, b) => b.revenue - a.revenue);

  // Calculate by region (placeholder - since we don't have region data in sales)
  const byRegion = [
    { region: 'North America', revenue: 0, deals: 0, percentage: 0 },
    { region: 'Europe', revenue: 0, deals: 0, percentage: 0 },
    { region: 'Asia Pacific', revenue: 0, deals: 0, percentage: 0 },
    { region: 'Other', revenue: 0, deals: 0, percentage: 0 }
  ];

  // Distribute revenue evenly across regions for now (since region data not in sales)
  const totalRegionRevenue = closedSales.reduce((sum, sale) => sum + sale.revenue, 0);
  const totalDeals = closedSales.length;
  const regionCount = byRegion.length;
  
  if (totalRegionRevenue > 0) {
    byRegion.forEach(region => {
      region.revenue = totalRegionRevenue / regionCount;
      region.deals = Math.floor(totalDeals / regionCount);
      region.percentage = (100 / regionCount).toFixed(1);
    });
  }

  return {
    monthly,
    quarterly,
    yearly,
    byProduct,
    byRegion,
    bySalesRep
  };
};

// Simple test endpoint (no auth required)
router.get('/test', (req, res) => {
  console.log('Sales test endpoint called');
  res.json({ message: 'Sales reports route is working!' });
});

// Get comprehensive sales reports
router.get('/reports', auth, async (req, res) => {
  try {
    const salesData = calculateSalesReports();
    res.json(salesData);
  } catch (error) {
    console.error('Error fetching sales reports:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get sales summary for dashboard
router.get('/summary', auth, async (req, res) => {
  try {
    const salesData = calculateSalesReports();
    const currentMonth = salesData.monthly[salesData.monthly.length - 1] || { revenue: 0, deals: 0, customers: 0 };
    const totalRevenue = salesData.monthly.reduce((sum, item) => sum + item.revenue, 0);
    const totalDeals = salesData.monthly.reduce((sum, item) => sum + item.deals, 0);
    const totalCustomers = salesData.monthly.reduce((sum, item) => sum + item.customers, 0);
    
    const summary = {
      currentMonthRevenue: currentMonth.revenue,
      currentMonthDeals: currentMonth.deals,
      currentMonthCustomers: currentMonth.customers,
      totalRevenue,
      totalDeals,
      totalCustomers,
      averageDealSize: totalDeals > 0 ? totalRevenue / totalDeals : 0,
      growthRate: 0 // Calculate actual growth if needed
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching sales summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get top performing sales reps
router.get('/top-reps', auth, async (req, res) => {
  try {
    const salesData = calculateSalesReports();
    const topReps = salesData.bySalesRep.slice(0, 5);
    res.json(topReps);
  } catch (error) {
    console.error('Error fetching top reps:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get sales performance by period
router.get('/performance/:period', auth, async (req, res) => {
  try {
    const { period } = req.params;
    const salesData = calculateSalesReports();
    let data;
    
    switch (period) {
      case 'monthly':
        data = salesData.monthly;
        break;
      case 'quarterly':
        data = salesData.quarterly;
        break;
      case 'yearly':
        data = salesData.yearly;
        break;
      default:
        return res.status(400).json({ error: 'Invalid period. Use monthly, quarterly, or yearly' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching performance data:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
