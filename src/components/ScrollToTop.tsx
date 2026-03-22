import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  // 取得目前的網址路徑
  const { pathname } = useLocation();

  useEffect(() => {
    // 當路徑改變時，執行捲動到頂部 (x=0, y=0)
    window.scrollTo(0, 0);
    
    // 如果想要平滑一點的捲動，可以改用：
    // window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    // 但通常建議用預設的，跳頁感會比較俐落。
  }, [pathname]);

  return null; // 這個組件不需要渲染任何東西
};

export default ScrollToTop;