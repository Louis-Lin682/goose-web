const BackgroundWatermark = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <img
        src="/image/goose-bg.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-[0.05] grayscale"
      />
    </div>
  );
};

export default BackgroundWatermark;
