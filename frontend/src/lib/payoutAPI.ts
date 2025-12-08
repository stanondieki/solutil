// Provider Payout API utilities
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net';

export interface BankAccount {
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

export interface PayoutHistory {
  bookingId: string;
  clientName: string;
  serviceTitle: string;
  amount: number;
  platformCommission: number;
  reference: string;
  status: string;
  transferDate: string;
  completedDate: string;
}

export const payoutAPI = {
  // Get banks list
  getBanks: async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE}/api/payouts/banks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const result = await response.json();
      console.log('🏦 Banks response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch banks');
      }

      return {
        success: true,
        banks: result.data?.banks || []
      };
    } catch (error) {
      console.error('❌ Error fetching banks:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch banks',
        banks: []
      };
    }
  },

  // Verify account number
  verifyAccount: async (accountNumber: string, bankCode: string) => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication required');
      }

      console.log('🔍 Verifying account:', { accountNumber, bankCode });

      const response = await fetch(`${API_BASE}/api/payouts/verify-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ accountNumber, bankCode })
      });

      const result = await response.json();
      console.log('✅ Account verification response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Account verification failed');
      }

      return {
        success: true,
        accountName: result.data?.accountName,
        bankName: result.data?.bankName
      };
    } catch (error) {
      console.error('❌ Error verifying account:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Account verification failed'
      };
    }
  },

  // Setup payout account
  setupPayoutAccount: async (bankData: BankAccount) => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication required');
      }

      console.log('💳 Setting up payout account:', bankData);

      const response = await fetch(`${API_BASE}/api/payouts/create-recipient`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(bankData)
      });

      const result = await response.json();
      console.log('📋 Payout account setup response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to setup payout account');
      }

      return {
        success: true,
        message: result.message || 'Payout account setup successful',
        recipientCode: result.data?.recipientCode
      };
    } catch (error) {
      console.error('❌ Error setting up payout account:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to setup payout account'
      };
    }
  },

  // Get payout history
  getPayoutHistory: async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE}/api/payouts/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const result = await response.json();
      console.log('📊 Payout history response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch payout history');
      }

      return {
        success: true,
        payouts: result.data?.payouts || [],
        summary: result.data?.summary || {
          totalEarnings: 0,
          totalCommissions: 0,
          netEarnings: 0,
          totalPayouts: 0
        }
      };
    } catch (error) {
      console.error('❌ Error fetching payout history:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch payout history',
        payouts: [],
        summary: {
          totalEarnings: 0,
          totalCommissions: 0,
          netEarnings: 0,
          totalPayouts: 0
        }
      };
    }
  }
};

// Helper functions
export const handlePayoutAPIError = (error: any) => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  return error.message || 'An unexpected error occurred';
};