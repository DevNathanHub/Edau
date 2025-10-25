// API service for frontend to communicate with backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  suggestions?: string[];
  actions?: Array<{
    label: string;
    action: string;
    type: 'product' | 'visit' | 'order' | 'contact';
  }>;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  token_count: number;
  updated_at: Date;
  lastAgent?: string;
}

export type { Message, Conversation };

class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log('API Request:', { url, method: options.method || 'GET', body: options.body });
      
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
        ...options,
      });

      console.log('API Response Status:', response.status);

      // Parse payload (could be wrapped by backend as { data, message, error })
      const payload = await response.json();
      console.log('API Response Data:', payload);

      // If response not ok, try to extract an error message from payload
      if (!response.ok) {
        console.error('API Error:', payload);
        const errMsg = payload?.error || payload?.message || 'Request failed';
        return { error: errMsg };
      }

      // If backend already returns an object shaped like ApiResponse (i.e. contains data/message/error),
      // return it directly so callers see the expected properties.
      if (payload && (Object.prototype.hasOwnProperty.call(payload, 'data') || Object.prototype.hasOwnProperty.call(payload, 'error') || Object.prototype.hasOwnProperty.call(payload, 'message'))) {
        // Cast to ApiResponse<T>
        return payload as ApiResponse<T>;
      }

      // Otherwise treat payload as the pure data and wrap it
      return { data: payload as T };
    } catch (error) {
      console.error('API Network Error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/api/health');
  }

  // Products
  async getProducts() {
    return this.request('/api/products');
  }

  async getProduct(id: string) {
    return this.request(`/api/products/${id}`);
  }

  async createProduct(product: any) {
    return this.request('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, updates: any) {
    return this.request(`/api/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/api/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async getOrders(userId?: string) {
    const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return this.request(`/api/orders${qs}`);
  }

  async createOrder(order: any) {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async updateOrder(id: string, updates: any) {
    return this.request(`/api/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteOrder(id: string) {
    return this.request(`/api/orders/${id}`, {
      method: 'DELETE',
    });
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async me() {
    return this.request('/api/auth/me');
  }

  // Contact messages
  async getContactMessages() {
    return this.request('/api/contact');
  }

  async createContactMessage(message: any) {
    return this.request('/api/contact', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  // Feedback
  async getFeedback() {
    return this.request('/api/feedback');
  }

  async getUserFeedback(userId: string) {
    return this.request(`/api/feedback/user/${userId}`);
  }

  async createFeedback(feedback: { feedback_text: string; rating?: number; category?: string; user_id?: string }) {
    return this.request('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  }

  // Analytics
  async getDashboardAnalytics() {
    return this.request('/api/analytics/dashboard');
  }

  // Newsletter
  async getNewsletterSubscribers() {
    return this.request('/api/newsletter');
  }

  async subscribeNewsletter(email: string, name?: string) {
    return this.request('/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
  }

  // Farm Visits
  async getFarmVisits() {
    return this.request('/api/farm-visits');
  }

  async createFarmVisit(visit: any) {
    return this.request('/api/farm-visits', {
      method: 'POST',
      body: JSON.stringify(visit),
    });
  }

  async updateFarmVisit(id: string, updates: any) {
    return this.request(`/api/farm-visits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Users
  async getUsers() {
    return this.request('/api/users');
  }

  async getUser(id: string) {
    return this.request(`/api/users/${id}`);
  }

  async updateUser(id: string, updates: any) {
    return this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Gallery
  async getGallery() {
    return this.request('/api/gallery');
  }

  async uploadGalleryImage(formData: FormData) {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const response = await fetch(`${API_BASE_URL}/api/gallery`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      return { error: data.error || 'Request failed' };
    }
    return { data };
  }

  async deleteGalleryImage(id: string) {
    return this.request(`/api/gallery/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories() {
    return this.request('/api/categories');
  }

  async createCategory(category: { name: string }) {
    return this.request('/api/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  // Chat Conversations
  async getChatConversations(): Promise<ApiResponse<Conversation[]>> {
    return this.request('/api/chat/conversations');
  }

  async createChatConversation(title?: string): Promise<ApiResponse<Conversation>> {
    return this.request('/api/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ title: title || 'New Conversation' }),
    });
  }

  async getChatConversation(conversationId: string): Promise<ApiResponse<Conversation>> {
    return this.request(`/api/chat/conversations/${conversationId}`);
  }

  async deleteChatConversation(conversationId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/chat/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  }

  async sendChatMessage(message: string, conversationId?: string): Promise<ApiResponse<{ response: string; conversationId: string; tokenCount: number }>> {
    return this.request('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId }),
    });
  }
}

export const apiService = new ApiService();
