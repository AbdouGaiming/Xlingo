import Swal from "sweetalert2";
import "./SweetAlert.scss";

// Custom-themed SweetAlert utility for Xlingo
export const showAlert = (options) => {
  return Swal.fire({
    customClass: {
      container: "xlingo-swal-container",
      popup: "xlingo-swal-popup",
      title: "xlingo-swal-title",
      confirmButton: "xlingo-swal-confirm-button",
      cancelButton: "xlingo-swal-cancel-button",
    },
    buttonsStyling: false,
    ...options,
  });
};

// Success alert with predefined styling
export const showSuccessAlert = (title, text) => {
  return showAlert({
    title: title,
    text: text,
    icon: "success",
    timer: 3000,
    timerProgressBar: true,
  });
};

// Error alert with predefined styling
export const showErrorAlert = (title, text) => {
  return showAlert({
    title: title,
    text: text,
    icon: "error",
  });
};

// Info alert with predefined styling
export const showInfoAlert = (title, text) => {
  return showAlert({
    title: title,
    text: text,
    icon: "info",
  });
};

// Warning alert with predefined styling
export const showWarningAlert = (title, text) => {
  return showAlert({
    title: title,
    text: text,
    icon: "warning",
  });
};

// Loading alert with auto-close when promise resolves
export const showLoadingAlert = (title, text) => {
  return showAlert({
    title: title,
    text: text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// Close any open Sweet Alert
export const closeAlert = () => {
  Swal.close();
};

// Show loading and auto-close when promise resolves
export const withLoading = async (promise, options = {}) => {
  const { loadingTitle = "Processing", loadingText = "Please wait..." } =
    options;

  showLoadingAlert(loadingTitle, loadingText);

  try {
    const result = await promise;
    closeAlert();
    return result;
  } catch (error) {
    closeAlert();
    throw error;
  }
};

export default {
  showAlert,
  showSuccessAlert,
  showErrorAlert,
  showInfoAlert,
  showWarningAlert,
  showLoadingAlert,
  closeAlert,
  withLoading,
};
