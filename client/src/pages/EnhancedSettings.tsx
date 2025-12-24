import { useState, useEffect } from 'react';
import { Search, Save } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function EnhancedSettings() {
  const [settings, setSettings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingSetting, setEditingSetting] = useState<any>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data);
    } catch (error) {
      toast.error('Failed to load settings');
    }
  };

  const categories = [
    { name: 'CMS PAGES', settings: ['privacy_policy', 'terms_conditions', 'faq'] },
    {
      name: 'RIDER APP SETTINGS',
      settings: [
        'support_email',
        'support_contact',
        'rider_android_url',
        'rider_ios_url',
        'referral_message_rider',
      ],
    },
    {
      name: 'DRIVER APP SETTINGS FOR TAXI/LIMO/LOGISTICS',
      settings: ['driver_android_url', 'driver_ios_url', 'admin_cutoff_percentage'],
    },
    {
      name: 'BUS SETTINGS',
      settings: [
        'referral_discount',
        'feedback_predefined_questions',
        'notification_send_before_journey',
        'deduction_from_payment_gateway',
        'ticket_booking_before_min_time',
        'ticket_booking_before_max_time',
        'convenience_fee',
        'travel_insurance',
      ],
    },
  ];

  const handleSave = async (key: string, value: any, unit?: string) => {
    try {
      const settingValue = unit ? { value, unit } : value;
      await api.post('/settings', {
        key,
        value: typeof settingValue === 'string' ? settingValue : JSON.stringify(settingValue),
        category: categories.find((cat) => cat.settings.includes(key))?.name || 'general',
      });
      toast.success('Setting saved successfully');
      loadSettings();
      setEditingSetting(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save setting');
    }
  };

  const getSettingValue = (key: string) => {
    const setting = settings.find((s) => s.key === key);
    if (!setting) return { value: '', unit: '' };
    const parsed = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
    return typeof parsed === 'object' && parsed !== null ? parsed : { value: parsed, unit: '' };
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Personalized Customizations of the Bus Management Web Portal
          </h1>
          <p className="text-gray-600">
            With easy customizable settings you can modify the parameters that determine your Business Operations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Global Settings Management</h2>
              <p className="text-sm text-gray-600 mb-4">Manage global settings efficiently</p>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search settings"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-6">
                {filteredCategories.map((category) => (
                  <div key={category.name}>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">{category.name}</h3>
                    <ul className="space-y-1">
                      {category.settings.map((settingKey) => {
                        const setting = settings.find((s) => s.key === settingKey);
                        return (
                          <li key={settingKey}>
                            <button
                              onClick={() => {
                                setSelectedCategory(category.name);
                                setEditingSetting(settingKey);
                              }}
                              className={`w-full text-left px-3 py-2 rounded text-sm ${
                                editingSetting === settingKey
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {settingKey
                                .split('_')
                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ')}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {editingSetting && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    Edit{' '}
                    {editingSetting
                      .split('_')
                      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}{' '}
                    Settings
                  </h2>
                  <button
                    onClick={() => setEditingSetting(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const value = formData.get('value');
                    const unit = formData.get('unit') as string;
                    handleSave(editingSetting, value, unit);
                  }}
                  className="space-y-4"
                >
                  {editingSetting === 'referral_discount' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">Referral Discount Value</label>
                        <input
                          type="number"
                          name="value"
                          defaultValue={getSettingValue(editingSetting).value}
                          placeholder="Enter value"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Referral Discount Unit</label>
                        <select
                          name="unit"
                          defaultValue={getSettingValue(editingSetting).unit || 'Flat'}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option>Flat</option>
                          <option>Percentage</option>
                        </select>
                      </div>
                    </>
                  )}

                  {editingSetting === 'notification_send_before_journey' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Notification Send Before Journey Starts (Hr)
                      </label>
                      <input
                        type="number"
                        name="value"
                        defaultValue={getSettingValue(editingSetting).value}
                        placeholder="Enter time in hour"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  )}

                  {editingSetting === 'deduction_from_payment_gateway' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Percent Deduction From Payment Gateway To The Client (%)
                      </label>
                      <input
                        type="number"
                        name="value"
                        step="0.01"
                        defaultValue={getSettingValue(editingSetting).value}
                        placeholder="Enter percentage"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  )}

                  {editingSetting === 'ticket_booking_before_min_time' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        The User Will Be Able To Book A Ticket Before Minimum Time (Hr)
                      </label>
                      <input
                        type="number"
                        name="value"
                        defaultValue={getSettingValue(editingSetting).value}
                        placeholder="Enter time in hour"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  )}

                  {editingSetting === 'ticket_booking_before_max_time' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        The User Will Be Able To Book A Ticket Before Maximum Time (Days)
                      </label>
                      <input
                        type="number"
                        name="value"
                        defaultValue={getSettingValue(editingSetting).value}
                        placeholder="Enter time in days"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  )}

                  {editingSetting === 'convenience_fee' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Convenience Fee (Fixed Percentage)
                      </label>
                      <select
                        name="value"
                        defaultValue={getSettingValue(editingSetting).value || '10.0%'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option>10.0%</option>
                        <option>5.0%</option>
                        <option>15.0%</option>
                        <option>20.0%</option>
                      </select>
                    </div>
                  )}

                  {editingSetting === 'travel_insurance' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Travel Insurance (Fixed Percentage)
                      </label>
                      <select
                        name="value"
                        defaultValue={getSettingValue(editingSetting).value || '3.0%'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option>3.0%</option>
                        <option>5.0%</option>
                        <option>7.0%</option>
                        <option>10.0%</option>
                      </select>
                    </div>
                  )}

                  {/* Default text input for other settings */}
                  {!['referral_discount', 'notification_send_before_journey', 'deduction_from_payment_gateway', 'ticket_booking_before_min_time', 'ticket_booking_before_max_time', 'convenience_fee', 'travel_insurance'].includes(
                    editingSetting
                  ) && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {editingSetting
                          .split('_')
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                      </label>
                      <input
                        type="text"
                        name="value"
                        defaultValue={getSettingValue(editingSetting).value}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditingSetting(null)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                    >
                      <Save className="h-5 w-5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {!editingSetting && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500">Select a setting from the sidebar to edit</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

