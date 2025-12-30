// infrastructure/backend/ws/sendMessage.js
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { broadcastToGroup, sanitizeText } = require("./util");

const ddb = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(ddb);

const MAX_MESSAGE_LENGTH = 1000;

/**
 * WebSocket sendMessage handler
 * Validates, persists, and broadcasts message to group
 */
exports.handler = async (event) => {
  console.log("📢 WebSocket sendMessage event:", JSON.stringify(event));

  const connectionId = event.requestContext.connectionId;

  // Parse message body
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  // Support both old format {"text":"..."} and new format {"action":"sendMessage","text":"..."}
  const text = body.action === "sendMessage" ? body.text : body.text;

  if (!text || typeof text !== "string") {
    return { statusCode: 400, body: JSON.stringify({ error: "text is required" }) };
  }

  if (text.length > MAX_MESSAGE_LENGTH) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Message too long (max ${MAX_MESSAGE_LENGTH} chars)` }),
    };
  }

  // Get connection info
  const { GetCommand } = require("@aws-sdk/lib-dynamodb");
  const connResult = await docClient.send(
    new GetCommand({
      TableName: process.env.WS_CONNECTIONS_TABLE,
      Key: { connectionId },
    })
  );

  const connection = connResult.Item;
  if (!connection) {
    return { statusCode: 401, body: JSON.stringify({ error: "Not connected" }) };
  }

  const { groupId, username } = connection;
  const sanitized = sanitizeText(text);

  // Persist message
  const timestamp = Date.now();
  try {
    await docClient.send(
      new PutCommand({
        TableName: process.env.WS_MESSAGES_TABLE,
        Item: {
          groupId,
          timestamp,
          username,
          text: sanitized,
          createdAt: new Date().toISOString(),
        },
      })
    );
  } catch (err) {
    console.error("Error persisting message:", err);
    // Continue anyway to broadcast
  }

  // Broadcast to group
  const message = {
    type: "message",
    payload: {
      groupId,
      username,
      text: sanitized,
      timestamp,
    },
  };

  await broadcastToGroup(groupId, message, connectionId, event.requestContext);

  return { statusCode: 200 };
};

