import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// ZeroEdge Trading Terminal – Modern Matrix Dashboard (FIXED)
// - Fixed template literal typo in style border (was breaking build)
// - Switched ASTER price fetch to "aster-2" (more reliable) with fallback
// - Added lightweight runtime assertions as test cases for calcTotals()

export default function ZeroEdgeTerminal() {
  const commissionRate = 0.3;
  const [time, setTime] = useState(new Date());
  const [asterPrice, setAsterPrice] = useState(0);
  const [currentMargin, setCurrentMargin] = useState(8000);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Live ASTER price with fallback
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=aster-2&vs_currencies=usd"
        );
        const data = await res.json();
        if (data["aster-2"]?.usd) setAsterPrice(data["aster-2"].usd);
        else setAsterPrice(0); // fallback to 0 if missing
      } catch (e) {
        console.error("Price fetch error:", e);
        setAsterPrice(0);
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  // Closed trades (sorted oldest -> newest)
  const [closedTrades] = useState(
    [
      { date: "2025-10-24", exchange: "Asterdex", symbol: "BNBUSDT", side: "Long", leverage: "", mode: "Cross", pnl: -12.85, hasCommission: false },
      { date: "2025-10-24", exchange: "Asterdex", symbol: "AVAXUSDT", side: "Buy", leverage: "10x", mode: "Cross", pnl: -225.61, hasCommission: false },
      { date: "2025-10-25 16:38:41", exchange: "Kucoin", symbol: "BNBUSDT Perp", side: "Long", leverage: "Isolated", mode: "Isolated", pnl: -61.1, hasCommission: false },
      { date: "2025-10-25 16:46:56", exchange: "Kucoin", symbol: "BNBUSDT Perp", side: "Long", leverage: "Cross", mode: "Cross", pnl: -42.1, hasCommission: false },
      { date: "2025-10-26 17:18:35", exchange: "Kucoin", symbol: "XTZUSDT Perp", side: "Long", leverage: "Isolated", mode: "Isolated", pnl: -27.19, hasCommission: false },
      { date: "2025-10-27 08:42:39", exchange: "Kucoin", symbol: "COTIUSDT Perp", side: "Long", leverage: "Isolated", mode: "Isolated", pnl: -563.16, hasCommission: false },
      { date: "2025-10-27 09:29:34", exchange: "Kucoin", symbol: "XTZUSDT Perp", side: "Long", leverage: "Isolated", mode: "Isolated", pnl: -135.95, hasCommission: false },
      { date: "2025-10-28 17:09:15", exchange: "Kucoin", symbol: "XTZUSDT Perp", side: "Long", leverage: "Isolated", mode: "Isolated", pnl: -504.98, hasCommission: false },
      { date: "2025-10-28 22:03:27", exchange: "Kucoin", symbol: "UNIUSDT Perp", side: "Long", leverage: "Isolated", mode: "Isolated", pnl: -1207.19, hasCommission: false },
      { date: "2025-10-29", exchange: "Asterdex", symbol: "AAVEUSDT", side: "Buy", leverage: "10x", mode: "Cross", pnl: -294, hasCommission: true },
      { date: "2025-10-29", exchange: "Asterdex", symbol: "AAVEUSDT", side: "Buy", leverage: "10x", mode: "Cross", pnl: -342, hasCommission: true },
      { date: "2025-10-31", exchange: "Asterdex", symbol: "ADAUSDT", side: "Sell", leverage: "8x", mode: "Cross", pnl: 825.72, hasCommission: true },
      { date: "2025-10-31", exchange: "Asterdex", symbol: "AAVEUSDT", side: "Sell", leverage: "8x", mode: "Cross", pnl: 2235.69, hasCommission: true },
      { date: "2025-11-01", exchange: "Asterdex", symbol: "BTCUSDT", side: "Buy", leverage: "15x", mode: "Cross", pnl: 36.22, hasCommission: true },
      { date: "2025-11-01 14:43:46", exchange: "Kucoin", symbol: "ARBUSDT Perp", side: "Long", leverage: "10x", mode: "Cross", pnl: 366.23, hasCommission: true },
      { date: "2025-11-02 15:47:04", exchange: "Kucoin", symbol: "BTCUSDT Perp", side: "Long", leverage: "Cross", mode: "Cross", pnl: -86.18, hasCommission: false },
      { date: "2025-11-02 17:37:24", exchange: "Kucoin", symbol: "XTZUSDT Perp", side: "Short", leverage: "Isolated", mode: "Isolated", pnl: -914.94, hasCommission: false }
      { date: "2025-11-02 17:37:24", exchange: "Kucoin", symbol: "BTCUSDT Perp", side: "Long", leverage: "15x", mode: "Isolated", pnl: -2036.94, hasCommission: false },
    ].sort((a, b) => new Date(a.date) - new Date(b.date))
  );

  // Totals calc
  const calcTotals = (trades) => {
    const totalPnl = trades.reduce((acc, t) => acc + t.pnl, 0);
    const commission = trades.reduce(
      (acc, t) => acc + (t.hasCommission && t.pnl > 0 ? t.pnl * commissionRate : 0),
      0
    );
    const net = totalPnl - commission;
    return { totalPnl, commission, net, count: trades.length };
  };

  const totals = calcTotals(closedTrades);
  const fmt = (n) => (typeof n !== "number" || Number.isNaN(n) ? "0.00" : n.toFixed(2));

  // Investment / break-even calc
  const totalInvestment = 5000 + 4400;
  const rebuyCost = asterPrice * 10000; // for 10k ASTER
  const breakEven = totalInvestment - currentMargin + rebuyCost;

  // ---------- Lightweight runtime "tests" for calcTotals ----------
  useEffect(() => {
    // Test set 1: one winning trade with commission
    const t1 = calcTotals([{ pnl: 100, hasCommission: true }]);
    console.assert(Math.abs(t1.totalPnl - 100) < 1e-6, "t1 totalPnl should be 100");
    console.assert(Math.abs(t1.commission - 30) < 1e-6, "t1 commission should be 30 (30%)");
    console.assert(Math.abs(t1.net - 70) < 1e-6, "t1 net should be 70");

    // Test set 2: loss should not incur commission
    const t2 = calcTotals([{ pnl: -50, hasCommission: true }]);
    console.assert(Math.abs(t2.totalPnl + 50) < 1e-6, "t2 totalPnl should be -50");
    console.assert(Math.abs(t2.commission - 0) < 1e-6, "t2 commission should be 0 on loss");

    // Test set 3: mix of win/loss with commission flag
    const t3 = calcTotals([
      { pnl: 200, hasCommission: true },
      { pnl: -100, hasCommission: false },
    ]);
    console.assert(Math.abs(t3.totalPnl - 100) < 1e-6, "t3 totalPnl should be 100");
    console.assert(Math.abs(t3.commission - 60) < 1e-6, "t3 commission should be 60");
    console.assert(Math.abs(t3.net - 40) < 1e-6, "t3 net should be 40");
  }, []);

  return (
    <div style={{ background: "#000", color: "#00ff9f", minHeight: "100vh", fontFamily: "IBM Plex Mono, monospace" }}>
      <header
        style={{
          background: "linear-gradient(90deg, #001a0f, #003b26)",
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#00eaff",
          boxShadow: "0 0 20px #00ff8844",
        }}
      >
        <h2>ZEROEDGE TRADING TERMINAL // v3.0</h2>
        <span>
          {time.toLocaleDateString()} {time.toLocaleTimeString()}
        </span>
      </header>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          padding: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
        }}
      >
        {[
          { label: "Total Closed PnL", value: `${fmt(totals.totalPnl)} USDT`, color: totals.totalPnl >= 0 ? "#00ff9f" : "#ff4d4d" },
          { label: "Commission (30%)", value: `${fmt(totals.commission)} USDT`, color: "#00eaff" },
          { label: "Net Closed", value: `${fmt(totals.net)} USDT`, color: totals.net >= 0 ? "#00ff9f" : "#ff4d4d" },
          { label: "Total Trades", value: totals.count, color: "#00eaff" },
          { label: "Total Investment", value: `${fmt(totalInvestment)} USDT`, color: "#00eaff" },
          { label: "Current Aster Price", value: `$${fmt(asterPrice)}`, color: "#00ff9f" },
          { label: "Cost to Rebuy 10k Aster", value: `$${fmt(rebuyCost)}`, color: "#00eaff" },
          { label: "Break Even Target", value: `${fmt(breakEven)} USDT`, color: "#ffcc00" },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            style={{
              background: "rgba(0,255,159,0.05)",
              // FIXED: proper template string termination below
              border: `1px solid ${item.color}`,
              boxShadow: `0 0 10px ${item.color}55`,
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <h4 style={{ color: item.color, marginBottom: "6px" }}>{item.label}</h4>
            <p style={{ fontSize: "18px", fontWeight: 700 }}>{item.value}</p>
          </motion.div>
        ))}
      </motion.section>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ padding: "20px" }}
      >
        <h3 style={{ color: "#00eaff", marginBottom: "10px" }}>Closed Trades Overview</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "rgba(0,255,159,0.03)",
            border: "1px solid #00ff8844",
          }}
        >
          <thead>
            <tr style={{ color: "#00eaff", borderBottom: "1px solid #00ff8855" }}>
              <th style={{ padding: "10px" }}>Date</th>
              <th>Exchange</th>
              <th>Symbol</th>
              <th>Side</th>
              <th>Lev</th>
              <th>Mode</th>
              <th style={{ textAlign: "right" }}>PnL (USDT)</th>
            </tr>
          </thead>
          <tbody>
            {closedTrades.map((t, i) => (
              <tr
                key={i}
                style={{
                  color: t.pnl >= 0 ? "#00ff9f" : "#ff4d4d",
                  borderBottom: "1px solid #00ff8844",
                }}
              >
                <td style={{ padding: "8px" }}>{t.date}</td>
                <td>{t.exchange}</td>
                <td>{t.symbol}</td>
                <td>{t.side}</td>
                <td>{t.leverage}</td>
                <td>{t.mode}</td>
                <td style={{ textAlign: "right" }}>{fmt(t.pnl)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <footer
        style={{
          textAlign: "center",
          padding: "12px",
          background: "#001a0f",
          color: "#00ff9f",
          boxShadow: "0 -2px 15px #00ff8844",
        }}
      >
        © 2025 ZeroEdge Labs — Matrix Dashboard v3.0
      </footer>
    </div>
  );
}
