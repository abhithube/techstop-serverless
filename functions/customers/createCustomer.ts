import { PostConfirmationTriggerHandler } from 'aws-lambda';
import { CreateCustomerInput } from '../common/models';
import { connectToDb } from '../common/utils';

export const handler: PostConfirmationTriggerHandler = async (event) => {
  const db = await connectToDb();

  const timestamp = new Date().toISOString();

  const customer: CreateCustomerInput = {
    username: event.userName,
    name: event.request.userAttributes.preferred_username,
    email: event.request.userAttributes.email,
    addresses: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await db.collection('customers').insertOne(customer);
};
