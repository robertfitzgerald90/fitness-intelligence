import { Stack, useLocalSearchParams } from 'expo-router';

import { TemplateEditorScreen } from '@/features/train/TemplateEditorScreen';

export default function EditTemplateRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const templateId = firstParam(id) ?? '';

  return (
    <>
      <Stack.Screen options={{ title: 'Edit workout' }} />
      <TemplateEditorScreen templateId={templateId} />
    </>
  );
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
