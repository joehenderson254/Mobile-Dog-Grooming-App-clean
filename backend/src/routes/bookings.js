const express = require('express');
const router = express.Router();
const prisma = require('../../prismaClient');
const stripe = require('../lib/stripe');

// POST /bookings  (create booking + PaymentIntent)
router.post('/', async (req, res) => {
  try {
    const { customerId, groomerId, serviceId, startTs, address, lat, lng } = req.body;
    const service = await prisma.service.findUnique({ where: { id: serviceId }});
    if (!service) return res.status(400).json({ error: 'Service not found' });

    const start = new Date(startTs);
    const end = new Date(start.getTime() + service.durationMin * 60000);

    // Create PaymentIntent (manual capture)
    const pi = await stripe.paymentIntents.create({
      amount: service.priceCents,
      currency: 'usd',
      capture_method: 'manual',
       // Explicit test config
  payment_method_types: ['card'],
  payment_method: 'pm_card_visa',
  confirm: true
    });

    const booking = await prisma.booking.create({
      data: {
        customerId, groomerId, serviceId,
        startTs: start, endTs: end,
        address, lat, lng,
        priceCents: service.priceCents,
        stripePaymentIntentId: pi.id
      }
    });

    res.json({ bookingId: booking.id, clientSecret: pi.client_secret });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /bookings/:id/status  (accept / decline)
router.patch('/:id/status', async (req, res) => {
  try {
    const { action } = req.body;
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id }});
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (!booking.stripePaymentIntentId) return res.status(400).json({ error: 'Missing PaymentIntent' });

    if (action === 'accept') {
      await stripe.paymentIntents.capture(booking.stripePaymentIntentId);
      const updated = await prisma.booking.update({ where: { id: booking.id }, data: { status: 'accepted' }});
      return res.json(updated);
    } else if (action === 'decline') {
      await stripe.paymentIntents.cancel(booking.stripePaymentIntentId);
      const updated = await prisma.booking.update({ where: { id: booking.id }, data: { status: 'declined' }});
      return res.json(updated);
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
