import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
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
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const backendUrl = 'https://educations.onrender.com'; // Update when ngrok changes

const Notifications = () => {
    const navigation = useNavigation();
    const { getToken } = useAuth();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = await getToken();

                const response = await axios.get(
                    `${backendUrl}/api/user/getNewCourseNotifications`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.success) {
                    setNotifications(response.data.courses || []);
                } else {
                    setError('No new notifications available.');
                }
            } catch (err) {
                console.error('Fetch notifications error:', err);
                setError('Failed to load notifications. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    // Format relative time
    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInMs = now - past;
        const diffInHours = diffInMs / (1000 * 60 * 60);
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
        if (diffInDays < 2) return 'Yesterday';
        if (diffInDays < 7) return `${Math.floor(diffInDays)} days ago`;

        return past.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Group by Today / Yesterday / This Week
    const groupNotifications = () => {
        const groups = {
            Today: [],
            Yesterday: [],
            'This Week': [],
        };

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        const weekAgo = new Date(todayStart);
        weekAgo.setDate(weekAgo.getDate() - 7);

        notifications.forEach((course) => {
            const createdAt = new Date(course.createdAt);
            let groupKey = null;

            if (createdAt >= todayStart) groupKey = 'Today';
            else if (createdAt >= yesterdayStart) groupKey = 'Yesterday';
            else if (createdAt >= weekAgo) groupKey = 'This Week';

            if (groupKey) {
                groups[groupKey].push({
                    ...course,
                    timeAgo: formatTimeAgo(course.createdAt),
                });
            }
        });

        // Filter out empty groups
        return Object.fromEntries(
            Object.entries(groups).filter(([_, items]) => items.length > 0)
        );
    };

    const groupedData = groupNotifications();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Content States */}
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text style={styles.loadingText}>Loading notifications...</Text>
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={60} color="#FF6B6B" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : notifications.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="notifications-off-outline" size={60} color="#999" />
                    <Text style={styles.emptyTitle}>No new course notifications</Text>
                    <Text style={styles.subText}>
                        Follow educators to get notified when they publish new courses in the last 7 days.
                    </Text>
                </View>
            ) : (
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {Object.keys(groupedData).map((section) => (
                        <View key={section} style={styles.section}>
                            <Text style={styles.sectionTitle}>{section}</Text>
                            {groupedData[section].map((course) => (
                                <TouchableOpacity
                                    key={course._id}
                                    style={styles.notificationCard}
                                    onPress={() =>
                                        navigation.navigate('screen/courseDetails', { courseId: course._id })
                                    }
                                >
                                    {/* Educator Avatar */}
                                    <Image
                                        source={{ uri: course.educatorInfo.imageUrl }}
                                        style={styles.educatorAvatar}
                                        resizeMode="cover"
                                    />

                                    <View style={styles.notificationContent}>
                                        <Text style={styles.notificationTitle}>
                                            New course by {course.educatorInfo.name}
                                        </Text>
                                        <Text style={styles.courseTitle} numberOfLines={2}>
                                            {course.courseTitle}
                                        </Text>
                                        <Text style={styles.timeText}>{course.timeAgo}</Text>
                                    </View>

                                    {/* Course Thumbnail */}
                                    <Image
                                        source={{ uri: course.courseThumbnail }}
                                        style={styles.courseThumbnail}
                                        resizeMode="cover"
                                    />

                                    <Ionicons name="chevron-forward" size={20} color="#999" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))}
                    <View style={styles.bottomSpace} />
                </ScrollView>
            )}
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
        paddingTop: height * 0.05,
        paddingBottom: height * 0.02,
        backgroundColor: '#F8F9FA',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: width * 0.05,
        fontWeight: '700',
        color: '#1A1A1A',
        flex: 1,
        marginLeft: 8,
    },
    placeholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        color: '#FF3B30',
        textAlign: 'center',
    },
    emptyTitle: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    subText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    section: {
        marginBottom: height * 0.02,
    },
    sectionTitle: {
        fontSize: width * 0.048,
        fontWeight: '700',
        color: '#1A1A1A',
        paddingHorizontal: width * 0.05,
        marginBottom: height * 0.015,
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F0FE',
        marginHorizontal: width * 0.05,
        marginBottom: height * 0.012,
        padding: 16,
        borderRadius: 16,
    },
    educatorAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 14,
    },
    notificationContent: {
        flex: 1,
        marginRight: 12,
    },
    notificationTitle: {
        fontSize: width * 0.04,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    courseTitle: {
        fontSize: width * 0.042,
        fontWeight: '600',
        color: '#2196F3',
        marginBottom: 4,
    },
    timeText: {
        fontSize: width * 0.035,
        color: '#666',
    },
    courseThumbnail: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 12,
    },
    bottomSpace: {
        height: height * 0.05,
    },
});

export default Notifications;