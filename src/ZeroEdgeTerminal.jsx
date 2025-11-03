import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ZeroEdgeTerminal() {
  const commissionRate = 0.3;
  const [time, setTime] = useState(new Date());
  const [asterPrice, setAsterPrice] = useState(0);
  const [currentMargin, setCurrentMargin] = useState(8000);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=aster-2&vs_currencies=usd"
        );
        const data = await res.json();
        if (data["aster-2"]?.usd) setAsterPrice(data["aster-2"].usd);
      } catch (e) {
        console.error("Price fetch error:", e);
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  const [closedTrades] = useState([
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
    { date: "2025-11-02 17:37:24", exchange: "Kucoin", symbol: "XTZUSDT Perp", side: "Short", leverage: "Isolated", mode: "Isolated", pnl: -914.94, hasCommission: false },
    { date: "2025-11-02 17:37:24", exchange: "Kucoin", symbol: "BTCUSDT Perp", side: "Long", leverage: "15x", mode: "Isolated", pnl: -2036.94, hasCommission: false },
    { date: "2025-11-02 17:37:24", exchange: "Kucoin", symbol: "BCHUSDT Perp", side: "Long", leverage: "15x", mode: "Isolated", pnl: -97.52, hasCommission: false }
  ].sort((a, b) => new Date(a.date) - new Date(b.date)));

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

  const totalInvestment = 5290; // Aster sold
  const additionalUSDT = 4400; // Remaining funds
  const totalTarget = totalInvestment + additionalUSDT; // 9690 total break-even target
  const rebuyCost = asterPrice * 5000; // Rebuy 5k ASTER
  const remainingToBreakEven = totalTarget - currentMargin;

  return (
    <div style={{ background: "#000", color: "#00ff9f", minHeight: "100vh", fontFamily: "IBM Plex Mono, monospace" }}>
      <header style={{ background: "linear-gradient(90deg, #001a0f, #003b26)", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#00eaff" }}>
        <h2>ZEROEDGE TRADING TERMINAL // v3.4</h2>
        <span>{time.toLocaleDateString()} {time.toLocaleTimeString()}</span>
      </header>

      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} style={{ padding: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
        {[
          { label: "Total Closed PnL", value: `${fmt(totals.totalPnl)} USDT`, color: totals.totalPnl >= 0 ? "#00ff9f" : "#ff4d4d" },
          { label: "Commission (30%)", value: `${fmt(totals.commission)} USDT`, color: "#00eaff" },
          { label: "Net Closed", value: `${fmt(totals.net)} USDT`, color: totals.net >= 0 ? "#00ff9f" : "#ff4d4d" },
          { label: "Total Trades", value: totals.count, color: "#00eaff" },
          { label: "Break-Even Target (5k Aster + 4.4k USDT)", value: `$${fmt(totalTarget)}`, color: "#ffcc00" },
          { label: "Amount Needed to Break Even", value: `${fmt(remainingToBreakEven)} USDT`, color: remainingToBreakEven > 0 ? "#ff4d4d" : "#00ff9f" },
          { label: "Cost to Rebuy 5,000 Aster", value: `$${fmt(rebuyCost)}`, color: "#00eaff" }
        ].map((item, i) => (
          <motion.div key={i} whileHover={{ scale: 1.05 }} style={{ background: "rgba(0,255,159,0.05)", border: `1px solid ${item.color}`, boxShadow: `0 0 10px ${item.color}55`, borderRadius: "10px", padding: "20px" }}>
            <h4 style={{ color: item.color, marginBottom: "6px" }}>{item.label}</h4>
            <p style={{ fontSize: "18px", fontWeight: 700 }}>{item.value}</p>
          </motion.div>
        ))}
      </motion.section>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ padding: "20px" }}>
        <h3 style={{ color: "#00eaff", marginBottom: "10px" }}>Closed Trades Overview</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "rgba(0,255,159,0.03)", border: "1px solid #00ff8844" }}>
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
              <tr key={i} style={{ color: t.pnl >= 0 ? "#00ff9f" : "#ff4d4d", borderBottom: "1px solid #00ff8844" }}>
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

      <footer style={{ textAlign: "center", padding: "12px", background: "#001a0f", color: "#00ff9f" }}>
        © 2025 ZeroEdge Labs — Matrix Dashboard v3.4
      </footer>
    </div>
  );
}
