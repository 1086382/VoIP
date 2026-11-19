import axios from 'axios'
import { cookies } from '../../browser-services'
import { combineURLs } from '../../helper'

/**
 * Service to call HTTP request via Axios
 */
const ApiService = {
  init () {
    // eslint-disable-next-line no-unused-vars
    var baseurl2 = ''
    var baseUrl = window.location.origin
    if (baseUrl === 'http://localhost:8080') {
      baseurl2 = 'http://localhost:3000'
    }
    console.log(baseurl2)
    axios.defaults.baseURL = combineURLs(baseurl2, '/api')
  },

  /**
   * Set the default HTTP request headers
   */
  setHeader () {
    // eslint-disable-next-line standard/computed-property-even-spacing
    axios.defaults.headers.common[
      'Cache-Control'
    // eslint-disable-next-line camelcase
    ] = 'no-cache'
    // eslint-disable-next-line camelcase
    var access_token = cookies.get('access_token')
    // eslint-disable-next-line standard/computed-property-even-spacing
    axios.defaults.headers.common[
      'token'
    // eslint-disable-next-line camelcase
    ] = `${access_token}`
  },

  query (resource, params) {
    return axios.get(resource, params).catch(error => {
      console.log(error)
      throw new Error(`ApiService ${error}`)
    })
  },

  /**
   * Send the GET HTTP request
   * @param resource
   * @param slug
   * @returns {*}
   */
  get (resource, slug = '') {
    return axios.get(`${resource}/${slug}`).catch(error => {
      // console.log(error);
      throw new Error(`ApiService ${error}`)
    })
  },

  /**
   * Set the POST HTTP request
   * @param resource
   * @param params
   * @returns {*}
   */
  post (url, params) {
    return axios.post(`${url}`, params)
  },

  /**
   * Send the UPDATE HTTP request
   * @param resource
   * @param slug
   * @param params
   * @returns {IDBRequest<IDBValidKey> | Promise<void>}
   */
  update (resource, slug, params) {
    return axios.put(`${resource}/${slug}`, params)
  },

  /**
   * Send the PUT HTTP request
   * @param resource
   * @param params
   * @returns {IDBRequest<IDBValidKey> | Promise<void>}
   */
  put (resource, params) {
    return axios.put(`${resource}`, params)
  },

  /**
   * Send the DELETE HTTP request
   * @param resource
   * @returns {*}
   */
  delete (resource) {
    return axios.delete(resource).catch(error => {
      // console.log(error);
      throw new Error(`[RWV] ApiService ${error}`)
    })
  }
}

export default ApiService
