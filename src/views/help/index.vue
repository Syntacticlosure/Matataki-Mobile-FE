<template>
  <div class="mw help">
    <BaseHeader :pageinfo="{ title: $t('setting') }" />
    <div class="help-block">
      <a class="help-list" href="https://matataki.io/p/1060" target="_blank">
        <span class="help-list-title">{{ $t('user.rule') }}</span>
        <img src="@/assets/img/icon_arrow.svg" alt="view" />
      </a>

      <a
        v-for="(item, index) in helpDoc"
        :key="index"
        class="help-list"
        target="_blank"
      >
        <span class="help-list-title">{{ item.title }}</span>
        <img src="@/assets/img/icon_arrow.svg" alt="view" />
      </a>
    </div>

    <div class="help-block">
      <div class="help-list">
        <span class="help-list-title">{{ $t('user.transfer') }}</span>
        <span class="help-list-sub">
          <van-switch
            v-model="articleTransfer"
            size="22px"
            active-color="#542de0"
            inactive-color="#F0F0F0"
            @change="changeTransfer"
          />
        </span>
      </div>


      <router-link
        class="help-list"
        :to="{name: 'setting-account'}"
      >
        <span class="help-list-title">{{ $t('helpPage.accountSetting') }}</span>
        <img src="@/assets/img/icon_arrow.svg" alt="view" />
      </router-link>
    </div>

    <div class="help-block">
      <a
        class="help-list"
        href="https://github.com/Matataki-io/Matataki-Mobile-FE"
        target="_blank"
      >
        <span class="help-list-title">{{ $t('user.about') }}</span>
        <div class="help-list-right">
          <span class="help-list-sub">{{ $t('user.github') }}</span>
          <img class="arrow" src="@/assets/img/icon_arrow.svg" alt="view" />
        </div>
      </a>
      <a class="help-list" href="https://www.matataki.io/p/1059" target="_blank">
        <span class="help-list-title">{{ $t('user.updateRecord') }}</span>
        <img class="arrow" src="@/assets/img/icon_arrow.svg" alt="view" />
      </a>
      <a class="help-list" href="https://t.me/smartsignature_io" target="_blank">
        <span class="help-list-title">{{ $t('user.tg') }}</span>
        <img class="arrow" src="@/assets/img/icon_arrow.svg" alt="view" />
      </a>
      <!--<div class="help-list">
        <span class="help-list-title">当前版本</span>
        <span class="help-list-sub">v2.3.2</span>
      </div>-->
    </div>

    <div class="help-block">
      <div class="help-list">
        <span class="help-list-title">夜间模式</span>
        <span class="help-list-sub">
          <van-switch
            v-model="siteViewMode"
            size="22px"
            active-color="#542de0"
            inactive-color="#F0F0F0"
            @change="changeViewMode"
          />
        </span>
      </div>
    </div>
    <div class="help-block">
      <div class="help-list" @click="clearCache">
        <span class="help-list-title">一键清除缓存</span>
        <img src="@/assets/img/icon_arrow.svg" alt="view" />
      </div>
    </div>
    <div class="signout">
      <p class="version">-version{{ version || '1.0.0' }}-</p>
    </div>
  </div>
</template>

<script>
import store from '@/utils/store.js'
import packageConfig from '../../../package.json'
import { removeCookie, clearAllCookie } from '@/utils/cookie'
// import {
//   enable as enableDarkMode,
//   disable as disableDarkMode,
// } from 'darkreader'
export default {
  naem: 'Help',
  data() {
    return {
      articleTransfer: false,
      siteViewMode: false,
      // 隐私政策与用户协议
      helpDoc: [
        {
          title: this.$t('user.userProtocol'),
          name: 'agreement'
        },
        {
          title: this.$t('user.privacyPolicy'),
          name: 'policy'
        }
      ]
    }
  },
  computed: {
    version() {
      return packageConfig.version
    }
  },
  created() {
    this.getMyUserData()
    this.getViewMode()
  },
  methods: {
    getViewMode() {
      const viewMode = store.get('viewMode')
      if (viewMode && viewMode === 'night') {
        this.siteViewMode = true
      } else {
        this.siteViewMode = false
      }
    },
    async changeViewMode(value) {
      const { enable } = await import(/* webpackChunkName: darkreader */ 'darkreader')
      const { disable } = await import(/* webpackChunkName: darkreader */ 'darkreader')
      const enableDarkMode = enable
      const disableDarkMode = disable
      if (value) {
        store.set('viewMode', 'night')
        enableDarkMode({
          brightness: 100,
          contrast: 90,
          sepia: 10,
        })
      } else {
        store.set('viewMode', 'day')
        disableDarkMode()
      }
    },
    jumpTo(params) {
      if (!params.name) return
      this.$router.push(params)
    },
    // 获取用户信息 - 转让状态
    async getMyUserData() {
      try {
        const res = await this.$API.getMyUserData()
        if (res.status === 200 && res.data.code === 0) this.articleTransfer = !!res.data.data.accept
        else console.log('获取转让状态失败')
      } catch (error) {
        console.log(`获取转让状态失败${error}`)
      }
    },
    // 改变转让状态
    async changeTransfer(status) {
      try {
        this.articleTransfer = status
        let accept = status ? 1 : 0
        const res = await this.$backendAPI.setProfile({ accept })
        if (res.status === 200 && res.data.code === 0)
          return this.$toast.success({ duration: 1000, message: this.$t('success.success') })
        else {
          this.$toast.fail({ duration: 1000, message: this.$t('error.fail') })
          this.articleTransfer = !status
        }
      } catch (error) {
        this.articleTransfer = !status
        console.log(`转让状态错误${error}`)
        this.$toast.fail({ duration: 1000, message: this.$t('error.fail') })
      }
    },
    clearCache() {
      // 没有用vuex的signOut方法, 直接window reload了
      this.$confirm('清除浏览器缓存, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'message-box__mobile'
      }).then(() => {
        clearAllCookie()
        // 防止没有清除干净
        removeCookie('ACCESS_TOKEN')
        removeCookie('idProvider')
        store.clearAll()
        sessionStorage.clear()
        this.$message({
          type: 'success',
          message: '清除成功!'
        })
        this.$router.push({ name: 'index' })
        setTimeout(() => {
          this.$userMsgChannel.postMessage('logout')
          window.location.reload()
        }, 1000)
      }).catch(() => { })
    }
  }
}
</script>

<style lang="less" scoped src="./index.less"></style>
