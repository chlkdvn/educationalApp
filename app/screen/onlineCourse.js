import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Book, BookOpen, CreditCard, Home, Search, SlidersHorizontal, User } from 'lucide-react-native';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const OnlineCourse = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('courses');

    const handleSearchFiltes = () => {
        router.push('/screen/filterSearch');
    };

    const handleBack = () => {
        router.back()
    };


    const courses = [
        { id: 1, title: 'Graphic Design advanced', author: 'Kitani Studio', price: 190, category: 'Design' },
        { id: 2, title: 'Advance Photoshop in Gra...', author: 'Kitani Studio', price: 190, category: 'Design' },
        { id: 3, title: 'Graphic Design Advanced', author: 'Kitani Studio', price: 190, category: 'FREE' },
        { id: 4, title: 'Web Developer course', author: 'Kitani Studio', price: 190, category: 'Development' },
    ];

    const mentors = [
        { id: 1, name: 'John Smith', specialty: 'UI/UX Design', rating: 4.8, students: 1200 },
        { id: 2, name: 'Sarah Johnson', specialty: 'Web Development', rating: 4.9, students: 2500 },
        { id: 3, name: 'Mike Chen', specialty: 'Graphic Design', rating: 4.7, students: 980 },
        { id: 4, name: 'Emily Davis', specialty: 'Digital Marketing', rating: 4.9, students: 1800 },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={handleBack} >
                        <ArrowLeft size={20} color="#374151" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Online Courses</Text>
                    <Bell size={24} color="#000" />
                </View>

                <View style={styles.searchContainer}>
                    <Search style={styles.searchIcon} size={20} color="#9ca3af" />
                    <TextInput
                        placeholder="Search for..."
                        style={styles.searchInput}
                        placeholderTextColor="#9ca3af"
                    />
                    <TouchableOpacity style={styles.filterButton} onPress={handleSearchFiltes}>
                        <SlidersHorizontal size={20} color="#ffffff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.categoryButtons}>
                    <TouchableOpacity
                        style={activeTab === 'courses' ? styles.categoryButtonActive : styles.categoryButtonInactive}
                        onPress={() => setActiveTab('courses')}
                    >
                        <Text style={activeTab === 'courses' ? styles.categoryButtonActiveText : styles.categoryButtonInactiveText}>
                            Courses
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={activeTab === 'mentors' ? styles.categoryButtonActive : styles.categoryButtonInactive}
                        onPress={() => setActiveTab('mentors')}
                    >
                        <Text style={activeTab === 'mentors' ? styles.categoryButtonActiveText : styles.categoryButtonInactiveText}>
                            Mentors
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Banner */}
            <View style={styles.banner}>
                <Text style={styles.bannerTitle}>Boost Your Career</Text>
                <Text style={styles.bannerSubtitle}>with the world leading online...</Text>
                <TouchableOpacity style={styles.bannerButton}>
                    <Text style={styles.bannerButtonText}>Join Courses</Text>
                </TouchableOpacity>
            </View>

            {/* Premium Smooth ScrollView */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={true}                    // iOS bounce effect
                overScrollMode="always"           // Android overscroll glow
                decelerationRate="normal"         // Natural smooth slowdown
                contentContainerStyle={styles.coursesListContent}
            >
                {activeTab === 'courses' ? (
                    courses.map((course) => (
                        <View key={course.id} style={styles.courseCard}>
                            <View style={styles.courseThumbnail} />
                            <View style={styles.courseInfo}>
                                <View>
                                    <Text style={styles.courseTitle}>{course.title}</Text>
                                    <Text style={styles.courseAuthor}>{course.author}</Text>
                                </View>
                                <View style={styles.courseFooter}>
                                    <Text style={styles.coursePrice}>${course.price}</Text>
                                    <View style={[
                                        styles.categoryBadge,
                                        course.category === 'FREE' ? styles.categoryBadgeFree : styles.categoryBadgeBlue
                                    ]}>
                                        <Text style={[
                                            styles.categoryBadgeText,
                                            course.category === 'FREE' ? styles.categoryBadgeTextFree : styles.categoryBadgeTextBlue
                                        ]}>
                                            {course.category}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.bookmarkButton}>
                                <BookOpen size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    mentors.map((mentor) => (
                        <View key={mentor.id} style={styles.courseCard}>
                            <View style={styles.mentorAvatar} />
                            <View style={styles.courseInfo}>
                                <View>
                                    <Text style={styles.courseTitle}>{mentor.name}</Text>
                                    <Text style={styles.courseAuthor}>{mentor.specialty}</Text>
                                </View>
                                <View style={styles.courseFooter}>
                                    <Text style={styles.mentorRating}>⭐ {mentor.rating}</Text>
                                    <Text style={styles.mentorStudents}>{mentor.students} students</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.bookmarkButton}>
                                <User size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Home size={24} color="#9ca3af" />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Book size={24} color="#14b8a6" />
                    <Text style={styles.navTextActive}>Courses</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <CreditCard size={24} color="#9ca3af" />
                    <Text style={styles.navText}>HISTORY</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <User size={24} color="#9ca3af" />
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    searchContainer: {
        position: 'relative',
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchIcon: {
        position: 'absolute',
        left: 16,
        top: 14,
        zIndex: 1,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        paddingVertical: 14,
        paddingLeft: 48,
        paddingRight: 16,
        fontSize: 15,
    },
    filterButton: {
        backgroundColor: '#3b82f6',
        padding: 14,
        borderRadius: 12,
        marginLeft: 10,
    },
    categoryButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    categoryButtonActive: {
        backgroundColor: '#14b8a6',
        paddingHorizontal: 28,
        paddingVertical: 10,
        borderRadius: 9999,
    },
    categoryButtonActiveText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 15,
    },
    categoryButtonInactive: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 28,
        paddingVertical: 10,
        borderRadius: 9999,
    },
    categoryButtonInactiveText: {
        color: '#4b5563',
        fontWeight: '600',
        fontSize: 15,
    },
    banner: {
        backgroundColor: '#14b8a6',
        marginHorizontal: 20,
        marginTop: 24,
        borderRadius: 16,
        padding: 24,
    },
    bannerTitle: {
        color: '#ffffff',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    bannerSubtitle: {
        color: '#ffffff',
        fontSize: 15,
        marginBottom: 16,
    },
    bannerButton: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 9999,
        alignSelf: 'flex-start',
    },
    bannerButtonText: {
        color: '#14b8a6',
        fontWeight: '600',
        fontSize: 14,
    },
    coursesListContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 120, // Extra space so content isn't hidden behind bottom nav
    },
    courseCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 14,
        marginBottom: 18,
        flexDirection: 'row',
        gap: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 3,
    },
    courseThumbnail: {
        width: 90,
        height: 90,
        backgroundColor: '#000000',
        borderRadius: 8,
    },
    mentorAvatar: {
        width: 90,
        height: 90,
        backgroundColor: '#14b8a6',
        borderRadius: 45,
    },
    courseInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    courseTitle: {
        fontWeight: '600',
        fontSize: 15,
        marginBottom: 6,
    },
    courseAuthor: {
        color: '#9ca3af',
        fontSize: 13,
        marginBottom: 10,
    },
    courseFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    coursePrice: {
        color: '#14b8a6',
        fontWeight: 'bold',
        fontSize: 16,
    },
    categoryBadge: {
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 9999,
    },
    categoryBadgeFree: {
        backgroundColor: '#dcfce7',
    },
    categoryBadgeBlue: {
        backgroundColor: '#dbeafe',
    },
    categoryBadgeText: {
        fontSize: 13,
        fontWeight: '600',
    },
    categoryBadgeTextFree: {
        color: '#16a34a',
    },
    categoryBadgeTextBlue: {
        color: '#2563eb',
    },
    bookmarkButton: {
        padding: 10,
    },
    mentorRating: {
        color: '#14b8a6',
        fontWeight: 'bold',
        fontSize: 14,
    },
    mentorStudents: {
        color: '#9ca3af',
        fontSize: 13,
    },
    bottomNav: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'space-around',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    navItem: {
        alignItems: 'center',
        gap: 6,
    },
    navText: {
        fontSize: 13,
        color: '#9ca3af',
    },
    navTextActive: {
        fontSize: 13,
        color: '#14b8a6',
        fontWeight: '600',
    },
});

export default OnlineCourse;
