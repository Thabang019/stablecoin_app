interface ApiConfig {
  backendUrl: string;
  rapydBaseUrl: string;
  authToken: string;
}

interface CreateRequestPayload {
  totalAmount: number;
  description: string;
  merchantId: string;
  splitType: "OPEN" | "EQUAL";
  maxParticipants?: number | null;
  expiryDate: string;
}

interface ContributePayload {
  userId: string;
  amount: number;
  notes?: string;
}

interface RequestDetails {
  id: string;
  totalAmount: number;
  amountPaid: number;
  amountRemaining: number;
  description: string;
  merchantId: string;
  splitType: "OPEN" | "EQUAL";
  status: "ACTIVE" | "COMPLETED" | "EXPIRED";
  createdAt: string;
  expiryDate: string;
  contributions: Array<{
    userId: string;
    amount: number;
    status: "PAID" | "PENDING" | "FAILED";
    createdAt: string;
  }>;
  contributorCount: number;
  canContribute: boolean;
  suggestedAmount: number;
}

interface UserBalance {
  tokens: Array<{
    name: string;
    balance: string;
    symbol: string;
  }>;
}

interface RecipientDetails {
  id: string;
  paymentIdentifier: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface TransferResult {
  success: boolean;
  transactionId?: string;
  message?: string;
  error?: string;
}

export class CollaborativePaymentService {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  private getHeaders(includeUserId?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.config.authToken}`,
      'Content-Type': 'application/json'
    };

    if (includeUserId) {
      headers['X-User-ID'] = includeUserId;
    }

    return headers;
  }

  // ========== USER & RECIPIENT MANAGEMENT ==========
  
  async getRecipientDetails(identifier: string): Promise<RecipientDetails> {
    try {
      const response = await fetch(`${this.config.rapydBaseUrl}/recipient/${identifier}`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Recipient not found');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get recipient error:', error);
      throw error;
    }
  }

  async getUserBalance(userId: string): Promise<UserBalance> {
    try {
      const response = await fetch(`${this.config.rapydBaseUrl}/${userId}/balance`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get balance');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get balance error:', error);
      throw error;
    }
  }

  async checkSufficientFunds(userId: string, amount: number, currency = 'LZAR'): Promise<boolean> {
    try {
      const balanceData = await this.getUserBalance(userId);
      const tokenBalance = balanceData.tokens.find(token => token.name === currency);
      
      if (!tokenBalance) return false;
      
      return parseFloat(tokenBalance.balance) >= amount;
    } catch (error) {
      console.error('Check funds error:', error);
      return false;
    }
  }

  // ========== COLLABORATIVE REQUEST MANAGEMENT ==========
  
  async createCollaborativeRequest(requestData: CreateRequestPayload, createdBy: string): Promise<RequestDetails> {
    try {
      const response = await fetch(`${this.config.backendUrl}/api/v1/requests`, {
        method: 'POST',
        headers: this.getHeaders(createdBy),
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to create request (${response.status})`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Create request error:', error);
      throw error;
    }
  }

  async getRequestDetails(requestId: string): Promise<RequestDetails> {
    try {
      const response = await fetch(`${this.config.backendUrl}/api/v1/requests/${requestId}`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Request not found (${response.status})`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get request error:', error);
      throw error;
    }
  }

  async contributeToRequest(requestId: string, contribution: ContributePayload): Promise<RequestDetails> {
    try {
      const response = await fetch(`${this.config.backendUrl}/api/v1/requests/${requestId}/contribute`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(contribution)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Contribution failed (${response.status})`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Contribute error:', error);
      throw error;
    }
  }

  async completeRequest(requestId: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.backendUrl}/api/v1/requests/${requestId}/complete`, {
        method: 'POST',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to complete request');
      }
    } catch (error) {
      console.error('Complete request error:', error);
      throw error;
    }
  }

  // ========== USER REQUEST HISTORY ==========
  
  async getUserCreatedRequests(userId: string): Promise<RequestDetails[]> {
    try {
      const response = await fetch(`${this.config.backendUrl}/api/v1/requests/created-by/${userId}`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get created requests');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get created requests error:', error);
      throw error;
    }
  }

  async getUserContributions(userId: string): Promise<RequestDetails[]> {
    try {
      const response = await fetch(`${this.config.backendUrl}/api/v1/requests/contributed-to/${userId}`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get contributions');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get contributions error:', error);
      throw error;
    }
  }

  // ========== DIRECT PAYMENTS (Rapyd Integration) ==========
  
  async enableGasPayment(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.rapydBaseUrl}/activate-pay/${userId}`, {
        method: 'POST',
        headers: this.getHeaders()
      });
      
      return response.ok;
    } catch (error) {
      console.error('Enable gas error:', error);
      return false;
    }
  }

  async executeDirectTransfer(userId: string, recipientId: string, amount: number, notes = ''): Promise<TransferResult> {
    try {
      // Enable gas payment first
      await this.enableGasPayment(userId);
      
      const response = await fetch(`${this.config.rapydBaseUrl}/transfer/${userId}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          transactionAmount: amount,
          transactionRecipient: recipientId,
          transactionNotes: notes
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.message || 'Transfer failed'
        };
      }
      
      const result = await response.json();
      return {
        success: true,
        transactionId: result.transactionId,
        message: 'Transfer successful'
      };
    } catch (error) {
      console.error('Transfer error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transfer failed'
      };
    }
  }

  // ========== QR CODE FUNCTIONALITY ==========
  
  generateQRData(requestId: string, type = 'collaborative'): string {
    const qrData = {
      type: type,
      requestId: requestId,
      timestamp: Date.now(),
      version: '1.0'
    };
    
    // Encode as base64 for QR
    const encodedData = btoa(JSON.stringify(qrData));
    return `${window.location.origin}/request/${requestId}?qr=1&data=${encodedData}`;
  }

  parseQRData(qrUrl: string): { type: string; requestId: string; timestamp: number; version: string } {
    try {
      const url = new URL(qrUrl);
      const data = url.searchParams.get('data');
      
      if (!data) {
        throw new Error('Invalid QR code format');
      }
      
      return JSON.parse(atob(data));
    } catch (error) {
      console.error('Parse QR error:', error);
      throw new Error('Invalid QR code');
    }
  }

  // ========== REAL-TIME UPDATES ==========
  
  async pollRequestStatus(
    requestId: string, 
    callback: (error: Error | null, request: RequestDetails | null) => void, 
    intervalMs = 3000
  ): Promise<() => void> {
    let isPolling = true;
    
    const poll = async () => {
      if (!isPolling) return;
      
      try {
        const request = await this.getRequestDetails(requestId);
        callback(null, request);
        
        if (request.status === 'COMPLETED' || request.status === 'EXPIRED') {
          isPolling = false;
          return;
        }
        
        setTimeout(poll, intervalMs);
      } catch (error) {
        callback(error instanceof Error ? error : new Error('Polling failed'), null);
        setTimeout(poll, intervalMs); // Continue polling even on error
      }
    };
    
    poll();
    
    // Return stop function
    return () => {
      isPolling = false;
    };
  }

  // ========== UTILITY METHODS ==========
  
  formatAmount(amount: number, currency = 'ZAR'): string {
    return `${amount.toFixed(2)} ${currency}`;
  }

  calculateProgress(amountPaid: number, totalAmount: number): number {
    return Math.min((amountPaid / totalAmount) * 100, 100);
  }

  isRequestExpired(expiryDate: string): boolean {
    return new Date(expiryDate) < new Date();
  }

  canUserContribute(request: RequestDetails, userId: string): boolean {
    if (request.status !== 'ACTIVE') return false;
    if (this.isRequestExpired(request.expiryDate)) return false;
    
    // Check if user already contributed (optional business rule)
    const hasContributed = request.contributions.some(c => c.userId === userId && c.status === 'PAID');
    return !hasContributed;
  }
}