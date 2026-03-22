import api from "./api";

export async function createOrder({ userEmail, items, token }) {
  const res = await api.post("/api/orders", { userEmail, items }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function fetchUserOrders(email, token) {
  const res = await api.get(`/api/orders/user/${encodeURIComponent(email)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function fetchAllOrders({ token }) {
  const res = await api.get("/api/orders", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function updateOrderStatus({ token, id, status }) {
  const res = await api.put(`/api/orders/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
}

