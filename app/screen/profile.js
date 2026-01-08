import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const Profile = () => {
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const { signOut } = useAuth();

    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        setLoggingOut(true);
                        try {
                            await signOut();
                            router.replace('/');
                        } catch (err) {
                            console.error('Logout error:', err);
                            Alert.alert('Error', 'Failed to log out. Please try again.');
                        } finally {
                            setLoggingOut(false);
                        }
                    },
                },
            ]
        );
    };

    const handleComingSoon = (title) => {
        Alert.alert(
            'Coming Soon',
            `${title} feature will be available soon!`,
            [{ text: 'OK' }]
        );
    };

    const menuItems = [
        { id: 1, icon: 'shield-checkmark-outline', title: 'Security', isComingSoon: true },
        { id: 2, icon: 'moon-outline', title: 'Dark Mode', isComingSoon: true },
        { id: 3, icon: 'document-text-outline', title: 'Terms & Conditions', route: '/screen/Term' },
        { id: 4, icon: 'help-circle-outline', title: 'Help Center', route: '/screen/helpCenter' },
        { id: 5, icon: 'people-outline', title: 'Invite Friends', isComingSoon: true },
    ];

    if (!isLoaded) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00BFA6" />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.profileImageContainer}>
                        <View style={styles.avatarBorder}>
                            <Image
                                source={{
                                    uri:
                                        user?.imageUrl ||
                                        user?.profileImageUrl ||
                                        `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=00BFA6&color=fff`,
                                }}
                                style={styles.avatar}
                                resizeMode="cover"
                            />
                        </View>
                    </View>

                    <Text style={styles.profileName}>
                        {user?.firstName
                            ? `${user.firstName} ${user?.lastName || ''}`.trim()
                            : user?.fullName || 'User'}
                    </Text>

                    <Text style={styles.profileEmail}>
                        {user?.primaryEmailAddress?.emailAddress || 'No email'}
                    </Text>
                </View>

                {/* Menu List */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.menuItem,
                                index === menuItems.length - 1 && styles.lastMenuItem
                            ]}
                            onPress={() => {
                                if (item.isComingSoon) {
                                    handleComingSoon(item.title);
                                } else if (item.route) {
                                    router.push(item.route);
                                }
                            }}
                        >
                            <View style={styles.menuLeft}>
                                <Ionicons name={item.icon} size={22} color="#000" />
                                <Text style={styles.menuTitle}>{item.title}</Text>
                            </View>
                            <View style={styles.menuRight}>
                                {item.isComingSoon && (
                                    <Text style={styles.comingSoonBadge}>Soon</Text>
                                )}
                                <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    disabled={loggingOut}
                >
                    {loggingOut ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <>
                            <Ionicons name="log-out-outline" size={22} color="#FFF" />
                            <Text style={styles.logoutText}>Logout</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={styles.bottomSpace} />
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push('/screen/home')}
                >
                    <Ionicons name="home-outline" size={24} color="#9CA3AF" />
                    <Text style={styles.navText}>HOME</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push('/screen/myCourses')}
                >
                    <Ionicons name="book-outline" size={24} color="#9CA3AF" />
                    <Text style={styles.navText}>MY COURSES</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push('/screen/inbox')}
                >
                    <Ionicons name="chatbubble-outline" size={24} color="#9CA3AF" />
                    <Text style={styles.navText}>INBOX</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push('/screen/transactions')}
                >
                    <Ionicons name="wallet-outline" size={24} color="#9CA3AF" />
                    <Text style={styles.navText}>TRANSACTION</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="person" size={24} color="#00BFA6" />
                    <Text style={[styles.navText, styles.activeNavText]}>PROFILE</Text>
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
    scrollView: {
        flex: 1,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarBorder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#00BFA6',
        padding: 3,
        backgroundColor: '#FFF',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 45,
    },
    profileName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: '#6B7280',
    },
    menuContainer: {
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginTop: 24,
        borderRadius: 16,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    lastMenuItem: {
        borderBottomWidth: 0,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuTitle: {
        fontSize: 15,
        color: '#000',
        marginLeft: 12,
        fontWeight: '500',
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    comingSoonBadge: {
        fontSize: 11,
        color: '#00BFA6',
        backgroundColor: '#E0F7F4',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        fontWeight: '600',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EF4444',
        marginHorizontal: 16,
        marginTop: 24,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    bottomSpace: {
        height: 24,
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    navText: {
        fontSize: 10,
        marginTop: 4,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    activeNavText: {
        color: '#00BFA6',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
});

export default Profile;