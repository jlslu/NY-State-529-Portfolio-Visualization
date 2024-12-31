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
    <div className="max-w-7xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Target Amount ($)
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                min="1000"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Target Age
              <input
                type="number"
                value={targetAge}
                onChange={(e) => setTargetAge(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                min="10"
                max="25"
              />
            </label>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Portfolio Allocation (%)</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Growth Portfolio
                <input
                  type="number"
                  value={allocation.growth}
                  onChange={(e) => handleAllocationChange('growth', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                  min="0"
                  max="100"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Conservative Growth
                <input
                  type="number"
                  value={allocation.conservative_growth}
                  onChange={(e) => handleAllocationChange('conservative_growth', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                  min="0"
                  max="100"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Small Cap
                <input
                  type="number"
                  value={allocation.small_cap}
                  onChange={(e) => handleAllocationChange('small_cap', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                  min="0"
                  max="100"
                />
              </label>
            </div>
          </div>
          {allocationError && (
            <p className="text-red-500 mt-2">{allocationError}</p>
          )}
        </div>

        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={!!allocationError}
        >
          Calculate
        </button>
      </form>

      {showResults && (
        <div className="space-y-8">
          {/* Child 1 Charts */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Child 1 (Age 5) Portfolio Projections</h2>
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
                  <Bar dataKey="Base Case" fill="#82ca9d" />
                  <Bar dataKey="Conservative" fill="#ff9999" />
                  <Bar dataKey="Optimistic" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Child 2 Charts */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Child 2 (Age 3) Portfolio Projections</h2>
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
                  <Bar dataKey="Base Case" fill="#82ca9d" />
                  <Bar dataKey="Conservative" fill="#ff9999" />
                  <Bar dataKey="Optimistic" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Investment Summary */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Investment Summary</h2>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">Child 1 (Age 5)</h3>
                <ul className="space-y-2">
                  <li>Investment Period: {investmentData.child1.years} years</li>
                  <li>Required Monthly Investment: {formatCurrency(investmentData.child1.baseCase.monthly)}</li>
                  <li>Final Balance (Base Case): {formatCurrency(investmentData.child1.baseCase.data[investmentData.child1.years].balance)}</li>
                  <li>Final Balance (Conservative): {formatCurrency(investmentData.child1.conservative.data[investmentData.child1.years].balance)}</li>
                  <li>Final Balance (Optimistic): {formatCurrency(investmentData.child1.optimistic.data[investmentData.child1.years].balance)}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Child 2 (Age 3)</h3>
                <ul className="space-y-2">
                  <li>Investment Period: {investmentData.child2.years} years</li>
                  <li>Required Monthly Investment: {formatCurrency(investmentData.child2.baseCase.monthly)}</li>
                  <li>Final Balance (Base Case): {formatCurrency(investmentData.child2.baseCase.data[investmentData.child2.years].balance)}</li>
                  <li>Final Balance (Conservative): {formatCurrency(investmentData.child2.conservative.data[investmentData.child2.years].balance)}</li>
                  <li>Final Balance (Optimistic): {formatCurrency(investmentData.child2.optimistic.data[investmentData.child2.years].balance)}</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded">
              <h3 className="text-lg font-semibold mb-2">Portfolio Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Allocation</h4>
                  <ul>
                    <li>Growth Portfolio: {allocation.growth}%</li>
                    <li>Conservative Growth: {allocation.conservative_growth}%</li>
                    <li>Small Cap: {allocation.small_cap}%</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Return Scenarios</h4>
                  <ul>
                    <li>Base Case Return: {(baseBlendedReturn * 100).toFixed(2)}%</li>
                    <li>Conservative Case Return: {(conservativeBlendedReturn * 100).toFixed(2)}%</li>
                    <li>Optimistic Case Return: {(optimisticBlendedReturn * 100).toFixed(2)}%</li>
                  </ul>
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