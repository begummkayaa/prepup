import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const isWeb = Platform.OS === 'web';
  const insets = useSafeAreaInsets();

  return (
    <View style={[isWeb ? styles.wrapperWeb : styles.wrapperMobile, !isWeb && { paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={['#0F1A33', '#13254A']}
        style={[styles.container, isWeb && styles.containerWeb]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : typeof options.title === 'string'
                ? options.title
                : route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const color = isFocused ? '#C4B5FD' : '#94A3B8';
          const icon =
            typeof options.tabBarIcon === 'function'
              ? options.tabBarIcon({ focused: isFocused, color, size: 20 })
              : null;

          return (
            <Pressable key={route.key} onPress={onPress} style={[styles.item, isWeb && styles.itemWeb]}>
              {icon}
              <Text style={[styles.label, isFocused && styles.labelFocused]}>{label}</Text>
            </Pressable>
          );
        })}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapperMobile: {
    paddingHorizontal: 14,
    backgroundColor: 'transparent',
  },
  wrapperWeb: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    paddingHorizontal: 0,
    zIndex: 100,
  },
  container: {
    height: 84,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.12)',
    shadowColor: '#020617',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 10,
  },
  containerWeb: {
    height: 64,
    borderRadius: 0,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.12)',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    paddingHorizontal: 14,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: '100%',
  },
  itemWeb: {
    flexDirection: 'row',
    gap: 8,
  },
  label: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  labelFocused: {
    color: '#C4B5FD',
  },
});
