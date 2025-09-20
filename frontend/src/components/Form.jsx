import React, { useState } from "react";

function Form() {
  const [showHistory, setShowHistory] = useState(false);
  const [markup, setMarkup] = useState(20); // default 20%
  const [baseCost, setBaseCost] = useState(250); 

  const total = (baseCost * (1 + markup / 100)).toFixed(2);

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F2EFE7] p-4">
      {/* Wrapper for both cards */}
      <div className="relative flex">
        {/* Main card */}
        <div
          className={`relative bg-white shadow-lg rounded-2xl p-6 w-full max-w-xl z-10 transform transition-transform duration-300 ${
            showHistory ? "scale-105" : "scale-100"
          }`}
        >
          {/* Main form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spool Price (₱)
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Weight (g)
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Print Time (hrs:min)
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Electricity Cost (₱1.68 default)
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          </div>
           <div className="mt-6">
          <label className="block text-gray-700 font-medium mb-2">
            Markup: {markup}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={markup}
            onChange={(e) => setMarkup(e.target.value)}
            className="w-full accent-[#48A6A7]"
          />
        </div>

        {/* Total price */}
        <div className="mt-4 text-xl font-semibold text-[#006A71]">
          Total Price: ₱{total}
        </div>

          {/* Toggle button */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`absolute top-4 -right-5 px-3 py-2 rounded shadow-md transition transform 
              ${showHistory 
                ? "bg-[#48A6A7] hover:bg-[#006A71] scale-110 text-white"   // enlarged + dark
                : "bg-[#006A71] hover:bg-[#48A6A7] text-white" // default + hoverbg-[#006A71] scale-110 text-white
              }`}
          >
            {showHistory ? "<" : ">"}
          </button>
        </div>

        {/* History card (behind) */}
        <div
          className={`absolute top-0 right-0 h-full w-64 bg-white shadow-lg rounded-l-2xl p-4 pl-8 transform transition-transform duration-300 ease-in-out z-0 ${
            showHistory ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <h3 className="text-lg font-semibold text-[#006A71] mb-2">History</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Coaster – ₱250</li>
            <li>Phone stand – ₱180</li>
            <li>Keychain – ₱75</li>
          </ul>
        </div>
        
      </div>
      

    </div>
  );
}

export default Form;
