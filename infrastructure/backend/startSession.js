// infrastructure/backend/startSession.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

// Let SDK use Lambda's configured region
const ddb = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(ddb);

exports.handler = async (event) => {
  console.log("📢 startSession event:", JSON.stringify(event));

  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
      },
      body: ""
    };
  }

  // Parse body
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (err) {
    console.error("❌ JSON.parse error:", err);
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Invalid JSON body" })
    };
  }

  const { sessionId, userId, groupId } = body;
  if (!sessionId || !userId || !groupId) {
    console.warn("⚠️ Missing fields:", { sessionId, userId, groupId });
    return {
      statusCode: 422,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "sessionId, userId, and groupId are required" })
    };
  }

  try {
    await docClient.send(
      new PutCommand({
        TableName: process.env.SESSIONS_TABLE,
        Item: { sessionId, userId, groupId, startTime: new Date().toISOString() }
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization"
      },
      body: JSON.stringify({ message: "Session started", sessionId })
    };
  } catch (err) {
    console.error("🔥 startSession error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
};