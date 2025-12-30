// infrastructure/backend/ws/default.js
const { getMgmtClient, reply } = require("./util");

/**
 * WebSocket $default handler
 * Returns 400 with help text for unknown routes
 */
exports.handler = async (event) => {
  console.log("📢 WebSocket default event:", JSON.stringify(event));

  const connectionId = event.requestContext.connectionId;
  const mgmtClient = getMgmtClient(event);

  await reply(mgmtClient, connectionId, {
    type: "error",
    payload: {
      text: "Unknown route. Supported routes: sendMessage, typing",
    },
  });

  return { statusCode: 400 };
};

