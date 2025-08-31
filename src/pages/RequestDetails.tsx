import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";

interface Contribution {
  userId: string;
  amount: number;
  status: "PAID" | "PENDING" | "FAILED";
  createdAt: string;
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
  contributions: Contribution[];
  contributorCount: number;
  canContribute: boolean;
  suggestedAmount: number;
}

interface ContributePayload {
  userId: string;
  amount: number;
  notes?: string;
}

interface RecipientData {
  user: {
    firstName: string;
    lastName: string;
    id: string;
  };
}

const RequestDetailsPage = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  
  const [requestDetails, setRequestDetails] = useState<RequestDetails | null>(null);
  const [recipientData, setRecipientData] = useState<RecipientData | null>(null);
  const [contributionAmount, setContributionAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isContributing, setIsContributing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.user?.id;

  const API_AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Generate QR URL for this request
  const generateQRUrl = (requestId: string): string => {
    const qrData = {
      type: 'collaborative',
      requestId: requestId,
      timestamp: Date.now(),
      version: '1.0'
    };
    
    const encodedData = btoa(JSON.stringify(qrData));
    return `${window.location.origin}/request/${requestId}?qr=1&data=${encodedData}`;
  };

  // Fetch request details
  const fetchRequestDetails = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/requests/${requestId}`, {
        headers: {
          Authorization: `Bearer ${API_AUTH_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Request not found (${response.status})`);
      }

      const data: RequestDetails = await response.json();
      setRequestDetails(data);
      setError(null);
      return data;
    } catch (err) {
      console.error("Failed to fetch request details:", err);
      setError("Failed to load request details. Please try again.");
      return null;
    }
  };

  // Fetch recipient details
  const fetchRecipientDetails = async (merchantId: string) => {
    try {

      const storedRecipientData = localStorage.getItem("recipientData");
      if (storedRecipientData) {
        const parsedData = JSON.parse(storedRecipientData);
        setRecipientData(parsedData);
        return;
      }

      const getRecipient = await fetch(`${API_BASE_URL}/users/${merchantId}`, {
        headers: {
          Authorization: `Bearer ${API_AUTH_TOKEN}`
        }
      });

      const data = await getRecipient.json();

      if (!getRecipient.ok) {
        console.error("Error fetching recipient:", data.message || "Unknown error");
        return;
      }

      localStorage.setItem("recipientData", JSON.stringify(data));
      setRecipientData(data);
      console.log("Recipient data:", data);

    } catch (error) {
      console.error("Recipient data error:", error);
    }
  };


  useEffect(() => {
    if (!requestId) return;

    const initializeData = async () => {
      setIsLoading(true);
      const requestData = await fetchRequestDetails();
    
      if (requestData?.merchantId) {
        await fetchRecipientDetails(requestData.merchantId);
      }
      
      setIsLoading(false);
    };

    initializeData();
  }, [requestId]);

  useEffect(() => {
    if (!requestDetails || requestDetails.status !== "ACTIVE") return;

    const interval = setInterval(() => {
      fetchRequestDetails();
    }, 5000);

    return () => clearInterval(interval);
  }, [requestDetails?.status]);

  const handleContribute = async () => {
    if (!requestDetails || !userId) return;

    const amount = parseFloat(contributionAmount);
    if (!amount || amount <= 0) {
      setError("Please enter a valid contribution amount");
      return;
    }

    if (amount > requestDetails.amountRemaining) {
      setError(`Amount cannot exceed remaining balance of ${requestDetails.amountRemaining}`);
      return;
    }

    setIsContributing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Check user balance (optional)
      const balanceResponse = await fetch(`${API_BASE_URL}/${userId}/balance`, {
        headers: { Authorization: `Bearer ${API_AUTH_TOKEN}` },
      });

      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        console.log("User balance:", balanceData);
      }

      // Generate gas for the transaction
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

      // Contribute to the request
      const contributePayload: ContributePayload = {
        userId: userId,
        amount: amount,
        notes: notes.trim() || `Contribution to ${requestDetails.description}`,
      };

      console.log("Contributing with payload:", contributePayload);

      const contributeResponse = await fetch(
        `${BACKEND_URL}/api/v1/requests/${requestId}/contribute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_AUTH_TOKEN}`,
          },
          body: JSON.stringify(contributePayload),
        }
      );

      if (!contributeResponse.ok) {
        const errorData = await contributeResponse.json();
        throw new Error(errorData.message || `Contribution failed (${contributeResponse.status})`);
      }

      const updatedRequest: RequestDetails = await contributeResponse.json();
      setRequestDetails(updatedRequest);

      setSuccessMessage(
        `Successfully contributed ${amount} to the payment! ${
          updatedRequest.status === "COMPLETED" 
            ? "🎉 Payment is now complete!" 
            : `Remaining: ${updatedRequest.amountRemaining}`
        }`
      );

      setContributionAmount("");
      setNotes("");

    } catch (err) {
      console.error("Contribution failed:", err);
      setError(err instanceof Error ? err.message : "Contribution failed. Please try again.");
    } finally {
      setIsContributing(false);
    }
  };

  const getProgressPercentage = () => {
    if (!requestDetails) return 0;
    return Math.min((requestDetails.amountPaid / requestDetails.totalAmount) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "#10b981";
      case "COMPLETED": return "#059669";
      case "EXPIRED": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isExpired = () => {
    if (!requestDetails) return false;
    return new Date(requestDetails.expiryDate) < new Date();
  };

  const canUserContribute = () => {
    if (!requestDetails || !userId) return false;
    if (requestDetails.status !== "ACTIVE") return false;
    if (isExpired()) return false;
    
    // Check if user already contributed
    const hasContributed = requestDetails.contributions.some(c => c.userId === userId);
    return !hasContributed;
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "400px",
        color: "white"
      }}>
        <div>Loading request details...</div>
      </div>
    );
  }

  if (error && !requestDetails) {
    return (
      <div style={{
        maxWidth: 500,
        margin: "auto",
        padding: 24,
        color: "white",
        backgroundColor: "#1f2937",
        borderRadius: 16,
        textAlign: "center"
      }}>
        <h2>Request Not Found</h2>
        <p style={{ color: "#ef4444", marginBottom: 20 }}>{error}</p>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "12px 24px",
            backgroundColor: "#374151",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

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
        maxWidth: 600,
        margin: "0 auto",
        padding: 32,
        color: "white",
        background: "var(--glass-bg)",
        backdropFilter: "blur(10px)",
        borderRadius: 20,
        border: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
          Collaborative Payment
        </h1>
        <p style={{ color: "#9ca3af", fontSize: 14 }}>
          {recipientData ? (
            `Receiver Name: ${recipientData.user.firstName} ${recipientData.user.lastName}`
          ) : (
            "Loading recipient information..."
          )}
        </p>
      </div>

      {requestDetails && (
        <>
          {/* Status and Description */}
          <div style={{ 
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            padding: 20, 
            borderRadius: 16,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            marginBottom: 20 
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: 12 
            }}>
              <h2 style={{ fontSize: 20, margin: 0 }}>{requestDetails.description}</h2>
              <span style={{ 
                padding: "6px 12px",
                borderRadius: 20,
                backgroundColor: getStatusColor(requestDetails.status),
                color: "white",
                fontSize: 12,
                fontWeight: 600
              }}>
                {requestDetails.status}
              </span>
            </div>
            
            <div style={{ fontSize: 14, color: "#d1d5db" }}>
              <p>Split Type: {requestDetails.splitType === "OPEN" ? "Open amounts" : "Equal splits"}</p>
              <p>Created: {formatDate(requestDetails.createdAt)}</p>
              <p>Expires: {formatDate(requestDetails.expiryDate)}</p>
              {isExpired() && (
                <p style={{ color: "#ef4444", fontWeight: 600 }}>⚠️ This request has expired</p>
              )}
            </div>
          </div>

          {/* Progress Section */}
          <div style={{ 
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            padding: 20, 
            borderRadius: 16,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            marginBottom: 20 
          }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>Progress</span>
                <span>{getProgressPercentage().toFixed(1)}%</span>
              </div>
              <div style={{
                width: "100%",
                height: 12,
                backgroundColor: "#4b5563",
                borderRadius: 6,
                overflow: "hidden"
              }}>
                <div style={{
                  width: `${getProgressPercentage()}%`,
                  height: "100%",
                  backgroundColor: requestDetails.status === "COMPLETED" ? "#10b981" : "#3b82f6",
                  transition: "width 0.5s ease"
                }} />
              </div>
            </div>

            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr 1fr", 
              gap: 16, 
              textAlign: "center" 
            }}>
              <div>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Total Amount</p>
                <p style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
                  R{requestDetails.totalAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Amount Paid</p>
                <p style={{ fontSize: 18, fontWeight: 600, margin: 0, color: "#10b981" }}>
                  R{requestDetails.amountPaid.toFixed(2)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Remaining</p>
                <p style={{ fontSize: 18, fontWeight: 600, margin: 0, color: "#ef4444" }}>
                  R{requestDetails.amountRemaining.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
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

          {successMessage && (
            <div style={{ 
              color: "#059669", 
              backgroundColor: "#f0fdf4",
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              border: "1px solid #bbf7d0"
            }}>
              <strong>Success:</strong> {successMessage}
            </div>
          )}

          {/* QR Code Section - Show for active requests */}
          {requestDetails.status === "ACTIVE" && (
            <div style={{ 
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              padding: 20, 
              borderRadius: 16,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              marginBottom: 20 
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>Share Payment Request</h3>
                <button
                  onClick={() => setShowQR(!showQR)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 6,
                    background: "var(--accent-color)",
                    color: "white",
                    border: "none",
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                >
                  {showQR ? "Hide QR" : "Show QR Code"}
                </button>
              </div>

              {showQR && (
                <div style={{ 
                  textAlign: "center", 
                  backgroundColor: "white", 
                  padding: 20, 
                  borderRadius: 8,
                  marginBottom: 16
                }}>
                  <QRCode 
                    value={generateQRUrl(requestDetails.id)}
                    size={200}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                  <p style={{ 
                    margin: "8px 0 0 0", 
                    fontSize: 12, 
                    color: "#6b7280"
                  }}>
                    Scan to contribute to this payment
                  </p>
                </div>
              )}

              <div style={{ 
                display: "flex", 
                gap: 8,
                alignItems: "center"
              }}>
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 6,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "#9ca3af",
                    fontSize: 14
                  }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                  }}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 6,
                    background: "var(--accent-color)",
                    color: "white",
                    border: "none",
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                >
                  Copy Link
                </button>
              </div>
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
                Share this link or QR code with others so they can contribute
              </p>
            </div>
          )}

          {/* Contribution Form */}
          {canUserContribute() && requestDetails.status === "ACTIVE" && (
            <div style={{ 
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              padding: 20, 
              borderRadius: 16,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              marginBottom: 20 
            }}>
              <h3 style={{ marginBottom: 16, fontSize: 18 }}>Make a Contribution</h3>
              
              {requestDetails.splitType === "EQUAL" && (
                <div style={{ 
                  background: "rgba(255, 255, 255, 0.03)",
                  padding: 12, 
                  borderRadius: 8, 
                  marginBottom: 16,
                  border: "1px solid #10b981"
                }}>
                  <p style={{ margin: 0, fontSize: 14, color: "#10b981" }}>
                    💡 Suggested amount: R{requestDetails.suggestedAmount.toFixed(2)}
                  </p>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ 
                  display: "block",
                  marginBottom: 6,
                  fontSize: 14,
                  fontWeight: 500
                }}>
                  Contribution Amount:
                </label>
                <input
                  type="number"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  placeholder={`Max: R${requestDetails.amountRemaining.toFixed(2)}`}
                  min="0"
                  max={requestDetails.amountRemaining}
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

              <div style={{ marginBottom: 16 }}>
                <label style={{ 
                  display: "block",
                  marginBottom: 6,
                  fontSize: 14,
                  fontWeight: 500
                }}>
                  Notes (optional):
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a note for your contribution"
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

              <button
                onClick={handleContribute}
                disabled={isContributing || !contributionAmount || parseFloat(contributionAmount) <= 0}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  borderRadius: 12,
                  backgroundColor: isContributing ? "#6b7280" : "#0d9488",
                  color: "white",
                  border: "none",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: (isContributing || !contributionAmount) ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease"
                }}
              >
                {isContributing ? "Processing Payment..." : "Contribute Now"}
              </button>
            </div>
          )}

          {/* Status Messages for Non-Contributing Users */}
          {!canUserContribute() && requestDetails.status === "ACTIVE" && (
            <div style={{ 
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              padding: 20, 
              borderRadius: 16,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              marginBottom: 20,
              textAlign: "center" 
            }}>
              {!userId ? (
                <div>
                  <p style={{ marginBottom: 16 }}>Please log in to contribute to this payment.</p>
                  <button
                    onClick={() => navigate("/login")}
                    style={{
                      padding: "12px 24px",
                      background: "var(--accent-color)",
                      color: "white",
                      border: "none",
                      borderRadius: 12,
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                  >
                    Go to Login
                  </button>
                </div>
              ) : requestDetails.contributions.some(c => c.userId === userId) ? (
                <div>
                  <p style={{ color: "#10b981", marginBottom: 8 }}>✅ You have already contributed to this payment!</p>
                  <p style={{ fontSize: 14, color: "#9ca3af" }}>
                    Thank you for your contribution. You can share this link with others to help complete the payment.
                  </p>
                </div>
              ) : (
                <p>You are not eligible to contribute to this payment.</p>
              )}
            </div>
          )}

          {requestDetails.status === "COMPLETED" && (
            <div style={{ 
              background: "rgba(16, 185, 129, 0.1)",
              padding: 20, 
              borderRadius: 16,
              marginBottom: 20,
              textAlign: "center",
              border: "1px solid #10b981"
            }}>
              <h3 style={{ color: "#10b981", margin: 0, marginBottom: 8 }}>🎉 Payment Completed!</h3>
              <p style={{ margin: 0, color: "#d1fae5" }}>
                This collaborative payment has been successfully completed. 
                All contributors have been notified.
              </p>
            </div>
          )}

          {requestDetails.status === "EXPIRED" && (
            <div style={{ 
              background: "rgba(239, 68, 68, 0.1)",
              padding: 20, 
              borderRadius: 16,
              marginBottom: 20,
              textAlign: "center",
              border: "1px solid #ef4444"
            }}>
              <h3 style={{ color: "#ef4444", margin: 0, marginBottom: 8 }}>⏰ Payment Expired</h3>
              <p style={{ margin: 0, color: "#fecaca" }}>
                This payment request has expired and can no longer accept contributions.
              </p>
            </div>
          )}

          {/* Contributors List */}
          {requestDetails.contributions.length > 0 && (
            <div style={{ 
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              padding: 20, 
              borderRadius: 16,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              marginBottom: 20 
            }}>
              <h3 style={{ marginBottom: 16, fontSize: 18 }}>
                Contributors ({requestDetails.contributorCount})
              </h3>
              
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {requestDetails.contributions.map((contribution, index) => (
                  <div key={index} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: index < requestDetails.contributions.length - 1 ? "1px solid rgba(255, 255, 255, 0.1)" : "none"
                  }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                        {contribution.userId === userId ? "You" : `User ${contribution.userId.slice(-4)}`}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
                        {formatDate(contribution.createdAt)}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ 
                        margin: 0, 
                        fontSize: 16, 
                        fontWeight: 600,
                        color: contribution.status === "PAID" ? "#10b981" : "#ef4444"
                      }}>
                        R{contribution.amount.toFixed(2)}
                      </p>
                      <p style={{ 
                        margin: 0, 
                        fontSize: 12,
                        color: contribution.status === "PAID" ? "#10b981" : "#ef4444"
                      }}>
                        {contribution.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Back Button */}
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              width: "100%",
              padding: "12px 20px",
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "white",
              fontSize: 16,
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
          >
            Back to Dashboard
          </button>
        </>
      )}
      </div>
    </div>
  );
};

export default RequestDetailsPage;