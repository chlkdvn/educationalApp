import { useAuth, useUser } from '@clerk/clerk-expo';
import { Feather } from '@expo/vector-icons';
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

const backendUrl = 'https://educations.onrender.com';

// ChatDetailScreen - stable component (outside Inbox)
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
                <TouchableOpacity onPress={() => {
                    Keyboard.dismiss();
                    setActiveScreen('inbox');
                }}>
                    <Feather name="chevron-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {selectedConversation?.otherUser?.name || 'Chat'}
                </Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity>
                        <Feather name="phone" size={24} color="#000" />
                    </TouchableOpacity>
                    <Feather name="search" size={24} color="#000" style={{ marginLeft: 16 }} />
                </View>
            </View>

            {/* Date Badge */}
            <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeText}>Today</Text>
            </View>

            {/* Messages List */}
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
                                <Text
                                    style={[
                                        styles.bubbleText,
                                        msg.sent ? styles.messageTextSent : styles.messageTextReceived,
                                    ]}
                                >
                                    {msg.text}
                                </Text>

                                {/* Timestamp + Delivery Status */}
                                <View style={styles.timestampRow}>
                                    <Text
                                        style={[
                                            styles.timestamp,
                                            msg.sent ? styles.messageTimeSent : styles.messageTimeReceived,
                                        ]}
                                    >
                                        {msg.time}
                                    </Text>

                                    {/* Only show delivery status for sent messages */}
                                    {msg.sent && (
                                        <View style={styles.deliveryStatus}>
                                            <Text style={styles.checkmark}>✓</Text>
                                            {msg.delivered && (
                                                <Text style={[styles.checkmark, styles.checkmarkDelivered]}>
                                                    ✓
                                                </Text>
                                            )}
                                            {msg.delivered && (
                                                <Text style={styles.deliveredText}>Delivered</Text>
                                            )}
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Simplified Input Bar - Removed emoji & attachment icons */}
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

const Inbox = () => {
    const router = useRouter();
    const { getToken } = useAuth();
    const { user } = useUser();

    const [activeTab, setActiveTab] = useState('Chat');
    const [activeScreen, setActiveScreen] = useState('inbox');
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const socketRef = useRef(null);
    const scrollRef = useRef(null);

    // Socket.io setup
    useEffect(() => {
        const initSocket = async () => {
            const token = await getToken();
            if (!token) return;

            const socket = io(backendUrl, {
                auth: { token },
                transports: ['websocket'],
            });

            socketRef.current = socket;

            socket.on('connect', () => console.log('Socket connected'));

            socket.on('new_message', ({ conversationId, message }) => {
                if (selectedConversation?._id === conversationId) {
                    setMessages(prev => {
                        if (prev.some(m => m._id === message._id)) return prev;
                        return [...prev, {
                            ...message,
                            sent: message.sender === user?.id,
                            delivered: message.sender === user?.id
                        }];
                    });
                    scrollToBottom();
                }
            });

            socket.on('conversation_updated', () => {
                loadConversations();
            });

            socket.on('connect_error', (err) => console.error('Socket error:', err.message));
        };

        initSocket();

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [getToken, user?.id]);

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
                const loaded = res.data.messages.map(msg => ({
                    ...msg,
                    delivered: msg.sent
                }));
                setMessages(loaded);
                setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 200);
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

        setMessages(prev => [...prev, optimisticMessage]);
        const textToSend = inputText.trim();
        setInputText('');
        setSending(true);
        scrollToBottom();

        try {
            const token = await getToken();
            const res = await axios.post(
                `${backendUrl}/api/chat/send-message`,
                {
                    conversationId: selectedConversation._id,
                    message: textToSend
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                const realMessage = {
                    ...res.data.message,
                    sent: true,
                    delivered: true
                };
                setMessages(prev => prev.map(m => m._id === tempId ? realMessage : m));
            }
        } catch (err) {
            console.error('Send failed:', err);
            Alert.alert('Error', 'Failed to send message');
            setMessages(prev => prev.filter(m => m._id !== tempId));
        } finally {
            setSending(false);
        }
    }, [inputText, selectedConversation, sending, scrollToBottom, getToken]);

    useEffect(() => {
        loadConversations();
    }, []);

    const openChat = (conv) => {
        setSelectedConversation(conv);
        loadMessages(conv._id);
        setActiveScreen('chatDetail');
    };

    const InboxScreen = () => (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Feather name="chevron-left" size={24} color="#000" />
                <Text style={styles.headerTitle}>Inbox</Text>
                <Feather name="search" size={24} color="#000" />
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Chat' && styles.tabActive]}
                    onPress={() => setActiveTab('Chat')}
                >
                    <Text style={[styles.tabText, activeTab === 'Chat' && styles.tabTextActive]}>Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Calls' && styles.tabActive]}
                    onPress={() => setActiveTab('Calls')}
                >
                    <Text style={[styles.tabText, activeTab === 'Calls' && styles.tabTextActive]}>Calls</Text>
                </TouchableOpacity>
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
                                            minute: '2-digit'
                                        })
                                        : ''}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    );

    // Removed: CallingScreen, CallsScreen, BottomNav

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

    if (activeTab === 'Calls') {
        return <InboxScreen />; // Placeholder - you can replace with actual Calls screen later
    }

    return <InboxScreen />;
};

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
        backgroundColor: '#FFF',
    },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    tabContainer: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
    tab: { flex: 1, paddingVertical: 12, borderRadius: 24, alignItems: 'center', backgroundColor: '#F9FAFB' },
    tabActive: { backgroundColor: '#1E88FF' },
    tabText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
    tabTextActive: { color: '#FFF' },
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
    badge: { backgroundColor: '#1E88FF', borderRadius: 12, minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, marginBottom: 4 },
    badgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
    chatTime: { fontSize: 12, color: '#9CA3AF' },
    dateBadge: { alignSelf: 'center', backgroundColor: '#E5E7EB', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, marginVertical: 16 },
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
    timestampRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
    timestamp: { fontSize: 11, marginHorizontal: 4 },
    messageTimeSent: { color: '#D1FAE5' },
    messageTimeReceived: { color: '#9CA3AF' },
    deliveryStatus: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
    checkmark: { fontSize: 14, color: '#D1FAE5', marginLeft: -6 },
    checkmarkDelivered: { color: '#1E88FF' },
    deliveredText: { fontSize: 10, color: '#D1FAE5', marginLeft: 6, fontWeight: '500' },
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
});

export default Inbox;