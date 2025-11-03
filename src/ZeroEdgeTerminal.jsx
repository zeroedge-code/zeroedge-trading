import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import tradesData from "./TradesData";

export default function ZeroEdgeTerminal() {
  const commissionRate = 0.3;
  const [time, setTime] = useState(new Date());
  const [asterPrice, setAsterPrice] = useState(0);
  const [currentMargin, setCurrentMargin] = useState(8000);
  const [activeTab, setActiveTab] = useState("trades");

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

  const closedTrades = [...tradesData].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

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

  const totalInvestment = 5290;
  const additionalUSDT = 4400;
  const totalTarget = totalInvestment + additionalUSDT;
  const rebuyCost = asterPrice * 5000;
  const remainingToBreakEven = totalTarget - currentMargin;

  return (
    <div
      style={{
        background: "radial-gradient(circle at top, #0a0a0a 0%, #000 100%)",
        color: "#66d9ef",
        minHeight: "100vh",
        fontFamily: "Share Tech Mono, monospace",
      }}
    >
      <header
        style={{
          background: "linear-gradient(90deg, #101010, #222, #050505)",
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #00bcd4",
          boxShadow: "0 0 20px #00bcd455",
        }}
      >
        <h2 style={{ color: "#00bcd4", textShadow: "0 0 10px #00bcd488" }}>
          ZEROEDGE TERMINAL // Cyberpunk View
        </h2>
        <span style={{ color: "#ffb300" }}>
          {time.toLocaleDateString()} {time.toLocaleTimeString()}
        </span>
      </header>

      <nav
        style={{
          display: "flex",
          gap: "10px",
          padding: "10px 20px",
          background: "#111",
          borderBottom: "1px solid #00bcd4",
        }}
      >
        {["trades", "aster"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background:
                activeTab === tab
                  ? "linear-gradient(90deg, #00bcd4, #ffb300)"
                  : "transparent",
              color: activeTab === tab ? "#000" : "#66d9ef",
              border: "1px solid #00bcd4",
              borderRadius: "8px",
              padding: "8px 14px",
              cursor: "pointer",
              fontWeight: 700,
              transition: "all 0.3s ease-in-out",
            }}
          >
            {tab === "trades" ? "📊 CLOSED TRADES" : "💼 HOLDINGS"}
          </button>
        ))}
      </nav>

      {activeTab === "trades" ? (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{
            padding: "30px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          {[
            {
              label: "Total Closed PnL",
              value: `${fmt(totals.totalPnl)} USDT`,
              color: totals.totalPnl >= 0 ? "#00ff9f" : "#ff1744",
            },
            {
              label: "Commission (30%)",
              value: `${fmt(totals.commission)} USDT`,
              color: "#ffb300",
            },
            {
              label: "Net Closed",
              value: `${fmt(totals.net)} USDT`,
              color: totals.net >= 0 ? "#00bcd4" : "#ff4d4d",
            },
            {
              label: "Total Trades",
              value: totals.count,
              color: "#66d9ef",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.08 }}
              style={{
                background: "rgba(0,188,212,0.07)",
                border: `1px solid ${item.color}`,
                boxShadow: `0 0 15px ${item.color}55`,
                borderRadius: "10px",
                padding: "20px",
              }}
            >
              <h4 style={{ color: item.color }}>{item.label}</h4>
              <p style={{ fontSize: "20px", fontWeight: 700, color: item.color }}>{item.value}</p>
            </motion.div>
          ))}

          <motion.div style={{ gridColumn: "1 / -1" }}>
            <h3 style={{ color: "#00bcd4", marginBottom: "10px" }}>Closed Trades Overview</h3>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "rgba(0,188,212,0.03)",
                border: "1px solid #00bcd422",
              }}
            >
              <thead>
                <tr style={{ color: "#00bcd4" }}>
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
                  <tr key={i} style={{ color: t.pnl >= 0 ? "#00ff9f" : "#ff5252" }}>
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
        </motion.section>
      ) : (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{ padding: "30px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}
        >
          {[
            {
              label: "Break-Even Target (5k Aster + 4.4k USDT)",
              value: `$${fmt(totalTarget)}`,
              color: "#ffb300",
            },
            {
              label: "Amount Needed to Break Even",
              value: `${fmt(remainingToBreakEven)} USDT`,
              color: remainingToBreakEven > 0 ? "#ff5252" : "#00ff9f",
            },
            {
              label: "Cost to Rebuy 5,000 Aster",
              value: `$${fmt(rebuyCost)}`,
              color: "#00bcd4",
            },
          ].map((item, i) => (
            <motion.div key={i} whileHover={{ scale: 1.08 }} style={{ background: "rgba(255,179,0,0.08)", border: `1px solid ${item.color}`, boxShadow: `0 0 20px ${item.color}66`, borderRadius: "10px", padding: "20px" }}>
              <h4 style={{ color: item.color }}>{item.label}</h4>
              <p style={{ fontSize: "20px", fontWeight: 700, color: item.color }}>{item.value}</p>
            </motion.div>
          ))}

          <div style={{ gridColumn: "1 / -1", marginTop: "12px" }}>
            <label style={{ display: "block", marginBottom: 6, color: "#00bcd4" }}>Update Current Margin (USDT)</label>
            <input
              type="number"
              value={currentMargin}
              onChange={(e) => setCurrentMargin(Number(e.target.value) || 0)}
              style={{ background: "#111", color: "#66d9ef", border: "1px solid #00bcd4", borderRadius: 6, padding: "8px 10px", width: 220 }}
            />
          </div>
        </motion.section>
      )}

      <footer style={{ textAlign: "center", padding: "12px", background: "#0a0a0a", color: "#00bcd4" }}>
        ⚡ © 2025 ZeroEdge Labs — TITANIUM MATRIX v4.0 ⚡
      </footer>
    </div>
  );
}
