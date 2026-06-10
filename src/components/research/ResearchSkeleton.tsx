export function ResearchSkeleton() {
  return (
    <div
      className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
      style={{ backgroundColor: '#FAF8F3' }}
    >
      <div className="flex">
        {/* Gold accent bar placeholder */}
        <div className="w-1 flex-shrink-0 bg-brand-gold/30" />
        <div className="p-5 flex-1">
          {/* Badge row */}
          <div className="flex gap-2 mb-3">
            <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-5 w-16 bg-brand-gold/20 rounded-full" />
          </div>
          {/* Title */}
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-1.5" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/5 mb-3" />
          {/* Citation */}
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2 mb-4" />
          {/* Summary label */}
          <div className="h-2.5 w-28 bg-brand-gold/20 rounded mb-2" />
          {/* Summary lines */}
          <div className="pl-3 border-l-2 border-brand-gold/20 space-y-1.5 mb-4">
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-11/12" />
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-4/6" />
          </div>
          {/* Action row */}
          <div className="flex gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="h-8 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg" />
            <div className="h-8 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg" />
            <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
