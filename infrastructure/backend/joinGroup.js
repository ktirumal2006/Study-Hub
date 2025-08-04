// infrastructure/backend/joinGroup.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const { GROUPS_TABLE, USERS_TABLE } = process.env;

export const handler = async (event) => {
  try {
    const { groupId, userId } = JSON.parse(event.body);

    // 1) Verify the group exists
    const { Item: group } = await ddb.send(
      new GetCommand({
        TableName: GROUPS_TABLE,
        Key: { groupId },
      })
    );

    if (!group) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Group not found" }),
      };
    }

    // 2) Upsert the user to that group
    await ddb.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { userId },
        UpdateExpression: `
          SET groupId = :g, totalMinutes = if_not_exists(totalMinutes, :zero),
              weeklyMinutes = if_not_exists(weeklyMinutes, :zero)
        `,
        ExpressionAttributeValues: {
          ":g": groupId,
          ":zero": 0,
        },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Joined group", groupId }),
    };
  } catch (err) {
    console.error("joinGroup error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
