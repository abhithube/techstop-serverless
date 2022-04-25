import { CustomerDto, CustomerModel } from '@lib/models';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

console.log('Loading function');

const dynamo = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event) => {
  const username = event.pathParameters!.username!;

  const result = await dynamo
    .query({
      TableName: process.env.DYNAMO_TABLE_NAME!,
      IndexName: 'GSI1',
      KeyConditionExpression: `GSI1PK = :pk AND GSI1SK = :sk`,
      ExpressionAttributeValues: {
        ':pk': `CUSTOMER#${username}`,
        ':sk': 'CUSTOMER',
      },
    })
    .promise();

  if (!result.Items || result.Items.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'Customer not found',
      }),
    };
  }

  const { CustomerId, Username, DisplayName, Email } = result
    .Items[0] as CustomerModel;

  const customer: CustomerDto = {
    id: CustomerId,
    username: Username,
    displayName: DisplayName,
    email: Email,
  };

  return {
    statusCode: 200,
    body: JSON.stringify(customer),
  };
};
