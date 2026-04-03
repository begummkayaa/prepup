import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function isPdf(fileName?: string, mimeType?: string | null) {
  const hasPdfExtension = fileName?.toLowerCase().endsWith('.pdf');
  return mimeType === 'application/pdf' || Boolean(hasPdfExtension);
}

export default function CvAnalysisScreen() {
  const isWeb = Platform.OS === 'web';
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [targetRole, setTargetRole] = useState('');
  const [sector, setSector] = useState('');

  const webDropEvents = useMemo(
    () =>
      isWeb
        ? {
            onDragOver: (event: any) => {
              event.preventDefault();
            },
            onDrop: (event: any) => {
              event.preventDefault();
              const droppedFile =
                event?.nativeEvent?.dataTransfer?.files?.[0] ?? event?.dataTransfer?.files?.[0];

              if (!droppedFile) {
                return;
              }

              if (!isPdf(droppedFile.name, droppedFile.type)) {
                setErrorMessage('Sadece PDF dosyasi yukleyebilirsiniz.');
                return;
              }

              setErrorMessage('');
              setFileName(droppedFile.name);
            },
          }
        : {},
    [isWeb]
  );

  const pickPdf = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return;
    }

    const selectedFile = result.assets[0];
    if (!isPdf(selectedFile.name, selectedFile.mimeType)) {
      setErrorMessage('Sadece PDF dosyasi yukleyebilirsiniz.');
      return;
    }

    setErrorMessage('');
    setFileName(selectedFile.name);
  };

  return (
    <LinearGradient colors={['#020617', '#0B0F2A']} style={styles.pageBackground}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={15} color="#C4B5FD" />
            </View>
            <View>
              <Text style={styles.welcomeText}>HOS GELDIN,</Text>
              <Text style={styles.nameText}>Begum Kaya</Text>
            </View>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.title}>CV Analizi</Text>
            <Text style={styles.subtitle}>Kariyerini bir ust seviyeye tasimak icin analizini baslat.</Text>
          </View>

          <Pressable onPress={pickPdf} style={styles.uploadTouchArea}>
            <View style={styles.uploadCard} {...webDropEvents}>
              <View style={styles.uploadIconWrap}>
                <MaterialIcons name="picture-as-pdf" size={32} color="#C4B5FD" />
              </View>
              <Text style={styles.uploadTitle}>
                {isWeb ? "CV'nizi Buraya Surukleyin veya Dosya Secin" : "CV'nizi Buraya Yukleyin"}
              </Text>
              <Text style={styles.uploadHint}>Desteklenen format: PDF</Text>

              {fileName ? (
                <View style={styles.fileBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#86EFAC" />
                  <Text style={styles.fileBadgeText}>{fileName}</Text>
                </View>
              ) : null}
            </View>
          </Pressable>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>HEDEF POZISYON</Text>
            <TextInput
              value={targetRole}
              onChangeText={setTargetRole}
              placeholder="Orn: Yazilim Gelistirici"
              placeholderTextColor="#475569"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>SEKTOR</Text>
            <TextInput
              value={sector}
              onChangeText={setSector}
              placeholder="Orn: Teknoloji"
              placeholderTextColor="#475569"
              style={styles.input}
            />
          </View>

          <Pressable style={[styles.actionButton, !fileName && styles.actionButtonDisabled]}>
            <Text style={styles.actionButtonText}>Analizi Başlat</Text>
          </Pressable>
        </ScrollView>
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
  scrollContainer: {
    paddingBottom: 120,
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
    gap: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(134, 239, 172, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '100%',
  },
  fileBadgeText: {
    color: '#86EFAC',
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '600',
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
    height: 78,
    borderRadius: 28,
    backgroundColor: '#A78BFA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '700',
  },
});
