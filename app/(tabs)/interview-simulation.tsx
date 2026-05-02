import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatMessageBubble } from '@/components/interview-simulation/chat-message-bubble';
import { SimulationHeader } from '@/components/interview-simulation/simulation-header';
import { BackHeader } from '@/components/navigation/back-header';
import { useUserProfile } from '@/contexts/user-profile-context';

type ChatMessage = {
  id: string;
  content: string;
  role: 'assistant' | 'user';
  meta: string;
};

export default function InterviewSimulationScreen() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();
  const { profile } = useUserProfile();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');

  const canSend = inputValue.trim().length > 0;

  const seedMessages = useMemo<ChatMessage[]>(
    () => [
      {
        id: 'assistant-first',
        role: 'assistant',
        content: `Harika ${profile.firstName}, başlayalım. İlk sorum: Mülakat simülasyonu geliştirirken yaşadığın en kritik teknik problemi ve bunu nasıl çözdüğünü anlatır mısın?`,
        meta: 'Prepup AI • şimdi',
      },
    ],
    [profile.firstName]
  );

  useEffect(() => {
    if (messages.length > 0) {
      return;
    }
    setMessages(seedMessages);
  }, [messages.length, seedMessages]);

  const contentContainerStyle = useMemo(
    () => [styles.scrollContent, isWeb && styles.scrollContentWeb],
    [isWeb]
  );

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      return;
    }
    const nextMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: trimmed,
      role: 'user',
      meta: 'siz • şimdi',
    };
    setMessages((current) => [...current, nextMessage]);
    setInputValue('');
  };

  return (
    <LinearGradient colors={['#020617', '#0B0F2A']} style={styles.pageBackground}>
      <SafeAreaView style={[styles.safeArea, isWeb && styles.safeAreaWeb]}>
        <View style={styles.pageContent}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={contentContainerStyle}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View style={styles.topRow}>
              <BackHeader />
              <Pressable onPress={() => router.push('/interview-summary')} style={styles.summaryLink}>
                <Text style={styles.summaryLinkText}>Özete git</Text>
              </Pressable>
            </View>
            <SimulationHeader userName={profile.fullName} targetRole="Yazılım Geliştirici" />

            <View style={styles.messagesContainer}>
              {messages.map((message) => (
                <ChatMessageBubble
                  key={message.id}
                  content={message.content}
                  role={message.role}
                  meta={message.meta}
                />
              ))}
            </View>
          </ScrollView>

          <View style={[styles.inputWrap, isWeb && styles.inputWrapWeb]}>
            <View style={styles.inputRow}>
              <TextInput
                value={inputValue}
                onChangeText={setInputValue}
                placeholder="Cevabını buraya yaz..."
                placeholderTextColor="#6B7280"
                style={styles.textInput}
                maxLength={500}
              />
              <Pressable
                onPress={handleSend}
                disabled={!canSend}
                style={({ pressed }) => [
                  styles.sendButton,
                  !canSend && styles.sendButtonDisabled,
                  pressed && canSend && styles.sendButtonPressed,
                ]}>
                <Ionicons name="arrow-forward" size={22} color="#1E1B4B" />
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  pageBackground: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  safeAreaWeb: {
    paddingHorizontal: 18,
  },
  pageContent: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLink: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(167, 139, 250, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.28)',
  },
  summaryLinkText: {
    color: '#C4B5FD',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 26,
  },
  scrollContentWeb: {
    maxWidth: 780,
    width: '100%',
    alignSelf: 'center',
  },
  messagesContainer: {
    marginTop: 10,
    gap: 8,
  },
  inputWrap: {
    paddingTop: 8,
    paddingBottom: 56,
  },
  inputWrapWeb: {
    marginBottom: 80,
  },
  inputRow: {
    borderRadius: 14,
    backgroundColor: '#040611',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 22,
    color: '#E2E8F0',
    fontSize: 16,
    lineHeight: 22,
    paddingTop: 6,
    paddingBottom: 6,
  },
  sendButton: {
    width: 50,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#A78BFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  sendButtonPressed: {
    opacity: 0.8,
  },
});
