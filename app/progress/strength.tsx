import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

import { getStrengthPreview } from '@/application/today/getTodayDashboard';
import { PlaceholderScreen } from '@/components/PlaceholderScreen';

export default function StrengthProgressScreen() {
  const [preview, setPreview] = useState<{ title: string; headline: string } | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    getStrengthPreview()
      .then((next) => {
        if (!cancelled) {
          setPreview(next);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreview(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const body =
    preview === undefined
      ? 'Opening strength progress.'
      : preview
        ? `${preview.title}. ${preview.headline}. The full strength view comes in a later update.`
        : 'Strength progress will show up here after a few logged sessions.';

  return (
    <>
      <Stack.Screen options={{ title: 'Strength' }} />
      <PlaceholderScreen edges={['left', 'right', 'bottom']} body={body} />
    </>
  );
}
