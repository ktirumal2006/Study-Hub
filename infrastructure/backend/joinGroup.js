// infrastructure/backend/joinGroup.js

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");

// Remove the region override; the SDK will pick up us-east-1 from Lambda’s runtime
const ddb = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(ddb);

exports.handler = async (event) => {
  console.log("📢 joinGroup event:", JSON.stringify(event));

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: "",
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Invalid JSON" }),
    };
  }

  const { groupId, userId } = body;
  if (!groupId || !userId) {
    return {
      statusCode: 422,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "groupId and userId required" }),
    };
  }

  try {
    // Verify the group exists
    const { Item: group } = await docClient.send(
      new GetCommand({
        TableName: process.env.GROUPS_TABLE,
        Key: { groupId },
      })
    );
    if (!group) {
      return {
        statusCode: 404,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Group not found" }),
      };
    }

    // Upsert the user
    await docClient.send(
      new PutCommand({
        TableName: process.env.USERS_TABLE,
        Item: { userId, groupId, weeklyMinutes: 0, totalMinutes: 0 },
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
      body: JSON.stringify({ message: "Joined group", groupId }),
    };
  } catch (err) {
    console.error("🔥 joinGroup error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
