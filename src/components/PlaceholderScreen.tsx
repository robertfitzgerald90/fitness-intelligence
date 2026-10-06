import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { spacing } from '@/design/tokens';

type Props = {
  title?: string;
  body: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

export function PlaceholderScreen({ title, body, edges }: Props) {
  return (
    <Screen edges={edges}>
      <View style={styles.content}>
        {title ? <AppText role="title1">{title}</AppText> : null}
        <AppText role="body" color="textSecondary">
          {body}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing[4],
    gap: spacing[3],
  },
});
