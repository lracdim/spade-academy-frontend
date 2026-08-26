import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger'
}) => {
    if (!isOpen) return null;

    const colors = {
        danger: 'text-red-600 bg-red-100',
        warning: 'text-amber-600 bg-amber-100',
        info: 'text-[#d0a868] bg-[#d0a868]/10'
    };

    const buttonColors = {
        danger: 'bg-red-600 hover:bg-red-700 shadow-red-100',
        warning: 'bg-amber-600 hover:bg-amber-700 shadow-amber-100',
        info: 'bg-[#d0a868] hover:bg-[#b8955c] shadow-[#d0a868]/20'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[type]}`}>
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">{title}</h3>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{message}</p>
                </div>

                <div className="px-8 pb-8 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-black text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all uppercase tracking-widest border border-gray-100"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 px-6 py-3.5 rounded-2xl text-sm font-black text-white transition-all uppercase tracking-widest shadow-lg active:scale-95 ${buttonColors[type]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
