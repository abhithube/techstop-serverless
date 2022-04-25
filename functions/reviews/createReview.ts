import { CreateReviewDto, ReviewModel } from '@lib/models';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { randomUUID } from 'crypto';

const dynamo = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body!) as CreateReviewDto;

  const id = randomUUID();
  const timestamp = new Date().toISOString();
  const data: ReviewModel = {
    PK: `REVIEW#${id}`,
    ReviewId: id,
    Title: body.title,
    Content: body.content,
    Rating: body.rating,
    LastModified: timestamp,
    GSI1PK: `PRODUCT#${body.productId}`,
    GSI1SK: `REVIEW#${timestamp}`,
  };

  await dynamo
    .put({
      TableName: process.env.DYNAMO_TABLE_NAME!,
      Item: data,
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      messsage: 'Review created successfully',
    }),
  };
};
