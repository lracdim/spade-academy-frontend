import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../../api/auth';

interface Profile {
    fullName: string;
    employeeId: string;
    email: string | null;
}

const MIN_PASSWORD_LENGTH = 8;

const labelClass = 'text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1';
const readOnlyClass = 'w-full bg-gray-50/50 border border-transparent rounded-2xl p-4 text-sm font-bold text-gray-900 select-none';
const inputClass =
    'w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-4 pr-12 text-sm font-bold text-gray-900 outline-none focus:border-[#d0a868] focus:bg-white transition-colors';

const GuardSettings: React.FC = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<Profile | null>(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        authApi.getMe().then(setProfile).catch(err => console.error('Failed to load profile:', err));
    }, []);

    const handleSignOut = () => {
        authApi.logout();
        navigate('/login');
    };

    const handleChangePassword = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        if (newPassword.length < MIN_PASSWORD_LENGTH) {
            setError(`Your new password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('The new password and its confirmation do not match.');
            return;
        }
        if (newPassword === currentPassword) {
            setError('Your new password must be different from the current one.');
            return;
        }

        setSaving(true);
        try {
            await authApi.changePassword(currentPassword, newPassword);
            toast.success('Password updated');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Could not update your password. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section with brand feel */}
            <div className="flex flex-col items-center text-center space-y-2 mb-4">
                <div className="w-16 h-16 bg-white rounded-3xl border border-gray-50 shadow-sm flex items-center justify-center mb-2">
                    <Settings className="w-8 h-8 text-[#d0a868]" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">PREFERENCES</h1>
                <p className="text-[10px] font-bold text-[#d0a868] uppercase tracking-[0.2em]">Manage Your Guard Identity</p>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden divide-y divide-gray-50">
                {/* Profile Section */}
                <div className="p-8 sm:p-10 space-y-8">
                    <div className="space-y-1">
                        <h2 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Profile Information</h2>
                        <p className="text-xs text-gray-400 font-medium">Your account details as registered in the system.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className={labelClass}>Full Name</label>
                            <div className={readOnlyClass}>{profile?.fullName ?? '...'}</div>
                        </div>
                        <div className="space-y-2">
                            <label className={labelClass}>Badge Number</label>
                            <div className={readOnlyClass}>{profile?.employeeId ?? '...'}</div>
                        </div>
                        {profile?.email && (
                            <div className="space-y-2">
                                <label className={labelClass}>Email Address</label>
                                <div className={readOnlyClass}>{profile.email}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Password Section */}
                <form onSubmit={handleChangePassword} className="p-8 sm:p-10 space-y-6">
                    <div className="space-y-1">
                        <h2 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Change Password</h2>
                        <p className="text-xs text-gray-400 font-medium">
                            If you were given a temporary password, set your own here. Use at least {MIN_PASSWORD_LENGTH} characters.
                        </p>
                    </div>

                    <div className="space-y-5">
                        {[
                            { label: 'Current Password', value: currentPassword, set: setCurrentPassword, auto: 'current-password' },
                            { label: 'New Password', value: newPassword, set: setNewPassword, auto: 'new-password' },
                            { label: 'Confirm New Password', value: confirmPassword, set: setConfirmPassword, auto: 'new-password' },
                        ].map(field => (
                            <div key={field.label} className="space-y-2">
                                <label className={labelClass}>{field.label}</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords ? 'text' : 'password'}
                                        value={field.value}
                                        onChange={e => field.set(e.target.value)}
                                        autoComplete={field.auto}
                                        required
                                        className={inputClass}
                                    />
                                    {field.label === 'Current Password' && (
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords(show => !show)}
                                            aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                                        >
                                            {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {error && <p className="text-xs font-bold text-red-500">{error}</p>}

                    <button
                        type="submit"
                        disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                        className="w-full py-4 bg-gray-950 hover:bg-[#d0a868] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-colors flex items-center justify-center gap-2"
                    >
                        <KeyRound className="w-4 h-4" />
                        {saving ? 'Updating...' : 'Update Password'}
                    </button>
                </form>

                {/* Account Actions */}
                <div className="p-8 sm:p-10 bg-gray-50/30">
                    <button
                        onClick={handleSignOut}
                        className="w-full py-5 bg-white border border-gray-100 text-[10px] font-black text-red-500 uppercase tracking-[0.25em] rounded-2xl hover:bg-red-50 hover:border-red-100 transition-all shadow-sm active:scale-[0.98]"
                    >
                        Sign Out of Session
                    </button>
                    <p className="text-center text-[9px] font-bold text-gray-300 uppercase tracking-[0.1em] mt-6">
                        SPADE ACADEMY
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GuardSettings;
