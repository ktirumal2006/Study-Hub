// frontend/src/lib/ws.js
let ws = null;
let reconnectAttempts = 0;
let maxReconnectAttempts = 5;
let reconnectDelay = 1000;
let reconnectTimer = null;
let messageListeners = [];
let onOpenCallback = null;
let heartbeatInterval = null;

const HEARTBEAT_INTERVAL = 30000; // 30 seconds

/**
 * Connect to WebSocket
 * @param {string} url - WebSocket URL with query params
 * @param {Function} onOpen - Optional callback when connection opens
 */
export function connectWS(url, onOpen) {
  onOpenCallback = onOpen;

  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log("Already connected");
    if (onOpen) onOpen();
    return;
  }

  try {
    ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      reconnectAttempts = 0;
      reconnectDelay = 1000;
      startHeartbeat();
      if (onOpenCallback) onOpenCallback();
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        messageListeners.forEach((listener) => listener(message));
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      console.error("WebSocket URL was:", url);
    };

    ws.onclose = (event) => {
      console.log("🔌 WebSocket closed", { code: event.code, reason: event.reason, wasClean: event.wasClean });
      stopHeartbeat();
      
      // Auto-reconnect with exponential backoff
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(reconnectDelay * Math.pow(2, reconnectAttempts - 1), 30000);
        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
        
        reconnectTimer = setTimeout(() => {
          connectWS(url, onOpen);
        }, delay);
      } else {
        console.error("❌ Max reconnection attempts reached. WebSocket will not reconnect.");
      }
    };
  } catch (err) {
    console.error("Error creating WebSocket:", err);
  }
}

/**
 * Register message listener
 * @param {Function} callback - Callback function for messages
 * @returns {Function} Unsubscribe function
 */
export function onWSMessage(callback) {
  messageListeners.push(callback);
  return () => {
    const index = messageListeners.indexOf(callback);
    if (index > -1) {
      messageListeners.splice(index, 1);
    }
  };
}

/**
 * Send message to WebSocket
 * @param {Object} obj - Object to send (will be JSON stringified)
 */
export function sendWS(obj) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn("WebSocket not connected, cannot send");
    return;
  }
  
  try {
    ws.send(JSON.stringify(obj));
  } catch (err) {
    console.error("Error sending message:", err);
  }
}

/**
 * Start heartbeat ping
 */
function startHeartbeat() {
  heartbeatInterval = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "ping" }));
    }
  }, HEARTBEAT_INTERVAL);
}

/**
 * Stop heartbeat
 */
function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

/**
 * Disconnect WebSocket (manual close, won't auto-reconnect)
 */
export function disconnectWS() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  stopHeartbeat();
  if (ws) {
    ws.close();
    ws = null;
  }
  messageListeners = [];
  reconnectAttempts = maxReconnectAttempts; // Prevent auto-reconnect
}

/**
 * Check if connected
 */
export function isWSConnected() {
  return ws && ws.readyState === WebSocket.OPEN;
}
