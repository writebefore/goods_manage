<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <div id="main" class="chartStyle"></div>
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'
import _ from 'lodash'
export default {
  data() {
    return {
      chartData: {}
    }
  },
  methods: {
    //   获取数据
    async getDate() {
      const { data: res } = await this.$http.get('reports/type/1')
      if (res.meta.status !== 200) {
        return this.$message.error('获取折线图数据失败')
      }
      console.log(0, res)
      this.chartData = res.data
      const optionData = _.cloneDeep(this.chartData)
      optionData.series.forEach(item => {
        if (item.areaStyle !== undefined) {
          delete item.areaStyle
        }
      })
      this.setOption(optionData)
    },

    setOption(chartData) {
      var myChart = echarts.init(document.getElementById('main'))
      myChart.setOption({
        title: {
          text: '数据报表'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: chartData.legend,
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: chartData.xAxis,
        yAxis: chartData.yAxis,
        series: chartData.series
      })
    }
  },
  created() {},
  mounted() {
    this.getDate()
  }
}
</script>

<style lang='less' scoped>
.chartStyle {
  width: 800px;
  height: 500px;
  margin: 0 auto;
}
</style>
