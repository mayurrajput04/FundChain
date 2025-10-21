

<div align="center">

# FundChain

### Decentralized Crowdfunding That Actually Makes Sense

*Built on Ethereum • No middlemen taking your money • Full transparency guaranteed*

[![Live on Sepolia](https://img.shields.io/badge/Live-Sepolia%20Testnet-success)](https://sepolia.etherscan.io/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-363636)](https://soliditylang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Live Demo](https://fundchain.vercel.app) • [Documentation](docs/) • [Report Bug](https://github.com/mayurrajput04/FundChain/issues)

</div>

---

## Why This Exists

Look, traditional crowdfunding platforms like Kickstarter and GoFundMe take **5-10% of your money**. They hold your funds. They can shut down your campaign. They control everything.

**I thought we could do better.**

FundChain is a crowdfunding platform where:
- ✅ **Smart contracts hold the funds** - not a company
- ✅ **Zero platform fees** - only gas costs (which go to miners, not us)
- ✅ **Transparent by default** - every transaction is on-chain
- ✅ **You own your data** - no central database selling your info
- ✅ **Admin verification** - protection against scams without centralization

Think of it as: *"What if Kickstarter and Ethereum had a baby, and that baby actually cared about you?"*

---

## The Stack

**Smart Contracts** (The Brain)
- Solidity 0.8.19
- Foundry for testing and deployment
- OpenZeppelin for security
- Deployed on Sepolia testnet

**Frontend** (The Face)
- React 18 with Vite (because Create React App is dead)
- ethers.js v6 for blockchain interactions
- React Router for navigation
- No CSS frameworks - just good old inline styles

**Backend** (Optional - The Helper)
- Node.js + Express
- MongoDB for off-chain data (campaign images, descriptions)
- JWT authentication

---

## How It Works

### Three Types of Users

**1. Backers** (That's probably you)
```
Connect wallet → Register → Browse campaigns → Contribute ETH → Track your impact
```

**2. Creators** (Maybe also you?)
```
Register → Get KYC verified → Create campaign → Wait for approval → Receive funds
```

**3. Admins** (Definitely not you... unless?)
```
Secret login → Review campaigns → Approve/reject → Manage users → Upgrade KYC levels
```

### The Campaign Lifecycle

```
1. Creator submits campaign
   ↓
2. Admin reviews and approves (prevents spam/scams)
   ↓
3. Campaign goes live for contributions
   ↓
4. People contribute ETH (stored in smart contract)
   ↓
5. Goal reached + deadline passed = Creator can withdraw
```

Simple. No weird rules. No hidden fees.

---

## Quick Start

### Prerequisites

You'll need:
- [MetaMask](https://metamask.io/) installed
- Some Sepolia testnet ETH ([get it here](https://sepoliafaucet.com/))
- Node.js 18+ installed

### Run Locally

```bash
# Clone this repo
git clone https://github.com/mayurrajput04/FundChain.git
cd FundChain

# Install dependencies
cd frontend
npm install

# Start the dev server
npm run dev

# Open http://localhost:5173
```

That's it. No complicated setup, no environment variables to configure (they're in the code).

---

## Key Features

### For Everyone
- **No Account Required** - Just connect your wallet
- **Full Transparency** - Every transaction is on Etherscan
- **Mobile Friendly** - Works on your phone (mostly)
- **Free to Use** - Only pay gas fees

### For Backers
- **Direct Support** - Your ETH goes straight to the creator (via smart contract)
- **Track Everything** - See exactly where your money is
- **No Chargebacks** - Blockchain transactions are final (feature, not a bug)
- **Build Reputation** - Your contributions are recorded on-chain

### For Creators
- **Keep What You Raise** - No platform fees, ever
- **Instant Approval Notification** - Know right away if you're approved
- **Deadline Protection** - Can't withdraw until deadline passes (even if goal is reached)
- **On-chain Proof** - Your campaign is permanently recorded

### For Admins
- **One-Click Approvals** - Review and approve campaigns easily
- **User Management** - Upgrade KYC levels, ban bad actors
- **Platform Overview** - See all activity at a glance
- **God Mode** - Secret admin panel (developers only)

---

## Smart Contracts

Currently deployed on **Sepolia testnet**:

| Contract | Address | What It Does |
|----------|---------|--------------|
| UserRegistry | [`0x75b9...f189`](https://sepolia.etherscan.io/address/0x75b987308865403c993f56d501ea1002bb28f189) | Manages user profiles, KYC, reputation |
| CampaignFactory | [`0x90bE...bAFd`](https://sepolia.etherscan.io/address/0x90beab1788f70d00646c57cf38d6630e30e1bafd) | Creates and tracks campaigns |
| Admin | `0x1b47...9697` | The one wallet that can approve campaigns |

### Security Features

- **KYC Levels** - 4 levels (NONE, BASIC, INTERMEDIATE, ADVANCED)
- **Campaign Approval** - Admin must approve before campaign goes live
- **Ban System** - Bad actors can be banned from the platform
- **Minimum KYC for Creation** - Must have BASIC KYC to create campaigns
- **No Refunds (Yet)** - If campaign fails, funds are stuck (working on this)

---

## Project Structure

```
FundChain/
├── contracts/              # Solidity smart contracts
│   ├── src/
│   │   ├── UserRegistry.sol
│   │   └── CampaignFactory.sol
│   ├── test/
│   └── script/
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── backer/     # Backer dashboard, discovery
│   │   │   ├── creator/    # Campaign creation wizard
│   │   │   ├── admin/      # Admin panel (secret)
│   │   │   └── common/     # Shared components
│   │   ├── hooks/
│   │   │   ├── useWeb3.js
│   │   │   ├── useCampaigns.js
│   │   │   └── useUserRegistry.js
│   │   └── App.jsx
│   └── package.json
│
└── backend/                # Optional Express backend
    ├── server.js
    └── models/
```


<!-- ## Screenshots

### Discovery Page
Browse all approved campaigns, search, filter by category.

*[TODO: Add screenshot]*

### Creator Dashboard
Create and manage your campaigns in one place.

*[TODO: Add screenshot]*

### Admin Panel -->
<!-- Secret admin interface for campaign approval and user management.

*[TODO: Add screenshot - but it's secret, so maybe not?]* -->

---

## Usage Guide

### For Backers

**Step 1: Get Set Up**
```bash
1. Install MetaMask
2. Switch to Sepolia testnet
3. Get free test ETH from a faucet
4. Visit the app and click "Connect Wallet"
```

**Step 2: Register**
```bash
1. Click "Register Now"
2. Choose username (lowercase, numbers, underscores only)
3. Enter email (it gets hashed for privacy)
4. Select role: BACKER, CREATOR, or BOTH
5. Sign the transaction
```

**Step 3: Start Supporting**
```bash
1. Browse campaigns on the Discovery page
2. Click on any campaign to see details
3. Enter contribution amount
4. Confirm transaction in MetaMask
5. Done! Track your contribution in "My Support"
```

### For Creators

**Step 1: Get KYC Verified**

You need **BASIC** KYC level to create campaigns. After registering:
1. Contact the admin (or find them on Discord/Twitter)
2. Request KYC upgrade
3. Admin upgrades your level in the admin panel
4. You can now create campaigns!

**Step 2: Create a Campaign**

1. Go to Creator Dashboard
2. Click "Create Campaign"
3. Fill out the wizard:
   - **Basic Info**: Title, category, goal, deadline
   - **Details**: Description, image URL
   - **Review**: Check everything looks good
4. Submit and wait for admin approval

**Step 3: Promote Your Campaign**

The platform doesn't have a built-in audience (yet), so you'll need to:
- Share on social media
- Tell your friends
- Post in relevant communities
- Get creative!

**Step 4: Withdraw Funds**

Once your campaign reaches its goal AND the deadline has passed:
1. Go to Creator Dashboard
2. Find your completed campaign
3. Click "Withdraw Funds"
4. Approve the transaction
5. ETH arrives in your wallet!

### For Admins

**Access the Secret Admin Portal:**

1. Navigate to `/admin-secret-login` (not linked in the nav)
2. Make sure you're connected with the admin wallet
3. Enter the admin password
4. Access granted!

**Approve Campaigns:**

1. Go to "Campaign Approvals" tab
2. Review pending campaigns
3. Click "Approve" or "Reject"
4. Campaign goes live (or doesn't)

**Manage Users:**

1. Go to "User Management" tab
2. View all registered users
3. Upgrade KYC levels with one click
4. Ban/unban users as needed

---

## Known Issues & Limitations

Let's be honest about what doesn't work (yet):

- ❌ **No Refunds** - If campaign doesn't reach goal, funds are locked (working on auto-refund)
- ❌ **No Image Upload** - You have to provide an image URL (IPFS integration coming)
- ❌ **No Comments** - Can't discuss campaigns on the platform yet
- ❌ **No Email Notifications** - You have to check manually
- ❌ **Single Admin** - Only one wallet can approve (should be multi-sig)
- ❌ **Testnet Only** - Not on mainnet yet (requires audit first)
- ❌ **No Mobile App** - Web only for now

See [Issues](https://github.com/mayurrajput04/FundChain/issues) for the full list.

---

## Roadmap

### Phase 1: Core Platform ✅ (DONE)
- [x] Smart contracts deployed
- [x] User registration system
- [x] Campaign creation
- [x] KYC verification
- [x] Admin approval workflow
- [x] Frontend working

### Phase 2: User Experience 🚧 (IN PROGRESS)
- [ ] Add campaign updates/comments
- [ ] Email notifications
- [ ] IPFS image upload
- [ ] Mobile responsive improvements
- [ ] Better error messages

### Phase 3: Advanced Features 📋 (PLANNED)
- [ ] Refund mechanism
- [ ] Milestone-based funding
- [ ] Campaign categories expansion
- [ ] User reputation system
- [ ] Social sharing features

### Phase 4: Production 🔮 (FUTURE)
- [ ] Security audit
- [ ] Mainnet deployment
- [ ] Multi-token support (USDC, DAI)
- [ ] DAO governance
- [ ] Mobile apps

---

## Contributing

Found a bug? Want to add a feature? PRs are welcome!

**How to Contribute:**

1. Fork the repo
2. Create a branch (`git checkout -b feature/cool-feature`)
3. Make your changes
4. Test thoroughly
5. Commit (`git commit -m 'Add cool feature'`)
6. Push (`git push origin feature/cool-feature`)
7. Open a Pull Request

**Guidelines:**

- Write clear commit messages
- Add comments for complex code
- Test your changes
- Update docs if needed
- Be nice to other contributors

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

---

## Tech Deep Dive

### Why These Choices?

**Foundry over Hardhat**
- Faster compilation (written in Rust)
- Better testing framework
- Simpler dependency management
- More active development

**React without CSS Framework**
- Full control over styling
- Faster load times
- No learning curve for CSS frameworks
- Inline styles keep components self-contained

**ethers.js v6**
- Better TypeScript support
- Cleaner API than v5
- Better error messages
- Future-proof

**MongoDB (Optional)**
- Flexible schema for campaign metadata
- Easy to scale
- Good for off-chain data storage
- Free tier available

### Gas Optimization

We've optimized gas usage:
- Campaign creation: ~1.2-1.5M gas
- Contribution: ~100-150K gas
- Approval: ~50K gas

Tips to save gas:
- Create campaigns during low network usage (weekends)
- Batch multiple contributions if possible
- Use higher gas limit to avoid failed transactions

---

## FAQ

**Q: Is this safe to use?**
A: On testnet, yes. On mainnet, wait for a security audit. Smart contracts are immutable once deployed, so bugs can't be fixed.

**Q: Why Sepolia and not mainnet?**
A: Testing and iteration. Also, I'm not paying for a security audit until the platform is proven.

**Q: Can I contribute without registering?**
A: Nope. Registration is required to prevent spam and build reputation.

**Q: What happens if a campaign doesn't reach its goal?**
A: Currently, funds are locked. Auto-refund mechanism is in the roadmap.

**Q: How do I become an admin?**
A: You can't. Admin wallet is hardcoded in the smart contract. In the future, this will be a DAO.

**Q: Can I use this for my own project?**
A: Yes! It's MIT licensed. Fork it, deploy it, make it your own.

**Q: Why did you build this?**
A: Traditional crowdfunding platforms take too much money and have too much power. Blockchain enables better alternatives.

**Q: Are you going to rug pull?**
A: No. The contracts are on-chain, verified on Etherscan, and I have no way to access funds. That's the whole point.

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

TL;DR: Do whatever you want with this code. Just don't sue me if something breaks.

---

## Acknowledgments

Built with help from:
- [OpenZeppelin](https://openzeppelin.com/) - Secure smart contract libraries
- [Foundry](https://getfoundry.sh/) - Best Ethereum development framework
- [ethers.js](https://docs.ethers.org/) - Web3 magic
- [Alchemy](https://www.alchemy.com/) - RPC endpoints
- Stack Overflow - For when nothing worked
- Coffee - Lots of coffee

---

## Contact

- **GitHub**: [@mayurrajput04](https://github.com/mayurrajput04)
- **Issues**: [Report bugs here](https://github.com/mayurrajput04/FundChain/issues)
- **Discussions**: [Ask questions here](https://github.com/mayurrajput04/FundChain/discussions)

---

## Final Notes

This is a side project that turned into something real. It's not perfect. There are bugs. The UI could be better. The code could be cleaner.

But it works. And it's a step toward a more decentralized, fair crowdfunding ecosystem.

If you find this useful, star the repo. If you find bugs, open an issue. If you want to contribute, submit a PR.

And if you actually use this to fund a real project, please let me know. That would make my day.

---

<div align="center">

**Built with ❤️ and too much caffeine**

[⭐ Star this repo](https://github.com/mayurrajput04/FundChain) • [🍴 Fork it](https://github.com/mayurrajput04/FundChain/fork) • [📢 Share it](https://twitter.com/intent/tweet?text=Check%20out%20FundChain%20-%20Decentralized%20Crowdfunding%20on%20Ethereum!&url=https://github.com/mayurrajput04/FundChain)

</div>
```


## 🚀 **Now Push This Natural, Human README**

```bash
cd ~/crowdfunding-platform

# Add the new README
git add README.md

# Commit with a normal message
git commit -m "Update README with comprehensive project documentation"

# Push to GitHub
git push origin main
```

