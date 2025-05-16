import React, { useState, useEffect } from 'react';
import './RetirementCalculator.css';

const RetirementCalculator = () => {
  // Initial values from user input
  const [currentAge, setCurrentAge] = useState(30);
  const [currentSalary, setCurrentSalary] = useState(312000);
  const [currentExpenses, setCurrentExpenses] = useState(240000);
  const [salaryGrowthRate, setSalaryGrowthRate] = useState(6);
  const [expenseInflationRate, setExpenseInflationRate] = useState(7);
  const [investmentReturnRate, setInvestmentReturnRate] = useState(7); // Conservative rate
  const [investmentStepUpRate, setInvestmentStepUpRate] = useState(10);
  const [targetAge, setTargetAge] = useState(85); // Target age for sustainability
  const [savingsRate, setSavingsRate] = useState(
    Math.round(((currentSalary - currentExpenses) / currentSalary) * 100)
  );
  const [manualRetirementAge, setManualRetirementAge] = useState(null);
  const [showDepletion, setShowDepletion] = useState(true);
  
  // Calculated results
  const [retirementAge, setRetirementAge] = useState(null);
  const [retirementData, setRetirementData] = useState([]);
  const [safeRetirementAge, setSafeRetirementAge] = useState(null);
  
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
    
    // Continue until retirement criteria met
    while (true) {
      // Base savings from salary minus expenses
      const baseSavings = salary - expenses;
      
      // Calculate total contribution (including step-up investment)
      // But don't let it exceed salary
      const totalContribution = Math.min(annualContribution, salary);
      
      // Add to investments and apply returns
      investments = investments * (1 + investmentReturnRate / 100) + totalContribution;
      
      // Store data for each year
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
      
      // Increase salary and expenses for next year
      salary = salary * (1 + salaryGrowthRate / 100);
      expenses = expenses * (1 + expenseInflationRate / 100);
      
      // Increase annual investment contribution by the step-up rate
      annualContribution = annualContribution * (1 + investmentStepUpRate / 100);
      
      age++;
      
      // Check if retirement criteria is met
      if (
        (forcedRetirement && age > customRetirementAge) || 
        (!forcedRetirement && investments * (investmentReturnRate / 100) >= expenses)
      ) {
        break;
      }
      
      // Safety check to prevent infinite loops
      if (age > 150) break;
    }
    
    // Set retirement year data
    retirementYearData = data[data.length - 1];
    
    // Add post-retirement data until targetAge
    let postRetirementInvestments = retirementYearData.investments;
    let postRetirementExpenses = retirementYearData.expenses;
    let postRetirementAge = retirementYearData.age;
    let portfolioDepleted = false;
    let depletionAge = null;
    
    while (postRetirementAge < targetAge) {
      postRetirementAge++;
      
      // Calculate passive income for the year
      const passiveIncome = postRetirementInvestments * (investmentReturnRate / 100);
      
      // Update investments for next year (reinvesting any surplus)
      postRetirementInvestments = postRetirementInvestments * (1 + investmentReturnRate / 100) - postRetirementExpenses;
      
      // Check if portfolio is depleted
      if (postRetirementInvestments <= 0 && !portfolioDepleted) {
        portfolioDepleted = true;
        depletionAge = postRetirementAge;
        postRetirementInvestments = 0; // Don't let it go negative for display purposes
      }
      
      // Increase expenses due to inflation
      postRetirementExpenses = postRetirementExpenses * (1 + expenseInflationRate / 100);
      
      // Store post-retirement data
      data.push({
        age: postRetirementAge,
        salary: 0, // No salary during retirement
        expenses: Math.round(postRetirementExpenses),
        savings: 0, // No new savings during retirement
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
    // Start with normal retirement age
    const initialResult = calculateRetirement();
    
    // If portfolio is already sustainable, we're done
    if (!initialResult.portfolioDepleted) {
      setSafeRetirementAge(initialResult.retirementAge);
      setShowDepletion(false);
      return;
    }
    
    // Otherwise, try incrementally later retirement ages
    let testAge = initialResult.retirementAge + 1;
    let result;
    
    do {
      result = calculateRetirement(testAge);
      testAge++;
      
      // Safety check
      if (testAge > 100) break;
    } while (result.portfolioDepleted);
    
    setSafeRetirementAge(result.retirementAge);
    setShowDepletion(false);
  };

  return (
    <div className="calculator-container">
      <h1 className="calculator-title">Bangladesh Retirement Portfolio Sustainability Calculator</h1>
      
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
            <label>Lower-Risk Investment Return Rate (%)</label>
            <input
              type="number"
              value={investmentReturnRate}
              onChange={(e) => setInvestmentReturnRate(Number(e.target.value))}
            />
            <p className="helper-text">Consider using a lower rate (6-8%) for a more conservative estimate</p>
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
            <label>Target Age for Sustainability</label>
            <input
              type="number"
              value={targetAge}
              onChange={(e) => setTargetAge(Number(e.target.value))}
            />
          </div>
          
          <div className="input-group">
            <label>Manual Retirement Age (Optional)</label>
            <input
              type="number"
              value={manualRetirementAge || ''}
              onChange={(e) => setManualRetirementAge(e.target.value ? Number(e.target.value) : null)}
              placeholder="Leave empty for automatic calculation"
            />
          </div>
          
          <div className="input-group">
            <label>Current Savings Rate (%)</label>
            <div className="savings-rate">{savingsRate}%</div>
          </div>
          
          <div className="button-group">
            <button
              onClick={() => {
                setShowDepletion(true);
                calculateRetirement(manualRetirementAge);
              }}
              className="depletion-button"
            >
              Show Depletion
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
                
                <div className="analysis-container">
                  <h4 className="analysis-title">Portfolio Sustainability Analysis:</h4>
                  {retirementData.length > 0 && (
                    <div>
                      <p className="analysis-item">
                        <span className="item-label">Target Age Expenses:</span> ৳{retirementData.find(d => d.age === targetAge)?.expenses.toLocaleString() || 'N/A'}
                      </p>
                      <p className="analysis-item">
                        <span className="item-label">Target Age Passive Income:</span> ৳{retirementData.find(d => d.age === targetAge)?.passiveIncome.toLocaleString() || 'N/A'}
                      </p>
                      <p className="analysis-item">
                        <span className="item-label">Target Age Portfolio Value:</span> ৳{retirementData.find(d => d.age === targetAge)?.investments.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  )}
                </div>
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
              Click "Show Depletion" or "Find Safe Age" to see results.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetirementCalculator;() => {
                setShowDepletion(true);
                calculateRetirement(manualRetirementAge);
              }}
              className="depletion-button"
            >
              Show Depletion
            </button>
            
            <button
              onClick={