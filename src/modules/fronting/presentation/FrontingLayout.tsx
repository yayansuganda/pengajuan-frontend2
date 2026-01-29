'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface FrontingLayoutProps {
    title: string;
    children: React.ReactNode;
}

export const FrontingLayout: React.FC<FrontingLayoutProps> = ({ title, children }) => {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/fronting" className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-lg font-bold text-slate-900">{title}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Optional Action / Branding */}
                        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-200">
                            M
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-8">
                {children}
            </main>
        </div>
    );
};
