export interface NewsletterSubscription {
  email: string;
  firstName?: string;
  branch?: string;
  interests?: string[];
  frequency?: 'weekly' | 'monthly';
}

export async function subscribeToNewsletter(
  subscription: NewsletterSubscription
): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/v1/newsletter/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subscription),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Subscription failed');
  }

  return response.json();
}

export async function unsubscribeFromNewsletter(email: string): Promise<{ success: boolean }> {
  const response = await fetch('/api/v1/newsletter/unsubscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error('Unsubscribe failed');
  }

  return response.json();
}
