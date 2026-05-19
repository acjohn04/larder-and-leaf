export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 w-full h-full">
      <span className="material-symbols-outlined animate-spin text-4xl text-primary">
        progress_activity
      </span>
      <h2 className="text-xl font-display font-medium text-on-surface">Loading...</h2>
    </div>
  );
}
