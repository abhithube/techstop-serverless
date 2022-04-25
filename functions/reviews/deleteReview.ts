import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const dynamo = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event) => {
  const id = event.pathParameters!.id!;

  await dynamo
    .delete({
      TableName: process.env.DYNAMO_TABLE_NAME!,
      Key: {
        PK: `REVIEW#${id}`,
      },
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      messsage: 'Review deleted successfully',
    }),
  };
};
