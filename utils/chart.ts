export function getPie3D(pieData: any[], internalDiameterRatio: number) {
    const series = [];
    let sumValue = 0;
    let startValue = 0;
    let endValue = 0;
    const k = 1 - internalDiameterRatio;
  
    pieData.sort((a, b) => b.value - a.value);
  
    // 生成series配置
    for (let i = 0; i < pieData.length; i++) {
      sumValue += pieData[i].value;
      const seriesItem = {
        name: pieData[i].name,
        type: 'surface',
        parametric: true,
        wireframe: {
          show: false
        },
        pieData: pieData[i],
        pieStatus: {
          selected: false,
          hovered: false,
          k: k
        },
        itemStyle: pieData[i].itemStyle
      };
      series.push(seriesItem);
    }
  
    // 设置参数方程
    for (let i = 0; i < series.length; i++) {
      endValue = startValue + series[i].pieData.value;
      series[i].pieData.startRatio = startValue / sumValue;
      series[i].pieData.endRatio = endValue / sumValue;
      series[i].parametricEquation = getParametricEquation(
        series[i].pieData.startRatio,
        series[i].pieData.endRatio,
        false,
        false,
        k,
        series[i].pieData.value
      );
      startValue = endValue;
    }
  
    return {
      tooltip: {
        formatter: '{b}: ${c}'
      },
      xAxis3D: {
        min: -1,
        max: 1
      },
      yAxis3D: {
        min: -1,
        max: 1
      },
      zAxis3D: {
        min: -1,
        max: 1
      },
      grid3D: {
        show: false,
        boxHeight: 20,
        viewControl: {
          alpha: 40,
          beta: 40,
          rotateSensitivity: 0,
          zoomSensitivity: 0,
          panSensitivity: 0,
          autoRotate: false
        }
      },
      series: series
    };
  }