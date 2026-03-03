export function KhataSummaryCards({ owed, owe, net }: { owed: number; owe: number; net: number }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-accent/25 bg-gradient-to-br from-[#13112a] via-[#1a1638] to-[#2a1f52] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.3),0_8px_28px_rgba(0,0,0,0.4)]">
      <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-[#7c6af7]/40 blur-[60px]" />
      <div className="pointer-events-none absolute -bottom-8 -left-6 h-40 w-40 rounded-full bg-[#9d8ff9]/25 blur-[40px]" />

      <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-white/60">
        {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
      </p>

      <p className="mb-1 text-[13px] font-medium text-white/70">Net Balance</p>

      <div className="relative z-10 mb-2 flex items-start gap-1">
        <span className="mt-[7px] font-mono text-[22px] font-normal text-white/40">₹</span>
        <span className="font-mono text-[40px] font-semibold leading-none tracking-[-0.05em] text-white">
          {Math.abs(net).toLocaleString('en-IN')}
        </span>
      </div>

      <div
        className="mb-5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1"
        style={{
          background: net >= 0 ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
          borderColor: net >= 0 ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)',
        }}
      >
        <span
          className="font-mono text-[11px] font-semibold"
          style={{ color: net >= 0 ? '#34d399' : '#f87171' }}
        >
          {net >= 0 ? '↑ You are owed more' : '↓ You owe more'}
        </span>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-2">
        <div className="rounded-[10px] border border-white/[0.06] bg-white/[0.04] p-2.5">
          <p className="mb-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.07em] text-white/60">
            You Lent
          </p>
          <p className="font-mono text-[15px] font-semibold tracking-[-0.5px] text-[#34d399]">
            ₹{owed.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="rounded-[10px] border border-white/[0.06] bg-white/[0.04] p-2.5">
          <p className="mb-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.07em] text-white/60">
            You Borrowed
          </p>
          <p className="font-mono text-[15px] font-semibold tracking-[-0.5px] text-[#f87171]">
            ₹{owe.toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    </div>
  );
}
