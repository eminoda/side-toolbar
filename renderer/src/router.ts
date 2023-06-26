import * as VueRouter from 'vue-router'
import SiderBar from '@/views/SiderBar.vue'
import Home from '@/views/Home.vue'
import Win from '@/views/Win.vue'
const routes = [
    { path: '/', redirect: '/siderBar' },
    { path: '/siderBar', component: SiderBar },
    { path: '/win', component: Win },
    { path: '/Home', component: Home },
]

const router = VueRouter.createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: VueRouter.createWebHistory(),
    routes, // `routes: routes` 的缩写
})

export default router 