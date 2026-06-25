const DATA_URL = "./data/keywords.json";
const AUTH_URL = "./data/auth.json";
const KNOWLEDGE_BASE_URL = "./data/knowledge";
const KNOWLEDGE_FILES = {
  productTypes: "product-types.json",
  sellingPoints: "selling-points.json",
  sceneTemplates: "scene-templates.json",
  layoutRules: "layout-rules.json",
  promptRecipes: "prompt-recipes.json",
  platformRules: "platform-rules.json",
  backgroundModules: "background-modules.json",
};
const API_ENDPOINT = "/api/generate";
const STORAGE_KEYS = {
  auth: "ecommerceKeyword:auth",
  lastForm: "ecommerceKeyword:lastForm",
  history: "ecommerceKeyword:history",
  favorites: "ecommerceKeyword:favorites",
  recent: "ecommerceKeyword:recent",
};

const $ = (selector) => document.querySelector(selector);
const DEFAULT_DISPLAY_MODE = "完整产品";
const MAIN_PURPOSE = "主图";
const BACKGROUND_PURPOSE = "背景图";
const QUICK_SELLING_POINTS = ["低糖饭", "IH加热", "0涂层", "晶钛内胆", "少盐提鲜"];
const QUICK_BACKGROUND_SCENES = [
  "商业渐变背景",
  "商业棚拍",
  "现代厨房",
  "极简厨房",
  "开放式厨房",
  "客厅",
  "餐厅",
  "科技空间",
  "纯色背景",
];
const QUICK_BACKGROUND_MATERIALS = ["无材质", "石材", "木纹", "金属", "亚克力", "镜面", "玻璃", "水泥"];
const QUICK_BACKGROUND_DECORATIONS = ["无", "玻璃花瓣", "晶体", "金属碎片", "光粒子", "能量线", "流体", "飘带"];
const QUICK_VISUAL_LANGUAGES = ["商业摄影", "苹果发布会", "高端科技", "京东爆款", "奢侈品广告", "家居生活", "电影感", "未来科技"];
const QUICK_LIGHTING_EFFECTS = [
  "无特殊光效",
  "暖金阳光",
  "冷白科技光",
  "柔和漫反射",
  "背光轮廓光",
  "聚光灯",
  "晶体折射光",
  "金属高光",
  "光束效果",
  "能量光效",
];
const QUICK_TONES = ["白色", "米白", "浅灰", "深灰", "黑色", "蓝色", "红色", "金色", "香槟金", "青瓷蓝", "暖金", "银灰", "黑金", "红金"];
const MAIN_LAYOUT_RULES = [
  "右侧产品占位",
  "居中主视觉",
  "左侧产品占位",
];
const ASSIST_LAYOUT_RULES = [
  "底部预留价格区",
  "右下角留白",
  "证据模块区",
  "大面积留白",
  "前景台面空间",
  "台面展示区",
];
const BACKGROUND_STYLE_MAP = {
  晶钛空间: "晶钛金属",
  厨房棚拍: "浅金厨房",
  生活场景: "生活厨房",
  浅金高级感: "浅金厨房",
  银灰科技感: "晶钛金属",
  温馨米白: "生活厨房",
  木质台面: "浅金厨房",
  抽象棚拍: "极简白底",
};
const BACKGROUND_STYLE_DESCRIPTIONS = {
  商业渐变背景: "无真实场景、干净渐变、适合后期排版",
  商业棚拍: "摄影棚空间、真实布光、低干扰",
  现代厨房: "现代厨房岛台、轻虚化、生活氛围",
  极简厨房: "少道具、干净厨房、留白清晰",
  开放式厨房: "中岛厨房、空间纵深、适合家电主图",
  客厅: "家居氛围、轻虚化、非厨房",
  餐厅: "餐饮空间、轻生活感、低干扰",
  科技空间: "未来科技、数字空间、非厨房",
  纯色背景: "单色商业棚拍、不生成真实场景",
};
const PURE_BACKGROUND_CORE =
  "这是一个无产品的电商后期排版底图，画面中不得出现任何商品、家电、容器、瓶子、包装、Logo、文字、价格、图标、配件或可识别主体。画面仅保留空场景、背景材质、光影氛围、台面空间和后期合成留白。";
const PURE_BACKGROUND_NEGATIVE_CN =
  "不要产品，不要商品，不要家电，不要电饭煲，不要微波炉，不要空气炸锅，不要内胆，不要配件，不要瓶子，不要罐子，不要盒子，不要包装，不要Logo，不要品牌，不要文字，不要价格，不要标签，不要按钮，不要控制面板，不要人物，不要手，不要餐具，不要食物，不要任何可识别主体，不要中心物体，不要装饰摆件抢占主体位。";
const PURE_BACKGROUND_NEGATIVE_EN =
  "no product, no appliance, no rice cooker, no bottle, no container, no package, no logo, no text, no label, no brand, no object in the center, no main subject, empty scene only, clean background only.";
const STRUCTURE_TRIGGER_TERMS = [
  "拆解",
  "爆炸",
  "分层",
  "悬浮",
  "剖面",
  "截面",
  "内胆",
  "配件",
  "零件",
  "结构图",
  "局部放大",
  "双内胆",
  "沥糖釜",
  "沥糖篮",
  "门内",
  "开门",
];

let keywordData = null;
let generationCount = 0;
let currentResults = null;
let currentData = null;
let restoreFromShareData = null;
let copyBlocks = [];
let authConfig = null;

function splitPoints(value) {
  return value
    .split(/[\n,，、;；]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePurpose(purpose) {
  return purpose === "底图" ? "背景图" : purpose || "主图";
}

function purposeInputValue(purpose) {
  return normalizePurpose(purpose) === "背景图" ? "底图" : purpose || "主图";
}

function normalize(text) {
  return String(text || "")
    .replace(/[，。；、：:\s“”"'【】（）()]/g, "")
    .replace(/高转化|商业摄影|电商|主图|关键词|提示词|背景图/g, "")
    .trim();
}

function similarity(a, b) {
  const left = new Set(normalize(a));
  const right = new Set(normalize(b));
  if (!left.size || !right.size) return 0;
  const overlap = [...left].filter((item) => right.has(item)).length;
  return overlap / Math.max(left.size, right.size);
}

function uniquePush(list, phrase, threshold = 0.72) {
  const clean = String(phrase || "").trim();
  if (!clean) return;
  if (!list.some((item) => similarity(item, clean) > threshold)) list.push(clean);
}

function uniqueList(items, threshold = 0.72) {
  const list = [];
  items.forEach((item) => uniquePush(list, item, threshold));
  return list;
}

function rotate(items, offset) {
  if (!items.length) return [];
  const start = ((offset % items.length) + items.length) % items.length;
  return items.slice(start).concat(items.slice(0, start));
}

function pick(items, offset, count) {
  return rotate(uniqueList(items), offset).slice(0, count);
}

function getSelectedPurpose() {
  return normalizePurpose(document.querySelector("input[name='purpose']:checked")?.value || MAIN_PURPOSE);
}

function selectedChipValues(containerId) {
  return [...document.querySelectorAll(`${containerId} input:checked`)].map((item) => item.value);
}

function getSelectedSellingPoints() {
  return uniqueList([...selectedChipValues("#sellingPointChips"), ...splitPoints($("#sellingPoints").value)]);
}

function getSelectedBackgroundStyles() {
  const selected = selectedChipValues("#backgroundStyleChips");
  const custom = splitPoints($("#bgStyleCustom")?.value || "");
  const legacyMixedStyles = new Set([
    ...Object.keys(BACKGROUND_STYLE_MAP),
    ...Object.keys(BACKGROUND_STYLE_DESCRIPTIONS).filter((item) => !QUICK_BACKGROUND_SCENES.includes(item)),
    ...QUICK_BACKGROUND_DECORATIONS,
    ...QUICK_BACKGROUND_MATERIALS,
    ...QUICK_LIGHTING_EFFECTS,
    ...knowledgeItems("sceneTemplates").map((item) => item.name),
  ]);
  const sceneCustom = custom.filter((item) => !legacyMixedStyles.has(item));
  const combined = uniqueList([...sceneCustom, ...selected]);
  if (combined.length) return combined;
  return ["现代厨房"];
}

function getSelectedBackgroundScene() {
  return getSelectedBackgroundStyles()[0] || "现代厨房";
}

function getSelectedBackgroundMaterial() {
  return selectedRadioValue("#backgroundMaterialChips", "无材质");
}

function getSelectedBackgroundDecoration() {
  return selectedRadioValue("#backgroundDecorationChips", "无");
}

function getSelectedVisualLanguage() {
  return selectedRadioValue("#visualLanguageChips", "商业摄影");
}

function getSelectedLightingEffect() {
  return selectedRadioValue("#lightingEffectChips", "柔和漫反射");
}

function getEffectWordData() {
  const enabled = Boolean($("#effectWordEnabled")?.checked);
  const text = ($("#effectWordText")?.value || "").trim();
  return {
    enabled: enabled && Boolean(text),
    text,
  };
}

function primaryBackgroundStyle() {
  return getSelectedBackgroundScene();
}

function getSelectedTone() {
  return uniqueList([...selectedChipValues("#toneChips"), ...splitPoints($("#bgToneCustom")?.value || "")])[0] || "米白";
}

function selectedRadioValue(containerId, fallback) {
  return document.querySelector(`${containerId} input:checked`)?.value || fallback;
}

function getSelectedMainLayoutRule() {
  return selectedRadioValue("#mainLayoutChips", "右侧产品占位");
}

function getSelectedAssistLayoutRules() {
  return uniqueList(selectedChipValues("#assistLayoutChips"));
}

function getSelectedLayoutRules() {
  return uniqueList([getSelectedMainLayoutRule(), ...getSelectedAssistLayoutRules()]);
}

function normalizeMainLayoutName(name) {
  const value = String(name || "");
  if (value.includes("居中")) return "居中主视觉";
  if (value.includes("左侧产品") || value.includes("左侧主体")) return "左侧产品占位";
  return "右侧产品占位";
}

function getFormData() {
  const purpose = getSelectedPurpose();
  const isBackground = purpose === BACKGROUND_PURPOSE;
  const points = isBackground ? [] : getSelectedSellingPoints();
  const backgroundStyles = isBackground ? getSelectedBackgroundStyles() : [];
  const effectWord = isBackground ? getEffectWordData() : { enabled: false, text: "" };
  const productType = isBackground ? $("#bgProductType").value || "其他" : $("#productType").value.trim() || "【产品类型】";
  return {
    productType,
    points,
    corePoint: points[0] || "【核心卖点】",
    auxPoints: points.slice(1, 6),
    platform: isBackground ? "京东" : $("#platform").value,
    visualStyle: isBackground ? primaryBackgroundStyle() : $("#visualStyle").value,
    backgroundStyles,
    backgroundScene: isBackground ? getSelectedBackgroundScene() : "",
    backgroundMaterial: isBackground ? getSelectedBackgroundMaterial() : "",
    backgroundDecoration: isBackground ? getSelectedBackgroundDecoration() : "",
    visualLanguage: isBackground ? getSelectedVisualLanguage() : "",
    lightingEffect: isBackground ? getSelectedLightingEffect() : "",
    effectWordEnabled: effectWord.enabled,
    effectWordText: effectWord.text,
    tone: isBackground ? getSelectedTone() : "",
    mainLayoutRule: isBackground ? getSelectedMainLayoutRule() : "",
    assistLayoutRules: isBackground ? getSelectedAssistLayoutRules() : [],
    layoutRules: isBackground ? getSelectedLayoutRules() : [],
    productDisplay: $("#productDisplay").value || DEFAULT_DISPLAY_MODE,
    purpose,
    campaign: $("#campaign").value.trim() || "活动到手价",
    benefits: isBackground ? "" : $("#benefits").value.trim() || "权益1：【真实权益】；权益2：【真实权益】",
    aiMode: $("#aiMode").checked,
    appearance: isBackground
      ? $("#bgSpecial").value.trim()
      : $("#appearance").value.trim() ||
        "锁定真实外观、Logo位置、控制面板、按键、把手、门体、锅盖、杯体和主体比例",
  };
}

function setFormData(data = {}) {
  $("#productType").value = data.productType || "";
  $("#bgProductType").value = ["电饭煲", "微波炉", "空气炸锅", "电磁炉", "破壁机", "电水壶", "其他"].includes(data.productType)
    ? data.productType
    : "其他";
  $("#sellingPoints").value = Array.isArray(data.points) ? data.points.join("\n") : data.sellingPoints || "";
  $("#platform").value = data.platform || $("#platform").value;
  $("#visualStyle").value = data.visualStyle || $("#visualStyle").value;
  const knownScenes = uniqueList([...QUICK_BACKGROUND_SCENES, ...backgroundModuleItems("scene").map((item) => item.name)]);
  const legacyScene = data.backgroundStyles?.find((item) => knownScenes.includes(item)) || "";
  const savedScene = data.backgroundScene || legacyScene;
  $("#bgStyleCustom").value = savedScene && !knownScenes.includes(savedScene) ? savedScene : "";
  const knownColors = uniqueList([...QUICK_TONES, ...backgroundModuleItems("color").map((item) => item.name)]);
  $("#bgToneCustom").value = data.tone && !knownColors.includes(data.tone) ? data.tone : "";
  $("#bgSpecial").value = data.purpose === BACKGROUND_PURPOSE ? data.appearance || "" : "";
  $("#effectWordEnabled").checked = Boolean(data.effectWordEnabled && data.effectWordText);
  $("#effectWordText").value = data.effectWordText || "";
  $("#effectWordField").hidden = !$("#effectWordEnabled").checked;
  $("#productDisplay").value = data.productDisplay || DEFAULT_DISPLAY_MODE;
  $("#campaign").value = data.campaign && data.campaign !== "活动到手价" ? data.campaign : "";
  $("#benefits").value =
    data.benefits && !data.benefits.includes("【真实权益】") ? data.benefits : "";
  $("#appearance").value =
    data.appearance && !data.appearance.includes("锁定真实外观") ? data.appearance : "";
  $("#aiMode").checked = Boolean(data.aiMode);
  const purpose = purposeInputValue(data.purpose);
  const purposeInput = document.querySelector(`input[name='purpose'][value='${purpose}']`);
  if (purposeInput) purposeInput.checked = true;
  syncChipsFromData(data);
  updateModeUI();
}

function storageGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    showToast("浏览器存储空间不足");
  }
}

function compactData(data) {
  return {
    productType: data.productType,
    points: data.points,
    corePoint: data.corePoint,
    platform: data.platform,
    visualStyle: data.visualStyle,
    backgroundStyles: data.backgroundStyles,
    backgroundScene: data.backgroundScene,
    backgroundMaterial: data.backgroundMaterial,
    backgroundDecoration: data.backgroundDecoration,
    visualLanguage: data.visualLanguage,
    lightingEffect: data.lightingEffect,
    effectWordEnabled: data.effectWordEnabled,
    effectWordText: data.effectWordText,
    tone: data.tone,
    mainLayoutRule: data.mainLayoutRule,
    assistLayoutRules: data.assistLayoutRules,
    layoutRules: data.layoutRules,
    productDisplay: data.productDisplay || DEFAULT_DISPLAY_MODE,
    purpose: normalizePurpose(data.purpose),
    campaign: data.campaign,
    benefits: data.benefits,
    appearance: data.appearance,
    aiMode: data.aiMode,
  };
}

function saveLastForm() {
  if (!keywordData) return;
  storageSet(STORAGE_KEYS.lastForm, compactData(getFormData()));
}

function formatDate(iso) {
  try {
    const date = new Date(iso);
    return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  } catch (error) {
    return "";
  }
}

function getCategory(productType) {
  const text = productType.toLowerCase();
  return (
    keywordData.categories.find((category) =>
      category.matchKeywords.some((word) => text.includes(word.toLowerCase())),
    ) || keywordData.fallback.category
  );
}

function purposeNote(purpose) {
  const notes = {
    主图: "仅输出主图关键词，包含主体、证据区、卖点层级和成交区。",
    背景图: "仅输出背景图关键词，固定包含产品版和纯背景版。",
    视频: "仅输出视频关键词，包含镜头、运动、细节和收尾。",
    商详: "仅输出商详关键词，适合详情页模块化页面生成。",
  };
  return notes[purpose] || notes.主图;
}

function styleData(name) {
  if (keywordData.visualStyles[name]) return keywordData.visualStyles[name];
  const scene = knowledgeItems("sceneTemplates").find((item) => itemMatches(item, name));
  if (scene) {
    return {
      scene: [scene.name, ...(scene.backgroundElements || []), ...(scene.composition || [])],
      title: [...(scene.tone || []), ...(scene.lighting || [])],
      avoid: scene.negativeKeywords || [],
    };
  }
  return Object.values(keywordData.visualStyles)[0];
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}`);
  return response.json();
}

async function loadAuthConfig() {
  try {
    return await fetchJson(AUTH_URL);
  } catch (error) {
    console.warn("Auth config failed, using test fallback", error);
    return { users: [{ username: "admin", password: "diudiu2026" }] };
  }
}

function isAuthenticated() {
  return storageGet(STORAGE_KEYS.auth, null)?.loggedIn === true;
}

function setAuthenticated(loggedIn) {
  if (loggedIn) {
    storageSet(STORAGE_KEYS.auth, {
      loggedIn: true,
      loggedAt: new Date().toISOString(),
    });
  } else {
    localStorage.removeItem(STORAGE_KEYS.auth);
  }
}

function credentialsMatch(username, password) {
  return (authConfig?.users || []).some((user) => user.username === username && user.password === password);
}

async function loadKeywordLibrary() {
  const data = await fetchJson(DATA_URL);
  const knowledgeEntries = await Promise.all(
    Object.entries(KNOWLEDGE_FILES).map(async ([key, filename]) => {
      try {
        return [key, await fetchJson(`${KNOWLEDGE_BASE_URL}/${filename}`)];
      } catch (error) {
        console.warn(`Knowledge file skipped: ${filename}`, error);
        return [key, { version: "missing", items: [] }];
      }
    }),
  );
  data.knowledge = Object.fromEntries(knowledgeEntries);
  data.knowledgeLoaded = knowledgeEntries.some(([, value]) => Array.isArray(value.items) && value.items.length);
  return data;
}

function knowledgeItems(key) {
  return keywordData?.knowledge?.[key]?.items || [];
}

function backgroundModuleItems(type) {
  return knowledgeItems("backgroundModules").filter((item) => item.type === type);
}

function backgroundModuleByName(type, name) {
  const normalizedName = normalize(name);
  return backgroundModuleItems(type).find((item) => {
    const names = [item.name, ...(item.aliases || [])].map(normalize);
    return names.some((entry) => entry && (entry === normalizedName || entry.includes(normalizedName) || normalizedName.includes(entry)));
  });
}

function selectedModule(type, name, fallback = {}) {
  return backgroundModuleByName(type, name) || fallback;
}

function searchableText(item) {
  return [item.name, item.id, ...(item.aliases || []), ...(item.keywords || [])].filter(Boolean).join(" ");
}

function itemMatches(item, text) {
  const haystack = normalize(searchableText(item));
  const needle = normalize(text);
  if (!needle || !haystack) return false;
  if (haystack.includes(needle) || needle.includes(haystack)) return true;
  return [...(item.aliases || []), item.name].some((alias) => {
    const cleanAlias = normalize(alias);
    return cleanAlias && (needle.includes(cleanAlias) || cleanAlias.includes(needle));
  });
}

function matchKnowledge(key, texts, limit = 6) {
  const combined = texts.filter(Boolean).join(" ");
  return knowledgeItems(key)
    .filter((item) => itemMatches(item, combined))
    .slice(0, limit);
}

function recipeForPurpose(purpose) {
  const purposeName = purpose === "背景图" ? "底图关键词" : purpose;
  return (
    knowledgeItems("promptRecipes").find((item) => itemMatches(item, purposeName)) ||
    knowledgeItems("promptRecipes").find((item) => item.name === "主图关键词")
  );
}

function defaultLayoutsFor(data) {
  const layouts = [];
  const names = knowledgeItems("layoutRules");
  const byId = (id) => names.find((item) => item.id === id);
  if (data.mainLayoutRule) {
    return matchKnowledge("layoutRules", [data.mainLayoutRule, ...(data.assistLayoutRules || [])], 8);
  }
  if (data.purpose === "背景图") {
    layouts.push(byId("right-product-position"));
  } else if (data.purpose === "主图") {
    layouts.push(byId("left-text-right-product"), byId("bottom-price-band"));
  }
  if (data.platform === "京东") layouts.push(byId("bottom-price-band"));
  return layouts.filter(Boolean);
}

function buildKnowledgeContext(data) {
  const backgroundStyleText = (data.backgroundStyles || []).join(" ");
  const searchTexts = [
    data.productType,
    data.corePoint,
    data.points.join(" "),
    data.visualStyle,
    backgroundStyleText,
    data.backgroundScene,
    data.backgroundMaterial,
    data.backgroundDecoration,
    data.visualLanguage,
    data.lightingEffect,
    data.effectWordText,
    data.tone,
    data.mainLayoutRule,
    ...(data.assistLayoutRules || []),
    ...(data.layoutRules || []),
    data.platform,
    data.purpose,
  ];
  const productTypes = matchKnowledge("productTypes", [data.productType, data.corePoint, data.points.join(" ")], 3);
  const sellingPoints = matchKnowledge("sellingPoints", [data.corePoint, data.points.join(" "), data.productType], 8);
  const sceneTemplates = matchKnowledge("sceneTemplates", [data.visualStyle, backgroundStyleText, data.tone, data.productType, data.corePoint], 4);
  const explicitLayouts = data.mainLayoutRule
    ? matchKnowledge("layoutRules", [data.mainLayoutRule, ...(data.assistLayoutRules || [])], 8)
    : matchKnowledge("layoutRules", searchTexts, 6);
  const layoutRules = uniqueList([...defaultLayoutsFor(data), ...explicitLayouts].map((item) => item.name)).map((name) =>
    [...defaultLayoutsFor(data), ...explicitLayouts].find((item) => item.name === name),
  );
  const platformRules = matchKnowledge("platformRules", [data.platform], 2);
  const backgroundModules = matchKnowledge("backgroundModules", [
    data.backgroundScene,
    data.backgroundMaterial,
    data.tone,
    data.backgroundDecoration,
    data.visualLanguage,
    data.lightingEffect,
  ], 10);
  const promptRecipe = recipeForPurpose(data.purpose);

  return {
    productTypes,
    sellingPoints,
    sceneTemplates,
    layoutRules,
    platformRules,
    backgroundModules,
    promptRecipe,
    sceneTerms: sceneTemplates.flatMap((item) => [
      item.name,
      ...(item.tone || []),
      ...(item.backgroundElements || []),
      ...(item.composition || []),
    ]),
    lightingTerms: sceneTemplates.flatMap((item) => item.lighting || []),
    sellingTerms: sellingPoints.flatMap((item) => [
      item.name,
      item.userBenefit,
      ...(item.keywords || []),
      ...(item.visualEvidence || []),
    ]),
    evidenceTerms: [
      ...productTypes.flatMap((item) => item.commonSellingPoints || []),
      ...sellingPoints.flatMap((item) => item.visualEvidence || []),
    ],
    layoutTerms: layoutRules.flatMap((item) => [
      item.name,
      item.subjectRatio,
      item.textArea,
      item.priceArea,
      item.evidencePosition,
    ]),
    negativeTerms: [
      ...productTypes.flatMap((item) => item.taboos || []),
      ...sellingPoints.flatMap((item) => item.tabooExpressions || []),
      ...sceneTemplates.flatMap((item) => item.negativeKeywords || []),
      ...backgroundModules.flatMap((item) => item.forbid || []),
      ...layoutRules.flatMap((item) => item.taboos || []),
      ...platformRules.flatMap((item) => item.taboos || []),
      ...(promptRecipe?.mustForbid || []),
    ],
  };
}

function formatKnowledgeNames(items) {
  return items.length ? items.map((item) => item.name).join(" / ") : "未命中，使用原 keywords.json 兜底";
}

function knowledgeSummarySections(knowledge) {
  if (!keywordData?.knowledgeLoaded) return [];
  return [
    section(
      "结构化知识调用",
      [
        `产品规则：${formatKnowledgeNames(knowledge.productTypes)}`,
        `卖点规则：${formatKnowledgeNames(knowledge.sellingPoints)}`,
        `场景规则：${formatKnowledgeNames(knowledge.sceneTemplates)}`,
        `背景模块：${formatKnowledgeNames(knowledge.backgroundModules || [])}`,
        `版式规则：${formatKnowledgeNames(knowledge.layoutRules)}`,
        `平台规则：${formatKnowledgeNames(knowledge.platformRules)}`,
        `输出用途：${knowledge.promptRecipe?.name || "未命中，使用原用途逻辑"}`,
      ].join("\n"),
    ),
  ];
}

function getDisplayMode(name) {
  const modes = keywordData.productDisplayModes || {};
  return modes[name] || modes[DEFAULT_DISPLAY_MODE] || {
    label: DEFAULT_DISPLAY_MODE,
    intent: "完整商品摄影图，保持真实电商主图摄影状态",
    constraints: [
      "产品以完整商品摄影状态出现",
      "产品不得拆解",
      "不得爆炸分层",
      "不得悬浮结构",
      "不得展示分离内胆",
      "不得展示结构剖面",
    ],
    negative: ["拆解结构图", "爆炸图", "分层结构", "悬浮零件", "分离内胆", "结构剖面"],
  };
}

function isInductionCooker(data) {
  return /电磁炉|电磁灶|火锅炉/.test(data.productType || "");
}

function searchDisplayRules(data) {
  if (!isInductionCooker(data)) return [];
  return [
    "展示方式：搜索主图展示",
    "京东搜索主图风格",
    "电商商品摄影",
    "产品展示状态",
    "非使用状态",
    "非烹饪状态",
    "非生活场景",
    "商品陈列展示",
    "产品主体展示",
    "搜索结果页主图风格",
    "参考京东电磁炉搜索结果主图，而非厨房生活场景图",
  ];
}

function isCompleteProductMode(data) {
  return (data.productDisplay || DEFAULT_DISPLAY_MODE) === DEFAULT_DISPLAY_MODE;
}

function displayConstraintText(data) {
  const mode = getDisplayMode(data.productDisplay);
  const inductionRules = isInductionCooker(data)
    ? [
        "电磁炉规则优先级高于通用家电规则",
        "产品特殊规则优先级高于场景规则和通用规则",
        ...searchDisplayRules(data),
        "电磁炉采用电商搜索主图展示方式",
        "不是生活场景拍摄",
        "不是厨房使用状态",
        "不是料理场景",
        "不是烹饪过程",
        "不是放置在操作台上的真实使用状态",
        "采用京东搜索页站立式产品展示逻辑",
        "产品主体必须站立展示",
        "类似手机、电视、显示器的商品展示逻辑",
        "产品底部接触台面",
        "产品正面朝向用户",
        "完整展示圆形加热区域、控制面板、品牌区域和产品主体外轮廓",
        "完整圆形加热区域",
        "完整圆环",
        "加热区域完整可见",
        "控制面板完整可见",
        "产品轮廓完整可见",
        "圆形加热区域必须完整展示，圆环完整可见，优先位于视觉中心",
        "主体占画面50%-65%",
        "优先正视角、轻微透视角或5°以内轻俯视",
      ]
    : [];
  return `${mode.intent}。${uniqueList([...(mode.constraints || []), ...inductionRules]).join("，")}。`;
}

function displayNegativeText(data) {
  const mode = getDisplayMode(data.productDisplay);
  const inductionNegative = isInductionCooker(data)
    ? [
        "平躺展示",
        "水平放置展示",
        "大角度俯视",
        "真实厨房使用状态",
        "真实烹饪状态",
        "平放使用状态",
        "锅具覆盖主体",
        "锅具覆盖加热区域",
        "厨房操作过程",
        "生活场景摆拍",
        "人物使用场景",
        "料理制作过程",
        "仅展示加热区域局部",
        "仅展示局部区域",
        "裁切圆形加热区域",
        "圆环被标题遮挡",
        "文字遮挡加热区域",
        "圆环被锅具遮挡",
      ]
    : [];
  return uniqueList([...(mode.negative || []), ...inductionNegative]).join("，");
}

function isStructureTrigger(text) {
  return STRUCTURE_TRIGGER_TERMS.some((term) => String(text || "").includes(term));
}

function filterEvidenceByDisplay(items, data) {
  if (!isCompleteProductMode(data)) return uniqueList(items);
  const filtered = uniqueList(items).filter((item) => !isStructureTrigger(item));
  return uniqueList([
    ...filtered,
    "完整产品主体",
    "真实外观比例",
    "Logo位置清晰",
    "控制面板清晰",
    "材质高光真实",
  ]).slice(0, 5);
}

function joinText(items) {
  return uniqueList(items).filter(Boolean).join("，");
}

function moduleKeywords(type, name) {
  const item = selectedModule(type, name, { name, keywords: [name], forbid: [] });
  return uniqueList([item.name, ...(item.keywords || [])]);
}

function moduleForbid(type, name) {
  return selectedModule(type, name, { forbid: [] }).forbid || [];
}

function isKitchenScene(data) {
  return /厨房|中岛/.test(data.backgroundScene || data.visualStyle || "");
}

function isPureColorScene(data) {
  return /纯色/.test(data.backgroundScene || "");
}

function isNoRealScene(data) {
  return /纯色|渐变|棚拍|科技/.test(data.backgroundScene || "");
}

function backgroundPriorityLines(data) {
  return [
    "Prompt优先级：产品特殊规则 > 视觉语言 > 背景类型 > 背景色调 > 光效 > 特效字 > 摄影方式 > 材质 > 通用规则",
    `视觉语言：${data.visualLanguage || "商业摄影"}`,
    `背景场景只允许使用：${data.backgroundScene || "现代厨房"}`,
    "不得自动混入用户未选择的其它背景场景",
    `背景色调最高优先级：整体背景必须以${data.tone || "米白"}为唯一主色调`,
    "背景色调必须统一，不允许混合多个主色，不允许被场景默认色覆盖",
  ];
}

function visualLanguageLines(data) {
  const language = data.visualLanguage || "商业摄影";
  const item = selectedModule("visualLanguage", language, { name: language, keywords: [language], rules: [] });
  return [
    `视觉语言采用：${language}`,
    ...moduleKeywords("visualLanguage", language),
    ...(item.rules || []),
    "最终画面必须是一套完整商业广告视觉设计，而不是在背景里简单添加几个特效元素",
    "特效服务于整体视觉语言、产品识别和商业摄影质感",
    "产品始终是第一视觉主体，背景和特效不得抢主体",
  ];
}

function commercialEffectDisciplineLines() {
  return [
    "特效仅占整体画面的5%~15%",
    "产品主体保持最高视觉权重",
    "背景保持干净，不为了体现特效而过度生成",
    "特效不能成为画面主体，不能遮挡Logo、控制面板、产品轮廓和关键卖点区域",
    "所有特效必须融入商业摄影布光、材质反射、景深和空间层次",
  ];
}

function spatialLayerLines(data) {
  const effect = data.backgroundDecoration && data.backgroundDecoration !== "无" ? data.backgroundDecoration : "克制材质细节";
  const light = data.lightingEffect && data.lightingEffect !== "无特殊光效" ? data.lightingEffect : "商业摄影基础光";
  return [
    "空间层次必须清晰：前景层、主体层、产品后方层、背景层、远景层",
    `前景层：少量${effect}或材质折射只作为边缘点缀`,
    "主体层：产品是画面中心和最高视觉权重",
    data.effectWordEnabled && data.effectWordText
      ? `产品后方层：${data.effectWordText}大型立体广告字位于产品后方`
      : "产品后方层：保留干净轮廓光和空间纵深",
    `背景层：${light}与环境光形成商业广告摄影氛围`,
    "远景层：只允许少量低密度粒子、体积光或景深层次",
    "所有层次围绕产品建立纵深，不把特效堆在同一平面",
  ];
}

function selectedVisualElements(data) {
  return {
    material: data.backgroundMaterial && data.backgroundMaterial !== "无材质" ? data.backgroundMaterial : "",
    decoration: data.backgroundDecoration && data.backgroundDecoration !== "无" ? data.backgroundDecoration : "",
    lighting: data.lightingEffect && data.lightingEffect !== "无特殊光效" ? data.lightingEffect : "",
    effectWord: data.effectWordEnabled && data.effectWordText ? data.effectWordText : "",
    tone: data.tone || "",
    visualLanguage: data.visualLanguage || "商业摄影",
  };
}

function relationshipEngineLines(data) {
  const elements = selectedVisualElements(data);
  const lines = [
    "Relationship Engine：先建立元素关系，再描述元素本身",
    "生成逻辑：Elements -> Relationship -> Layout -> Photography -> Final Prompt",
    "禁止把元素简单并列堆叠，禁止让元素各自漂浮在画面里",
    "所有元素必须通过材质、光影、折射、投影、包裹、生长、穿透或流动关系连接成完整商业广告视觉",
  ];

  if (elements.effectWord && elements.decoration) {
    if (/玻璃花瓣|花瓣/.test(elements.decoration)) {
      lines.push(
        `${elements.decoration}自然融入${elements.effectWord}大字内部，作为${elements.effectWord}字形材质的一部分`,
        `${elements.decoration}沿着${elements.effectWord}字母边缘生长，并形成真实玻璃折射效果`,
        `${elements.effectWord}大字可由半透明玻璃花瓣构成，花瓣包裹字形但不脱离字形结构`,
      );
    } else if (/晶体|金属碎片|光粒子|能量线|流体|飘带/.test(elements.decoration)) {
      lines.push(
        `${elements.decoration}与${elements.effectWord}大字发生材质关系，不是漂浮在旁边的独立装饰`,
        `${elements.decoration}沿${elements.effectWord}字形边缘、笔画转角和背后轮廓分布，形成统一广告字设计`,
      );
    } else {
      lines.push(`${elements.decoration}必须服务${elements.effectWord}大字的材质、边缘高光和空间层次，不独立抢主体`);
    }
  }

  if (/晶体|玻璃花瓣/.test(elements.decoration) && /光束|晶体折射|背光|聚光|冷白科技光|暖金阳光/.test(elements.lighting)) {
    lines.push(
      `${elements.lighting}穿过${elements.decoration}形成真实折射、透射和边缘高光`,
      `${elements.decoration}不是独立漂浮物，而是光路中的折射介质`,
    );
  }

  if (/金属/.test(elements.material) && /能量线|光束|金属高光|冷白科技光/.test(`${elements.decoration}${elements.lighting}`)) {
    lines.push(
      "能量线从金属缝隙、金属切面和产品后方结构中流动",
      "金属材质通过边缘高光承接能量线，不出现孤立的线条装饰",
    );
  }

  if (/玻璃/.test(elements.material) && /暖金阳光|晶体折射光|光束效果|背光/.test(elements.lighting)) {
    lines.push(
      `${elements.lighting}穿过玻璃材质产生真实折射、焦散光和柔和投影`,
      "玻璃材质与光效共同形成空间深度，不是分别出现的两个元素",
    );
  }

  if (elements.effectWord && elements.lighting) {
    lines.push(
      `${elements.lighting}从${elements.effectWord}大字边缘和背后溢出，形成真实体积光与轮廓光`,
      `${elements.effectWord}大字必须有接触阴影、背后投影和真实空间遮挡关系`,
    );
  }

  if (elements.decoration && !elements.effectWord) {
    lines.push(`${elements.decoration}围绕产品轮廓和主光路径组织，不能成为独立主体`);
  }

  lines.push(
    "前景元素、主体、背景大字、光效和远景粒子之间必须有明确前后遮挡、投影和景深关系",
    "画面最终呈现为一套成熟商业摄影视觉设计，而不是元素清单",
  );
  return uniqueList(lines);
}

function sceneIsolationLines(data) {
  const scene = data.backgroundScene || "现代厨房";
  const lines = [
    `${scene}是唯一背景场景`,
    "只读取当前背景场景模块，不跨分类调用其它场景关键词",
  ];
  if (isPureColorScene(data)) {
    lines.push(
      "纯色背景模式：禁止生成厨房、生活场景、家具、客厅、餐厅、餐桌、真实空间",
      "仅生成商业摄影棚拍背景和单色空间",
    );
  } else if (isKitchenScene(data)) {
    lines.push(
      "厨房背景模式：只输出厨房空间关键词",
      "不得混入纯色背景、科技空间、抽象棚拍或未选择的其它场景",
      "厨房后景只作为轻微虚化生活氛围，不成为视觉主体",
    );
  } else if (/科技/.test(scene)) {
    lines.push("科技空间模式：禁止混入厨房、生活场景、家具、餐桌和真实烹饪状态");
  } else if (isNoRealScene(data)) {
    lines.push("无真实场景模式：禁止生成厨房、家具、餐桌和生活道具");
  }
  return uniqueList(lines);
}

function colorPriorityLines(data) {
  const tone = data.tone || "米白";
  return [
    `整体背景必须以${tone}为主色`,
    `${tone}是唯一主色调`,
    "背景色调统一，不允许出现另一个主色抢占画面",
    `禁止与${tone}冲突的暖黄、冷蓝、红金或黑金默认色自动混入`,
    ...moduleKeywords("color", tone),
    ...moduleForbid("color", tone).map((item) => `禁止${item}`),
  ];
}

function materialLines(data) {
  if (!data.backgroundMaterial || data.backgroundMaterial === "无材质") return ["背景材质不额外强化，保持干净商业摄影质感"];
  return [
    `背景材质只使用：${data.backgroundMaterial}`,
    ...moduleKeywords("material", data.backgroundMaterial),
    "材质只作为背景肌理，不改变产品真实外观",
  ];
}

function decorationLines(data) {
  if (!data.backgroundDecoration || data.backgroundDecoration === "无") {
    return ["无背景特效装饰，背景保持干净，不添加花瓣、晶体、粒子或能量线"];
  }
  return [
    `背景特效视觉母题：${data.backgroundDecoration}`,
    ...moduleKeywords("decoration", data.backgroundDecoration),
    "不要把特效作为独立主体摆放，而要融入整套商业广告摄影视觉语言",
    "背景特效主要围绕产品主体附近、产品后方和画面边缘形成层次",
    "背景特效不铺满整个背景，不遮挡产品，不抢主体",
    ...commercialEffectDisciplineLines(),
    ...moduleForbid("decoration", data.backgroundDecoration).map((item) => `禁止${item}`),
  ];
}

function lightingEffectLines(data) {
  if (!data.lightingEffect || data.lightingEffect === "无特殊光效") {
    return ["无特殊光效，只保留真实商业摄影基础布光"];
  }
  return [
    `光效语言：${data.lightingEffect}`,
    ...moduleKeywords("lighting", data.lightingEffect),
    "所有光效主要集中在产品主体附近",
    "不允许整个背景都是特效光",
    "光效仅作为产品氛围增强，不影响主体识别",
    "减少大量光圈、大量能量线、大量粒子，使用克制商业摄影布光",
    "光效服务产品聚焦、轮廓识别、材质质感和空间纵深",
    ...commercialEffectDisciplineLines(),
  ];
}

function effectWordLines(data) {
  if (!data.effectWordEnabled || !data.effectWordText) return ["不生成背景特效大字"];
  return [
    `背景大型立体特效字内容：${data.effectWordText}`,
    "特效字必须是商业广告级背景大字，不是简单白色3D模型",
    "特效字位于产品后方背景，作为产品背后的空间层次",
    "特效字不遮挡产品、不压住控制面板、不抢主体",
    "特效字材质由AI按当前视觉语言自动匹配，可为拉丝金属、玻璃材质、能量材质或高级亚克力",
    "特效字必须有真实折射、真实投影、边缘高光、轻微体积光和真实商业摄影质感",
    "禁止简单白色立体字、廉价塑料字、抢主体的大字、挡住产品的大字",
    "特效字与整体背景风格和主色调统一",
  ];
}

function kitchenCounterLines() {
  return [
    "前景必须为完整厨房岛台 Kitchen Island",
    "厨房岛台从画面左侧一直延伸到画面右侧",
    "台面铺满整个画面底部",
    "kitchen island countertop spans the full width of the frame",
    "full-width countertop",
    "countertop fills the entire foreground",
    "不允许出现独立餐桌",
    "不允许出现桌边悬空",
    "不允许只有局部桌面",
  ];
}

function kitchenProductFocusLines() {
  return [
    "产品主体占画面宽度约55%-60%",
    "产品高度约占画面65%-70%",
    "使用京东搜索主图构图",
    "产品始终作为第一视觉主体",
    "medium close-up product shot",
    "camera closer to product",
    "large product presentation",
    "avoid small product",
    "avoid distant camera",
    "背景仅作为生活氛围并保持轻微虚化",
    "background serves only as atmosphere",
    "background should not dominate the frame",
    "keep product as the primary visual focus",
    "Eye-level camera",
    "Slightly low angle",
    "避免俯拍",
    "避免远景厨房",
  ];
}

function continuousCounterLines() {
  return [
    ...kitchenCounterLines(),
    "厨房岛台从画面底部延伸至左右边缘",
    "同一张连续工作台面",
    "完整厨房操作台",
    "前景与中景属于同一连续台面",
    "前景台面与产品台面属于同一结构",
    "无断层",
    "无遮挡视线",
    "无第二张桌子",
    "无独立餐桌",
    "无新增前景桌体",
    "形成完整厨房工作台空间",
  ];
}

function counterNegativeLines() {
  return [
    "禁止新增第二张桌子",
    "禁止新增独立餐桌",
    "禁止新增前景桌体",
    "禁止悬浮台面",
    "禁止前后景断层",
  ];
}

function primaryLayoutRule(data) {
  return data.mainLayoutRule || data.layoutRules?.[0] || (data.purpose === "背景图" ? "右侧产品占位" : "左文右图");
}

function productCompositionLines(data) {
  const rule = primaryLayoutRule(data);
  if (rule.includes("居中")) {
    return [
      "仅采用居中主视觉构图",
      "主体位于画面中心",
      "左右视觉平衡",
      "中心聚焦",
      "环绕式布局",
      "主体居中展示",
      "构图逻辑保持单一，不混入其它构图描述",
    ];
  }
  if (rule.includes("右侧")) {
    return [
      "仅采用右侧产品占位主构图",
      "右侧或中右侧形成明确产品展示区",
      "左侧可作为标题与卖点排版区",
      "构图逻辑保持单一，不混入其它构图描述",
    ];
  }
  if (rule.includes("左侧")) {
    return [
      "仅采用左侧产品占位主构图",
      "产品主体位于左侧或中左侧",
      "右侧可作为标题与卖点排版区",
      "构图逻辑保持单一，不混入其它构图描述",
    ];
  }
  return [`仅采用${rule}构图`, `${rule}为唯一构图规则`, "不混入其它构图逻辑"];
}

function assistCompositionLines(data) {
  const rules = data.assistLayoutRules || [];
  const lines = [];
  if (rules.includes("底部预留价格区")) {
    lines.push("底部保留价格权益区，高度控制在画面14%-18%，不得遮挡主体关键结构");
  }
  if (rules.includes("右下角留白")) {
    lines.push("右下角保留干净留白，可用于证据模块或后期信息排版");
  }
  if (rules.includes("证据模块区")) {
    lines.push("证据模块靠近产品但不压住主体，不遮挡Logo、控制面板和关键功能区域");
  }
  if (rules.includes("大面积留白")) {
    lines.push("画面保留大面积干净可排版空间，信息层级清晰不拥挤");
  }
  if (rules.includes("前景台面空间") || rules.includes("台面展示区")) {
    if (isKitchenScene(data)) {
      lines.push(...continuousCounterLines());
    } else {
      lines.push("前景为干净商业展示台面或棚拍地台", "台面与背景空间连续", "不生成厨房岛台、餐桌或生活家具");
    }
  }
  return uniqueList(lines);
}

function pureCompositionLines(data) {
  return [...productCompositionLines(data), ...assistCompositionLines(data)].map(pureLayoutText);
}

function productAreaLines(data) {
  const rule = primaryLayoutRule(data);
  if (rule.includes("居中")) {
    return [
      "产品预览位于画面中心",
      "主体占画面约50%-60%",
      "左右视觉重量平衡",
      "标题和证据围绕主体安全排布，不遮挡主体关键区域",
    ];
  }
  if (rule.includes("左侧")) {
    return [
      "产品预览位于左侧或中左侧",
      "主体占画面约50%-60%",
      "右侧信息区不得压住主体关键结构",
      "主体保持清晰完整并有真实接触阴影",
    ];
  }
  if (rule.includes("右侧")) {
    return [
      "产品预览位于右侧或中右侧",
      "主体占画面约50%-60%",
      "左侧信息区不得压住主体关键结构",
      "主体保持清晰完整并有真实接触阴影",
    ];
  }
  return [
    "产品预览遵循当前主构图",
    "主体保持清晰完整并有真实接触阴影",
  ];
}

function blankAreaLines(data) {
  const rule = primaryLayoutRule(data);
  const lines = [];
  if (rule.includes("居中")) {
    lines.push("标题和卖点围绕中心主体布局", "左右留白保持视觉平衡", "不得把主体挤到画面右侧或左侧");
  } else if (rule.includes("左侧")) {
    lines.push("右侧预留标题与卖点排版区", "左侧主体周围保留安全距离");
  } else {
    lines.push("左侧预留标题与卖点排版区", "右侧主体周围保留安全距离");
  }
  if ((data.assistLayoutRules || []).includes("底部预留价格区")) {
    lines.push("底部预留14%-18%价格权益区");
  }
  if ((data.assistLayoutRules || []).includes("右下角留白")) {
    lines.push("右下角留白用于证据模块或后期信息排版");
  }
  if ((data.assistLayoutRules || []).includes("大面积留白")) {
    lines.push("保留大面积干净可排版留白");
  }
  lines.push("留白是可排版的干净空间，不是空白无场景", "留白区域内不得生成文字、数字、伪文字和促销标签");
  return uniqueList(lines);
}

function buildSceneBlueprint(data, ctx, options = {}) {
  const template = options.template || {};
  const seed = ctx.seed;
  const sceneSource = template.sceneDirection || ctx.backgroundSceneTerms || moduleKeywords("scene", data.backgroundScene);
  const elementSource = template.visualElements || ctx.backgroundElementTerms || ctx.backgroundElements;
  const textureSource = template.texture || ctx.backgroundLightingTerms || ctx.lighting;
  const commercialBase = [
    `${data.platform}电商商业视觉场景`,
    "1:1正方形电商底图",
    "真实商业摄影棚拍质感",
    "后期可直接排版主图信息",
    ...visualLanguageLines(data),
    ...backgroundPriorityLines(data),
    ...sceneIsolationLines(data),
  ];
  if (isInductionCooker(data)) {
    commercialBase.push(
      "产品特殊规则优先级高于场景规则和通用规则",
      `${isKitchenScene(data) ? "厨房" : "当前背景"}只作为背景空间，不生成真实使用状态`,
      "商品摄影展示状态，不是生活场景摆拍",
    );
  }
  const sceneTone = pick(sceneSource, seed, 5);
  const spatialBase = [
    "画面分为连续工作台面层、中景展示层、后景氛围层",
    ...relationshipEngineLines(data),
    ...spatialLayerLines(data),
    ...productCompositionLines(data),
    ...assistCompositionLines(data),
    "空间透视稳定，台面水平线清楚",
    ...(isKitchenScene(data) ? kitchenProductFocusLines() : []),
  ];
  const lightBase = [
    ...lightingEffectLines(data),
    ...pick(textureSource, seed + 1, 4),
    "主光服务产品识别",
    "商品位后方有柔和轮廓光",
    "台面保留真实接触阴影",
    "暗部不过脏，亮部不过曝",
  ];
  const foreground = isKitchenScene(data)
    ? [
        "前景来自同一张连续厨房岛台或完整厨房操作台",
        "连续工作台面有轻微反射和真实接触阴影",
        "前景元素尺寸低于商品展示区，不抢主体",
        ...continuousCounterLines(),
        ...counterNegativeLines(),
      ]
    : [
        "前景为干净商业展示台面或棚拍地台",
        "前景只服务产品承接和后期合成",
        "不得生成厨房岛台、餐桌或生活家具，除非背景场景已明确选择厨房",
      ];
  const midground = [
    "中景是画面视觉中心和商品承载区",
    ...productAreaLines(data),
    "预览版放完整商品摄影主体，纯背景版保留同样空间关系和光影关系",
    "商品区边缘有轮廓光、台面投影和轻微反射",
    "不让装饰、花瓣、粒子或光效穿过控制面板与Logo区域",
  ];
  const background = [
    ...pick(elementSource, seed + 2, 6),
    ...relationshipEngineLines(data),
    ...decorationLines(data),
    ...effectWordLines(data),
    "后景虚化处理形成纵深",
    "氛围元素围绕商品位后方和底部舞台分布",
    "背景服务商品展示和后期排版，不抢主体",
  ];
  const colors = colorPriorityLines(data);
  const blank = blankAreaLines(data);
  const productArea = [
    ...productAreaLines(data),
    "纯背景版删除商品后，仍保留商品位的空间关系、台面区域和光影层次",
  ];

  return {
    visualLanguage: joinText([...visualLanguageLines(data), ...commercialEffectDisciplineLines(), ...spatialLayerLines(data)]),
    relationships: joinText(relationshipEngineLines(data)),
    scene: joinText([...commercialBase, ...sceneTone]),
    space: joinText(spatialBase),
    light: joinText(lightBase),
    foreground: joinText(foreground),
    midground: joinText(midground),
    background: joinText(background),
    colors: joinText(colors),
    blank: joinText(blank),
    productArea: joinText(productArea),
  };
}

function pureLayoutText(text) {
  return String(text || "")
    .replace(/产品附近|商品附近/g, "后期合成区域附近")
    .replace(/产品后方|商品后方/g, "后期合成区域后方")
    .replace(/产品周围|商品周围/g, "后期合成区域周围")
    .replace(/遮挡产品|遮挡商品/g, "遮挡后期合成区域")
    .replace(/产品主体附近|商品主体附近/g, "后期合成区域附近")
    .replace(/产品主体|商品主体/g, "后期合成区域")
    .replace(/产品识别|商品识别/g, "后期合成识别")
    .replace(/产品轮廓|商品轮廓/g, "后期合成轮廓")
    .replace(/产品/g, "后期合成内容")
    .replace(/商品/g, "后期合成内容")
    .replace(/右侧预留产品位/g, "右侧预留后期合成空间")
    .replace(/产品占位|商品占位/g, "后期合成空间")
    .replace(/产品展示区|商品展示区|产品主体|商品主体|右侧主体|主体构图/g, "后期合成留区")
    .replace(/产品位|商品位|主体位/g, "后期合成空间")
    .replace(/底部预留价格区/g, "底部预留后期信息区")
    .replace(/价格权益/g, "后期信息");
}

function buildPureBackgroundBlueprint(data, ctx, options = {}) {
  const template = options.template || {};
  const seed = ctx.seed;
  const sceneSource = template.sceneDirection || ctx.backgroundSceneTerms || moduleKeywords("scene", data.backgroundScene);
  const elementSource = template.visualElements || ctx.backgroundElementTerms || ctx.backgroundElements;
  const textureSource = template.texture || ctx.backgroundLightingTerms || ctx.lighting;
  const selectedStyles = data.backgroundScene || data.visualStyle;
  const layoutRules = pureCompositionLines(data);
  const sceneTone = pick(
    [
      ...visualLanguageLines(data),
      ...relationshipEngineLines(data),
      ...backgroundPriorityLines(data),
      ...sceneIsolationLines(data),
      `${selectedStyles}空场景`,
      `${data.tone || "米白"}色调商业摄影底图`,
      ...sceneSource,
      "无商品陈列",
      "后期排版空场景",
    ],
    seed,
    5,
  );
  const space = [
    "画面分为干净台面层、空白留区层、背景氛围层",
    ...relationshipEngineLines(data).map(pureLayoutText),
    ...spatialLayerLines(data).map(pureLayoutText),
    ...layoutRules,
    ...blankAreaLines(data).map(pureLayoutText),
    "后期合成区域为空台面和背景空间，不出现任何实体物体",
    "画面保留光影聚焦区域，但不得生成任何主体",
    ...(isKitchenScene(data) ? kitchenCounterLines() : []),
  ];
  const light = [
    ...lightingEffectLines(data).map(pureLayoutText),
    ...pick(textureSource, seed + 1, 4).map(pureLayoutText),
    "柔和商业摄影布光",
    "空台面真实接触光影",
    "背景由中心偏右向四周自然过渡",
    "光影层次清楚，亮部不过曝，暗部不脏灰",
  ];
  const foreground = isKitchenScene(data)
    ? [
        "前景只保留同一张连续厨房岛台或完整厨房操作台",
        "连续工作台面有轻微材质反射",
        "台面边缘清晰但低干扰",
        ...continuousCounterLines(),
        ...counterNegativeLines(),
        "不摆放餐具、食物、瓶罐、包装或装饰摆件",
      ]
    : [
        "前景只保留干净商业棚拍台面或地台",
        "不出现厨房岛台、餐桌、家具或生活场景",
        "不摆放餐具、食物、瓶罐、包装或装饰摆件",
      ];
  const background = [
    ...pick(elementSource, seed + 2, 5).map(pureLayoutText),
    ...relationshipEngineLines(data).map(pureLayoutText),
    ...decorationLines(data).map(pureLayoutText),
    ...effectWordLines(data).map(pureLayoutText),
    "背景元素仅作为材质氛围",
    "背景有景深和空间纵深",
    "背景装饰停留在边缘和后景",
    "留白区域干净可排版",
  ];
  const colors = [
    ...colorPriorityLines(data),
    ...materialLines(data),
    "整体低干扰、干净、明亮、有商业摄影质感",
    "点缀光效只服务空间层次",
  ];
  const blank = [
    ...layoutRules.map((item) => `${item}必须保持干净可用`),
    "大面积干净留白区域用于后期合成",
    "仅保留光影聚焦和空间透视",
    ...blankAreaLines(data).map(pureLayoutText),
    "所有留白区域不得生成文字、数字、图标、标签或可识别物体",
  ];

  return {
    visualLanguage: joinText([...visualLanguageLines(data), ...commercialEffectDisciplineLines(), ...spatialLayerLines(data)].map(pureLayoutText)),
    relationships: joinText(relationshipEngineLines(data).map(pureLayoutText)),
    scene: joinText(["电商空场景商业摄影底图", ...sceneTone]),
    space: joinText(space),
    light: joinText(light),
    foreground: joinText(foreground),
    background: joinText(background),
    colors: joinText(colors),
    blank: joinText(blank),
  };
}

function backgroundSceneSections(blueprint, productMode) {
  const productSuffix =
    productMode === "pure"
      ? "本版本不出现任何商品主体，但必须保留商品原本所在位置的空间、投影方向、台面光影和后期合成关系。"
      : "本版本用于商品预览，商品以真实完整摄影状态融入中景商品展示区。";
  return [
    section("视觉语言", blueprint.visualLanguage),
    section("元素关系", blueprint.relationships),
    section("场景定位", blueprint.scene),
    section("构图结构", blueprint.space),
    section("光影结构", blueprint.light),
    section("色彩体系", blueprint.colors),
    section("主体定位", `${blueprint.midground}。${productSuffix}`),
    section("留白区域", blueprint.blank),
    section("前景元素", blueprint.foreground),
    section("后景氛围元素", blueprint.background),
    section("产品摆放区域", blueprint.productArea),
  ];
}

function pureBackgroundSceneSections(blueprint) {
  return [
    section("用途", "纯背景版用于直接生成无产品电商底图，交给后期再合成画面信息。"),
    section("核心规则", PURE_BACKGROUND_CORE),
    section("视觉语言", blueprint.visualLanguage),
    section("元素关系", blueprint.relationships),
    section("空场景定位", blueprint.scene),
    section("构图结构", blueprint.space),
    section("光影结构", blueprint.light),
    section("色彩体系", blueprint.colors),
    section("主体定位", "画面中不得出现任何产品、商品、家电、容器、瓶子、包装、Logo、文字或可识别主体；中心偏右仅保留光影聚焦和空台面空间。"),
    section("留白区域", blueprint.blank),
    section("干净台面", blueprint.foreground),
    section("背景元素", blueprint.background),
    section("负面提示词", `${PURE_BACKGROUND_NEGATIVE_CN}\n${PURE_BACKGROUND_NEGATIVE_EN}`),
  ];
}

function buildCompleteScenePrompt(data, blueprint, extra = "") {
  const displayRule = displayConstraintText(data);
  const productText = `画面保留${data.productType}完整商品主体，展示方式为${data.productDisplay}，${displayRule}${data.appearance}，Logo位置不变，控制面板清晰，比例不可改变。`;
  return `${data.platform}电商完整商业视觉场景底图，1:1正方形，高清真实商业摄影质感。视觉语言：${blueprint.visualLanguage}。元素关系：${blueprint.relationships}。场景定位：${blueprint.scene}。空间结构：${blueprint.space}。光影结构：${blueprint.light}。前景元素：${blueprint.foreground}。中景主体展示区：${blueprint.midground}。后景氛围元素：${blueprint.background}。色彩体系：${blueprint.colors}。留白区域：${blueprint.blank}。产品摆放区域：${blueprint.productArea}。${productText}${extra} 不生成广告文字、价格数字、乱码、促销标签、水印或伪文字。可直接用于GPT、豆包、即梦、Liblib生成完整商业视觉场景。`;
}

function buildPureBackgroundPrompt(data, blueprint, extra = "") {
  return `${PURE_BACKGROUND_CORE} 1:1正方形，商业摄影底图。视觉语言：${blueprint.visualLanguage}。元素关系：${blueprint.relationships}。空场景定位：${blueprint.scene}。空间结构：${blueprint.space}。光影层次：${blueprint.light}。干净台面：${blueprint.foreground}。背景元素：${blueprint.background}。色调与材质氛围：${blueprint.colors}。后期合成留白：${blueprint.blank}。${extra} 负面提示词：${PURE_BACKGROUND_NEGATIVE_CN} ${PURE_BACKGROUND_NEGATIVE_EN} 可直接用于GPT、豆包、即梦、Liblib生成无产品电商底图。`;
}

function buildContext(data) {
  const category = getCategory(data.productType);
  const style = styleData(data.visualStyle);
  const knowledge = buildKnowledgeContext(data);
  const seed = generationCount + data.productType.length + data.points.join("").length;
  const isBackground = data.purpose === BACKGROUND_PURPOSE;
  const backgroundSceneTerms = [
    ...visualLanguageLines(data),
    ...relationshipEngineLines(data),
    ...backgroundPriorityLines(data),
    ...sceneIsolationLines(data),
    ...moduleKeywords("scene", data.backgroundScene || data.visualStyle),
  ];
  const backgroundElementTerms = [
    ...relationshipEngineLines(data),
    ...spatialLayerLines(data),
    ...materialLines(data),
    ...decorationLines(data),
    ...effectWordLines(data),
  ];
  const backgroundLightingTerms = [
    ...visualLanguageLines(data),
    ...relationshipEngineLines(data),
    ...lightingEffectLines(data),
    ...(isKitchenScene(data) ? kitchenProductFocusLines() : []),
  ];
  const sceneBase = isBackground
    ? pick(backgroundSceneTerms, seed, 5)
    : pick([...knowledge.sceneTerms, ...category.scenes, ...style.scene], seed, 4);
  const scenePosition = sceneBase.join("，");
  const layoutSource = data.layoutRules?.length
    ? [...knowledge.layoutTerms, ...productCompositionLines(data)]
    : [...knowledge.layoutTerms, ...category.layouts, "右侧主体构图", "左侧预留排版区", "底部留白15%"];
  const layout = pick(layoutSource, seed + 1, data.layoutRules?.length ? 5 : 5);
  const backgroundElements = pick(
    isBackground
      ? backgroundElementTerms
      : [
          ...knowledge.sceneTerms,
          ...knowledge.sellingTerms,
          ...category.vocabulary,
          ...style.scene,
          "玻璃花瓣",
          "柔和蒸汽粒子",
          "流光材质",
          "浅金色能量线",
          "细腻台面纹理",
          "远景厨房虚化",
          "高端材质反射",
        ],
    seed + 2,
    6,
  );
  const lighting = pick(
    isBackground
      ? backgroundLightingTerms
      : [
          ...knowledge.lightingTerms,
          ...style.title,
          "暖金色自然光",
          "高级棚拍光",
          "柔和阴影",
          "层次高光",
          "产品边缘轮廓光",
          "低干扰背景光",
        ],
    seed + 3,
    5,
  );
  const evidence = filterEvidenceByDisplay(
    pick(
      [...knowledge.evidenceTerms, ...category.evidence, ...keywordData.fallback.evidence, ...category.vocabulary],
      seed + 4,
      10,
    ),
    data,
  );
  const selling = uniqueList([...(data.points.length ? data.points : []), ...knowledge.sellingTerms, ...category.vocabulary]).slice(0, 7);
  return {
    category,
    style,
    knowledge,
    seed,
    scenePosition,
    layout,
    backgroundElements,
    lighting,
    backgroundSceneTerms,
    backgroundElementTerms,
    backgroundLightingTerms,
    evidence,
    selling,
  };
}

function section(title, content) {
  return { title, content: String(content || "").trim() };
}

function createResult({ purpose, title, subtitle, category, blocks }) {
  const plainText = flattenBlocks(blocks);
  return {
    purpose,
    title,
    subtitle,
    category,
    blocks,
    plainText,
    directions: [{ name: purpose }],
    mainPrompt: purpose === "主图" ? plainText : "",
    backgroundPrompt: purpose === "背景图" ? plainText : "",
    layoutAdvice: purpose === "商详" ? plainText : "",
    videoPrompt: purpose === "视频" ? plainText : "",
  };
}

function flattenBlocks(blocks) {
  return blocks
    .map((block) => {
      if (block.type === "version") {
        return `## ${block.title}\n\n${block.sections
          .map((item) => `【${item.title}】\n${item.content}`)
          .join("\n\n")}`;
      }
      return `【${block.title}】\n${block.content}`;
    })
    .join("\n\n--------------------------------\n\n");
}

function buildMainImageResult(data, ctx) {
  const title = `${data.productType}产品预览版关键词`;
  const displayRule = displayConstraintText(data);
  const displayNegative = displayNegativeText(data);
  const subjectRatio = isInductionCooker(data) ? "主体占画面50%-65%" : "主体占画面45%-60%";
  const priorityRule = isInductionCooker(data) ? "产品特殊规则 > 场景规则 > 通用规则。厨房只作为背景，不改变商品摄影展示状态。" : "";
  const prompt = `${data.platform}电商主图，${data.productType}，核心卖点“${data.corePoint}”。${priorityRule}${displayRule}${ctx.scenePosition}，${ctx.layout.join("，")}。${subjectRatio}，真实清晰，${ctx.lighting.join("，")}。卖点区只表达${data.corePoint}，辅助卖点包含${ctx.selling.slice(1, 5).join("、") || "【辅助卖点】"}。证据区使用${ctx.evidence.slice(0, 4).join("、")}证明卖点。底部成交区写${data.campaign}，到手价 ¥【真实价格】，${data.benefits}。禁止产品变形、Logo错误、控制面板模糊、文字乱码、参数臆造、背景抢主体、${displayNegative}、${ctx.knowledge.negativeTerms.slice(0, 10).join("、")}。`;
  return createResult({
    purpose: "主图",
    title,
    subtitle: "用于直接生成主图，包含产品、卖点、证据和成交区",
    category: ctx.category,
    blocks: [
      ...knowledgeSummarySections(ctx.knowledge),
      section("主图定位", `${data.platform}平台转化主图，目标是第一眼看懂产品、卖点和成交理由。${isInductionCooker(data) ? "电磁炉必须按京东搜索结果页商品摄影展示方式处理，不按厨房真实使用状态处理。" : ""}`),
      section("构图建议", `${ctx.layout.join("；")}；底部价格权益区控制在画面14%-18%；${isInductionCooker(data) ? "电磁炉主体占画面45%-65%，圆形加热区域不得被裁切或遮挡。" : "产品主体不可低于45%。"}`),
      section("卖点层级", `核心卖点：${data.corePoint}。辅助卖点：${ctx.selling.slice(1, 5).join(" / ") || "【待补充】"}。同一卖点不得重复出现在标题、贴片和价格区。`),
      section("证据与约束", `证据优先使用：${ctx.evidence.join(" / ")}。展示方式：${isInductionCooker(data) ? "搜索主图展示" : data.productDisplay}。${displayRule}产品约束：${data.appearance}。`),
      section("AI生图关键词", prompt),
    ],
  });
}

function buildBackgroundResult(data, ctx) {
  const blueprint = buildSceneBlueprint(data, ctx);
  const pureBlueprint = buildPureBackgroundBlueprint(data, ctx);
  const displayNegative = displayNegativeText(data);
  const productPrompt = buildCompleteScenePrompt(
    data,
    blueprint,
    ` 禁止${displayNegative}，画面不是单独背景素材，而是一张完整可用的商业视觉场景。`,
  );
  const purePrompt = buildPureBackgroundPrompt(
    data,
    pureBlueprint,
    `${isPureColorScene(data) ? "纯色背景模式下禁止厨房、生活场景、家具和真实空间；" : ""}右侧保留大面积干净留白区域，用于后期合成；右侧为空台面和背景空间，不出现任何实体物体；画面中心偏右保留光影聚焦区域，但不得生成任何主体。`,
  );
  return createResult({
    purpose: "背景图",
    title: `${data.productType}完整场景底图关键词`,
    subtitle: "底图模式：输出完整商业视觉场景，不输出素材级背景词",
    category: ctx.category,
    blocks: [
      ...knowledgeSummarySections(ctx.knowledge),
      {
        type: "version",
        title: "【产品预览版】用于查看产品放入后的整体效果",
        sections: [
          ...backgroundSceneSections(blueprint, "product"),
          section("AI生图关键词（产品预览版）", productPrompt),
        ],
      },
      {
        type: "version",
        title: "【纯背景版】用于直接生成无产品电商底图",
        sections: [
          ...pureBackgroundSceneSections(pureBlueprint),
          section("AI生图关键词（纯背景版）", purePrompt),
        ],
      },
    ],
  });
}

function buildGlassPetalBackgroundResult(data, ctx) {
  const template = ctx.style.backgroundTemplate;
  const displayNegative = displayNegativeText(data);
  const blueprint = buildSceneBlueprint(data, ctx, { template });
  const pureBlueprint = buildPureBackgroundBlueprint(data, ctx, { template });
  const productPrompt = buildCompleteScenePrompt(
    data,
    blueprint,
    ` 玻璃花瓣必须融入前景边缘、中景商品位背光和后景氛围层，不能只生成一堆花瓣素材。禁止${displayNegative}。`,
  );
  const purePrompt = buildPureBackgroundPrompt(
    data,
    pureBlueprint,
    "玻璃花瓣只能作为边缘和后景氛围，右侧为空台面和背景空间，不出现任何实体物体；画面中心偏右保留柔和椭圆背光和光影聚焦区域，但不得生成任何主体。",
  );
  const negative = uniqueList([
    ...template.negative,
    "不要生成文字",
    "不要生成价格",
    "不要生成乱码",
    "不要生成促销标签",
    "不要生成品牌Logo",
    "不要生成多余配件",
    "纯背景版不得出现任何产品",
    "不要廉价塑料感",
    "不要背景杂乱",
    "不要花瓣遮挡后期排版区",
    "不要只生成单独花瓣素材",
    "不要只有柔光和留白",
    "不要缺少台面和空间纵深",
    ...getDisplayMode(data.productDisplay).negative,
  ]).join("，");

  return createResult({
    purpose: "背景图",
    title: `${data.productType}玻璃花瓣完整场景底图关键词`,
    subtitle: "底图模式：输出完整商业视觉场景，不输出素材级背景词",
    category: ctx.category,
    blocks: [
      ...knowledgeSummarySections(ctx.knowledge),
      {
        type: "version",
        title: "【产品预览版】用于查看产品放入后的整体效果",
        sections: [
          ...backgroundSceneSections(blueprint, "product"),
          section("AI生图关键词（产品预览版）", productPrompt),
        ],
      },
      {
        type: "version",
        title: "【纯背景版】用于直接生成无产品电商底图",
        sections: [
          ...pureBackgroundSceneSections(pureBlueprint),
          section("AI生图关键词（纯背景版）", purePrompt),
        ],
      },
      section("负面提示词", negative),
    ],
  });
}

function buildDetailResult(data, ctx) {
  const displayRule = displayConstraintText(data);
  const prompt = `${data.platform}电商详情页视觉，产品为${data.productType}，围绕${data.corePoint}拆成首屏利益、证据说明、使用场景、权益收口四段。风格为${data.visualStyle}，场景参考${ctx.scenePosition}，光影为${ctx.lighting.join("，")}。产品展示方式为${data.productDisplay}，${displayRule}每屏只表达一个信息任务，证据包括${ctx.evidence.join("、")}。不要编造未提供的参数、检测数据和权益金额，禁止${ctx.knowledge.negativeTerms.slice(0, 8).join("、")}。`;
  return createResult({
    purpose: "商详",
    title: `${data.productType}商详关键词`,
    subtitle: "单用途输出：只生成商详关键词",
    category: ctx.category,
    blocks: [
      ...knowledgeSummarySections(ctx.knowledge),
      section("商详结构", "首屏核心利益 / 卖点解释 / 证据模块 / 场景模块 / 权益收口。"),
      section("模块关键词", `核心卖点：${data.corePoint}。辅助卖点：${ctx.selling.slice(1, 5).join(" / ") || "【待补充】"}。展示方式：${data.productDisplay}。证据：${ctx.evidence.join(" / ")}。`),
      section("视觉建议", `${ctx.scenePosition}；${ctx.backgroundElements.join(" / ")}；${ctx.lighting.join(" / ")}。`),
      section("AI生图关键词", prompt),
    ],
  });
}

function buildVideoResult(data, ctx) {
  const displayRule = displayConstraintText(data);
  const displayNegative = displayNegativeText(data);
  const prompt = `${data.productType}电商短视频，${data.visualStyle}，${data.platform}平台，5-8秒。镜头1展示${ctx.scenePosition}与主体入场；镜头2特写${ctx.evidence.slice(0, 3).join("、")}证明${data.corePoint}；镜头3用${ctx.backgroundElements.slice(0, 3).join("、")}表现功能结果；镜头4回到稳定主视觉并预留价格权益排版。产品展示方式为${data.productDisplay}，${displayRule}产品外观不变形，面板清晰，不生成乱码和虚假价格，禁止${displayNegative}、${ctx.knowledge.negativeTerms.slice(0, 8).join("、")}。`;
  return createResult({
    purpose: "视频",
    title: `${data.productType}视频关键词`,
    subtitle: "单用途输出：只生成视频关键词",
    category: ctx.category,
    blocks: [
      ...knowledgeSummarySections(ctx.knowledge),
      section("视频定位", `${data.platform}电商短视频，强调卖点证据和产品真实质感。`),
      section("镜头脚本", `1. 场景入场：${ctx.scenePosition}\n2. 局部证据：${ctx.evidence.slice(0, 3).join(" / ")}\n3. 卖点可视化：${data.corePoint}\n4. 收尾：稳定主视觉，预留成交信息。`),
      section("动态关键词", `${ctx.backgroundElements.join(" / ")} / ${ctx.lighting.join(" / ")} / 柔和推镜 / 局部特写 / 真实接触阴影。`),
      section("AI视频关键词", prompt),
    ],
  });
}

async function requestApiGenerate(payload) {
  if (!payload.aiMode) return null;
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        provider: "deepseek",
        outputSchema: "visual-assistant-v2",
        keywordLibraryVersion: keywordData.version,
        knowledgeVersion: keywordData.knowledgeLoaded ? "knowledge-v1" : "fallback-only",
      }),
    });
    if (!response.ok) throw new Error("API generate failed");
    return response.json();
  } catch (error) {
    showToast("AI接口未接通，已回退词库生成");
    return null;
  }
}

async function buildResults(data) {
  const apiResult = await requestApiGenerate(data);
  if (apiResult) return normalizeApiResult(apiResult, data);

  generationCount += 1;
  const ctx = buildContext(data);
  if (data.purpose === "背景图") return buildBackgroundResult(data, ctx);
  if (data.purpose === "商详") return buildDetailResult(data, ctx);
  if (data.purpose === "视频") return buildVideoResult(data, ctx);
  return buildMainImageResult(data, ctx);
}

function normalizeApiResult(result, data) {
  if (result.blocks && result.purpose) return result;
  const ctx = buildContext(data);
  return createResult({
    purpose: data.purpose,
    title: `${data.productType}${data.purpose}关键词`,
    subtitle: "AI接口返回内容",
    category: ctx.category,
    blocks: [section("AI生成结果", result.text || JSON.stringify(result, null, 2))],
  });
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderSectionCard(item) {
  const index = copyBlocks.push(item.content) - 1;
  return `
    <article class="section-card">
      <div class="section-head">
        <h4>【${escapeHtml(item.title)}】</h4>
        <button class="copy" data-copy-index="${index}" type="button">复制</button>
      </div>
      <pre>${escapeHtml(item.content)}</pre>
    </article>
  `;
}

function renderBlock(block) {
  if (block.type === "version") {
    return `
      <section class="version-block">
        <h3 class="version-title">${escapeHtml(block.title)}</h3>
        ${block.sections.map(renderSectionCard).join("")}
      </section>
    `;
  }
  return renderSectionCard(block);
}

function render(results) {
  currentResults = results;
  copyBlocks = [];
  $("#emptyState").hidden = true;
  $("#summary").hidden = false;
  $("#resultOutput").hidden = false;
  $("#metricDirections").textContent = results.purpose;
  $("#metricLibrary").textContent = `${keywordData.version} · ${results.category.name}`;
  $("#metricPrice").textContent = results.purpose === "背景图" ? "产品版 + 纯背景版" : "仅当前用途";
  $("#metricRisk").textContent = results.subtitle || "卡片式复制";
  const allIndex = copyBlocks.push(results.plainText) - 1;
  $("#resultOutput").innerHTML = `
    <article class="output-card">
      <div class="result-head">
        <div class="result-title">
          <span class="mark hot"></span>
          <div>
            <h3>${escapeHtml(results.title)}</h3>
            <p class="hint">${escapeHtml(results.subtitle || "")}</p>
          </div>
        </div>
        <button class="copy" data-copy-index="${allIndex}" type="button">复制全部</button>
      </div>
      <div class="output-body">
        ${results.blocks.map(renderBlock).join("")}
      </div>
    </article>
  `;
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1500);
}

async function copyText(text, label = "已复制") {
  const value = String(text || "").trim();
  if (!value) {
    showToast("还没有生成内容");
    return;
  }
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      showToast(label);
      return;
    } catch (error) {
      // Some embedded browsers block clipboard writes; fall back below.
    }
  }
  const legacyCopy = () => {
    let eventCopied = false;
    const onCopy = (event) => {
      event.clipboardData?.setData("text/plain", value);
      event.preventDefault();
      eventCopied = true;
    };
    document.addEventListener("copy", onCopy, { once: true });
    const helper = document.createElement("textarea");
    helper.value = value;
    helper.style.position = "fixed";
    helper.style.left = "-9999px";
    helper.style.top = "0";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.focus();
    helper.select();
    helper.setSelectionRange(0, helper.value.length);
    const ok = document.execCommand("copy");
    helper.remove();
    document.removeEventListener("copy", onCopy);
    return ok || eventCopied;
  };
  if (legacyCopy()) {
    showToast(label);
    return;
  }
  selectResultText();
  showToast("复制失败，请手动选择结果文本");
}

function makeRecord(type, data, results) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    savedAt: new Date().toISOString(),
    data: compactData(data),
    results: {
      purpose: results.purpose,
      title: results.title,
      subtitle: results.subtitle,
      categoryName: results.category.name,
      blocks: results.blocks,
      plainText: results.plainText,
    },
  };
}

function addRecord(key, record, limit) {
  const list = storageGet(key, []);
  const next = [record, ...list.filter((item) => item.id !== record.id)].slice(0, limit);
  storageSet(key, next);
  renderSavedLists();
}

function renderSavedList(containerId, list, emptyText) {
  const container = $(containerId);
  if (!list.length) {
    container.innerHTML = `<div class="saved-empty">${emptyText}</div>`;
    return;
  }
  container.innerHTML = list
    .map(
      (item) => `
        <button class="saved-item" type="button" data-record-id="${item.id}" data-record-type="${item.type}">
          <span class="saved-title">${escapeHtml(item.data.productType || "未命名产品")} · ${escapeHtml(item.data.corePoint || "未填卖点")}</span>
          <span class="saved-meta">${escapeHtml(normalizePurpose(item.data.purpose))} / ${escapeHtml(item.data.visualStyle || "")} / ${formatDate(item.savedAt)}</span>
        </button>
      `,
    )
    .join("");
}

function renderSavedLists() {
  renderSavedList("#recentList", storageGet(STORAGE_KEYS.recent, []), "还没有最近使用");
  renderSavedList("#historyList", storageGet(STORAGE_KEYS.history, []), "还没有生成历史");
  renderSavedList("#favoriteList", storageGet(STORAGE_KEYS.favorites, []), "还没有收藏关键词");
}

function restoreRecord(record) {
  setFormData(record.data);
  enterWorkspace(purposeInputValue(record.data.purpose));
  currentData = record.data;
  currentResults = {
    purpose: normalizePurpose(record.results.purpose || record.data.purpose),
    title: record.results.title || `${record.data.productType}关键词`,
    subtitle: record.results.subtitle || "历史记录",
    category: { name: record.results.categoryName || "历史记录" },
    blocks: record.results.blocks || [section("历史结果", record.results.plainText || "")],
    plainText: record.results.plainText || flattenBlocks(record.results.blocks || []),
    directions: [{ name: normalizePurpose(record.results.purpose || record.data.purpose) }],
    mainPrompt: "",
    backgroundPrompt: "",
    layoutAdvice: "",
    videoPrompt: "",
  };
  render(currentResults);
  showToast("已载入记录");
}

function findStoredRecord(type, id) {
  const keyMap = {
    recent: STORAGE_KEYS.recent,
    history: STORAGE_KEYS.history,
    favorite: STORAGE_KEYS.favorites,
  };
  return storageGet(keyMap[type], []).find((item) => item.id === id);
}

function getAllResultText() {
  return currentResults?.plainText || $("#resultOutput")?.innerText || "";
}

function selectResultText() {
  const target = $("#resultOutput");
  if (!target) return;
  const range = document.createRange();
  range.selectNodeContents(target);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function buildMarkdown() {
  if (!currentResults || !currentData) return "";
  return `# 电商视觉生成结果

- 产品类型：${currentData.productType}
- 核心卖点：${currentData.corePoint}
- 平台：${currentData.platform}
- 视觉风格：${currentData.visualStyle}
- 产品展示方式：${currentData.productDisplay || DEFAULT_DISPLAY_MODE}
- 输出用途：${currentData.purpose}
- 生成模式：${currentData.aiMode ? "AI模式" : "词库模式"}
- 生成时间：${new Date().toLocaleString()}

${currentResults.blocks
  .map((block) => {
    if (block.type === "version") {
      return `## ${block.title}\n\n${block.sections
        .map((item) => `### ${item.title}\n\n${item.content}`)
        .join("\n\n")}`;
    }
    return `## ${block.title}\n\n${block.content}`;
  })
  .join("\n\n")}
`;
}

function buildTxt() {
  if (!currentResults || !currentData) return "";
  return `电商视觉生成结果
产品类型：${currentData.productType}
核心卖点：${currentData.corePoint}
平台：${currentData.platform}
视觉风格：${currentData.visualStyle}
产品展示方式：${currentData.productDisplay || DEFAULT_DISPLAY_MODE}
输出用途：${currentData.purpose}
生成模式：${currentData.aiMode ? "AI模式" : "词库模式"}
生成时间：${new Date().toLocaleString()}

${currentResults.plainText}`;
}

function buildExcelHtml() {
  if (!currentResults || !currentData) return "";
  const rows = [
    ["产品类型", currentData.productType],
    ["核心卖点", currentData.corePoint],
    ["平台", currentData.platform],
    ["视觉风格", currentData.visualStyle],
    ["产品展示方式", currentData.productDisplay || DEFAULT_DISPLAY_MODE],
    ["输出用途", currentData.purpose],
    ["生成模式", currentData.aiMode ? "AI模式" : "词库模式"],
  ];
  currentResults.blocks.forEach((block) => {
    if (block.type === "version") {
      block.sections.forEach((item) => rows.push([`${block.title}-${item.title}`, item.content]));
    } else {
      rows.push([block.title, block.content]);
    }
  });
  return `<!doctype html><html><head><meta charset="utf-8"></head><body><table border="1">${rows
    .map((row) => `<tr><th>${escapeHtml(row[0])}</th><td>${escapeHtml(row[1])}</td></tr>`)
    .join("")}</table></body></html>`;
}

function downloadFile(filename, content, type) {
  if (!String(content || "").trim()) {
    showToast("还没有可导出的结果");
    return;
  }
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function safeBase64Encode(value) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(value))));
}

function safeBase64Decode(value) {
  return JSON.parse(decodeURIComponent(escape(atob(value))));
}

function makeSharePayload() {
  if (!currentResults || !currentData) return null;
  return {
    data: compactData(currentData),
    results: {
      purpose: currentResults.purpose,
      title: currentResults.title,
      subtitle: currentResults.subtitle,
      categoryName: currentResults.category.name,
      blocks: currentResults.blocks,
      plainText: currentResults.plainText,
    },
  };
}

function restoreShareFromHash() {
  const match = window.location.hash.match(/^#share=(.+)$/);
  if (!match) return;
  try {
    restoreFromShareData = safeBase64Decode(match[1]);
  } catch (error) {
    showToast("分享链接解析失败");
  }
}

function renderChipGroup(containerId, items, name, selected = []) {
  const selectedSet = new Set(selected);
  $(containerId).innerHTML = items
    .map(
      (item) => `
        <label class="chip-option">
          <input type="checkbox" name="${name}" value="${escapeHtml(item)}" ${selectedSet.has(item) ? "checked" : ""} />
          <span>${escapeHtml(item)}</span>
        </label>
      `,
    )
    .join("");
}

function renderChoiceGroup(containerId, items, name, selected = "") {
  $(containerId).innerHTML = items
    .map(
      (item, index) => `
        <label class="chip-option">
          <input type="radio" name="${name}" value="${escapeHtml(item)}" ${item === selected || (!selected && index === 0) ? "checked" : ""} />
          <span>${escapeHtml(item)}</span>
        </label>
      `,
    )
    .join("");
}

function styleDescription(name) {
  const module = knowledgeItems("backgroundModules").find((item) => item.name === name);
  if (module?.description) return module.description;
  return BACKGROUND_STYLE_DESCRIPTIONS[name] || "来自知识库的可复用背景方向";
}

function renderBackgroundStyleCards(containerId, items, selected = []) {
  const selectedSet = new Set(selected);
  $(containerId).innerHTML = items
    .map(
      (item, index) => `
        <label class="style-card">
          <input type="radio" name="backgroundStyleQuick" value="${escapeHtml(item)}" ${selectedSet.has(item) || (!selectedSet.size && index === 0) ? "checked" : ""} />
          <div class="style-card-body">
            <div class="style-thumb" aria-hidden="true"></div>
            <div class="style-copy">
              <b>${escapeHtml(item)}</b>
              <small>${escapeHtml(styleDescription(item))}</small>
            </div>
          </div>
        </label>
      `,
    )
    .join("");
}

function syncChipsFromData(data = {}) {
  const pointSet = new Set(Array.isArray(data.points) ? data.points : []);
  document.querySelectorAll("#sellingPointChips input").forEach((input) => {
    input.checked = pointSet.has(input.value);
  });
  const styleSet = new Set([data.backgroundScene, ...(data.backgroundStyles || []), data.visualStyle].filter(Boolean));
  document.querySelectorAll("#backgroundStyleChips input").forEach((input) => {
    input.checked = styleSet.has(input.value) || styleSet.has(BACKGROUND_STYLE_MAP[input.value]);
  });
  if (!document.querySelector("#backgroundStyleChips input:checked")) {
    const fallbackScene = document.querySelector("#backgroundStyleChips input[value='现代厨房']") || document.querySelector("#backgroundStyleChips input");
    if (fallbackScene) fallbackScene.checked = true;
  }
  const material = data.backgroundMaterial || "无材质";
  document.querySelectorAll("#backgroundMaterialChips input").forEach((input) => {
    input.checked = input.value === material;
  });
  if (!document.querySelector("#backgroundMaterialChips input:checked")) {
    const fallbackMaterial = document.querySelector("#backgroundMaterialChips input[value='无材质']") || document.querySelector("#backgroundMaterialChips input");
    if (fallbackMaterial) fallbackMaterial.checked = true;
  }
  const toneSet = new Set(String(data.tone || "").split(/\s*\+\s*/).filter(Boolean));
  document.querySelectorAll("#toneChips input").forEach((input) => {
    input.checked = toneSet.has(input.value);
  });
  if (!document.querySelector("#toneChips input:checked")) {
    const fallbackTone = document.querySelector("#toneChips input[value='米白']") || document.querySelector("#toneChips input");
    if (fallbackTone) fallbackTone.checked = true;
  }
  const legacyDecoration = (data.backgroundStyles || []).find((item) => QUICK_BACKGROUND_DECORATIONS.includes(item)) || "";
  const decoration = data.backgroundDecoration || legacyDecoration || "无";
  document.querySelectorAll("#backgroundDecorationChips input").forEach((input) => {
    input.checked = input.value === decoration;
  });
  if (!document.querySelector("#backgroundDecorationChips input:checked")) {
    const fallbackDecoration = document.querySelector("#backgroundDecorationChips input[value='无']") || document.querySelector("#backgroundDecorationChips input");
    if (fallbackDecoration) fallbackDecoration.checked = true;
  }
  const visualLanguage = data.visualLanguage || "商业摄影";
  document.querySelectorAll("#visualLanguageChips input").forEach((input) => {
    input.checked = input.value === visualLanguage;
  });
  if (!document.querySelector("#visualLanguageChips input:checked")) {
    const fallbackLanguage = document.querySelector("#visualLanguageChips input[value='商业摄影']") || document.querySelector("#visualLanguageChips input");
    if (fallbackLanguage) fallbackLanguage.checked = true;
  }
  const lighting = data.lightingEffect || "柔和漫反射";
  document.querySelectorAll("#lightingEffectChips input").forEach((input) => {
    input.checked = input.value === lighting;
  });
  if (!document.querySelector("#lightingEffectChips input:checked")) {
    const fallbackLighting = document.querySelector("#lightingEffectChips input[value='柔和漫反射']") || document.querySelector("#lightingEffectChips input");
    if (fallbackLighting) fallbackLighting.checked = true;
  }
  const layoutSet = new Set(data.layoutRules || []);
  const mainLayout = normalizeMainLayoutName(data.mainLayoutRule || [...layoutSet].find((item) => MAIN_LAYOUT_RULES.includes(normalizeMainLayoutName(item))) || "");
  document.querySelectorAll("#mainLayoutChips input").forEach((input) => {
    input.checked = input.value === mainLayout;
  });
  const assistSet = new Set(data.assistLayoutRules || [...layoutSet].filter((item) => !MAIN_LAYOUT_RULES.includes(normalizeMainLayoutName(item))));
  document.querySelectorAll("#assistLayoutChips input").forEach((input) => {
    input.checked = assistSet.has(input.value);
  });
}

function updateModeUI() {
  const purpose = getSelectedPurpose();
  const isBackground = purpose === BACKGROUND_PURPOSE;
  if (document.body?.dataset) document.body.dataset.mode = isBackground ? "background" : "main";
  document.querySelectorAll("[data-mode-panel]").forEach((item) => {
    item.hidden = item.dataset.modePanel !== (isBackground ? "background" : "main");
  });
  $("#modeTitle").textContent = isBackground ? "底图关键词" : "主图关键词";
  $("#modeHint").textContent = isBackground ? "场景 / 材质 / 色调 / 光效" : "产品 / 卖点 / 平台";
  $("#generateBtn").textContent = isBackground ? "生成底图关键词" : "生成主图关键词";
  const metric = $("#metricPrice");
  if (metric) metric.textContent = isBackground ? "预览版 + 纯背景版" : "产品预览版关键词";
}

function enterWorkspace(purpose = MAIN_PURPOSE) {
  const input = document.querySelector(`input[name='purpose'][value='${purposeInputValue(purpose)}']`);
  if (input) input.checked = true;
  updateModeUI();
  $("#landingPanel").hidden = true;
  $("#workspace").hidden = false;
  $("#workspaceToolbar").hidden = false;
  $("#historyDock").hidden = false;
}

function showLanding() {
  $("#landingPanel").hidden = false;
  $("#workspace").hidden = true;
  $("#workspaceToolbar").hidden = true;
  $("#historyDock").hidden = true;
  $("#historyDock").open = false;
}

function showLoginScreen() {
  $("#authScreen").hidden = false;
  $("#appMain").hidden = true;
  $("#loginError").hidden = true;
  $("#loginPassword").value = "";
}

function showAppShell() {
  $("#authScreen").hidden = true;
  $("#appMain").hidden = false;
}

function showAuthenticatedStart() {
  showAppShell();
  if (restoreFromShareData) {
    restoreRecord({
      id: "share",
      type: "share",
      savedAt: new Date().toISOString(),
      data: restoreFromShareData.data,
      results: restoreFromShareData.results,
    });
    return;
  }
  showLanding();
  const lastForm = storageGet(STORAGE_KEYS.lastForm, null);
  if (lastForm) setFormData(lastForm);
}

function populateControls() {
  const platforms = uniqueList([
    ...keywordData.platforms,
    ...knowledgeItems("platformRules").map((item) => item.name),
  ]).filter((item) => ["京东", "天猫", "淘宝"].includes(item));
  const visualStyles = uniqueList([
    ...Object.keys(keywordData.visualStyles),
    ...QUICK_BACKGROUND_SCENES,
    ...knowledgeItems("sceneTemplates").map((item) => item.name),
  ]);
  $("#platform").innerHTML = platforms.map((item) => `<option>${item}</option>`).join("");
  $("#visualStyle").innerHTML = visualStyles
    .map((item) => `<option>${item}</option>`)
    .join("");
  $("#productDisplay").innerHTML = Object.keys(keywordData.productDisplayModes || { [DEFAULT_DISPLAY_MODE]: {} })
    .map((item) => `<option>${item}</option>`)
    .join("");
  $("#productDisplay").value = DEFAULT_DISPLAY_MODE;
  $("#purposeGroup").innerHTML = [
    { value: MAIN_PURPOSE, label: "主图关键词", desc: "产品 + 卖点" },
    { value: "底图", label: "底图关键词", desc: "背景 + 色调" },
  ]
    .map(
      (item, index) => `
        <label class="purpose-option">
          <input name="purpose" type="radio" value="${item.value}" ${index === 0 ? "checked" : ""} />
          <span><b>${item.label}</b><small>${item.desc}</small></span>
        </label>
      `,
    )
    .join("");
  renderChipGroup("#sellingPointChips", QUICK_SELLING_POINTS, "sellingPointQuick", ["低糖饭"]);
  const sceneStyleOptions = backgroundModuleItems("scene").map((item) => item.name);
  const materialOptions = backgroundModuleItems("material").map((item) => item.name);
  const colorOptions = backgroundModuleItems("color").map((item) => item.name);
  const decorationOptions = backgroundModuleItems("decoration").map((item) => item.name);
  const visualLanguageOptions = backgroundModuleItems("visualLanguage").map((item) => item.name);
  const lightingOptions = backgroundModuleItems("lighting").map((item) => item.name);
  renderBackgroundStyleCards("#backgroundStyleChips", uniqueList([...QUICK_BACKGROUND_SCENES, ...sceneStyleOptions]), ["现代厨房"]);
  renderChoiceGroup("#backgroundMaterialChips", uniqueList([...QUICK_BACKGROUND_MATERIALS, ...materialOptions]), "backgroundMaterialQuick", "无材质");
  renderChoiceGroup("#toneChips", uniqueList([...QUICK_TONES, ...colorOptions]), "toneQuick", "米白");
  renderChoiceGroup("#backgroundDecorationChips", uniqueList([...QUICK_BACKGROUND_DECORATIONS, ...decorationOptions]), "backgroundDecorationQuick", "无");
  renderChoiceGroup("#visualLanguageChips", uniqueList([...QUICK_VISUAL_LANGUAGES, ...visualLanguageOptions]), "visualLanguageQuick", "商业摄影");
  renderChoiceGroup("#lightingEffectChips", uniqueList([...QUICK_LIGHTING_EFFECTS, ...lightingOptions]), "lightingEffectQuick", "柔和漫反射");
  renderChoiceGroup("#mainLayoutChips", MAIN_LAYOUT_RULES, "mainLayoutQuick", "右侧产品占位");
  renderChipGroup("#assistLayoutChips", ASSIST_LAYOUT_RULES, "assistLayoutQuick", ["底部预留价格区", "右下角留白"]);
  $("#productTypeList").innerHTML = uniqueList([
    ...keywordData.categories.map((item) => item.name),
    ...knowledgeItems("productTypes").map((item) => item.name),
  ])
    .map((item) => `<option value="${item}"></option>`)
    .join("");
  $("#platform").value = "京东";
  updateModeUI();
}

async function init() {
  try {
    restoreShareFromHash();
    authConfig = await loadAuthConfig();
    keywordData = await loadKeywordLibrary();
    populateControls();
    $("#libraryStatus").textContent = keywordData.knowledgeLoaded ? "结构化词库已加载" : "基础词库已加载";
    renderSavedLists();
    if (isAuthenticated()) showAuthenticatedStart();
    else showLoginScreen();
  } catch (error) {
    if (isAuthenticated()) showAppShell();
    else showLoginScreen();
    $("#libraryStatus").textContent = "词库加载失败";
    $("#libraryStatus").classList.add("error");
    $("#emptyState").querySelector("p").textContent =
      "词库加载失败。请通过本地网页服务或服务器访问，不要直接双击 file:// 打开。";
    console.error(error);
  }
}

$("#keywordForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!keywordData) {
    showToast("词库还没有加载成功");
    return;
  }
  const data = getFormData();
  currentData = data;
  saveLastForm();
  const results = await buildResults(data);
  render(results);
  const record = makeRecord("history", data, results);
  addRecord(STORAGE_KEYS.history, record, 30);
  addRecord(STORAGE_KEYS.recent, { ...record, type: "recent" }, 12);
});

$("#loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const username = $("#loginUsername").value.trim();
  const password = $("#loginPassword").value;
  if (!credentialsMatch(username, password)) {
    $("#loginError").hidden = false;
    $("#loginPassword").value = "";
    $("#loginPassword").focus();
    return;
  }
  setAuthenticated(true);
  $("#loginError").hidden = true;
  showAuthenticatedStart();
});

$("#logoutBtn").addEventListener("click", () => {
  setAuthenticated(false);
  showLoginScreen();
});

document.addEventListener("click", (event) => {
  const entry = event.target.closest("[data-entry-purpose]");
  if (entry) {
    enterWorkspace(entry.dataset.entryPurpose || MAIN_PURPOSE);
    return;
  }
  const copyButton = event.target.closest("[data-copy-index]");
  if (copyButton) {
    copyText(copyBlocks[Number(copyButton.dataset.copyIndex)] || "", "已复制该卡片");
    return;
  }
  const item = event.target.closest(".saved-item");
  if (!item) return;
  const record = findStoredRecord(item.dataset.recordType, item.dataset.recordId);
  if (record) restoreRecord(record);
});

document.addEventListener("change", (event) => {
  if (event.target.matches("input[name='purpose']")) updateModeUI();
  if (event.target.closest("#backgroundStyleChips")) {
    $("#bgStyleCustom").value = "";
    const selected = getSelectedBackgroundStyles()[0];
    if (selected) $("#visualStyle").value = primaryBackgroundStyle();
  }
  if (event.target.matches("#effectWordEnabled")) {
    $("#effectWordField").hidden = !event.target.checked;
    if (event.target.checked) $("#effectWordText").focus();
  }
});

$("#copyMain").addEventListener("click", () => {
  copyText(getAllResultText(), "已复制当前结果");
});

$("#copyAll").addEventListener("click", () => {
  copyText(getAllResultText(), "已复制全部结果");
});

$("#backHome").addEventListener("click", () => {
  showLanding();
});

$("#clearAll").addEventListener("click", () => {
  $("#keywordForm").reset();
  renderChipGroup("#sellingPointChips", QUICK_SELLING_POINTS, "sellingPointQuick", ["低糖饭"]);
  renderBackgroundStyleCards("#backgroundStyleChips", uniqueList([...QUICK_BACKGROUND_SCENES, ...backgroundModuleItems("scene").map((item) => item.name)]), ["现代厨房"]);
  renderChoiceGroup("#backgroundMaterialChips", uniqueList([...QUICK_BACKGROUND_MATERIALS, ...backgroundModuleItems("material").map((item) => item.name)]), "backgroundMaterialQuick", "无材质");
  renderChoiceGroup("#toneChips", uniqueList([...QUICK_TONES, ...backgroundModuleItems("color").map((item) => item.name)]), "toneQuick", "米白");
  renderChoiceGroup("#backgroundDecorationChips", uniqueList([...QUICK_BACKGROUND_DECORATIONS, ...backgroundModuleItems("decoration").map((item) => item.name)]), "backgroundDecorationQuick", "无");
  renderChoiceGroup("#visualLanguageChips", uniqueList([...QUICK_VISUAL_LANGUAGES, ...backgroundModuleItems("visualLanguage").map((item) => item.name)]), "visualLanguageQuick", "商业摄影");
  renderChoiceGroup("#lightingEffectChips", uniqueList([...QUICK_LIGHTING_EFFECTS, ...backgroundModuleItems("lighting").map((item) => item.name)]), "lightingEffectQuick", "柔和漫反射");
  renderChoiceGroup("#mainLayoutChips", MAIN_LAYOUT_RULES, "mainLayoutQuick", "右侧产品占位");
  renderChipGroup("#assistLayoutChips", ASSIST_LAYOUT_RULES, "assistLayoutQuick", ["底部预留价格区", "右下角留白"]);
  $("#effectWordEnabled").checked = false;
  $("#effectWordText").value = "";
  $("#effectWordField").hidden = true;
  $("#platform").value = "京东";
  document.querySelector("input[name='purpose'][value='主图']").checked = true;
  updateModeUI();
  $("#emptyState").hidden = false;
  $("#summary").hidden = true;
  $("#resultOutput").hidden = true;
  $("#resultOutput").innerHTML = "";
  currentData = null;
  currentResults = null;
  copyBlocks = [];
  localStorage.removeItem(STORAGE_KEYS.lastForm);
  showLanding();
  showToast("已清空");
});

$("#loadDemo").addEventListener("click", async () => {
  if (!keywordData) {
    showToast("词库还没有加载成功");
    return;
  }
  $("#productType").value = "低糖电饭煲";
  $("#bgProductType").value = "电饭煲";
  $("#sellingPoints").value = ["专业沥糖釜", "0涂层健康内胆", "22分钟快煮饭", "24小时预约", "米汤分离"].join("\n");
  $("#platform").value = "京东";
  $("#visualStyle").value = "玻璃花瓣";
  $("#productDisplay").value = DEFAULT_DISPLAY_MODE;
  $("#campaign").value = "618活动到手价";
  $("#benefits").value = "晒单返现【真实金额】；赠品【真实赠品】；价保【真实天数】";
  $("#appearance").value =
    "白色电饭煲完整商品摄影图，正面控制面板清晰，锅盖弧度、开盖结构、品牌Logo位置真实，主体比例不能改变";
  document.querySelector("input[name='purpose'][value='底图']").checked = true;
  syncChipsFromData({
    points: ["专业沥糖釜", "0涂层健康内胆"],
    backgroundScene: "现代厨房",
    backgroundStyles: ["现代厨房"],
    backgroundMaterial: "玻璃",
    backgroundDecoration: "玻璃花瓣",
    visualLanguage: "商业摄影",
    lightingEffect: "柔和漫反射",
    tone: "米白",
    mainLayoutRule: "右侧产品占位",
    assistLayoutRules: ["底部预留价格区", "右下角留白"],
    layoutRules: ["右侧产品占位", "底部预留价格区", "右下角留白"],
  });
  $("#bgStyleCustom").value = "";
  $("#bgToneCustom").value = "";
  $("#bgSpecial").value = "右下角必须留白，不能出现配件，背景要通透";
  $("#effectWordEnabled").checked = false;
  $("#effectWordText").value = "";
  $("#effectWordField").hidden = true;
  enterWorkspace("底图");
  currentData = getFormData();
  const results = await buildResults(currentData);
  render(results);
  const record = makeRecord("history", currentData, results);
  addRecord(STORAGE_KEYS.history, record, 30);
  addRecord(STORAGE_KEYS.recent, { ...record, type: "recent" }, 12);
  saveLastForm();
});

$("#keywordForm").addEventListener("input", () => {
  window.clearTimeout(saveLastForm.timer);
  saveLastForm.timer = window.setTimeout(saveLastForm, 250);
});

$("#keywordForm").addEventListener("change", saveLastForm);

$("#favoriteCurrent").addEventListener("click", () => {
  if (!currentResults || !currentData) {
    showToast("还没有可收藏的结果");
    return;
  }
  addRecord(STORAGE_KEYS.favorites, makeRecord("favorite", currentData, currentResults), 50);
  showToast("已收藏");
});

$("#exportMarkdown").addEventListener("click", () => {
  downloadFile("ecommerce-visual-keywords.md", buildMarkdown(), "text/markdown;charset=utf-8");
});

$("#exportTxt").addEventListener("click", () => {
  downloadFile("ecommerce-visual-keywords.txt", buildTxt(), "text/plain;charset=utf-8");
});

$("#exportExcel").addEventListener("click", () => {
  downloadFile("ecommerce-visual-keywords.xls", buildExcelHtml(), "application/vnd.ms-excel;charset=utf-8");
});

$("#shareResult").addEventListener("click", async () => {
  const payload = makeSharePayload();
  if (!payload) {
    showToast("还没有可分享的结果");
    return;
  }
  const url = `${window.location.origin}${window.location.pathname}#share=${safeBase64Encode(payload)}`;
  await copyText(url, "分享链接已复制");
});

$("#clearSavedData").addEventListener("click", () => {
  [STORAGE_KEYS.history, STORAGE_KEYS.favorites, STORAGE_KEYS.recent, STORAGE_KEYS.lastForm].forEach((key) =>
    localStorage.removeItem(key),
  );
  renderSavedLists();
  showToast("本地记录已清空");
});

init();
