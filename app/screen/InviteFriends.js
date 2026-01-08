import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const InviteFriends = () => {
    const friends = [
        { name: 'Ram Thomas', phone: '(+91) 702-837-7965', invited: false },
        { name: 'Anastasia', phone: '(+91) 702-897-7965', invited: false },
        { name: 'Vaibhav', phone: '(+91)877-888-4652', invited: true },
        { name: 'Rahul Juman', phone: '(+91) 661-897-3716', invited: false },
        { name: 'Abby', phone: '(+91) 662-312-320', invited: true },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Invite Frineds</Text>
            </View>

            {/* Content */}
            <ScrollView style={styles.scrollView}>
                {/* Friends List */}
                <View style={styles.friendsList}>
                    {friends.map((friend, index) => (
                        <View key={index} style={styles.friendItem}>
                            <View style={styles.avatar} />
                            <View style={styles.friendInfo}>
                                <Text style={styles.friendName}>{friend.name}</Text>
                                <Text style={styles.friendPhone}>{friend.phone}</Text>
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.inviteButton,
                                    friend.invited && styles.inviteButtonInvited
                                ]}
                            >
                                <Text style={[
                                    styles.inviteButtonText,
                                    friend.invited && styles.inviteButtonTextInvited
                                ]}>
                                    Invite
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Share Invite Via Section */}
                <View style={styles.shareSection}>
                    <Text style={styles.shareTitle}>Share Invite Via</Text>
                    <View style={styles.socialIcons}>
                        <TouchableOpacity style={styles.socialButton}>
                            <Text style={styles.facebookIcon}>f</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <Text style={styles.twitterIcon}>🐦</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <Text style={styles.googleIcon}>G+</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <Text style={styles.whatsappIcon}>📱</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    backButton: {
        marginRight: 16,
    },
    backButtonText: {
        fontSize: 24,
        color: '#000',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    scrollView: {
        flex: 1,
    },
    friendsList: {
        backgroundColor: '#FFFFFF',
        marginTop: 16,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#000',
        marginRight: 12,
    },
    friendInfo: {
        flex: 1,
    },
    friendName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    friendPhone: {
        fontSize: 13,
        color: '#999',
    },
    inviteButton: {
        backgroundColor: '#2B7EFF',
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 20,
    },
    inviteButtonInvited: {
        backgroundColor: '#F0F0F0',
    },
    inviteButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    inviteButtonTextInvited: {
        color: '#999',
    },
    shareSection: {
        backgroundColor: '#FFFFFF',
        marginTop: 24,
        padding: 20,
    },
    shareTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 16,
    },
    socialIcons: {
        flexDirection: 'row',
        gap: 16,
    },
    socialButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F5',
    },
    facebookIcon: {
        fontSize: 24,
        color: '#3B5998',
        fontWeight: 'bold',
    },
    twitterIcon: {
        fontSize: 20,
    },
    googleIcon: {
        fontSize: 20,
        color: '#DB4437',
        fontWeight: 'bold',
    },
    whatsappIcon: {
        fontSize: 24,
    },
});

export default InviteFriends