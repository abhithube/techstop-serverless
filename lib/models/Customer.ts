export interface CustomerModel {
  PK: string;
  CustomerId: string;
  Username: string;
  DisplayName: string | undefined;
  Email: string;
  GSI1PK: string;
  GSI1SK: string;
}

export type CustomerDto = {
  id: string;
  username: string;
  displayName: string | undefined;
  email: string;
};
