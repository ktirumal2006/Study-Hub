// infrastructure/backend/ws/disconnect.js
const { DynamoDBDocumentClient, DeleteCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { broadcastToGroup } = require("./util");

const ddb = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(ddb);

/**
 * WebSocket $disconnect handler
 * Removes connection and notifies group
 */
exports.handler = async (event) => {
  console.log("📢 WebSocket disconnect event:", JSON.stringify(event));

  const connectionId = event.requestContext.connectionId;

  try {
    // Get connection info before deleting
    const result = await docClient.send(
      new GetCommand({
        TableName: process.env.WS_CONNECTIONS_TABLE,
        Key: { connectionId },
      })
    );

    const connection = result.Item;

    // Delete connection
    await docClient.send(
      new DeleteCommand({
        TableName: process.env.WS_CONNECTIONS_TABLE,
        Key: { connectionId },
      })
    );

    // Notify group if we had connection info
    if (connection?.groupId) {
      await broadcastToGroup(
        connection.groupId,
        {
          type: "system",
          payload: {
            text: `${connection.username} left the chat`,
          },
        },
        connectionId,
        event.requestContext
      );
    }

    console.log(`✅ Connection ${connectionId} removed`);

    return { statusCode: 200 };
  } catch (err) {
    console.error("🔥 Error handling disconnect:", err);
    return { statusCode: 200 }; // Always return 200 for disconnect
  }
};

