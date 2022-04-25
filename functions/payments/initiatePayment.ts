import { CreateOrderDto, OrderModel, OrderStatus } from '@lib/models';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { randomUUID } from 'crypto';
import { Stripe } from 'stripe';

const dynamo = new DynamoDB.DocumentClient();

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2020-08-27',
});

export const handler: APIGatewayProxyHandler = async (event) => {
  const username = event.requestContext.authorizer!.jwt.claims
    .username as string;

  const body = JSON.parse(event.body!) as CreateOrderDto;

  const id = randomUUID();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: body.amount,
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      orderId: id,
    },
  });

  const timestamp = new Date().toISOString();
  const status = OrderStatus.PENDING;

  const data: OrderModel = {
    PK: `ORDER#${id}`,
    OrderId: id,
    PaymentId: paymentIntent.client_secret!,
    Status: status,
    Amount: body.amount,
    Items: body.items,
    ShippingAddress: body.shippingAddress,
    LastModified: timestamp,
    GSI1PK: `CUSTOMER#${username}`,
    GSI1SK: `ORDER#${status}#${timestamp}`,
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
      clientSecret: paymentIntent.client_secret,
    }),
  };
};
