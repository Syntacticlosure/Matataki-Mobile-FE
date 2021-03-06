<template>
  <div class="card">
    <div class="card-info">
      <span class="card-type">{{ assetType }}</span>
      <h2 class="card-pricing" :style="{ color: `${assetColor}` }">{{ assetAmount }}</h2>
    </div>
    <div class="card-info">
      <span class="card-date">{{ friendlyDate }}</span>
    </div>
    <div class="card-info">
      <span v-if="!isWithdraw" class="card-title">{{ assetTitle }}</span>
      <span v-else class="card-title">
        <span class="card-title-info">
          {{ asset.toaddress.slice(0, 6) }}...
          <img
            src="@/assets/img/icon_copy.svg"
            class="copy-hash"
            alt="hash"
            @click="copyInfo(asset.toaddress)"
          />
        </span>
        <span>
          {{ asset.trx.slice(0, 6) }}...
          <img
            src="@/assets/img/icon_copy.svg"
            class="copy-hash"
            alt="hash"
            @click="copyInfo(asset.trx)"
          />
        </span>
      </span>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
// import { isNDaysAgo } from '@/common/methods';
import { precision } from '@/common/precisionConversion'

export default {
  name: 'AssetCard',
  props: ['asset'],
  computed: {
    friendlyDate() {
      // const isAppleSlave = navigator.platform.includes('iPhone');
      // const time = moment(this.asset.create_time);
      // const timeZoneOffset = moment(time.getTime() - time.getTimezoneOffset() * 60000 * (isAppleSlave ? 0 : 1));
      // return isNDaysAgo(2, time) ? time.format('MMMDo HH:mm') : time.fromNow();

      return moment(this.asset.create_time).format('MMMDo HH:mm')
    },
    assetAmount() {
      const switchType = {
        support_expenses: '',
        buy_expenses: '',
        fission_income: '+',
        referral_income: '+',
        author_sale_income: '+',
        author_supported_income: '+',
        withdraw: '',
        buyad: '',
        earn: '+'
      }
      return switchType[this.asset.type] + precision(this.asset.amount, this.asset.symbol)
    },
    assetColor() {
      const switchType = {
        support_expenses: '#d74e5a',
        buy_expenses: '#d74e5a',
        fission_income: '#41b37d',
        referral_income: '#41b37d',
        author_sale_income: '#41b37d',
        author_supported_income: '#41b37d',
        withdraw: '#000000',
        buyad: '#d74e5a',
        earn: '#41b37d'
      }
      return switchType[this.asset.type]
    },
    assetTitle() {
      const { title, type } = this.asset
      // 有内容显示内容
      if (title) return title
      else {
        // 没有内容根据类型判断
        if (type === 'buyad' || type === 'earn') return '来自 -Smart Billboard-'
        // 如果是广告牌
        else return '' // 防止不是广告牌 但是字段也为空
      }
    },
    assetType() {
      // type='withdraw'：0 待处理 1已转账待确认 2成功 3失败， 4审核 5审核拒绝
      // type=其他：只有2，表示成功
      const { status, type } = this.asset
      const switchStatus = {
        0: this.$t('assetCard.0'),
        1: this.$t('assetCard.1'),
        2: this.$t('assetCard.2'),
        3: this.$t('assetCard.3'),
        4: this.$t('assetCard.4'),
        5: this.$t('assetCard.5')
      }
      const switchType = {
        withdraw: switchStatus[status],
        support_expenses: this.$t('assetCard.support_expenses'),
        buy_expenses: this.$t('assetCard.buy_expenses'),
        fission_income: this.$t('assetCard.fission_income'),
        referral_income: this.$t('assetCard.referral_income'),
        author_sale_income: this.$t('assetCard.author_sale_income'),
        author_supported_income: this.$t('assetCard.author_supported_income'),
        buyad: this.$t('assetCard.buyad'),
        earn: this.$t('assetCard.earn')
      }
      return switchType[type]
    },
    isWithdraw() {
      return this.asset.type === 'withdraw'
    }
  },
  created() {},
  methods: {
    copyInfo(copyText) {
      this.$copyText(copyText).then(
        () => {
          this.$toast.success({
            duration: 1000,
            message: this.$t('success.copy')
          })
        },
        () => {
          this.$toast.fail({
            duration: 1000,
            message: this.$t('error.copy')
          })
        }
      )
    }
  }
}
</script>

<style scoped lang="less">
.card {
  margin: 10px 0;
  box-sizing: border-box;
  background-color: #fff;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  position: relative;
  text-align: left;
  /*&::after {
      content: '';
      display: block;
      position: absolute;
      bottom: 0;
      left: 20px;
      right: 20px;
      height: 1px;
      background-color: rgba(241,241,241,1);
    }*/
  &:nth-of-type(1) {
    border-radius: 3px 3px 0 0;
  }
  &:nth-last-of-type(1) {
    border-radius: 0 0 3px 3px;
    &::after {
      display: none;
    }
  }
  &-pricing {
    font-size: 18px;
    font-weight: 700;
  }
  &-type {
    font-size: 14px;
    font-weight: 400;
    color: rgba(0, 0, 0, 1);
  }
  &-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  &-title {
    font-size: 14px;
    font-weight: 400;
    color: rgba(0, 0, 0, 1);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    &-info {
      margin: 0 6px 0 0;
    }
    .copy-hash {
      width: 16px;
    }
  }
  &-date {
    font-size: 12px;
    font-weight: 400;
    color: #b2b2b2;
    flex: 0 0 100px;
    text-align: left;
  }
}
</style>
