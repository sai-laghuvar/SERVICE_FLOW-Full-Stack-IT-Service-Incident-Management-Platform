const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const ticketRoutes = require('./ticketRoutes');
const notificationRoutes = require('./notificationRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tickets', ticketRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'ServiceFlow IT Service & Incident Management Platform API',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
