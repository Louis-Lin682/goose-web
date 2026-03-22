export interface MenuItem {
  id: string;          // 每一道菜都要有 ID
  category: string;    // 分類 (如：鵝肉品項)
  subCategory: string; // 子分類 (如：鵝肉)
  name: string;        // 菜名
  price?: number;      // 單一價 (小菜用)
  priceSmall?: number; // 小份價
  priceLarge?: number; // 大份價
}

const menuItems: MenuItem[] = [
  {id: 's16', category: '禮盒外帶', subCategory: '鵝肉禮盒', name: '鵝肉禮盒', priceSmall: 400, priceLarge: 700 },
  {id: 's17', category: '禮盒外帶', subCategory: '鵝肉禮盒', name: '鵝肉禮盒', priceSmall: 450, priceLarge: 800 },
  {id: 's18', category: '禮盒外帶', subCategory: '鵝肉禮盒', name: '鵝雜禮盒', priceSmall: 450, priceLarge: 800 },

  {id: 's12', category: '鵝肉品項', subCategory: '鵝肉', name: '白斬鵝', priceSmall: 350, priceLarge: 600 },
  {id: 's13', category: '鵝肉品項', subCategory: '鵝肉', name: '獅頭鵝', priceSmall: 350, priceLarge: 600 },
  {id: 's14', category: '鵝肉品項', subCategory: '鵝肉拼盤', name: '白斬鵝拼盤', priceSmall: 300, priceLarge: 500 },
  {id: 's15', category: '鵝肉品項', subCategory: '鵝肉拼盤', name: '獅頭鵝拼盤', priceSmall: 250, priceLarge: 450 },

  {id: 's9', category: '飯粉麵類', subCategory: '飯粉麵', name: '鵝肉炒飯', priceSmall: 120, priceLarge: 200 },
  {id: 's10', category: '飯粉麵類', subCategory: '飯粉麵', name: '鵝肉炒麵', priceSmall: 150, priceLarge: 250 },
  {id: 's11', category: '飯粉麵類', subCategory: '飯粉麵', name: '鵝肉炒粉', priceSmall: 150, priceLarge: 250 },

  {id: 's6', category: '燉湯盅類', subCategory: '燉湯', name: '鵝肉燉湯', priceSmall: 150, priceLarge: 250 },
  {id: 's7', category: '燉湯盅類', subCategory: '燉湯', name: '豬肉燉湯', priceSmall: 150, priceLarge: 250 },
  {id: 's8', category: '燉湯盅類', subCategory: '燉湯', name: '鴨肉燉湯', priceSmall: 150, priceLarge: 250 },

  {id: 's1', category: '小菜系列', subCategory: '小菜', name: '滷豆腐', price: 30 },
  {id: 's2', category: '小菜系列', subCategory: '小菜', name: '滷鴨血', price: 30 },
  {id: 's3', category: '小菜系列', subCategory: '小菜', name: '滷米血', price: 50 },
  {id: 's4', category: '小菜系列', subCategory: '小菜', name: '滷蛋', price: 15 },
  {id: 's5', category: '小菜系列', subCategory: '小菜', name: '燙時蔬', price: 50 },
];

export default menuItems;