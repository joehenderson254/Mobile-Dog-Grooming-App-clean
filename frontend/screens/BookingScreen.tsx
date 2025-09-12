import React, { useState } from 'react';
import { View, Text, Button, Alert, ActivityIndicator } from 'react-native';
import { CardField, useConfirmPayment } from '@stripe/stripe-react-native';
import { API_BASE } from '../constants';

const TOKEN = 'PASTE_YOUR_JWT_HERE'; // use the one you generated

export default function BookingScreen({ route }: any) {
  const { confirmPayment, loading } = useConfirmPayment();
  const [cardComplete, setCardComplete] = useState(false);

  // You could pass these via route.params from Search → Groomer → Booking.
  // For now, demo hardcodes (swap with your real IDs if needed).
  const customerId = 'demo-customer';
  const groomerId  = route?.params?.groomerId ?? 'cmfh8o3lh0002oei97z3xtdgj';
  const serviceId  = route?.params?.serviceId ?? 'cmfh8o3ll0004oei99ucvj5n4';
  const startTs    = '2025-09-25T18:00:00.000Z';
  const address    = '123 Demo St';
  const lat        = 37.78;
  const lng        = -122.41;

  const onPay = async () => {
    try {
      // 1) Create booking to get clientSecret
      const resp = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
          customerId, groomerId, serviceId,
          startTs, address, lat, lng,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `Backend error (${resp.status})`);
      }
      const { bookingId, clientSecret } = await resp.json();

      // 2) Confirm on device (manual capture)
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        Alert.alert('Payment failed', error.message);
        return;
      }

      // 3) (Demo) Immediately capture (groomer portal would do this in real life)
      const accept = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ action: 'accept' }),
      });

      if (!accept.ok) {
        const e = await accept.json().catch(() => ({}));
        throw new Error(e.error || `Accept failed (${accept.status})`);
      }

      Alert.alert('Success', `Booking confirmed! PI: ${paymentIntent?.id}\nStatus will flip to completed via webhook.`);
      // navigation.navigate('BookingConfirmed', { bookingId });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Unknown error');
    }
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Enter card</Text>
      <CardField
        postalCodeEnabled={false}
        onCardChange={(d) => setCardComplete(!!d.complete)}
        style={{ height: 48 }}
      />
      <Button title={loading ? 'Processing…' : 'Book & Pay'} onPress={onPay} disabled={!cardComplete || loading} />
      {loading && <ActivityIndicator />}
    </View>
  );
}

