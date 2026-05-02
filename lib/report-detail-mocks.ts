/** Geçmişim → rapor detay mock verisi; backend hazır olduğunda API ile değiştirin. */

export type ReportKind = 'interview' | 'cv';

export type InterviewQuestionBlock = {
  question: string;
  answer: string;
  aiFeedback: string;
};

export type InterviewReportPayload = {
  kind: 'interview';
  title: string;
  dateLabel: string;
  score: number;
  questions: InterviewQuestionBlock[];
};

export type CvInsightBlock = {
  title: string;
  summary: string;
  aiSuggestion: string;
};

export type CvReportPayload = {
  kind: 'cv';
  title: string;
  dateLabel: string;
  matchPercent: number;
  highlights: CvInsightBlock[];
};

export type ReportPayload = InterviewReportPayload | CvReportPayload;

export const REPORT_DETAIL_MOCKS: Record<string, ReportPayload> = {
  'interview-1': {
    kind: 'interview',
    title: 'Yazılım Geliştirici Mülakatı',
    dateLabel: '14 Mart 2024',
    score: 85,
    questions: [
      {
        question: 'Kendinizden bahseder misiniz?',
        answer: 'Yazılım geliştiriciyim; özellikle React ve Node ekosisteminde tam yığın projeler teslim ettim.',
        aiFeedback: 'Deneyimlerini daha spesifik projelerle destekleyebilir ve etkiyi rakamlarla güçlendirebilirsin.',
      },
      {
        question: 'Ekip içinde yaşadığınız bir anlaşmazlığı nasıl çözdünüz?',
        answer:
          'Önceliği backlog üzerinden netleştirip, teknik tasarımda küçük bir PoC ile ortak zemine indik.',
        aiFeedback:
          'Çatışmayı bağlam olarak iyi aktarmışsın; çözüm adımlarını zaman çizelgesiyle özetlemek ikna gücünü artırır.',
      },
    ],
  },
  'interview-2': {
    kind: 'interview',
    title: 'Ürün Yönetimi Mülakatı',
    dateLabel: '8 Mart 2024',
    score: 72,
    questions: [
      {
        question: 'Bu rolde ilk 90 günde başarıyı nasıl tanımlarsınız?',
        answer: 'Kullanıcı geri bildirim döngüsünü sıklaştırıp, metrikleri net KPI’larla takip etmek isterdim.',
        aiFeedback:
          'KPI seçimleri net; örnek metrikleri (örn. aktivasyon oranı, NPS değişimi) eklemek cevabı daha somut yapar.',
      },
      {
        question: 'Paydaşları fikir birliğine nasıl getirirsiniz?',
        answer: 'Problem çerçevesini ortaya koyup, karar çıktılarını yazılı özete bağlarım.',
        aiFeedback:
          'Süreci doğru özmişsin; belirsiz ortamlarda “risk ve varsayım” satırını açmak değerlendirilir.',
      },
    ],
  },
  'cv-1': {
    kind: 'cv',
    title: 'Yazılım Mühendisi CV Analizi',
    dateLabel: '12 Mart 2024',
    matchPercent: 82,
    highlights: [
      {
        title: 'Teknik özgeçmiş',
        summary:
          'Backend ve bulut anahtar kelimeleri güçlü; mikroservis ve ölçeklenme katmanını bir miktar daha vurgulanabilir.',
        aiSuggestion: 'Servis süreleri ve trafik hacmi gibi ölçülebilir sonuçlar ekle.',
      },
      {
        title: 'Deneyim anlatımı',
        summary: 'Rol bazlı maddeler net; etki (impact) cümleleri bazı pozisyonlarda eksik.',
        aiSuggestion: 'Her maddeye “ne yaptım / sonuç ne oldu” formatında bir cümle ekle.',
      },
    ],
  },
  'cv-2': {
    kind: 'cv',
    title: 'Veri Analisti CV İncelemesi',
    dateLabel: '5 Mart 2024',
    matchPercent: 91,
    highlights: [
      {
        title: 'Analitik beceriler',
        summary: 'SQL, görselleştirme ve A/B test vurgusu güçlü; domain bilgisi net.',
        aiSuggestion: 'Regülasyon veya veri kalitesi süreçlerinden kısa bir örnek eklemek fark yaratır.',
      },
      {
        title: 'Genel uyum',
        summary: 'İlan anahtar kelimeleriyle yüksek örtüşme; özet paragrafı rolü tek cümlede toparlayabilir.',
        aiSuggestion: 'Özet cümlesini hedef rol + sektör + güçlü yan üçlüsüyle güncelle.',
      },
    ],
  },
};

export function getReportDetailMock(id: string | undefined): ReportPayload | null {
  if (!id || !REPORT_DETAIL_MOCKS[id]) {
    return null;
  }
  return REPORT_DETAIL_MOCKS[id];
}
