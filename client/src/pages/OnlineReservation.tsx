import { useState } from 'react';
import { Copy, CreditCard, Wallet, Gift, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OnlineReservation() {
  const [referralCode] = useState('3FBJKQ');
  const [couponId] = useState('KLNY55KO');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card');
  const [cardNumber, setCardNumber] = useState('**** **** **** 7981');
  const [tickets, setTickets] = useState(2);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  return (
    <div className="min-h-screen bg-green-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Online Reservation System</h1>
          <p className="text-lg text-gray-700">
            Increase your user base by including easy-to-use and effective features in your bus reservation app.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Refer and Earn Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="bg-teal-500 text-white p-4 rounded-t-lg -m-6 mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Refer and Earn</h3>
              <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">📢</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Your Referral Code</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-100 px-4 py-3 rounded-lg font-mono font-bold text-lg">
                    {referralCode}
                  </div>
                  <button
                    onClick={() => copyToClipboard(referralCode, 'Referral code')}
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy Code</span>
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Coupon ID</p>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <div className="flex-1 bg-gray-100 px-4 py-2 rounded-lg font-mono">
                    {couponId}
                  </div>
                  <span className="text-green-600 font-semibold">25%</span>
                  <button
                    onClick={() => copyToClipboard(couponId, 'Coupon ID')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm text-gray-600">
              <span className="font-semibold">Refer and Earn</span> - Give your users some offers with discount
              coupons and referral gifts - all through the app!
            </p>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Select Payment Method</h3>

            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="mr-3"
                />
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="font-medium">PAY BY CASH</span>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 border-blue-500 rounded-lg cursor-pointer bg-blue-50">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="mr-3"
                />
                <div className="flex items-center justify-between flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">Mastercard</div>
                      <div className="text-sm text-gray-600">{cardNumber}</div>
                      <div className="text-xs text-gray-500">EXP. Jun 2022</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPaymentMethod('cash');
                    }}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </label>
            </div>

            <p className="mt-6 text-sm text-gray-600">
              <span className="font-semibold">Choose any Payment Method</span> - Users can now pay for their trip
              with any form of payment, cash or online.
            </p>
          </div>

          {/* Start Station and Stops */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Start Station</h3>
            <div className="space-y-4">
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option>Select station</option>
              </select>

              <div>
                <label className="block text-sm font-medium mb-2">Stop titles</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-8 text-center font-medium">1</span>
                    <input
                      type="text"
                      defaultValue="Battery Park City"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-8 text-center font-medium">2</span>
                    <input
                      type="text"
                      placeholder="Stop title"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Selection */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-white relative">
            <h3 className="text-xl font-semibold mb-2">Royal Cruiser</h3>
            <p className="text-gray-300 mb-4">Cubao → Tuguegarao</p>
            <div className="flex items-center justify-between text-sm mb-4">
              <span>2:40 PM</span>
              <span className="text-lg font-bold">$6</span>
            </div>

            {/* Ticket Count Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 text-gray-900">
                <h4 className="font-semibold mb-4 text-center">No. of Tickets</h4>
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <button
                    onClick={() => setTickets(Math.max(1, tickets - 1))}
                    className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold w-12 text-center">{tickets}</span>
                  <button
                    onClick={() => setTickets(tickets + 1)}
                    className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <div className="flex space-x-3">
                  <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    DONE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

