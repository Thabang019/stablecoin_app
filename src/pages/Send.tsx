import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SendMoneyPage = () => {
  const [recipientEmail, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("ZAR");

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const navigate = useNavigate();

  const userId = user?.user?.id;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const API_AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN;

  const handleSend = async () => {
    if (!recipientEmail || !amount) {
      alert("Please enter recipient and amount");
      return;
    }

    try {

      //Generate gas for sender
      const generateGas = await fetch(`${API_BASE_URL}/activate-pay/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_AUTH_TOKEN}`,
        },
      });

      const gasResponse = await generateGas.json();

      console.log("Gas :",gasResponse)

      if (!generateGas.ok) {
        alert(gasResponse.message || "Error generating gas");
        return;
      }

      //Fetch recipient details
      const getUserResponse = await fetch(`${API_BASE_URL}/recipient/${recipientEmail}`, {
        headers: {
          Authorization: `Bearer ${API_AUTH_TOKEN}`,
        },
      });

      const recipientData = await getUserResponse.json();

      console.log(recipientData.email)

      if (!getUserResponse.ok) {
        alert(recipientData.message || "Error fetching recipient");
        return;
      }

      //Transfer stablecoins
      const transferCoins = await fetch(`${API_BASE_URL}/transfer/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          transactionAmount: parseFloat(amount),
          transactionRecipient: recipientData.paymentIdentifier,
          transactionNotes: `Sent via app to ${recipientEmail}`,
        }),
      })

      //Make Transaction
      const makeTransaction = await fetch(`${API_BASE_URL}/create-transaction/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          transactionAmount: parseFloat(amount),
          transactionCurrency: "ZAR",
          transactionMethod: "Immediate",
          transactionType: "Payment",
          transactionAddress: recipientData.email,
        }),
      });
      const transferResponse = await makeTransaction.json();

      console.log(transferResponse)

      if (!transferCoins.ok) {
        alert(transferResponse.message || "Error transferring coins");
        return;
      }

      alert(`Sent ${amount} ${currency} to ${recipientEmail}`);
      setRecipient("");
      setAmount("");
      navigate("/dashboard");
    } catch (error) {
      console.error("Send Money Error:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "auto",
        padding: 20,
        color: "white",
        backgroundColor: "#121212",
        borderRadius: 12,
      }}
    >
      <h2 style={{ marginBottom: 20 }}>Send Money</h2>

      <div style={{ marginBottom: 12 }}>
        <label>Recipient Wallet / User:</label>
        <input
          type="text"
          value={recipientEmail}
          onChange={(e) => setRecipient(e.target.value)}
          style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 6 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Amount:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 6 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Currency:</label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 6 }}
        >
          <option value="ZAR">ZAR</option>
          <option value="USD">USD</option>
        </select>
      </div>

      <button
        onClick={handleSend}
        style={{
          padding: "8px 16px",
          borderRadius: 6,
          backgroundColor: "#0d9488",
          color: "white",
        }}
      >
        Send
      </button>
    </div>
  );
};

export default SendMoneyPage;
