# Blockchain-Based Voting System

A secure, transparent, and decentralized voting platform powered by blockchain technology. This project integrates a smart contract for election management, a backend server for data processing, and a user-friendly frontend for interaction.

---

## Table of Contents
- [Blockchain-Based Voting System](#blockchain-based-voting-system)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Technologies Used](#technologies-used)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [1. Run the Local Blockchain](#1-run-the-local-blockchain)
    - [2. Deploy the Smart Contract](#2-deploy-the-smart-contract)
    - [3. Start the Backend Server](#3-start-the-backend-server)
    - [4. Start the Frontend Application](#4-start-the-frontend-application)
    - [5. Configure MetaMask](#5-configure-metamask)
    - [Usage](#usage)
    - [Project Structure](#project-structure)

---

## Features
- **Secure Voting**: Leverages blockchain for tamper-proof vote recording.
- **Role-Based Access**: Separate dashboards for admins (election management) and voters (voting).
- **Real-Time Results**: Displays election outcomes as votes are cast.
- **Wallet Integration**: Uses MetaMask for voter authentication and transaction signing.

---

## Technologies Used
- **Blockchain**: Ethereum (via Hardhat for local development)
- **Smart Contract**: Solidity
- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: MongoDB (or specify your database)
- **Wallet**: MetaMask

---

## Prerequisites
Before running the project, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/)
- [MetaMask](https://metamask.io/) browser extension

---

## Installation
Follow these steps to set up and run the project locally:

### 1. Run the Local Blockchain
Open a terminal in the project root and start a local Hardhat node:
```bash
npx hardhat node
```

This launches a local Ethereum blockchain at http://127.0.0.1:8545.

Pre-funded test accounts and their private keys will be displayed in the terminal.

### 2. Deploy the Smart Contract

In a new terminal, deploy the smart contract to the local network:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

After deployment, note the contract address from the terminal output.

Update the contract address in your frontend and backend configuration files (e.g., .env or similar) if required.

### 3. Start the Backend Server

Navigate to the backend folder, install dependencies, and start the server:

```bash
cd backend
npm install
npm run start
```
The server will run on http://localhost:3001 by default.

### 4. Start the Frontend Application

In another terminal, navigate to the frontend folder, install dependencies, and start the development server:

```bash 
cd frontend
npm install
npm run dev
```
The frontend will typically run on http://localhost:5173. Open this URL in your browser.

### 5. Configure MetaMask

Set up MetaMask to connect to your local blockchain:
Open the MetaMask extension in your browser.

Add a new network with these settings:
Network Name: Localhost Hardhat

New RPC URL: http://127.0.0.1:8545

Chain ID: 31337 (confirm this matches your Hardhat node output)

Import a test account:
Copy a private key from the Hardhat node terminal output.

Use MetaMask’s “Import Account” feature to add it.

Ensure MetaMask is connected to the “Localhost Hardhat” network.

### Usage


Once the application is running, follow these steps to use it:

1.  Access the Application  
    Open http://localhost:5173 in your browser.
    
2.  Log In or Register
    
    -   On the login/registration page, use:
        
        -   Admin: admin@example.com (or predefined admin credentials).
            
        -   Voter: Any other email to simulate a voter account.
            
    -   After logging in, you’ll be redirected to the appropriate dashboard based on your role.
        
3.  Admin Panel
    
    -   Create and manage elections (e.g., add candidates, set election dates).
        
    -   Monitor ongoing elections.
        
4.  Voter Panel
    
    -   View active elections.
        
    -   Cast your vote using MetaMask to sign the transaction.
        

Note: Restarting the Hardhat node resets the blockchain state. Redeploy the smart contract (Step 2) after each restart.

### Project Structure

Here’s an overview of the project’s directory layout:

```text
├── /contracts         # Smart contract files (Solidity)
├── /backend           # Node.js server and API logic
├── /frontend          # React.js application
├── /scripts           # Deployment scripts for Hardhat
└── README.md          # Project documentation