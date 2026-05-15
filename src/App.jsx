import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const API_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTDYnvRWX2qAyW_bqdP1-CX2ZBO-Hcv3eftZ8TQDxvsFT6FiSbDwH1lXnDp4LLx17GF1Lx22-82f0Hz/pub?gid=0&single=true&output=csv";

function parseCsv(text) {
  return text
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => {
      const [timestamp, city, temperature] = line.split(",");

      return {
        timestamp,
        city,
        temperature: Number(temperature)
      };
    });
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function convertRows(rows) {
  const grouped = new Map();

  rows.forEach((row) => {
    if (!grouped.has(row.timestamp)) {
      grouped.set(row.timestamp, {
        time: formatTime(row.timestamp)
      });
    }

    grouped.get(row.timestamp)[row.city] = row.temperature;
  });

  return Array.from(grouped.values());
}

export default function App() {
  const [rows, setRows] = useState([]);

  async function loadData() {
    const response = await fetch(API_URL);
    const text = await response.text();

    setRows(parseCsv(text));
  }

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 60000);

    return () => clearInterval(interval);
  }, []);

  const chartData = useMemo(() => convertRows(rows), [rows]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "40px",
        fontFamily: "Arial"
      }}
    >
      <h1>Nederland Temperatuur</h1>

      <div
        style={{
          background: "white",
          padding: "24px",
          borderRadius: "18px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          marginTop: "20px"
        }}
      >
        <div style={{ width: "100%", height: 500 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="time" />

              <YAxis unit=" °C" />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="Maastricht"
                stroke="#f97316"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="Utrecht"
                stroke="#2563eb"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="Groningen"
                stroke="#16a34a"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}