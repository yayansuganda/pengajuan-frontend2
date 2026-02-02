'use client';

import React, { useState } from 'react';
import { MobileLayoutWrapper } from '@/modules/pengajuan/presentation/components/MobileLayoutWrapper';
import { Calculator, TrendingUp, Calendar, Percent, DollarSign } from 'lucide-react';

export default function SimulasiPage() {
    const [loanAmount, setLoanAmount] = useState<string>(''); // Raw value for calculation
    const [displayLoanAmount, setDisplayLoanAmount] = useState<string>(''); // Formatted value for display
    const [interestRate, setInterestRate] = useState<string>('');
    const [loanTerm, setLoanTerm] = useState<string>('');
    const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
    const [totalPayment, setTotalPayment] = useState<number | null>(null);
    const [totalInterest, setTotalInterest] = useState<number | null>(null);

    // Format number with thousand separator
    const formatNumber = (value: string): string => {
        // Remove all non-digit characters
        const number = value.replace(/\D/g, '');
        if (!number) return '';
        // Add thousand separator
        return new Intl.NumberFormat('id-ID').format(parseInt(number));
    };

    // Handle loan amount input change
    const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        // Remove all non-digit characters to get raw value
        const rawValue = inputValue.replace(/\D/g, '');
        setLoanAmount(rawValue);
        setDisplayLoanAmount(formatNumber(rawValue));
    };

    const calculateLoan = () => {
        const principal = parseFloat(loanAmount);
        const rate = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
        const months = parseInt(loanTerm);

        if (principal > 0 && rate > 0 && months > 0) {
            // Calculate monthly payment using formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
            const x = Math.pow(1 + rate, months);
            const monthly = (principal * rate * x) / (x - 1);
            const total = monthly * months;
            const interest = total - principal;

            setMonthlyPayment(monthly);
            setTotalPayment(total);
            setTotalInterest(interest);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const resetForm = () => {
        setLoanAmount('');
        setDisplayLoanAmount('');
        setInterestRate('');
        setLoanTerm('');
        setMonthlyPayment(null);
        setTotalPayment(null);
        setTotalInterest(null);
    };

    return (
        <MobileLayoutWrapper showBackground={true}>
            {/* Mobile Layout */}
            <div className="md:hidden">
                {/* Header */}
                <div className="relative z-10 pt-10 px-4 pb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Calculator className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white drop-shadow-lg">Simulasi Pinjaman</h1>
                            <p className="text-xs text-white/90 drop-shadow">Hitung cicilan pinjaman Anda</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="relative z-10 px-4 space-y-4">
                    {/* Input Form Card */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-5 border border-white">
                        <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            Data Pinjaman
                        </h2>

                        <div className="space-y-4">
                            {/* Loan Amount */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Jumlah Pinjaman (Rp)
                                </label>
                                <input
                                    type="text"
                                    value={displayLoanAmount}
                                    onChange={handleLoanAmountChange}
                                    placeholder="Contoh: 10.000.000"
                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>

                            {/* Interest Rate */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Suku Bunga (% per tahun)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(e.target.value)}
                                    placeholder="Contoh: 12"
                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>

                            {/* Loan Term */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Jangka Waktu (bulan)
                                </label>
                                <input
                                    type="number"
                                    value={loanTerm}
                                    onChange={(e) => setLoanTerm(e.target.value)}
                                    placeholder="Contoh: 12"
                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={calculateLoan}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30"
                                >
                                    <Calculator className="w-4 h-4 inline mr-2" />
                                    Hitung
                                </button>
                                <button
                                    onClick={resetForm}
                                    className="px-4 py-3 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Card */}
                    {monthlyPayment !== null && (
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-5 border border-white">
                            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                                Hasil Simulasi
                            </h2>

                            <div className="space-y-3">
                                {/* Monthly Payment */}
                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-emerald-600" />
                                            <span className="text-xs font-medium text-slate-600">Cicilan per Bulan</span>
                                        </div>
                                    </div>
                                    <p className="text-lg font-bold text-emerald-700 mt-1">
                                        {formatCurrency(monthlyPayment)}
                                    </p>
                                </div>

                                {/* Total Payment */}
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-slate-600">Total Pembayaran</span>
                                        <span className="text-sm font-bold text-slate-800">
                                            {formatCurrency(totalPayment!)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-600">Total Bunga</span>
                                        <span className="text-sm font-bold text-orange-600">
                                            {formatCurrency(totalInterest!)}
                                        </span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                                    <p className="text-[10px] text-blue-800 leading-relaxed">
                                        💡 <strong>Catatan:</strong> Hasil simulasi ini bersifat estimasi dan dapat berbeda dengan perhitungan aktual.
                                        Silakan hubungi petugas untuk informasi lebih detail.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:block max-w-4xl mx-auto py-8 px-4">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Calculator className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Simulasi Pinjaman</h1>
                            <p className="text-sm text-slate-600">Hitung estimasi cicilan pinjaman Anda</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Input Section */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Data Pinjaman</h2>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Jumlah Pinjaman (Rp)
                                </label>
                                <input
                                    type="text"
                                    value={displayLoanAmount}
                                    onChange={handleLoanAmountChange}
                                    placeholder="Contoh: 10.000.000"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Suku Bunga (% per tahun)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(e.target.value)}
                                    placeholder="Contoh: 12"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Jangka Waktu (bulan)
                                </label>
                                <input
                                    type="number"
                                    value={loanTerm}
                                    onChange={(e) => setLoanTerm(e.target.value)}
                                    placeholder="Contoh: 12"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={calculateLoan}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg"
                                >
                                    <Calculator className="w-5 h-5 inline mr-2" />
                                    Hitung
                                </button>
                                <button
                                    onClick={resetForm}
                                    className="px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Results Section */}
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Hasil Simulasi</h2>

                            {monthlyPayment !== null ? (
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-5 h-5 text-emerald-600" />
                                            <span className="text-sm font-medium text-slate-600">Cicilan per Bulan</span>
                                        </div>
                                        <p className="text-3xl font-bold text-emerald-700">
                                            {formatCurrency(monthlyPayment)}
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-600">Total Pembayaran</span>
                                            <span className="text-lg font-bold text-slate-800">
                                                {formatCurrency(totalPayment!)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-600">Total Bunga</span>
                                            <span className="text-lg font-bold text-orange-600">
                                                {formatCurrency(totalInterest!)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                        <p className="text-xs text-blue-800 leading-relaxed">
                                            💡 <strong>Catatan:</strong> Hasil simulasi ini bersifat estimasi dan dapat berbeda dengan perhitungan aktual.
                                            Silakan hubungi petugas untuk informasi lebih detail.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-8">
                                    <div className="text-center">
                                        <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-sm text-slate-500">Masukkan data dan klik tombol Hitung</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MobileLayoutWrapper>
    );
}
