import { useAuth, useUser } from '@clerk/clerk-expo';
import { Feather, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import io from 'socket.io-client';

const backendUrl = 'https://educations.onrender.com'; // ← removed trailing space

/* ---------- Chat Detail Screen ---------- */
const ChatDetailScreen = ({
    selectedConversation,
    messages,
    inputText,
    setInputText,
    handleSendMessage,
    sending,
    scrollRef,
    scrollToBottom,
    setActiveScreen,
}) => (
    <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        Keyboard.dismiss();
                        setActiveScreen('inbox');
                    }}
                >
                    <Feather name="chevron-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {selectedConversation?.otherUser?.name || 'Chat'}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Date badge */}
            <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeText}>Today</Text>
            </View>

            {/* Messages */}
            <ScrollView
                ref={scrollRef}
                style={styles.messageList}
                contentContainerStyle={styles.messagesContent}
                onContentSizeChange={scrollToBottom}
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={false}
            >
                {messages.map((msg) => (
                    <View
                        key={msg._id}
                        style={[
                            styles.messageRow,
                            msg.sent ? styles.userRow : styles.adminRow,
                        ]}
                    >
                        <View style={styles.messageWrapper}>
                            <View
                                style={[
                                    styles.bubble,
                                    msg.sent ? styles.userBubble : styles.adminBubble,
                                ]}
                            >
                                {/* MESSAGE TEXT */}
                                <Text
                                    style={[
                                        styles.bubbleText,
                                        msg.sent ? styles.messageTextSent : styles.messageTextReceived,
                                    ]}
                                >
                                    {msg.text}
                                </Text>

                                {/* TIMESTAMP + CHECKMARKS */}
                                <View style={styles.timestampRow}>
                                    <Text
                                        style={[
                                            styles.timestamp,
                                            msg.sent ? styles.messageTimeSent : styles.messageTimeReceived,
                                        ]}
                                    >
                                        {msg.time}
                                    </Text>

                                    {msg.sent && (
                                        <View style={styles.deliveryStatus}>
                                            <Text style={styles.checkmark}>✓</Text>
                                            {msg.delivered && (
                                                <Text style={[styles.checkmark, styles.checkmarkDelivered]}>
                                                    ✓
                                                </Text>
                                            )}
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Input bar */}
            <View style={styles.inputBar}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Type a message..."
                    placeholderTextColor="#6B7280"
                    value={inputText}
                    onChangeText={setInputText}
                    returnKeyType="send"
                    blurOnSubmit={false}
                    onSubmitEditing={handleSendMessage}
                    multiline
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        (!inputText.trim() || sending) && styles.sendDisabled,
                    ]}
                    onPress={handleSendMessage}
                    disabled={!inputText.trim() || sending}
                    activeOpacity={0.7}
                >
                    {sending ? (
                        <ActivityIndicator size={20} color="#FFF" />
                    ) : (
                        <Feather name="send" size={22} color="#FFF" />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    </SafeAreaView>
);

/* ---------- Main Inbox Component ---------- */
const Inbox = () => {
    const router = useRouter();
    const { getToken } = useAuth();
    const { user } = useUser();

    const [activeScreen, setActiveScreen] = useState('inbox');
    const [activeTab, setActiveTab] = useState('inbox');

    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const socketRef = useRef(null);
    const scrollRef = useRef(null);

    /* Socket */
    useEffect(() => {
        const initSocket = async () => {
            const token = await getToken();
            if (!token) return;
            const socket = io(backendUrl, { auth: { token }, transports: ['websocket'] });
            socketRef.current = socket;

            socket.on('connect', () => console.log('Socket connected'));
            socket.on('new_message', ({ conversationId, message }) => {
                if (selectedConversation?._id === conversationId) {
                    setMessages((prev) => {
                        if (prev.some((m) => m._id === message._id)) return prev;
                        return [...prev, { ...message, sent: message.sender === user?.id, delivered: message.sender === user?.id }];
                    });
                    scrollToBottom();
                }
            });
            socket.on('conversation_updated', loadConversations);
            socket.on('connect_error', (err) => console.error('Socket error:', err.message));
        };
        initSocket();
        return () => socketRef.current?.disconnect();
    }, [getToken, user?.id, selectedConversation]);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, []);

    const loadConversations = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const res = await axios.get(`${backendUrl}/api/chat/conversations`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.success) setConversations(res.data.conversations || []);
        } catch (err) {
            console.error('Load conversations error:', err);
            Alert.alert('Error', 'Failed to load chats');
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (convId) => {
        try {
            const token = await getToken();
            const res = await axios.get(`${backendUrl}/api/chat/conversation/${convId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.success) {
                const loaded = res.data.messages.map((msg) => ({
                    ...msg,
                    delivered: msg.sender === user?.id,
                    time: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                }));
                setMessages(loaded);
                scrollToBottom();
            }
        } catch (err) {
            console.error('Load messages error:', err);
        }
    };

    const handleSendMessage = useCallback(async () => {
        if (!inputText.trim() || !selectedConversation || sending) return;
        const tempId = `temp-${Date.now()}`;
        const optimisticMessage = {
            _id: tempId,
            text: inputText.trim(),
            sent: true,
            delivered: false,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, optimisticMessage]);
        const textToSend = inputText.trim();
        setInputText('');
        setSending(true);
        scrollToBottom();

        try {
            const token = await getToken();
            const res = await axios.post(
                `${backendUrl}/api/chat/send-message`,
                { conversationId: selectedConversation._id, message: textToSend },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                const realMessage = {
                    ...res.data.message,
                    sent: true,
                    delivered: true,
                    time: new Date(res.data.message.createdAt || Date.now()).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                };
                setMessages((prev) => prev.map((m) => (m._id === tempId ? realMessage : m)));
            }
        } catch (err) {
            console.error('Send failed:', err);
            Alert.alert('Error', 'Failed to send message');
            setMessages((prev) => prev.filter((m) => m._id !== tempId));
        } finally {
            setSending(false);
        }
    }, [inputText, selectedConversation, sending, scrollToBottom, getToken]);

    useEffect(() => {
        loadConversations();
    }, []);

    /* ---------- screens ---------- */
    const InboxList = () => (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Inbox</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#1E88FF" style={{ flex: 1, justifyContent: 'center' }} />
            ) : conversations.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#666', fontSize: 16 }}>No conversations yet</Text>
                </View>
            ) : (
                <ScrollView style={styles.chatList}>
                    {conversations.map((conv) => (
                        <TouchableOpacity key={conv._id} style={styles.chatItem} onPress={() => openChat(conv)}>
                            <View style={styles.avatar} />
                            <View style={styles.chatContent}>
                                <Text style={styles.chatName}>{conv.otherUser?.name || 'User'}</Text>
                                <Text style={styles.chatMessage} numberOfLines={1}>
                                    {conv.lastMessage?.text || 'Start chatting'}
                                </Text>
                            </View>
                            <View style={styles.chatRight}>
                                {conv.unreadCount > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{conv.unreadCount}</Text>
                                    </View>
                                )}
                                <Text style={styles.chatTime}>
                                    {conv.lastMessageTime
                                        ? new Date(conv.lastMessageTime).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })
                                        : ''}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/')}>
                    <Ionicons name="home" size={22} color={activeTab === 'home' ? '#1E88FF' : '#8E8E93'} />
                    <Text style={[styles.navLabel, { color: activeTab === 'home' ? '#1E88FF' : '#8E8E93' }]}>HOME</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/screen/myCourses')}>
                    <Ionicons name="book-outline" size={22} color={activeTab === 'myCourses' ? '#1E88FF' : '#8E8E93'} />
                    <Text style={[styles.navLabel, { color: activeTab === 'myCourses' ? '#1E88FF' : '#8E8E93' }]}>MY COURSES</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('inbox')}>
                    <Ionicons name="chatbubble-outline" size={22} color={activeTab === 'inbox' ? '#1E88FF' : '#8E8E93'} />
                    <Text style={[styles.navLabel, { color: activeTab === 'inbox' ? '#1E88FF' : '#8E8E93' }]}>INBOX</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/screen/transactions')}>
                    <Ionicons name="wallet-outline" size={22} color={activeTab === 'transactions' ? '#1E88FF' : '#8E8E93'} />
                    <Text style={[styles.navLabel, { color: activeTab === 'transactions' ? '#1E88FF' : '#8E8E93' }]}>TRANSACTION</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/screen/profile')}>
                    <Ionicons name="person-outline" size={22} color={activeTab === 'profile' ? '#1E88FF' : '#8E8E93'} />
                    <Text style={[styles.navLabel, { color: activeTab === 'profile' ? '#1E88FF' : '#8E8E93' }]}>PROFILE</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );

    const openChat = (conv) => {
        setSelectedConversation(conv);
        loadMessages(conv._id);
        setActiveScreen('chatDetail');
    };

    if (activeScreen === 'chatDetail') {
        return (
            <ChatDetailScreen
                selectedConversation={selectedConversation}
                messages={messages}
                inputText={inputText}
                setInputText={setInputText}
                handleSendMessage={handleSendMessage}
                sending={sending}
                scrollRef={scrollRef}
                scrollToBottom={scrollToBottom}
                setActiveScreen={setActiveScreen}
            />
        );
    }

    return <InboxList />;
};

/* ---------- styles ---------- */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 40,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
    chatList: { flex: 1 },
    chatItem: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#000', marginRight: 12 },
    chatContent: { flex: 1 },
    chatName: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 4 },
    chatMessage: { fontSize: 14, color: '#6B7280' },
    chatRight: { alignItems: 'flex-end' },
    badge: {
        backgroundColor: '#1E88FF',
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        marginBottom: 4,
    },
    badgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
    chatTime: { fontSize: 12, color: '#9CA3AF' },
    dateBadge: {
        alignSelf: 'center',
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
        marginVertical: 16,
    },
    dateBadgeText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
    messageList: { flex: 1 },
    messagesContent: { paddingHorizontal: 16, paddingBottom: 20, flexGrow: 1 },
    messageRow: { marginVertical: 8, alignItems: 'flex-end' },
    userRow: { alignItems: 'flex-end' },
    adminRow: { alignItems: 'flex-start' },
    messageWrapper: { maxWidth: '75%' },
    bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, marginBottom: 4 },
    userBubble: { backgroundColor: '#1E88FF', borderBottomRightRadius: 4 },
    adminBubble: { backgroundColor: '#F3F4F6', borderBottomLeftRadius: 4 },
    bubbleText: { fontSize: 15, lineHeight: 20 },
    messageTextSent: { color: '#FFF' },
    messageTextReceived: { color: '#000' },
    timestampRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
    },
    timestamp: { fontSize: 11, marginHorizontal: 4 },
    messageTimeSent: { color: '#D1FAE5' },
    messageTimeReceived: { color: '#9CA3AF' },
    deliveryStatus: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
    checkmark: { fontSize: 14, color: '#D1FAE5', marginLeft: -6 },
    checkmarkDelivered: { color: '#1E88FF' },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        paddingBottom: Platform.OS === 'android' ? 8 : 12,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    textInput: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        color: '#000',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        maxHeight: 100,
        fontSize: 15,
        marginRight: 8,
    },
    sendButton: { backgroundColor: '#1E88FF', padding: 12, borderRadius: 50 },
    sendDisabled: { backgroundColor: '#9CA3AF' },
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

export default Inbox;
