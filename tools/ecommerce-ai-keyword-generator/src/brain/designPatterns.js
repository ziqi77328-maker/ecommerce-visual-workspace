(function () {
  const PURPOSE_INTENT = {
    主图: "让用户第一眼看懂产品、核心卖点和点击理由",
    背景图: "生成可承载产品与卖点视觉的完整电商摄影底图",
    商详: "把核心卖点拆成可阅读、可证明、可转化的详情页视觉",
    视频: "用镜头节奏呈现产品真实质感和卖点证据",
  };

  const LANGUAGE_MAP = {
    商业摄影: ["商业摄影", "高级产品摄影", "真实光影", "克制特效"],
    苹果发布会: ["极简", "发布会舞台", "克制聚光", "高端留白"],
    高端科技: ["科技", "精密", "高级", "材质高光"],
    京东爆款: ["京东搜索主图", "强识别", "产品大主体", "缩略图可读"],
    奢侈品广告: ["奢侈品广告", "高级材质", "真实投影", "低密度装饰"],
    家居生活: ["家居生活", "温和氛围", "真实空间", "产品亲和力"],
    电影感: ["电影感", "体积光", "景深层次", "叙事氛围"],
    未来科技: ["未来科技", "数字秩序", "冷静空间", "低密度科技元素"],
  };

  function inferIntent(data) {
    const purpose = data.purpose || "主图";
    const point = data.corePoint && !data.corePoint.includes("【") ? data.corePoint : "";
    const effectWord = data.effectWordText || "";
    if (effectWord) return `突出${effectWord}技术感，并让产品与卖点视觉形成同一个主视觉`;
    if (point) return `突出${point}，让卖点成为可感知的购买理由`;
    return PURPOSE_INTENT[purpose] || PURPOSE_INTENT.主图;
  }

  function inferDesignLanguage(data) {
    const language = data.visualLanguage || "商业摄影";
    return [...(LANGUAGE_MAP[language] || [language]), "电商转化", "整体视觉设计"];
  }

  window.DesignPatterns = {
    inferIntent,
    inferDesignLanguage,
  };
})();
