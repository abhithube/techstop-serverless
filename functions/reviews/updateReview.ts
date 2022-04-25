import { CreateReviewDto } from '@lib/models';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const dynamo = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event) => {
  const id = event.pathParameters!.id!;

  const body = JSON.parse(event.body!) as CreateReviewDto;

  const timestamp = new Date().toISOString();

  await dynamo
    .update({
      TableName: process.env.DYNAMO_TABLE_NAME!,
      Key: {
        PK: `REVIEW#${id}`,
      },
      ConditionExpression: 'attribute_exists(PK)',
      UpdateExpression:
        'set Title = :title, Content = :content, Rating = :rating, LatestModified = :lastModified, GSI1SK = :sk',
      ExpressionAttributeNames: {
        ':title': body.title,
        ':content': body.content,
        ':rating': body.rating.toString(),
        ':lastModified': timestamp,
        ':sk': `REVIEW#${timestamp}`,
      },
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      messsage: 'Review updated successfully',
    }),
  };
};
