(function () {
  function visualElements(data) {
    return [
      data.effectWordEnabled && data.effectWordText ? `${data.effectWordText}大字` : "",
      data.backgroundDecoration && data.backgroundDecoration !== "无" ? data.backgroundDecoration : "",
      data.backgroundMaterial && data.backgroundMaterial !== "无材质" ? `${data.backgroundMaterial}材质` : "",
      data.lightingEffect && data.lightingEffect !== "无特殊光效" ? data.lightingEffect : "",
    ].filter(Boolean);
  }

  function buildHeroGroup(data) {
    const productHero = data.productType || "产品";
    const visualHero = visualElements(data);
    return {
      productHero,
      visualHero,
      heroGroup: [productHero, ...visualHero],
    };
  }

  function describeRelationship(data) {
    const { visualHero } = buildHeroGroup(data);
    const effectWord = data.effectWordEnabled && data.effectWordText ? `${data.effectWordText}大字` : "";
    const decoration = data.backgroundDecoration && data.backgroundDecoration !== "无" ? data.backgroundDecoration : "";
    if (effectWord && decoration) {
      return `${effectWord}与${decoration}共同组成卖点视觉主体。两者不是主从关系，也不是一个融入另一个，而是共享光影、折射、方向和空间节奏，共同表达科技、精密、高级的视觉语言。`;
    }
    if (visualHero.length > 1) {
      return `${visualHero.join("、")}共同组成卖点视觉主体，彼此通过光影、材质、投影和空间节奏建立关系，不作为独立元素散落。`;
    }
    if (visualHero.length === 1) {
      return `${visualHero[0]}围绕产品形成卖点视觉锚点，与产品共享主光、投影和构图中心。`;
    }
    return "以产品为核心视觉主体，背景、材质、光效和承载面只服务产品识别与转化表达。";
  }

  window.ElementRelationships = {
    buildHeroGroup,
    describeRelationship,
    visualElements,
  };
})();
