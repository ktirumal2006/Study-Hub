// infrastructure/backend/endSession.js
const { DynamoDBClient: DDBClient2 } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient: DocClient2, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const ddb2 = new DDBClient2();
const docClient2 = DocClient2.from(ddb2);

exports.handler = async (event) => {
  console.log("📢 endSession event:", JSON.stringify(event));

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

  const { sessionId, userId, durationMinutes } = body;
  if (!sessionId || !userId || durationMinutes == null) {
    console.warn("⚠️ Missing fields:", { sessionId, userId, durationMinutes });
    return {
      statusCode: 422,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "sessionId, userId, and durationMinutes are required" })
    };
  }

  try {
    // Update the session
    await docClient2.send(
      new UpdateCommand({
        TableName: process.env.SESSIONS_TABLE,
        Key: { sessionId },
        UpdateExpression: "SET endTime = :e, durationMinutes = :d",
        ExpressionAttributeValues: { ":e": new Date().toISOString(), ":d": durationMinutes }
      })
    );

    // Update user aggregates
    await docClient2.send(
      new UpdateCommand({
        TableName: process.env.USERS_TABLE,
        Key: { userId },
        UpdateExpression: "ADD weeklyMinutes :d, totalMinutes :d",
        ExpressionAttributeValues: { ":d": durationMinutes }
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization"
      },
      body: JSON.stringify({ message: "Session ended", durationMinutes })
    };
  } catch (err) {
    console.error("🔥 endSession error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
};