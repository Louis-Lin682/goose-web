import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import BackgroundWatermark from "./BackgroundWatermark";
import { FloatingBrandVideo } from "./FloatingBrandVideo";
import { Navbar } from "./Navbar";

export const StorefrontLayout = () => {
  return (
    <>
      <BackgroundWatermark />
      <div className="min-h-screen bg-white pb-36 md:pb-28">
        <Navbar />
        <Outlet />
        <Footer />
        <FloatingBrandVideo />
      </div>
    </>
  );
};
