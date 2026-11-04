export default function AppLoading({ message = "Getting Mapit ready..." }) {
  return (
    <div
      className="grid min-h-dvh place-items-center bg-canvas"
      role="status"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative grid size-16 place-items-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-accent/10" />

          <div className="relative grid size-12 place-items-center rounded-2xl border border-white bg-white text-accent shadow-soft">
            <span className="text-2xl font-extrabold">M</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm font-bold text-ink">{message}</p>
          <p className="mt-1 text-xs text-ink-soft">
            A little moment while everything loads
          </p>
        </div>

        <div className="flex gap-1.5">
          {[0, 1, 2].map((item) => (
            <span
              key={item}
              className="size-1.5 animate-bounce rounded-full bg-accent"
              style={{ animationDelay: `${item * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
