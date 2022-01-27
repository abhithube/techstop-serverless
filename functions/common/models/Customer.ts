import { ObjectId } from 'mongodb';

export interface CustomerModel {
  _id: ObjectId;
  username: string;
  name?: string;
  email: string;
  addresses: Address[];
  createdAt: String;
  updatedAt: String;
}

export type Customer = Omit<CustomerModel, '_id'> & {
  id: string;
};

export type CreateCustomerInput = Omit<Customer, 'id'>;

type Address = {
  street: string;
  city: string;
  state: string;
  zip: string;
};
