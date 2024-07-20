import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_REACT_APP_BASE_URL || "http://localhost:3001";

/** API Class.
 *
 * Static class tying together methods used to get/send to to the API.
 */

export default class ProPulseApi {
  // the token for interaction with the API will be stored here.
  static token;

  static async request(endpoint, data = {}, method = "get") {
    //there are multiple ways to pass an authorization token, this is how you pass it in the header.
    //this has been provided to show you another way to pass the token. you are only expected to read this code for this project.
    const url = `${BASE_URL}/${endpoint}`;
    const headers = { Authorization: `Bearer ${ProPulseApi.token}` };
    const params = method === "get" ? data : {};

    try {
      return (await axios({ url, method, data, params, headers })).data;
    } catch (err) {
      let message = err.response.data.error.message;
      throw Array.isArray(message) ? message : [message];
    }
  }

  // Individual API routes

  static async registerUser(data) {
    let res = await this.request("auth/register", data, "post");
    return res.token;
  }

  static async loginUser(data) {
    let res = await this.request("auth/login", data, "post");
    return res.token;
  }

  static async getCurrentUser(id) {
    let res = await this.request(`users/${id}`);
    return res.user;
  }

  static async updateProfile(id, data) {
    let res = await this.request(`users/${id}`, data, "patch");
    return res;
  }
}

/*for now, put token:
{
   "id": 1,
   "email": "test@email.com",
   "message": "The user is not associated with any projects"
}*/

ProPulseApi.token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGVtYWlsLmNvbSIsIm1lc3NhZ2UiOiJUaGUgdXNlciBpcyBub3QgYXNzb2NpYXRlZCB3aXRoIGFueSBwcm9qZWN0cyJ9.50HjOUcM4lTodV-za-hGHh0cbbDRuq8uC9Gv9jxg_qI";
