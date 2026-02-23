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
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const API_URL = 'https://2c29-102-90-81-15.ngrok-free.app/api/course/all';

// Helper function to strip HTML tags from text
const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '');
};

const PopularCourses = () => {
    const navigation = useNavigation();

    const [courses, setCourses] = useState([]);
    const [courseTypes, setCourseTypes] = useState(['All']);
    const [selectedTab, setSelectedTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(API_URL);

                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }

                const json = await response.json();

                if (json.success && Array.isArray(json.courses)) {
                    const fetchedCourses = json.courses.map((course) => ({
                        ...course,
                        _id: course._id,
                        courseTitle: course.courseTitle || 'Untitled Course',
                        courseDescription: stripHtml(course.courseDescription) || 'No Description',
                        courseThumbnail: course.courseThumbnail,
                        coursePrice: course.coursePrice,
                        averageRating: course.averageRating || 0,
                        totalReviews: course.totalReviews || 0,
                        courseType: course.courseType || 'basic',
                        category: course.category || course.difficulty || 'Uncategorized',
                        // Calculate popularity score: (reviews * 2) + rating
                        popularityScore: (course.totalReviews * 2) + (course.averageRating || 0)
                    }));

                    // Sort by popularity score (highest first)
                    const sortedCourses = fetchedCourses.sort((a, b) => b.popularityScore - a.popularityScore);

                    // Extract unique categories for filter tabs
                    const typesSet = new Set(['All']);
                    sortedCourses.forEach(course => {
                        if (course.category && course.category !== 'Uncategorized') {
                            typesSet.add(course.category);
                        }
                    });

                    setCourseTypes(Array.from(typesSet));
                    setCourses(sortedCourses);
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Failed to load courses. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const filteredCourses = courses.filter((course) => {
        const matchesTab = selectedTab === 'All' || course.category === selectedTab;

        const matchesSearch = searchQuery.trim() === '' ||
            course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesTab && matchesSearch;
    });

    const handleCoursePress = (course) => {
        navigation.navigate('screen/courseDetails', { courseId: course._id });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Popular Courses</Text>
                    <View style={styles.placeholder} />
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search courses..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.tabsWrapper}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabsContent}
                    >
                        {courseTypes.map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[
                                    styles.tab,
                                    selectedTab === tab && styles.activeTab
                                ]}
                                onPress={() => setSelectedTab(tab)}
                            >
                                <Text style={[
                                    styles.tabText,
                                    selectedTab === tab && styles.activeTabText
                                ]}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#1E88FF" />
                        <Text style={styles.loadingText}>Loading popular courses...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : filteredCourses.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'No courses match your search.' : 'No courses available.'}
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {filteredCourses.map((course, index) => (
                            <TouchableOpacity
                                key={course._id}
                                style={styles.courseCard}
                                onPress={() => handleCoursePress(course)}
                            >
                                {/* Popularity Badge for Top 3 */}
                                {index < 3 && (
                                    <View style={[
                                        styles.popularBadge,
                                        index === 0 && styles.goldBadge,
                                        index === 1 && styles.silverBadge,
                                        index === 2 && styles.bronzeBadge
                                    ]}>
                                        <Text style={styles.badgeText}>#{index + 1}</Text>
                                    </View>
                                )}

                                <Image
                                    source={{ uri: course.courseThumbnail }}
                                    style={styles.courseImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.courseInfo}>
                                    <View style={styles.courseHeader}>
                                        <Text style={styles.courseCategory}>
                                            {course.category}
                                        </Text>

                                    </View>
                                    <Text style={styles.courseTitle} numberOfLines={2}>
                                        {course.courseTitle}
                                    </Text>
                                    {/* Description with HTML stripped */}
                                    <Text style={styles.courseDescription}>
                                        {course.courseDescription ? course.courseDescription.slice(0, 40) + (course.courseDescription.length > 40 ? '...' : '') : ''}
                                    </Text>

                                    <Text style={styles.coursePrice}>₦{course.coursePrice}</Text>
                                    <View style={styles.courseStats}>
                                        <Ionicons name="star" size={16} color="#FFC107" />
                                        <Text style={styles.courseRating}>
                                            {course.averageRating > 0 ? course.averageRating.toFixed(1) : 'New'}
                                        </Text>
                                        {course.totalReviews > 0 && (
                                            <>
                                                <Text style={styles.divider}>  |  </Text>
                                                <Text style={styles.courseStudents}>{course.totalReviews} Reviews</Text>
                                            </>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Complete Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('screen/home')}>
                    <Ionicons name="home-outline" size={24} color="#8E8E93" />
                    <Text style={styles.navText}>HOME</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('screen/myCourses')}>
                    <Ionicons name="book-outline" size={24} color="#8E8E93" />
                    <Text style={styles.navText}>MY COURSES</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('screen/inbox')}>
                    <Ionicons name="chatbubble-outline" size={24} color="#8E8E93" />
                    <Text style={styles.navText}>INBOX</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('screen/transactions')}>
                    <Ionicons name="wallet-outline" size={24} color="#8E8E93" />
                    <Text style={styles.navText}>HISTORY</Text>
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
    content: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: width * 0.05,
        paddingTop: height * 0.02,
        paddingBottom: height * 0.025,
    },
    backButton: { padding: 4 },
    headerTitle: {
        fontSize: width * 0.05,
        fontWeight: '700',
        color: '#1A1A1A',
        flex: 1,
        marginLeft: 12
    },
    placeholder: { width: 32 },
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
        elevation: 2
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: width * 0.04,
        color: '#1A1A1A'
    },
    tabsWrapper: { marginBottom: height * 0.02 },
    tabsContent: { paddingHorizontal: width * 0.05, flexDirection: 'row' },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#F2F2F7'
    },
    activeTab: { backgroundColor: '#1E88FF' },
    tabText: {
        color: '#8E8E93',
        fontSize: width * 0.036,
        fontWeight: '600'
    },
    activeTabText: { color: '#fff' },
    scrollView: { flex: 1 },
    scrollContent: {
        paddingHorizontal: width * 0.05,
        paddingBottom: height * 0.1
    },
    courseCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        position: 'relative'
    },
    popularBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    goldBadge: { backgroundColor: '#FFD700' },
    silverBadge: { backgroundColor: '#C0C0C0' },
    bronzeBadge: { backgroundColor: '#CD7F32' },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    courseImage: {
        width: width * 0.35,
        height: width * 0.35,
        borderRadius: 12,
        backgroundColor: '#E5E5EA'
    },
    courseInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'space-between'
    },
    courseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    courseCategory: {
        color: '#FF9500',
        fontSize: width * 0.032,
        fontWeight: '600'
    },
    courseTitle: {
        fontSize: width * 0.042,
        fontWeight: '700',
        color: '#1A1A1A',
        marginTop: 4
    },
    courseDescription: {
        fontSize: width * 0.034,
        color: '#6B7280',
        marginTop: 4,
        lineHeight: 18,
    },
    coursePrice: {
        fontSize: width * 0.045,
        color: '#1E88FF',
        fontWeight: '700',
        marginTop: 4
    },
    courseStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4
    },
    courseRating: {
        fontSize: width * 0.034,
        color: '#1A1A1A',
        marginLeft: 4,
        fontWeight: '600'
    },
    divider: {
        color: '#C7C7CC',
        fontSize: width * 0.032
    },
    courseStudents: {
        fontSize: width * 0.032,
        color: '#8E8E93'
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 8
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4
    },
    navText: {
        fontSize: 11,
        color: '#8E8E93',
        marginTop: 4,
        fontWeight: '500'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#1E88FF'
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center'
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center'
    },
});

export default PopularCourses;