
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
      external_reference: externalReference,
      callback_url: 'https://edau.onrender.com/api/payments/lipia/callback'
    };

    const resp = await fetch('/api/payments/stk-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    // Read response as text first to avoid JSON.parse errors on empty/non-JSON bodies
    const text = await resp.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (parseErr) {
      // Not JSON — capture raw text for debugging
      data = { __raw: text };
    }

    if (!resp.ok) {
      const message = data?.message || data?.error || data?.__raw || `HTTP ${resp.status}`;
      return { success: false, message: String(message), data };
    }

    return { success: true, message: data?.message || 'Initiated', data: data?.data || data || null };
  } catch (err) {
    console.error('initiatePayment error:', err);
    return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// Helper function to clean phone numbers - let backend do normalization
function formatPhoneNumber(phone: string): string {
  // Just clean whitespace and basic formatting, let backend normalize to MSISDN
  return phone.trim().replace(/[\s\-\(\)]/g, '');
}

export async function checkPaymentStatus(checkoutRequestId: string): Promise<any> {
  // Call backend status endpoint which will query Lipia
  try {
    const resp = await fetch(`/api/payments/status?reference=${encodeURIComponent(checkoutRequestId)}`);
    const text = await resp.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { __raw: text };
    }

    if (!resp.ok) {
      throw new Error(data?.message || data?.error || data?.__raw || `HTTP ${resp.status}`);
    }
    return data;
  } catch (err) {
    console.error('checkPaymentStatus error:', err);
    throw err;
  }
}
