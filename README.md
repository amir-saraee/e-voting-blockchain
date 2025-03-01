Run Instructions
This project consists of three main components: the smart contract, the backend server, and the frontend application. Follow the steps below to run the application locally.

Prerequisites
Node.js (v14 or higher recommended)
npm
MetaMask extension installed in your browser
1. Run the Local Blockchain
Open a terminal in the project root and run the following command to start a local Hardhat node:

bash
Copy
npx hardhat node
This will launch a local Ethereum blockchain on http://127.0.0.1:8545 with pre-funded test accounts.

2. Deploy the Smart Contract
In a new terminal window, deploy the smart contract to the local Hardhat network:

bash
Copy
npx hardhat run scripts/deploy.js --network localhost
After deployment, note the contract address output. You may need to update this address in your frontend and backend configuration files if not already set.

3. Start the Backend Server
Navigate to the backend folder, install dependencies, and start the server:

bash
Copy
cd backend
npm install
npm run start
The backend server will run on port 3001 by default.

4. Start the Frontend Application
Open another terminal, navigate to the frontend folder (or the folder where your React project is located), install dependencies, and start the development server:

bash
Copy
cd frontend
npm install
npm run dev
The frontend application should now be running (typically on port 5173). Open your browser and navigate to http://localhost:5173.

5. Configure MetaMask
Open the MetaMask extension in your browser.
Add a new network with the following settings:
Network Name: Localhost Hardhat
New RPC URL: http://127.0.0.1:8545
Chain ID: 31337 (or as indicated in your Hardhat node output)
Import one of the test accounts from the Hardhat node (private keys are shown in the terminal output when you run npx hardhat node).
Ensure MetaMask is connected to the Localhost Hardhat network.
6. Use the Application
Navigate to http://localhost:5173 in your browser.
On the login/registration page, register or log in. (For example, use admin@example.com for the admin panel and any other email for the voter panel.)
Based on your role, you will be redirected to either the Admin Dashboard or the Voter Dashboard.
Use the provided menus to navigate the application:
Admin Panel: Create and manage elections and candidates.
Voter Panel: View active elections and cast your vote (via MetaMask).
Note:

In a production environment, once the smart contract is deployed on a permanent network (e.g., Ethereum Mainnet or Polygon), its address will remain constant, and you will not need to redeploy the contract with every run.
When testing on a local blockchain, restarting the Hardhat node resets the blockchain state, so you must redeploy the smart contract each time.