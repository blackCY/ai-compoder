export const BackgroundElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-950 opacity-60"></div>

      {/* Geometric floating elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-emerald-600/20 to-emerald-800/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "8s" }}
        ></div>
        <div
          className="absolute top-60 right-10 w-96 h-96 bg-gradient-to-br from-cyan-600/15 to-blue-800/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "12s", animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/2 w-80 h-80 bg-gradient-to-br from-teal-600/20 to-emerald-900/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "10s", animationDelay: "4s" }}
        ></div>
      </div>

      {/* Noise texture overlay for depth */}
      <div
        className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iLjAzIi8+PC9zdmc+')] opacity-40"
      ></div>

      {/* Decorative grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
    </div>
  );
};