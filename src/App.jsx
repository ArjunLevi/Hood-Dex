import { useState } from 'react';
import { ethers } from 'ethers';
import Select from 'react-select';
import './App.css';
import HOODS_LOGO from './public/hood.png';

const DEX_ADDRESS = "0xD0358E7e805384c411Db897990c92A51133bc180";
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
  const [status, setStatus] = useState("Execute Swap");

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  async function connect() {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } catch (err) {
      console.error("Wallet connect failed", err);
    }
  }

  async function executeSwap() {
    if (!amount || Number(amount) <= 0 || (swapMode !== "ETH_TO_TOKEN" && !tokenIn) || !tokenOut) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const val = ethers.parseEther(amount);

      const dex = new ethers.Contract(DEX_ADDRESS, [
        "function ethToToken(address tokenOut) payable returns (uint256)",
        "function tokenToEth(address tokenIn, uint256 amountIn) returns (uint256)",
        "function tokenToToken(address tokenIn, address tokenOut, uint256 amountIn) public"
      ], signer);

      if (swapMode !== "ETH_TO_TOKEN" && tokenIn) {
        setStatus("Checking Allowance...");
        const tokenContract = new ethers.Contract(TOKENS[tokenIn.value], [
          "function allowance(address owner, address spender) view returns (uint256)",
          "function approve(address spender, uint256 amount) returns (bool)"
        ], signer);

        const allowance = await tokenContract.allowance(account, DEX_ADDRESS);
        if (allowance < val) {
          setStatus("Approving Token...");
          const approveTx = await tokenContract.approve(DEX_ADDRESS, ethers.MaxUint256);
          await approveTx.wait();
        }
      }

      setStatus("Swapping...");
      let tx;
      if (swapMode === "ETH_TO_TOKEN") {
        tx = await dex.ethToToken(TOKENS[tokenOut.value], { value: val });
      } else if (swapMode === "TOKEN_TO_ETH") {
        tx = await dex.tokenToEth(TOKENS[tokenIn.value], val);
      } else {
        tx = await dex.tokenToToken(TOKENS[tokenIn.value], TOKENS[tokenOut.value], val);
      }

      await tx.wait();
      setStatus("Swap Successful!");
      setAmount("");
    } catch (e) {
      console.error(e);
      setStatus("Transaction Failed");
    }
  }

  const tokenOptions = Object.keys(TOKENS).map(t => ({
    value: t,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img src={STOCK_LOGOS[t]} alt={`${t} logo`} style={{ width: '24px', height: '24px' }} />
        <span>{t}</span>
      </div>
    )
  }));

  const selectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? '#111' : '#f8f9fa',
      borderColor: isDarkMode ? '#333' : '#ddd',
      borderRadius: '12px',
      boxShadow: 'none',
      color: isDarkMode ? '#fff' : '#000',
      minHeight: '48px',
      '&:hover': { borderColor: isDarkMode ? '#555' : '#aaa' }
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? '#111' : '#fff',
      borderRadius: '12px',
      border: `1px solid ${isDarkMode ? '#333' : '#ddd'}`,
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      marginTop: '4px'
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? (isDarkMode ? '#2a2a2a' : '#e0e0e0') : (isDarkMode ? '#111' : '#fff'),
      color: isDarkMode ? '#fff' : '#000',
      padding: '10px 12px',
      cursor: 'pointer',
      '&:hover': { backgroundColor: isDarkMode ? '#222' : '#f0f0f0' }
    }),
    singleValue: (base) => ({
      ...base,
      color: isDarkMode ? '#fff' : '#000'
    }),
    placeholder: (base) => ({ ...base, color: isDarkMode ? '#aaa' : '#666' }),
    dropdownIndicator: (base) => ({ ...base, color: isDarkMode ? '#aaa' : '#666' })
  };

  return (
    <div className={isDarkMode ? "dark-theme" : "light-theme"}>
      <nav className="nav-bar">
        <div className="logo-section">
          <img src={HOODS_LOGO} alt="Hoods Dex" className="hoods-logo" />
          <span className="brand-name">Hoods Dex</span>
        </div>
        <div className="nav-actions">
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? "☀️" : "🌙"}
          </button>
          <button className="connect-btn" onClick={connect}>
            {account ? `${account.slice(0,6)}...${account.slice(-4)}` : "Connect Wallet"}
          </button>
        </div>
      </nav>

      <main className="main-content">
        <div className="swap-card">
          <h1>EVRT Swap</h1>

          <div className="mode-toggle">
            <button className={swapMode === "ETH_TO_TOKEN" ? "active" : ""} onClick={() => setSwapMode("ETH_TO_TOKEN")}>
              ETH to Stock
            </button>
            <button className={swapMode === "TOKEN_TO_ETH" ? "active" : ""} onClick={() => setSwapMode("TOKEN_TO_ETH")}>
              Stock to ETH
            </button>
            <button className={swapMode === "TOKEN_TO_TOKEN" ? "active" : ""} onClick={() => setSwapMode("TOKEN_TO_TOKEN")}>
              Stock to Stock
            </button>
          </div>

          <div className="input-box">
            <label>You Pay</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            {swapMode !== "ETH_TO_TOKEN" && (
              <Select
                value={tokenIn}
                onChange={setTokenIn}
                options={tokenOptions}
                styles={selectStyles}
                placeholder="Select stock"
                isSearchable={false}
              />
            )}
          </div>

          <div className="divider">↓</div>

          <div className="input-box">
            <label>You Receive</label>
            <input type="text" value={amount ? `~${(Number(amount) * 0.99).toFixed(4)}` : "0.00"} readOnly />
            {swapMode !== "TOKEN_TO_ETH" && (
              <Select
                value={tokenOut}
                onChange={setTokenOut}
                options={tokenOptions}
                styles={selectStyles}
                placeholder="Select stock"
                isSearchable={false}
              />
            )}
          </div>

          <button className="action-btn" onClick={executeSwap} disabled={!amount || Number(amount) <= 0 || status.includes("...")}>
            {status || "Swap"}
          </button>
        </div>
      </main>

      <footer className="footer">
        <p>Built by @arjunlevi</p>
        <div className="social-links">
          <a href="https://github.com/ArjunLevi" target="_blank" rel="noopener noreferrer">
            <img src={GITHUB_LOGO} alt="GitHub" className="social-icon github-icon" />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;