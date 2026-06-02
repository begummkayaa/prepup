import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/navigation/back-header';
import { BottomNavBar } from '@/components/navigation/bottom-nav-bar';
import { useInterviewAccess } from '@/contexts/interview-access-context';
import { useUserProfile } from '@/contexts/user-profile-context';
import { normalizeSummary } from '@/lib/interview-api';

export default function InterviewSummaryScreen() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();
  const { profile } = useUserProfile();
  const { markInterviewSimulationCompleted } = useInterviewAccess();
  const params = useLocalSearchParams<{ targetRole?: string; summary?: string }>();

  const targetRole = params.targetRole?.trim() || 'Yazılım Geliştirici';
  const summary = normalizeSummary(
    params.summary ? JSON.parse(decodeURIComponent(params.summary)) : null,
  );

  useEffect(() => {
    void markInterviewSimulationCompleted();
  }, [markInterviewSimulationCompleted]);

  const scoreColor =
    summary.score >= 80 ? '#86EFAC' : summary.score >= 60 ? '#FCD34D' : '#F87171';

  return (
    <LinearGradient colors={['#020617', '#0B0F2A']} style={styles.pageBackground}>
      <SafeAreaView
        style={[styles.safeArea, isWeb && styles.safeAreaWeb]}
        edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, isWeb && styles.scrollContentWeb]}
          showsVerticalScrollIndicator={false}>
          <BackHeader />

          <View style={styles.headerRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={15} color="#C4B5FD" />
            </View>
            <View>
              <Text style={styles.welcomeText}>Hoş geldin,</Text>
              <Text style={styles.nameText}>{profile.fullName}</Text>
            </View>
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.title}>Performans Özeti</Text>
            <View style={styles.titleUnderline} />
          </View>

          <Text style={styles.roleLabel}>{targetRole} • Mülakat Simülasyonu</Text>

          <LinearGradient colors={['#C4B5FD', '#A78BFA']} style={styles.scoreCard}>
            <View style={styles.scoreRingWrap}>
              <View style={[styles.scoreRing, { borderColor: scoreColor }]}>
                <Text style={styles.scoreValue}>{summary.score}/100</Text>
              </View>
            </View>
            <Text style={styles.scoreTitle}>Genel Başarı Skoru</Text>
            <Text style={styles.scoreDesc}>{summary.overallFeedback}</Text>
          </LinearGradient>

          {summary.questionAnalysis.length > 0 && (
            <>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Soru Analizi</Text>
              </View>

              {summary.questionAnalysis.map((qa, idx) => (
                <View key={idx} style={styles.analysisCard}>
                  <View style={styles.questionRow}>
                    <View style={styles.checkCircle}>
                      <Text style={styles.checkNum}>{idx + 1}</Text>
                    </View>
                    <View style={styles.questionTextWrap}>
                      <Text style={styles.questionLabel}>SORU</Text>
                      <Text style={styles.questionText}>{qa.question}</Text>
                    </View>
                  </View>

                  {qa.answer ? (
                    <View style={styles.answerBlock}>
                      <Text style={styles.fieldLabel}>VERİLEN CEVAP</Text>
                      <View style={styles.answerBox}>
                        <Text style={styles.answerText} numberOfLines={3}>
                          {qa.answer}
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  {qa.feedback ? (
                    <View style={styles.expectedBlock}>
                      <Text style={styles.fieldLabel}>GERİ BİLDİRİM</Text>
                      <Text style={styles.expectedText}>{qa.feedback}</Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </>
          )}

          {summary.tips.length > 0 && (
            <>
              <Text style={styles.sectionTitleBig}>Gelişim Tavsiyeleri</Text>
              <View style={styles.tipsCard}>
                {summary.tips.map((tip, idx) => (
                  <View key={idx} style={styles.tipRow}>
                    <View style={styles.tipDot} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <Pressable
            style={styles.primaryButton}
            onPress={() =>
              router.push({
                pathname: '/interview-simulation',
                params: { targetRole },
              })
            }>
            <MaterialIcons name="replay" size={18} color="#0F172A" />
            <Text style={styles.primaryButtonText}>Simülasyonu Tekrar Başlat</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      <BottomNavBar variant="floating" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  pageBackground: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  safeAreaWeb: { paddingHorizontal: 18 },
  scrollContent: { paddingBottom: 150 },
  scrollContentWeb: { maxWidth: 760, width: '100%', alignSelf: 'center' },

  headerRow: { marginTop: 2, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.26)',
  },
  welcomeText: {
    color: '#8B97B1',
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  nameText: { color: '#A78BFA', fontSize: 17, fontWeight: '600' },

  titleRow: { marginTop: 18 },
  title: { color: '#F8FAFC', fontSize: 40, fontWeight: '800' },
  titleUnderline: { marginTop: 8, width: 36, height: 3, borderRadius: 2, backgroundColor: '#C4B5FD' },
  roleLabel: { marginTop: 8, color: '#64748B', fontSize: 13, fontWeight: '500' },

  scoreCard: { marginTop: 16, borderRadius: 22, paddingHorizontal: 20, paddingVertical: 18 },
  scoreRingWrap: { alignItems: 'center' },
  scoreRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  scoreValue: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  scoreTitle: { marginTop: 12, color: '#0F172A', fontSize: 18, fontWeight: '800', textAlign: 'center' },
  scoreDesc: { marginTop: 8, color: 'rgba(15, 23, 42, 0.8)', fontSize: 13, lineHeight: 20, textAlign: 'center' },

  sectionRow: { marginTop: 18, flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { color: '#E2E8F0', fontSize: 18, fontWeight: '800' },

  analysisCard: {
    marginTop: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    padding: 16,
    gap: 14,
  },
  questionRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#86EFAC',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkNum: { color: '#0F172A', fontSize: 12, fontWeight: '800' },
  questionTextWrap: { flex: 1, gap: 4 },
  questionLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  questionText: { color: '#E2E8F0', fontSize: 15, fontWeight: '700', lineHeight: 22 },

  answerBlock: { gap: 8 },
  fieldLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  answerBox: { borderRadius: 12, backgroundColor: '#0B1226', paddingHorizontal: 12, paddingVertical: 12 },
  answerText: { color: '#C8D1E1', fontSize: 13, lineHeight: 18 },
  expectedBlock: { gap: 6 },
  expectedText: { color: '#94A3B8', fontSize: 12, lineHeight: 18 },

  sectionTitleBig: { marginTop: 18, color: '#E2E8F0', fontSize: 20, fontWeight: '800' },
  tipsCard: {
    marginTop: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    padding: 16,
    gap: 10,
  },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  tipDot: { marginTop: 6, width: 7, height: 7, borderRadius: 999, backgroundColor: '#F472B6', flexShrink: 0 },
  tipText: { flex: 1, color: '#C8D1E1', fontSize: 13, fontWeight: '600', lineHeight: 20 },

  primaryButton: {
    marginTop: 16,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#C4B5FD',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  primaryButtonText: { color: '#0F172A', fontSize: 14, fontWeight: '800' },
});
