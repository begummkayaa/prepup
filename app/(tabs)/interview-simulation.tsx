import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatMessageBubble } from '@/components/interview-simulation/chat-message-bubble';
import { SimulationHeader } from '@/components/interview-simulation/simulation-header';
import { BackHeader } from '@/components/navigation/back-header';
import { useUserProfile } from '@/contexts/user-profile-context';
import {
  fetchInterviewSummary,
  fetchNextQuestion,
  type InterviewMessage,
} from '@/lib/interview-api';

const TOTAL_QUESTIONS = 5;

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
  const params = useLocalSearchParams<{ targetRole?: string; sector?: string }>();
  const targetRole = params.targetRole?.trim() || 'Yazılım Geliştirici';
  const sector = params.sector?.trim() || '';

  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<InterviewMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const canSend = inputValue.trim().length > 0 && !loadingAI && !sessionDone;
  const canFinish = (sessionDone || isLastQuestion) && history.length >= 2;

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingAI(true);
    setErrorMessage('');

    fetchNextQuestion({
      targetRole,
      sector: sector || undefined,
      history: [],
      questionNumber: 1,
      totalQuestions: TOTAL_QUESTIONS,
    })
      .then(result => {
        if (cancelled) return;
        const aiMsg: ChatMessage = {
          id: 'ai-0',
          role: 'assistant',
          content: result.question,
          meta: `Prepup AI • Soru 1/${TOTAL_QUESTIONS}`,
        };
        setMessages([aiMsg]);
        setHistory([{ role: 'model', content: result.question }]);
        setQuestionNumber(1);
        setIsLastQuestion(result.isLast);
        scrollToBottom();
      })
      .catch(e => {
        if (cancelled) return;
        setErrorMessage(e instanceof Error ? e.message : 'İlk soru alınamadı. Tekrar dene.');
      })
      .finally(() => {
        if (!cancelled) setLoadingAI(false);
      });

    return () => {
      cancelled = true;
    };
    // sadece mount'ta çalışsın
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || loadingAI || sessionDone) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      meta: `${profile.firstName || 'Siz'} • şimdi`,
    };

    const updatedHistory: InterviewMessage[] = [
      ...history,
      { role: 'user', content: trimmed },
    ];

    setMessages(prev => [...prev, userMsg]);
    setHistory(updatedHistory);
    setInputValue('');
    setErrorMessage('');
    scrollToBottom();

    const nextQNum = questionNumber + 1;
    setLoadingAI(true);

    try {
      const result = await fetchNextQuestion({
        targetRole,
        sector: sector || undefined,
        history: updatedHistory,
        questionNumber: nextQNum,
        totalQuestions: TOTAL_QUESTIONS,
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: result.question,
        meta: result.isLast
          ? 'Prepup AI • Kapanış'
          : `Prepup AI • Soru ${nextQNum}/${TOTAL_QUESTIONS}`,
      };

      setMessages(prev => [...prev, aiMsg]);
      setHistory(prev => [...prev, { role: 'model', content: result.question }]);
      setQuestionNumber(nextQNum);
      setIsLastQuestion(result.isLast);
      if (result.isLast) setSessionDone(true);
      scrollToBottom();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Cevap alınamadı. Tekrar dene.');
    } finally {
      setLoadingAI(false);
    }
  }, [
    inputValue,
    loadingAI,
    sessionDone,
    history,
    questionNumber,
    targetRole,
    sector,
    profile.firstName,
    scrollToBottom,
  ]);

  const handleGoToSummary = useCallback(async () => {
    if (loadingSummary || history.length < 2) return;
    setLoadingSummary(true);
    setErrorMessage('');
    try {
      const summary = await fetchInterviewSummary({
        targetRole,
        sector: sector || undefined,
        history,
      });
      router.push({
        pathname: '/interview-summary',
        params: {
          targetRole,
          summary: encodeURIComponent(JSON.stringify(summary)),
        },
      });
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Özet oluşturulamadı. Tekrar dene.');
    } finally {
      setLoadingSummary(false);
    }
  }, [loadingSummary, history, targetRole, sector, router]);

  return (
    <LinearGradient colors={['#020617', '#0B0F2A']} style={styles.pageBackground}>
      <SafeAreaView style={[styles.safeArea, isWeb && styles.safeAreaWeb]}>
        <View style={styles.pageContent}>
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, isWeb && styles.scrollContentWeb]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View style={styles.topRow}>
              <BackHeader />
              {canFinish && (
                <Pressable
                  onPress={() => void handleGoToSummary()}
                  style={styles.summaryLink}
                  disabled={loadingSummary}>
                  {loadingSummary ? (
                    <ActivityIndicator size="small" color="#C4B5FD" />
                  ) : (
                    <Text style={styles.summaryLinkText}>Özete git</Text>
                  )}
                </Pressable>
              )}
            </View>

            <SimulationHeader userName={profile.fullName} targetRole={targetRole} />

            <View style={styles.messagesContainer}>
              {loadingAI && messages.length === 0 && (
                <View style={styles.loadingFirstMsg}>
                  <ActivityIndicator color="#A78BFA" size="large" />
                  <Text style={styles.loadingText}>Mülakat hazırlanıyor...</Text>
                </View>
              )}

              {messages.map(msg => (
                <ChatMessageBubble
                  key={msg.id}
                  content={msg.content}
                  role={msg.role}
                  meta={msg.meta}
                />
              ))}

              {loadingAI && messages.length > 0 && (
                <View style={styles.typingWrap}>
                  <ActivityIndicator size="small" color="#A78BFA" />
                  <Text style={styles.typingText}>Yanıt hazırlanıyor...</Text>
                </View>
              )}
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            {sessionDone && !loadingSummary && (
              <Pressable
                onPress={() => void handleGoToSummary()}
                style={styles.finishButton}>
                <Text style={styles.finishButtonText}>Performans Özetini Gör</Text>
                <Ionicons name="arrow-forward" size={18} color="#0F172A" />
              </Pressable>
            )}
          </ScrollView>

          <View style={[styles.inputWrap, isWeb && styles.inputWrapWeb]}>
            <View style={[styles.inputRow, sessionDone && styles.inputRowDisabled]}>
              <TextInput
                value={inputValue}
                onChangeText={setInputValue}
                placeholder={sessionDone ? 'Mülakat tamamlandı' : 'Cevabını buraya yaz...'}
                placeholderTextColor="#6B7280"
                style={styles.textInput}
                maxLength={1000}
                multiline
                editable={!sessionDone && !loadingAI}
                onSubmitEditing={() => void handleSend()}
              />
              <Pressable
                onPress={() => void handleSend()}
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
  safeAreaWeb: { paddingTop: 60, paddingHorizontal: 0 },
  pageContent: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },
  scrollContentWeb: {
    maxWidth: 860,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 40,
    paddingBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLink: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(167, 139, 250, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.28)',
    minWidth: 80,
    alignItems: 'center',
  },
  summaryLinkText: { color: '#C4B5FD', fontSize: 13, fontWeight: '700' },
  messagesContainer: { marginTop: 10, gap: 8 },
  loadingFirstMsg: {
    marginTop: 60,
    alignItems: 'center',
    gap: 14,
  },
  loadingText: { color: '#8B97B1', fontSize: 14 },
  typingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
  },
  typingText: { color: '#8B97B1', fontSize: 13 },
  errorText: {
    marginTop: 12,
    color: '#F87171',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  finishButton: {
    marginTop: 20,
    marginBottom: 8,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#C4B5FD',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  finishButtonText: { color: '#0F172A', fontSize: 15, fontWeight: '800' },
  inputWrap: {
    paddingTop: 8,
    paddingBottom: 56,
  },
  inputWrapWeb: {
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 40,
    maxWidth: 860,
    width: '100%',
    alignSelf: 'center',
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
  inputRowDisabled: {
    opacity: 0.5,
  },
  textInput: {
    flex: 1,
    minHeight: 22,
    maxHeight: 120,
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
  sendButtonDisabled: { opacity: 0.45 },
  sendButtonPressed: { opacity: 0.8 },
});
