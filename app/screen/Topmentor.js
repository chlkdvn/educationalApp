import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const TopMentors = () => {
    const router = useRouter();

    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch all mentors
    useEffect(() => {
        const fetchMentors = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://2c29-102-90-81-15.ngrok-free.app/api/user/getAllMentors');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.success && Array.isArray(result.data)) {
                    const mappedMentors = result.data.map((mentor) => ({
                        educatorId: mentor.educatorId,
                        name: mentor.name || 'Unknown Mentor',
                        imageUrl: mentor.imageUrl || 'https://via.placeholder.com/60',
                        rating: mentor.averageRating ? mentor.averageRating.toFixed(1) : 'N/A',
                        reviews: mentor.totalReviews || 0,
                        courses: mentor.totalCourses || 0,
                        email: mentor.email,
                    }));
                    setMentors(mappedMentors);
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (err) {
                console.error('Fetch mentors error:', err);
                setError('Failed to load mentors. Please try again later.');
                setMentors([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMentors();
    }, []);

    // Filter mentors based on search query
    const filteredMentors = mentors.filter((mentor) =>
        mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Navigate to mentor details with educatorId
    const handleMentorPress = (mentor) => {
        router.push({
            pathname: '/screen/mentorDetails',
            params: {
                educatorId: mentor.educatorId,
                name: mentor.name,
                imageUrl: mentor.imageUrl,
                rating: mentor.rating,
                reviews: mentor.reviews,
                courses: mentor.courses,
                email: mentor.email,
            },
        });
    };

    const handleSearchPress = () => {
        setSearchVisible(!searchVisible);
        if (searchVisible) {
            setSearchQuery('');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Top Mentors</Text>
                <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
                    <Ionicons name={searchVisible ? "close" : "search-outline"} size={24} color="#1A1A1A" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            {searchVisible && (
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search mentors by name or email..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={20} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Loading State */}
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1E88FF" />
                    <Text style={styles.loadingText}>Loading mentors...</Text>
                </View>
            )}

            {/* Error State */}
            {error && !loading && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* Mentors List */}
            {!loading && !error && (
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {filteredMentors.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {searchQuery ? 'No mentors match your search.' : 'No mentors available yet.'}
                            </Text>
                        </View>
                    ) : (
                        filteredMentors.map((mentor) => (
                            <TouchableOpacity
                                key={mentor.educatorId}
                                style={styles.mentorCard}
                                onPress={() => handleMentorPress(mentor)}
                                activeOpacity={0.8}
                            >
                                <Image source={{ uri: mentor.imageUrl }} style={styles.mentorImage} />

                                <View style={styles.mentorInfo}>
                                    <Text style={styles.mentorName}>{mentor.name}</Text>
                                    <View style={styles.ratingRow}>
                                        <Star size={16} color="#FFB800" fill="#FFB800" />
                                        <Text style={styles.ratingText}>
                                            {mentor.rating} ({mentor.reviews} reviews)
                                        </Text>
                                    </View>
                                    <Text style={styles.coursesText}>{mentor.courses} courses</Text>
                                </View>

                                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                            </TouchableOpacity>
                        ))
                    )}
                    <View style={styles.bottomSpace} />
                </ScrollView>
            )}

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="home" size={22} color="#1E88FF" />
                    <Text style={[styles.navLabel, { color: '#1E88FF' }]}>HOME</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/screen/myCourses')}>
                    <Ionicons name="book-outline" size={22} color="#8E8E93" />
                    <Text style={styles.navLabel}>MY COURSES</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/screen/inbox')}>
                    <Ionicons name="chatbubble-outline" size={22} color="#8E8E93" />
                    <Text style={styles.navLabel}>INBOX</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/screen/transactions')}>
                    <Ionicons name="wallet-outline" size={22} color="#8E8E93" />
                    <Text style={styles.navLabel}>HISTORY</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/screen/profile')}>
                    <Ionicons name="person-outline" size={22} color="#8E8E93" />
                    <Text style={styles.navLabel}>PROFILE</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: width * 0.05,
        paddingTop: height * 0.015, // moved up more
        paddingBottom: height * 0.015,
        backgroundColor: '#F8F9FA',
    },

    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: width * 0.05,
        fontWeight: '700',
        color: '#1A1A1A',
        flex: 1,
        textAlign: 'center',
        marginRight: 40,
    },
    searchButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: width * 0.05,
        marginBottom: height * 0.02,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: width * 0.04,
        color: '#1A1A1A',
    },
    clearButton: {
        padding: 4,
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#1E88FF',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    mentorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: width * 0.05,
        marginBottom: height * 0.015,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        justifyContent: 'space-between',
    },
    mentorImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E5E5EA',
    },
    mentorInfo: {
        marginLeft: 16,
        flex: 1,
    },
    mentorName: {
        fontSize: width * 0.042,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    ratingText: {
        fontSize: width * 0.036,
        color: '#1A1A1A',
        fontWeight: '600',
        marginLeft: 6,
    },
    coursesText: {
        fontSize: width * 0.036,
        color: '#8E8E93',
        fontWeight: '500',
    },
    bottomSpace: {
        height: height * 0.02,
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#1E88FF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 5,
    },
    navItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
    navLabel: { fontSize: 11, marginTop: 4, color: '#8E8E93', fontWeight: '500' },
});

export default TopMentors;
