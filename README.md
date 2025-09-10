# Concrete TODOs (file-by-file)

**Backend**

* `src/routes/bookings.js`

  * [ ] Add `PATCH /bookings/:id/status` to accept/decline.
  * [ ] On accept: `stripe.paymentIntents.capture(booking.stripePaymentIntentId)`.
* `src/server.js`

  * [ ] Add `/stripe/webhook` (use raw body parsing for signature verification) to sync booking/payment states.
* `src/routes/groomers.js`

  * [ ] Add `GET /groomers/:id/slots` to compute availability.
* `prisma/schema.prisma`

  * [ ] Add `stripeAccountId` to a `PayoutAccount` or to `Groomer`.
  * [ ] Add `status` enum for bookings.
* [ ] Add basic auth middleware (JWT/Clerk/Firebase) and use it on `POST /bookings`, `PATCH /bookings/:id/status`.

**App (Expo)**

* `BookingScreen.js`

  * [ ] Wrap app with `<StripeProvider publishableKey=...>` and call `confirmPayment(clientSecret, { paymentMethodType: 'Card' })`.
  * [ ] Navigate to a **BookingConfirmed** screen on success.
* `GroomerScreen.js`

  * [ ] Add slot picker fed by `/groomers/:id/slots`.
* [ ] Add a minimal **GroomerPortal** web page (could be a separate small React app) for Accept/Decline.
