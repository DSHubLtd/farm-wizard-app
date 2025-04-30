export const validateForm = (fields) => {
  const errors = {};

  // Full Name
  if (!fields.fullName?.trim()) {
    errors.fullName = "Full Name is required";
  }

  // Email
  if (!fields.email?.includes("@") || !/\S+@\S+\.\S+/.test(fields.email)) {
    errors.email = "Enter a valid email address";
  }

  // Password
  if (!fields.password || fields.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  // Confirm Password
  if (fields.cpassword !== fields.password) {
    errors.cpassword = "Passwords do not match";
  }

  // Language
  if (!fields.selectedLanguage) {
    errors.language = "Please select a language";
  }

  // Country
  if (!fields.selectedCountry) {
    errors.country = "Please select a country";
  }

  const isValid = Object.keys(errors).length === 0;

  return { isValid, errors };
};
