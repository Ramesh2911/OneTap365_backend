export const isValidPhone = (phone) => {
  const phoneRegex = /^(91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const isValidEmail = (email) => {
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
