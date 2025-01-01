import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PortfolioGrowthCalculator = () => {
  // State for user inputs
  const [targetAmount, setTargetAmount] = useState(75000);
  const [targetAge, setTargetAge] = useState(17);
  const [showResults, setShowResults] = useState(false);
  const [allocationError, setAllocationError] = useState('');
  
  // New state for children
  const [children, setChildren] = useState([
    { id: 1, age: 5 }
  ]);

  // State for scenario percentages
  const [scenarioPercentages, setScenarioPercentages] = useState({
    conservative: 25,
    optimistic: 10
  });

  // Available portfolios from Disclosure Booklet
  const availablePortfolios = {
    aggressive_growth: { name: "Aggressive Growth Portfolio", return: 0.1536 },
    aggressive: { name: "Aggressive Portfolio", return: 0.1414 },
    growth: { name: "Growth Portfolio", return: 0.1293 },
    moderate_growth: { name: "Moderate Growth Portfolio", return: 0.1035 },
    conservative_growth: { name: "Conservative Growth Portfolio", return: 0.0764 },
    income: { name: "Income Portfolio", return: 0.0395 },
    developed_markets: { name: "Developed Markets Index Portfolio", return: 0.0908 },
    growth_stock: { name: "Growth Stock Index Portfolio", return: 0.2520 },
    mid_cap: { name: "Mid-Cap Stock Index Portfolio", return: 0.1640 },
    small_cap: { name: "Small-Cap Stock Index Portfolio", return: 0.1465 },
    value_stock: { name: "Value Stock Index Portfolio", return: 0.1276 },
    bond_market: { name: "Bond Market Index Portfolio", return: 0.0529 },
    inflation_protected: { name: "Inflation-Protected Securities Portfolio", return: 0.0639 }
  };

  // State for selected portfolios
  const [selectedPortfolios, setSelectedPortfolios] = useState([
    { portfolio: 'growth', allocation: 75 },
    { portfolio: 'conservative_growth', allocation: 15 },
    { portfolio: 'small_cap', allocation: 10 }
  ]);

  // Calculate blended return based on selected portfolios
  const calculateBlendedReturn = () => {
    return selectedPortfolios.reduce((acc, p) => {
      return acc + (availablePortfolios[p.portfolio]?.return || 0) * (p.allocation / 100);
    }, 0);
  };

  // Calculate different return scenarios
  const calculateScenarioReturn = (baseReturn, isConservative) => {
    const modifier = isConservative ? 
      1 - (scenarioPercentages.conservative / 100) : 
      1 + (scenarioPercentages.optimistic / 100);
    return baseReturn * modifier;
  };

  // Handle adding/removing children
  const addChild = () => {
    setChildren([...children, { 
      id: children.length + 1, 
      age: 0 
    }]);
  };

  const removeChild = (id) => {
    if (children.length > 1) {
      setChildren(children.filter(child => child.id !== id));
    }
  };

  const updateChildAge = (id, age) => {
    setChildren(children.map(child => 
      child.id === id ? { ...child, age } : child
    ));
  };

  // Handle portfolio changes
  const addPortfolio = () => {
    setSelectedPortfolios([...selectedPortfolios, { portfolio: '', allocation: 0 }]);
  };

  const removePortfolio = (index) => {
    if (selectedPortfolios.length > 1) {
      setSelectedPortfolios(selectedPortfolios.filter((_, i) => i !== index));
    }
  };

  const updatePortfolio = (index, field, value) => {
    setSelectedPortfolios(selectedPortfolios.map((p, i) => 
      i === index ? { ...p, [field]: field === 'allocation' ? Number(value) : value } : p
    ));
  };

  // Calculate monthly investment required
  const calculateMonthlyInvestment = (amount, years, rate) => {
    const months = years * 12;
    const monthlyRate = rate / 12;
    return amount * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
  };

  // Calculate growth data for visualization
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

  // Calculate investment data for all children
  const calculateChildInvestments = () => {
    const baseBlendedReturn = calculateBlendedReturn();
    const conservativeBlendedReturn = calculateScenarioReturn(baseBlendedReturn, true);
    const optimisticBlendedReturn = calculateScenarioReturn(baseBlendedReturn, false);

    return children.reduce((acc, child) => {
      const years = targetAge - child.age;
      const baseMonthly = calculateMonthlyInvestment(targetAmount, years, baseBlendedReturn);

      acc[child.id] = {
        age: child.age,
        years,
        baseCase: {
          monthly: baseMonthly,
          data: calculateGrowth(baseMonthly, years, baseBlendedReturn)
        },
        conservative: {
          monthly: baseMonthly,
          data: calculateGrowth(baseMonthly, years, conservativeBlendedReturn)
        },
        optimistic: {
          monthly: baseMonthly,
          data: calculateGrowth(baseMonthly, years, optimisticBlendedReturn)
        }
      };
      return acc;
    }, {});
  };

  useEffect(() => {
    const total = selectedPortfolios.reduce((sum, p) => sum + p.allocation, 0);
    if (total !== 100) {
      setAllocationError('Portfolio allocations must sum to 100%');
    } else {
      setAllocationError('');
    }
  }, [selectedPortfolios]);

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
          {/* Return Rate Summary */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-gray-500 text-sm mb-1">Base Return Rate</h3>
              <p className="text-2xl font-semibold">{(calculateBlendedReturn() * 100).toFixed(2)}%</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-gray-500 text-sm mb-1">Conservative Return Rate</h3>
              <p className="text-2xl font-semibold">
                {(calculateScenarioReturn(calculateBlendedReturn(), true) * 100).toFixed(2)}%
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-gray-500 text-sm mb-1">Optimistic Return Rate</h3>
              <p className="text-2xl font-semibold">
                {(calculateScenarioReturn(calculateBlendedReturn(), false) * 100).toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Charts and Summaries for Each Child */}
          <div className="space-y-12">
            {children.map(child => (
              <div key={child.id} className="space-y-8">
                {/* Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h2 className="text-xl font-semibold mb-6 text-gray-800">
                    Child {child.id} (Age {child.age}) Portfolio Projections
                  </h2>
                  <div className="h-96">
                    <ResponsiveContainer>
                      <BarChart data={[
                        ...investmentData[child.id].baseCase.data.map(d => ({
                          year: d.year,
                          'Base Case': d.balance,
                          'Conservative': investmentData[child.id].conservative.data[d.year].balance,
                          'Optimistic': investmentData[child.id].optimistic.data[d.year].balance
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

                {/* Summary Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Child {child.id} (Age {child.age}) Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Investment Period</span>
                      <span className="font-medium">{investmentData[child.id].years} years</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Monthly Investment</span>
                      <span className="font-medium">
                        {formatCurrency(investmentData[child.id].baseCase.monthly)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Base Case Final</span>
                      <span className="font-medium text-emerald-600">
                        {formatCurrency(investmentData[child.id].baseCase.data[investmentData[child.id].years].balance)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Conservative Final</span>
                      <span className="font-medium text-red-500">
                        {formatCurrency(investmentData[child.id].conservative.data[investmentData[child.id].years].balance)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Optimistic Final</span>
                      <span className="font-medium text-blue-500">
                        {formatCurrency(investmentData[child.id].optimistic.data[investmentData[child.id].years].balance)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Portfolio Allocation Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Portfolio Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Selected Portfolios</h4>
                <div className="space-y-2">
                  {selectedPortfolios.map((portfolio, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600">
                        {availablePortfolios[portfolio.portfolio]?.name}
                      </span>
                      <span className="font-medium">{portfolio.allocation}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Scenario Settings</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Conservative Adjustment</span>
                    <span className="font-medium">{scenarioPercentages.conservative}% lower</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Optimistic Adjustment</span>
                    <span className="font-medium">{scenarioPercentages.optimistic}% higher</span>
                  </div>
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