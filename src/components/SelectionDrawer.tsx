import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import type { MenuItem } from "../types/menu";

interface VariantSelection {
  variant: string;
  price: number;
  quantity: number;
}

interface SelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onConfirm: (item: MenuItem, selections: VariantSelection[]) => void;
}

interface VariantOption {
  key: string;
  label: string;
  price: number;
}

const buildVariantOptions = (item: MenuItem): VariantOption[] => {
  if (typeof item.priceSmall === "number" || typeof item.priceLarge === "number") {
    return [
      { key: "small", label: "小份", price: item.priceSmall ?? 0 },
      { key: "large", label: "大份", price: item.priceLarge ?? 0 },
    ].filter((option) => option.price > 0);
  }

  return [{ key: "single", label: "單點", price: item.price ?? 0 }];
};

const DrawerPanel = ({
  item,
  onClose,
  onConfirm,
}: {
  item: MenuItem;
  onClose: () => void;
  onConfirm: (item: MenuItem, selections: VariantSelection[]) => void;
}) => {
  const variantOptions = useMemo(() => buildVariantOptions(item), [item]);
  const [quantities, setQuantities] = useState<Record<string, number>>(
    () => Object.fromEntries(variantOptions.map((option) => [option.key, 0])),
  );

  const totalQuantity = variantOptions.reduce(
    (sum, option) => sum + (quantities[option.key] ?? 0),
    0,
  );
  const totalPrice = variantOptions.reduce(
    (sum, option) => sum + option.price * (quantities[option.key] ?? 0),
    0,
  );

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed right-0 top-0 z-101 h-full w-80 bg-white p-8 shadow-xl"
    >
      <button onClick={onClose} className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100">
        <X />
      </button>

      <h2 className="mt-4 text-2xl font-bold text-zinc-900">{item.name}</h2>

      <div className="mt-8 space-y-4">
        {variantOptions.map((option) => {
          const quantity = quantities[option.key] ?? 0;

          return (
            <div key={option.key} className="rounded-xl border border-zinc-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-zinc-900">{option.label}</p>
                  <p className="font-mono text-zinc-600">${option.price}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setQuantities((prev) => ({
                        ...prev,
                        [option.key]: Math.max(0, (prev[option.key] ?? 0) - 1),
                      }))
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 transition-colors hover:border-orange-300 hover:text-orange-600"
                    aria-label={`減少${option.label}數量`}
                  >
                    <Minus size={16} />
                  </button>

                  <span className="min-w-6 text-center text-lg font-bold text-zinc-900">
                    {quantity}
                  </span>

                  <button
                    onClick={() =>
                      setQuantities((prev) => ({
                        ...prev,
                        [option.key]: (prev[option.key] ?? 0) + 1,
                      }))
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 transition-colors hover:border-orange-300 hover:text-orange-600"
                    aria-label={`增加${option.label}數量`}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <div className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600">
          <div className="flex items-center justify-between">
            <span>總數量</span>
            <span className="font-semibold text-zinc-900">{totalQuantity}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span>總價</span>
            <span className="font-mono text-lg font-bold text-zinc-900">${totalPrice}</span>
          </div>
        </div>

        <button
          onClick={() => {
            const selections = variantOptions
              .map((option) => ({
                variant: option.key,
                price: option.price,
                quantity: quantities[option.key] ?? 0,
              }))
              .filter((selection) => selection.quantity > 0);

            if (selections.length === 0) {
              return;
            }

            onConfirm(item, selections);
          }}
          disabled={totalQuantity === 0}
          className="w-full rounded-xl bg-zinc-900 px-4 py-4 font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          確認加入購物車
        </button>
      </div>
    </motion.div>
  );
};

export const SelectionDrawer = ({ isOpen, onClose, item, onConfirm }: SelectionDrawerProps) => {
  return (
    <AnimatePresence>
      {isOpen && item && (
        <>
          <div className="fixed inset-0 z-100 bg-black/40" onClick={onClose} />
          <DrawerPanel
            key={item.id}
            item={item}
            onClose={onClose}
            onConfirm={onConfirm}
          />
        </>
      )}
    </AnimatePresence>
  );
};
