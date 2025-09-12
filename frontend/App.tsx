import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StripeProvider } from '@stripe/stripe-react-native';
import BookingScreen from './screens/BookingScreen';
import SearchScreen from './screens/SearchScreen';
import { STRIPE_PUBLISHABLE_KEY } from './constants';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Booking" component={BookingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </StripeProvider>
  );
}

