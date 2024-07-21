import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3001";

/** API Class.
 *
 * Static class tying together methods used to get/send to to the API.
 */

export default class ProPulseApi {
  // the token for interaction with the API will be stored here.
  static token;

  static async request(endpoint, data = {}, headers = {}, method = "get") {
    //there are multiple ways to pass an authorization token, this is how you pass it in the header.
    //this has been provided to show you another way to pass the token. you are only expected to read this code for this project.
    const url = `${BASE_URL}/${endpoint}`;
    const params = method === "get" ? data : {};
    if (Object.keys(headers).length === 0) {
      headers = {
        Authorization: `Bearer ${ProPulseApi.token}`,
      };
    }

    try {
      return (await axios({ url, method, data, params, headers })).data;
    } catch (err) {
      let message = err.response.data.error.message;
      throw Array.isArray(message) ? message : [message];
    }
  }

  // Individual API routes

  static async registerUser(data) {
    let res = await this.request("auth/register", data, {}, "post");
    return res.token;
  }

  static async loginUser(data) {
    let res = await this.request("auth/login", data, {}, "post");
    return res.token;
  }

  static async getCurrentUser(id) {
    let res = await this.request(`users/${id}`);
    return res.user;
  }

  static async updateProfile(id, data) {
    let res = await this.request(`users/${id}`, data, {}, "patch");
    return res;
  }

  static async storeSubscription(id, data) {
    const headers = { "Content-Type": "application/json" };
    let res = await this.request(`push/subscribe/${id}`, data, headers, "post");
    console.log(res);
  }
}
