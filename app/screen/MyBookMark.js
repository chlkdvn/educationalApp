import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const courses = [
  {
    id: 1,
    title: 'Graphic Design Advanced',
    instructor: 'Kitani Studio',
    rating: 4.5,
    students: '5k',
    category: 'UI Design',
    color: '#4CAF50'
  },
  {
    id: 2,
    title: 'Advertisement Design',
    instructor: 'Kitani Studio',
    rating: 4.7,
    students: '7k',
    category: '3D Design',
    color: '#2196F3'
  },
  {
    id: 3,
    title: 'Graphic Design Advanced',
    instructor: 'Kitani Studio',
    rating: 4.2,
    students: '3k',
    category: 'Arts & H',
    color: '#4CAF50'
  },
  {
    id: 4,
    title: 'Web Developer course...',
    instructor: 'Kitani Studio',
    rating: 4.4,
    students: '15k',
    category: 'Programming',
    color: '#FF9800'
  },
  {
    id: 5,
    title: 'Digital Marketing Certi...',
    instructor: 'Kitani Studio',
    rating: 4.3,
    students: '20k',
    category: 'Marketing',
    color: '#F44336'
  }
];


 const MyCourseMark=() => {
  const [activeTab, setActiveTab] = useState('Graphic Design');
  const [bookmarked, setBookmarked] = useState(courses.map(() => true));

  const toggleBookmark = (index) => {
    const newBookmarked = [...bookmarked];
    newBookmarked[index] = !newBookmarked[index];
    setBookmarked(newBookmarked);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookmark</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'All' && styles.activeTab]}
          onPress={() => setActiveTab('All')}
        >
          <Text style={[styles.tabText, activeTab === 'All' && styles.activeTabText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Graphic Design' && styles.activeTab]}
          onPress={() => setActiveTab('Graphic Design')}
        >
          <Text style={[styles.tabText, activeTab === 'Graphic Design' && styles.activeTabText]}>
            Graphic Design
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === '3D Design' && styles.activeTab]}
          onPress={() => setActiveTab('3D Design')}
        >
          <Text style={[styles.tabText, activeTab === '3D Design' && styles.activeTabText]}>
            3D Design
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Arts & H' && styles.activeTab]}
          onPress={() => setActiveTab('Arts & H')}
        >
          <Text style={[styles.tabText, activeTab === 'Arts & H' && styles.activeTabText]}>
            Arts & H
          </Text>
        </TouchableOpacity>
      </View>

      {/* Course List */}
      <ScrollView style={styles.courseList} showsVerticalScrollIndicator={false}>
        {courses.map((course, index) => (
          <View key={course.id} style={styles.courseCard}>
            <View style={styles.thumbnail} />
            
            <View style={styles.courseInfo}>
              <View style={styles.categoryBadge}>
                <Text style={[styles.categoryText, { color: course.color }]}>
                  {course.category}
                </Text>
              </View>
              
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.instructor}>{course.instructor}</Text>
              
              <View style={styles.courseFooter}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#FFB800" />
                  <Text style={styles.rating}>{course.rating}</Text>
                  <Text style={styles.students}>| {course.students} Std</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.bookmarkButton}
              onPress={() => toggleBookmark(index)}
            >
              <Ionicons 
                name={bookmarked[index] ? "bookmark" : "bookmark-outline"} 
                size={22} 
                color="#00BFA6" 
              />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: '#00BFA6',
  },
  tabText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  courseList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  courseCard: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  thumbnail: {
    width: 80,
    height: 80,
    backgroundColor: '#000',
    borderRadius: 8,
    marginRight: 12,
  },
  courseInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f0f9ff',
    borderRadius: 4,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  instructor: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  courseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginLeft: 4,
  },
  students: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  bookmarkButton: {
    padding: 4,
  },
});


 export  default  MyCourseMark