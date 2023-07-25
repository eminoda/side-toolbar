import * as VueRouter from 'vue-router'
import SiderBar from '@/views/SiderBar.vue'
import Search from '@/views/Search.vue'
import Win from '@/views/Win.vue'
import TabWin from '@/views/TabWin.vue'
import SubMenus from '@/views/SubMenus.vue'
import ScreenShot from '@/views/ScreenShot.vue'
import ScreenColor from '@/views/ScreenColor.vue'

const routes = [
    { path: '/', redirect: '/siderBar' },
    { path: '/siderBar', component: SiderBar },
    { path: '/search', component: Search },
    { path: '/win', component: Win },
    { path: '/tabWin', component: TabWin },
    { path: '/subMenus', component: SubMenus },
    { path: '/screenShot', component: ScreenShot },
    { path: '/ScreenColor', component: ScreenColor },
]

const router = VueRouter.createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: VueRouter.createWebHistory(),
    routes, // `routes: routes` 的缩写
})

export default router 