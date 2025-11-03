import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ZeroEdgeTerminal
// Night City / Matrix Neon Dashboard Edition
// - glowing header
// - stat cards grid
// - cyberpunk table with neon separators
// - break-even / ASTER panel with holo input
// Functionality is unchanged (PnL math, ASTER live price, break-even calc)

export default function ZeroEdgeTerminal() {
  // =========================
  // STATE
  // =========================
  const commissionRate = 0.3;
  const [time, setTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("closed"); // "closed" | "aster"
  const [margin, setMargin] = useState(8000); // editable margin
  const [asterPrice, setAsterPrice] = useState(null); // live price
  const [loading, setLoading] = useState(false);

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get ASTER price once on mount
  useEffect(() => {
    fetchAsterPrice();
  }, []);

  // Refresh ASTER price whenever user opens ASTER tab
  useEffect(() => {
    if (activeTab === "aster") fetchAsterPrice();
  }, [activeTab]);

  // Fetch ASTER price (CoinGecko id `aster-2`)
  async function fetchAsterPrice() {
    try {
      setLoading(true);
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=aster-2&vs_currencies=usd"
      );
      const data = await res.json();
      setAsterPrice(data["aster-2"]?.usd || 1.17);
    } catch (e) {
      console.error(e);
      // fallback so UI doesn't die
      setAsterPrice(1.17);
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // DATA: CLOSED TRADES
  // =========================
  // This includes all wins/losses you gave, sorted oldest -> newest
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
      { date: "2025-11-02 17:37:24", exchange: "Kucoin", symbol: "XTZUSDT Perp", side: "Short", leverage: "Isolated", mode: "Isolated", pnl: -914.94, hasCommission: false },
       { date: "2025-11-02 17:37:24", exchange: "Kucoin", symbol: "BTCUSDT Perp", side: "Long", leverage: "15x", mode: "Isolated", pnl: -2036.94, hasCommission: false },
    ].sort((a, b) => new Date(a.date) - new Date(b.date))
  );

  // =========================
  // CALCULATIONS
  // =========================
  function calcTotals(trades) {
    const totalPnl = trades.reduce((acc, t) => acc + t.pnl, 0);
    const commission = trades.reduce(
      (acc, t) => acc + (t.hasCommission && t.pnl > 0 ? t.pnl * commissionRate : 0),
      0
    );
    const net = totalPnl - commission;
    return {
      totalPnl,
      commission,
      net,
      tradeCount: trades.length,
    };
  }

  const closedTotals = calcTotals(closedTrades);

  // small helpers
  const fmt = (n) =>
    typeof n !== "number" || Number.isNaN(n) ? "0.00" : n.toFixed(2);

  const pnlColor = closedTotals.totalPnl >= 0 ? "#39ff14" : "#ff4d6a"; // neon green / neon red
  const netColor = closedTotals.net >= 0 ? "#39ff14" : "#ff4d6a";

  // Break-even logic
  const asterTokensTarget5k = 5000; // goal bag
  const asterTokensTarget10k = 10000; // dream bag
  const usdtCashTarget = 4400;

  const costToRebuy5k = asterPrice ? asterTokensTarget5k * asterPrice : 0;
  const costToRebuy10k = asterPrice ? asterTokensTarget10k * asterPrice : 0;

  const breakEvenTargetUSD = (asterPrice ? costToRebuy5k : 0) + usdtCashTarget;
  const neededToBreakEvenUSD = breakEvenTargetUSD - margin;

  // =========================
  // STYLES (Matrix/Night City)
  // =========================
  const colors = {
    bgOuter: "#000000",
    bgPanel: "rgba(10,20,15,0.6)", // translucent dark green/black
    borderGlow: "0 0 12px rgba(0,255,170,0.4)",
    borderCyan: "rgba(0,255,170,0.4)",
    textDim: "#6bffbd",
    textBright: "#00eaff",
    textGreen: "#39ff14",
    textRed: "#ff4d6a",
    lineSoft: "rgba(0,255,170,0.18)",
    cardShadow: "0 20px 60px rgba(0,0,0,0.8)",
  };

  const headerStyle = {
    background:
      "linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,40,20,0.6) 60%, rgba(0,255,170,0.15) 100%)",
    color: colors.textBright,
    padding: "16px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: `1px solid ${colors.borderCyan}`,
    boxShadow: colors.borderGlow,
    fontFamily: "'IBM Plex Mono', monospace",
  };

  const shellWrapper = {
    minHeight: "100vh",
    backgroundColor: colors.bgOuter,
    backgroundImage:
      "radial-gradient(circle at 20% 20%, rgba(0,255,170,0.07) 0%, transparent 60%), radial-gradient(circle at 80% 10%, rgba(0,234,255,0.05) 0%, transparent 60%)",
    color: colors.textBright,
    fontFamily: "'IBM Plex Mono', monospace",
    display: "flex",
    flexDirection: "column",
  };

  const statsGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
    gap: "16px",
    padding: "20px 24px",
    borderBottom: `1px solid ${colors.lineSoft}`,
    background:
      "linear-gradient(to bottom right, rgba(0,20,10,0.6) 0%, rgba(0,0,0,0) 60%)",
  };

  const statCard = {
    backgroundColor: colors.bgPanel,
    boxShadow: `${colors.borderGlow}, ${colors.cardShadow}`,
    border: `1px solid ${colors.borderCyan}`,
    borderRadius: "8px",
    padding: "12px 14px",
    lineHeight: 1.4,
    minHeight: "80px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  const labelStyle = {
    fontSize: "11px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: colors.textDim,
  };

  const valueStyle = {
    fontSize: "16px",
    fontWeight: 600,
    color: colors.textBright,
    textShadow: "0 0 8px rgba(0,255,170,0.6)",
    wordBreak: "break-word",
  };

  const navBarStyle = {
    display: "flex",
    gap: "10px",
    padding: "12px 24px",
    borderBottom: `1px solid ${colors.lineSoft}`,
    background:
      "radial-gradient(circle at 0% 0%, rgba(0,255,170,0.12) 0%, rgba(0,0,0,0) 70%)",
  };

  const tabButton = (isActive) => ({
    backgroundColor: isActive ? "rgba(0,255,170,0.12)" : "transparent",
    border: `1px solid ${isActive ? colors.textGreen : colors.lineSoft}`,
    boxShadow: isActive ? colors.borderGlow : "none",
    color: isActive ? colors.textGreen : colors.textBright,
    padding: "8px 14px",
    borderRadius: "6px",
    fontSize: "11px",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "inherit",
  });

  const tableWrapper = {
    padding: "24px",
    flexGrow: 1,
  };

  const tableShell = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "rgba(0,0,0,0.4)",
    border: `1px solid ${colors.lineSoft}`,
    boxShadow: `${colors.borderGlow}, ${colors.cardShadow}`,
    borderRadius: "8px",
    overflow: "hidden",
    fontSize: "13px",
    minWidth: "800px",
  };

  const thStyle = {
    backgroundColor: "rgba(0,20,10,0.8)",
    color: colors.textBright,
    textAlign: "left",
    padding: "10px 12px",
    borderBottom: `1px solid ${colors.lineSoft}`,
    fontSize: "11px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  };

  const tdBase = {
    padding: "10px 12px",
    borderBottom: `1px solid rgba(0,255,170,0.08)`,
    color: colors.textBright,
  };

  const pnlCell = (pnl) => ({
    ...tdBase,
    textAlign: "right",
    color: pnl >= 0 ? colors.textGreen : colors.textRed,
    fontWeight: 600,
    textShadow:
      pnl >= 0
        ? "0 0 8px rgba(57,255,20,0.6)"
        : "0 0 8px rgba(255,77,106,0.6)",
  });

  const asterPanelShell = {
    backgroundColor: colors.bgPanel,
    border: `1px solid ${colors.borderCyan}`,
    boxShadow: `${colors.borderGlow}, ${colors.cardShadow}`,
    borderRadius: "10px",
    maxWidth: "460px",
    padding: "20px",
    lineHeight: 1.5,
    fontSize: "13px",
  };

  const holoLabel = {
    color: colors.textDim,
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "4px",
    display: "block",
  };

  const holoInput = {
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    border: `1px solid ${colors.textGreen}`,
    color: colors.textGreen,
    boxShadow: `${colors.borderGlow}`,
    borderRadius: "6px",
    padding: "10px 12px",
    fontFamily: "inherit",
    fontSize: "13px",
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div style={shellWrapper}>
      {/* HEADER / TITLE BAR */}
      <header style={headerStyle}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: colors.textGreen,
              textShadow: "0 0 8px rgba(57,255,20,0.7)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            ZEROEDGE // TRADING TERMINAL
          </div>
          <div
            style={{
              fontSize: "11px",
              color: colors.textDim,
              marginTop: "4px",
              letterSpacing: "0.08em",
            }}
          >
            Internal Use Only — NightCity Build v3.0
          </div>
        </div>

        <div
          style={{
            textAlign: "right",
            fontSize: "12px",
            lineHeight: 1.3,
            color: colors.textBright,
            textShadow: "0 0 6px rgba(0,234,255,0.7)",
          }}
        >
          <div>{time.toLocaleDateString()}</div>
          <div>{time.toLocaleTimeString()}</div>
        </div>
      </header>

      {/* TOP STATS GRID */}
      <section style={statsGrid}>
        {/* PnL */}
        <div style={statCard}>
          <div style={labelStyle}>Total Closed PnL</div>
          <div style={{ ...valueStyle, color: pnlColor, textShadow: pnlColor === colors.textGreen ? "0 0 8px rgba(57,255,20,0.6)" : "0 0 8px rgba(255,77,106,0.6)" }}>
            {fmt(closedTotals.totalPnl)} USDT
          </div>
        </div>

        {/* Commission */}
        <div style={statCard}>
          <div style={labelStyle}>Commission (30%)</div>
          <div
            style={{
              ...valueStyle,
              color: colors.textBright,
              textShadow: "0 0 8px rgba(0,234,255,0.6)",
            }}
          >
            {fmt(closedTotals.commission)} USDT
          </div>
        </div>

        {/* Net Closed */}
        <div style={statCard}>
          <div style={labelStyle}>Net Closed</div>
          <div style={{ ...valueStyle, color: netColor, textShadow: netColor === colors.textGreen ? "0 0 8px rgba(57,255,20,0.6)" : "0 0 8px rgba(255,77,106,0.6)" }}>
            {fmt(closedTotals.net)} USDT
          </div>
        </div>

        {/* # Trades */}
        <div style={statCard}>
          <div style={labelStyle}>Number of Trades</div>
          <div style={{ ...valueStyle, fontSize: "18px" }}>{closedTotals.tradeCount}</div>
        </div>

        {/* Aster Price */}
        <div style={statCard}>
          <div style={labelStyle}>Current Aster Price</div>
          <div
            style={{
              ...valueStyle,
              color: colors.textGreen,
              textShadow: "0 0 8px rgba(57,255,20,0.7)",
              display: "flex",
              alignItems: "baseline",
              gap: "6px",
            }}
          >
            <span>${asterPrice ? fmt(asterPrice) : loading ? "…" : "--"}</span>
            <span style={{ fontSize: "10px", color: colors.textDim }}>USD</span>
          </div>
        </div>

        {/* Cost to Rebuy 5k */}
        <div style={statCard}>
          <div style={labelStyle}>Rebuy 5k Aster</div>
          <div style={{ ...valueStyle }}>{`$${fmt(costToRebuy5k)}`}</div>
        </div>

        {/* Cost to Rebuy 10k */}
        <div style={statCard}>
          <div style={labelStyle}>Rebuy 10k Aster</div>
          <div style={{ ...valueStyle }}>{`$${fmt(costToRebuy10k)}`}</div>
        </div>

        {/* Break-even */}
        <div style={statCard}>
          <div style={labelStyle}>Break-Even Target (5k Aster + 4.4k USDT)</div>
          <div style={{ ...valueStyle, fontSize: "14px" }}>{`$${fmt(breakEvenTargetUSD)}`}</div>
          <div
            style={{
              fontSize: "11px",
              marginTop: "6px",
              color: neededToBreakEvenUSD <= 0 ? colors.textGreen : colors.textRed,
              textShadow:
                neededToBreakEvenUSD <= 0
                  ? "0 0 8px rgba(57,255,20,0.6)"
                  : "0 0 8px rgba(255,77,106,0.6)",
            }}
          >
            {neededToBreakEvenUSD <= 0
              ? `${fmt(Math.abs(neededToBreakEvenUSD))} USDT ABOVE break-even`
              : `${fmt(neededToBreakEvenUSD)} USDT to break even`}
          </div>
        </div>
      </section>

      {/* NAV BAR */}
      <nav style={navBarStyle}>
        {["closed", "aster"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={tabButton(activeTab === tab)}
          >
            {tab === "closed" ? "Closed Trades" : "Aster Holdings"}
          </button>
        ))}
      </nav>

      {/* MAIN BODY WITH ANIMATED TABS */}
      <main style={{ flexGrow: 1, minHeight: 0 }}>
        <AnimatePresence mode="wait">
          {activeTab === "closed" ? (
            <motion.section
              key="closed"
              style={tableWrapper}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <div
                style={{
                  color: colors.textDim,
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Closed Trades (Realized)
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={tableShell}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Exchange</th>
                      <th style={thStyle}>Symbol</th>
                      <th style={thStyle}>Side</th>
                      <th style={thStyle}>Lev</th>
                      <th style={thStyle}>Mode</th>
                      <th style={{ ...thStyle, textAlign: "right" }}>PnL (USDT)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closedTrades.map((t, i) => (
                      <tr
                        key={i}
                        style={{
                          backgroundColor:
                            t.pnl >= 0
                              ? "rgba(0,255,170,0.06)"
                              : "rgba(255,77,106,0.06)",
                        }}
                      >
                        <td style={tdBase}>{t.date}</td>
                        <td style={tdBase}>{t.exchange}</td>
                        <td style={tdBase}>{t.symbol}</td>
                        <td style={tdBase}>{t.side}</td>
                        <td style={tdBase}>{t.leverage}</td>
                        <td style={tdBase}>{t.mode}</td>
                        <td style={pnlCell(t.pnl)}>{fmt(t.pnl)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="aster"
              style={{ padding: "24px", flexGrow: 1, display: "flex", flexWrap: "wrap" }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <div
                style={{
                  color: colors.textDim,
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                  width: "100%",
                }}
              >
                Aster Holdings / Break-Even
              </div>

              <div style={asterPanelShell}>
                <div style={{ marginBottom: "12px", color: colors.textBright }}>
                  Goal: rebuild 5k ASTER bag + keep 4.4k USDT cash.
                </div>

                <div style={{ marginBottom: "8px", color: colors.textBright }}>
                  <span style={labelStyle}>Current Aster Price</span>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: colors.textGreen,
                      textShadow: "0 0 8px rgba(57,255,20,0.7)",
                    }}
                  >
                    ${asterPrice ? fmt(asterPrice) : loading ? "…" : "--"} USD
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                  <div>
                    <span style={labelStyle}>Rebuy 5k Aster</span>
                    <div style={{ color: colors.textBright, fontWeight: 600 }}>{`$${fmt(costToRebuy5k)}`}</div>
                  </div>

                  <div>
                    <span style={labelStyle}>Rebuy 10k Aster</span>
                    <div style={{ color: colors.textBright, fontWeight: 600 }}>{`$${fmt(costToRebuy10k)}`}</div>
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <span style={labelStyle}>Break-Even Target (5k Aster + 4.4k USDT)</span>
                  <div style={{ color: colors.textGreen, fontWeight: 600 }}>{`$${fmt(breakEvenTargetUSD)}`}</div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={holoLabel}>Current Total Margin (USDT)</label>
                  <input
                    type="number"
                    value={margin}
                    onChange={(e) => setMargin(parseFloat(e.target.value) || 0)}
                    style={holoInput}
                  />
                </div>

                <div
                  style={{
                    color:
                      neededToBreakEvenUSD <= 0
                        ? colors.textGreen
                        : colors.textRed,
                    fontWeight: 600,
                    textShadow:
                      neededToBreakEvenUSD <= 0
                        ? "0 0 8px rgba(57,255,20,0.7)"
                        : "0 0 8px rgba(255,77,106,0.7)",
                    fontSize: "13px",
                  }}
                >
                  {neededToBreakEvenUSD <= 0
                    ? `You are ABOVE break-even by ${fmt(Math.abs(neededToBreakEvenUSD))} USDT`
                    : `You still need ${fmt(neededToBreakEvenUSD)} USDT to break even`}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: `1px solid ${colors.lineSoft}`,
          padding: "12px 24px",
          fontSize: "10px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: colors.textDim,
          background:
            "linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,40,20,0.4) 60%, rgba(0,255,170,0.07) 100%)",
          boxShadow: colors.borderGlow,
          textAlign: "center",
        }}
      >
        © 2025 ZeroEdge Labs — NightCity Terminal v3.0 — Internal Use Only
      </footer>
    </div>
  );
}
