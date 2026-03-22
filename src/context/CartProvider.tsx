import { useState, type ReactNode } from 'react';
import type { MenuItem } from '../types/menu';
import type { CartItem } from './cart.types';
import { CartContext } from './CartContext';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: MenuItem, variant: string, price: number, quantity: number) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (cartItem) => cartItem.id === item.id && cartItem.selectedVariant === variant,
      );

      if (existingIndex > -1) {
        const nextCart = [...prev];
        nextCart[existingIndex].quantity += quantity;
        return nextCart;
      }

      return [
        ...prev,
        { ...item, selectedVariant: variant, finalPrice: price, quantity },
      ];
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};
