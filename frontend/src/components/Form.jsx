import React, { useState } from "react";

function Form() {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F2EFE7] p-4">
      {/* Main card */}
      <div className="relative bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
        {/* Main form placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Material"
              className="w-full p-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Product"
              className="w-full p-2 border rounded-md"
            />
            <input
              type="number"
              placeholder="Spool Price (₱)"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="space-y-4">
            <input
              type="number"
              placeholder="Product Weight (g)"
              className="w-full p-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Print Time (hrs:min)"
              className="w-full p-2 border rounded-md"
            />
            <input
              type="number"
              placeholder="Electricity Cost (₱1.68 default)"
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="absolute top-4 -right-5 bg-[#48A6A7] text-white px-3 py-2 rounded shadow-md hover:bg-[#006A71] transition"
        >
          {showHistory ? "<" : ">"}
        </button>

        {/* History card */}
        {showHistory && (
          <div className="absolute top-0 right-[-18rem] bg-white shadow-lg rounded-2xl p-4 w-64 h-full">
            <h3 className="text-lg font-semibold text-[#006A71] mb-2">
              History
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Coaster – ₱250</li>
              <li>Phone stand – ₱180</li>
              <li>Keychain – ₱75</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Form;
