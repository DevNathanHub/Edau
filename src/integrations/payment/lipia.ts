
interface LipiaPaymentResponse {
  message: string;
  data?: {
    amount: string;
    phone: string;
    reference: string;
    CheckoutRequestID: string;
  };
}

interface LipiaPaymentRequest {
  phone: string;
  amount: string;
}

const LIPIA_API_KEY = "96c2fc4ac0fb65f96bc158c1311fbde6d7ae6001";
const LIPIA_API_URL = "https://lipia-api.kreativelabske.com/api";

export async function initiatePayment(phone: string, amount: number): Promise<LipiaPaymentResponse> {
  try {
    // Format phone number to remove country code if present
    const formattedPhone = formatPhoneNumber(phone);
    
    // Prepare request body
    const requestBody: LipiaPaymentRequest = {
      phone: formattedPhone,
      amount: amount.toString(),
    };
    
    // Send payment request
    const response = await fetch(`${LIPIA_API_URL}/request/stk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LIPIA_API_KEY}`
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        message: errorData.message || 'Payment request failed'
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Payment initiation error:', error);
    return {
      message: error instanceof Error ? error.message : 'Unknown payment error'
    };
  }
}

// Helper function to format phone numbers to the required format (07XXXXXXXX)
function formatPhoneNumber(phone: string): string {
  // Remove spaces, dashes, and other non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle numbers with country code
  if (cleaned.startsWith('254')) {
    cleaned = '0' + cleaned.substring(3);
  }
  
  // Ensure the number is in the format 07XXXXXXXX
  if (cleaned.length === 10 && (cleaned.startsWith('07') || cleaned.startsWith('01'))) {
    return cleaned;
  } else {
    throw new Error('Invalid phone number format. Expected format: 07XXXXXXXX');
  }
}

export async function checkPaymentStatus(checkoutRequestId: string): Promise<any> {
  try {
    const response = await fetch(`${LIPIA_API_URL}/status/${checkoutRequestId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${LIPIA_API_KEY}`
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Payment status check failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Payment status check error:', error);
    throw error;
  }
}
