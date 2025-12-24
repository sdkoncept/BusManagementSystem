import { useEffect, useState } from 'react';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string, value: any) => {
    setSaving(true);
    try {
      await api.post('/settings', {
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value),
        category: settings.find((s) => s.key === key)?.category || 'general',
      });
      toast.success('Setting saved');
      loadSettings();
    } catch (error) {
      toast.error('Failed to save setting');
    } finally {
      setSaving(false);
    }
  };

  const groupedSettings = settings.reduce((acc: any, setting: any) => {
    const category = setting.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(setting);
    return acc;
  }, {});

  return (
    <div className="px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <SettingsIcon className="h-8 w-8" />
          <span>System Settings</span>
        </h1>
        <p className="text-gray-600 mt-2">Customize your bus management system</p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading settings...</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSettings).map(([category, categorySettings]: [string, any]) => (
            <div key={category} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 capitalize">{category} Settings</h2>
              <div className="space-y-4">
                {categorySettings.map((setting: any) => (
                  <div key={setting.id} className="border-b pb-4 last:border-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {setting.key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={typeof setting.value === 'object' ? JSON.stringify(setting.value) : setting.value}
                        onChange={(e) => {
                          const updated = settings.map((s: any) =>
                            s.id === setting.id ? { ...s, value: e.target.value } : s
                          );
                          setSettings(updated);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        onClick={() => handleSave(setting.key, setting.value)}
                        disabled={saving}
                        className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center space-x-2 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}






