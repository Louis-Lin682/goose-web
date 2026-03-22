// src/components/BackgroundWatermark.tsx
const BackgroundWatermark = () => {
  return (
    <div 
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    >
      <div 
        className="absolute w-full h-full opacity-[0.05] grayscale" // 這裡控制透明度，0.1~0.15 通常最不干擾閱讀
        style={{ 
          backgroundImage: `url('image/goose-bg.png')`, // 確保圖片放在 public 資料夾
          backgroundSize: 'cover', // 調整插畫大小
          backgroundPosition: 'center', // 放在右下角比較不會擋到文字
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      />
    </div>
  );
};

export default BackgroundWatermark;