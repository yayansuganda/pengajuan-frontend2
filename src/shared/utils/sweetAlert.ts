import Swal from 'sweetalert2';

export const showLoading = (title: string = 'Loading...') => {
    Swal.fire({
        title: title,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });
};

export const hideLoading = () => {
    Swal.close();
};

export const showSuccess = (message: string, title: string = 'Success') => {
    return Swal.fire({
        icon: 'success',
        title: title,
        text: message,
        timer: 1500,
        showConfirmButton: false,
    });
};

export const showError = (message: string, title: string = 'Error') => {
    return Swal.fire({
        icon: 'error',
        title: title,
        text: message,
    });
};

export const showWarning = (message: string, title: string = 'Warning') => {
    return Swal.fire({
        icon: 'warning',
        title: title,
        text: message,
    });
};

export const showConfirm = async (
    message: string,
    confirmButtonText: string = 'Yes',
    cancelButtonText: string = 'No',
    title: string = 'Are you sure?'
): Promise<boolean> => {
    const result = await Swal.fire({
        title: title,
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText,
    });

    return result.isConfirmed;
};
