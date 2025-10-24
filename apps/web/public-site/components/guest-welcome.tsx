'use client';

import { useEffect } from 'react';
import { useSendMessage } from '@/lib/communications';

interface GuestWelcomeProps {
  guestEmail: string;
  guestName: string;
  branchId: number;
}

export function GuestWelcome({ guestEmail, guestName, branchId }: GuestWelcomeProps) {
  const { mutate: sendWelcome } = useSendMessage();

  useEffect(() => {
    // Send welcome message when guest form is submitted
    if (guestEmail && guestName) {
      sendWelcome({
        template_id: 1, // Welcome template ID
        audience_filters: {
          user_emails: [guestEmail],
          branch_id: branchId
        },
        schedule_type: 'immediate'
      });
    }
  }, [guestEmail, guestName, branchId, sendWelcome]);

  return null; // This component doesn't render anything
}
