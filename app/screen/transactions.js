import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get("window");

const Transactions = () => {
    const navigation = useNavigation();
    const { getToken } = useAuth();

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetchTransactions();
        console.log("Fetching transactions...",);
    }, []);

    const fetchTransactions = async () => {
        try {
            const token = await getToken();
            console.log("Auth Token:", token);
            const res = await fetch(
                "https://educations.onrender.com/api/user/getMyTransactions",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await res.json();

            if (data.success) {
                setTransactions(data.transactions);
            }
        } catch (error) {
            console.log("Transaction fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transactions</Text>
                <TouchableOpacity style={styles.searchButton}>
                    <Ionicons name="search-outline" size={24} color="#1A1A1A" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.transactionsList}>

                    {loading && (
                        <ActivityIndicator size="large" color="#1E88FF" />
                    )}

                    {!loading && transactions.map((transaction) => (
                        <View key={transaction.purchaseId} style={styles.transactionCard}>
                            <View style={styles.transactionImage}>
                                <Image
                                    source={{
                                        uri: transaction.course?.thumbnail ||
                                            "https://via.placeholder.com/150"
                                    }}
                                    style={styles.courseImage}
                                />
                            </View>

                            <View style={styles.transactionContent}>
                                <Text style={styles.transactionTitle}>
                                    {transaction.course?.title || "Course unavailable"}
                                </Text>

                                <Text style={styles.transactionCategory}>
                                    {transaction.course?.difficulty || "Course"}
                                </Text>

                                <TouchableOpacity style={styles.statusButton}>
                                    <Text style={styles.statusButtonText}>
                                        {transaction.status === "completed" ? "Paid" : transaction.status}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    {!loading && transactions.length === 0 && (
                        <Text style={{ textAlign: "center", marginTop: 40, color: "#8E8E93" }}>
                            No transactions yet
                        </Text>
                    )}

                </View>

                <View style={styles.bottomSpace} />
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('screen/home')}>
                    <Ionicons name="home-outline" size={24} color="#8E8E93" />
                    <Text style={styles.navText}>HOME</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('screen/myCourses')}>
                    <Ionicons name="folder-outline" size={24} color="#8E8E93" />
                    <Text style={styles.navText}>MY COURSES</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('screen/inbox')}>
                    <Ionicons name="chatbubble-outline" size={22} color="#8E8E93" />
                    <Text style={styles.navLabel}>INBOX</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="swap-horizontal" size={24} color="#1E88FF" />
                    <Text style={[styles.navText, styles.activeNavText]}>TRANSACTION</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('screen/profile')}>
                    <Ionicons name="person-outline" size={24} color="#8E8E93" />
                    <Text style={styles.navText}>PROFILE</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: width * 0.05,
        paddingTop: height * 0.05,
        paddingBottom: height * 0.015,
    },
    backButton: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: width * 0.045, fontWeight: '600', flex: 1 },
    searchButton: { width: 40, height: 40, justifyContent: 'center' },
    scrollView: { flex: 1 },
    transactionsList: { paddingHorizontal: width * 0.05, paddingTop: height * 0.02 },
    transactionCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        elevation: 2,
    },
    transactionImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        overflow: 'hidden',
    },
    courseImage: { width: '100%', height: '100%' },
    transactionContent: { flex: 1, marginLeft: 12 },
    transactionTitle: { fontSize: width * 0.04, fontWeight: '600' },
    transactionCategory: { fontSize: width * 0.032, color: '#8E8E93' },
    statusButton: {
        backgroundColor: '#1E88FF',
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginTop: 6,
    },
    statusButtonText: { color: '#fff', fontWeight: '600' },
    bottomSpace: { height: height * 0.02 },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    navItem: { flex: 1, alignItems: 'center' },
    navText: { fontSize: width * 0.024, marginTop: 4, color: '#8E8E93' },
    activeNavText: { color: '#1E88FF' },
});

export default Transactions;