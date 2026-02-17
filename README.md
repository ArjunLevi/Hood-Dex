# 🚀 Hoods Dex: Fast, Efficient, Open Exchange

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Network: Robinhood Testnet](https://img.shields.io/badge/Network-Robinhood_Testnet-CCFF00.svg)](https://docs.robinhood.com/)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react)](https://reactjs.org/)
[![Ethers](https://img.shields.io/badge/Library-Ethers.js_v6-3C3C3D?logo=ethereum)](https://docs.ethers.org/v6/)

**Hoods Dex** is a professional-grade Automated Market Maker (AMM) built on the Robinhood Chain. It enables seamless, decentralized trading of tokenized stock assets with a sleek, fintech-inspired interface.

---

## 🌟 Key Features

* **AMM Swaps:** Trade Stock Tokens using the $x \cdot y = k$ constant product formula.
* **Integrated Routing:** Perform Stock-to-Stock trades (e.g., AMD to TSLA) in a single transaction via an ETH bridge.
* **Auto-Approve Logic:** A seamless UX that handles ERC20 allowances automatically before swapping.
* **Emergency Safety:** Built-in `emergencyWithdraw` functions to ensure liquidity can be recovered by the owner.
* **Dual Theme:** Dark and Light mode support inspired by Robinhood’s official documentation.

---

## 🛠 Tech Stack

* **Smart Contracts:** Solidity v0.8.20+.
* **Frontend:** React.js, Vite, Tailwind CSS.
* **Web3 Library:** Ethers.js v6.
* **Icons/UI:** React-Select, Lucide-React.

---

## 🏗 Repository Structure

```text
├── contracts/          # Solidity smart contracts (EVRTSwap.sol)
├── src/                # React frontend source code
│   ├── assets/         # Images, icons, and logos
│   ├── App.jsx         # Main application logic & UI
│   ├── App.css         # Custom Robinhood-themed styling
│   └── main.jsx        # React entry point
└── tailwind.config.js  # Styling configuration