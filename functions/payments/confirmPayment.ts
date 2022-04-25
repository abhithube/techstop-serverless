import { OrderStatus } from '@lib/models';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { Stripe } from 'stripe';

const dynamo = new DynamoDB.DocumentClient();

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2020-08-27',
});

export const handler: APIGatewayProxyHandler = async (event) => {
  const stripeEvent = JSON.parse(event.body!) as Stripe.Event;

  let status =
    stripeEvent.type === 'payment_intent.succeeded'
      ? OrderStatus.PROCESSING
      : OrderStatus.CANCELLED;

  const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent;
  const id = paymentIntent.metadata.orderId;
  const timestamp = new Date().toISOString();

  await dynamo
    .update({
      TableName: process.env.DYNAMO_TABLE_NAME!,
      Key: {
        PK: `ORDER#${id}`,
      },
      ConditionExpression: 'attribute_exists(PK)',
      UpdateExpression:
        'set Status = :status, LastModified = :lastModified, GSI1SK = :sk',
      ExpressionAttributeNames: {
        ':status': status,
        ':lastModified': timestamp,
        ':sk': `ORDER#${status}#${timestamp}`,
      },
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      clientSecret: paymentIntent.client_secret,
    }),
  };
};
