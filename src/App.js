import React from 'react';
import './App.css';
import RetirementCalculator from './components/RetirementCalculator';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Bangladesh Retirement Planning</h1>
        <p>Plan your financial future and calculate when you can retire</p>
      </header>
      <main>
        <RetirementCalculator />
      </main>
      <footer className="App-footer">
        <p>© {new Date().getFullYear()} Bangladesh Retirement Calculator</p>
        <p>
          <a href="https://github.com/hamimul/bangladesh-retirement-calculator" target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
          {' | '}
          <a href="https://www.linkedin.com/in/hamimul" target="_blank" rel="noopener noreferrer">
            Connect on LinkedIn
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;