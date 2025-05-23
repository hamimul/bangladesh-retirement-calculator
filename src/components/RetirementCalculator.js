import React, { useState, useEffect } from 'react';
import './RetirementCalculator.css';

const RetirementCalculator = () => {
  // Initial values from user input
  const [currentAge, setCurrentAge] = useState(30);
  const [currentSalary, setCurrentSalary] = useState(312000);
  const [currentExpenses, setCurrentExpenses] = useState(240000);
  const [salaryGrowthRate, setSalaryGrowthRate] = useState(6);
  const [expenseInflationRate, setExpenseInflationRate] = useState(7);
  const [investmentReturnRate, setInvestmentReturnRate] = useState(7);
  const [investmentStepUpRate, setInvestmentStepUpRate] = useState(10);
  const [targetAge, setTargetAge] = useState(85);
  const [savingsRate, setSavingsRate] = useState(
    Math.round(((currentSalary - currentExpenses) / currentSalary) * 100)
  );
  const [manualRetirementAge, setManualRetirementAge] = useState(null);
  const [showDepletion, setShowDepletion] = useState(true);
  
  // New inputs for corpus calculation
  const [desiredRetirementAge, setDesiredRetirementAge] = useState(55);
  const [withdrawalRate, setWithdrawalRate] = useState(4); // Safe withdrawal rate
  
  // Calculated results
  const [retirementAge, setRetirementAge] = useState(null);
  const [retirementData, setRetirementData] = useState([]);
  const [safeRetirementAge, setSafeRetirementAge] = useState(null);
  const [corpusResults, setCorpusResults] = useState(null);
  
  // Update savings rate when salary or expenses change
  useEffect(() => {
    const newSavingsRate = Math.round(
      ((currentSalary - currentExpenses) / currentSalary) * 100
    );
    setSavingsRate(newSavingsRate);
  }, [currentSalary, currentExpenses]);

  const calculateRetirement = (customRetirementAge = null) => {
    let age = currentAge;
    let salary = currentSalary;
    let expenses = currentExpenses;
    let investments = 0;
    let annualContribution = salary - expenses;
    let data = [];
    let retirementYearData = null;
    let forcedRetirement = customRetirementAge !== null;
    
    while (true) {
      const baseSavings = salary - expenses;
      const totalContribution = Math.min(annualContribution, salary);
      
      investments = investments * (1 + investmentReturnRate / 100) + totalContribution;
      
      data.push({
        age,
        salary: Math.round(salary),
        expenses: Math.round(expenses),
        savings: Math.round(baseSavings),
        additionalInvestment: Math.round(Math.max(0, totalContribution - baseSavings)),
        totalContribution: Math.round(totalContribution),
        investments: Math.round(investments),
        passiveIncome: Math.round(investments * (investmentReturnRate / 100))
      });
      
      salary = salary * (1 + salaryGrowthRate / 100);
      expenses = expenses * (1 + expenseInflationRate / 100);
      annualContribution = annualContribution * (1 + investmentStepUpRate / 100);
      
      age++;
      
      if (
        (forcedRetirement && age > customRetirementAge) || 
        (!forcedRetirement && investments * (investmentReturnRate / 100) >= expenses)
      ) {
        break;
      }
      
      if (age > 150) break;
    }
    
    retirementYearData = data[data.length - 1];
    
    // Add post-retirement data
    let postRetirementInvestments = retirementYearData.investments;
    let postRetirementExpenses = retirementYearData.expenses;
    let postRetirementAge = retirementYearData.age;
    let portfolioDepleted = false;
    let depletionAge = null;
    
    while (postRetirementAge < targetAge) {
      postRetirementAge++;
      
      const passiveIncome = postRetirementInvestments * (investmentReturnRate / 100);
      postRetirementInvestments = postRetirementInvestments * (1 + investmentReturnRate / 100) - postRetirementExpenses;
      
      if (postRetirementInvestments <= 0 && !portfolioDepleted) {
        portfolioDepleted = true;
        depletionAge = postRetirementAge;
        postRetirementInvestments = 0;
      }
      
      postRetirementExpenses = postRetirementExpenses * (1 + expenseInflationRate / 100);
      
      data.push({
        age: postRetirementAge,
        salary: 0,
        expenses: Math.round(postRetirementExpenses),
        savings: 0,
        additionalInvestment: 0,
        totalContribution: 0,
        investments: Math.round(postRetirementInvestments),
        passiveIncome: Math.round(passiveIncome),
        isRetired: true,
        isDepleted: portfolioDepleted
      });
    }
    
    setRetirementAge(retirementYearData.age);
    setRetirementData(data);
    
    return {
      retirementAge: retirementYearData.age,
      portfolioDepleted,
      depletionAge
    };
  };
  
  const calculateSafeRetirementAge = () => {
    const initialResult = calculateRetirement();
    
    if (!initialResult.portfolioDepleted) {
      setSafeRetirementAge(initialResult.retirementAge);
      setShowDepletion(false);
      return;
    }
    
    let testAge = initialResult.retirementAge + 1;
    let result;
    
    do {
      result = calculateRetirement(testAge);
      testAge++;
      
      if (testAge > 100) break;
    } while (result.portfolioDepleted);
    
    setSafeRetirementAge(result.retirementAge);
    setShowDepletion(false);
  };

  const calculateRequiredInvestment = () => {
    // Calculate expenses at retirement age
    const yearsToRetirement = desiredRetirementAge - currentAge;
    const expensesAtRetirement = currentExpenses * Math.pow(1 + expenseInflationRate / 100, yearsToRetirement);
    
    // Calculate required corpus using withdrawal rate
    const requiredCorpus = expensesAtRetirement * (100 / withdrawalRate);
    
    // Calculate required monthly investment using future value formula
    const monthlyRate = investmentReturnRate / 100 / 12;
    const monthsToRetirement = yearsToRetirement * 12;
    
    // Account for step-up rate
    let requiredMonthlyInvestment;
    if (investmentStepUpRate > 0) {
      // Complex calculation with step-up
      const avgGrowthFactor = Math.pow(1 + investmentStepUpRate / 100, yearsToRetirement / 2);
      const futureValueFactor = (Math.pow(1 + monthlyRate, monthsToRetirement) - 1) / monthlyRate;
      requiredMonthlyInvestment = requiredCorpus / (futureValueFactor * avgGrowthFactor);
    } else {
      // Simple calculation without step-up
      const futureValueFactor = (Math.pow(1 + monthlyRate, monthsToRetirement) - 1) / monthlyRate;
      requiredMonthlyInvestment = requiredCorpus / futureValueFactor;
    }
    
    // Calculate what corpus current savings will generate
    const currentMonthlySavings = (currentSalary - currentExpenses) / 12;
    let projectedCorpus = 0;
    let monthlyContribution = currentMonthlySavings;
    
    for (let month = 0; month < monthsToRetirement; month++) {
      projectedCorpus = projectedCorpus * (1 + monthlyRate) + monthlyContribution;
      
      // Apply step-up annually
      if ((month + 1) % 12 === 0) {
        monthlyContribution = monthlyContribution * (1 + investmentStepUpRate / 100);
      }
    }
    
    setCorpusResults({
      yearsToRetirement,
      expensesAtRetirement: Math.round(expensesAtRetirement),
      requiredCorpus: Math.round(requiredCorpus),
      requiredMonthlyInvestment: Math.round(requiredMonthlyInvestment),
      requiredAnnualInvestment: Math.round(requiredMonthlyInvestment * 12),
      currentMonthlySavings: Math.round(currentMonthlySavings),
      currentAnnualSavings: Math.round(currentMonthlySavings * 12),
      projectedCorpus: Math.round(projectedCorpus),
      shortfall: Math.round(requiredCorpus - projectedCorpus),
      additionalMonthlyNeeded: Math.round(Math.max(0, requiredMonthlyInvestment - currentMonthlySavings))
    });
  };

  return (
    <div className="calculator-container">
      <h1 className="calculator-title">Bangladesh Retirement Calculator with Corpus Planning</h1>
      
      <div className="calculator-grid">
        <div className="input-section">
          <h2 className="section-title">Your Financial Inputs</h2>
          
          <div className="input-group">
            <label>Current Age</label>
            <input
              type="number"
              value={currentAge}
              onChange={(e) => setCurrentAge(Number(e.target.value))}
            />
          </div>
          
          <div className="input-group">
            <label>Current Annual Salary (৳)</label>
            <input
              type="number"
              value={currentSalary}
              onChange={(e) => setCurrentSalary(Number(e.target.value))}
            />
          </div>
          
          <div className="input-group">
            <label>Current Annual Expenses (৳)</label>
            <input
              type="number"
              value={currentExpenses}
              onChange={(e) => setCurrentExpenses(Number(e.target.value))}
            />
          </div>
          
          <div className="input-group">
            <label>Salary Growth Rate (%)</label>
            <input
              type="number"
              value={salaryGrowthRate}
              onChange={(e) => setSalaryGrowthRate(Number(e.target.value))}
            />
          </div>
          
          <div className="input-group">
            <label>Expense Inflation Rate (%)</label>
            <input
              type="number"
              value={expenseInflationRate}
              onChange={(e) => setExpenseInflationRate(Number(e.target.value))}
            />
          </div>
          
          <div className="input-group">
            <label>Investment Return Rate (%)</label>
            <input
              type="number"
              value={investmentReturnRate}
              onChange={(e) => setInvestmentReturnRate(Number(e.target.value))}
            />
            <p className="helper-text">Conservative: 6-8%, Moderate: 8-10%, Aggressive: 10-12%</p>
          </div>
          
          <div className="input-group">
            <label>Annual Investment Step-Up Rate (%)</label>
            <input
              type="number"
              value={investmentStepUpRate}
              onChange={(e) => setInvestmentStepUpRate(Number(e.target.value))}
            />
          </div>
          
          <div className="input-group">
            <label>Current Savings Rate (%)</label>
            <div className="savings-rate">{savingsRate}%</div>
          </div>
          
          <div style={{marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb'}}>
            <h3 style={{fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem'}}>Corpus Calculator</h3>
            
            <div className="input-group">
              <label>Desired Retirement Age</label>
              <input
                type="number"
                value={desiredRetirementAge}
                onChange={(e) => setDesiredRetirementAge(Number(e.target.value))}
              />
            </div>
            
            <div className="input-group">
              <label>Safe Withdrawal Rate (%)</label>
              <input
                type="number"
                value={withdrawalRate}
                onChange={(e) => setWithdrawalRate(Number(e.target.value))}
              />
              <p className="helper-text">Typically 3-4% for safe withdrawal</p>
            </div>
            
            <button
              onClick={calculateRequiredInvestment}
              className="safe-age-button"
              style={{width: '100%', marginTop: '0.5rem'}}
            >
              Calculate Required Investment
            </button>
          </div>
          
          <div className="button-group" style={{marginTop: '1rem'}}>
            <button
              onClick={() => {
                setShowDepletion(true);
                calculateRetirement(manualRetirementAge);
              }}
              className="depletion-button"
            >
              Show Projection
            </button>
            
            <button
              onClick={calculateSafeRetirementAge}
              className="safe-age-button"
            >
              Find Safe Age
            </button>
          </div>
        </div>
        
        <div className="results-section">
          <h2 className="section-title">Results</h2>
          
          {corpusResults && (
            <div className="projection-container" style={{backgroundColor: '#eff6ff', marginBottom: '1.5rem'}}>
              <h3 className="projection-title" style={{color: '#1e40af'}}>Retirement Corpus Analysis</h3>
              
              <div className="analysis-container">
                <div className="analysis-item">
                  <span className="item-label">Years to Retirement:</span> {corpusResults.yearsToRetirement} years
                </div>
                
                <div className="analysis-item">
                  <span className="item-label">Annual Expenses at Retirement:</span> ৳{corpusResults.expensesAtRetirement.toLocaleString()}
                </div>
                
                <div className="analysis-item" style={{fontSize: '1.125rem', fontWeight: '700', color: '#1e40af'}}>
                  <span>Required Retirement Corpus:</span> ৳{corpusResults.requiredCorpus.toLocaleString()}
                </div>
                
                <hr style={{margin: '0.5rem 0'}} />
                
                <div style={{backgroundColor: '#fff', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #e5e7eb', marginBottom: '0.5rem'}}>
                  <h4 style={{fontWeight: '700', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#374151'}}>💰 Monthly Investment Comparison</h4>
                  <div className="analysis-item">
                    <span className="item-label">Required Monthly Investment:</span>
                    <span style={{fontWeight: '700', color: '#059669', fontSize: '1.125rem'}}> ৳{corpusResults.requiredMonthlyInvestment.toLocaleString()}</span>
                  </div>
                  
                  <div className="analysis-item">
                    <span className="item-label">Current Monthly Savings:</span>
                    <span style={{
                      fontWeight: '700',
                      fontSize: '1.125rem',
                      color: corpusResults.currentMonthlySavings >= corpusResults.requiredMonthlyInvestment ? '#059669' : '#dc2626'
                    }}>
                      ৳{corpusResults.currentMonthlySavings.toLocaleString()}
                    </span>
                  </div>
                  
                  {corpusResults.additionalMonthlyNeeded > 0 ? (
                    <div className="depletion-alert" style={{marginTop: '0.5rem', padding: '0.5rem'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#b91c1c'}}>
                        <span style={{fontWeight: '500'}}>⚠️ Additional Monthly Needed:</span>
                        <span style={{fontWeight: '700', fontSize: '1.125rem'}}>৳{corpusResults.additionalMonthlyNeeded.toLocaleString()}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="success-alert" style={{marginTop: '0.5rem', padding: '0.5rem'}}>
                      <p style={{color: '#047857', fontWeight: '500', fontSize: '0.875rem'}}>✅ You're saving enough to meet your retirement goal!</p>
                    </div>
                  )}
                </div>
                
                <div style={{backgroundColor: '#fff', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #e5e7eb'}}>
                  <h4 style={{fontWeight: '700', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#374151'}}>📊 Corpus Projection Analysis</h4>
                  <div className="analysis-item">
                    <span className="item-label">Projected Corpus (Current Path):</span>
                    <span style={{
                      fontWeight: '700',
                      fontSize: '1.125rem',
                      color: corpusResults.projectedCorpus >= corpusResults.requiredCorpus ? '#059669' : '#dc2626'
                    }}>
                      ৳{corpusResults.projectedCorpus.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="analysis-item">
                    <span className="item-label">Required Corpus:</span>
                    <span style={{fontWeight: '700', fontSize: '1.125rem'}}> ৳{corpusResults.requiredCorpus.toLocaleString()}</span>
                  </div>
                  
                  {corpusResults.shortfall > 0 ? (
                    <div className="depletion-alert" style={{marginTop: '0.5rem', padding: '0.5rem'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#b91c1c'}}>
                        <span style={{fontWeight: '500'}}>📉 Corpus Shortfall:</span>
                        <span style={{fontWeight: '700', fontSize: '1.125rem'}}>৳{corpusResults.shortfall.toLocaleString()}</span>
                      </div>
                      <p style={{fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem'}}>
                        At current savings rate, you'll be {Math.round((corpusResults.shortfall / corpusResults.requiredCorpus) * 100)}% short of your retirement goal
                      </p>
                    </div>
                  ) : (
                    <div className="success-alert" style={{marginTop: '0.5rem', padding: '0.5rem'}}>
                      <p style={{color: '#047857', fontWeight: '500', fontSize: '0.875rem'}}>
                        ✅ Surplus: ৳{Math.abs(corpusResults.shortfall).toLocaleString()}
                      </p>
                      <p style={{fontSize: '0.75rem', color: '#059669', marginTop: '0.25rem'}}>
                        You'll exceed your retirement goal by {Math.round((Math.abs(corpusResults.shortfall) / corpusResults.requiredCorpus) * 100)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {retirementAge ? (
            <div>
              <div className="projection-container">
                <h3 className="projection-title">Retirement Projection</h3>
                
                {showDepletion ? (
                  <div>
                    <p className="retirement-age">
                      You can retire at age {retirementAge}
                    </p>
                    
                    {retirementData.some(d => d.isDepleted) ? (
                      <div className="depletion-alert">
                        <p className="alert-text">
                          ❌ Portfolio depleted by age {retirementData.find(d => d.isDepleted).age}
                        </p>
                        <p className="alert-subtext">
                          With the current parameters, your portfolio will run out of money before reaching your target age of {targetAge}.
                        </p>
                        <button 
                          onClick={calculateSafeRetirementAge}
                          className="recalculate-button"
                        >
                          Calculate Safe Retirement Age
                        </button>
                      </div>
                    ) : (
                      <div className="success-alert">
                        <p className="alert-text">
                          ✅ Portfolio sustainable through age {targetAge}
                        </p>
                        <p className="alert-subtext">
                          Your portfolio will remain positive through your target age.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="retirement-age">
                      Safe retirement age: {safeRetirementAge}
                    </p>
                    <div className="success-alert">
                      <p className="alert-text">
                        ✅ Portfolio sustainable through age {targetAge}
                      </p>
                      <p className="alert-subtext">
                        By retiring at age {safeRetirementAge}, your portfolio remains positive through your target age of {targetAge}.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="table-container">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Age</th>
                      <th>Salary</th>
                      <th>Expenses</th>
                      <th>Portfolio</th>
                      <th>Passive Income</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {retirementData.map((year, index) => (
                      <tr key={index} 
                        className={
                          year.isDepleted 
                            ? "depleted-row" 
                            : year.isRetired 
                              ? "retired-row" 
                              : index === retirementData.findIndex(d => d.isRetired) - 1 
                                ? "transition-row" 
                                : ""
                        }
                      >
                        <td>{year.age}</td>
                        <td>৳{year.salary.toLocaleString()}</td>
                        <td>৳{year.expenses.toLocaleString()}</td>
                        <td>৳{year.investments.toLocaleString()}</td>
                        <td>৳{year.passiveIncome.toLocaleString()}</td>
                        <td>
                          {year.isDepleted 
                            ? "❌ Depleted" 
                            : year.isRetired 
                              ? "Retired" 
                              : "Working"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="no-results">
              Click "Calculate Required Investment" to see corpus analysis, or "Show Projection" to see retirement timeline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetirementCalculator;