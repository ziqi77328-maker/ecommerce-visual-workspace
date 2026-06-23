const DATA_URL = "./data/keywords.json";
const API_ENDPOINT = "/api/generate";
const STORAGE_KEYS = {
  lastForm: "ecommerceKeyword:lastForm",
  history: "ecommerceKeyword:history",
  favorites: "ecommerceKeyword:favorites",
  recent: "ecommerceKeyword:recent",
};

const $ = (selector) => document.querySelector(selector);

let keywordData = null;
let generationCount = 0;
let currentResults = null;
let currentData = null;
let restoreFromShareData = null;
let copyBlocks = [];

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
  return normalizePurpose(document.querySelector("input[name='purpose']:checked")?.value);
}

function getFormData() {
  const points = splitPoints($("#sellingPoints").value);
  return {
    productType: $("#productType").value.trim() || "【产品类型】",
    points,
    corePoint: points[0] || "【核心卖点】",
    auxPoints: points.slice(1, 6),
    platform: $("#platform").value,
    visualStyle: $("#visualStyle").value,
    purpose: getSelectedPurpose(),
    campaign: $("#campaign").value.trim() || "活动到手价",
    benefits: $("#benefits").value.trim() || "权益1：【真实权益】；权益2：【真实权益】",
    aiMode: $("#aiMode").checked,
    appearance:
      $("#appearance").value.trim() ||
      "锁定真实外观、Logo位置、控制面板、按键、把手、门体、锅盖、杯体、内胆和主体比例",
  };
}

function setFormData(data = {}) {
  $("#productType").value = data.productType || "";
  $("#sellingPoints").value = Array.isArray(data.points) ? data.points.join("\n") : data.sellingPoints || "";
  $("#platform").value = data.platform || $("#platform").value;
  $("#visualStyle").value = data.visualStyle || $("#visualStyle").value;
  $("#campaign").value = data.campaign && data.campaign !== "活动到手价" ? data.campaign : "";
  $("#benefits").value =
    data.benefits && !data.benefits.includes("【真实权益】") ? data.benefits : "";
  $("#appearance").value =
    data.appearance && !data.appearance.includes("锁定真实外观") ? data.appearance : "";
  $("#aiMode").checked = Boolean(data.aiMode);
  const purpose = purposeInputValue(data.purpose);
  const purposeInput = document.querySelector(`input[name='purpose'][value='${purpose}']`);
  if (purposeInput) purposeInput.checked = true;
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
  return keywordData.visualStyles[name] || Object.values(keywordData.visualStyles)[0];
}

function buildContext(data) {
  const category = getCategory(data.productType);
  const style = styleData(data.visualStyle);
  const seed = generationCount + data.productType.length + data.points.join("").length;
  const sceneBase = pick([...category.scenes, ...style.scene], seed, 3);
  const scenePosition = sceneBase.join("，");
  const layout = pick([...category.layouts, "右侧主体构图", "左侧预留排版区", "底部留白15%"], seed + 1, 3);
  const backgroundElements = pick(
    [
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
    [
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
  const evidence = pick(
    [...category.evidence, ...keywordData.fallback.evidence, ...category.vocabulary],
    seed + 4,
    5,
  );
  const selling = uniqueList(data.points.length ? data.points : category.vocabulary).slice(0, 5);
  return {
    category,
    style,
    seed,
    scenePosition,
    layout,
    backgroundElements,
    lighting,
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
  const title = `${data.productType}主图关键词`;
  const prompt = `${data.platform}电商主图，${data.productType}，核心卖点“${data.corePoint}”。${ctx.scenePosition}，${ctx.layout.join("，")}。主体占画面45%-60%，真实清晰，${ctx.lighting.join("，")}。卖点区只表达${data.corePoint}，辅助卖点包含${ctx.selling.slice(1, 5).join("、") || "【辅助卖点】"}。证据区使用${ctx.evidence.slice(0, 4).join("、")}证明卖点。底部成交区写${data.campaign}，到手价 ¥【真实价格】，${data.benefits}。禁止产品变形、Logo错误、控制面板模糊、文字乱码、参数臆造、背景抢主体。`;
  return createResult({
    purpose: "主图",
    title,
    subtitle: "单用途输出：只生成主图关键词",
    category: ctx.category,
    blocks: [
      section("主图定位", `${data.platform}平台转化主图，目标是第一眼看懂产品、卖点和成交理由。`),
      section("构图建议", `${ctx.layout.join("；")}；底部价格权益区控制在画面14%-18%；产品主体不可低于45%。`),
      section("卖点层级", `核心卖点：${data.corePoint}。辅助卖点：${ctx.selling.slice(1, 5).join(" / ") || "【待补充】"}。同一卖点不得重复出现在标题、贴片和价格区。`),
      section("证据与约束", `证据优先使用：${ctx.evidence.join(" / ")}。产品约束：${data.appearance}。`),
      section("AI生图关键词", prompt),
    ],
  });
}

function buildBackgroundResult(data, ctx) {
  if (ctx.style.backgroundTemplate?.id === "glassPetal") {
    return buildGlassPetalBackgroundResult(data, ctx);
  }
  const composition = `${ctx.layout.join("，")}，右侧或中心偏右预留55%主体位置，左侧预留卖点排版区，底部留白15%用于价格腰带`;
  const elements = ctx.backgroundElements.join("，");
  const light = ctx.lighting.join("，");
  const sharedScene = ctx.scenePosition;
  const productPrompt = `${data.platform}电商背景图产品版预览，${sharedScene}，${composition}，背景元素包含${elements}，光影氛围为${light}。画面中保留${data.productType}，自然融入场景，主体真实清晰，占画面约55%，${data.appearance}。背景服务后期排版，左侧和底部留白干净，画面无乱码文字，无虚假参数，适用于GPT、豆包、即梦、Liblib生图。`;
  const purePrompt = `电商排版纯背景底图，${sharedScene}，${composition}，背景元素包含${elements}，光影氛围为${light}。保持与版本A完全一致的场景、色调、光影、构图、元素和空间关系，仅删除主体实物，保留干净留白和真实空间透视。不要出现电饭煲、饭煲、破壁机、微波炉、空气炸锅、水壶、养生壶、内胆、配件、Logo、控制面板、品牌元素、主体轮廓、主体阴影、主体反光、包装、文字、数字、水印，适用于GPT、豆包、即梦、Liblib生图。`;
  return createResult({
    purpose: "背景图",
    title: `${data.productType}背景图关键词`,
    subtitle: "背景图模式：固定输出产品版和纯背景版，两套场景保持一致",
    category: ctx.category,
    blocks: [
      {
        type: "version",
        title: "版本A：产品版背景图提示词",
        sections: [
          section("场景定位", sharedScene),
          section("构图建议", composition),
          section("背景元素", elements),
          section("光影氛围", light),
          section("产品约束", `${data.appearance}。Logo位置不变，控制面板清晰，比例不可改变。`),
          section("AI生图关键词（产品版）", productPrompt),
        ],
      },
      {
        type: "version",
        title: "版本B：纯背景版提示词",
        sections: [
          section("场景定位", sharedScene),
          section("构图建议", composition),
          section("背景元素", elements),
          section("光影氛围", light),
          section("一致性要求", "场景、色调、光影、构图、元素、空间关系全部与版本A一致；唯一变化是删除主体实物。"),
          section("纯背景禁用内容", "禁止出现电饭煲、饭煲、破壁机、微波炉、空气炸锅、水壶、养生壶、内胆、配件、Logo、控制面板、品牌元素、主体轮廓、主体阴影、主体反光、包装、文字、数字、水印。"),
          section("AI生图关键词（纯背景版）", purePrompt),
        ],
      },
    ],
  });
}

function buildGlassPetalBackgroundResult(data, ctx) {
  const template = ctx.style.backgroundTemplate;
  const seed = ctx.seed;
  const scene = pick(
    [
      ...template.sceneDirection,
      "现代厨房抽象空间",
      "浅金/米白/银灰统一色调",
      "干净商业棚拍背景",
      "电商主图后期排版底图",
    ],
    seed,
    4,
  ).join("，");
  const composition = [
    "1:1正方形电商底图",
    "右侧预留主体位",
    "产品预览版主体占画面约50%-55%",
    "左侧预留标题区",
    "底部预留15%-18%价格权益区",
    "右下角必须留白，方便后期放证据图或卖点模块",
  ].join("，");
  const elements = pick(
    [
      ...template.visualElements,
      "浅金速度线点到为止",
      "玻璃材质折射层",
      "轻盈健康氛围",
      "高端材质感",
      "留白区干净",
    ],
    seed + 1,
    8,
  ).join("，");
  const light = pick(
    [...template.texture, ...ctx.lighting, "柔和椭圆背光", "真实台面接触阴影"],
    seed + 2,
    7,
  ).join("，");
  const productConstraint = `${data.productType}自然融入右侧产品位，产品外观锁定：${data.appearance}。Logo位置不变，控制面板清晰，比例不可改变，产品与台面有真实接触阴影和轻微反射。`;
  const baseConsistency = `场景为${scene}，构图为${composition}，背景元素为${elements}，光影质感为${light}`;
  const productPrompt = `${data.platform}电商玻璃花瓣背景产品预览图，${baseConsistency}。画面保留${data.productType}主体，${productConstraint}。背景通透、干净明亮，不生成广告文字、价格、乱码、促销标签、品牌Logo或多余配件。左侧和底部保留后期排版空间，适用于GPT、豆包、即梦、Liblib直接生图。`;
  const purePrompt = `电商玻璃花瓣纯背景底图，${baseConsistency}。删除所有主体实物，但保留原本右侧主体预留位的空间关系、光影层次、台面区域、投影方向和留白结构，方便后期在PS里重新放入商品图。画面不得出现任何主体实物、商品识别元素、文字、数字、水印或促销标签；具体禁用内容见负面提示词。适用于GPT、豆包、即梦、Liblib直接生成无产品底图。`;
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
  ]).join("，");

  return createResult({
    purpose: "背景图",
    title: `${data.productType}玻璃花瓣底图关键词`,
    subtitle: "底图模式：玻璃花瓣产品预览版 + 纯背景版",
    category: ctx.category,
    blocks: [
      section("场景定位", scene),
      section("构图说明", composition),
      section("背景元素", elements),
      section("光影质感", light),
      section("产品预览版提示词", productPrompt),
      section("纯背景版提示词", purePrompt),
      section("负面提示词", negative),
    ],
  });
}

function buildDetailResult(data, ctx) {
  const prompt = `${data.platform}电商详情页视觉，产品为${data.productType}，围绕${data.corePoint}拆成首屏利益、结构证据、使用场景、权益收口四段。风格为${data.visualStyle}，场景参考${ctx.scenePosition}，光影为${ctx.lighting.join("，")}。每屏只表达一个信息任务，证据包括${ctx.evidence.join("、")}。不要编造未提供的参数、检测数据和权益金额。`;
  return createResult({
    purpose: "商详",
    title: `${data.productType}商详关键词`,
    subtitle: "单用途输出：只生成商详关键词",
    category: ctx.category,
    blocks: [
      section("商详结构", "首屏核心利益 / 卖点解释 / 证据模块 / 场景模块 / 权益收口。"),
      section("模块关键词", `核心卖点：${data.corePoint}。辅助卖点：${ctx.selling.slice(1, 5).join(" / ") || "【待补充】"}。证据：${ctx.evidence.join(" / ")}。`),
      section("视觉建议", `${ctx.scenePosition}；${ctx.backgroundElements.join(" / ")}；${ctx.lighting.join(" / ")}。`),
      section("AI生图关键词", prompt),
    ],
  });
}

function buildVideoResult(data, ctx) {
  const prompt = `${data.productType}电商短视频，${data.visualStyle}，${data.platform}平台，5-8秒。镜头1展示${ctx.scenePosition}与主体入场；镜头2特写${ctx.evidence.slice(0, 3).join("、")}证明${data.corePoint}；镜头3用${ctx.backgroundElements.slice(0, 3).join("、")}表现功能结果；镜头4回到稳定主视觉并预留价格权益排版。产品外观不变形，面板清晰，不生成乱码和虚假价格。`;
  return createResult({
    purpose: "视频",
    title: `${data.productType}视频关键词`,
    subtitle: "单用途输出：只生成视频关键词",
    category: ctx.category,
    blocks: [
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
  if (!String(text || "").trim()) {
    showToast("还没有生成内容");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    showToast(label);
  } catch (error) {
    const helper = document.createElement("textarea");
    helper.value = text;
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
    showToast(label);
  }
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
  return currentResults?.plainText || "";
}

function buildMarkdown() {
  if (!currentResults || !currentData) return "";
  return `# 电商视觉生成结果

- 产品类型：${currentData.productType}
- 核心卖点：${currentData.corePoint}
- 平台：${currentData.platform}
- 视觉风格：${currentData.visualStyle}
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

function populateControls() {
  $("#platform").innerHTML = keywordData.platforms.map((item) => `<option>${item}</option>`).join("");
  $("#visualStyle").innerHTML = Object.keys(keywordData.visualStyles)
    .map((item) => `<option>${item}</option>`)
    .join("");
  $("#purposeGroup").innerHTML = keywordData.purposes
    .map(
      (item, index) => `
        <label class="purpose-option">
          <input name="purpose" type="radio" value="${item}" ${index === 0 ? "checked" : ""} />
          <span>${item}</span>
        </label>
      `,
    )
    .join("");
  $("#productTypeList").innerHTML = keywordData.categories
    .map((item) => `<option value="${item.name}"></option>`)
    .join("");
}

async function init() {
  try {
    restoreShareFromHash();
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`Failed to load ${DATA_URL}`);
    keywordData = await response.json();
    populateControls();
    $("#libraryStatus").textContent = "词库已加载";
    renderSavedLists();
    if (restoreFromShareData) {
      restoreRecord({
        id: "share",
        type: "share",
        savedAt: new Date().toISOString(),
        data: restoreFromShareData.data,
        results: restoreFromShareData.results,
      });
    } else {
      const lastForm = storageGet(STORAGE_KEYS.lastForm, null);
      if (lastForm) {
        setFormData(lastForm);
        showToast("已恢复上次输入");
      }
    }
  } catch (error) {
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

document.addEventListener("click", (event) => {
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

$("#copyMain").addEventListener("click", () => {
  copyText(getAllResultText(), "已复制当前结果");
});

$("#copyAll").addEventListener("click", () => {
  copyText(getAllResultText(), "已复制全部结果");
});

$("#clearAll").addEventListener("click", () => {
  $("#keywordForm").reset();
  $("#emptyState").hidden = false;
  $("#summary").hidden = true;
  $("#resultOutput").hidden = true;
  $("#resultOutput").innerHTML = "";
  currentData = null;
  currentResults = null;
  copyBlocks = [];
  localStorage.removeItem(STORAGE_KEYS.lastForm);
  showToast("已清空");
});

$("#loadDemo").addEventListener("click", async () => {
  if (!keywordData) {
    showToast("词库还没有加载成功");
    return;
  }
  $("#productType").value = "低糖电饭煲";
  $("#sellingPoints").value = ["专业沥糖釜", "0涂层健康内胆", "22分钟快煮饭", "24小时预约", "米汤分离"].join("\n");
  $("#platform").value = "京东";
  $("#visualStyle").value = "强促销浅背景";
  $("#campaign").value = "618活动到手价";
  $("#benefits").value = "晒单返现【真实金额】；赠品【真实赠品】；价保【真实天数】";
  $("#appearance").value =
    "白色电饭煲，正面控制面板清晰，锅盖弧度、开盖结构、品牌Logo位置、内胆和沥糖釜真实，比例不能改变";
  document.querySelector("input[name='purpose'][value='底图']").checked = true;
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
