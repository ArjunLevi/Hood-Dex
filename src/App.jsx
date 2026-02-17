import { useState } from 'react';
import { ethers } from 'ethers';
import Select from 'react-select';
import './App.css';

import HOODS_LOGO from './public/hood.png';

const DEX_ADDRESS = "0xD0358E7e805384c411Db897990c92A51133bc180";
const ROBINHOOD_TESTNET_CHAIN_ID = 46630n;

const TOKENS = {
  AMD: "0x71178BAc73cBeb415514eB542a8995b82669778d",
  AMZN: "0x5884aD2f920c162CFBbACc88C9C51AA75eC09E02",
  TSLA: "0xC9f9c86933092BbbfFF3CCb4b105A4A94bf3Bd4E",
  PLTR: "0x1FBE1a0e43594b3455993B5dE5Fd0A7A266298d0",
  NFLX: "0x3b8262A63d25f0477c4DDE23F83cfe22Cb768C93"
};

const STOCK_LOGOS = {
  AMD: "https://upload.wikimedia.org/wikipedia/commons/7/7c/AMD_Logo.svg",
  AMZN: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  TSLA: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg",
  PLTR: "https://upload.wikimedia.org/wikipedia/commons/1/13/Palantir_Technologies_logo.svg",
  NFLX: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
};

const X_LOGO = "https://upload.wikimedia.org/wikipedia/commons/5/53/X_logo_2023_original.svg";
const GITHUB_LOGO = "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [swapMode, setSwapMode] = useState("ETH_TO_TOKEN");
  const [amount, setAmount] = useState("");
  const [tokenIn, setTokenIn] = useState(null);
  const [tokenOut, setTokenOut] = useState(null);
  const [account, setAccount] = useState("");
  const [status, setStatus] = useState("Swap");
  const [isLoading, setIsLoading] = useState(false);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("No Ethereum wallet detected. Install MetaMask or similar.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } catch (err) {
      console.error("Connection failed:", err);
      alert("Failed to connect wallet");
    }
  }

  async function executeSwap() {
    if (!window.ethereum) {
      alert("No wallet detected");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid amount > 0");
      return;
    }

    // --- FIX: Logic checks based on Swap Mode ---
    if (swapMode !== "ETH_TO_TOKEN") {
      if (!tokenIn?.value) {
        alert("Please select the token you want to pay with");
        return;
      }
    }

    if (swapMode !== "TOKEN_TO_ETH") {
      if (!tokenOut?.value) {
        alert("Please select the token you want to receive");
        return;
      }
    }

    setIsLoading(true);
    setStatus("Preparing...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      if (network.chainId !== ROBINHOOD_TESTNET_CHAIN_ID) {
        alert(`Switch to Robinhood Chain Testnet (Chain ID ${ROBINHOOD_TESTNET_CHAIN_ID})`);
        setIsLoading(false);
        setStatus("Swap");
        return;
      }

      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const value = ethers.parseEther(amount);

      const dex = new ethers.Contract(DEX_ADDRESS, [
        "function ethToToken(address tokenOut) payable returns (uint256)",
        "function tokenToEth(address tokenIn, uint256 amountIn) returns (uint256)",
        "function tokenToToken(address tokenIn, address tokenOut, uint256 amountIn) public"
      ], signer);

      let tx;

      // Handle ERC20 Approval if starting with a Token
      if (swapMode !== "ETH_TO_TOKEN") {
        setStatus("Checking allowance...");
        const tokenContract = new ethers.Contract(
          TOKENS[tokenIn.value],
          ["function allowance(address owner, address spender) view returns (uint256)", "function approve(address spender, uint256 amount) returns (bool)"],
          signer
        );

        const allowance = await tokenContract.allowance(userAddress, DEX_ADDRESS);
        if (allowance < value) {
          setStatus("Approving token...");
          const approveTx = await tokenContract.approve(DEX_ADDRESS, ethers.MaxUint256);
          await approveTx.wait();
        }
      }

      setStatus("Sending swap...");

      if (swapMode === "ETH_TO_TOKEN") {
        tx = await dex.ethToToken(TOKENS[tokenOut.value], { value, gasLimit: 600000n });
      } else if (swapMode === "TOKEN_TO_ETH") {
        tx = await dex.tokenToEth(TOKENS[tokenIn.value], value, { gasLimit: 600000n });
      } else {
        tx = await dex.tokenToToken(TOKENS[tokenIn.value], TOKENS[tokenOut.value], value, { gasLimit: 800000n });
      }

      setStatus("Waiting for confirmation...");
      await tx.wait();

      setStatus("Success ✓");
      setAmount("");
      setTokenIn(null);
      setTokenOut(null);
      setTimeout(() => setStatus("Swap"), 4000);
    } catch (error) {
      console.error("Swap failed:", error);
      let msg = error.shortMessage || error.message || "Transaction failed";
      setStatus("Swap");
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  }

  const tokenOptions = Object.keys(TOKENS).map(t => ({
    value: t,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src={STOCK_LOGOS[t]} alt={t} style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
        <span>{t}</span>
      </div>
    )
  }));

  const selectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? '#111111' : '#ffffff',
      borderColor: isDarkMode ? '#374151' : '#d1d5db',
      borderRadius: '12px',
      minHeight: '52px',
      color: isDarkMode ? '#f3f4f6' : '#111827',
    }),
    menu: (base) => ({ ...base, backgroundColor: isDarkMode ? '#111111' : '#ffffff' }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#1f2937' : 'transparent',
      color: isDarkMode ? '#f3f4f6' : '#111827',
      ':hover': { backgroundColor: '#1f2937' }
    }),
    singleValue: (base) => ({ ...base, color: isDarkMode ? '#f3f4f6' : '#111827' })
  };

  return (
    <div className={isDarkMode ? "dark-theme" : "light-theme"}>
      <nav className="nav-bar">
        <div className="logo-section">
          <img src={HOODS_LOGO} alt="Hoods Dex" className="hoods-logo" />
          <span className="brand-name">Hoods Dex</span>
        </div>
        <div className="nav-actions">
          <button className="theme-toggle" onClick={toggleTheme}>{isDarkMode ? "☀️" : "🌙"}</button>
          <button className="connect-btn" onClick={connectWallet}>
            {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
          </button>
        </div>
      </nav>

      <main className="main-content">
        <div className="swap-card">
          <h1>Hoods Stocks</h1>

          <div className="mode-toggle">
            <button className={swapMode === "ETH_TO_TOKEN" ? "active" : ""} onClick={() => setSwapMode("ETH_TO_TOKEN")}>ETH → Stock</button>
            <button className={swapMode === "TOKEN_TO_ETH" ? "active" : ""} onClick={() => setSwapMode("TOKEN_TO_ETH")}>Stock → ETH</button>
            <button className={swapMode === "TOKEN_TO_TOKEN" ? "active" : ""} onClick={() => setSwapMode("TOKEN_TO_TOKEN")}>Stock → Stock</button>
          </div>

          <div className="input-box">
            <label>You Pay</label>
            <div className="input-row">
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" disabled={isLoading} />
              {swapMode !== "ETH_TO_TOKEN" ? (
                <Select value={tokenIn} onChange={setTokenIn} options={tokenOptions} styles={selectStyles} className="token-select" />
              ) : (
                <div className="static-token">ETH</div>
              )}
            </div>
          </div>

          <div className="divider">↓</div>

          <div className="input-box">
            <label>You Receive (estimated)</label>
            <div className="input-row">
              <input type="text" value={amount ? `~${(Number(amount) * 0.99).toFixed(6)}` : "0.00"} readOnly />
              {swapMode !== "TOKEN_TO_ETH" ? (
                <Select value={tokenOut} onChange={setTokenOut} options={tokenOptions} styles={selectStyles} className="token-select" />
              ) : (
                <div className="static-token">ETH</div>
              )}
            </div>
          </div>

          <button className="action-btn" onClick={executeSwap} disabled={isLoading || !amount}>
            {isLoading ? "Processing..." : status}
          </button>
        </div>
      </main>
        <footer className="footer">
        <p>Built by @arjunlevi</p>
        <div className="social-links">
          <a href="https://github.com/ArjunLevi" target="_blank" rel="noopener noreferrer">
            <img src={GITHUB_LOGO} alt="GitHub" className="social-icon" />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;