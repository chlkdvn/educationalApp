import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Animated, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Payment = () => {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Get course details from params or use defaults
    const {
        courseTitle = 'Graphic Design Course',
        courseType = 'Graphic Design',
        coursePrice = '55',
        courseThumbnail = null,
    } = params;

    const [selectedPayment, setSelectedPayment] = useState('card');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [scaleAnim] = useState(new Animated.Value(0));

    const paymentMethods = [
        { id: 'paypal', label: 'Paypal' },
        { id: 'googlepay', label: 'Google Pay' },
        { id: 'applepay', label: 'Apple Pay' },
        { id: 'card', label: '**** **** **76 3054' }
    ];

    const handleEnrollCourse = () => {
        setShowSuccessModal(true);
        // Animate the modal
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const handleWatchCourse = () => {
        setShowSuccessModal(false);
        scaleAnim.setValue(0);
        router.push('/screen/myCourses');
    };

    const handleViewReceipt = () => {
        setShowSuccessModal(false);
        scaleAnim.setValue(0);
        // In a real app, navigate to receipt screen
        router.push('/screen/Erecept');
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                    <Text style={styles.headerText}>Payment</Text>
                </TouchableOpacity>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>428 × 44</Text>
                </View>
            </View>

            <ScrollView style={styles.content}>
                {/* Course Card */}
                <View style={styles.card}>
                    {courseThumbnail ? (
                        <Image
                            source={{ uri: courseThumbnail }}
                            style={styles.cardImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.cardImagePlaceholder} />
                    )}
                    <View style={styles.cardContent}>
                        <Text style={styles.cardLabel}>{courseType}</Text>
                        <Text style={styles.cardTitle} numberOfLines={2}>
                            {courseTitle.length > 25 ? courseTitle.substring(0, 25) + '..' : courseTitle}
                        </Text>
                    </View>
                </View>

                {/* Payment Methods Section */}
                <Text style={styles.sectionTitle}>Select the Payment Methods you Want to Use</Text>

                <View style={styles.paymentMethodsContainer}>
                    {paymentMethods.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={styles.paymentMethod}
                            onPress={() => setSelectedPayment(method.id)}
                        >
                            <Text style={styles.paymentMethodText}>{method.label}</Text>
                            <View style={[
                                styles.radio,
                                selectedPayment === method.id && styles.radioActive
                            ]}>
                                {selectedPayment === method.id && <View style={styles.radioSelected} />}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Add Button */}
                <TouchableOpacity style={styles.addButton}>
                    <Ionicons name="add" size={28} color="#fff" />
                </TouchableOpacity>
            </ScrollView>

            {/* Enroll Button */}
            <TouchableOpacity style={styles.enrollButton} onPress={handleEnrollCourse}>
                <Text style={styles.enrollButtonText}>Enroll Course - ₦{coursePrice}</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>

            {/* Success Modal */}
            <Modal
                transparent
                visible={showSuccessModal}
                animationType="fade"
                onRequestClose={() => setShowSuccessModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <Animated.View
                        style={[
                            styles.successModal,
                            {
                                transform: [{ scale: scaleAnim }]
                            }
                        ]}
                    >
                        {/* Decorative elements */}
                        <View style={[styles.decorCircle, { top: 20, left: 20, backgroundColor: '#FF6B6B' }]} />
                        <View style={[styles.decorCircle, { top: 40, right: 30, backgroundColor: '#FFA500' }]} />
                        <View style={[styles.decorCircle, { bottom: 60, left: 40, backgroundColor: '#4CAF50' }]} />
                        <View style={[styles.decorStar, { top: 50, left: 50 }]}>
                            <Ionicons name="star" size={20} color="#FFD700" />
                        </View>
                        <View style={[styles.decorStar, { top: 30, right: 50 }]}>
                            <Ionicons name="star" size={16} color="#FFA500" />
                        </View>
                        <View style={[styles.decorStar, { bottom: 80, right: 40 }]}>
                            <Ionicons name="star" size={18} color="#FFD700" />
                        </View>
                        <View style={[styles.decorTriangle, { bottom: 100, left: 30 }]} />

                        {/* Success Icon */}
                        <View style={styles.successIcon}>
                            <View style={styles.successIconInner}>
                                <Ionicons name="shield-checkmark" size={40} color="#00C853" />
                            </View>
                        </View>

                        {/* Stars */}
                        <View style={styles.starsContainer}>
                            <Ionicons name="star" size={32} color="#FFD700" />
                            <Ionicons name="star" size={32} color="#FFD700" />
                            <Ionicons name="star" size={32} color="#FFD700" />
                        </View>

                        {/* Text Content */}
                        <Text style={styles.successTitle}>Congratulations</Text>
                        <Text style={styles.successMessage}>
                            Your Payment is Successfully. Purchase a{'\n'}New Course
                        </Text>

                        {/* Buttons */}
                        <TouchableOpacity style={styles.watchButton} onPress={handleWatchCourse}>
                            <Text style={styles.watchButtonText}>Watch the Course</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.receiptButton} onPress={handleViewReceipt}>
                            <Text style={styles.receiptButtonText}>E - Receipt</Text>
                            <View style={styles.arrowCircle}>
                                <Ionicons name="arrow-forward" size={16} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 20,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    badge: {
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    cardImagePlaceholder: {
        width: 60,
        height: 60,
        backgroundColor: '#000',
        borderRadius: 8,
    },
    cardContent: {
        marginLeft: 16,
        justifyContent: 'center',
        flex: 1,
    },
    cardLabel: {
        color: '#FF6B35',
        fontSize: 12,
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    sectionTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    paymentMethodsContainer: {
        gap: 12,
    },
    paymentMethod: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    paymentMethodText: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioActive: {
        borderColor: '#2196F3',
    },
    radioSelected: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#2196F3',
    },
    addButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#2196F3',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 32,
        marginBottom: 100,
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    enrollButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2196F3',
        marginHorizontal: 20,
        marginBottom: 30,
        paddingVertical: 18,
        borderRadius: 30,
        gap: 8,
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    enrollButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    successModal: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 32,
        width: '90%',
        maxWidth: 360,
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    decorCircle: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    decorStar: {
        position: 'absolute',
    },
    decorTriangle: {
        position: 'absolute',
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 14,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#4CAF50',
        transform: [{ rotate: '180deg' }],
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    successIconInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#C8E6C9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    successMessage: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 32,
    },
    watchButton: {
        width: '100%',
        paddingVertical: 14,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    watchButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    receiptButton: {
        width: '100%',
        paddingVertical: 16,
        backgroundColor: '#2196F3',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    receiptButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    arrowCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Payment;