import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get("window");
const backendUrl = 'https://2c29-102-90-81-15.ngrok-free.app';

const Transactions = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const pathname = usePathname();

  // Auth state - replaced Clerk with local state
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check auth status
  const checkAuthStatus = async () => {
    try {
      setIsLoadingAuth(true);
      const storedUser = await AsyncStorage.getItem('user');

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        try {
          const { data } = await axios.get(`${backendUrl}/api/user/me`, {
            withCredentials: true
          });
          if (data.success && data.data) {
            setUser(data.data);
            await AsyncStorage.setItem('user', JSON.stringify(data.data));
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Auth fetch error:', error);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/getMyTransactions`, {
        withCredentials: true
      });
      if (data.success) setTransactions(data.transactions || []);
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  // --- DYNAMIC CALCULATION ---
  const totalInvested = useMemo(() => {
    return transactions.reduce((sum, item) => {
      const val = parseFloat(item.amount) || 0;
      return sum + val;
    }, 0);
  }, [transactions]);

  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalInvested);

  const renderTransactionItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardRow}>
        <Image
          source={{ uri: item.course?.thumbnail || "https://via.placeholder.com/150" }}
          style={styles.courseImage}
        />
        <View style={styles.cardContent}>
          <Text style={styles.courseTitle} numberOfLines={1}>
            {item.course?.title || "Course Purchase"}
          </Text>
          <Text style={styles.dateText}>Oct 24, 2023 • {item.course?.difficulty || 'General'}</Text>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.amountText}>${parseFloat(item.amount).toFixed(2) || '0.00'}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'completed' ? '#ECFDF5' : '#FEF3C7' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: item.status === 'completed' ? '#059669' : '#D97706' }
            ]}>
              {item.status === 'completed' ? 'Success' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Show loading while checking auth
  if (isLoadingAuth) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1E88FF" />
      </SafeAreaView>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="log-in-outline" size={60} color="#999" />
        <Text style={{ fontSize: 16, color: '#666', marginTop: 20 }}>Please sign in to view transactions</Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#1E88FF', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, marginTop: 20 }}
          onPress={() => router.push('/')}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Go to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Billing History</Text>
        <TouchableOpacity style={styles.iconCircle}>
          <Ionicons name="download-outline" size={20} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* --- DYNAMIC SUMMARY CARD --- */}
      {!loading && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Invested</Text>
          <Text style={styles.summaryAmount}>{formattedTotal}</Text>
          <View style={styles.summaryFooter}>
            <Text style={styles.summarySubtext}>
              {transactions.length} Total {transactions.length === 1 ? 'Transaction' : 'Transactions'}
            </Text>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#1E88FF" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.purchaseId}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={60} color="#E5E7EB" />
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          }
        />
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/screen/home')}
        >
          <Ionicons
            name="home"
            size={22}
            color={pathname === '/screen/home' ? '#1E88FF' : '#8E8E93'}
          />
          <Text
            style={[
              styles.navLabel,
              { color: pathname === '/screen/home' ? '#1E88FF' : '#8E8E93' },
            ]}
          >
            HOME
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/screen/myCourses')}
        >
          <Ionicons
            name="book-outline"
            size={22}
            color={pathname === '/screen/myCourses' ? '#1E88FF' : '#8E8E93'}
          />
          <Text
            style={[
              styles.navLabel,
              { color: pathname === '/screen/myCourses' ? '#1E88FF' : '#8E8E93' },
            ]}
          >
            MY COURSES
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/screen/inbox')}
        >
          <Ionicons
            name="chatbubble-outline"
            size={22}
            color={pathname === '/screen/inbox' ? '#1E88FF' : '#8E8E93'}
          />
          <Text
            style={[
              styles.navLabel,
              { color: pathname === '/screen/inbox' ? '#1E88FF' : '#8E8E93' },
            ]}
          >
            INBOX
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/screen/transactions')}
        >
          <Ionicons
            name="wallet-outline"
            size={22}
            color={pathname === '/screen/transactions' ? '#1E88FF' : '#8E8E93'}
          />
          <Text
            style={[
              styles.navLabel,
              { color: pathname === '/screen/transactions' ? '#1E88FF' : '#8E8E93' },
            ]}
          >
            HISTORY
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/screen/profile')}
        >
          <Ionicons
            name="person-outline"
            size={22}
            color={pathname === '/screen/profile' ? '#1E88FF' : '#8E8E93'}
          />
          <Text
            style={[
              styles.navLabel,
              { color: pathname === '/screen/profile' ? '#1E88FF' : '#8E8E93' },
            ]}
          >
            PROFILE
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop:40,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  summaryCard: {
    margin: 20,
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#1E88FF',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  summaryLabel: { color: '#fff', fontSize: 14, fontWeight: '500' },
  summaryAmount: { color: '#fff', fontSize: 32, fontWeight: '800', marginVertical: 8 },
  summarySubtext: { color: '#fff', fontSize: 12 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  courseImage: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#F3F4F6' },
  cardContent: { flex: 1, marginLeft: 15 },
  courseTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  dateText: { fontSize: 12, color: '#6B7280' },
  rightContent: { alignItems: 'flex-end' },
  amountText: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#9CA3AF', marginTop: 10, fontSize: 16 },
  bottomNav: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 10,
  },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  navLabel: { fontSize: 11, marginTop: 4, color: '#8E8E93', fontWeight: '500' },
});

export default Transactions;