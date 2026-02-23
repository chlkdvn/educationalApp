import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
    View
} from 'react-native';

const { width } = Dimensions.get('window');

const API_URL = 'https://2c29-102-90-81-15.ngrok-free.app/api/course/all';

const RECENT_SEARCHES_KEY = '@recent_searches';

const Search = () => {
    const router = useRouter();
    const [searchText, setSearchText] = useState('');
    const inputRef = useRef(null);

    const [recentSearches, setRecentSearches] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Load recent searches from AsyncStorage on mount
    useEffect(() => {
        const loadRecentSearches = async () => {
            try {
                const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
                if (stored) {
                    setRecentSearches(JSON.parse(stored));
                }
            } catch (error) {
                console.error('Failed to load recent searches:', error);
            }
        };

        inputRef.current?.focus();
        loadRecentSearches();
        fetchAllCourses();
    }, []);

    // Save recent searches to AsyncStorage whenever it changes
    useEffect(() => {
        const saveRecentSearches = async () => {
            try {
                await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
            } catch (error) {
                console.error('Failed to save recent searches:', error);
            }
        };

        if (recentSearches.length > 0) {
            saveRecentSearches();
        }
    }, [recentSearches]);

    const fetchAllCourses = async () => {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();

            if (data.success && Array.isArray(data.courses)) {
                const mappedCourses = data.courses.map((course) => ({
                    id: course._id,
                    title: course.courseTitle,
                    category: course.category || course.difficulty || 'Uncategorized',
                    price: course.coursePrice,
                    rating: course.averageRating || 0,
                    totalReviews: course.totalReviews || 0,
                    image: course.courseThumbnail,
                }));
                setAllCourses(mappedCourses);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const performSearch = (term) => {
        if (!term.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setLoading(true);
        const query = term.toLowerCase();

        const results = allCourses.filter((course) =>
            course.title.toLowerCase().includes(query) ||
            course.category.toLowerCase().includes(query)
        );

        setSearchResults(results);
        setShowResults(true);
        setLoading(false);
    };

    const addToRecent = (term) => {
        if (!term.trim()) return;
        const cleanedTerm = term.trim();
        const updated = [cleanedTerm, ...recentSearches.filter(t => t !== cleanedTerm)].slice(0, 8);
        setRecentSearches(updated);
    };

    const handleSearch = () => {
        const term = searchText.trim();
        if (term) {
            addToRecent(term);
            performSearch(term);
        }
    };

    const handleRecentPress = (term) => {
        setSearchText(term);
        addToRecent(term);
        performSearch(term);
        inputRef.current?.focus();
    };

    const clearAllRecent = async () => {
        try {
            setRecentSearches([]);
            await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
        } catch (error) {
            console.error('Failed to clear recent searches:', error);
        }
    };

    const removeRecentItem = async (termToRemove) => {
        const updated = recentSearches.filter(t => t !== termToRemove);
        setRecentSearches(updated);
        try {
            await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Failed to remove recent search:', error);
        }
    };

    const clearSearchText = () => {
        setSearchText('');
        setSearchResults([]);
        setShowResults(false);
        inputRef.current?.focus();
    };

    const handleCoursePress = (courseId) => {
        router.push({
            pathname: '/screen/courseDetails',
            params: { courseId },
        });
    };

    // Real-time search as user types
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchText.trim()) {
                performSearch(searchText);
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(delaySearch);
    }, [searchText]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={26} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Search</Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIconLeft} />
                    <TextInput
                        ref={inputRef}
                        style={styles.searchInput}
                        placeholder="Search courses, categories..."
                        placeholderTextColor="#999"
                        value={searchText}
                        onChangeText={setSearchText}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={clearSearchText} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={20} color="#999" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                        <Ionicons name="search" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Search Results */}
                {showResults ? (
                    <View style={styles.resultsWrapper}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                {loading ? 'Searching...' : `${searchResults.length} Results Found`}
                            </Text>
                        </View>

                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#1E88FF" />
                            </View>
                        ) : searchResults.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="search-outline" size={64} color="#DDD" />
                                <Text style={styles.emptyText}>No courses found</Text>
                                <Text style={styles.emptySubtext}>Try searching with different keywords</Text>
                            </View>
                        ) : (
                            <ScrollView
                                style={styles.resultsScroll}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.resultsContent}
                            >
                                {searchResults.map((course) => (
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
                                        <View style={styles.courseInfo}>
                                            <Text style={styles.courseCategory}>{course.category}</Text>
                                            <Text style={styles.courseTitle} numberOfLines={2}>
                                                {course.title}
                                            </Text>
                                            <View style={styles.courseFooter}>
                                                <Text style={styles.coursePrice}>₦{course.price}</Text>
                                                <View style={styles.ratingContainer}>
                                                    <Ionicons name="star" size={14} color="#FFC107" />
                                                    <Text style={styles.ratingText}>
                                                        {course.rating > 0 ? course.rating.toFixed(1) : 'New'}
                                                    </Text>
                                                    {course.totalReviews > 0 && (
                                                        <Text style={styles.reviewsText}>
                                                            ({course.totalReviews})
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                ) : (
                    /* Recent Searches - Now from AsyncStorage */
                    recentSearches.length > 0 ? (
                        <>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Recent Searches</Text>
                                <TouchableOpacity onPress={clearAllRecent}>
                                    <Text style={styles.clearAllText}>Clear All</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.recentsContainer}>
                                {recentSearches.map((search, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.recentItem}
                                        onPress={() => handleRecentPress(search)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="time-outline" size={18} color="#999" style={styles.clockIcon} />
                                        <Text style={styles.recentText}>{search}</Text>
                                        <TouchableOpacity
                                            onPress={() => removeRecentItem(search)}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        >
                                            <Ionicons name="close" size={20} color="#BBB" />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={64} color="#DDD" />
                            <Text style={styles.emptyText}>No recent searches yet</Text>
                            <Text style={styles.emptySubtext}>Start typing to search courses</Text>
                        </View>
                    )
                )}
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
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16
    },
    backButton: { padding: 4 },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
        marginLeft: 16
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 14,
        marginHorizontal: 20,
        paddingHorizontal: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        height: 56
    },
    searchIconLeft: { marginRight: 8 },
    searchInput: {
        flex: 1,
        fontSize: 17,
        color: '#1A1A1A',
        paddingVertical: 0
    },
    clearButton: { padding: 4 },
    searchButton: {
        backgroundColor: '#1E88FF',
        borderRadius: 10,
        padding: 10,
        marginLeft: 8
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A'
    },
    clearAllText: {
        fontSize: 15,
        color: '#1E88FF',
        fontWeight: '600'
    },
    recentsContainer: {
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
        paddingVertical: 8
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#EEE'
    },
    clockIcon: { marginRight: 12 },
    recentText: {
        flex: 1,
        fontSize: 16,
        color: '#333'
    },
    resultsWrapper: {
        flex: 1
    },
    resultsScroll: {
        flex: 1
    },
    resultsContent: {
        paddingHorizontal: 20,
        paddingBottom: 20
    },
    courseCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    courseImage: {
        width: width * 0.3,
        height: width * 0.3,
        borderRadius: 12,
        backgroundColor: '#E5E5EA',
    },
    courseInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    courseCategory: {
        fontSize: 12,
        color: '#FF9500',
        fontWeight: '600',
        marginBottom: 4,
    },
    courseTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    courseFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    coursePrice: {
        fontSize: 16,
        color: '#1E88FF',
        fontWeight: '700',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 13,
        color: '#1A1A1A',
        fontWeight: '600',
        marginLeft: 2,
    },
    reviewsText: {
        fontSize: 12,
        color: '#999',
        marginLeft: 2,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingTop: 60
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
        fontWeight: '600'
    },
    emptySubtext: {
        fontSize: 15,
        color: '#999',
        textAlign: 'center'
    },
});

export default Search;
