# ETH Math Quiz

This project is a decentralized application (DApp) offering math quizzes powered by Ethereum smart contracts. It aims to enhance knowledge of DApp development.

## Features
- Math quizzes interacting with Ethereum smart contracts.
- Built using Solidity, Hardhat, and ethers.js.

## Tech Stack
- **Frontend:** TypeScript, React
- **Backend:** Solidity, Hardhat, ethers.js
- **Blockchain:** Ethereum (Polygon Amoy testnet)

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/nabeo114/eth-math-quiz.git
    cd eth-math-quiz
    ```

2. Install dependencies:
    ```bash
    cd frontend
    npm install
    cd ../hardhat
    npm install
    ```

3. Configure environment variables:

    In the `hardhat` directory, create a `.env` file:

    ```env
    INFURA_API_KEY=your_infura_api_key_here
    ACCOUNT_PRIVATE_KEY=your_private_key_here
    ```

    In the `frontend` directory, create another `.env` file:

    ```env
    INFURA_API_KEY=your_infura_api_key_here
    ```

    **Note:**
    - The `ACCOUNT_PRIVATE_KEY` is used for deploying contracts; ensure it holds MATIC tokens from the [Polygon Faucet](https://faucet.polygon.technology/).
    - The `INFURA_API_KEY` is required to connect to the Polygon Amoy testnet via Infura. Obtain it from [Infura](https://app.infura.io/).

4. Compile the smart contracts:
    ```bash
    npm run compile
    ```

5. Deploy the contracts to the Polygon Amoy testnet:
    ```bash
    npm run deploy
    ```

## Running the Frontend

1. Start the development server:
    ```bash
    cd ../frontend
    npm start
    ```
