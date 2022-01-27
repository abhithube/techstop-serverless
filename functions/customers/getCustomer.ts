import { APIGatewayProxyHandler } from 'aws-lambda';
import { Customer } from '../common/models';
import { connectToDb, toObjectId } from '../common/utils';

export const handler: APIGatewayProxyHandler = async (event) => {
  const id = event.pathParameters!.id!;

  const db = await connectToDb();

  const document = await db.collection('customers').findOne({
    _id: toObjectId(id),
  });

  if (!document) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'Customer not found',
      }),
    };
  }

  const customer: Customer = {
    id: document._id.toString(),
    username: document.username,
    email: document.email,
    addresses: document.addresses,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };

  return {
    statusCode: 200,
    body: JSON.stringify(customer),
  };
};
