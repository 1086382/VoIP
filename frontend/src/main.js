import { createApp } from 'vue'
import {
  createBootstrap, BButton, BDropdown, BDropdownDivider, BDropdownItemButton,
  BFormCheckbox, BFormGroup, BFormInput, BFormRadioGroup, BInputGroup,
  BInputGroupText, BModal, BOffcanvas, BTabs, BTab,
  vBModal, vBToggle, vBTooltip,
} from 'bootstrap-vue-next'
import axios from 'axios'
import VSelect from 'vue-select'
import App from './App.vue'
import router from './router'
import store from './core/services/store'
import ApiService from './core/services/api.service'
import { cookies, swal, moment } from './browser-services'
import AppIcon from './components/AppIcon.vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'vue-select/dist/vue-select.css'
import 'sweetalert2/dist/sweetalert2.min.css'
import './assets/css/main.css'

window.axios = axios
ApiService.init()

const app = createApp(App)
app.use(router)
app.use(store)
app.use(createBootstrap())
for (const [name, component] of Object.entries({
  BButton, BDropdown, BDropdownDivider, BDropdownItemButton, BFormCheckbox, BFormGroup,
  BFormInput, BFormRadioGroup, BInputGroup, BInputGroupText, BModal, BOffcanvas, BTabs,
  BTab, BIcon: AppIcon,
})) {
  app.component(name, component)
}
app.directive('b-modal', vBModal)
app.directive('b-toggle', vBToggle)
app.directive('b-tooltip', vBTooltip)
app.component('VSelect', VSelect)
app.config.globalProperties.$cookie = cookies
app.config.globalProperties.$swal = swal
app.config.globalProperties.$moment = moment
app.mount('#app')
