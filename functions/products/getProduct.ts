import { ProductDto, ProductModel, ReviewDto, ReviewModel } from '@lib/models';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const dynamo = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event) => {
  const id = event.pathParameters!.id!;

  const result = await dynamo
    .query({
      TableName: process.env.DYNAMO_TABLE_NAME!,
      KeyConditionExpression: `PK = :pk`,
      ExpressionAttributeValues: {
        ':pk': `PRODUCT#${id}`,
      },
    })
    .promise();

  const items = result.Items;

  if (!items || items.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'Product not found',
      }),
    };
  }

  const [
    {
      ProductId,
      Name,
      Description,
      ImageUrl,
      Category,
      Price,
      Availability,
      AverageRating,
    },
    ...reviewModels
  ] = items as [ProductModel, ...ReviewModel[]];

  const reviews: ReviewDto[] = reviewModels.map(
    ({ ReviewId, Title, Content, Rating, LastModified }) => ({
      id: ReviewId,
      title: Title,
      content: Content,
      rating: Rating,
      lastModified: LastModified,
    })
  );

  const product: ProductDto = {
    id: ProductId,
    name: Name,
    description: Description,
    imageUrl: ImageUrl,
    category: Category,
    price: Price,
    isAvailable: Availability === 'IN_STOCK',
    averageRating: AverageRating,
    reviews,
  };

  return {
    statusCode: 200,
    body: JSON.stringify(product),
  };
};
