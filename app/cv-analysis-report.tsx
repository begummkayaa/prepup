import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/navigation/back-header';
import { BottomNavBar } from '@/components/navigation/bottom-nav-bar';
import { useUserProfile } from '@/contexts/user-profile-context';
import { DEFAULT_CV_ANALYSIS_REPORT, normalizeCvAnalysisReport, type CvAnalysisAiReport } from '@/lib/cv-analysis-types';

const ACCENT_PURPLE = '#B19DFF';
const PAGE_BG = '#0B0E14';

function parseReportParam(raw: string | string[] | undefined): CvAnalysisAiReport {
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (!s || typeof s !== 'string') {
    return DEFAULT_CV_ANALYSIS_REPORT;
  }
  try {
    const json = decodeURIComponent(s);
    const parsed = JSON.parse(json) as Partial<CvAnalysisAiReport>;
    return normalizeCvAnalysisReport(parsed);
  } catch {
    return DEFAULT_CV_ANALYSIS_REPORT;
  }
}

function BulletItem({ text, color }: { text: string; color: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={[styles.bulletDot, { backgroundColor: color }]} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function SectionIconBadge({
  backgroundColor,
  children,
}: {
  backgroundColor: string;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.sectionIconBadge, { backgroundColor }]}>{children}</View>
  );
}

export default function CvAnalysisReportScreen() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();
  const { profile } = useUserProfile();
  const params = useLocalSearchParams<{ targetRole?: string; sector?: string; report?: string }>();
  const targetRole =
    typeof params.targetRole === 'string' && params.targetRole.trim()
      ? params.targetRole.trim()
      : 'Yazılım Geliştirici';
  const sector =
    typeof params.sector === 'string' && params.sector.trim() ? params.sector.trim() : '';

  const report = useMemo(() => parseReportParam(params.report), [params.report]);

  return (
    <View style={styles.pageBackground}>
      <SafeAreaView style={[styles.safeArea, isWeb && styles.safeAreaWeb]} edges={['top', 'left', 'right']}>
        <View style={styles.scrollWrap}>
          <ScrollView
            style={styles.scrollFlex}
            contentContainerStyle={[styles.scrollContent, isWeb && styles.scrollContentWeb]}
            showsVerticalScrollIndicator={false}>
            <BackHeader />
            <View style={styles.headerRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={15} color={ACCENT_PURPLE} />
              </View>
              <View>
                <Text style={styles.welcomeText}>HOŞ GELDİN,</Text>
                <Text style={styles.nameText}>{profile.fullName}</Text>
              </View>
            </View>

            <View style={styles.titleBlock}>
              <Text style={styles.title}>CV Analiz Raporu</Text>
              <Text style={styles.subtitle}>{targetRole} Pozisyonu İçin</Text>
              {sector ? <Text style={styles.sectorLine}>{sector} sektörü</Text> : null}
            </View>

            <LinearGradient colors={['#C9B8FF', ACCENT_PURPLE]} style={styles.scoreCard}>
              <View style={styles.scoreInline}>
                <Text style={styles.scoreValue}>%{report.compatibilityScore}</Text>
                <Text style={styles.scoreLabel}> Uyumluluk Skoru</Text>
              </View>
              <Text style={styles.scoreDescription}>{report.scoreSummary}</Text>
            </LinearGradient>

            <View style={[styles.infoCard, styles.strengthCard]}>
              <View style={styles.infoTitleRow}>
                <SectionIconBadge backgroundColor="#4ADE80">
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </SectionIconBadge>
                <Text style={styles.infoTitle}>Güçlü Yönlerin</Text>
              </View>
              {report.strengths.map((item, index) => (
                <BulletItem key={`s-${index}`} text={item} color="#4ADE80" />
              ))}
            </View>

            <View style={[styles.infoCard, styles.warningCard]}>
              <View style={styles.infoTitleRow}>
                <SectionIconBadge backgroundColor="#FB923C">
                  <Ionicons name="alert" size={14} color="#FFFFFF" />
                </SectionIconBadge>
                <Text style={styles.infoTitle}>Eksik Alanlar</Text>
              </View>
              {report.gaps.map((item, index) => (
                <BulletItem key={`g-${index}`} text={item} color="#FB923C" />
              ))}
            </View>

            <View style={styles.suggestionCard}>
              <View style={styles.infoTitleRow}>
                <Ionicons name="bulb-outline" size={18} color={ACCENT_PURPLE} />
                <Text style={styles.suggestionSectionTitle}>İyileştirme Önerileri</Text>
              </View>

              {report.suggestions.map((item, index) => (
                <View key={`${index}-${item}`} style={styles.suggestionItem}>
                  <Text style={styles.suggestionIndex}>{String(index + 1).padStart(2, '0')}</Text>
                  <Text style={styles.suggestionText}>{item}</Text>
                </View>
              ))}
            </View>

            <Pressable
              style={styles.actionButton}
              onPress={() =>
                router.push({
                  pathname: '/interview-simulation',
                  params: { targetRole, sector },
                })
              }>
              <Text style={styles.actionButtonText}>MÜLAKAT SİMÜLASYONUNA GEÇ</Text>
            </Pressable>
          </ScrollView>
        </View>
        <BottomNavBar variant="docked" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageBackground: { flex: 1, backgroundColor: PAGE_BG },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  safeAreaWeb: {
    paddingTop: 60,
    paddingHorizontal: 18,
  },
  scrollWrap: {
    flex: 1,
    minHeight: 0,
  },
  scrollFlex: { flex: 1 },
  scrollContent: {
    paddingBottom: 140,
  },
  scrollContentWeb: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  headerRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
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
  },
  nameText: {
    color: '#A78BFA',
    fontSize: 17,
    fontWeight: '600',
  },
  titleBlock: {
    marginTop: 18,
    marginBottom: 16,
  },
  title: {
    color: '#E2E8F0',
    fontSize: 52,
    lineHeight: 56,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    color: '#A8B3CC',
    fontSize: 15,
    fontWeight: '500',
  },
  sectorLine: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  scoreCard: {
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 22,
  },
  scoreInline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: 4,
  },
  scoreValue: {
    color: '#0F172A',
    fontSize: 56,
    lineHeight: 62,
    fontWeight: '800',
  },
  scoreLabel: {
    color: '#0F172A',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  scoreDescription: {
    marginTop: 14,
    color: 'rgba(15, 23, 42, 0.8)',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 420,
  },
  infoCard: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: '#15274A',
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.3)',
    borderLeftWidth: 4,
    borderLeftColor: '#4ADE80',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 8,
  },
  strengthCard: {},
  warningCard: {
    borderColor: 'rgba(251, 146, 60, 0.32)',
    borderLeftColor: '#FB923C',
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoTitle: {
    color: '#E2E8F0',
    fontSize: 30,
    fontWeight: '700',
  },
  sectionIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 3,
  },
  bulletDot: {
    marginTop: 9,
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  bulletText: {
    flex: 1,
    color: '#C8D1E1',
    fontSize: 20,
    lineHeight: 28,
  },
  suggestionCard: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: '#030712',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 10,
  },
  suggestionSectionTitle: {
    color: ACCENT_PURPLE,
    fontSize: 18,
    fontWeight: '700',
  },
  suggestionItem: {
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: '#0D1B3A',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  suggestionIndex: {
    color: '#64748B',
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '700',
  },
  suggestionText: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '500',
  },
  actionButton: {
    marginTop: 18,
    height: 66,
    borderRadius: 16,
    backgroundColor: '#BFA5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
});
