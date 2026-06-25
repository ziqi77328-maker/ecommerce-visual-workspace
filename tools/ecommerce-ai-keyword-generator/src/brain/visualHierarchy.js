(function () {
  function describe(data, heroGroup) {
    const visualHero = heroGroup.visualHero || [];
    if (visualHero.length) {
      return `${heroGroup.productHero} + ${visualHero.join(" + ")}共同组成第一视觉锚点 > 承载面稳定产品 > 背景轻虚化 > 低密度辅助光效与远景粒子`;
    }
    return `${heroGroup.productHero}作为第一视觉主体 > 承载面稳定产品 > 背景轻虚化 > 少量辅助光影`;
  }

  function photographyLogic(data) {
    const scene = data.backgroundScene || data.visualStyle || "商业摄影背景";
    const surface = /厨房|中岛/.test(scene)
      ? "前景为连续厨房台面摄影平面，横向贯穿画面底部"
      : "前景为连续摄影台面或展示平台，铺满画面底部";
    return `${surface}；中景放置产品与卖点视觉主体组合；后景为${scene}并轻微虚化；摄影结构按前景承载面、中景主体组合、背景氛围、远景层次组织。`;
  }

  window.VisualHierarchy = {
    describe,
    photographyLogic,
  };
})();
