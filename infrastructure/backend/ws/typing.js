// infrastructure/backend/ws/typing.js
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { broadcastToGroup } = require("./util");

const ddb = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(ddb);

/**
 * WebSocket typing handler
 * Broadcasts typing indicator to other users in group
 */
exports.handler = async (event) => {
  console.log("📢 WebSocket typing event:", JSON.stringify(event));

  const connectionId = event.requestContext.connectionId;

  // Parse message body
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  // Support both formats: {"action":"typing","isTyping":true} and {"isTyping":true}
  const isTyping = body.action === "typing" ? body.isTyping : body.isTyping;

  if (typeof isTyping !== "boolean") {
    return { statusCode: 400, body: JSON.stringify({ error: "isTyping must be boolean" }) };
  }

  // Get connection info
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

  // Broadcast typing indicator to others in group
  await broadcastToGroup(
    groupId,
    {
      type: "typing",
      payload: {
        username,
        isTyping,
      },
    },
    connectionId, // Exclude sender
    event.requestContext
  );

  return { statusCode: 200 };
};

