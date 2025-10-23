import { Event } from '@/types';

export interface EventRegistration {
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  branch?: string;
  guests?: number;
  notes?: string;
  responses?: Record<string, string>;
}

export interface RegistrationFormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'select' | 'textarea';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export async function registerForEvent(
  registration: EventRegistration
): Promise<{ success: boolean; registrationId: string; message: string }> {
  const response = await fetch('/api/v1/events/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(registration),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  return response.json();
}

export async function getEventRegistrationForm(eventId: string): Promise<{
  event: Event;
  formFields: RegistrationFormField[];
}> {
  const response = await fetch(`/api/v1/events/${eventId}/registration-form`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch registration form');
  }

  return response.json();
}

export async function getEventAttendees(eventId: string): Promise<{
  total: number;
  registered: number;
  capacity?: number;
}> {
  const response = await fetch(`/api/v1/events/${eventId}/attendees`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch attendee information');
  }

  return response.json();
}
