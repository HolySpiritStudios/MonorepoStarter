export const mapUnauthorizedMessage = (message?: string) => {
  if (!message) {
    return false;
  }

  return message.toLowerCase().includes('unauthorized') || message.includes('401');
};
