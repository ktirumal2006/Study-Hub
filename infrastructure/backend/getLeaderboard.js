// infrastructure/backend/getLeaderboard.js
const { DynamoDBClient: DDBClient3 } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient: DocClient3, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const ddb3 = new DDBClient3();
const docClient3 = DocClient3.from(ddb3);

exports.handler = async (event) => {
  console.log("📢 getLeaderboard event:", JSON.stringify(event));

  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
      },
      body: ""
    };
  }

  const qs = event.queryStringParameters || {};
  const groupId = qs.groupId;
  const limit = parseInt(qs.limit) || 10;

  if (!groupId) {
    return {
      statusCode: 422,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "groupId parameter is required" })
    };
  }

  try {
    const data = await docClient3.send(
      new ScanCommand({
        TableName: process.env.USERS_TABLE,
        FilterExpression: "groupId = :g",
        ExpressionAttributeValues: { ":g": groupId }
      })
    );

    const sorted = (data.Items || [])
      .sort((a, b) => b.weeklyMinutes - a.weeklyMinutes)
      .slice(0, limit);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization"
      },
      body: JSON.stringify({ leaderboard: sorted })
    };
  } catch (err) {
    console.error("🔥 getLeaderboard error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
};