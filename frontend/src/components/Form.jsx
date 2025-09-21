import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";

export default function CardWithHistory({ sessionId, setSessionId }) {
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [markup, setMarkup] = useState(20);
  const [material, setMaterial] = useState("");
  const [product, setProduct] = useState("");
  const [pricePerSpool, setPricePerSpool] = useState(0);
  const [weightGrams, setWeightGrams] = useState(0);
  const [printHours, setPrintHours] = useState(0);
  const [printMinutes, setPrintMinutes] = useState(0);
  const [electricityCost, setElectricityCost] = useState(1.68);

  const totalPrintTimeHours = printHours + printMinutes / 60;
  const filamentCostPerGram = pricePerSpool / 1000;
  const filamentCost = filamentCostPerGram * weightGrams;
  const electricityTotal = electricityCost * totalPrintTimeHours;
  const baseCost = filamentCost + electricityTotal;
  const total = (baseCost * (1 + markup / 100)).toFixed(2);

  useEffect(() => {
    if (sessionId) {
      console.log("CardWithHistory received sessionId:", sessionId);
      fetchHistory(sessionId);
    }
  }, [sessionId]);

  // ✅ Helper: request a new session
  const refreshSession = async () => {
    const res = await axios.post("http://localhost:5000/api/session");
    localStorage.setItem("sessionId", res.data.sessionId);
    setSessionId(res.data.sessionId);
    return res.data.sessionId;
  };

  // ✅ Fetch history with session auto-refresh
  const fetchHistory = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/calculations/${id}`);
      setHistory(res.data);
    } catch (err) {
      if (err.response?.data?.error === "Session expired") {
        const newSession = await refreshSession();
        fetchHistory(newSession); // retry with new session
      } else {
        console.error("Error fetching history:", err.message);
      }
    }
  };

  // ✅ Save calculation with session auto-refresh
  const saveCalculation = async () => {
    if (!sessionId) return;

    const payload = {
      sessionId,
      material,
      product,
      pricePerSpool: Number(pricePerSpool),
      weightGrams: Number(weightGrams),
      printHours,
      printMinutes,
      electricityCost: Number(electricityCost),
      markupPercent: Number(markup),
    };

    try {
      const res = await axios.post("http://localhost:5000/api/calculations", payload);
      setHistory((prev) => [res.data, ...prev]);
    } catch (err) {
      if (err.response?.data?.error === "Session expired") {
        const newSession = await refreshSession();
        payload.sessionId = newSession;
        saveCalculation(); // retry with new session
      } else {
        console.error("Error saving calculation:", err.message);
      }
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto p-4 mt-20">
      {/* Main Card */}
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spool Price (₱)
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded-md"
                value={pricePerSpool}
                onChange={(e) => setPricePerSpool(e.target.value)}
              />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Weight (g)
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded-md"
                value={weightGrams}
                onChange={(e) => setWeightGrams(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Print Time
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  className="w-full p-2 border rounded-md"
                  placeholder="Hours"
                  value={printHours}
                  onChange={(e) => setPrintHours(Number(e.target.value))}
                />
                <input
                  type="number"
                  className="w-full p-2 border rounded-md"
                  placeholder="Minutes"
                  value={printMinutes}
                  onChange={(e) => setPrintMinutes(Number(e.target.value))}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {printHours} hour{printHours !== 1 ? "s" : ""} {printMinutes} minute
                {printMinutes !== 1 ? "s" : ""}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Electricity Cost (₱1.68 default)
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded-md"
                value={electricityCost}
                onChange={(e) => setElectricityCost(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Markup */}
        <div className="mt-6">
          <label className="block text-gray-700 font-medium mb-2">
            Markup: {markup}%
          </label>
          <input
            type="range"
            min="0"
            max="1000"
            value={markup}
            onChange={(e) => setMarkup(e.target.value)}
            className="w-full accent-[#48A6A7]"
          />
        </div>

        {/* Total price */}
        <div className="mt-4 text-xl font-semibold text-[#006A71]">
          Total Price: ₱{total}
        </div>

        {/* Save button */}
        <button
          onClick={saveCalculation}
          className="mt-4 w-full bg-[#48A6A7] hover:bg-[#006A71] text-white py-2 rounded-md shadow-md transition"
        >
          Save Calculation
        </button>
      </div>

      {/* Toggle history button */}
      <div className="flex justify-center -mt-3 relative z-10">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`px-6 py-2 rounded-full shadow-md transition
            ${
              showHistory
                ? "bg-[#48A6A7] hover:bg-[#006A71] text-white"
                : "bg-[#006A71] hover:bg-[#48A6A7] text-white"
            }`}
        >
          {showHistory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* History Card */}
      <div
        className={`mt-4 w-full bg-white shadow-lg rounded-2xl p-4 transform transition-all duration-300 ease-in-out overflow-hidden
          ${showHistory ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <h3 className="text-lg font-semibold text-[#006A71] mb-2">History</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          {history.length > 0 ? (
            history.map((h) => (
              <li key={h._id}>
                {h.product} – ₱{h.totalCost.toFixed(2)}
              </li>
            ))
          ) : (
            <li className="text-gray-400">No history yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
