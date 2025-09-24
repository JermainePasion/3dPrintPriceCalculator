export default function DonateCard() {
  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-center text-lg font-semibold text-[#006A71] mb-4">
        Support me via GCash!!
      </h2>
      <div className="flex justify-center">
        <img
          src="/gcash.png" 
          alt="GCash QR Code"
          className="w-full object-contain rounded-lg shadow-md"
        />
      </div>
    </div>
  )
}
