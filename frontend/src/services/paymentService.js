import api from "../api/axios";

// POST /payments - { bookingId, paymentMethod }
// paymentMethod must be one of CARD | UPI | NET_BANKING | WALLET
// idempotencyKey is sent as a header so retried requests for the same
// checkout attempt don't create duplicate payments.
export async function createPayment(bookingId, paymentMethod, idempotencyKey) {
  const { data } = await api.post(
    "/payments",
    { bookingId, paymentMethod },
    { headers: { "Idempotency-Key": idempotencyKey } }
  );
  return data.data;
}

// POST /payments/:id/pay - { transactionId }
export async function payForBooking(paymentId, transactionId) {
  const { data } = await api.post(`/payments/${paymentId}/pay`, {
    transactionId,
  });
  return data.data;
}

// POST /payments/:id/refund
export async function refundPayment(paymentId) {
  const { data } = await api.post(`/payments/${paymentId}/refund`);
  return data.data;
}

// GET /payments/booking/:bookingId
export async function getPaymentByBooking(bookingId) {
  const { data } = await api.get(`/payments/booking/${bookingId}`);
  return data.data;
}

// GET /payments/:id
export async function getPaymentById(id) {
  const { data } = await api.get(`/payments/${id}`);
  return data.data;
}

// GET /payments (ADMIN)
export async function getAllPayments() {
  const { data } = await api.get("/payments");
  return data.data;
}