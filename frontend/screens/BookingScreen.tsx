import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import { API_BASE, AUTH_TOKEN } from "../constants";

type Props = {
  route: { params: { groomerId: string } };
  navigation: any;
};

export default function BookingScreen({ route, navigation }: Props) {
  const { groomerId } = route.params || {};
  const { confirmPayment } = useStripe();

  const [serviceId, setServiceId] = useState<string>("");
  const [startTs, setStartTs] = useState<string>(new Date(Date.now() + 60 * 60 * 1000).toISOString()); // +1h
  const [address, setAddress] = useState<string>("123 Demo St, San Francisco, CA");
  const [lat, setLat] = useState<string>("37.78");
  const [lng, setLng] = useState<string>("-122.41");
  const [cardComplete, setCardComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleBookAndPay() {
    try {
      if (!groomerId) return Alert.alert("Missing groomer", "No groomerId provided.");
      if (!serviceId) return Alert.alert("Missing service", "Please enter a serviceId.");
      if (!startTs) return Alert.alert("Missing time", "Please enter a startTs (ISO).");
      if (!cardComplete) return Alert.alert("Card details", "Please enter complete card details.");

      setLoading(true);

      // 1) Create booking + PaymentIntent (manual capture on backend)
      const createUrl = `${API_BASE}/bookings`;
      const payload = {
        customerId: "demo-user",
        groomerId,
        serviceId,
        startTs,
        address,
        lat: Number(lat),
        lng: Number(lng),
      };

      console.log("POST", createUrl, payload);

      const createRes = await fetch(createUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("Create status:", createRes.status);
      const createJson = await createRes.json().catch(() => ({} as any));
      console.log("Create response:", createJson);

      if (!createRes.ok || !createJson?.clientSecret || !createJson?.bookingId) {
        throw new Error(`Create booking failed (${createRes.status})`);
      }

      const { clientSecret, bookingId } = createJson;

      // 2) Confirm payment — CardField supplies card details
      console.log("Confirming clientSecret:", clientSecret);
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: "Card",
        paymentMethodData: {
          // Optional billing details for test:
          billingDetails: { email: "demo@example.com" },
        },
      });

      if (error) {
        console.log("confirmPayment error:", error);
        Alert.alert("Payment error", error.message || "Payment failed");
        return;
      }

      console.log("PaymentIntent:", paymentIntent);

      // 3) (Demo) Accept/capture immediately
      const patchUrl = `${API_BASE}/bookings/${bookingId}/status`;
      console.log("PATCH", patchUrl, { action: "accept" });

      const patchRes = await fetch(patchUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
        body: JSON.stringify({ action: "accept" }),
      });

      console.log("Accept status:", patchRes.status);
      const patchJson = await patchRes.json().catch(() => ({} as any));
      console.log("Accept response:", patchJson);

      if (!patchRes.ok) throw new Error(`Accept failed (${patchRes.status})`);

      Alert.alert("Success", "Booking confirmed and payment captured!");
      navigation.goBack();
    } catch (e: any) {
      console.log("Booking flow error:", e?.message || e);
      Alert.alert("Error", e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 16, fontWeight: "600" }}>Groomer:</Text>
      <Text selectable>{groomerId ?? "(none)"}</Text>

      <Text style={{ marginTop: 8 }}>Service ID</Text>
      <TextInput
        value={serviceId}
        onChangeText={setServiceId}
        placeholder="Enter a serviceId (from seed/Prisma Studio)"
        style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
      />

      <Text style={{ marginTop: 8 }}>Start Time (ISO)</Text>
      <TextInput
        value={startTs}
        onChangeText={setStartTs}
        placeholder="YYYY-MM-DDTHH:MM:SS.sssZ"
        style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
        autoCapitalize="none"
      />

      <Text style={{ marginTop: 8 }}>Address</Text>
      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder="Service address"
        style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
      />

      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ marginTop: 8 }}>Lat</Text>
          <TextInput
            value={lat}
            onChangeText={setLat}
            placeholder="37.78"
            style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
            keyboardType="numbers-and-punctuation"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ marginTop: 8 }}>Lng</Text>
          <TextInput
            value={lng}
            onChangeText={setLng}
            placeholder="-122.41"
            style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
            keyboardType="numbers-and-punctuation"
          />
        </View>
      </View>

      {/* Stripe Card Field */}
      <Text style={{ marginTop: 8, fontWeight: "600" }}>Card</Text>
      <CardField
        postalCodeEnabled={true}
        placeholders={{ number: "4242 4242 4242 4242" }}
        onCardChange={(card) => {
          setCardComplete(card?.complete ?? false);
          console.log("Card changed:", card?.complete, card?.last4);
        }}
        style={{ width: "100%", height: 48, marginTop: 8 }}
      />

      <TouchableOpacity
        onPress={handleBookAndPay}
        style={{
          marginTop: 16,
          padding: 16,
          borderWidth: 1,
          borderRadius: 10,
          alignItems: "center",
          opacity: loading || !cardComplete ? 0.6 : 1,
        }}
        disabled={loading || !cardComplete}
      >
        <Text>{loading ? "Processing…" : "Book & Pay (test card 4242)"}</Text>
      </TouchableOpacity>

      <Text style={{ marginTop: 12, color: "#666" }}>
        Tip: Use Stripe test card <Text style={{ fontWeight: "600" }}>4242 4242 4242 4242</Text>, any
        future expiry, any CVC & ZIP.
      </Text>
    </ScrollView>
  );
}

