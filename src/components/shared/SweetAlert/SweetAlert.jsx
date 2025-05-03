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
    allowOutsideClick: true, // Allow clicking outside to close
    ...options,
  });
};

// Success alert with predefined styling
// Supports both (title, text) and (options) parameter styles
export const showSuccessAlert = (titleOrOptions, text) => {
  // Handle both parameter styles
  if (typeof titleOrOptions === "object") {
    return showAlert({
      icon: "success",
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: true,
      confirmButtonText: "OK",
      ...titleOrOptions,
    });
  } else {
    return showAlert({
      title: titleOrOptions,
      text: text,
      icon: "success",
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: true,
      confirmButtonText: "OK",
    });
  }
};

// Error alert with predefined styling
// Supports both (title, text) and (options) parameter styles
export const showErrorAlert = (titleOrOptions, text) => {
  // Handle both parameter styles
  if (typeof titleOrOptions === "object") {
    return showAlert({
      icon: "error",
      showConfirmButton: true,
      confirmButtonText: "OK",
      ...titleOrOptions,
    });
  } else {
    return showAlert({
      title: titleOrOptions,
      text: text,
      icon: "error",
      showConfirmButton: true,
      confirmButtonText: "OK",
    });
  }
};

// Info alert with predefined styling
// Supports both (title, text) and (options) parameter styles
export const showInfoAlert = (titleOrOptions, text) => {
  // Handle both parameter styles
  if (typeof titleOrOptions === "object") {
    return showAlert({
      icon: "info",
      showConfirmButton: true,
      confirmButtonText: "OK",
      ...titleOrOptions,
    });
  } else {
    return showAlert({
      title: titleOrOptions,
      text: text,
      icon: "info",
      showConfirmButton: true,
      confirmButtonText: "OK",
    });
  }
};

// Warning alert with predefined styling
// Supports both (title, text) and (options) parameter styles
export const showWarningAlert = (titleOrOptions, text) => {
  // Handle both parameter styles
  if (typeof titleOrOptions === "object") {
    return showAlert({
      icon: "warning",
      showConfirmButton: true,
      confirmButtonText: "OK",
      ...titleOrOptions,
    });
  } else {
    return showAlert({
      title: titleOrOptions,
      text: text,
      icon: "warning",
      showConfirmButton: true,
      confirmButtonText: "OK",
    });
  }
};

// Loading alert with auto-close when promise resolves
export const showLoadingAlert = (titleOrOptions, text) => {
  // Handle both parameter styles
  if (typeof titleOrOptions === "object") {
    return showAlert({
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
      ...titleOrOptions,
    });
  } else {
    return showAlert({
      title: titleOrOptions,
      text: text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }
};

// Celebration alert with confetti effect
export const showCelebrationAlert = (options) => {
  // Create confetti container if it doesn't exist
  let confettiContainer = document.querySelector(".confetti-container");
  if (!confettiContainer) {
    confettiContainer = document.createElement("div");
    confettiContainer.classList.add("confetti-container");
    document.body.appendChild(confettiContainer);
  } else {
    // Clear existing confetti
    confettiContainer.innerHTML = "";
  }

  // Generate confetti pieces
  const colors = [
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
  ];
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    confettiContainer.appendChild(confetti);
  }

  // Remove confetti after animation completes (fallback)
  const confettiCleanup = () => {
    if (confettiContainer) confettiContainer.innerHTML = "";
  };
  setTimeout(confettiCleanup, 5000);

  // Show the celebration alert
  return showSuccessAlert({
    title: options.title || "Congratulations!",
    text: options.text || "You did it!",
    icon: "success",
    timer: options.timer || 3000,
    timerProgressBar: true,
    showConfirmButton:
      options.showConfirmButton !== undefined
        ? options.showConfirmButton
        : true,
    confirmButtonText: "OK",
    allowOutsideClick: true,
    customClass: {
      ...options.customClass,
      container: "xlingo-swal-container correct-alert",
    },
    didOpen: (toast) => {
      // Play celebration sound if provided
      if (options.sound) {
        const audio = new Audio(options.sound);
        audio.play().catch((e) => console.warn("Audio play error:", e));
      }

      // Add animation to the toast
      toast.style.animation = "pulseSuccess 0.5s ease";

      // Run custom open callback if provided
      if (options.didOpen) {
        options.didOpen(toast);
      }
    },
    willClose: confettiCleanup, // Ensure confetti is always cleaned up
  });
};

// Special streak celebration alert with enhanced confetti and animation
export const showStreakCelebrationAlert = (options) => {
  // Configure default options
  const config = {
    streakCount: 1,
    title: "Streak Achievement!",
    text: "Keep up the good work!",
    confettiCount: 150,
    timer: 4000,
    ...options,
  };

  // Create confetti container
  let confettiContainer = document.querySelector(".confetti-container");
  if (!confettiContainer) {
    confettiContainer = document.createElement("div");
    confettiContainer.classList.add("confetti-container");
    document.body.appendChild(confettiContainer);
  } else {
    confettiContainer.innerHTML = "";
  }

  // Generate themed confetti based on streak level
  const streakLevel = Math.min(Math.floor(config.streakCount / 5) + 1, 5); // Caps at level 5
  const colors = ["#FFD700", "#FFA500", "#FF4500", "#FF0000", "#9400D3"].slice(
    0,
    streakLevel
  );

  // Add streak-specific shapes
  const shapes = ["circle", "square", "triangle", "star"];

  for (let i = 0; i < config.confettiCount; i++) {
    const confetti = document.createElement("div");

    // Randomly select between circle or shaped confetti
    const isSpecialShape = Math.random() > 0.6;

    if (isSpecialShape && config.streakCount >= 5) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      confetti.classList.add("confetti", shape);
    } else {
      confetti.classList.add("confetti");
    }

    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];

    // Add special glitter effect for higher streaks
    if (config.streakCount >= 10) {
      confetti.classList.add("glitter");
    }

    confettiContainer.appendChild(confetti);
  }

  // Remove confetti after animation (fallback)
  const confettiCleanup = () => {
    if (confettiContainer) confettiContainer.innerHTML = "";
  };
  setTimeout(confettiCleanup, 6000);

  // Build dynamic content based on streak level
  const streakIcon =
    config.streakCount >= 10
      ? '<div class="streak-icon gold-streak">🔥</div>'
      : '<div class="streak-icon">🔥</div>';

  const streakCountHtml = `<div class="streak-count">${config.streakCount}</div>`;

  // Create HTML content
  const htmlContent = `
    <div class="streak-container">
      ${streakIcon}
      ${streakCountHtml}
      <div class="streak-message">${config.text}</div>
    </div>
  `;

  // Show the celebration alert
  return showAlert({
    title: config.title,
    html: htmlContent,
    icon: false,
    timer: config.timer,
    timerProgressBar: true,
    showConfirmButton:
      config.showConfirmButton !== undefined ? config.showConfirmButton : true,
    confirmButtonText: "OK",
    allowOutsideClick: true,
    customClass: {
      ...config.customClass,
      container: "xlingo-swal-container streak-alert",
      popup: "xlingo-swal-popup streak-popup",
    },
    didOpen: (toast) => {
      // Play celebration sound
      if (config.sound) {
        const audio = new Audio(config.sound);
        audio.play().catch((e) => console.warn("Audio play error:", e));
      }

      // Add animation
      toast.style.animation = "bounceIn 0.8s ease";

      // Run custom open callback if provided
      if (config.didOpen) {
        config.didOpen(toast);
      }
    },
    willClose: confettiCleanup, // Ensure confetti is always cleaned up
  });
};

// Continuation prompt dialog
export const showContinuationPrompt = (options = {}) => {
  const config = {
    title: "Continue to iterate?",
    text: "Would you like to continue with your language learning journey?",
    confirmButtonText: "Yes, continue!",
    cancelButtonText: "Not now",
    ...options,
  };

  return showAlert({
    title: config.title,
    text: config.text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: config.confirmButtonText,
    cancelButtonText: config.cancelButtonText,
    allowOutsideClick: true,
    customClass: {
      container: "xlingo-swal-container continuation-alert",
      popup: "xlingo-swal-popup continuation-popup",
      ...config.customClass,
    },
    didOpen: (toast) => {
      toast.style.animation = "floatAlert 0.5s ease";

      if (config.didOpen) {
        config.didOpen(toast);
      }
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

const SweetAlertConfig = {
  showAlert,
  showSuccessAlert,
  showErrorAlert,
  closeAlert,
  withLoading
};

export default SweetAlertConfig;
