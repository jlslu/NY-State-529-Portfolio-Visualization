import React, { useState, useEffect } from 'react' ;
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PortfolioGrowthCalculator = () => {
  // Allow the user to choose
  const [targetAmount, setTargetAmount] = useState(75000);
  const [targetAge, setTargetAge] = useState(17);
  const [showResults, setShowResults] = useState(false);
  const [allocation, setAllocation] = useState({
    growth: 75,
    conservative_growth: 15,
    small_cap: 10
  });
  const [allocationError, setAllocationError] = useState('');

  // Base portfolio returns
  const basePortfolioReturns = {
    growth: 0.1293,
    conservative_growth: 0.0764,
    small_cap: 0.1465
  };

  // Validate total allocation equals 100%
  useEffect(() => {
    const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
    if (total !== 100) {
      setAllocationError('Portfolio allocations must sum to 100%');
    } else {
      setAllocationError('');
    }
  }, [allocation]);

  // Handle allocation change
  const handleAllocationChange = (portfolio, value) => {
    setAllocation(prev => ({
      ...prev,
      [portfolio]: Number(value)
    }));
  };

  // Calculate different return scenarios
  const calculateScenarioReturn = (baseReturn, modifier) => {
    return Object.keys(basePortfolioReturns).reduce((acc, portfolio) => {
      return acc + (basePortfolioReturns[portfolio] * modifier) * (allocation[portfolio] / 100);
    }, 0);
  };

  const baseBlendedReturn = calculateScenarioReturn(basePortfolioReturns, 1);
  const conservativeBlendedReturn = calculateScenarioReturn(basePortfolioReturns, 0.75);
  const optimisticBlendedReturn = calculateScenarioReturn(basePortfolioReturns, 1.10);

  // Calculate monthly investment required
  const calculateMonthlyInvestment = (amount, years, rate) => {
    const months = years * 12;
    const monthlyRate = rate / 12;
    return amount * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
  };

  // Calculate growth data for visualization using base monthly payment
  const calculateGrowth = (monthlyInvestment, years, blendedReturn) => {
    const data = [];
    let balance = 0;
    const monthlyRate = blendedReturn / 12;

    for (let year = 0; year <= years; year++) {
      if (year === 0) {
        data.push({ year, balance: 0 });
        continue;
      }

      const monthsInvested = year * 12;
      balance = monthlyInvestment * ((Math.pow(1 + monthlyRate, monthsInvested) - 1) / monthlyRate);
      
      data.push({
        year,
        balance: Math.round(balance)
      });
    }
    return data;
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calculate investment data for both children
  const calculateChildInvestments = () => {
    const child1Years = targetAge - 5;
    const child2Years = targetAge - 3;

    // Calculate base monthly payments
    const baseMonthly1 = calculateMonthlyInvestment(targetAmount, child1Years, baseBlendedReturn);
    const baseMonthly2 = calculateMonthlyInvestment(targetAmount, child2Years, baseBlendedReturn);
    
    return {
      child1: {
        years: child1Years,
        baseCase: {
          monthly: baseMonthly1,
          data: calculateGrowth(baseMonthly1, child1Years, baseBlendedReturn)
        },
        conservative: {
          monthly: baseMonthly1, // Using base monthly payment
          data: calculateGrowth(baseMonthly1, child1Years, conservativeBlendedReturn)
        },
        optimistic: {
          monthly: baseMonthly1, // Using base monthly payment
          data: calculateGrowth(baseMonthly1, child1Years, optimisticBlendedReturn)
        }
      },
      child2: {
        years: child2Years,
        baseCase: {
          monthly: baseMonthly2,
          data: calculateGrowth(baseMonthly2, child2Years, baseBlendedReturn)
        },
        conservative: {
          monthly: baseMonthly2, // Using base monthly payment
          data: calculateGrowth(baseMonthly2, child2Years, conservativeBlendedReturn)
        },
        optimistic: {
          monthly: baseMonthly2, // Using base monthly payment
          data: calculateGrowth(baseMonthly2, child2Years, optimisticBlendedReturn)
        }
      }
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!allocationError) {
      setShowResults(true);
    }
  };

  const investmentData = calculateChildInvestments();

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-xl shadow-sm">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Target Amount ($)
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                className="mt-2 block w-full rounded-lg border-gray-200 border p-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                min="1000"
              />
            </label>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Target Age
              <input
                type="number"
                value={targetAge}
                onChange={(e) => setTargetAge(Number(e.target.value))}
                className="mt-2 block w-full rounded-lg border-gray-200 border p-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                min="10"
                max="25"
              />
            </label>
          </div>
        </div>
  
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 text-gray-700">Portfolio Allocation (%)</h3>
          <div className="grid grid-cols-3 gap-6">
            {Object.entries(allocation).map(([key, value]) => (
              <div key={key} className="bg-white p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleAllocationChange(key, e.target.value)}
                    className="mt-2 block w-full rounded-lg border-gray-200 border p-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                    min="0"
                    max="100"
                  />
                </label>
              </div>
            ))}
          </div>
          {allocationError && (
            <p className="text-red-500 mt-4 text-sm">{allocationError}</p>
          )}
        </div>
  
        <button
          type="submit"
          disabled={!!allocationError}
          className="w-full bg-blue-500 text-white p-4 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Calculate
        </button>
      </form>
  
      {showResults && (
        <div className="space-y-8">
          {/* Results Grid */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-gray-500 text-sm mb-1">Base Return Rate</h3>
              <p className="text-2xl font-semibold">{(baseBlendedReturn * 100).toFixed(2)}%</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-gray-500 text-sm mb-1">Conservative Return Rate</h3>
              <p className="text-2xl font-semibold">{(conservativeBlendedReturn * 100).toFixed(2)}%</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-gray-500 text-sm mb-1">Optimistic Return Rate</h3>
              <p className="text-2xl font-semibold">{(optimisticBlendedReturn * 100).toFixed(2)}%</p>
            </div>
          </div>
  
          {/* Charts */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Child 1 (Age 5) Portfolio Projections</h2>
              <div className="h-96">
                <ResponsiveContainer>
                  <BarChart data={[
                    ...investmentData.child1.baseCase.data.map(d => ({
                      year: d.year,
                      'Base Case': d.balance,
                      'Conservative': investmentData.child1.conservative.data[d.year].balance,
                      'Optimistic': investmentData.child1.optimistic.data[d.year].balance
                    }))
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="Base Case" fill="#4ade80" />
                    <Bar dataKey="Conservative" fill="#fb7185" />
                    <Bar dataKey="Optimistic" fill="#60a5fa" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
  
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Child 2 (Age 3) Portfolio Projections</h2>
              <div className="h-96">
                <ResponsiveContainer>
                  <BarChart data={[
                    ...investmentData.child2.baseCase.data.map(d => ({
                      year: d.year,
                      'Base Case': d.balance,
                      'Conservative': investmentData.child2.conservative.data[d.year].balance,
                      'Optimistic': investmentData.child2.optimistic.data[d.year].balance
                    }))
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="Base Case" fill="#4ade80" />
                    <Bar dataKey="Conservative" fill="#fb7185" />
                    <Bar dataKey="Optimistic" fill="#60a5fa" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
  
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Child 1 (Age 5) Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Investment Period</span>
                  <span className="font-medium">{investmentData.child1.years} years</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Monthly Investment</span>
                  <span className="font-medium">{formatCurrency(investmentData.child1.baseCase.monthly)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Base Case Final</span>
                  <span className="font-medium text-emerald-600">{formatCurrency(investmentData.child1.baseCase.data[investmentData.child1.years].balance)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Conservative Final</span>
                  <span className="font-medium text-red-500">{formatCurrency(investmentData.child1.conservative.data[investmentData.child1.years].balance)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Optimistic Final</span>
                  <span className="font-medium text-blue-500">{formatCurrency(investmentData.child1.optimistic.data[investmentData.child1.years].balance)}</span>
                </div>
              </div>
            </div>
  
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Child 2 (Age 3) Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Investment Period</span>
                  <span className="font-medium">{investmentData.child2.years} years</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Monthly Investment</span>
                  <span className="font-medium">{formatCurrency(investmentData.child2.baseCase.monthly)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Base Case Final</span>
                  <span className="font-medium text-emerald-600">{formatCurrency(investmentData.child2.baseCase.data[investmentData.child2.years].balance)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Conservative Final</span>
                  <span className="font-medium text-red-500">{formatCurrency(investmentData.child2.conservative.data[investmentData.child2.years].balance)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Optimistic Final</span>
                  <span className="font-medium text-blue-500">{formatCurrency(investmentData.child2.optimistic.data[investmentData.child2.years].balance)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PortfolioGrowthCalculator;