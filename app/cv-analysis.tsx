import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
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

import { BackHeader } from '@/components/navigation/back-header';
import { BottomNavBar } from '@/components/navigation/bottom-nav-bar';
import { WebNavBar } from '@/components/navigation/web-nav-bar';
import { useUserProfile } from '@/contexts/user-profile-context';
import { requestCvAnalysis } from '@/lib/cv-analysis-api';
import { readPdfAsBase64, readWebFileAsBase64 } from '@/lib/read-pdf-base64';

function isPdf(fileName?: string, mimeType?: string | null, fileUri?: string) {
  const hasPdfExtension = fileName?.toLowerCase().endsWith('.pdf');
  const hasPdfInUri = fileUri?.toLowerCase().includes('.pdf');
  return mimeType === 'application/pdf' || Boolean(hasPdfExtension) || Boolean(hasPdfInUri);
}

function resolveFileName(fileName?: string, fileUri?: string) {
  if (fileName?.trim()) {
    return fileName;
  }

  if (fileUri?.trim()) {
    const uriParts = fileUri.split('/');
    const lastPart = uriParts[uriParts.length - 1];
    if (lastPart?.trim()) {
      return decodeURIComponent(lastPart);
    }
  }

  return 'cv-dosyasi.pdf';
}

export default function CvAnalysisScreen() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();
  const { profile } = useUserProfile();
  const webDropZoneRef = useRef<View>(null);
  const skipWebClickAfterDropRef = useRef(false);
  /** Web: sürüklenen gerçek File nesnesi (fetch(uri) bazen yerel dosyayı okuyamaz). */
  const webDroppedPdfRef = useRef<File | null>(null);
  /** Çarpı (temizle) ile aynı jestte üst alanın dosya seçiciyi açmasını engeller (web + iç içe Pressable). */
  const suppressPickerOpenRef = useRef(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [targetRole, setTargetRole] = useState('');
  const [sector, setSector] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const canStartAnalysis = Boolean(fileName && targetRole.trim() && sector.trim());

  const pickPdf = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return;
    }

    const selectedFile = result.assets[0];
    const safeFileName = resolveFileName(selectedFile.name, selectedFile.uri);
    // Native picker zaten PDF type filtresiyle acildigi icin burada tekrar engelleyici kontrol yapmiyoruz.
    webDroppedPdfRef.current = null;
    setErrorMessage('');
    setFileName(safeFileName);
    setFileUri(selectedFile.uri ?? null);
  }, []);

  const clearPdf = useCallback(() => {
    webDroppedPdfRef.current = null;
    setFileName(null);
    setFileUri(null);
    setErrorMessage('');
  }, []);

  const startAnalysis = useCallback(async () => {
    if (!canStartAnalysis || submitting) {
      return;
    }

    setErrorMessage('');
    setSubmitting(true);
    try {
      let pdfBase64: string;
      try {
        // Kullanıcı butona ikinci kez basmasın diye submitting'i hemen kilitliyoruz.
        if (isWeb && webDroppedPdfRef.current) {
          pdfBase64 = await readWebFileAsBase64(webDroppedPdfRef.current);
        } else if (fileUri) {
          pdfBase64 = await readPdfAsBase64(fileUri);
        } else {
          setErrorMessage('Dosya okunamadi. Lutfen PDFi yeniden secin.');
          return;
        }
      } catch {
        setErrorMessage('PDF okunurken bir hata olustu.');
        return;
      }

      const report = await requestCvAnalysis({
        pdfBase64,
        targetRole: targetRole.trim(),
        sector: sector.trim(),
        fileName: fileName ?? undefined,
      });
      router.push({
        pathname: '/cv-analysis-report',
        params: {
          targetRole: targetRole.trim(),
          sector: sector.trim(),
          report: encodeURIComponent(JSON.stringify(report)),
        },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Analiz baslatilamadi.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  }, [
    canStartAnalysis,
    submitting,
    isWeb,
    fileUri,
    targetRole,
    sector,
    fileName,
    router,
  ]);

  const openPdfPickerUnlessSuppressed = useCallback(() => {
    if (suppressPickerOpenRef.current) {
      suppressPickerOpenRef.current = false;
      return;
    }
    void pickPdf();
  }, [pickPdf]);

  // react-native-web View; onDrop/onDragOver DOM'a iletilmediği için ref üzerinden dinliyoruz.
  useLayoutEffect(() => {
    if (!isWeb) {
      return;
    }

    const el = webDropZoneRef.current as unknown as HTMLElement | null;
    if (!el?.addEventListener) {
      return;
    }

    const handleClick = () => {
      if (skipWebClickAfterDropRef.current) {
        return;
      }
      openPdfPickerUnlessSuppressed();
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const droppedFile = e.dataTransfer?.files?.[0];
      if (!droppedFile) {
        return;
      }
      const safeFileName = resolveFileName(droppedFile.name);
      if (!isPdf(safeFileName, droppedFile.type)) {
        setErrorMessage('Sadece PDF dosyasi yukleyebilirsiniz.');
        return;
      }
      webDroppedPdfRef.current = droppedFile;
      setFileUri(null);
      setErrorMessage('');
      setFileName(safeFileName);
      skipWebClickAfterDropRef.current = true;
      window.setTimeout(() => {
        skipWebClickAfterDropRef.current = false;
      }, 400);
    };

    el.addEventListener('click', handleClick);
    el.addEventListener('dragover', handleDragOver);
    el.addEventListener('drop', handleDrop);
    el.setAttribute('role', 'button');
    return () => {
      el.removeEventListener('click', handleClick);
      el.removeEventListener('dragover', handleDragOver);
      el.removeEventListener('drop', handleDrop);
      el.removeAttribute('role');
    };
  }, [isWeb, openPdfPickerUnlessSuppressed]);

  const selectedFileBadge = fileName ? (
    <View style={styles.fileBadge}>
      <View style={styles.fileBadgeCheckWrap}>
        <Ionicons name="checkmark-circle" size={16} color="#86EFAC" />
      </View>
      <Text style={styles.fileBadgeText} numberOfLines={1}>
        {fileName}
      </Text>
      <Pressable
        onPressIn={() => {
          suppressPickerOpenRef.current = true;
        }}
        onPress={() => {
          clearPdf();
          setTimeout(() => {
            suppressPickerOpenRef.current = false;
          }, 100);
        }}
        style={({ pressed }) => [styles.fileBadgeClear, pressed && styles.fileBadgeClearPressed]}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="button"
        accessibilityLabel="Secilen dosyayi kaldir"
      >
        <Ionicons name="close" size={22} color="#F87171" />
      </Pressable>
    </View>
  ) : null;

  if (isWeb) {
    return (
      <LinearGradient colors={['#020617', '#0B0F2A']} style={styles.pageBackground}>
        <WebNavBar />
        <SafeAreaView style={styles.safeAreaWeb} edges={[]}>
          <ScrollView
            contentContainerStyle={styles.webScrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">

            {/* Back button — tam sol kenar */}
            <View style={styles.webBackRow}>
              <BackHeader />
            </View>

            <View style={styles.webInner}>
              {/* Top row — sadece sağdaki boşluk için */}
              <View style={styles.webTopRow} />

              {/* Two-column body */}
              <View style={styles.webColumns}>

                {/* Left: info */}
                <View style={styles.webLeft}>
                  <View style={styles.webBadge}>
                    <MaterialIcons name="picture-as-pdf" size={14} color="#C4B5FD" />
                    <Text style={styles.webBadgeText}>Yapay Zeka Destekli</Text>
                  </View>
                  <Text style={styles.webTitle}>CV{'\n'}Analizi</Text>
                  <Text style={styles.webSubtitle}>
                    {'CV\'ni yükle, hedef pozisyona göre uyumluluk analizini al. Güçlü yönlerin ve gelişim alanların ortaya çıksın.'}
                  </Text>
                  <View style={styles.webFeatureList}>
                    {[
                      'Uyumluluk skoru',
                      'Güçlü yönler',
                      'Eksik alanlar',
                      'İyileştirme önerileri',
                    ].map((f) => (
                      <View key={f} style={styles.webFeatureItem}>
                        <Ionicons name="checkmark-circle" size={15} color="#A78BFA" />
                        <Text style={styles.webFeatureText}>{f}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Right: form card */}
                <View style={styles.webRight}>
                  {/* Drop zone */}
                  <View
                    ref={webDropZoneRef}
                    style={[styles.webDropZone, styles.uploadCursorWeb]}>
                    <View style={styles.webDropIconWrap}>
                      <MaterialIcons name="picture-as-pdf" size={28} color="#C4B5FD" />
                    </View>
                    <Text style={styles.webDropTitle}>
                      {"CV'nizi Sürükleyin veya Seçin"}
                    </Text>
                    <Text style={styles.webDropHint}>Desteklenen format: PDF</Text>
                    {selectedFileBadge}
                  </View>

                  {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                  {/* Fields row */}
                  <View style={styles.webFieldRow}>
                    <View style={styles.webFieldHalf}>
                      <Text style={styles.fieldLabel}>HEDEF POZİSYON</Text>
                      <TextInput
                        value={targetRole}
                        onChangeText={(v) => { setTargetRole(v); if (errorMessage) setErrorMessage(''); }}
                        placeholder="Orn: Yazılım Geliştirici"
                        placeholderTextColor="#475569"
                        style={styles.webInput}
                      />
                    </View>
                    <View style={styles.webFieldHalf}>
                      <Text style={styles.fieldLabel}>SEKTÖR</Text>
                      <TextInput
                        value={sector}
                        onChangeText={(v) => { setSector(v); if (errorMessage) setErrorMessage(''); }}
                        placeholder="Orn: Teknoloji"
                        placeholderTextColor="#475569"
                        style={styles.webInput}
                      />
                    </View>
                  </View>

                  {/* Button */}
                  <Pressable
                    style={[styles.webActionBtn, (!canStartAnalysis || submitting) && styles.actionButtonDisabled]}
                    disabled={!canStartAnalysis || submitting}
                    onPress={() => void startAnalysis()}>
                    {submitting ? (
                      <ActivityIndicator color="#0F172A" />
                    ) : (
                      <>
                        <Ionicons name="play" size={15} color="#1E1B4B" />
                        <Text style={styles.actionButtonText}>Analizi Başlat</Text>
                      </>
                    )}
                  </Pressable>
                </View>

              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#020617', '#0B0F2A']} style={styles.pageBackground}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.scrollWrap}>
          <ScrollView
            style={styles.scrollFlex}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
          <BackHeader />
          <View style={styles.headerRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={15} color="#C4B5FD" />
            </View>
            <View>
              <Text style={styles.welcomeText}>HOS GELDIN,</Text>
              <Text style={styles.nameText}>{profile.fullName}</Text>
            </View>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.title}>CV Analizi</Text>
            <Text style={styles.subtitle}>Kariyerini bir ust seviyeye tasimak icin analizini baslat.</Text>
          </View>

          <View style={[styles.uploadTouchArea, styles.uploadCard, styles.uploadCardNative]}>
            <Pressable onPress={openPdfPickerUnlessSuppressed} style={styles.uploadNativeTapArea}>
              <View style={styles.uploadIconWrap}>
                <MaterialIcons name="picture-as-pdf" size={32} color="#C4B5FD" />
              </View>
              <Text style={styles.uploadTitle}>{"CV'nizi Buraya Yükleyin"}</Text>
              <Text style={styles.uploadHint}>Desteklenen format: PDF</Text>
            </Pressable>
            {selectedFileBadge}
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>HEDEF POZISYON</Text>
            <TextInput
              value={targetRole}
              onChangeText={(value) => {
                setTargetRole(value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Orn: Yazilim Gelistirici"
              placeholderTextColor="#475569"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>SEKTOR</Text>
            <TextInput
              value={sector}
              onChangeText={(value) => {
                setSector(value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Orn: Teknoloji"
              placeholderTextColor="#475569"
              style={styles.input}
            />
          </View>

          <Pressable
            style={[
              styles.actionButton,
              (!canStartAnalysis || submitting) && styles.actionButtonDisabled,
            ]}
            disabled={!canStartAnalysis || submitting}
            onPress={() => void startAnalysis()}
          >
            {submitting ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <>
                <Ionicons name="play" size={16} color="#1E1B4B" />
                <Text style={styles.actionButtonText}>Analizi Başlat</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
        </View>
        <BottomNavBar variant="docked" />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  pageBackground: { flex: 1 },

  /* ── WEB LAYOUT ─────────────────────────────────── */
  safeAreaWeb: { flex: 1, paddingTop: 60 },
  webScrollContainer: { flexGrow: 1 },
  webBackRow: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  webInner: {
    maxWidth: 1000,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 40,
    paddingTop: 16,
    paddingBottom: 48,
  },
  webTopRow: {
    marginBottom: 24,
  },
  webColumns: {
    flexDirection: 'row',
    gap: 48,
    alignItems: 'flex-start',
  },
  webLeft: {
    flex: 1,
    paddingTop: 8,
  },
  webBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(196, 181, 253, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.2)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 20,
  },
  webBadgeText: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '600',
  },
  webTitle: {
    color: '#F8FAFC',
    fontSize: 52,
    fontWeight: '800',
    lineHeight: 58,
    marginBottom: 16,
  },
  webSubtitle: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 28,
    maxWidth: 340,
  },
  webFeatureList: { gap: 10 },
  webFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  webFeatureText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '500',
  },
  webRight: {
    flex: 1.3,
    gap: 0,
  },
  webDropZone: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(196, 181, 253, 0.4)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  webDropIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(167, 139, 250, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  webDropTitle: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  webDropHint: {
    color: '#64748B',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  webFieldRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  webFieldHalf: {
    flex: 1,
    gap: 8,
  },
  webInput: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#030712',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.22)',
    paddingHorizontal: 14,
    color: '#E2E8F0',
    fontSize: 15,
  },
  webActionBtn: {
    borderRadius: 14,
    backgroundColor: '#A78BFA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },

  /* ── MOBILE LAYOUT ───────────────────────────────── */
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  /** flex + minHeight:0: Android'de ScrollView kardeş nav ile düzgün paylaşsın */
  scrollWrap: {
    flex: 1,
    minHeight: 0,
  },
  scrollFlex: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
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
    marginTop: 26,
    marginBottom: 24,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 46,
    lineHeight: 50,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 10,
    color: '#93A2BC',
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 360,
  },
  uploadTouchArea: {
    borderRadius: 24,
  },
  uploadCursorWeb: {
    cursor: 'pointer',
  },
  uploadCard: {
    minHeight: 250,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(196, 181, 253, 0.45)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  /** Mobil: rozet dış Pressable dışında — iç içe Pressable çarpıyı yutmasın. */
  uploadCardNative: {
    width: '100%',
    justifyContent: 'flex-start',
  },
  uploadNativeTapArea: {
    width: '100%',
    flexGrow: 1,
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.16)',
    marginBottom: 18,
  },
  uploadTitle: {
    color: '#E2E8F0',
    fontSize: 30,
    lineHeight: 36,
    textAlign: 'center',
    fontWeight: '700',
    maxWidth: 340,
  },
  uploadHint: {
    marginTop: 10,
    color: '#94A3B8',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  fileBadge: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(134, 239, 172, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '100%',
  },
  fileBadgeCheckWrap: {
    flexShrink: 0,
    marginRight: 8,
  },
  fileBadgeText: {
    color: '#86EFAC',
    flex: 1,
    flexShrink: 1,
    minWidth: 48,
    marginRight: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  /** Android: flex:1 Text kardeşi bazen çarpıyı sıfır genişliğe sıkıştırır — sabit alan şart. */
  fileBadgeClear: {
    flexShrink: 0,
    width: 36,
    height: 36,
    marginLeft: 'auto',
    padding: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileBadgeClearPressed: {
    opacity: 0.7,
  },
  errorText: {
    marginTop: 8,
    color: '#FCA5A5',
    fontSize: 12,
  },
  fieldBlock: {
    marginTop: 20,
    gap: 8,
  },
  fieldLabel: {
    color: '#C4B5FD',
    letterSpacing: 2.2,
    fontSize: 11,
    fontWeight: '600',
  },
  input: {
    height: 58,
    borderRadius: 16,
    backgroundColor: '#030712',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.22)',
    paddingHorizontal: 16,
    color: '#E2E8F0',
    fontSize: 18,
  },
  actionButton: {
    marginTop: 34,
    borderRadius: 22,
    backgroundColor: '#A78BFA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#1E1B4B',
    fontSize: 15,
    fontWeight: '800',
  },
});
