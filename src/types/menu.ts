// src/types/menu.ts

export interface MenuItem {
  id: string;
  category: string;
  subCategory: string;
  name: string;
  // 這裡處理你的兩種價格格式
  price?: number;        // 單一價（如：滷豆腐 30）
  priceSmall?: number;   // 小份價
  priceLarge?: number;   // 大份價
}

// 這是之後購物車會用到的格式
export interface CartItem extends MenuItem {
  selectedVariant?: string; // 例如 "小份" 或 "大份"
  finalPrice: number;       // 最終選定的價格
  quantity: number;         // 數量
}