/**
 * Error Handler Utility
 * Mengubah error dari backend menjadi pesan yang lebih user-friendly
 */

interface ErrorResponse {
    error?: string;
    message?: string;
    details?: string;
}

/**
 * Mengekstrak field name dari constraint error
 * Contoh: "users_username_key" -> "Username"
 */
function extractFieldFromConstraint(constraint: string): string {
    // Format: table_field_key atau table_field_idx
    const parts = constraint.split('_');

    if (parts.length >= 2) {
        // Ambil field name (biasanya di posisi kedua)
        const field = parts[1];

        // Mapping field ke label yang lebih friendly
        const fieldMapping: Record<string, string> = {
            'username': 'Username',
            'nip': 'NIP',
            'code': 'Kode',
            'name': 'Nama',
            'email': 'Email',
            'phone': 'Nomor Telepon',
            'nik': 'NIK',
        };

        return fieldMapping[field] || field.charAt(0).toUpperCase() + field.slice(1);
    }

    return 'Data';
}

/**
 * Mengubah error message dari backend menjadi user-friendly
 */
export function parseErrorMessage(error: any): string {
    // Default error message
    let errorMessage = 'Terjadi kesalahan pada sistem';

    try {
        // Cek apakah ada response dari backend
        if (error.response?.data) {
            const responseData: ErrorResponse = error.response.data;
            const rawMessage = responseData.error || responseData.message || '';

            // Handle duplicate key violation
            if (rawMessage.includes('duplicate key value violates unique constraint')) {
                // Extract constraint name
                const constraintMatch = rawMessage.match(/"([^"]+)"/);
                const constraint = constraintMatch ? constraintMatch[1] : '';

                const fieldName = extractFieldFromConstraint(constraint);
                errorMessage = `${fieldName} sudah digunakan. Silakan gunakan ${fieldName.toLowerCase()} yang berbeda.`;
            }
            // Handle foreign key violation
            else if (rawMessage.includes('violates foreign key constraint')) {
                errorMessage = 'Data tidak dapat dihapus karena masih digunakan oleh data lain.';
            }
            // Handle not null violation
            else if (rawMessage.includes('violates not-null constraint')) {
                const constraintMatch = rawMessage.match(/"([^"]+)"/);
                const constraint = constraintMatch ? constraintMatch[1] : '';
                const fieldName = extractFieldFromConstraint(constraint);
                errorMessage = `${fieldName} harus diisi.`;
            }
            // Handle check constraint violation
            else if (rawMessage.includes('violates check constraint')) {
                errorMessage = 'Data yang dimasukkan tidak valid.';
            }
            // Handle invalid input syntax
            else if (rawMessage.includes('invalid input syntax')) {
                errorMessage = 'Format data tidak valid.';
            }
            // Handle authentication errors
            else if (rawMessage.includes('invalid credentials') || rawMessage.includes('unauthorized')) {
                errorMessage = 'Username atau password salah.';
            }
            // Handle permission errors
            else if (rawMessage.includes('permission denied') || rawMessage.includes('forbidden')) {
                errorMessage = 'Anda tidak memiliki akses untuk melakukan operasi ini.';
            }
            // Handle not found errors
            else if (rawMessage.includes('not found') || rawMessage.includes('does not exist')) {
                errorMessage = 'Data tidak ditemukan.';
            }
            // Handle validation errors
            else if (rawMessage.includes('validation')) {
                errorMessage = responseData.details || rawMessage;
            }
            // Use backend message if it's user-friendly (doesn't contain SQL or technical terms)
            else if (!rawMessage.includes('SQLSTATE') &&
                !rawMessage.includes('ERROR:') &&
                !rawMessage.includes('pq:') &&
                rawMessage.length < 200) {
                errorMessage = rawMessage;
            }

            // Append details if available and not already included
            if (responseData.details && !errorMessage.includes(responseData.details)) {
                errorMessage += ` ${responseData.details}`;
            }
        }
        // Handle network errors
        else if (error.message) {
            if (error.message.includes('Network Error')) {
                errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Permintaan timeout. Silakan coba lagi.';
            } else if (!error.message.includes('SQLSTATE') && error.message.length < 200) {
                errorMessage = error.message;
            }
        }
    } catch (parseError) {
        console.error('Error parsing error message:', parseError);
    }

    return errorMessage;
}

/**
 * Handle error dan return pesan yang user-friendly
 * Fungsi ini bisa digunakan di catch block
 */
export function handleError(error: any, defaultMessage: string = 'Terjadi kesalahan'): string {
    console.error('Error details:', {
        error,
        response: error.response,
        data: error.response?.data,
        status: error.response?.status,
    });

    return parseErrorMessage(error) || defaultMessage;
}
