const delay = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );

export async function login(data) {

  await delay(1200);

  if (
    data.email === "admin@skyreserve.com" &&
    data.password === "Password@123"
  ) {
    return {
      success: true,
      data: {
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        user: {
          id: 1,
          firstName: "Madhu",
          lastName: "TV",
          email: data.email,
          role: "USER",
        },
      },
    };
  }

  throw {
    response: {
      data: {
        message: "Invalid email or password",
      },
    },
  };

}