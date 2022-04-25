import { ProductModel, ProductSummaryDto } from '@lib/models';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const dynamo = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event) => {
  const category = event.queryStringParameters!.category!;

  const result = await dynamo
    .query({
      TableName: process.env.DYNAMO_TABLE_NAME!,
      IndexName: 'GSI1',
      KeyConditionExpression: `GSI1PK = :pk`,
      ExpressionAttributeValues: {
        ':pk': `CATEGORY#${category}`,
      },
    })
    .promise();

  const items = result.Items;

  if (!items) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Bad request',
      }),
    };
  }
  const products: ProductSummaryDto[] = (items! as ProductModel[]).map(
    ({ ProductId, Name, ImageUrl, Price, AverageRating }) => ({
      id: ProductId,
      name: Name,
      imageUrl: ImageUrl,
      price: Price,
      averageRating: AverageRating,
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify(products),
  };
};
