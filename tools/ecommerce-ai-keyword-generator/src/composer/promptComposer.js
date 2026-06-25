(function () {
  function composeDesignStory(strategy) {
    return [
      `设计意图：${strategy.intent}`,
      `核心卖点：${strategy.coreSellingPoint}`,
      `Product Hero：${strategy.productHero}`,
      `Visual Hero：${strategy.visualHero.length ? strategy.visualHero.join(" + ") : "无额外卖点视觉主体"}`,
      `视觉主体组合：${strategy.heroGroup.join(" + ")}`,
      `设计语言：${strategy.designLanguage.join("、")}`,
      `元素关系：${strategy.elementRelationship}`,
      `视觉层级：${strategy.visualHierarchy}`,
      `摄影结构：${strategy.photographyLogic}`,
      `Design Story：${strategy.designStory}`,
    ].join("\n");
  }

  function composeNaturalPromptLead(strategy) {
    return `${strategy.intent}。画面核心由${strategy.heroGroup.join(" + ")}共同构成主视觉；${strategy.elementRelationship}${strategy.photographyLogic}整体采用${strategy.designLanguage.join("、")}的视觉语言，形成完整电商商业摄影设计，避免元素孤立堆叠。`;
  }

  window.PromptComposer = {
    composeDesignStory,
    composeNaturalPromptLead,
  };
})();
