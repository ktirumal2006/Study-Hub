// infrastructure/backend/ws/util.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require("@aws-sdk/client-apigatewaymanagementapi");

const ddb = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(ddb);

/**
 * Get Management API client from event request context
 */
function getMgmtClient(event) {
  const { domainName, stage } = event.requestContext;
  const endpoint = `https://${domainName}/${stage}`;
  return new ApiGatewayManagementApiClient({ endpoint });
}

/**
 * Send reply to a single connection
 */
async function reply(managementClient, connectionId, message) {
  try {
    await managementClient.send(
      new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: JSON.stringify(message),
      })
    );
  } catch (err) {
    if (err.statusCode === 410) {
      // Connection gone, will be cleaned up on disconnect
      console.log(`Connection ${connectionId} is gone`);
    } else {
      console.error(`Error sending to ${connectionId}:`, err);
    }
  }
}

/**
 * Broadcast message to all connections in a group
 */
async function broadcastToGroup(groupId, message, excludeConnectionId = null, eventContext = null) {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: process.env.WS_CONNECTIONS_TABLE,
      })
    );

    const connections = (result.Items || []).filter(
      (conn) =>
        conn.groupId === groupId &&
        conn.connectionId !== excludeConnectionId &&
        conn.ttl > Math.floor(Date.now() / 1000) // Only active connections
    );

    // Construct endpoint from event context or use stored endpoint from connection
    let baseEndpoint = null;
    
    if (eventContext) {
      const { domainName, stage } = eventContext;
      baseEndpoint = `https://${domainName}/${stage}`;
    }

    const promises = connections.map(async (conn) => {
      // Use stored endpoint from connection (set during $connect) or construct from event context
      const endpoint = conn.endpoint || baseEndpoint;
      if (!endpoint) {
        console.error("No endpoint available for connection", conn.connectionId);
        return;
      }
      
      const client = new ApiGatewayManagementApiClient({ endpoint });
      return reply(client, conn.connectionId, message);
    });

    await Promise.allSettled(promises);
  } catch (err) {
    console.error("Error broadcasting to group:", err);
  }
}

/**
 * Sanitize text: strip control chars, escape HTML, collapse whitespace
 */
function sanitizeText(text) {
  if (typeof text !== "string") return "";
  
  return text
    .replace(/[\x00-\x1F\x7F]/g, "") // Strip control characters
    .replace(/[<>]/g, (char) => (char === "<" ? "&lt;" : "&gt;")) // Escape < and >
    .replace(/&/g, "&amp;") // Escape &
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();
}

/**
 * Extract URLs from text (simple regex, client will handle actual linking)
 */
function extractUrls(text) {
  const urlRegex = /https?:\/\/[^\s<>"]+/gi;
  return text.match(urlRegex) || [];
}

module.exports = {
  getMgmtClient,
  reply,
  broadcastToGroup,
  sanitizeText,
  extractUrls,
};

