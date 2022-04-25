import { ReviewDto } from './Review';

export interface ProductModel {
  PK: string;
  ProductId: string;
  Name: string;
  Description: string;
  ImageUrl: string;
  Price: number;
  Category: string;
  Availability: 'IN_STOCK' | 'OUT_OF_STOCK';
  AverageRating: number;
  GSI1PK: string;
  GSI1SK: string;
}

export type ProductDto = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  category: string;
  isAvailable: boolean;
  averageRating: number;
  reviews: ReviewDto[];
};

export type ProductSummaryDto = Omit<
  ProductDto,
  'description' | 'category' | 'isAvailable' | 'reviews'
>;

export type CreateProductDto = Omit<
  ProductDto,
  'id' | 'isAvailable' | 'averageRating'
>;
