import { StyleSheet, Text, View } from 'react-native';

type ChatMessageBubbleProps = {
  content: string;
  role: 'assistant' | 'user';
  meta: string;
};

export function ChatMessageBubble({ content, role, meta }: ChatMessageBubbleProps) {
  const isAssistant = role === 'assistant';

  return (
    <View style={[styles.wrapper, isAssistant ? styles.wrapperAssistant : styles.wrapperUser]}>
      <View style={[styles.bubble, isAssistant ? styles.assistantBubble : styles.userBubble]}>
        <Text style={styles.content}>{content}</Text>
      </View>
      <Text style={[styles.meta, isAssistant ? styles.metaAssistant : styles.metaUser]}>{meta}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginTop: 16,
  },
  wrapperAssistant: {
    alignItems: 'flex-start',
  },
  wrapperUser: {
    alignItems: 'flex-end',
  },
  bubble: {
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
    maxWidth: '92%',
  },
  assistantBubble: {
    backgroundColor: '#A78BFA',
  },
  userBubble: {
    backgroundColor: '#17284A',
  },
  content: {
    color: '#E5E7EB',
    fontSize: 17,
    lineHeight: 28,
    fontWeight: '500',
  },
  meta: {
    marginTop: 8,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  metaAssistant: {
    color: '#6B7280',
  },
  metaUser: {
    color: '#6B7280',
    textAlign: 'right',
  },
});
