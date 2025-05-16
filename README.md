# Bangladesh Retirement Calculator

A financial planning tool built with React to help people in Bangladesh calculate when they can retire based on their current financial situation.


## Features

- Calculate retirement age based on current financial inputs
- Dynamic calculation of portfolio sustainability
- Visual indicators for portfolio depletion
- Automatic calculation of safe retirement age
- Year-by-year breakdown of financial projections
- Responsive design for desktop and mobile

## Live Demo

Visit the live demo: [Bangladesh Retirement Calculator](https://hamimul.github.io/bangladesh-retirement-calculator/)

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/hamimul/bangladesh-retirement-calculator.git
cd bangladesh-retirement-calculator
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm start
# or
yarn start
```

4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

To deploy to GitHub Pages:

1. Update the `homepage` field in `package.json` with your GitHub username
2. Run the deploy script
```bash
npm run deploy
# or
yarn deploy
```

## How It Works

The calculator uses the following methodology:

1. Takes inputs for current age, salary, expenses, and various growth rates
2. Calculates how investments grow over time based on annual contributions and returns
3. Determines when passive income from investments exceeds annual expenses
4. Projects portfolio value until target age to check sustainability
5. Can calculate a "safe retirement age" if the initial projection shows depletion

## Customization

You can customize the calculator for different regions by:

1. Changing the currency symbol
2. Adjusting default values for growth and inflation rates
3. Modifying the UI text and labels

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- Inspired by financial independence calculators and FIRE (Financial Independence, Retire Early) movement
- Designed with the specific economic conditions of Bangladesh in mind
