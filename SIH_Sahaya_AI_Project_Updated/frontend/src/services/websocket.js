/**
 * Real-time WebSocket service for Officer Dashboard live alerts.
 */

const WS_URL =
  import.meta.env.VITE_WS_URL ||
  (window.location.protocol === "https:" ? "wss://" : "ws://") +
    (window.location.hostname || "localhost") +
    ":8000/ws/officer";

class OfficerAlertsWebSocket {
  constructor() {
    this.socket = null;
    this.listeners = new Set();
    this.reconnectTimeout = null;
    this.pingInterval = null;
    this.isConnected = false;
  }

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.socket = new WebSocket(WS_URL);

      this.socket.onopen = () => {
        this.isConnected = true;
        console.log("[Sahaya WS] Connected to live officer alerts socket.");
        
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send("ping");
          }
        }, 25000);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "pong") return;
          this.notifyListeners(data);
        } catch (e) {
          console.warn("[Sahaya WS] Received non-JSON message:", event.data);
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        if (this.pingInterval) clearInterval(this.pingInterval);
        console.log("[Sahaya WS] Connection closed. Retrying in 4s...");
        this.scheduleReconnect();
      };

      this.socket.onerror = (err) => {
        console.warn("[Sahaya WS] WebSocket error:", err);
        if (this.socket) {
          this.socket.close();
        }
      };
    } catch (e) {
      console.warn("[Sahaya WS] Failed to initialize WebSocket:", e);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, 4000);
  }

  subscribe(callback) {
    this.listeners.add(callback);
    if (!this.isConnected) {
      this.connect();
    }
    return () => {
      this.listeners.delete(callback);
    };
  }

  notifyListeners(data) {
    this.listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (err) {
        console.error("[Sahaya WS] Error in alert subscriber callback:", err);
      }
    });
  }

  disconnect() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }
}

export const officerAlertsWS = new OfficerAlertsWebSocket();


