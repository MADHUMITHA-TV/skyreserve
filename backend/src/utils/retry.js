export const retry = async (
  fn,
  retries = 3,
  delay = 100
) => {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (i < retries - 1) {
        await new Promise(resolve =>
          setTimeout(resolve, delay)
        );

        delay *= 2; // Exponential backoff
      }
    }
  }

  throw lastError;
};