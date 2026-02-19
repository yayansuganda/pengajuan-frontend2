export interface Setting {
    id: string;
    batas_usia_perhitungan_lunas: number;
    jasa_perbulan: number;
    mikro_jangka_waktu: number; // NEW
    mikro_maksimal_pembiayaan: number; // NEW
    makro_jangka_waktu: number; // NEW
    makro_maksimal_pembiayaan: number; // NEW
    description?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface CreateSettingDTO {
    batas_usia_perhitungan_lunas: number;
    jasa_perbulan: number;
    mikro_jangka_waktu: number; // NEW
    mikro_maksimal_pembiayaan: number; // NEW
    makro_jangka_waktu: number; // NEW
    makro_maksimal_pembiayaan: number; // NEW
    description?: string;
}

export interface UpdateSettingDTO {
    batas_usia_perhitungan_lunas: number;
    jasa_perbulan: number;
    mikro_jangka_waktu: number; // NEW
    mikro_maksimal_pembiayaan: number; // NEW
    makro_jangka_waktu: number; // NEW
    makro_maksimal_pembiayaan: number; // NEW
    description?: string;
}
