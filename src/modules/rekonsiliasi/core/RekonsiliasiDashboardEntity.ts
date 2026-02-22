export interface RekonsiliasiStatusCount {
    status: string;
    count: number;
    amount: number;
}

export interface RekonsiliasiRegionalCount {
    regional: string;
    kcu_name: string;
    count: number;
    amount: number;
}

export interface RekonsiliasiMonthlyCount {
    month: string;
    count: number;
    amount: number;
    dicairkan: number;
    ditolak: number;
    pending: number;
    selesai: number;
    disetujui: number;
    amount_dicairkan: number;
}

export interface RekonsiliasiRegionalStatus {
    regional: string;
    dicairkan: number;
    disetujui: number;
    proses: number;
    ditolak: number;
    selesai: number;
    total: number;
}

export interface RekonsiliasiStats {
    total_pos: number;
    total_amount: number;
    total_dicairkan: number;
    amount_dicairkan: number;
    total_ditolak: number;
    total_proses: number;
    total_selesai: number;
    avg_amount: number;
    by_status: RekonsiliasiStatusCount[];
    by_regional: RekonsiliasiRegionalCount[];
    by_month: RekonsiliasiMonthlyCount[];
    by_regional_status: RekonsiliasiRegionalStatus[];
}

export interface RekonsiliasiFilterOptions {
    regionals: string[];
    kcu_list: string[];
}
