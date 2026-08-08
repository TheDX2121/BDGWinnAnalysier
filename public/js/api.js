const API = {

  async request(
    url,
    options = {}
  ) {

    const headers = {
      "Content-Type":
        "application/json",

      ...(options.headers || {})
    };


    const response =
      await fetch(
        url,
        {
          ...options,
          headers
        }
      );


    let data = {};

    try {

      data =
        await response.json();

    } catch (_) {

      data = {};
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


  post(
    url,
    body
  ) {

    return this.request(
      url,
      {
        method: "POST",

        body:
          JSON.stringify(body)
      }
    );
  },


  patch(
    url,
    body
  ) {

    return this.request(
      url,
      {
        method: "PATCH",

        body:
          JSON.stringify(body)
      }
    );
  },


  delete(url) {

    return this.request(
      url,
      {
        method: "DELETE"
      }
    );
  }
};