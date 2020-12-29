import { APIGatewayProxyHandler, APIGatewayProxyEvent } from "aws-lambda";

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const { path } = event;

  if (path === "/hello") {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "world!",
      }),
    };
  } else {
    return {
      statusCode: 404,
      body: "not found",
    };
  }
};
