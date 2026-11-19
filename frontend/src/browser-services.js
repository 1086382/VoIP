import Cookies from 'js-cookie'
import Swal from 'sweetalert2'
export { default as moment } from 'moment'

const cookieOptions = { sameSite: 'lax', secure: window.location.protocol === 'https:' }

export const cookies = {
  get: name => Cookies.get(name) ?? null,
  set: (name, value, days) => Cookies.set(name, value, { ...cookieOptions, expires: days }),
  delete: name => Cookies.remove(name, cookieOptions),
}

export const swal = Object.assign((...args) => Swal.fire(...args), {
  fire: (...args) => Swal.fire(...args),
  isLoading: () => Swal.isLoading(),
  showValidationMessage: message => Swal.showValidationMessage(message),
})
