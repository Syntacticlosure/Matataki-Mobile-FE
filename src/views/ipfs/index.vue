<template>
  <main class="ipfs ipfs-page">
    <BaseHeader
      :has-bottom-border-line="true"
      :pageinfo="{ title: 'IPFS' }"
      customize-header-bc="#fff"
    />
    <header>
      <h1 class="head-title">
        {{ articleData.title }}
      </h1>
      <figure>
        <router-link
          :to="{ name: 'user-id', params: { id: articleData.uid } }"
          target="_blank"
          itemprop="author"
        >
          {{ articleData.nickname || articleData.username || '&nbsp;' }}
        </router-link>
        <time itemprop="datePublished" :datetime="articleData.create_time">{{
          articleCreateTime
        }}</time>
        <span itemprops="provider" itemscope="" itemtype="https://www.matataki.io/">
          from <span itemprops="name">瞬MATATAKI</span>
          <meta itemprops="url" content="https://www.matataki.io/" />
        </span>
        <p itemprops="hash">
          {{ articleData.hash }}
        </p>
      </figure>
    </header>
    <article
      v-if="showContent"
      class="markdown-body"
      itemprop="articleBody"
      v-html="compiledMarkdown"
    />
    <article v-else class="markdown-body" itemprop="articleBody">
      <p>该文章需持Fan票阅读,请返回原文查看 <a :href="id">立即跳转</a></p>
    </article>
  </main>
</template>

<script>
import moment from 'moment'
import { mavonEditor } from 'mavon-editor'
import { xssFilter } from '@/utils/xss'

// MarkdownIt 实例
const markdownIt = mavonEditor.getMarkdownIt()

export default {
  layout: 'ipfs',
  data() {
    return {
      articleIpfs: Object.create(null),
      articleData: Object.create(null),
      showContent: false
    }
  },
  head() {
    return {
      title: this.articleData.title,
      meta: [
        { hid: 'description', name: 'description', content: this.articleData.short_content },
        { hid: 'aritcle:author', name: 'aritcle:author', content: this.articleData.author },
        /* <!--  Meta for Twitter Card --> */
        { hid: 'twitter:card', property: 'twitter:card', content: 'summary' },
        { hid: 'twitter:site', property: 'twitter:site', content: '@Andoromeda' },
        {
          hid: 'twitter:title',
          property: 'twitter:title',
          content: this.articleData.author + ':' + this.articleData.title
        },
        {
          hid: 'twitter:description',
          property: 'twitter:description',
          content: this.articleData.short_content
        },
        /* <!--  Meta for OpenGraph --> */
        { hid: 'og:site_name', property: 'og:site_name', content: '瞬MATATAKI' },
        {
          hid: 'og:title',
          property: 'og:title',
          content: this.articleData.author + ':' + this.articleData.title
        },
        { hid: 'og:type', property: 'og:type', content: 'article' },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.articleData.short_content
        }
        /* end */
      ]
    }
  },
  computed: {
    articleCreateTime() {
      return moment(this.articleData.create_time).format('YYYY-MM-DD HH:mm')
    },
    compiledMarkdown() {
      return markdownIt.render(xssFilter(this.articleIpfs.content))
    },
    id() {
      return `/p/${this.articleData.id}`
    }
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      await this.$backendAPI.getArticleInfo(this.$route.params.hash).then(res => {
        if (res.status === 200 && res.data.code === 0) this.articleData = res.data.data
      })

      this.addReadAmount(this.articleData.hash)

      if (this.articleData.require_holdtokens || this.articleData.require_buy) {
        this.showContent = false
      } else {
        await this.$backendAPI.getIpfsData(this.$route.params.hash).then(res => {
          if (res.status === 200 && res.data.code === 0) this.articleIpfs = res.data.data
        })
        this.showContent = true
      }
    },
    // 增加文章阅读量
    async addReadAmount(hash) {
      await this.$backendAPI
        .addReadAmount(hash)
        .catch(err => console.log('add read amount error', err))
    }
  }
}
</script>
<style lang="less" scoped>
.ipfs {
  padding: 0 20px;
  margin-top: 45px;
}

header {
  margin-bottom: 20px;
  font-size: 16px;
}
.head-title {
  font-size: 32px;
  line-height: 1.3;
  padding: 20px 0 0;
}
figure {
  padding: 0;
  margin: 0;
  a {
    text-decoration: underline;
    cursor: pointer;
  }
  time {
    color: #b3b3b3;
    padding-left: 6px;
    padding-right: 6px;
  }
  p {
    color: #b3b3b3;
    font-size: 14px;
    word-break: break-all;
  }
}
.ipfs article p {
  line-height: 1.8;
  font-size: 18px;
}
.ipfs article > * {
  margin-top: 20px;
  margin-bottom: 24px;
}
.ipfs article * {
  max-width: 100%;
}
</style>

<style>
.ipfs .katex-display {
  overflow: auto;
}
.ipfs-page img {
  width: 100%;
}
</style>
