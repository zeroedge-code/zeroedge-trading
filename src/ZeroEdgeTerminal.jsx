import React, { useState, useEffect } from "react";

export default function ZeroEdgeTerminal() {
  const commissionRate = 0.3;
  const [time, setTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("closed");
  const [margin, setMargin] = useState(8000);
  const [asterPrice, setAsterPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAsterPrice();
  }, []);

  useEffect(() => {
    if (activeTab === "aster") fetchAsterPrice();
  }, [activeTab]);

  const fetchAsterPrice = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=aster-2&vs_currencies=usd");
      const data = await res.json();
      setAsterPrice(data["aster-2"]?.usd || 1.17);
    } catch (e) {
      console.error(e);
      setAsterPrice(1.17);
    } finally {
      setLoading(false);
    }
  };

  const [closedTrades] = useState([
    { date: "2025-10-31", exchange: "Asterdex", symbol: "ADAUSDT", side: "Sell", leverage: "8x", mode: "Cross", pnl: 825.72, hasCommission: true },
    { date: "2025-10-29", exchange: "Asterdex", symbol: "AAVEUSDT", side: "Buy", leverage: "10x", mode: "Cross", pnl: -294, hasCommission: true },
    { date: "2025-10-29", exchange: "Asterdex", symbol: "AAVEUSDT", side: "Buy", leverage: "10x", mode: "Cross", pnl: -342, hasCommission: true },
    { date: "2025-10-31", exchange: "Asterdex", symbol: "AAVEUSDT", side: "Sell", leverage: "8x", mode: "Cross", pnl: 2235.69, hasCommission: true },
    { date: "2025-10-24", exchange: "Asterdex", symbol: "BNBUSDT", side: "Long", leverage: "", mode: "Cross", pnl: -12.85, hasCommission: false },
    { date: "2025-11-01 14:43:46", exchange: "Kucoin", symbol: "ARBUSDT Perp", side: "Long", leverage: "10x", mode: "Cross", pnl: 366.23, hasCommission: true },
    { date: "2025-10-28 22:03:27", exchange: "Kucoin", symbol: "UNIUSDT Perp", side: "Long", leverage: "Isolated", mode: "Isolated", pnl: -1207.19, hasCommission: false },
    { date: "2025-10-28 17:09:15", exchange: "Kucoin", symbol: "XTZUSDT Perp", side: "Long", leverage: "Isolated", mode: "Isolated", pnl: -504.98, hasCommission: false },
    { date: "2025-10-27 09:29:34", exchange: "Kucoin", symbol: "XTZUSDT Perp", side: "Long", leverage: "Isolated", mode: "Isolated", pnl: -135.95, hasCommission: false },
    { date: "2025-10-27 08:42:39", exchange: "Kucoin", symbol: "COTIUSDT Perp", side: "Long", leverage: "Isolated", mode: "Isolated", pnl: -563.16, hasCommission: false },
    { date: "2025-10-26 17:18:35", exchange: "Kucoin", symbol: "XTZUSDT Perp", side: "Long", leverage: "Isolated", mode: "Isolated", pnl: -27.19, hasCommission: false },
    { date: "2025-10-25 16:46:56", exchange: "Kucoin", symbol: "BNBUSDT Perp", side: "Long", leverage: "Cross", mode: "Cross", pnl: -42.1, hasCommission: false },
    { date: "2025-10-25 16:38:41", exchange: "Kucoin", symbol: "BNBUSDT Perp", side: "Long", leverage: "Isolated", mode: "Isolated", pnl: -61.1, hasCommission: false },
    { date: "2025-11-01", exchange: "Asterdex", symbol: "BTCUSDT", side: "Buy", leverage: "15x", mode: "Cross", pnl: 36.22, hasCommission: true },
    { date: "2025-10-24", exchange: "Asterdex", symbol: "AVAXUSDT", side: "Buy", leverage: "10x", mode: "Cross", pnl: -225.61, hasCommission: false },
    { date: "2025-11-02 17:37:24", exchange: "Kucoin", symbol: "XTZUSDT Perp", side: "Short", leverage: "Isolated", mode: "Isolated", pnl: -914.94, hasCommission: false },
    { date: "2025-11-02 15:47:04", exchange: "Kucoin", symbol: "BTCUSDT Perp", side: "Long", leverage: "Cross", mode: "Cross", pnl: -86.18, hasCommission: false }
  ].sort((a, b) => new Date(a.date) - new Date(b.date)));

  const calcTotals = (trades) => {
    const totalPnl = trades.reduce((acc, t) => acc + t.pnl, 0);
    const commission = trades.reduce((acc, t) => acc + (t.hasCommission && t.pnl > 0 ? t.pnl * commissionRate : 0), 0);
    const net = totalPnl - commission;
    return { totalPnl, commission, net, tradeCount: trades.length };
  };

  const closedTotals = calcTotals(closedTrades);
  const fmt = (n) => (typeof n !== "number" || Number.isNaN(n) ? "0.00" : n.toFixed(2));
  const pnlColor = closedTotals.totalPnl >= 0 ? "#3fb950" : "#ff4d4d";
  const netColor = closedTotals.net >= 0 ? "#3fb950" : "#ff4d4d";

  const asterTokensTarget5k = 5000;
  const asterTokensTarget10k = 10000;
  const usdtCashTarget = 4400;

  const costToRebuy5k = asterPrice ? asterTokensTarget5k * asterPrice : 0;
  const costToRebuy10k = asterPrice ? asterTokensTarget10k * asterPrice : 0;
  const breakEvenTargetUSD = (asterPrice ? costToRebuy5k : 0) + usdtCashTarget;
  const neededToBreakEvenUSD = breakEvenTargetUSD - margin;

  return (
    <div style={{ background: "#010409", minHeight: "100vh", color: "#c9d1d9", fontFamily: "monospace" }}>
      <header style={{ background: "#161b22", color: "#58a6ff", padding: "12px 20px", display: "flex", justifyContent: "space-between" }}>
        <div>ZEROEDGE // TRADING TERMINAL</div>
        <div>{time.toLocaleDateString()} {time.toLocaleTimeString()}</div>
      </header>

      <section style={{ background: "#0d1117", padding: "14px 24px", borderBottom: "1px solid #21262d" }}>
        <div>Total Closed PnL: <span style={{ color: pnlColor }}>{fmt(closedTotals.totalPnl)} USDT</span></div>
        <div>Commission (30%): <span style={{ color: "#f1e05a" }}>{fmt(closedTotals.commission)} USDT</span></div>
        <div>Net Closed: <span style={{ color: netColor }}>{fmt(closedTotals.net)} USDT</span></div>
        <div>Number of Trades: <span style={{ color: "#58a6ff" }}>{closedTotals.tradeCount}</span></div>
        <div>Current Aster Price: <span style={{ color: "#58a6ff" }}>${asterPrice ? fmt(asterPrice) : loading ? "..." : "--"}</span></div>
        <div>Cost to Rebuy 5k Aster: <span style={{ color: "#58a6ff" }}>${fmt(costToRebuy5k)}</span></div>
        <div>Cost to Rebuy 10k Aster: <span style={{ color: "#58a6ff" }}>${fmt(costToRebuy10k)}</span></div>
        <div>Break-Even Target (5k Aster + 4400 USDT): <span style={{ color: "#3fb950" }}>${fmt(breakEvenTargetUSD)}</span></div>
        <div>You still need: <span style={{ color: neededToBreakEvenUSD <= 0 ? "#3fb950" : "#ff4d4d" }}>{neededToBreakEvenUSD <= 0 ? `${fmt(Math.abs(neededToBreakEvenUSD))} USDT ABOVE break-even` : `${fmt(neededToBreakEvenUSD)} USDT to break even`}</span></div>
      </section>

      <nav style={{ background: "#161b22", display: "flex", gap: "10px", padding: "10px 20px", borderBottom: "1px solid #21262d" }}>
        {["closed", "aster"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: activeTab === tab ? "#238636" : "transparent", color: activeTab === tab ? "#fff" : "#8b949e", border: "1px solid #30363d", padding: "6px 12px", borderRadius: "4px" }}>
            {tab === "closed" ? "Closed Trades" : "Aster Holdings"}
          </button>
        ))}
      </nav>

      <main style={{ padding: 20 }}>
        {activeTab === "closed" ? (
          <>
            <h3 style={{ color: "#f1e05a", fontSize: 14, marginBottom: 8 }}>CLOSED TRADES</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#0d1117" }}>
              <thead>
                <tr style={{ background: "#21262d", color: "#58a6ff", textTransform: "uppercase", fontSize: 12 }}>
                  <th>Date</th><th>Exchange</th><th>Symbol</th><th>Side</th><th>Lev</th><th>Mode</th><th style={{ textAlign: "right" }}>PnL (USDT)</th>
                </tr>
              </thead>
              <tbody>
                {closedTrades.map((t, i) => (
                  <tr key={i} style={{ backgroundColor: t.pnl >= 0 ? "#1f6feb33" : "#ff4d4d33" }}>
                    <td>{t.date}</td><td>{t.exchange}</td><td>{t.symbol}</td><td>{t.side}</td><td>{t.leverage}</td><td>{t.mode}</td>
                    <td style={{ textAlign: "right", color: t.pnl >= 0 ? "#3fb950" : "#ff7b72" }}>{fmt(t.pnl)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <>
            <h3 style={{ color: "#f1e05a", fontSize: 14 }}>ASTER HOLDINGS / BREAK-EVEN</h3>
            <div style={{ background: "#0d1117", padding: 20, borderRadius: 8, maxWidth: 500 }}>
              <label>Current Margin (USDT):</label>
              <input type="number" value={margin} onChange={(e) => setMargin(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: 8, background: "#161b22", color: "#fff", border: "1px solid #30363d", borderRadius: 4 }} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}