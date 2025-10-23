import GuestFormCMAS from '@/components/guest/guest-form-cmas';

export default function GuestConnectPage() {
  const handleSuccess = (result: any) => {
    // Track conversion in analytics
    if (window.gtag) {
      window.gtag('event', 'guest_connect', {
        event_category: 'conversion',
        guest_id: result.guestId,
        workflow_id: result.workflowId,
      });
    }

    // You can also send to your analytics service
    console.log('Guest connected successfully:', result);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <GuestFormCMAS onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
