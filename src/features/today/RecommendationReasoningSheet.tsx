import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { TextAction } from '@/components/TextAction';
import { colors, radius, spacing } from '@/design/tokens';

type Props = {
  visible: boolean;
  title: string;
  reasons: string[];
  onClose: () => void;
};

export function RecommendationReasoningSheet({ visible, title, reasons, onClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss recommendation reasoning">
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing[5]) }]}
          onPress={() => undefined}
          accessibilityViewIsModal
        >
          <View style={styles.handle} />
          <AppText role="title3">{title}</AppText>
          <View style={styles.reasons}>
            {reasons.map((reason) => (
              <View key={reason} style={styles.reason}>
                <View style={styles.marker} />
                <AppText role="body" color="textSecondary" style={styles.reasonText}>
                  {reason}
                </AppText>
              </View>
            ))}
          </View>
          <TextAction label="Done" onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.scrim,
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    gap: spacing[4],
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
  },
  reasons: {
    gap: spacing[3],
  },
  reason: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  marker: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.strength,
    marginTop: 8,
  },
  reasonText: {
    flex: 1,
  },
});
