import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const PaymentOption = () => {
    const router = useRouter();
    const paymentMethods = [
        { id: 1, type: 'paypal', label: 'PayPal', connected: true },
        { id: 2, type: 'google', label: 'Google Pay', connected: true },
        { id: 3, type: 'apple', label: 'Apple Pay', connected: true },
        { id: 4, type: 'card', label: '**** **** **** 3054', connected: true, isCard: true },
    ];


    const handleAddNewCard = () => {
        router.push("/screen/Addnewcard")
    }
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment Option</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Payment Methods List */}
                <View style={styles.paymentList}>
                    {paymentMethods.map((method, index) => (
                        <View
                            key={method.id}
                            style={[
                                styles.paymentCard,
                                index === paymentMethods.length - 1 && styles.lastCard
                            ]}
                        >
                            <View style={styles.paymentLeft}>
                                <View style={styles.iconPlaceholder}>
                                    {method.type === 'paypal' && (
                                        <Text style={styles.iconText}>P</Text>
                                    )}
                                    {method.type === 'google' && (
                                        <Text style={styles.iconText}>G</Text>
                                    )}
                                    {method.type === 'apple' && (
                                        <Feather name="smartphone" size={24} color="#000" />
                                    )}
                                    {method.type === 'card' && (
                                        <Feather name="credit-card" size={24} color="#000" />
                                    )}
                                </View>
                                <Text style={styles.paymentLabel}>{method.label}</Text>
                            </View>
                            <Text style={styles.connectedText}>Connected</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Add New Card Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.addButton} onPress={handleAddNewCard}>
                    <Text style={styles.addButtonText}>Add New Card</Text>
                    <View style={styles.arrowCircle}>
                        <Feather name="arrow-right" size={20} color="#FFF" />
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 40,
        paddingVertical: 16,
        backgroundColor: '#F9FAFB',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        flex: 1,
        marginLeft: 8,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingTop: 8,
    },
    paymentList: {
        paddingHorizontal: 16,
    },
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    lastCard: {
        marginBottom: 24,
    },
    paymentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    iconText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    paymentLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: '#000',
    },
    connectedText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#00BFA6',
    },
    buttonContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#F9FAFB',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
        borderRadius: 30,
        paddingVertical: 16,
        position: 'relative',
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    arrowCircle: {
        position: 'absolute',
        right: 6,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#0051D5',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PaymentOption;