import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { CollaborativePaymentService } from "./CollaborativePaymentService";

interface RequestSummary {
  id: string;
  totalAmount: number;
  amountPaid: number;
  amountRemaining: number;
  description: string;
  status: "ACTIVE" | "COMPLETED" | "EXPIRED";
  createdAt: string;
  expiryDate: string;
  contributorCount: number;
  splitType: "OPEN" | "EQUAL";
}

// Configuration for the payment service
const getPaymentServiceConfig = () => {
  const storedUser = localStorage.getItem("user");
  const userAuthToken = storedUser ? JSON.parse(storedUser)?.token || "" : "";
  
  return {
    backendUrl: import.meta.env.VITE_BACKEND_URL || "https://zarstablecoin-app.onrender.com",
    rapydBaseUrl: import.meta.env.VITE_API_BASE_URL || "https://seal-app-qp9cc.ondigitalocean.app/api/v1",
    authToken: userAuthToken || import.meta.env.VITE_API_AUTH_TOKEN || ""
  };
};

const CollaborativeDashboard = () => {
  const [activeTab, setActiveTab] = useState<"created" | "contributed">("created");
  const [createdRequests, setCreatedRequests] = useState<RequestSummary[]>([]);
  const [contributedRequests, setContributedRequests] = useState<RequestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQRFor, setShowQRFor] = useState<string | null>(null);
  
  const navigate = useNavigate();
  
  // Create payment service with proper configuration
  const paymentService = useMemo(() => {
    const config = getPaymentServiceConfig();
    return new CollaborativePaymentService(config);
  }, []);
  
  // Get user from localStorage
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.user?.id;

  useEffect(() => {
    if (!userId) {
      setError("Please log in to view your collaborative payments");
      setIsLoading(false);
      return;
    }

    fetchUserRequests();
  }, [userId]);

  const fetchUserRequests = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [created, contributed] = await Promise.allSettled([
        paymentService.getUserCreatedRequests(userId),
        paymentService.getUserContributions(userId)
      ]);

      if (created.status === "fulfilled") {
        setCreatedRequests(created.value);
      } else {
        console.error("Failed to fetch created requests:", created.reason);
      }

      if (contributed.status === "fulfilled") {
        setContributedRequests(contributed.value);
      } else {
        console.error("Failed to fetch contributed requests:", contributed.reason);
      }

    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to load your collaborative payments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate QR URL for a request
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "#10b981";
      case "COMPLETED": return "#059669";
      case "EXPIRED": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE": return "⏳";
      case "COMPLETED": return "✅";
      case "EXPIRED": return "⏰";
      default: return "❓";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getProgressPercentage = (amountPaid: number, totalAmount: number) => {
    return Math.min((amountPaid / totalAmount) * 100, 100);
  };

  const isExpiringSoon = (expiryDate: string) => {
    const hoursUntilExpiry = (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24;
  };

  const copyRequestLink = (requestId: string) => {
    const link = `${window.location.origin}/request/${requestId}`;
    navigator.clipboard.writeText(link);
    alert("Request link copied to clipboard!");
  };

  const toggleQR = (requestId: string) => {
    setShowQRFor(showQRFor === requestId ? null : requestId);
  };

  const RequestCard = ({ request, showActions = true }: { request: RequestSummary; showActions?: boolean }) => (
    <div style={{
      background: "var(--glass-bg)",
      backdropFilter: "blur(10px)",
      borderRadius: 16,
      border: request.status === "ACTIVE" && isExpiringSoon(request.expiryDate) 
        ? "2px solid #f59e0b" 
        : "1px solid rgba(255, 255, 255, 0.1)",
      padding: 20,
      marginBottom: 16
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, marginBottom: 4, fontSize: 18, fontWeight: 600 }}>
            {request.description}
          </h3>
          <p style={{ margin: 0, fontSize: 14, color: "#9ca3af" }}>
            Created {formatDate(request.createdAt)} • Expires {formatDate(request.expiryDate)}
          </p>
          {request.status === "ACTIVE" && isExpiringSoon(request.expiryDate) && (
            <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#f59e0b", fontWeight: 600 }}>
              ⚠️ Expires soon!
            </p>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            padding: "4px 12px",
            borderRadius: 20,
            backgroundColor: getStatusColor(request.status),
            color: "white",
            fontSize: 12,
            fontWeight: 600
          }}>
            {getStatusIcon(request.status)} {request.status}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 14, color: "#d1d5db" }}>Progress</span>
          <span style={{ fontSize: 14, color: "#d1d5db" }}>
            {getProgressPercentage(request.amountPaid, request.totalAmount).toFixed(1)}%
          </span>
        </div>
        <div style={{
          width: "100%",
          height: 8,
          backgroundColor: "#4b5563",
          borderRadius: 4,
          overflow: "hidden"
        }}>
          <div style={{
            width: `${getProgressPercentage(request.amountPaid, request.totalAmount)}%`,
            height: "100%",
            backgroundColor: request.status === "COMPLETED" ? "#10b981" : "#3b82f6",
            transition: "width 0.5s ease"
          }} />
        </div>
      </div>

      {/* Amount Details */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr 1fr", 
        gap: 12, 
        marginBottom: 16,
        textAlign: "center" 
      }}>
        <div>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Total</p>
          <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
            R{request.totalAmount.toFixed(2)}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Paid</p>
          <p style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "#10b981" }}>
            R{request.amountPaid.toFixed(2)}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Remaining</p>
          <p style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "#ef4444" }}>
            R{request.amountRemaining.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Meta Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 14, color: "#9ca3af" }}>
          {request.contributorCount} contributor{request.contributorCount !== 1 ? 's' : ''}
        </span>
        <span style={{ fontSize: 14, color: "#9ca3af" }}>
          {request.splitType === "OPEN" ? "Flexible amounts" : "Equal splits"}
        </span>
      </div>

      {/* QR Code Section - Only show for ACTIVE requests */}
      {request.status === "ACTIVE" && showQRFor === request.id && (
        <div style={{
          background: "rgba(255, 255, 255, 0.03)",
          padding: 16,
          borderRadius: 12,
          marginBottom: 16,
          textAlign: "center"
        }}>
          <div style={{
            backgroundColor: "white",
            padding: 16,
            borderRadius: 8,
            display: "inline-block",
            marginBottom: 12
          }}>
            <QRCode 
              value={generateQRUrl(request.id)}
              size={150}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
          </div>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
            Scan this QR code to contribute to the payment
          </p>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => navigate(`/request/${request.id}`)}
            style={{
              flex: 1,
              minWidth: "120px",
              padding: "10px 16px",
              borderRadius: 8,
              background: "var(--accent-color)",
              color: "white",
              border: "none",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
          >
            View Details
          </button>
          
          {activeTab === "created" && request.status === "ACTIVE" && (
            <>
              <button
                onClick={() => toggleQR(request.id)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  backgroundColor: showQRFor === request.id ? "#ef4444" : "#10b981",
                  color: "white",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              >
                {showQRFor === request.id ? "Hide QR" : "Show QR"}
              </button>
              
              <button
                onClick={() => copyRequestLink(request.id)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              >
                Copy Link
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );

    if (isLoading) {
      return (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
          color: "white",
          textAlign: "center",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            width: "50px",
            height: "50px",
            border: "8px solid rgba(255, 255, 255, 0.2)",
            borderTop: "8px solid white",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: 16,
          }}></div>
          <p style={{
            fontSize: 20,
            fontWeight: "bold",
            animation: "fadeIn 1s infinite alternate",
            animationDelay: "0.5s"
          }}>
            Loading your collaborative payments...
          </p>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes fadeIn {
                0% { opacity: 0.5; }
                100% { opacity: 1; }
              }
            `}
          </style>
        </div>
      );
    }


  if (error && !userId) {
    return (
      <div style={{
        maxWidth: 500,
        margin: "auto",
        padding: 24,
        color: "white",
        background: "var(--glass-bg)",
        backdropFilter: "blur(10px)",
        borderRadius: 20,
        border: "1px solid rgba(255, 255, 255, 0.1)",
        textAlign: "center"
      }}>
        <h2>Authentication Required</h2>
        <p style={{ color: "#ef4444", marginBottom: 20 }}>{error}</p>
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
    );
  }

  const currentRequests = activeTab === "created" ? createdRequests : contributedRequests;

  return (
    <div style={{
      maxWidth: 800,
      margin: "auto",
      padding: 24,
      color: "white",
      minHeight: "100vh"
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Collaborative Payments
        </h1>
        <p style={{ color: "#9ca3af", fontSize: 16 }}>
          Manage your group payments and contributions
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: "flex",
        borderRadius: 12,
        gap: 10,
        padding: 4,
        marginBottom: 24
      }}>
        <button
          onClick={() => setActiveTab("created")}
          style={{
            flex: 1,
            padding: "12px 20px",
            borderRadius: 8,
            border: "none",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            backgroundColor: activeTab === "created" ? "#3b82f6" : "#495b75ff",
            color: activeTab === "created" ? "white" : "#9ca3af",
            transition: "all 0.2s"
          }}
        >
          My Requests ({createdRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("contributed")}
          style={{
            flex: 1,
            padding: "12px 20px",
            borderRadius: 8,
            border: "none",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            backgroundColor: activeTab === "contributed" ? "#3b82f6" : "#495b75ff",
            color: activeTab === "contributed" ? "white" : "#9ca3af",
            transition: "all 0.2s"
          }}
        >
          My Contributions ({contributedRequests.length})
        </button>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: "flex",
        gap: 12,
        marginBottom: 24
      }}>
        <button
          onClick={() => navigate("/send")}
          style={{
            flex: 1,
            padding: "14px 20px",
            borderRadius: 10,
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          + Create New Request
        </button>
        <button
          onClick={fetchUserRequests}
          style={{
            padding: "14px 20px",
            borderRadius: 10,
            backgroundColor: "#374151",
            color: "white",
            border: "1px solid #4b5563",
            fontSize: 16,
            cursor: "pointer"
          }}
        >
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: "#7f1d1d",
          border: "1px solid #ef4444",
          borderRadius: 8,
          padding: 16,
          marginBottom: 24
        }}>
          <p style={{ margin: 0, color: "#fecaca" }}>{error}</p>
        </div>
      )}

      {/* Content */}
      {currentRequests.length === 0 ? (
        <div style={{
          backgroundColor: "#374151",
          borderRadius: 12,
          padding: 40,
          textAlign: "center"
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>
            {activeTab === "created" ? "📄" : "🤝"}
          </div>
          <h3 style={{ margin: 0, marginBottom: 12 }}>
            {activeTab === "created" ? "No payment requests created yet" : "No contributions made yet"}
          </h3>
          <p style={{ color: "#9ca3af", marginBottom: 24 }}>
            {activeTab === "created" 
              ? "Create your first collaborative payment request to start collecting money from others."
              : "You haven't contributed to any collaborative payments yet. Join one by scanning a QR code or clicking a shared link."
            }
          </p>
          {activeTab === "created" && (
            <button
              onClick={() => navigate("/send")}
              style={{
                padding: "12px 24px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 16,
                cursor: "pointer"
              }}
            >
              Create Your First Request
            </button>
          )}
        </div>
      ) : (
        <div>
          {/* Summary Stats */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 16,
            marginBottom: 24
          }}>
            <div style={{ backgroundColor: "#374151", padding: 16, borderRadius: 8, textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>Active</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "#10b981" }}>
                {currentRequests.filter(r => r.status === "ACTIVE").length}
              </p>
            </div>
            <div style={{ backgroundColor: "#374151", padding: 16, borderRadius: 8, textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>Completed</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "#059669" }}>
                {currentRequests.filter(r => r.status === "COMPLETED").length}
              </p>
            </div>
            <div style={{ backgroundColor: "#374151", padding: 16, borderRadius: 8, textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>Total Amount</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
                R{currentRequests.reduce((sum, r) => sum + r.totalAmount, 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Request List */}
          <div>
            {currentRequests
              .sort((a, b) => {
                // Sort by status (ACTIVE first), then by creation date (newest first)
                if (a.status !== b.status) {
                  if (a.status === "ACTIVE") return -1;
                  if (b.status === "ACTIVE") return 1;
                }
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              })
              .map(request => (
                <RequestCard key={request.id} request={request} />
              ))
            }
          </div>
        </div>
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
  );
};

export default CollaborativeDashboard;