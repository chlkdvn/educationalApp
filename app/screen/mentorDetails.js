import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const backendUrl = 'https://2c29-102-90-81-15.ngrok-free.app';

const MentorDetail = () => {
  const router = useRouter();
  const { educatorId } = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState('Courses');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Accurate follow states fetched directly from dedicated endpoints
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/user/me`, {
          withCredentials: true
        });
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.log('Auth check failed:', err);
      }
    };
    checkAuth();
  }, []);

  // Fetch main educator overview
  useEffect(() => {
    if (!educatorId) {
      setError('No educator ID provided');
      setLoading(false);
      return;
    }

    const fetchEducatorData = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(
          `${backendUrl}/api/user/getAllMentorsgetEducatorOverview/${educatorId}`,
          { withCredentials: true }
        );

        if (response.data.success && response.data.data) {
          setData(response.data.data);
        } else {
          throw new Error('Invalid response');
        }
      } catch (err) {
        console.error('Fetch educator error:', err);
        setError('Failed to load mentor details.');
        Alert.alert('Error', 'Could not load mentor information.');
      } finally {
        setLoading(false);
      }
    };

    fetchEducatorData();
  }, [educatorId]);

  // Immediately fetch accurate following status and follower count after main data loads
  useEffect(() => {
    if (!data || !educatorId) return;

    const fetchFollowData = async () => {
      try {
        // Fetch isFollowing
        const followRes = await axios.get(
          `${backendUrl}/api/user/checkFollowing/${educatorId}`,
          { withCredentials: true }
        );

        if (followRes.data.success) {
          setIsFollowing(followRes.data.isFollowing);
        }

        // Fetch follower count
        const countRes = await axios.get(
          `${backendUrl}/api/user/getEducatorFollowerCount/${educatorId}`,
          { withCredentials: true }
        );

        if (countRes.data.success) {
          setFollowerCount(countRes.data.followers);
        }
      } catch (err) {
        console.error('Error fetching follow data:', err);
        // Silent fallback – don't break UI if these fail
      }
    };

    fetchFollowData();
  }, [data, educatorId]);

  // Handle Follow/Unfollow
  const handleFollowToggle = async () => {
    if (followLoading || !educatorId) return;

    try {
      setFollowLoading(true);
      const newFollowingState = !isFollowing;

      // Optimistic update
      setIsFollowing(newFollowingState);
      setFollowerCount(prev => newFollowingState ? prev + 1 : prev - 1);

      const endpoint = newFollowingState
        ? `/api/user/followEducator/${educatorId}`
        : `/api/user/unfollowEducator/${educatorId}`;

      const res = await axios.post(
        `${backendUrl}${endpoint}`,
        {},
        { withCredentials: true }
      );

      if (!res.data.success) {
        throw new Error(res.data.message || 'Action failed');
      }

    } catch (err) {
      console.error('Follow toggle error:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to update follow status.');

      // Revert optimistic update
      setIsFollowing(!isFollowing);
      setFollowerCount(prev => isFollowing ? prev + 1 : prev - 1);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessagePress = async () => {
    if (!data?.educator) return;

    try {
      const res = await axios.post(
        `${backendUrl}/api/chat/start-conversation`,
        { educatorId },
        { withCredentials: true }
      );

      if (res.data.success && res.data.conversation) {
        const { _id: conversationId, otherUser } = res.data.conversation;
        router.push({
          pathname: '/screen/inbox',
          params: {
            openChatWith: conversationId,
            educatorName: otherUser.name,
            educatorImage: otherUser.imageUrl,
          },
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Could not start chat.');
    }
  };

  const handleCoursePress = (courseId) => {
    router.push({ pathname: '/screen/courseDetails', params: { courseId } });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading mentor details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'No data available'}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.retryButton}>
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { educator, stats, courses, ratings } = data;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Image source={{ uri: educator.imageUrl }} style={styles.avatar} resizeMode="cover" />
          <Text style={styles.name}>{educator.name}</Text>
          <Text style={styles.title}>Educator</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalCourses}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={[styles.statItem, styles.statBorder]}>
              <Text style={styles.statNumber}>{stats.totalEnrolledStudents}</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{followerCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.followButton, isFollowing && styles.followingButton]}
              onPress={handleFollowToggle}
              disabled={followLoading}
            >
              {followLoading ? (
                <ActivityIndicator size="small" color={isFollowing ? "#666" : "#1976D2"} />
              ) : (
                <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.messageButton} onPress={handleMessagePress}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
              <Text style={styles.messageButtonText}> Message</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quoteContainer}>
            <Text style={styles.quoteText}>
              Passionate educator dedicated to helping students master new skills through engaging and practical courses.
            </Text>
          </View>
        </View>

        {/* Tabs and content remain unchanged */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Courses' && styles.activeTab]}
            onPress={() => setActiveTab('Courses')}
          >
            <Text style={[styles.tabText, activeTab === 'Courses' && styles.activeTabText]}>
              Courses ({courses.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Ratings' && styles.activeTab]}
            onPress={() => setActiveTab('Ratings')}
          >
            <Text style={[styles.tabText, activeTab === 'Ratings' && styles.activeTabText]}>
              Ratings ({ratings.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'Courses' ? (
          <View style={styles.contentContainer}>
            {courses.length === 0 ? (
              <Text style={styles.emptyText}>No courses published yet.</Text>
            ) : (
              courses.map((course) => (
                <TouchableOpacity
                  key={course._id}
                  style={styles.courseCard}
                  onPress={() => handleCoursePress(course._id)}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: course.courseThumbnail }} style={styles.courseThumbnail} />
                  <View style={styles.courseDetails}>
                    <View style={styles.courseHeader}>
                      <Text style={styles.courseCategory}>
                        {course.tags?.[0] || course.difficulty || 'Course'}
                      </Text>

                    </View>
                    <Text style={styles.courseTitle} numberOfLines={2}>{course.courseTitle}</Text>
                    <Text style={styles.coursePrice}>₹{course.coursePrice}</Text>
                    <View style={styles.courseFooter}>
                      <View style={styles.ratingContainer}>
                        <Text style={styles.starIcon}>Star</Text>
                        <Text style={styles.rating}>
                          {course.averageRating?.toFixed(1) || 'N/A'}
                        </Text>
                      </View>
                      <Text style={styles.separator}>|</Text>
                      <Text style={styles.students}>
                        {course.enrolledStudents?.length || 0} Students
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          <View style={styles.contentContainer}>
            {ratings.length === 0 ? (
              <Text style={styles.emptyText}>No ratings yet.</Text>
            ) : (
              ratings.map((review, index) => (
                <View key={index} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Image source={{ uri: review.user.imageUrl }} style={styles.avatarSmall} />
                    <View style={styles.reviewInfo}>
                      <Text style={styles.reviewerName}>{review.user.name}</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.starIconSmall}>Star</Text>
                      <Text style={styles.ratingText}>{review.rating}.0</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>Rated {review.rating} stars</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>


      {/* Bottom Navigation */}
      <View style={styles.bottomNav} >
          <TouchableOpacity style={styles.navItem}  onPress={() => router.push('/screen/home')}>
              <Ionicons name="home" size={22} color="#8E8E93" />
              <Text style={[styles.navLabel, { color: '#8E8E93' }]}>HOME</Text>
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

// Styles unchanged (same as before)
const styles = StyleSheet.create({
  // ... all your existing styles (no changes needed)
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center', marginBottom: 20 },
  retryButton: { padding: 12, backgroundColor: '#2196F3', borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '600' },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  profileSection: { alignItems: 'center', paddingHorizontal: 16, paddingBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0E0E0', marginBottom: 12 },
  name: { fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 4 },
  title: { fontSize: 14, color: '#666', marginBottom: 20 },
  statsContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginBottom: 20 },
  statItem: { alignItems: 'center', flex: 1 },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#E0E0E0' },
  statNumber: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#666' },
  buttonContainer: { flexDirection: 'row', width: '100%', gap: 12, marginBottom: 20 },
  followButton: { flex: 1, paddingVertical: 12, borderRadius: 25, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' },
  followingButton: { backgroundColor: '#F0F0F0' },
  followButtonText: { fontSize: 15, fontWeight: '600', color: '#1976D2' },
  followingButtonText: { color: '#666' },
  messageButton: { flex: 1, flexDirection: 'row', paddingVertical: 12, borderRadius: 25, backgroundColor: '#2196F3', alignItems: 'center', justifyContent: 'center', gap: 8 },
  messageButtonText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  quoteContainer: { width: '100%', padding: 16, backgroundColor: '#F8F9FA', borderRadius: 8 },
  quoteText: { fontSize: 13, color: '#666', lineHeight: 20, textAlign: 'center', fontStyle: 'italic' },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#F0F0F0', paddingHorizontal: 16 },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#2196F3' },
  tabText: { fontSize: 15, fontWeight: '500', color: '#666' },
  activeTabText: { color: '#2196F3', fontWeight: '700' },
  contentContainer: { padding: 16 },
  emptyText: { textAlign: 'center', color: '#666', fontSize: 15, padding: 20 },
  courseCard: { flexDirection: 'row', marginBottom: 16, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E0E0E0' },
  courseThumbnail: { width: 100, height: 120, backgroundColor: '#000' },
  courseDetails: { flex: 1, padding: 12 },
  courseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  courseCategory: { fontSize: 12, fontWeight: '600', color: '#FF6B35' },
  courseTitle: { fontSize: 15, fontWeight: '700', color: '#000', marginBottom: 6 },
  coursePrice: { fontSize: 18, fontWeight: '700', color: '#2196F3', marginBottom: 8 },
  courseFooter: { flexDirection: 'row', alignItems: 'center' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  starIcon: { fontSize: 14, color: '#FFB800', marginRight: 4 },
  rating: { fontSize: 13, fontWeight: '600', color: '#000' },
  separator: { marginHorizontal: 8, color: '#999' },
  students: { fontSize: 13, color: '#666' },
  reviewCard: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16, marginBottom: 12 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0E0E0', marginRight: 12 },
  reviewInfo: { flex: 1 },
  reviewerName: { fontSize: 15, fontWeight: '700', color: '#000' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 15, borderWidth: 1, borderColor: '#2196F3' },
  starIconSmall: { fontSize: 12, color: '#FFB800', marginRight: 4 },
  ratingText: { fontSize: 13, fontWeight: '600', color: '#000' },
  reviewComment: { fontSize: 14, color: '#666', lineHeight: 20 },
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

export default MentorDetail;