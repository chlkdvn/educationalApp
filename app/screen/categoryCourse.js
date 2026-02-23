import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Bookmark, Star, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get("window");

const CategoryCourses = () => {
  const router = useRouter();
    const navigation = useNavigation();
    const route = useRoute();
    const { ids: jsonIds, title } = route.params;
    const selectedIds = JSON.parse(jsonIds);

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('https://2c29-102-90-81-15.ngrok-free.app/api/course/all');
                const data = await response.json();
                if (data.success && Array.isArray(data.courses)) {
                    const filteredCourses = data.courses.filter(course => selectedIds.includes(course._id));
                    const mappedCourses = filteredCourses.map((course) => ({
                        id: course._id,
                        title: course.courseTitle,
                        category: course.category || course.difficulty || 'Uncategorized',
                        price: course.coursePrice.toString(),
                        rating: course.averageRating ? course.averageRating.toFixed(1) : '0.0',
                        students: course.enrolledStudents?.length?.toString() || Math.floor(Math.random() * 9000 + 1000).toString(),
                        image: course.courseThumbnail || 'https://via.placeholder.com/160',
                        isBookmarked: false,
                    }));
                    setCourses(mappedCourses);
                }
            } catch (err) {
                console.error('Error fetching courses:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleCoursePress = (courseId) => {
        navigation.navigate('screen/courseDetails', { courseId });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1E88FF" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Courses in {title}</Text>
                </View>

                {/* Courses List */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {courses.length === 0 ? (
                        <Text style={styles.noCoursesText}>No courses found in this {title.toLowerCase()}.</Text>
                    ) : (
                        <View style={styles.coursesGrid}>
                            {courses.map((course) => (
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
                                            size={14}
                                            color={course.isBookmarked ? '#FF6B6B' : '#999'}
                                            fill={course.isBookmarked ? '#FF6B6B' : 'transparent'}
                                        />
                                    </View>
                                    <View style={styles.courseInfo}>
                                        <Text style={styles.courseCategory} numberOfLines={1}>{course.category}</Text>
                                        <Text style={styles.courseTitle} numberOfLines={2}>
                                            {course.title}
                                        </Text>
                                        <View style={styles.courseMeta}>
                                            <Text style={styles.price}>₦{course.price}</Text>
                                        </View>
                                        <View style={styles.ratingContainer}>
                                            <Star size={10} color="#FFB800" fill="#FFB800" />
                                            <Text style={styles.ratingText}>{course.rating}</Text>
                                            <Users size={10} color="#666" />
                                            <Text style={styles.studentsText}>{course.students}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </View>
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
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02,      // was 0.05
    paddingBottom: height * 0.025,

    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: width * 0.055,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: width * 0.05,
        paddingBottom: height * 0.03,
    },
    noCoursesText: {
        fontSize: width * 0.045,
        color: '#666',
        textAlign: 'center',
        marginTop: height * 0.1,
    },
    coursesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    courseCard: {
        width: (width * 0.9 - 12) / 2,
        backgroundColor: '#FFF',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        position: 'relative',
    },
    courseImage: {
        width: '100%',
        height: 120
    },
    bookmarkButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    courseInfo: {
        padding: 10
    },
    courseCategory: {
        fontSize: 10,
        color: '#FF6B35',
        fontWeight: '600',
        marginBottom: 4
    },
    courseTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
        minHeight: 34
    },
    courseMeta: {
        marginBottom: 6
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E88FF'
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    ratingText: {
        fontSize: 10,
        color: '#666',
        fontWeight: '600',
        marginLeft: 2,
        marginRight: 4
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
    studentsText: {
        fontSize: 10,
        color: '#666',
        fontWeight: '600',
        marginLeft: 2
    },
});

export default CategoryCourses;
