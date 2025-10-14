const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for demo (use database in production)
let campaigns = [];
let users = [];

// Routes
app.get('/api/campaigns', (req, res) => {
  res.json(campaigns);
});

app.post('/api/campaigns', (req, res) => {
  const campaign = {
    id: campaigns.length + 1,
    ...req.body,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  campaigns.push(campaign);
  res.json(campaign);
});

app.put('/api/campaigns/:id/approve', (req, res) => {
  const campaign = campaigns.find(c => c.id == req.params.id);
  if (campaign) {
    campaign.status = 'approved';
    campaign.approvedAt = new Date().toISOString();
    res.json(campaign);
  } else {
    res.status(404).json({ error: 'Campaign not found' });
  }
});

app.put('/api/campaigns/:id/reject', (req, res) => {
  const campaign = campaigns.find(c => c.id == req.params.id);
  if (campaign) {
    campaign.status = 'rejected';
    campaign.rejectionReason = req.body.reason;
    res.json(campaign);
  } else {
    res.status(404).json({ error: 'Campaign not found' });
  }
});

app.get('/api/users/:address', (req, res) => {
  const user = users.find(u => u.address === req.params.address);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/api/users', (req, res) => {
  const user = {
    ...req.body,
    createdAt: new Date().toISOString()
  };
  users.push(user);
  res.json(user);
});

app.get('/api/stats', (req, res) => {
  const stats = {
    totalCampaigns: campaigns.length,
    totalRaised: campaigns.reduce((sum, c) => sum + (parseFloat(c.raised) || 0), 0),
    totalBackers: campaigns.reduce((sum, c) => sum + (c.backers || 0), 0),
    pendingApprovals: campaigns.filter(c => c.status === 'pending').length
  };
  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});