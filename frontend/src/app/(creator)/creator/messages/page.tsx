import { Suspense } from 'react';
import MessagesPage from '@/components/shared/MessagesPage';
import { MessagesSkeleton } from '@/components/shared/Skeleton';

export default function CreatorMessages() {
  return (
    <Suspense fallback={<MessagesSkeleton />}>
      <MessagesPage />
    </Suspense>
  );
}
