(function () {
  function generate(data) {
    const hero = window.ElementRelationships.buildHeroGroup(data);
    const intent = window.DesignPatterns.inferIntent(data);
    const designLanguage = window.DesignPatterns.inferDesignLanguage(data);
    const elementRelationship = window.ElementRelationships.describeRelationship(data);
    const visualHierarchy = window.VisualHierarchy.describe(data, hero);
    const photographyLogic = window.VisualHierarchy.photographyLogic(data);
    const coreSellingPoint = data.effectWordText || data.corePoint || data.backgroundDecoration || "产品核心卖点";

    return {
      intent,
      coreSellingPoint,
      productHero: hero.productHero,
      visualHero: hero.visualHero,
      heroGroup: hero.heroGroup,
      designLanguage,
      elementRelationship,
      visualHierarchy,
      photographyLogic,
      designStory: `${hero.heroGroup.join(" + ")}共同构成画面核心。${elementRelationship}画面通过${photographyLogic}，让视觉元素不再是关键词堆叠，而是一套完整电商商业摄影方案。`,
    };
  }

  window.DesignBrain = {
    generate,
  };
})();
