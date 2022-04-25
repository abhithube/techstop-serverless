import { CustomerDto } from './Customer';

export interface ReviewModel {
  PK: string;
  ReviewId: string;
  Title: string;
  Content: string;
  Rating: number;
  LastModified: string;
  GSI1PK: string;
  GSI1SK: string;
}

export type ReviewDto = {
  id: string;
  title: string;
  content: string;
  rating: number;
  lastModified: string;
};

export type CreateReviewDto = Omit<ReviewDto, 'id' | 'createdAt'> & {
  productId: string;
};

export type ReviewCustomer = Pick<CustomerDto, 'username' | 'displayName'>;
