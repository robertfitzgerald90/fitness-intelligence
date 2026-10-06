import { Stack } from 'expo-router';

import { TemplateEditorScreen } from '@/features/train/TemplateEditorScreen';

export default function NewTemplateRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'New workout' }} />
      <TemplateEditorScreen templateId={null} />
    </>
  );
}
