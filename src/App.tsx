import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { AboutPreview } from "./components/AboutPreview";
import { GooseDetail } from "./components/GooseDetail";
import { StoreInfo } from "./components/StoreInfo";
import ScrollToTop from "./components/ScrollToTop";
import { Menu } from "./components/Menu";
import { FullMenu } from "./components/FullMenu";
import { Cart } from "./components/Cart";
import { Checkout } from "./components/Checkout";
import { Footer } from "./components/Footer";
import BackgroundWatermark from "./components/BackgroundWatermark";
import { RouteLoadingOverlay } from "./components/RouteLoadingOverlay";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <RouteLoadingOverlay />
      {/* 全站浮水印背景 */}
      <BackgroundWatermark />
      <div className="min-h-screen bg-white">
        <Navbar />
        <Routes>
        {/* 首頁元件 */}
        <Route path="/" element={
          <main>
            <Hero />
            <AboutPreview /> {/* 簡短版 About */}
            <Menu />
          </main>
        } />

        {/* 深度詳情頁：關於獅頭鵝的起源 */}
        <Route path="/origin" element={<GooseDetail />} />
        <Route path="/store" element={<StoreInfo />} />
        <Route path="/fullMenu" element={<FullMenu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
