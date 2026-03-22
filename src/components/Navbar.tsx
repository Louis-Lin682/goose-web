import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Menu as MenuIcon, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "../context/useCart";

type AuthMode = "login" | "register";

type LoginFormState = {
  identifier: string;
  password: string;
  remember: boolean;
};

type RegisterFormState = {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const navLinks = [
  { to: "/origin", label: "品牌故事" },
  { to: "/fullMenu", label: "產品列表" },
  { to: "/store", label: "門市資訊" },
];

const shippingRows = [
  { amount: "1000元以下", shipping: "200元", codFee: "30元" },
  { amount: "1001～1800元", shipping: "230元", codFee: "30元" },
  { amount: "1801～6000元", shipping: "290元", codFee: "60元" },
  { amount: "6001～10000元", shipping: "0元", codFee: "90元" },
  { amount: "10001元以上", shipping: "0元", codFee: "0元" },
];

const inputClassName =
  "h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-orange-400";

const initialLoginForm = (): LoginFormState => ({
  identifier: "",
  password: "",
  remember: false,
});

const initialRegisterForm = (): RegisterFormState => ({
  name: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const RequiredLabel = ({ children }: { children: string }) => (
  <label className="mb-2 block text-sm font-semibold text-zinc-900">
    {children}
    <span className="ml-1 text-orange-600">*</span>
  </label>
);

const LineAuthButton = ({ mode }: { mode: AuthMode }) => (
  <div className="mt-6 space-y-3">
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-zinc-200" />
      <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-400">
        或使用 LINE
      </span>
      <div className="h-px flex-1 bg-zinc-200" />
    </div>

    <button
      type="button"
      className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-[#06C755] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#05b24b]"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[10px] font-black tracking-[0.16em] text-[#06C755]">
        LINE
      </span>
      <span>{mode === "login" ? "LINE 快速登入" : "LINE 快速註冊 / 登入"}</span>
    </button>

    <p className="text-center text-xs leading-5 text-zinc-500">
      目前先保留入口，之後可直接串接 LINE Login。
    </p>
  </div>
);

const NoticeModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[110] bg-black/50 px-4 py-8" onClick={onClose}>
    <div className="mx-auto flex h-full max-w-4xl items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.22 }}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[85vh] w-full overflow-hidden rounded-[2rem] bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-orange-600">
              Notice
            </p>
            <h2 className="mt-2 text-3xl font-black text-zinc-900">訂購須知</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="關閉訂購須知"
          >
            <X />
          </button>
        </div>

        <div className="max-h-[calc(85vh-96px)] space-y-8 overflow-y-auto px-6 py-6 text-sm leading-7 text-zinc-600">
          <section>
            <p>
              請至
              <Link
                to="/fullMenu"
                onClick={onClose}
                className="mx-1 font-semibold text-orange-600 underline underline-offset-4"
              >
                產品列表
              </Link>
              挑選要購買之商品。
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-zinc-900">運費計算方式</h3>
            <p className="mt-2">統一速達宅急便費用計算方式</p>

            <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200">
              <table className="w-full border-collapse text-center">
                <thead className="bg-zinc-50 text-xs uppercase tracking-[0.2em] text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">訂購金額</th>
                    <th className="px-4 py-3">運費</th>
                    <th className="py-3">貨到付款手續費</th>
                  </tr>
                </thead>
                <tbody>
                  {shippingRows.map((row) => (
                    <tr key={row.amount} className="border-t border-zinc-100">
                      <td className="px-4 py-3">{row.amount}</td>
                      <td className="px-4 py-3">{row.shipping}</td>
                      <td className="py-3">{row.codFee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-zinc-500">註：網路訂購滿6000元以上，免付運費。</p>
          </section>

          <section className="space-y-3">
            <p>
              1、網路訂購須7天後才出貨，若要更改時間請在備註說明。實際到貨日須視宅急便當區配送狀況而定，無法指定幾點送達。如遇到連續假日或過年期間，請提早安排收貨日期，國定連假前一週及過年前一星期無法指定時間到達，敬請見諒。
            </p>
            <p>2、離島地區不適用以上運費計算方式，請來電詢問。</p>
            <p>
              3、可選取黑貓店取，讓您成為時間的主人。到站後黑貓宅急便會通知前往站所取件，不用在家等待。
            </p>
            <a
              href="http://103.234.81.15/TCAT/CAT0001/CAT0001MM1"
              target="_blank"
              rel="noreferrer"
              className="inline-flex font-semibold text-orange-600 underline underline-offset-4"
            >
              查詢黑貓寄取站所地址
            </a>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-bold text-zinc-900">聯絡資訊</h3>
            <p>門市地址：台中市南屯區永春東七路746-1號</p>
            <p>訂購電話：04-2380-0255</p>
            <p>付款方式：線上付款、貨到付款。</p>
            <p>
              聯絡我們：
              <a
                href="mailto:christian7267@yahoo.com.tw"
                className="ml-1 font-semibold text-orange-600 underline underline-offset-4"
              >
                123456789@yahoo.com.tw
              </a>
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  </div>
);

const AuthModal = ({
  mode,
  onModeChange,
  onClose,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onClose: () => void;
}) => {
  const [loginForm, setLoginForm] = useState<LoginFormState>(initialLoginForm);
  const [registerForm, setRegisterForm] = useState<RegisterFormState>(initialRegisterForm);

  const resetForms = () => {
    setLoginForm(initialLoginForm());
    setRegisterForm(initialRegisterForm());
  };

  const handleModeSwitch = (nextMode: AuthMode) => {
    if (nextMode === mode) return;
    resetForms();
    onModeChange(nextMode);
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[115] bg-black/55 px-4 py-6" onClick={handleClose}>
      <div className="mx-auto flex h-full max-w-lg items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.22 }}
          onClick={(event) => event.stopPropagation()}
          className="flex h-[min(88vh,44rem)] w-full flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl"
        >
          <div className="shrink-0 border-b border-zinc-100 px-5 py-5 md:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.35em] text-orange-600">
                  Account
                </p>
                <h2 className="mt-2 text-2xl font-black text-zinc-900 md:text-3xl">
                  {mode === "login" ? "會員登入" : "快速註冊"}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                aria-label="關閉登入註冊視窗"
              >
                <X />
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col px-5 py-5 md:px-6">
            <div className="relative mb-6 shrink-0 grid grid-cols-2 rounded-2xl bg-zinc-100 p-1">
              <motion.span
                layoutId="auth-mode-pill"
                transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.7 }}
                className={`absolute bottom-1 top-1 z-0 w-[calc(50%-0.25rem)] rounded-2xl bg-white shadow-sm ${
                  mode === "login" ? "left-1" : "left-[calc(50%+0.25rem)]"
                }`}
              />
              <button
                type="button"
                onClick={() => handleModeSwitch("login")}
                className={`relative z-10 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                  mode === "login" ? "text-zinc-900" : "text-zinc-500"
                }`}
              >
                登入
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch("register")}
                className={`relative z-10 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                  mode === "register" ? "text-zinc-900" : "text-zinc-500"
                }`}
              >
                註冊
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {mode === "login" ? (
                <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
                  <div>
                    <RequiredLabel>手機號碼或 Email</RequiredLabel>
                    <input
                      type="text"
                      value={loginForm.identifier}
                      onChange={(event) =>
                        setLoginForm((prev) => ({ ...prev, identifier: event.target.value }))
                      }
                      required
                      placeholder="優先輸入手機號碼，例如 09xxxxxxxx"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <RequiredLabel>密碼</RequiredLabel>
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(event) =>
                        setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                      }
                      required
                      placeholder="請輸入密碼"
                      className={inputClassName}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-zinc-500">
                      <input
                        type="checkbox"
                        checked={loginForm.remember}
                        onChange={(event) =>
                          setLoginForm((prev) => ({ ...prev, remember: event.target.checked }))
                        }
                        className="h-4 w-4 rounded border-zinc-300"
                      />
                      記住我
                    </label>
                    <button type="button" className="font-semibold text-orange-600">
                      忘記密碼？
                    </button>
                  </div>

                  <Button className="mt-2 h-12 w-full rounded-2xl bg-zinc-900 text-sm text-white hover:bg-zinc-800">
                    登入
                  </Button>

                  <LineAuthButton mode={mode} />
                </form>
              ) : (
                <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
                  <div>
                    <RequiredLabel>手機號碼</RequiredLabel>
                    <input
                      type="tel"
                      value={registerForm.phone}
                      onChange={(event) =>
                        setRegisterForm((prev) => ({ ...prev, phone: event.target.value }))
                      }
                      required
                      placeholder="09xxxxxxxx"
                      className={inputClassName}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <RequiredLabel>姓名</RequiredLabel>
                      <input
                        type="text"
                        value={registerForm.name}
                        onChange={(event) =>
                          setRegisterForm((prev) => ({ ...prev, name: event.target.value }))
                        }
                        required
                        placeholder="請輸入收件人姓名"
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <RequiredLabel>Email</RequiredLabel>
                      <input
                        type="email"
                        value={registerForm.email}
                        onChange={(event) =>
                          setRegisterForm((prev) => ({ ...prev, email: event.target.value }))
                        }
                        required
                        placeholder="you@example.com"
                        className={inputClassName}
                      />
                    </div>
                  </div>

                  <div>
                    <RequiredLabel>密碼</RequiredLabel>
                    <input
                      type="password"
                      value={registerForm.password}
                      onChange={(event) =>
                        setRegisterForm((prev) => ({ ...prev, password: event.target.value }))
                      }
                      required
                      placeholder="至少 8 碼"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <RequiredLabel>確認密碼</RequiredLabel>
                    <input
                      type="password"
                      value={registerForm.confirmPassword}
                      onChange={(event) =>
                        setRegisterForm((prev) => ({
                          ...prev,
                          confirmPassword: event.target.value,
                        }))
                      }
                      required
                      placeholder="請再次輸入密碼"
                      className={inputClassName}
                    />
                  </div>

                  <p className="text-xs leading-6 text-zinc-500">
                    建議以手機號碼作為主要登入依據，Email 保留作為通知與找回密碼使用；姓名則用於會員與訂單資料。
                  </p>

                  <Button className="mt-2 h-12 w-full rounded-2xl bg-zinc-900 text-sm text-white hover:bg-zinc-800">
                    建立帳號
                  </Button>

                  <LineAuthButton mode={mode} />
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const isOverlayOpen = isNoticeOpen || isMobileMenuOpen || isAuthOpen;

    if (!isOverlayOpen) {
      document.body.style.overflow = "";
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNoticeOpen(false);
        setIsMobileMenuOpen(false);
        setIsAuthOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAuthOpen, isMobileMenuOpen, isNoticeOpen]);

  const openAuth = (mode: AuthMode) => {
    setIsMobileMenuOpen(false);
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const closeAll = () => {
    setIsMobileMenuOpen(false);
    setIsNoticeOpen(false);
    setIsAuthOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed left-0 right-0 top-0 z-50 overflow-visible transition-all duration-300 before:pointer-events-none before:absolute before:inset-x-0 before:top-[-14px] before:h-12 before:bg-gradient-to-b before:from-white/38 before:via-white/14 before:to-transparent before:blur-2xl after:pointer-events-none after:absolute after:inset-x-0 after:bottom-[-24px] after:h-12 after:bg-gradient-to-b after:from-white/24 after:via-white/8 after:to-transparent after:blur-2xl ${
          isScrolled
            ? "bg-white/34 py-4 shadow-[0_10px_34px_rgba(0,0,0,0.035)] backdrop-blur-[24px] backdrop-saturate-[1.8]"
            : "bg-white/48 py-6 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-[20px] backdrop-saturate-[1.6]"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center" onClick={closeAll}>
            <div className="relative mr-2 h-12 w-12 overflow-hidden rounded-full border-2 border-zinc-100 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=200&auto=format&fit=crop"
                alt="Goose Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="cursor-pointer text-2xl font-black tracking-tighter">
              鵝作社<span className="text-orange-500">.</span>
            </div>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-bold uppercase tracking-widest md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="transition-colors hover:text-orange-500"
              >
                {link.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={() => setIsNoticeOpen(true)}
              className="transition-colors hover:text-orange-500"
            >
              訂購須知
            </button>

            <div className="ml-2 flex items-center gap-6 border-l border-zinc-200 pl-6">
              <Link to="/cart" className="group relative p-2">
                <ShoppingCart className="h-5 w-5 transition-colors group-hover:text-orange-600" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              </Link>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="text-xs hover:text-orange-600"
                  onClick={() => openAuth("login")}
                >
                  登入
                </Button>
                <Button
                  className="rounded-none bg-black px-6 text-xs text-white transition-transform hover:bg-zinc-800 active:scale-95"
                  onClick={() => openAuth("register")}
                >
                  註冊
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <Link to="/cart" className="group relative p-2">
              <ShoppingCart className="h-5 w-5 transition-colors group-hover:text-orange-600" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-full border border-zinc-200 p-2 text-zinc-900 transition-colors hover:border-orange-300 hover:text-orange-600"
              aria-label="打開選單"
            >
              <MenuIcon size={20} />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[105] bg-black/40 md:hidden" onClick={closeAll}>
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              onClick={(event) => event.stopPropagation()}
              className="ml-auto flex h-full w-[86vw] max-w-sm flex-col bg-white px-6 pb-8 pt-6 shadow-xl"
            >
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-orange-600">
                    Menu
                  </p>
                  <p className="mt-2 text-2xl font-black text-zinc-900">導覽選單</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                  aria-label="關閉選單"
                >
                  <X />
                </button>
              </div>

              <div className="space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-2xl border border-zinc-200 px-4 py-4 text-base font-semibold text-zinc-900 transition-colors hover:border-orange-300 hover:text-orange-600"
                  >
                    {link.label}
                  </Link>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsNoticeOpen(true);
                  }}
                  className="block w-full rounded-2xl border border-zinc-200 px-4 py-4 text-left text-base font-semibold text-zinc-900 transition-colors hover:border-orange-300 hover:text-orange-600"
                >
                  訂購須知
                </button>
              </div>

              <div className="mt-auto space-y-3 pt-8">
                <Button
                  variant="ghost"
                  className="w-full rounded-full border-gray-200 py-6 justify-center text-sm hover:text-orange-600"
                  onClick={() => openAuth("login")}
                >
                  登入
                </Button>
                <Button
                  className="w-full rounded-full bg-zinc-900 py-6 text-sm text-white hover:bg-zinc-800"
                  onClick={() => openAuth("register")}
                >
                  註冊
                </Button>
              </div>
            </motion.aside>
          </div>
        )}

        {isNoticeOpen && <NoticeModal onClose={() => setIsNoticeOpen(false)} />}
        {isAuthOpen && (
          <AuthModal
            mode={authMode}
            onModeChange={setAuthMode}
            onClose={() => setIsAuthOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
