import { api } from "./api";

export const imagemService = {
  upload: async (file: File) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post("/api/imagens/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
};
