const express = require('express');
const router = express.Router();
const prisma = require('../../prismaClient');

// GET /groomers?lat=&lng=&radiusKm=
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radiusKm = 50 } = req.query;
    // For MVP, return all with basic include; you can add distance filtering later
    const groomers = await prisma.groomer.findMany({
      include: { user: true, Services: true },
      take: 100
    });
    res.json(groomers);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /groomers/:id
router.get('/:id', async (req, res) => {
  try {
    const g = await prisma.groomer.findUnique({
      where: { id: req.params.id },
      include: { user: true, Services: true }
    });
    if (!g) return res.status(404).json({ error: 'Not found' });
    res.json(g);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
