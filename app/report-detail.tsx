import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useInterviewAccess } from '@/contexts/interview-access-context';
import type { CvReportPayload, InterviewReportPayload } from '@/lib/report-detail-mocks';
import { getReportDetailMock } from '@/lib/report-detail-mocks';

const BG_DEEP = '#0D0D17';
const CARD_BG = '#161626';
const ACCENT = '#A890FE';
const MUTED = '#8E8E93';

export default function ReportDetailScreen() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();
  const rawId = useLocalSearchParams<{ id?: string | string[] }>().id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const report = getReportDetailMock(id);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const cardWidth = Math.min(width - 40, 520);
  const { hasCompletedInterviewSimulation, isLoading: interviewLoading } = useInterviewAccess();

  const retryInterview = () => {
    if (interviewLoading) {
      router.push('/interview-simulation');
      return;
    }
    if (hasCompletedInterviewSimulation) {
      router.push('/interview-preparation');
    } else {
      router.push('/interview-simulation');
    }
  };

  if (!report) {
    return (
      <LinearGradient colors={['#020617', '#0B0F2A']} style={styles.page}>
        <SafeAreaView style={[styles.safe, isWeb && styles.safeWeb]}>
          <View style={styles.topBar}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed, hovered }) => [
                styles.iconBtn,
                pressed && styles.pressed,
                isWeb && hovered && styles.hover,
              ]}
              hitSlop={12}>
              <Ionicons name="chevron-back" size={22} color="#C4B5FD" />
            </Pressable>
            <Text style={styles.topTitle}>Rapor Detayı</Text>
            <View style={styles.topSpacer} />
          </View>
          <Text style={styles.emptyText}>Rapor bulunamadı.</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#020617', BG_DEEP]} style={styles.page}>
      <SafeAreaView style={[styles.safe, isWeb && styles.safeWeb]} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed, hovered }) => [
              styles.iconBtn,
              pressed && styles.pressed,
              isWeb && hovered && styles.hover,
            ]}
            hitSlop={12}>
            <Ionicons name="chevron-back" size={22} color="#C4B5FD" />
          </Pressable>
          <Text style={styles.topTitle}>Rapor Detayı</Text>
          <View style={styles.topSpacer} />
        </View>

        <ScrollView
          style={styles.scrollFlex}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {report.kind === 'interview' ? (
            <InterviewDetailBody report={report} cardInnerWidth={cardWidth - 32} />
          ) : (
            <CvDetailBody report={report} cardInnerWidth={cardWidth - 32} />
          )}
        </ScrollView>

        <View style={[styles.footerSafe, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          {report.kind === 'interview' ? (
            <Pressable onPress={retryInterview} style={({ pressed }) => [styles.ctaBtn, pressed && styles.ctaPressed]}>
              <Text style={styles.ctaTextInterview}>Tekrar Pratik Yap</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.push('/cv-analysis')}
              style={({ pressed }) => [styles.ctaBtn, pressed && styles.ctaPressed]}>
              <Text style={styles.ctaTextInterview}>Yeni CV Analizi</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function InterviewDetailBody({
  report,
  cardInnerWidth,
}: {
  report: InterviewReportPayload;
  cardInnerWidth: number;
}) {
  const pct = Math.min(100, Math.max(0, report.score));

  return (
    <>
      <LinearGradient colors={['#1a1a2e', '#161626']} style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>MÜLAKAT TARİHİ</Text>
            <Text style={styles.summaryValue}>{report.dateLabel}</Text>
          </View>
          <View style={[styles.summaryCol, styles.summaryColRight]}>
            <Text style={styles.summaryLabel}>GENEL SKOR</Text>
            <Text style={styles.scoreBig}>
              {report.score}
              <Text style={styles.scoreSlash}>/100</Text>
            </Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: (cardInnerWidth * pct) / 100 }]} />
        </View>
      </LinearGradient>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Mülakat Analizi</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{report.questions.length} Soru</Text>
        </View>
      </View>

      {report.questions.map((q, i) => (
        <View key={i} style={styles.qBlock}>
          <View style={styles.qTopRow}>
            <View style={styles.qNumCircle}>
              <Text style={styles.qNumText}>{String(i + 1).padStart(2, '0')}</Text>
            </View>
            <View style={styles.qContent}>
              <Text style={styles.qLabel}>SORU</Text>
              <Text style={styles.qText}>{q.question}</Text>
            </View>
          </View>

          <View style={styles.answerBlock}>
            <View style={styles.answerLabelRow}>
              <Ionicons name="person-circle-outline" size={16} color={MUTED} />
              <Text style={styles.answerLabel}>CEVABINIZ</Text>
            </View>
            <Text style={styles.answerItalic}>{q.answer}</Text>
          </View>

          <View style={styles.aiBox}>
            <View style={styles.aiLabelRow}>
              <MaterialIcons name="auto-awesome" size={14} color={ACCENT} />
              <Text style={styles.aiLabel}>AI GERİ BİLDİRİMİ</Text>
            </View>
            <Text style={styles.aiBody}>{q.aiFeedback}</Text>
          </View>
        </View>
      ))}
    </>
  );
}

function CvDetailBody({
  report,
  cardInnerWidth,
}: {
  report: CvReportPayload;
  cardInnerWidth: number;
}) {
  const pct = Math.min(100, Math.max(0, report.matchPercent));

  return (
    <>
      <LinearGradient colors={['#1a1a2e', '#161626']} style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>ANALİZ TARİHİ</Text>
            <Text style={styles.summaryValue}>{report.dateLabel}</Text>
          </View>
          <View style={[styles.summaryCol, styles.summaryColRight]}>
            <Text style={styles.summaryLabel}>UYUMLULUK</Text>
            <Text style={styles.scoreBig}>{`%${report.matchPercent}`}</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: (cardInnerWidth * pct) / 100 }]} />
        </View>
      </LinearGradient>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>CV Analizi</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{report.highlights.length} Alan</Text>
        </View>
      </View>

      {report.highlights.map((h, i) => (
        <View key={i} style={styles.qBlock}>
          <View style={styles.qTopRow}>
            <View style={styles.qNumCircle}>
              <Text style={styles.qNumText}>{String(i + 1).padStart(2, '0')}</Text>
            </View>
            <View style={styles.qContent}>
              <Text style={styles.qLabel}>BAŞLIK</Text>
              <Text style={styles.qText}>{h.title}</Text>
            </View>
          </View>

          <View style={styles.answerBlock}>
            <Text style={styles.answerLabelRowPlain}>ÖZET</Text>
            <Text style={styles.cvSummaryBody}>{h.summary}</Text>
          </View>

          <View style={styles.aiBox}>
            <View style={styles.aiLabelRow}>
              <MaterialIcons name="auto-awesome" size={14} color={ACCENT} />
              <Text style={styles.aiLabel}>AI ÖNERİSİ</Text>
            </View>
            <Text style={styles.aiBody}>{h.aiSuggestion}</Text>
          </View>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 20 },
  safeWeb: { maxWidth: 560, alignSelf: 'center', width: '100%' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 8,
  },
  topTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.14)',
  },
  hover: {
    borderColor: 'rgba(196, 181, 253, 0.35)',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
  },
  pressed: { opacity: 0.82 },
  topSpacer: { width: 40, height: 40 },
  emptyText: { color: MUTED, marginTop: 24, fontSize: 15, textAlign: 'center' },

  scrollFlex: { flex: 1 },
  scroll: { paddingBottom: 24 },

  summaryCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 144, 254, 0.12)',
    marginBottom: 22,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  summaryCol: { flex: 1 },
  summaryColRight: { alignItems: 'flex-end' },
  summaryLabel: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  summaryValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  scoreBig: { color: ACCENT, fontSize: 28, fontWeight: '900' },
  scoreSlash: { fontSize: 16, fontWeight: '700', color: ACCENT },

  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0f0f18',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: ACCENT,
  },

  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  badge: {
    backgroundColor: 'rgba(168, 144, 254, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(168, 144, 254, 0.35)',
  },
  badgeText: { color: ACCENT, fontSize: 12, fontWeight: '800' },

  qBlock: { marginBottom: 24 },
  qTopRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  qNumCircle: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: ACCENT,
    backgroundColor: '#0f0f18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qNumText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  qContent: { flex: 1 },
  qLabel: { color: MUTED, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 4 },
  qText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', lineHeight: 22 },

  answerBlock: { marginTop: 14, marginLeft: 48 },
  answerLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  answerLabelRowPlain: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  answerLabel: { color: MUTED, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  answerItalic: {
    color: '#B8B8C6',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 22,
    fontWeight: '500',
  },
  cvSummaryBody: { color: '#E2E8F0', fontSize: 14, lineHeight: 22, fontWeight: '500' },

  aiBox: {
    marginTop: 14,
    marginLeft: 48,
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
    borderWidth: 1,
    borderColor: 'rgba(168, 144, 254, 0.2)',
    borderRightColor: 'rgba(148, 163, 184, 0.12)',
    borderTopColor: 'rgba(148, 163, 184, 0.12)',
    borderBottomColor: 'rgba(148, 163, 184, 0.12)',
  },
  aiLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  aiLabel: { color: ACCENT, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  aiBody: { color: '#FFFFFF', fontSize: 14, lineHeight: 22, fontWeight: '600' },

  footerSafe: {
    paddingTop: 10,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
  },
  ctaBtn: {
    borderRadius: 26,
    backgroundColor: ACCENT,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPressed: { opacity: 0.9 },
  ctaTextInterview: { color: '#12121C', fontSize: 16, fontWeight: '900', letterSpacing: 0.3 },
});
