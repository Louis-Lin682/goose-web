import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { MenuItem } from '../types/menu';
import type { CartItem } from './cart.types';
import { CartContext } from './CartContext';
import { useAuth } from './useAuth';

const LEGACY_CART_STORAGE_KEY = 'goose.cart.items';
const CART_STORAGE_PREFIX = 'goose.cart.items.';
const GUEST_CART_KEY = `${CART_STORAGE_PREFIX}guest`;

const parseStoredCart = (storedCart: string | null): CartItem[] => {
  if (!storedCart) {
    return [];
  }

  try {
    return JSON.parse(storedCart) as CartItem[];
  } catch {
    return [];
  }
};

const getCartStorageKey = (userId?: string | null) =>
  userId ? `${CART_STORAGE_PREFIX}${userId}` : GUEST_CART_KEY;

const getStoredCart = (storageKey: string): CartItem[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const storedCart = parseStoredCart(window.localStorage.getItem(storageKey));

  if (storedCart.length > 0 || storageKey !== GUEST_CART_KEY) {
    return storedCart;
  }

  return parseStoredCart(window.localStorage.getItem(LEGACY_CART_STORAGE_KEY));
};

const mergeCartItems = (baseCart: CartItem[], extraCart: CartItem[]) => {
  const mergedCart = [...baseCart];

  extraCart.forEach((extraItem) => {
    const existingIndex = mergedCart.findIndex(
      (cartItem) =>
        cartItem.id === extraItem.id &&
        cartItem.selectedVariant === extraItem.selectedVariant,
    );

    if (existingIndex > -1) {
      mergedCart[existingIndex] = {
        ...mergedCart[existingIndex],
        quantity: mergedCart[existingIndex].quantity + extraItem.quantity,
      };
      return;
    }

    mergedCart.push(extraItem);
  });

  return mergedCart;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthReady } = useAuth();
  const storageKey = useMemo(() => getCartStorageKey(user?.id), [user?.id]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydratedStorageKey, setHydratedStorageKey] = useState<string | null>(null);
  const previousUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !isAuthReady) {
      return;
    }

    const previousUserId = previousUserIdRef.current;
    const currentUserId = user?.id ?? null;

    if (!previousUserId && currentUserId) {
      const guestCart = getStoredCart(GUEST_CART_KEY);
      const userCartKey = getCartStorageKey(currentUserId);
      const userCart = parseStoredCart(window.localStorage.getItem(userCartKey));

      if (guestCart.length > 0) {
        const mergedCart = mergeCartItems(userCart, guestCart);
        window.localStorage.setItem(userCartKey, JSON.stringify(mergedCart));
        window.localStorage.removeItem(GUEST_CART_KEY);
        window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
      }
    }

    previousUserIdRef.current = currentUserId;
  }, [isAuthReady, user?.id]);

  useEffect(() => {
    if (typeof window === 'undefined' || !isAuthReady) {
      return;
    }

    const nextCart = getStoredCart(storageKey);
    setCart(nextCart);
    setHydratedStorageKey(storageKey);

    if (
      storageKey === GUEST_CART_KEY &&
      window.localStorage.getItem(LEGACY_CART_STORAGE_KEY) !== null
    ) {
      window.localStorage.setItem(storageKey, JSON.stringify(nextCart));
      window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    }
  }, [isAuthReady, storageKey]);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !isAuthReady ||
      hydratedStorageKey !== storageKey
    ) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(cart));

    if (storageKey === GUEST_CART_KEY) {
      window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    }
  }, [cart, hydratedStorageKey, isAuthReady, storageKey]);

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

  const updateCartItemQuantity = (
    itemId: string,
    variant: string,
    quantity: number,
  ) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === itemId && item.selectedVariant === variant
            ? { ...item, quantity }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeCartItem = (itemId: string, variant: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.id === itemId && item.selectedVariant === variant),
      ),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateCartItemQuantity,
        removeCartItem,
        clearCart,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
