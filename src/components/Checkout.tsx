import { Link } from "react-router-dom";
import { useCart } from "../context/useCart";

const formatCurrency = (value: number) => `$${value}`;

export const Checkout = () => {
  const { cart, totalItems } = useCart();
  const total = cart.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);

  return (
    <main className="min-h-screen bg-white px-6 pb-24 pt-40">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-zinc-100 bg-zinc-50 p-8 md:p-12">
        <p className="text-xs font-black uppercase tracking-[0.4em] text-orange-600">Checkout</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-zinc-900 md:text-6xl">
          前往結帳
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500">
          這裡先幫你把結帳入口接起來，後面我們可以再補收件資料、付款方式與送出訂單流程。
        </p>

        <div className="mt-10 grid gap-4 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">Items</p>
            <p className="mt-2 text-2xl font-black text-zinc-900">{totalItems}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">Lines</p>
            <p className="mt-2 text-2xl font-black text-zinc-900">{cart.length}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">Total</p>
            <p className="mt-2 text-2xl font-black text-zinc-900">{formatCurrency(total)}</p>
          </div>
        </div>

        <Link
          to="/cart"
          className="mt-8 inline-flex rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
        >
          返回購物車
        </Link>
      </div>
    </main>
  );
};
