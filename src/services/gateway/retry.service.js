export const retryRequest = async ({
  loadBalancer,
  request,
  maxRetries = 2,
}) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let target;

    try {
      target = loadBalancer.next();
    } catch (error) {
      throw error;
    }

    try {
      return await request(target);
    } catch (error) {
      lastError = error;

      loadBalancer.markUnhealthy(target);
    }
  }

  throw lastError;
};