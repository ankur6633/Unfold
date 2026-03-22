import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

export const showSuccess = (title, text = "") => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonColor: '#2563eb', // blue-600
    background: '#ffffff',
    customClass: {
      popup: 'rounded-[2rem]',
      confirmButton: 'rounded-full px-6 py-2 font-bold uppercase tracking-widest text-sm'
    }
  });
};

export const showError = (title, text = "") => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonColor: '#ef4444', // red-500
    background: '#ffffff',
    customClass: {
      popup: 'rounded-[2rem]',
      confirmButton: 'rounded-full px-6 py-2 font-bold uppercase tracking-widest text-sm'
    }
  });
};

export const showToast = (title, icon = 'success') => {
  return Toast.fire({
    icon,
    title
  });
};

export const showConfirm = (title, text, confirmButtonText = 'Yes, Proceed') => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#d33',
    confirmButtonText,
    background: '#ffffff',
    customClass: {
      popup: 'rounded-[2rem]',
      confirmButton: 'rounded-full px-6 py-2 font-bold uppercase tracking-widest text-sm',
      cancelButton: 'rounded-full px-6 py-2 font-bold uppercase tracking-widest text-sm'
    }
  });
};
