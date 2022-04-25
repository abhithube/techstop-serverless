import { CreateProductDto, ProductModel } from '@lib/models';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { randomUUID } from 'crypto';

const dynamo = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body!) as CreateProductDto;

  const id = randomUUID();

  const data: ProductModel = {
    PK: `PRODUCT#${id}`,
    ProductId: id,
    Name: body.name,
    Description: body.description,
    ImageUrl: body.imageUrl,
    Category: body.category,
    Price: body.price,
    Availability: 'IN_STOCK',
    AverageRating: 0,
    GSI1PK: `CATEGORY#${body.category}`,
    GSI1SK: 'IN_STOCK#0',
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
      messsage: 'Product created successfully',
    }),
  };
};
