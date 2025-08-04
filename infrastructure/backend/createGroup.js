// infrastructure/backend/createGroup.js

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

// No region override—SDK will use the function’s region
const ddb = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(ddb);

exports.handler = async (event) => {
  console.log("📢 createGroup event:", JSON.stringify(event));

  // Handle CORS preflight in the function itself
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
    console.error("❌ JSON.parse error:", err);
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const { groupId, groupName, createdBy } = body;
  if (!groupId || !groupName || !createdBy) {
    console.warn("⚠️ Missing fields:", { groupId, groupName, createdBy });
    return {
      statusCode: 422,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "groupId, groupName, and createdBy are required" }),
    };
  }

  try {
    await docClient.send(
      new PutCommand({
        TableName: process.env.GROUPS_TABLE,
        Item: {
          groupId,
          groupName,
          createdBy,
          createdAt: new Date().toISOString(),
        },
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
      body: JSON.stringify({ message: "Group created", groupId }),
    };
  } catch (err) {
    console.error("🔥 DynamoDB error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message || "Internal Server Error" }),
    };
  }
};
