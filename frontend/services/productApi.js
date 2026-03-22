import api from "./api";

export async function fetchProducts() {
  const res = await api.get("/api/products");
  return res.data;
}

export async function createProduct({ token, name, price, imageFile }) {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("price", price);
  formData.append("image", imageFile);

  const res = await api.post("/api/products", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      // Let axios/browser set correct multipart boundary.
      "Content-Type": undefined,
    },
  });
  return res.data;
}

export async function deleteProduct({ token, id }) {
  const res = await api.delete(`/api/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

