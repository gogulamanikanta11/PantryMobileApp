import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../backend/firebase/config';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function PantryScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'pantry'));
      const data: any[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Remove Item', `Delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteDoc(doc(db, 'pantry', id));
          loadItems();
      }}
    ]);
  };

  const handleShare = (name: string) => {
    Alert.alert('Community Share', `Would you like to list ${name} for neighbors or donate it to a local food bank?`, [
      { text: 'Neighbors' },
      { text: 'Food Bank' },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const getStatusColor = (stock: number) => {
    if (stock <= 1) return '#EF4444';
    if (stock <= 3) return '#F59E0B';
    return '#10B981';
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>My Pantry</Text>
        <TouchableOpacity onPress={loadItems}>
          <Ionicons name="refresh" size={24} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} testID="items-list" showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 50 }} />
        ) : (
          items.map((item, index) => (
            <View key={item.id} style={styles.glassCard} testID={`pantry-item-${index}`}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName} testID={`item-name-${index}`}>{item.name}</Text>
                  <Text style={styles.expiryDate}>Expires: {item.expiry || 'N/A'}</Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => handleShare(item.name)}>
                    <Ionicons name="share-social" size={20} color="#3B82F6" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id, item.name)}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.stockSection}>
                <View style={styles.stockLabelRow}>
                  <Text style={styles.stockLabel}>Stock Level</Text>
                  <Text style={[styles.stockValue, { color: getStatusColor(parseInt(item.stock)) }]}>
                    {item.stock} units
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min((parseInt(item.stock) / 10) * 100, 100)}%`, backgroundColor: getStatusColor(parseInt(item.stock)) }
                    ]}
                  />
                </View>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/additem')} testID="add-button">
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  glassCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  actionRow: { flexDirection: 'row' },
  iconBtn: { marginLeft: 15, padding: 5 },
  itemName: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  expiryDate: { color: '#94A3B8', fontSize: 13, marginTop: 4 },
  stockSection: { marginTop: 15 },
  stockLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  stockLabel: { color: '#94A3B8', fontSize: 12 },
  stockValue: { fontSize: 12, fontWeight: 'bold' },
  progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 },
  progressFill: { height: '100%', borderRadius: 3 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', elevation: 5 }
});
