import toast from "react-hot-toast";
const WarningNotification = ({ message }) => (
  <div style={{ display: "flex", alignItems: "center", color: "#b59f3b" }}>
    <p style={{ marginRight: "10px", fontSize: "24px" }}>⚠️</p>
    <p>{message}</p>
  </div>
);
export const showWarning = (message) => {
  toast.custom(
    (t) => (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px",
          backgroundColor: "#FFFBE6",
          border: "1px solid #FFD700",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          maxWidth: "300px",
          animation: t.visible ? "fadeIn 0.5s" : "fadeOut 0.5s",
        }}
      >
        <WarningNotification message={message} />
        <button
          onClick={() => toast.dismiss(t.id)}
          style={{
            marginLeft: "10px",
            backgroundColor: "transparent",
            border: "none",
            color: "#b59f3b",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          ✖
        </button>
      </div>
    ),
    {
      duration: Infinity,
      position: "bottom-right",
    }
  );
};
