import { MenuItem } from '../types/menu';

export interface CartItem extends MenuItem {
  selectedVariant: string;
  finalPrice: number;
  quantity: number;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem, variant: string, price: number, quantity: number) => void;
  totalItems: number;
}
