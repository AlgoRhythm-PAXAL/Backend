const express = require("express");
const router = express.Router();
const {authenticateStaff} = require("../../middleware/adminMiddleware/authMiddleware");
const { viewAllPickupParcels, getQRandTrackingNumberForPickup, getPickupStats } = require("../../controllers/staff/pickupController");

// get all pickup requests 
router.get('/get-all-pickup-parcels', authenticateStaff, viewAllPickupParcels);

// update the pickup after assigning a driver
router.post('/register-pickup', authenticateStaff, getQRandTrackingNumberForPickup);

// Get pickup requests count for today
router.get('/get-pickup-stats', authenticateStaff, getPickupStats)

module.exports  = router;