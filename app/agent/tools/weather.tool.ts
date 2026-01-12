import { z } from 'zod'
import { ToolConfig } from '../types/tool.types'

interface WeatherParams {
  city: string
}

// 城市名称到高德地图城市编码的映射
const cityCodeMap: Record<string, string> = {
  北京: '110100',
  上海: '310100',
  广州: '440100',
  深圳: '440300',
  杭州: '330100',
  成都: '510100',
  重庆: '500100',
  天津: '120100',
  南京: '320100',
  武汉: '420100',
  西安: '610100',
  郑州: '410100',
  苏州: '320500',
  长沙: '430100',
  沈阳: '210100',
  青岛: '370200',
  济南: '370100',
  大连: '210200',
  厦门: '350200',
  福州: '350100',
  无锡: '320200',
  合肥: '340100',
  昆明: '530100',
  哈尔滨: '230100',
  长春: '220100',
  石家庄: '130100',
  太原: '140100',
  南昌: '360100',
  贵阳: '520100',
  南宁: '450100',
  兰州: '620100',
  乌鲁木齐: '650100',
  银川: '640100',
  西宁: '630100',
  呼和浩特: '150100',
  拉萨: '540100',
  海口: '460100',
  三亚: '460200',
}

export const weatherTool: ToolConfig<WeatherParams> = {
  name: 'weather',
  description: '查询指定城市的天气信息',
  enabled: true,
  schema: z.object({
    city: z.string().describe('要查询天气的城市名称'),
  }),
  handler: async (params?: WeatherParams) => {
    if (!params) return ''
    const { city } = params
    const cityCode = cityCodeMap[city]
    if (!cityCode) {
      return `抱歉，暂不支持查询 "${city}" 的天气信息。`
    }

    const apiKey = process.env.GAODE_WEATHER_API_KEY
    if (!apiKey) {
      return '❌ 错误：未配置高德地图 API Key，请在环境变量中设置 GAODE_WEATHER_API_KEY'
    }

    const url = `https://restapi.amap.com/v3/weather/weatherInfo?key=${apiKey}&city=${cityCode}&extensions=all&output=JSON`
    try {
      const response = await fetch(url)
      const data = await response.json()
      if (data.status !== '1') {
        return `❌ 查询天气信息失败：${data.info || '未知错误'}`
      }

      const weatherInfo = data.lives ? data.lives[0] : null
      if (!weatherInfo) {
        return `❌ 未能获取到 "${city}" 的天气信息。`
      }

      return `🌤️ ${weatherInfo.province} ${weatherInfo.city} 天气：
- 天气状况：${weatherInfo.weather}
- 温度：${weatherInfo.temperature}°C
- 风向：${weatherInfo.winddirection}
- 风力：${weatherInfo.windpower}级
- 湿度：${weatherInfo.humidity}%
- 更新时间：${weatherInfo.reporttime}`
    } catch (error: any) {
      return `❌ 查询天气信息时发生错误：${error.message}`
    }
  },
  options: {
    timeout: 5000, // 5秒超时
  },
}
