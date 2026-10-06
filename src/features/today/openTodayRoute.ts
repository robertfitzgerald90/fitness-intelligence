import { router } from 'expo-router';

import type { TodayRoute } from '@/application/today/todayViewModel';

export function openTodayRoute(route: TodayRoute): void {
  switch (route.name) {
    case 'workout-start':
      router.push({
        pathname: '/workout/start',
        params: route.duration
          ? { title: route.title, duration: route.duration }
          : { title: route.title },
      });
      return;
    case 'run-start':
      router.push('/run/start');
      return;
    case 'workout':
      router.push({ pathname: '/workout/[id]', params: { id: route.id } });
      return;
    case 'strength':
      router.push('/progress/strength');
      return;
    case 'goals':
      router.push('/goals');
      return;
    default: {
      const exhaustive: never = route;
      return exhaustive;
    }
  }
}
