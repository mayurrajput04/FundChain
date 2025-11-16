```markdown
```
<div align="center">

# FundChain

### Blockchain Crowdfunding That Cuts Out the Middleman

*Built on Ethereum Sepolia • No platform fees • Full transparency • Smart contract controlled*

[![Live on Sepolia](https://img.shields.io/badge/Live-Sepolia%20Testnet-success)](https://sepolia.etherscan.io/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-363636)](https://soliditylang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Live Demo](https://fundchain.vercel.app) • [Smart Contracts](https://sepolia.etherscan.io/address/0x90beab1788f70d00646c57cf38d6630e30e1bafd) • [Report Bug](https://github.com/mayurrajput04/FundChain/issues)

</div>

---

## 🎯 Why This Exists

Traditional crowdfunding platforms (Kickstarter, GoFundMe, Indiegogo) take **5-10% of everything you raise**. They control your funds. They can shut you down. They own your data.

**FundChain is different:**

✅ **Zero platform fees** - Only blockchain gas costs  
✅ **Smart contracts hold funds** - Not a company's bank account  
✅ **100% transparent** - Every transaction on Etherscan  
✅ **You own your data** - No central database  
✅ **Admin verification** - Protection against scams  
✅ **Immutable records** - Campaign history can't be erased  

Think: *"Kickstarter meets Ethereum, without the greed"*

---

## ⚡ Quick Start

### Try It Now (No Setup Required)

1. **Visit**: [fundchain.vercel.app](https://fundchain.vercel.app)
2. **Install**: [MetaMask](https://metamask.io/) browser extension
3. **Get**: Free test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
4. **Connect**: Your wallet and start exploring

### Run Locally

**Automated Setup:**

```bash
# Linux/Mac
git clone https://github.com/mayurrajput04/FundChain.git
cd FundChain
chmod +x setup.sh
./setup.sh

# Windows PowerShell
git clone https://github.com/mayurrajput04/FundChain.git
cd FundChain
.\setup.ps1
```

**Manual Setup:**

```bash
# Clone repo
git clone https://github.com/mayurrajput04/FundChain.git
cd FundChain

# Install frontend
cd frontend
npm install
npm run dev

# Open http://localhost:5173
```

**That's it!** Contracts are already deployed on Sepolia.

---

## 🏗️ How It Works

### Three User Types

```
👤 BACKERS        → Discover & fund campaigns
🚀 CREATORS       → Create & manage campaigns  
🛡️  ADMIN         → Verify & approve campaigns
```

### Campaign Flow

```
1. Creator registers → Gets KYC verified (by admin)
                ↓
2. Creator submits campaign → Admin reviews
                ↓
3. Admin approves → Campaign goes live
                ↓
4. Backers contribute ETH → Stored in smart contract
                ↓
5. Goal reached + Deadline passed → Creator withdraws funds
```

**Key Point:** Funds are locked in the smart contract. No company can touch them.

---

## 🎨 Features

### ✅ Currently Working

**For Backers:**
- Browse all approved campaigns
- Filter by category (Medical, Education, etc.)
- Search campaigns
- View campaign details & progress
- Contribute with MetaMask
- Track contribution history
- View personal profile with reputation score

**For Creators:**
- Register with username & email (hashed)
- Choose role (Backer/Creator/Both)
- Create campaigns with 4-step wizard
  - Pre-flight KYC check
  - Basic info (title, goal, deadline)
  - Story & details
  - Review & submit
- View campaign dashboard
- Track campaign stats
- Withdraw funds when goal reached

**For Admins:**
- Secret admin panel (`/admin-secret-login`)
- Review & approve pending campaigns
- User management dashboard
- Upgrade user KYC levels (4 levels: NONE → BASIC → INTERMEDIATE → ADVANCED)
- Ban/unban users
- View platform statistics

**Platform Features:**
- Toast notifications (success, error, warning, info)
- User profile page with KYC status
- Loading states & error handling
- MetaMask integration
- Automatic network detection (prompts for Sepolia)
- Responsive design (mobile-friendly)

---

## 🔐 Smart Contracts

**Deployed on Sepolia Testnet:**

| Contract | Address | Purpose |
|----------|---------|---------|
| **UserRegistry** | [`0x75b9...f189`](https://sepolia.etherscan.io/address/0x75b987308865403c993f56d501ea1002bb28f189) | User profiles, KYC, reputation |
| **CampaignFactory** | [`0x90be...bafd`](https://sepolia.etherscan.io/address/0x90beab1788f70d00646c57cf38d6630e30e1bafd) | Campaign creation & tracking |
| **Admin Wallet** | `0x1b47...9697` | Sole campaign approver |

**Security Features:**
- ✅ KYC verification (4 levels)
- ✅ Admin approval required before campaigns go live
- ✅ Ban system for bad actors
- ✅ Reputation scoring
- ✅ OpenZeppelin security libraries
- ⚠️ **Not audited** - Use at your own risk

**Verified on Etherscan:** View source code and interact directly with contracts.

---

## 📁 Project Structure

```
FundChain/
├── contracts/                  # Solidity smart contracts
│   ├── src/
│   │   ├── UserRegistry.sol    # User management + KYC
│   │   └── CampaignFactory.sol # Campaign logic
│   ├── script/
│   │   └── DeployAll.s.sol     # Deployment script
│   └── foundry.toml
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/          # Admin dashboard, login, user mgmt
│   │   │   ├── backer/         # Discovery, detail, backer dashboard
│   │   │   ├── creator/        # Campaign wizard, creator dashboard
│   │   │   └── common/         # Header, profile, modals, toast
│   │   ├── hooks/
│   │   │   ├── useWeb3.js      # Wallet connection
│   │   │   ├── useCampaigns.js # Campaign CRUD
│   │   │   ├── useUserRegistry.js # User management
│   │   │   └── useAuth.js      # Session management
│   │   ├── contexts/
│   │   │   └── ToastContext.jsx # Notifications
│   │   ├── config/
│   │   │   └── contracts.js    # Contract addresses & ABIs
│   │   └── App.jsx
│   └── package.json
│
├── backend/                    # Express.js (minimal, optional)
│   ├── index.js
│   └── services/
│       └── blockchainService.js
│
├── scripts/
│   ├── setup.sh                # Linux/Mac setup
│   ├── setup.ps1               # Windows setup
│   ├── start.sh                # Start services (Linux/Mac)
│   └── start.ps1               # Start services (Windows)
│
└── README.md
```

---

## 📖 Usage Guide

### For Backers

**1. First Time Setup**
```
→ Install MetaMask extension
→ Visit fundchain.vercel.app
→ Click "Connect Wallet"
→ Switch to Sepolia network (app will prompt)
→ Get test ETH from faucet
```

**2. Register**
```
→ Click "Register Now"
→ Choose username (3-20 chars, lowercase, numbers, underscores)
→ Enter email (gets hashed, stored on-chain)
→ Select role: BACKER, CREATOR, or BOTH
→ Confirm transaction (~100K gas)
```

**3. Browse & Contribute**
```
→ Browse Discovery page
→ Use search/filters to find campaigns
→ Click campaign to see details
→ Enter contribution amount (ETH)
→ Confirm transaction
→ Done! Track in Backer Dashboard
```

### For Creators

**1. Get KYC Verified**

You need **BASIC KYC level minimum** to create campaigns:

```
→ Register as CREATOR or BOTH
→ Contact admin to upgrade KYC
→ Admin upgrades you in User Management panel
→ You can now create campaigns
```

**2. Create Campaign**

```
→ Go to Creator Dashboard
→ Click "Create Campaign"
→ Pass pre-flight checks:
  ✓ Wallet connected
  ✓ Registered user
  ✓ KYC level ≥ BASIC
  ✓ Not banned
→ Fill wizard:
  • Basic Info: Title, category, goal (ETH), deadline (days)
  • Story: Description, image URL (optional)
  • Review: Check everything
→ Submit (~1.5M gas)
→ Wait for admin approval
```

**3. Manage Campaign**

```
→ View in Creator Dashboard
→ Track contributions in real-time
→ When goal reached + deadline passed:
  → Click "Withdraw Funds"
  → Confirm transaction
  → ETH arrives in your wallet
```

### For Admins

**1. Access Admin Panel**

```
→ Navigate to: /admin-secret-login (not in nav bar)
→ Connect with admin wallet (0x1b47...9697)
→ Enter password: Mayur#214
→ Access granted to /admin
```

**2. Approve Campaigns**

```
→ "Campaign Approvals" tab
→ View pending campaigns
→ Review:
  • Title, description, goal
  • Creator info
  • Category
→ Click "Approve" or reject
→ Campaign goes live instantly
```

**3. Manage Users**

```
→ "User Management" tab
→ View all registered users
→ Filter: All / Active / Banned
→ For each user:
  • View KYC level, role, reputation
  • Upgrade/downgrade KYC (NONE → BASIC → INTERMEDIATE → ADVANCED)
  • Ban/unban users
  • View registration date
```

---

## ⚠️ Known Limitations

**Be aware of these before using:**

### Critical Issues

1. **❌ No Refunds**
   - If campaign doesn't reach goal, funds are **locked forever**
   - Auto-refund mechanism not implemented yet
   - **Workaround:** Only back campaigns you trust

2. **❌ Single Admin Wallet**
   - Only one address can approve campaigns
   - If admin loses key, system breaks
   - Should be multi-sig or DAO (planned)

3. **❌ Testnet Only**
   - **DO NOT use real ETH**
   - No security audit
   - Contracts are not upgradeable

### Minor Issues

4. **No Image Upload**
   - Must provide image URL
   - IPFS integration coming later

5. **No Comments/Updates**
   - Can't discuss campaigns on platform
   - No way to post updates

6. **No Email Notifications**
   - Have to check manually
   - No alerts when campaign approved

7. **Admin Password Hardcoded**
   - Password visible in frontend code
   - **Security risk** - will fix with signature auth

8. **Gas Costs**
   - Creating campaign: ~1.5M gas (~$5-20 on mainnet)
   - Contributing: ~150K gas (~$1-5 on mainnet)
   - User pays, not platform

### Future Limitations

9. **No Mobile App** - Web only
10. **No Social Features** - Can't follow creators
11. **No Analytics** - Basic stats only
12. **Sepolia Only** - Not on mainnet

**See all issues:** [GitHub Issues](https://github.com/mayurrajput04/FundChain/issues)

---

## 🗺️ Roadmap

### ✅ Phase 1: MVP (COMPLETED)
- [x] Smart contracts (UserRegistry, CampaignFactory)
- [x] Deploy to Sepolia testnet
- [x] Frontend with React + Vite
- [x] User registration & profiles
- [x] KYC system (4 levels)
- [x] Campaign creation wizard
- [x] Admin approval workflow
- [x] Discovery page with search/filters
- [x] Contribution flow
- [x] User & admin dashboards
- [x] Toast notifications
- [x] Deploy to Vercel

### 🚧 Phase 2: UX Improvements (IN PROGRESS)
- [ ] Implement refund mechanism (CRITICAL)
- [ ] IPFS image upload integration
- [ ] Campaign comments/updates
- [ ] Email notifications (optional)
- [ ] Improved mobile responsive design
- [ ] Better error messages
- [ ] Loading skeletons
- [ ] Campaign draft saves

### 📋 Phase 3: Security & Scale (PLANNED)
- [ ] Remove hardcoded admin password
- [ ] Multi-sig admin wallet
- [ ] Security audit (required for mainnet)
- [ ] Gas optimization
- [ ] Upgrade mechanism (proxy pattern)
- [ ] Rate limiting
- [ ] Better ban system

### 🔮 Phase 4: Advanced Features (FUTURE)
- [ ] Milestone-based funding
- [ ] Multi-token support (USDC, DAI)
- [ ] DAO governance for approvals
- [ ] Reputation-based auto-approval
- [ ] Social features (follow, share)
- [ ] Campaign analytics dashboard
- [ ] Mobile apps (iOS/Android)
- [ ] Mainnet deployment

---

## 🛠️ Tech Stack

**Smart Contracts:**
- Solidity 0.8.19
- Foundry (testing & deployment)
- OpenZeppelin (security libs)
- Sepolia testnet

**Frontend:**
- React 18
- Vite (build tool)
- ethers.js v6
- React Router v6
- Lucide icons
- Inline styles (no CSS framework)

**Backend (Optional):**
- Node.js + Express
- MongoDB (not currently used)
- JWT auth (skeleton only)

**Deployment:**
- Vercel (frontend)
- Sepolia (contracts)
- GitHub Actions (CI/CD ready)

**Development:**
- Foundry for contracts
- VS Code
- MetaMask
- Alchemy RPC

---

## 🤝 Contributing

Found a bug? Want to add features? **PRs welcome!**

### How to Contribute

```bash
# 1. Fork the repo on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/FundChain.git
cd FundChain

# 3. Create feature branch
git checkout -b feature/amazing-feature

# 4. Make changes & test
./setup.sh
./start.sh

# 5. Commit
git commit -m "Add amazing feature"

# 6. Push
git push origin feature/amazing-feature

# 7. Open Pull Request on GitHub
```

### Contribution Guidelines

- **Test your changes** - Run `npm run build` before committing
- **Write clear commits** - Explain what and why
- **Comment your code** - Especially complex logic
- **Update docs** - If you change functionality
- **Be respectful** - Follow Code of Conduct

### Areas That Need Help

- 🔴 **CRITICAL:** Implement refund mechanism
- 🟡 **HIGH:** IPFS image integration
- 🟡 **HIGH:** Remove hardcoded admin password
- 🟢 **MEDIUM:** Add campaign comments
- 🟢 **MEDIUM:** Email notifications
- 🟢 **LOW:** UI/UX improvements

---

## 💰 Gas Costs (Sepolia)

**Current gas usage:**

| Action | Gas Used | Cost (Sepolia) |
|--------|----------|----------------|
| Register user | ~100K | FREE (testnet) |
| Create campaign | ~1.5M | FREE (testnet) |
| Contribute | ~150K | FREE (testnet) |
| Approve campaign | ~50K | FREE (testnet) |
| Upgrade KYC | ~60K | FREE (testnet) |

**Mainnet estimates (at 30 gwei, $2000 ETH):**
- Register: ~$6
- Create campaign: ~$90
- Contribute: ~$9

---

## 🙋 FAQ

**Q: Is this safe to use?**  
A: On **testnet**, yes. On **mainnet**, NO - not audited yet.

**Q: Can I use real ETH?**  
A: NO. Sepolia testnet only. Get free test ETH from faucets.

**Q: What if campaign doesn't reach goal?**  
A: Funds are **currently locked**. This is a known bug being fixed.

**Q: How do I get KYC verified?**  
A: Contact the admin after registering. They upgrade you manually.

**Q: Can I create campaigns without KYC?**  
A: No. BASIC KYC minimum required.

**Q: Who is the admin?**  
A: Single wallet: `0x1b4709064B3050d11Ba2540AbA8B3B4412159697`

**Q: Can I become admin?**  
A: No. Admin is hardcoded in contract. Future: DAO governance.

**Q: Why Sepolia and not mainnet?**  
A: Testing phase. Mainnet requires security audit ($20K+).

**Q: How do I report bugs?**  
A: [Open an issue](https://github.com/mayurrajput04/FundChain/issues) on GitHub.

**Q: Can I fork this for my project?**  
A: Yes! MIT licensed. Fork, deploy, customize.

**Q: Where are campaign images stored?**  
A: You provide URL. We don't host images (yet).

**Q: Is there a token?**  
A: No. No token, no ICO, no airdrop. Just a dApp.

**Q: When mainnet?**  
A: After security audit + refund mechanism + testing.

---

## 🔒 Security

### Current Status: ⚠️ TESTNET ONLY

**DO NOT:**
- ❌ Use real ETH
- ❌ Deploy to mainnet
- ❌ Use for real fundraising
- ❌ Trust with large amounts

**Security Measures Implemented:**
- ✅ OpenZeppelin libraries
- ✅ KYC verification
- ✅ Admin approval
- ✅ Ban system
- ✅ Input validation

**Security Issues:**
- ❌ Not professionally audited
- ❌ Admin password in frontend code
- ❌ Single admin wallet
- ❌ No refund mechanism
- ❌ Contracts not upgradeable

**Planned:**
- [ ] Professional security audit
- [ ] Multi-sig admin wallet
- [ ] Bug bounty program
- [ ] Formal verification
- [ ] Mainnet deployment

**Found a vulnerability?** Email: security@fundchain.example (placeholder)

---

## 📄 License

MIT License - See [LICENSE](LICENSE)

**TL;DR:**
- ✅ Use for commercial projects
- ✅ Modify and distribute
- ✅ Private use
- ❌ No warranty
- ❌ Author not liable

---

## 🙏 Acknowledgments

**Built with:**
- [OpenZeppelin](https://openzeppelin.com/) - Secure smart contract libs
- [Foundry](https://getfoundry.sh/) - Ethereum dev framework
- [ethers.js](https://docs.ethers.org/) - Web3 library
- [React](https://react.dev/) - Frontend framework
- [Vite](https://vitejs.dev/) - Build tool
- [Alchemy](https://www.alchemy.com/) - RPC provider
- [Vercel](https://vercel.com/) - Hosting

**Inspired by:**
- Kickstarter (but better)
- Ethereum's vision of decentralization
- Too many failed crowdfunding campaigns

**Special thanks to:**
- Stack Overflow for debugging help
- Coffee for keeping me awake
- MetaMask for making Web3 accessible

---

## 📞 Contact & Support

**Creator:** [@mayurrajput04](https://github.com/mayurrajput04)

**Get Help:**
- 🐛 [Report Bugs](https://github.com/mayurrajput04/FundChain/issues)
- 💬 [Discussions](https://github.com/mayurrajput04/FundChain/discussions)

**Community:**

- [Twitter](https://x.com/samuraiigintoki)

---

## 📊 Project Stats

- **Lines of Code:** ~5,000+
- **Smart Contracts:** 2
- **Components:** 15+
- **Deployment Time:** 3 months
- **Coffee Consumed:** Too much
- **Bugs Fixed:** Countless
- **Stars:** (hopefully many 😊)

---

## 🎯 Final Words

This is a **real, working crowdfunding platform** built on Ethereum. It's not perfect. It has bugs. The UI could be better.

**But it works.** And it proves that decentralized crowdfunding is possible without:
- Giving 10% to a company
- Trusting a centralized platform
- Sacrificing transparency

If you find this useful, **star the repo** ⭐

If you find bugs, **open an issue** 🐛

If you want to contribute, **submit a PR** 🚀

And if you actually use this to fund something real, **please tell me** - that would make my year.

---

<div align="center">

**Built with ❤️ and blockchain magic**

[⭐ Star this repo](https://github.com/mayurrajput04/FundChain) • [🍴 Fork it](https://github.com/mayurrajput04/FundChain/fork) • [📢 Share it](https://twitter.com/intent/tweet?text=Check%20out%20FundChain%20-%20Decentralized%20Crowdfunding%20on%20Ethereum!&url=https://github.com/mayurrajput04/FundChain)

**License:** MIT | **Status:** Testnet | **Support:** [Issues](https://github.com/mayurrajput04/FundChain/issues)

</div>

```
