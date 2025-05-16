/**
 * 测试地理位置API是否正常工作
 * 使用方法: 
 * 1. 在浏览器控制台中加载此脚本
 * 2. 调用 testLocationAPIs() 函数
 * 
 * 如果遇到CORS问题，请在本地服务器上运行此脚本
 */
async function testLocationAPIs() {
  console.log('开始测试位置API...');
  
  // 测试结果
  const results = {
    tencent: null,
    ipip: null,
    ipInfo: null
  };

  // 测试腾讯地图API
  try {
    console.log('测试腾讯地图位置API...');
    const tencentResponse = await fetch('https://apis.map.qq.com/ws/location/v1/ip?key=LWABZ-IRIEQ-X7T5U-DJRRU-KRGK3-OLBLV&output=json');
    
    if (tencentResponse.ok) {
      const data = await tencentResponse.json();
      console.log('腾讯地图API响应:', data);
      
      if (data.status === 0) {
        const result = data.result;
        const adInfo = result.ad_info || {};
        
        // 获取省份、城市和区域信息
        const nation = adInfo.nation || '';
        const province = adInfo.province || '';
        const city = adInfo.city || '';
        const district = adInfo.district || '';
        
        // 构建位置信息
        let locationInfo = '未知位置';
        
        if (nation === '中国') {
          // 国内显示格式：省份 · 城市 (如有区/县则显示)
          if (province && city) {
            locationInfo = province + ' · ' + city;
            if (district) {
              locationInfo += ' · ' + district;
            }
          } else if (province) {
            locationInfo = province;
          }
        } else {
          // 国外显示格式：国家 · 城市
          const nationDisplayName = nation || '海外';
          locationInfo = nationDisplayName + (city ? ' · ' + city : '');
        }
        
        results.tencent = {
          success: true,
          location: locationInfo,
          raw: data
        };
        
        console.log('腾讯地图位置API测试成功，位置:', locationInfo);
      } else {
        results.tencent = {
          success: false,
          error: `API返回错误: ${data.message || '未知错误'}`,
          raw: data
        };
        console.error('腾讯地图API返回错误:', data);
      }
    } else {
      results.tencent = {
        success: false,
        error: `HTTP错误: ${tencentResponse.status}`,
        raw: await tencentResponse.text()
      };
      console.error('腾讯地图API HTTP错误:', tencentResponse.status);
    }
  } catch (error) {
    results.tencent = {
      success: false,
      error: error.message || '未知错误'
    };
    console.error('腾讯地图API异常:', error);
  }
  
  // 测试IPIP.net API
  try {
    console.log('测试IPIP.net位置API...');
    const ipipResponse = await fetch('https://myip.ipip.net', {
      headers: {
        'Accept': 'text/html'
      }
    });
    
    if (ipipResponse.ok) {
      const text = await ipipResponse.text();
      console.log('IPIP.net API响应:', text);
      
      // 解析IPIP.net响应格式，例如：当前 IP：240e:388:6429:4900:2d00:da33:d52:a44f  来自于：中国 浙江 杭州 运营商：移动
      const match = text.match(/来自于：([^<]+)/);
      if (match && match[1]) {
        const locationInfo = match[1].trim().replace(/\s+/g, ' · ');
        
        results.ipip = {
          success: true,
          location: locationInfo,
          raw: text
        };
        
        console.log('IPIP.net位置API测试成功，位置:', locationInfo);
      } else {
        results.ipip = {
          success: false,
          error: '无法解析响应',
          raw: text
        };
        console.error('无法解析IPIP.net响应');
      }
    } else {
      results.ipip = {
        success: false,
        error: `HTTP错误: ${ipipResponse.status}`,
        raw: await ipipResponse.text()
      };
      console.error('IPIP.net API HTTP错误:', ipipResponse.status);
    }
  } catch (error) {
    results.ipip = {
      success: false,
      error: error.message || '未知错误'
    };
    console.error('IPIP.net API异常:', error);
  }
  
  // 测试ipinfo.io API (原API)
  try {
    console.log('测试ipinfo.io位置API...');
    const ipInfoResponse = await fetch('https://ipinfo.io/json', {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (ipInfoResponse.ok) {
      const data = await ipInfoResponse.json();
      console.log('ipinfo.io API响应:', data);
      
      // 获取位置信息
      const country = data.country || '';  // 国家代码
      const region = data.region || '';    // 地区/省份
      const city = data.city || '';        // 城市
      
      // 构建位置信息
      let locationInfo = '未知位置';
      
      // 根据国家代码处理显示方式
      if (country === 'CN') {
        // 中国显示为：省份 · 城市
        locationInfo = region + (city ? ' · ' + city : '');
      } else {
        // 国外显示为：国家 · 城市
        const countryMap = {
          'US': '美国', 'GB': '英国', 'JP': '日本', 'KR': '韩国', 
          'CA': '加拿大', 'AU': '澳大利亚', 'DE': '德国', 'FR': '法国',
          'RU': '俄罗斯', 'SG': '新加坡', 'MY': '马来西亚', 'TH': '泰国'
        };
        
        const countryName = countryMap[country] || country;
        locationInfo = '海外 · ' + (city ? city : countryName);
      }
      
      results.ipInfo = {
        success: true,
        location: locationInfo,
        raw: data
      };
      
      console.log('ipinfo.io位置API测试成功，位置:', locationInfo);
    } else {
      results.ipInfo = {
        success: false,
        error: `HTTP错误: ${ipInfoResponse.status}`,
        raw: await ipInfoResponse.text()
      };
      console.error('ipinfo.io API HTTP错误:', ipInfoResponse.status);
    }
  } catch (error) {
    results.ipInfo = {
      success: false,
      error: error.message || '未知错误'
    };
    console.error('ipinfo.io API异常:', error);
  }
  
  // 显示所有测试结果
  console.log('=========== 位置API测试结果 ===========');
  console.log('腾讯地图API:', results.tencent?.success ? '成功' : '失败');
  if (results.tencent?.success) {
    console.log(' - 位置:', results.tencent.location);
  } else {
    console.log(' - 错误:', results.tencent?.error || '未知错误');
  }
  
  console.log('IPIP.net API:', results.ipip?.success ? '成功' : '失败');
  if (results.ipip?.success) {
    console.log(' - 位置:', results.ipip.location);
  } else {
    console.log(' - 错误:', results.ipip?.error || '未知错误');
  }
  
  console.log('ipinfo.io API:', results.ipInfo?.success ? '成功' : '失败');
  if (results.ipInfo?.success) {
    console.log(' - 位置:', results.ipInfo.location);
  } else {
    console.log(' - 错误:', results.ipInfo?.error || '未知错误');
  }
  
  console.log('======================================');
  console.log('推荐使用:', 
    results.tencent?.success ? '腾讯地图API' : 
    results.ipip?.success ? 'IPIP.net API' : 
    results.ipInfo?.success ? 'ipinfo.io API' : '无可用API');
  
  return results;
}

// 导出测试函数，以便浏览器控制台中使用
if (typeof window !== 'undefined') {
  window.testLocationAPIs = testLocationAPIs;
}

export default testLocationAPIs; 