const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');

// POST /api/portal/:token/approve
router.post('/:token/approve', async (req, res) => {
  try {
    const { token } = req.params;
    console.log('🔍 Processing approval for portal token:', token);

    // Find proposal by portal token
    const proposal = await prisma.proposal.findFirst({
      where: { portalToken: token }
    });

    if (!proposal) {
      console.error('❌ No proposal found for token:', token);
      return res.status(404).json({ error: 'Invalid portal token' });
    }

    // Update proposal status with ONLY the correct fields
    const updatedProposal = await prisma.proposal.update({
      where: { id: proposal.id },
      data: {
        clientStatus: 'APPROVED',
        approvedAt: new Date()
      }
    });

    console.log('✅ Proposal approved successfully:', proposal.id);
    res.json({
      success: true,
      message: 'Proposal approved successfully',
      proposal: updatedProposal
    });

  } catch (error) {
    console.error('❌ Error processing approval:', error);
    res.status(500).json({ 
      error: 'Failed to process approval',
      details: error.message 
    });
  }
});

module.exports = router; 