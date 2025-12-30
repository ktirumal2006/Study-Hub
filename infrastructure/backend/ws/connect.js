// infrastructure/backend/ws/connect.js
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const ddb = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(ddb);

/**
 * WebSocket $connect handler
 * Validates groupId and username from query params, stores connection
 */
exports.handler = async (event) => {
  console.log("📢 WebSocket connect event:", JSON.stringify(event));

  const { queryStringParameters, requestContext } = event;
  const connectionId = requestContext.connectionId;
  const { domainName, stage } = requestContext;

  const groupId = queryStringParameters?.groupId || "";
  const username = queryStringParameters?.username || "demo-user";

  if (!groupId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "groupId is required" }),
    };
  }

  // Store connection with TTL (expire after 24 hours)
  const ttl = Math.floor(Date.now() / 1000) + 86400; // 24 hours
  const endpoint = `https://${domainName}/${stage}`;

  try {
    await docClient.send(
      new PutCommand({
        TableName: process.env.WS_CONNECTIONS_TABLE,
        Item: {
          connectionId,
          groupId,
          username,
          connectedAt: new Date().toISOString(),
          ttl,
          endpoint,
        },
      })
    );

    console.log(`✅ Connection ${connectionId} stored for group ${groupId}, user ${username}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Connected" }),
    };
  } catch (err) {
    console.error("🔥 Error storing connection:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to connect" }),
    };
  }
};

