import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, Alert } from 'react-native';
import { API_BASE } from '../constants';

async function geocodeZip(zip: string): Promise<{ lat: number; lng: number }> {
  // TODO: replace with a real geocode call; for demo, SF-ish
  if (!zip) throw new Error('Enter a ZIP');
  return { lat: 37.78, lng: -122.41 };
}

export default function SearchScreen({ navigation }: any) {
  const [zip, setZip] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function search() {
    try {
      setLoading(true);
      const latlng = await geocodeZip(zip);
      const res = await fetch(`${API_BASE}/groomers?lat=${latlng.lat}&lng=${latlng.lng}&radiusKm=25`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResults(data);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to search');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ padding: 16 }}>
      <TextInput
        placeholder="Enter ZIP code"
        value={zip}
        onChangeText={setZip}
        style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
      />
      <TouchableOpacity onPress={search} style={{ marginTop: 12, padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1 }}>
        <Text>{loading ? 'Searching…' : 'Find Mobile Groomers'}</Text>
      </TouchableOpacity>
      <FlatList
        style={{ marginTop: 16 }}
        data={results}
        keyExtractor={(g) => g.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Booking', { groomerId: item.id })}
            style={{ padding: 14, borderWidth: 1, borderRadius: 10, marginBottom: 12 }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.name ?? 'Groomer'}</Text>
            {'distance_km' in item && (
              <Text>{Math.round(item.distance_km)} km away</Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

