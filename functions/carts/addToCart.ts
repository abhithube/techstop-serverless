import { CustomerModel } from '@lib/models';
import { PostConfirmationTriggerHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { randomUUID } from 'crypto';

const dynamo = new DynamoDB.DocumentClient();

export const handler: PostConfirmationTriggerHandler = async (event) => {
  const username = event.userName;
  const displayName = event.request.userAttributes.preferred_username;
  const email = event.request.userAttributes.email;

  const id = randomUUID();

  const data: CustomerModel = {
    PK: `CUSTOMER#${id}`,
    CustomerId: id,
    Username: username,
    DisplayName: displayName,
    Email: email,
    GSI1PK: `CUSTOMER#${username}`,
    GSI1SK: 'CUSTOMER',
  };

  await dynamo
    .put({
      TableName: process.env.DYNAMO_TABLE_NAME!,
      Item: data,
    })
    .promise();
};
