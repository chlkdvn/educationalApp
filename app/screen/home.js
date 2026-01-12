import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Bell, Bookmark, Search, Sliders, Star } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const Home = () => {
    const router = useRouter();
    const { user, isLoaded: isUserLoaded } = useUser();

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedCourseType, setSelectedCourseType] = useState('All');

    const [courses, setCourses] = useState([]);
    const [educators, setEducators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingEducators, setLoadingEducators] = useState(true);
    const [error, setError] = useState(null);

    // Extract unique categories from courses + add "All"
    const categories = useMemo(() => {
        if (courses.length === 0) return ['All'];

        const uniqueCats = new Set();
        courses.forEach((course) => {
            if (course.category && course.category !== 'Uncategorized') {
                uniqueCats.add(course.category);
            }
        });

        return ['All', ...Array.from(uniqueCats).sort()];
    }, [courses]);

    // Extract unique course types for popular courses filter
    const courseTypes = useMemo(() => {
        if (courses.length === 0) return ['All'];

        const uniqueTypes = new Set();
        courses.forEach((course) => {
            if (course.category && course.category !== 'Uncategorized') {
                uniqueTypes.add(course.category);
            }
        });

        return ['All', ...Array.from(uniqueTypes).sort()];
    }, [courses]);

    // Filtered courses based on selected category (for Categories section)
    const filteredCourses = useMemo(() => {
        if (selectedCategory === 'All') return courses;
        return courses.filter((course) => course.category === selectedCategory);
    }, [courses, selectedCategory]);

    // Popular courses: sorted by popularity score (ratings count + average rating)
    const popularCourses = useMemo(() => {
        // Filter by selected course type
        let filtered = selectedCourseType === 'All'
            ? courses
            : courses.filter((course) => course.category === selectedCourseType);

        // Calculate popularity score and sort
        const coursesWithScore = filtered.map(course => ({
            ...course,
            // Popularity score: (number of ratings * 2) + average rating
            // This prioritizes courses with more engagement
            popularityScore: (course.totalReviews * 2) + parseFloat(course.rating)
        }));

        // Sort by popularity score (highest first)
        return coursesWithScore.sort((a, b) => b.popularityScore - a.popularityScore);
    }, [courses, selectedCourseType]);

    // Fetch all courses
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://educations.onrender.com/api/course/all');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.success && Array.isArray(data.courses)) {
                    const mappedCourses = data.courses.map((course) => ({
                        id: course._id,
                        title: course.courseTitle,
                        category: course.category || course.difficulty || 'Uncategorized',
                        price: course.coursePrice.toString(),
                        rating: course.averageRating ? course.averageRating.toFixed(1) : '0.0',
                        totalReviews: course.totalReviews || 0,
                        students: course.enrolledStudents?.length?.toString() || '0',
                        image: course.courseThumbnail || 'https://via.placeholder.com/160',
                        isBookmarked: false,
                        tags: course.tags || [],
                        courseRatings: course.courseRatings || [],
                    }));

                    setCourses(mappedCourses);
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (err) {
                console.error('Fetch courses error:', err);
                setError(err.message || 'Failed to load courses');
                Alert.alert('Error', 'Failed to load courses. Please check your connection.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    // Fetch top educators
    useEffect(() => {
        const fetchTopEducators = async () => {
            try {
                setLoadingEducators(true);
                const response = await fetch('https://educations.onrender.com/api/user/getTopEducators');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.success && Array.isArray(result.data)) {
                    const mappedEducators = result.data.map((educator) => ({
                        id: educator.educatorId,
                        name: educator.name || 'Unknown Educator',
                        imageUrl: educator.imageUrl || 'https://via.placeholder.com/80',
                        rating: educator.averageRating ? educator.averageRating.toFixed(1) : 'N/A',
                        courses: educator.totalCourses || 0,
                    }));
                    setEducators(mappedEducators);
                } else {
                    setEducators([]);
                }
            } catch (err) {
                console.error('Fetch top educators error:', err);
                setEducators([]);
            } finally {
                setLoadingEducators(false);
            }
        };

        fetchTopEducators();
    }, []);

    const handleSearchPress = () => router.push('/screen/search');
    const handleNotificationPress = () => router.push('/screen/notication');
    const handleCategoryPress = () => router.push('/screen/category');
    const handlePopularPress = () => router.push('/screen/popularCourses');
    const handleMentorPress = () => router.push('/screen/Topmentor');

    const handleCoursePress = (courseId) => {
        router.push({
            pathname: '/screen/courseDetails',
            params: { courseId },
        });
    };

    if (!isUserLoaded || loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1E88FF" />
                    <Text style={styles.loadingText}>Loading courses...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.errorText}>Error: {error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.greetingContainer}>
                        <Text style={styles.greeting}>
                            Hi, {user?.firstName || 'User'}
                        </Text>
                        <TouchableOpacity
                            style={styles.notificationContainer}
                            onPress={handleNotificationPress}
                            activeOpacity={0.7}
                        >
                            <View style={styles.bellContainer}>
                                <Bell size={22} color="#1A1A1A" />
                            </View>
                            <View style={styles.notificationDot} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.subGreeting}>
                        What would you like to learn today?{'\n'}Search below.
                    </Text>
                </View>

                {/* Search Bar */}
                <TouchableOpacity style={styles.searchContainer} onPress={handleSearchPress} activeOpacity={0.8}>
                    <View style={styles.searchInputWrapper}>
                        <Search size={20} color="#999" />
                        <TextInput
                            placeholder="Search for courses..."
                            placeholderTextColor="#999"
                            style={styles.searchInput}
                            editable={false}
                            pointerEvents="none"
                        />
                    </View>
                    <View style={styles.filterButton}>
                        <Sliders size={22} color="#FFF" />
                    </View>
                </TouchableOpacity>

                {/* Promo Banner */}
                <View style={styles.promoBanner}>
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>25% OFF*</Text>
                    </View>
                    <Text style={styles.promoTitle}>Today's Special</Text>
                    <Text style={styles.promoDescription}>
                        Get a Discount for Every{'\n'}Course order only Valid for{'\n'}Today..!
                    </Text>
                    <View style={styles.circleLarge} />
                    <View style={styles.circleMedium} />
                </View>

                {/* Dynamic Categories from Course Data */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Categories</Text>
                        <TouchableOpacity onPress={handleCategoryPress}>
                            <Text style={styles.seeAllBlue}>SEE ALL </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Category filter chips */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.categoryChip, selectedCategory === cat && styles.selectedChip]}
                                onPress={() => setSelectedCategory(cat)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.categoryText, selectedCategory === cat && styles.selectedChipText]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Filtered Courses by Category */}
                    {filteredCourses.length === 0 ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: '#666' }}>
                                {selectedCategory === 'All' ? 'No courses available yet.' : `No courses in "${selectedCategory}" category.`}
                            </Text>
                        </View>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {filteredCourses.map((course) => (
                                <TouchableOpacity
                                    key={course.id}
                                    style={styles.courseCard}
                                    onPress={() => handleCoursePress(course.id)}
                                    activeOpacity={0.9}
                                >
                                    <Image
                                        source={{ uri: course.image }}
                                        style={styles.courseImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.bookmarkButton}>
                                        <Bookmark
                                            size={16}
                                            color={course.isBookmarked ? '#FF6B6B' : '#999'}
                                            fill={course.isBookmarked ? '#FF6B6B' : 'transparent'}
                                        />
                                    </View>
                                    <View style={styles.courseInfo}>
                                        <Text style={styles.courseCategory}>{course.category}</Text>
                                        <Text style={styles.courseTitle} numberOfLines={2}>
                                            {course.title}
                                        </Text>
                                        <View style={styles.courseMeta}>
                                            <Text style={styles.price}>₦{course.price}</Text>
                                            <View style={styles.ratingContainer}>
                                                <Star size={12} color="#FFB800" fill="#FFB800" />
                                                <Text style={styles.ratingText}>{course.rating}</Text>
                                                <Text style={styles.reviewsText}>({course.totalReviews})</Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Popular Courses Section - Based on real ratings */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Popular Courses</Text>
                        <TouchableOpacity onPress={handlePopularPress}>
                            <Text style={styles.seeAllBlue}>SEE ALL </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Course type filter chips - dynamically generated */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                        {courseTypes.map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.courseTypeChip, selectedCourseType === type && styles.selectedChip]}
                                onPress={() => setSelectedCourseType(type)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.courseTypeText, selectedCourseType === type && styles.selectedChipText]}>
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Popular Courses List - Sorted by engagement */}
                    {popularCourses.length === 0 ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: '#666' }}>
                                No popular courses available yet.
                            </Text>
                        </View>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {popularCourses.map((course) => (
                                <TouchableOpacity
                                    key={course.id}
                                    style={styles.courseCard}
                                    onPress={() => handleCoursePress(course.id)}
                                    activeOpacity={0.9}
                                >
                                    <Image
                                        source={{ uri: course.image }}
                                        style={styles.courseImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.bookmarkButton}>
                                        <Bookmark
                                            size={16}
                                            color={course.isBookmarked ? '#FF6B6B' : '#999'}
                                            fill={course.isBookmarked ? '#FF6B6B' : 'transparent'}
                                        />
                                    </View>
                                    <View style={styles.courseInfo}>
                                        <Text style={styles.courseCategory}>{course.category}</Text>
                                        <Text style={styles.courseTitle} numberOfLines={2}>
                                            {course.title}
                                        </Text>
                                        <View style={styles.courseMeta}>
                                            <Text style={styles.price}>₦{course.price}</Text>
                                            <View style={styles.ratingContainer}>
                                                <Star size={12} color="#FFB800" fill="#FFB800" />
                                                <Text style={styles.ratingText}>{course.rating}</Text>
                                                <Text style={styles.reviewsText}>({course.totalReviews})</Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Top Mentor */}
                <View style={styles.sectionReducedBottom}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Top Mentor</Text>
                        <TouchableOpacity onPress={handleMentorPress}>
                            <Text style={styles.seeAllBlue}>SEE ALL </Text>
                        </TouchableOpacity>
                    </View>

                    {loadingEducators ? (
                        <View style={{ height: 130, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#1E88FF" />
                        </View>
                    ) : educators.length === 0 ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: '#666' }}>No top educators available yet.</Text>
                        </View>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {educators.map((educator) => (
                                <TouchableOpacity
                                    key={educator.id}
                                    style={styles.mentorItem}
                                    activeOpacity={0.8}
                                >
                                    <Image
                                        source={{ uri: educator.imageUrl }}
                                        style={styles.mentorAvatar}
                                        resizeMode="cover"
                                    />
                                    <Text style={styles.mentorName} numberOfLines={1}>
                                        {educator.name}
                                    </Text>
                                    <View style={styles.mentorStats}>
                                        <Star size={12} color="#FFB800" fill="#FFB800" />
                                        <Text style={styles.mentorRating}>{educator.rating}</Text>
                                        <Text style={styles.mentorCourses}>({educator.courses} courses)</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </ScrollView>

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
                    <Text style={styles.navLabel}>TRANSACTION</Text>
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
    container: { flex: 1, backgroundColor: '#F8F9FD' },
    scrollContainer: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
    errorText: { fontSize: 16, color: 'red', textAlign: 'center', padding: 20 },
    header: { padding: 40 },
    greetingContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    greeting: { fontSize: 24, fontWeight: '600', color: '#1A1A1A' },
    notificationContainer: { position: 'relative' },
    bellContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#1E88FF',
        borderWidth: 2,
        borderColor: '#F8F9FD',
    },
    subGreeting: { fontSize: 14, color: '#666', lineHeight: 20 },
    searchContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 52,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 15 },
    filterButton: {
        width: 52,
        height: 52,
        borderRadius: 12,
        backgroundColor: '#1E88FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    promoBanner: {
        marginHorizontal: 20,
        marginBottom: 28,
        backgroundColor: '#1E88FF',
        borderRadius: 20,
        padding: 20,
        height: 140,
        overflow: 'hidden',
        position: 'relative',
    },
    discountBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    discountText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    promoTitle: { color: '#FFF', fontSize: 22, fontWeight: '700', marginBottom: 6 },
    promoDescription: { color: '#FFF', fontSize: 13, lineHeight: 18, opacity: 0.95 },
    circleLarge: {
        position: 'absolute',
        bottom: -60,
        right: -20,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    circleMedium: {
        position: 'absolute',
        bottom: -40,
        right: 10,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    section: { paddingHorizontal: 20, marginBottom: 28 },
    sectionReducedBottom: { paddingHorizontal: 20, marginBottom: 0 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
    seeAllBlue: { fontSize: 14, fontWeight: '600', color: '#1E88FF' },
    categoryChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F0F0F0', marginRight: 10 },
    categoryText: { fontSize: 14, color: '#666', fontWeight: '500' },
    courseTypeChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginRight: 12, backgroundColor: '#F0F0F0' },
    courseTypeText: { fontSize: 14, fontWeight: '600', color: '#666' },
    selectedChip: { backgroundColor: '#1E88FF' },
    selectedChipText: { color: '#FFF', fontWeight: '600' },
    courseCard: {
        width: 280,
        backgroundColor: '#FFF',
        borderRadius: 16,
        overflow: 'hidden',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        position: 'relative',
    },
    courseImage: { width: '100%', height: 160 },
    bookmarkButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    courseInfo: { padding: 14 },
    courseCategory: { fontSize: 12, color: '#FF6B35', fontWeight: '600', marginBottom: 6 },
    courseTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 10 },
    courseMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    price: { fontSize: 18, fontWeight: '700', color: '#1E88FF' },
    ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { fontSize: 12, color: '#666', fontWeight: '600', marginLeft: 2 },
    reviewsText: { fontSize: 11, color: '#999', fontWeight: '500', marginLeft: 2 },
    mentorItem: { alignItems: 'center', marginRight: 24, width: 100 },
    mentorAvatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
    mentorName: { fontSize: 13, color: '#1A1A1A', fontWeight: '500', textAlign: 'center' },
    mentorStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    mentorRating: {
        fontSize: 12,
        color: '#1A1A1A',
        fontWeight: '600',
    },
    mentorCourses: {
        fontSize: 11,
        color: '#666',
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
        elevation: 5,
    },
    navItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
    navLabel: { fontSize: 11, marginTop: 4, color: '#8E8E93', fontWeight: '500' },
});

export default Home;