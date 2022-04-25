import { ProductDto } from './Product';

export interface OrderModel {
  PK: string;
  OrderId: string;
  PaymentId: string;
  Status: OrderStatus;
  Amount: number;
  Items: OrderItem[];
  ShippingAddress: ShippingAddress;
  LastModified: string;
  GSI1PK: string;
  GSI1SK: string;
}

export type OrderDto = {
  id: string;
  status: string;
  amount: number;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  lastModified: string;
};

type ShippingAddress = {
  street: string;
  city: string;
  state: string;
  zip: string;
};

export type CreateOrderDto = Omit<OrderDto, 'id' | 'address' | 'lastModified'>;

type OrderItem = Pick<ProductDto, 'id' | 'name' | 'price' | 'imageUrl'>;

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}
