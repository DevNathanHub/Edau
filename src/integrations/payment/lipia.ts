
interface BackendPaymentResponse {
  success: boolean;
  status?: string;
  message?: string;
  data?: any;
}

interface StkRequestBody {
  phone_number: string;
  amount: number;
  external_reference?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}

// Initiate payment via our backend API which calls Lipia with the server-side API key.
export async function initiatePayment(phone: string, amount: number, externalReference?: string): Promise<BackendPaymentResponse> {
  try {
    const formattedPhone = formatPhoneNumber(phone);

    const body: StkRequestBody = {
      phone_number: formattedPhone,
      amount,
      external_reference: externalReference
    };

    const resp = await fetch('/api/payments/stk-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await resp.json();
    if (!resp.ok) {
      return { success: false, message: data?.message || 'Payment initiation failed', data };
    }
    return { success: true, message: data?.message || 'Initiated', data: data?.data || null };
  } catch (err) {
    console.error('initiatePayment error:', err);
    return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// Helper function to format phone numbers to the required format (07XXXXXXXX)
function formatPhoneNumber(phone: string): string {
  // Remove spaces, dashes, and other non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // If it already starts with 254 -> convert to 07... form expected by backend
  if (cleaned.startsWith('254')) {
    cleaned = '0' + cleaned.substring(3);
  }

  if (cleaned.length === 10 && (cleaned.startsWith('07') || cleaned.startsWith('01'))) {
    return cleaned;
  }

  // Fallback: return original and let backend validate
  return phone;
}

export async function checkPaymentStatus(checkoutRequestId: string): Promise<any> {
  // Call backend status endpoint which will query Lipia
  try {
    const resp = await fetch(`/api/payments/status/${checkoutRequestId}`);
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err?.message || 'Status check failed');
    }
    return await resp.json();
  } catch (err) {
    console.error('checkPaymentStatus error:', err);
    throw err;
  }
}
