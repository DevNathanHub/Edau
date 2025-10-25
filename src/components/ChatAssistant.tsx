import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Bot, ExternalLink, AlertTriangle, History, Plus, Trash2, ShoppingCart, Calendar, Phone, Star, Zap, Package, Users } from 'lucide-react';
import { apiService, Message, Conversation } from '@/lib/api';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

const ChatAssistant = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [totalTokensUsed, setTotalTokensUsed] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Token limits
  const MAX_TOKENS_PER_CONVERSATION = 8000; // Conservative limit for Gemini
  const MAX_TOTAL_TOKENS = 50000; // Daily limit

  // Utility function to render markdown-like text
  const renderMarkdown = (text: string) => {
    if (!text) return text;

    // Convert URLs to clickable links
    let html = text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>'
    );

    // Convert **bold** to <strong>bold</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert *italic* to <em>italic</em>
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert line breaks to <br>
    html = html.replace(/\n/g, '<br>');

    return html;
  };

  // Check if we should allow sending a message
  const canSendMessage = () => {
    if (loading) return false;
    if (!input.trim()) return false;
    if (input.length > 500) return false;

    // Check token limits
    const currentTokens = currentConversation?.token_count || 0;
    if (currentTokens >= MAX_TOKENS_PER_CONVERSATION) {
      return false;
    }
    if (totalTokensUsed >= MAX_TOTAL_TOKENS) {
      return false;
    }

    return true;
  };

  // Get send button tooltip/disabled reason
  const getSendButtonState = () => {
    if (loading) return { disabled: true, tooltip: "Assistant is responding..." };

    const currentTokens = currentConversation?.token_count || 0;
    if (currentTokens >= MAX_TOKENS_PER_CONVERSATION) {
      return { disabled: true, tooltip: "Conversation token limit reached" };
    }
    if (totalTokensUsed >= MAX_TOTAL_TOKENS) {
      return { disabled: true, tooltip: "Daily token limit reached" };
    }

    return { disabled: false, tooltip: "Send message" };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  useEffect(() => {
    if (open && user) {
      loadConversations();
    }
  }, [open, user]);

  const loadConversations = async () => {
    try {
      const result = await apiService.getChatConversations();
      if (result.data && Array.isArray(result.data)) {
        // Ensure all conversations have messages array initialized
        const conversationsWithMessages = result.data.map(conv => ({
          ...conv,
          messages: conv.messages || []
        }));
        setConversations(conversationsWithMessages);
        // Set the most recent conversation as current if none selected
        if (!currentConversation && conversationsWithMessages.length > 0) {
          setCurrentConversation(conversationsWithMessages[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const createNewConversation = async () => {
    try {
      const result = await apiService.createChatConversation('New Conversation');
      if (result.data) {
        const newConv = {
          ...result.data,
          messages: result.data.messages || []
        };
        setConversations(prev => [newConv, ...prev]);
        setCurrentConversation(newConv);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setCurrentConversation(conversation);
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      await apiService.deleteChatConversation(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(conversations.find(c => c.id !== conversationId) || null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const messageClassNames = (message: Message) => {
    if (message.role === 'user') return 'bg-green-600 text-white';
    if (message.role === 'system') return 'bg-amber-100 border border-amber-300 text-gray-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleSend = async () => {
    if (!canSendMessage()) return;

    let conversationToUse = currentConversation;

    // Create new conversation if none exists
    if (!conversationToUse) {
      const result = await apiService.createChatConversation(input.substring(0, 50) + (input.length > 50 ? '...' : ''));
      if (result.data) {
        conversationToUse = {
          ...result.data,
          messages: result.data.messages || []
        };
        setConversations(prev => [conversationToUse!, ...prev]);
        setCurrentConversation(conversationToUse);
      } else {
        // Show error for conversation creation failure
        setCurrentConversation({
          id: 'error-conv',
          title: 'Error',
          messages: [{
            id: 'error-msg',
            role: 'system',
            content: "Failed to start conversation. Please try again.",
            timestamp: new Date()
          }],
          token_count: 0,
          updated_at: new Date()
        });
        return;
      }
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
      timestamp: new Date()
    };

    // Optimistically update UI
    setCurrentConversation(prev => prev ? {
      ...prev,
      messages: [...(prev.messages || []), userMessage]
    } : null);

    const messageToSend = input;
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      const result = await apiService.sendChatMessage(messageToSend, conversationToUse.id);
      console.log('Chat API result:', result);

      if (result.data && result.data.response) {
        const responseText = result.data.response;
        console.log('Response text:', responseText);

        if (!responseText || typeof responseText !== 'string') {
          console.error('Invalid response from API:', responseText);
          // Handle invalid response
          setCurrentConversation(prev => prev ? {
            ...prev,
            messages: [...(prev.messages || []), {
              id: Date.now().toString(),
              role: 'system',
              content: "I received an invalid response. Please try rephrasing your question.",
              timestamp: new Date()
            }]
          } : null);
          return;
        }

        const tokensUsed = result.data.tokenCount || 0;

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: responseText,
          timestamp: new Date(),
          suggestions: generateSuggestions(responseText, messageToSend),
          actions: generateActions(responseText, messageToSend)
        };

        // Update conversation with AI response
        setCurrentConversation(prev => prev ? {
          ...prev,
          messages: [...(prev.messages || []), aiMessage],
          token_count: (prev.token_count || 0) + tokensUsed,
          lastAgent: detectAgent(responseText)
        } : null);

        // Update conversations list
        setConversations(prev => prev.map(c =>
          c.id === conversationToUse!.id
            ? { ...c, messages: [...(c.messages || []), userMessage, aiMessage], token_count: (c.token_count || 0) + tokensUsed, updated_at: new Date() }
            : c
        ));

        // Update total tokens used
        setTotalTokensUsed(prev => prev + tokensUsed);
      } else {
        // Handle API error or missing response
        console.error('API error or missing response:', result);
        const errorMessage = result.error || "Something went wrong. Please try again.";
        setCurrentConversation(prev => prev ? {
          ...prev,
          messages: [...(prev.messages || []), {
            id: Date.now().toString(),
            role: 'system',
            content: errorMessage,
            timestamp: new Date()
          }]
        } : null);
      }
    } catch (error) {
      console.error('Chat send error:', error);
      const errorMsg = error instanceof Error ? error.message : "Network error occurred. Please check your connection and try again.";
      setCurrentConversation(prev => prev ? {
        ...prev,
        messages: [...(prev.messages || []), {
          id: Date.now().toString(),
          role: 'system',
          content: errorMsg,
          timestamp: new Date()
        }]
      } : null);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const generateSuggestions = (response: string, userQuery: string): string[] => {
    const suggestions: string[] = [];
    const lowerResponse = response?.toLowerCase() || '';
    const lowerQuery = userQuery?.toLowerCase() || '';

    // Product-related suggestions
    if (lowerResponse.includes('honey') || lowerQuery.includes('honey')) {
      suggestions.push('Tell me about other products', 'How much honey should I buy?');
    }

    if (lowerResponse.includes('sheep') || lowerQuery.includes('sheep')) {
      suggestions.push('What cuts are available?', 'How to cook Dorper sheep?');
    }

    if (lowerResponse.includes('fruit') || lowerQuery.includes('fruit')) {
      suggestions.push('What fruits are in season?', 'How are fruits harvested?');
    }

    // Order-related suggestions
    if (lowerResponse.includes('order') || lowerResponse.includes('buy')) {
      suggestions.push('Place an order', 'Check order status');
    }

    // Visit-related suggestions
    if (lowerResponse.includes('visit') || lowerResponse.includes('tour')) {
      suggestions.push('Book a farm visit', 'What\'s included in the tour?');
    }

    // General suggestions
    if (suggestions.length === 0) {
      suggestions.push('Show me all products', 'Book a farm visit', 'Contact information');
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  };

  const generateActions = (response: string, userQuery: string): Array<{ label: string; action: string; type: 'product' | 'visit' | 'order' | 'contact' }> => {
    const actions: Array<{ label: string; action: string; type: 'product' | 'visit' | 'order' | 'contact' }> = [];
    const lowerResponse = response?.toLowerCase() || '';
    const lowerQuery = userQuery?.toLowerCase() || '';

    // Product browsing actions
    if (lowerResponse.includes('product') || lowerResponse.includes('honey') || lowerResponse.includes('sheep')) {
      actions.push({
        label: 'View Products',
        action: 'Show me your products',
        type: 'product'
      });
    }

    // Order placement actions
    if (lowerResponse.includes('order') || lowerResponse.includes('buy') || lowerResponse.includes('purchase')) {
      actions.push({
        label: 'Place Order',
        action: 'I want to place an order',
        type: 'order'
      });
    }

    // Visit booking actions
    if (lowerResponse.includes('visit') || lowerResponse.includes('tour') || lowerResponse.includes('farm')) {
      actions.push({
        label: 'Book Visit',
        action: 'Book a farm visit',
        type: 'visit'
      });
    }

    // Contact actions
    if (lowerResponse.includes('contact') || lowerResponse.includes('call') || lowerResponse.includes('phone')) {
      actions.push({
        label: 'Call Now',
        action: 'Call me at 0727690165',
        type: 'contact'
      });
    }

    return actions.slice(0, 2); // Limit to 2 actions
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canSendMessage()) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTimestamp = (timestamp?: Date) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const QuickActions = () => (
    <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setInput("I'd like to see your products")}
        className="flex items-center gap-2 h-auto py-2"
      >
        <Package className="h-4 w-4" />
        <span className="text-xs">View Products</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setInput("I'd like to book a farm visit")}
        className="flex items-center gap-2 h-auto py-2"
      >
        <Calendar className="h-4 w-4" />
        <span className="text-xs">Book Visit</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setInput("Tell me about your honey")}
        className="flex items-center gap-2 h-auto py-2"
      >
        <Star className="h-4 w-4" />
        <span className="text-xs">Honey Info</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setInput("Call me")}
        className="flex items-center gap-2 h-auto py-2"
      >
        <Phone className="h-4 w-4" />
        <span className="text-xs">Contact Us</span>
      </Button>
    </div>
  );

  const clearCurrentConversation = () => {
    if (currentConversation && (currentConversation.messages || []).length > 0) {
      if (confirm('Are you sure you want to clear this conversation? This action cannot be undone.')) {
        setCurrentConversation(prev => prev ? { ...prev, messages: [] } : null);
      }
    }
  };

  const exportConversation = () => {
    if (!currentConversation || (currentConversation.messages || []).length === 0) return;

    const conversationText = (currentConversation.messages || [])
      .map(msg => `${msg.role === 'user' ? 'You' : 'Edau Assistant'}: ${msg.content}`)
      .join('\n\n');

    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edau-farm-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderMessageActions = (actions?: Message['actions']) => {
    if (!actions || actions.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction(action.action)}
            className="text-xs h-7"
          >
            {action.label}
          </Button>
        ))}
      </div>
    );
  };

  const renderSuggestions = (suggestions?: string[]) => {
    if (!suggestions || suggestions.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => handleQuickAction(suggestion)}
            className="text-xs h-7 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    );
  };

  const detectAgent = (response: string): string => {
    const lowerResponse = response.toLowerCase();
    
    if (lowerResponse.includes('product') || lowerResponse.includes('inventory') || lowerResponse.includes('stock')) {
      return 'Product Expert';
    }
    if (lowerResponse.includes('order') || lowerResponse.includes('purchase') || lowerResponse.includes('buy')) {
      return 'Order Assistant';
    }
    if (lowerResponse.includes('visit') || lowerResponse.includes('tour') || lowerResponse.includes('farm')) {
      return 'Visit Coordinator';
    }
    if (lowerResponse.includes('wholesale') || lowerResponse.includes('bulk') || lowerResponse.includes('business')) {
      return 'Wholesale Manager';
    }
    if (lowerResponse.includes('contact') || lowerResponse.includes('support') || lowerResponse.includes('help')) {
      return 'Customer Support';
    }
    
    return 'General Assistant';
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    // Auto-send after a short delay if we can send
    setTimeout(() => {
      if (canSendMessage()) {
        handleSend();
      }
    }, 100);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div className="fixed bottom-20 right-4 z-50">
          <Button className="h-12 w-12 rounded-full shadow-lg bg-[#4CAF50] hover:bg-[#388E3C] relative" size="icon">
            <MessageCircle className="h-6 w-6" />
            {/* Active badge indicator */}
            {currentConversation && (currentConversation.messages || []).length > 0 && (
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-[#FFC107] rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-[#FFC107] rounded-full animate-pulse"></div>
              </div>
            )}
            {/* Notification badge for new messages */}
            {totalTokensUsed > 0 && (
              <div className="absolute -top-2 -left-2 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                !
              </div>
            )}
          </Button>
        </div>
      </SheetTrigger>

      <SheetContent className="w-[95vw] sm:w-[500px] flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Bot className="h-6 w-6 mr-2 text-green-600" />
              <SheetTitle>Edau Farm Assistant</SheetTitle>
            </div>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <History className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuItem onClick={createNewConversation}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Conversation
                  </DropdownMenuItem>
                  {currentConversation && currentConversation.messages.length > 0 && (
                    <>
                      <DropdownMenuItem onClick={clearCurrentConversation}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Conversation
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={exportConversation}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Export Conversation
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1 text-xs text-gray-500 font-medium">Recent Conversations</div>
                  {conversations.slice(0, 5).map((conv) => (
                    <DropdownMenuItem 
                      key={conv.id} 
                      onClick={() => selectConversation(conv)}
                      className="flex justify-between items-center"
                    >
                      <span className="truncate flex-1">{conv.title}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="h-6 w-6 p-0 ml-2 opacity-50 hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <SheetClose className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-gray-100" />
            </div>
          </div>
          {currentConversation && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <span>{currentConversation.messages.length} messages</span>
              <span>•</span>
              <span>{currentConversation.token_count || 0} tokens</span>
              {totalTokensUsed > 0 && (
                <>
                  <span>•</span>
                  <span className={totalTokensUsed >= MAX_TOTAL_TOKENS ? 'text-red-500' : totalTokensUsed >= MAX_TOTAL_TOKENS * 0.8 ? 'text-yellow-500' : 'text-blue-500'}>
                    {totalTokensUsed}/{MAX_TOTAL_TOKENS} total
                  </span>
                </>
              )}
              {currentConversation.lastAgent && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs h-5">
                    {currentConversation.lastAgent}
                  </Badge>
                </>
              )}
            </div>
          )}
          {currentConversation && (currentConversation.token_count || 0) >= MAX_TOKENS_PER_CONVERSATION * 0.8 && (
            <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded mt-1">
              ⚠️ Conversation is approaching token limit. Consider starting a new conversation.
            </div>
          )}
          {totalTokensUsed >= MAX_TOTAL_TOKENS * 0.9 && totalTokensUsed < MAX_TOTAL_TOKENS && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded mt-1">
              ⚠️ Daily token limit almost reached. Chat functionality may be limited soon.
            </div>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {!currentConversation || currentConversation.messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Welcome to Edau Farm Assistant!</p>
              <p className="text-sm mb-4">I'm here to help you discover our fresh, sustainable products and experiences.</p>
              <QuickActions />
              {!user && (
                <p className="text-xs mt-4 text-amber-600 bg-amber-50 p-2 rounded">
                  💡 Sign in to save your conversation history and get personalized recommendations
                </p>
              )}
            </div>
          ) : (
            <>
              {currentConversation.messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-lg px-4 py-3 ${messageClassNames(message)}`}>
                    {message.role === 'system' && (
                      <div className="flex items-center mb-2 text-amber-600">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">System Message</span>
                      </div>
                    )}
                    <div
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                    />
                    {renderMessageActions(message.actions)}
                    {renderSuggestions(message.suggestions)}
                    {message.timestamp && (
                      <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-green-100' : 'text-gray-500'}`}>
                        {formatTimestamp(message.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-lg px-4 py-3 bg-gray-100 flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-75"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150"></div>
                    </div>
                    <span className="text-xs text-gray-500">Edau Assistant is typing...</span>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>        <div className="p-4 border-t">
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={
                  loading ? "Assistant is responding..." :
                  !canSendMessage() && input.trim() ? getSendButtonState().tooltip :
                  "Ask about products, orders, visits, or anything farm-related..."
                }
                className="min-h-[60px] max-h-[120px] resize-none pr-12"
                rows={2}
                disabled={loading}
              />
              {input.length > 0 && (
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {input.length}/500
                </div>
              )}
            </div>
            <Button
              onClick={handleSend}
              disabled={!canSendMessage()}
              size="icon"
              className="h-10 w-10 flex-shrink-0"
              title={getSendButtonState().tooltip}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <div className="flex items-center gap-2">
              {loading && <span className="text-green-600">Processing your message...</span>}
              {!loading && input.trim() && !canSendMessage() && (
                <span className="text-red-500">{getSendButtonState().tooltip}</span>
              )}
              {input.length > 0 && (
                <span className={input.length > 450 ? 'text-yellow-500' : 'text-gray-400'}>
                  {input.length}/500
                </span>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChatAssistant;
