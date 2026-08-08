const API = {
  async request(
    url,
    options = {}
  ) {
    const token =
      localStorage.getItem(
        "analyzer_token"
      );

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    if (token) {
      headers.Authorization =
        `Bearer ${token}`;
    }

    const response =
      await fetch(url, {
        ...options,
        headers
      });

    let data = {};

    try {
      data = await response.json();
    } catch (_) {
      data = {};
    }

    if (
      response.status === 401
    ) {
      localStorage.removeItem(
        "analyzer_token"
      );

      if (
        !location.pathname.includes(
          "index.html"
        )
      ) {
        location.href = "/";
      }
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
        "Request failed."
      );
    }

    return data;
  },

  get(url) {
    return this.request(url);
  },

  post(url, body) {
    return this.request(url, {
      method: "POST",
      body: JSON.stringify(body)
    });
  },

  patch(url, body) {
    return this.request(url, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
  },

  delete(url) {
    return this.request(url, {
      method: "DELETE"
    });
  }
};