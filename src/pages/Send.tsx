import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Simple email regex for validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CollaborativeRequestPayload {
  totalAmount: number;
  description: string;
  merchantId: string;
  splitType: "OPEN" | "EQUAL";
  maxParticipants?: number | null;
  expiryDate: string;
}

interface CreateRequestResponse {
  id: string;
  totalAmount: number;
  description: string;
  status: string;
  createdAt: string;
}

interface WhatsAppNotificationData {
  to: string;
  from?: string;
  message: string;
  firstName?: string;
  lastName?:string;
  amount?: string;
  currency?: string;
}

const SendMoneyPage = () => {
  const [recipientEmail, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("ZAR");
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [description, setDescription] = useState("");
  const [splitType, setSplitType] = useState<"OPEN" | "EQUAL">("OPEN");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [expiryHours, setExpiryHours] = useState("24");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const navigate = useNavigate();

  const userId = user?.user?.id;
  const firstName = user?.user?.firstName;
  const lastName = user?.user?.lastName;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const API_AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const formatPhoneForWhatsApp = (phoneNumber: string): string => {
    if (!phoneNumber) return '';
    
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return '27' + cleaned.substring(1);
    } else if (cleaned.startsWith('27') && cleaned.length === 11) {
      return cleaned;
    } else if (cleaned.startsWith('27') && cleaned.length === 12) {
      return cleaned.substring(0, 11);
    } else if (cleaned.length === 9) {
      return '27' + cleaned;
    }
    return cleaned;
  };


  const sendWhatsAppNotification = async (data: WhatsAppNotificationData) => {

    try {
      const formattedPhone = formatPhoneForWhatsApp(data.to);
      
      if (!formattedPhone) {
        console.warn('Invalid phone number format:', data.to);
        return;
      }

      console.log(`Sending WhatsApp to: ${data.to} -> formatted: ${formattedPhone}`);

      const whatsappResponse = await fetch(`https://graph.facebook.com/v20.0/${import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: {
            body: data.message
          }
        })
      });

      if (whatsappResponse.ok) {
        const responseData = await whatsappResponse.json();
        console.log('WhatsApp message sent successfully:', responseData);
        return responseData;
      } else {
        const errorData = await whatsappResponse.json();
        console.error('WhatsApp API error:', errorData);
        throw new Error(`WhatsApp API failed: ${whatsappResponse.status}`);
      }

    } catch (error) {
      console.error('WhatsApp notification error:', error);
    }
  };

  /*Validation */
  const validateDirectSend = (): boolean => {
    if (!recipientEmail.trim() || !emailRegex.test(recipientEmail)) {
      setError("Please enter a valid recipient email");
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid positive amount");
      return false;
    }
    if (!userId) {
      setError("User not logged in. Please log in again.");
      return false;
    }
    setError(null);
    return true;
  };

  const validateCollaborative = (): boolean => {
    if (!validateDirectSend()) return false;
    if (!description.trim()) {
      setError("Description is required for collaborative requests");
      return false;
    }
    if (splitType === "EQUAL" && (!maxParticipants || parseInt(maxParticipants) <= 1)) {
      setError("Please enter a valid number of participants (>1) for equal splits");
      return false;
    }
    if (!BACKEND_URL) {
      setError("Backend URL not configured. Please check environment variables.");
      return false;
    }
    setError(null);
    return true;
  };

  /*Direct send flow */
  const handleDirectSend = async () => {
    if (!validateDirectSend()) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log("Starting direct send process...");

      // Step 1: Generate gas for the transaction
      const generateGas = await fetch(`${API_BASE_URL}/activate-pay/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${API_AUTH_TOKEN}` },
      });

      if (!generateGas.ok) {
        const gasError = await generateGas.json();
        console.error("Gas generation failed:", gasError);
        setError(gasError.message || "Error generating gas");
        return;
      }

      console.log("Gas generated successfully");

      // Step 2: Get recipient details
      const getUserResponse = await fetch(`${API_BASE_URL}/recipient/${recipientEmail}`, {
        headers: { Authorization: `Bearer ${API_AUTH_TOKEN}` },
      });

      if (!getUserResponse.ok) {
        const recipientError = await getUserResponse.json();
        console.error("Recipient fetch failed:", recipientError);
        setError(recipientError.message || "Recipient not found");
        return;
      }

      const recipientData = await getUserResponse.json();
      console.log("Recipient data:", recipientData);

      // Step 3: Execute the transfer
      const transferPayload = {
        transactionAmount: parseFloat(amount),
        transactionRecipient: recipientData.paymentIdentifier || recipientData.id,
        transactionNotes: `Direct send via app to ${recipientEmail}`,
      };

      console.log("Transfer payload:", transferPayload);

      const transferCoins = await fetch(`${API_BASE_URL}/transfer/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_AUTH_TOKEN}`,
        },
        body: JSON.stringify(transferPayload),
      });

      if (!transferCoins.ok) {
        const transferError = await transferCoins.json();
        console.error("Transfer failed:", transferError);
        setError(transferError.message || "Error transferring coins");
        return;
      }

      //Add whatsapp notification
      const recipientResponse = await fetch(`${BACKEND_URL}/api/user/email/${recipientEmail}`, {
          headers: { "Content-Type": "application/json" }
        });

        if (recipientResponse.ok) {
          const recipient_data = await recipientResponse.json();
          console.log("RR",recipient_data)
          const recipientPhoneNumber = recipient_data.phoneNumber;
          console.log(recipientPhoneNumber)

           if (recipientPhoneNumber) {
              await sendWhatsAppNotification({
                to: recipientPhoneNumber,
                message: `💰 You received ${amount} ${currency} from ${firstName} ${lastName}! Check your wallet to see the transaction.`,
                firstName,
                lastName,
                amount,
                currency
              });
            }
          }
    
      const transferResponse = await transferCoins.json();
      console.log("Transfer successful:", transferResponse);

      setSuccessMessage(`Successfully sent ${amount} ${currency} to ${recipientEmail}`);
      resetForm();
      
      // Navigate after a short delay to show success message
      setTimeout(() => navigate("/dashboard"), 2000);

    } catch (err) {
      console.error("Send Money Error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /*collaborative request flow */
  const handleCollaborativeRequest = async () => {
    if (!validateCollaborative()) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log("Starting collaborative request creation...");

      // Step 1: Get recipient/merchant details
      const getUserResponse = await fetch(`${API_BASE_URL}/recipient/${recipientEmail}`, {
        headers: { Authorization: `Bearer ${API_AUTH_TOKEN}` },
      });

      if (!getUserResponse.ok) {
        const recipientError = await getUserResponse.json();
        console.error("Recipient fetch failed:", recipientError);
        setError("Merchant/recipient not found. Please verify the email address.");
        return;
      }

      const recipientData = await getUserResponse.json();
      console.log("Merchant data:", recipientData);

      // Step 2: Create expiry date
      const expiryDate = new Date(
        Date.now() + parseInt(expiryHours) * 60 * 60 * 1000
      ).toISOString();

      // Step 3: Prepare payload
      const payload: CollaborativeRequestPayload = {
        totalAmount: parseFloat(amount),
        description: description.trim(),
        merchantId: recipientData.id,
        splitType: splitType,
        maxParticipants: splitType === "EQUAL" ? parseInt(maxParticipants) : null,
        expiryDate: expiryDate,
      };

      console.log("Collaborative request payload:", payload);

      // Step 4: Create the collaborative request
      const requestResponse = await fetch(`${BACKEND_URL}/api/v1/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": userId,
          Authorization: `Bearer ${API_AUTH_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      if (!requestResponse.ok) {
        const errorData = await requestResponse.json();
        console.error("Request creation failed:", errorData);
        setError(errorData.message || `Failed to create request (${requestResponse.status})`);
        return;
      }

      const requestData: CreateRequestResponse = await requestResponse.json();
      console.log("Collaborative request created:", requestData);

      setSuccessMessage(`
        Collaborative payment request created successfully! 
        Request ID: ${requestData.id}
        Share this with contributors to join the payment.
      `);

      // Generate QR code data for sharing
      const qrData = generateQRData(requestData.id);
      console.log("QR Code URL:", qrData);

      resetForm();
      
      // Navigate to the request details page
      setTimeout(() => navigate(`/request/${requestData.id}`), 2000);

    } catch (err) {
      console.error("Collaborative Request Error:", err);
      if (err instanceof TypeError) {
        setError("Network error. Please check if the backend service is running.");
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /*Generate QR data for collaborative requests */
  const generateQRData = (requestId: string): string => {
    const qrData = {
      type: 'collaborative',
      requestId: requestId,
      timestamp: Date.now(),
      version: '1.0'
    };
    
    // Encode as base64 for QR
    const encodedData = btoa(JSON.stringify(qrData));
    return `${window.location.origin}/pay?data=${encodedData}`;
  };

  /*Reset form */
  const resetForm = () => {
    setRecipient("");
    setAmount("");
    setDescription("");
    setMaxParticipants("");
    setError(null);
  };

  return (
    <div style={{
      backgroundColor: "var(--bg-color)",
      minHeight: "100vh",
      padding: "20px",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start"
    }}>
      <div style={{
        width: "100%",
        maxWidth: 500,
        margin: "0 auto",
        padding: 32,
        color: "white",
        background: "var(--glass-bg)",
        backdropFilter: "blur(10px)",
        borderRadius: 20,
        border: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
      <h1 style={{ 
        marginBottom: 24, 
        fontSize: 28,
        fontWeight: 700,
        textAlign: "center"
      }}>
        {isCollaborative ? "Create Collaborative Payment" : "Send Money"}
      </h1>

      {/* Error message */}
      {error && (
        <div style={{ 
          color: "#ef4444", 
          backgroundColor: "#fef2f2",
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          border: "1px solid #fecaca"
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div style={{ 
          color: "#059669", 
          backgroundColor: "#f0fdf4",
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          border: "1px solid #bbf7d0",
          whiteSpace: "pre-line"
        }}>
          <strong>Success:</strong> {successMessage}
        </div>
      )}

      {/* Toggle direct/collaborative */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 8,
          fontSize: 13,
          fontWeight: 500
        }}>
          <input
            type="checkbox"
            checked={isCollaborative}
            onChange={(e) => setIsCollaborative(e.target.checked)}
            style={{ width: 16, height: 16 }}
          />
          Create collaborative payment request
        </label>
        <p style={{ 
          fontSize: 14, 
          color: "#9ca3af", 
          marginTop: 4,
          marginLeft: 24
        }}>
          {isCollaborative 
            ? "Multiple people can contribute to reach the target amount"
            : "Send money directly to one person"
          }
        </p>
      </div>

      {/* Recipient */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ 
          display: "block",
          marginBottom: 6,
          fontSize: 14,
          fontWeight: 500
        }}>
          {isCollaborative ? "Final Recipient Email:" : "Recipient Email:"}
        </label>
        <input
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="recipient@example.com"
          style={{ 
            width: "100%", 
            padding: 12, 
            borderRadius: 12,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            background: "rgba(255, 255, 255, 0.05)",
            color: "white",
            fontSize: 16
          }}
        />
      </div>

      {/* Amount */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ 
          display: "block",
          marginBottom: 6,
          fontSize: 14,
          fontWeight: 500
        }}>
          Amount:
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
          style={{ 
            width: "100%", 
            padding: 12, 
            borderRadius: 12,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            background: "rgba(255, 255, 255, 0.05)",
            color: "white",
            fontSize: 16
          }}
        />
      </div>

      {isCollaborative && (
        <>
          {/* Description */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ 
              display: "block",
              marginBottom: 6,
              fontSize: 14,
              fontWeight: 500
            }}>
              Description: <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Group dinner at restaurant"
              style={{ 
                width: "100%", 
                padding: 12, 
                borderRadius: 12,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: "rgba(255, 255, 255, 0.05)",
                color: "white",
                fontSize: 16
              }}
            />
          </div>

          {/* Split Type */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ 
              display: "block",
              marginBottom: 6,
              fontSize: 14,
              fontWeight: 500
            }}>
              Split Type:
            </label>
            <select
              value={splitType}
              onChange={(e) => setSplitType(e.target.value as "OPEN" | "EQUAL")}
              style={{ 
                width: "100%", 
                padding: 12, 
                borderRadius: 12,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "white",
                fontSize: 16
              }}
            >
              <option value="OPEN">Open (flexible amounts)</option>
              <option value="EQUAL">Equal splits</option>
            </select>
            <p style={{ 
              fontSize: 12, 
              color: "#9ca3af", 
              marginTop: 4 
            }}>
              {splitType === "OPEN" 
                ? "Contributors can pay any amount towards the total"
                : "The amount will be split equally among participants"
              }
            </p>
          </div>

          {splitType === "EQUAL" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ 
                display: "block",
                marginBottom: 6,
                fontSize: 14,
                fontWeight: 500
              }}>
                Number of Participants: <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                placeholder="e.g. 4"
                min="2"
                style={{ 
                  width: "100%", 
                  padding: 12, 
                  borderRadius: 12,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "white",
                  fontSize: 16
                }}
              />
              {maxParticipants && (
                <p style={{ 
                  fontSize: 12, 
                  color: "#10b981", 
                  marginTop: 4 
                }}>
                  Each participant pays: {amount ? (parseFloat(amount) / parseInt(maxParticipants)).toFixed(2) : '0.00'} {currency}
                </p>
              )}
            </div>
          )}

          {/* Expiry */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ 
              display: "block",
              marginBottom: 6,
              fontSize: 14,
              fontWeight: 500
            }}>
              Expires in:
            </label>
            <select
              value={expiryHours}
              onChange={(e) => setExpiryHours(e.target.value)}
              style={{ 
                width: "100%", 
                padding: 12, 
                borderRadius: 12,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "white",
                fontSize: 16
              }}
            >
              <option value="1">1 hour</option>
              <option value="6">6 hours</option>
              <option value="24">24 hours</option>
              <option value="72">3 days</option>
              <option value="168">1 week</option>
            </select>
          </div>
        </>
      )}

      {/* Currency */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ 
          display: "block",
          marginBottom: 6,
          fontSize: 14,
          fontWeight: 500
        }}>
          Currency:
        </label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          style={{ 
            width: "100%", 
            padding: 12, 
            borderRadius: 12,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "white",
            fontSize: 16
          }}
        >
          <option value="ZAR">ZAR (South African Rand)</option>
          <option value="USD">USD (US Dollar)</option>
        </select>
      </div>

      {/* Action buttons */}
      <button
        onClick={isCollaborative ? handleCollaborativeRequest : handleDirectSend}
        disabled={isLoading}
        style={{
          padding: "14px 20px",
          borderRadius: 12,
          backgroundColor: isLoading ? "#6b7280" : "#233332ff",
          color: "white",
          width: "100%",
          marginBottom: 12,
          border: "none",
          fontSize: 16,
          fontWeight: 600,
          cursor: isLoading ? "not-allowed" : "pointer",
          transition: "all 0.3s ease"
        }}
      >
        {isLoading ? "Processing..." : isCollaborative ? "Create Payment Request" : "Send Money"}
      </button>

      {isCollaborative && (
        <button
          onClick={() => setIsCollaborative(false)}
          disabled={isLoading}
          style={{
            padding: "12px 20px",
            borderRadius: 12,
            background: "rgba(255, 255, 255, 0.05)",
            color: "white",
            width: "100%",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            fontSize: 14,
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "all 0.3s ease"
          }}
        >
          Switch to Direct Send
        </button>
      )}

       {/* Footer Actions */}
      <div style={{
        marginTop: 32,
        paddingTop: 24,
        borderTop: "1px solid #4b5563",
        textAlign: "center"
      }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "12px 24px",
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            cursor: "pointer"
          }}
        >
          Back to Main Dashboard
        </button>
      </div>

      </div>
    </div>
  );
};

export default SendMoneyPage;