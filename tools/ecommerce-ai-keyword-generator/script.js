const DATA_URL = "./data/keywords.json";
const API_ENDPOINT = "/api/generate";

const $ = (selector) => document.querySelector(selector);
const resultCards = Array.from(document.querySelectorAll(".result-card"));

let keywordData = null;
let generationCount = 0;

function splitPoints(value) {
  return value
    .split(/[\n,，、;；]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalize(text) {
  return text
    .replace(/[，。；、：:\s“”"'【】（）()]/g, "")
    .replace(/高转化|商业摄影|电商|主图|关键词|提示词/g, "")
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
  if (!list.some((item) => similarity(item, clean) > threshold)) {
    list.push(clean);
  }
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
  return document.querySelector("input[name='purpose']:checked")?.value || "主图";
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
    appearance:
      $("#appearance").value.trim() ||
      "锁定产品真实颜色、Logo位置、控制面板、按键、把手、门体、锅盖、杯体、内胆和主体比例",
  };
}

function getCategory(productType) {
  const text = productType.toLowerCase();
  return (
    keywordData.categories.find((category) =>
      category.matchKeywords.some((word) => text.includes(word.toLowerCase())),
    ) || keywordData.fallback.category
  );
}

function detectEvidenceRules(text, category) {
  const rules = [...(category.hardRules || [])];
  if (/低糖|沥糖|控糖|米汤分离/.test(text)) {
    rules.push("低糖饭证据必须为上方沥糖釜/沥糖篮装米饭 + 下方配套内胆，不能用普通内胆或饭碗替代");
  }
  if (/304/.test(text)) {
    rules.push("304不锈钢只在用户已确认时使用，优先调用固定304材质贴片或官方证据");
  }
  if (/316|316L|母婴级/.test(text)) {
    rules.push("316L/316母婴级只在用户已确认时使用，优先调用固定316材质贴片或官方证据");
  }
  if (/0涂层|零涂层/.test(text)) {
    rules.push("0涂层内胆优先使用固定内胆证据素材，保持材质和文字清晰");
  }
  if (/晶钛/.test(text)) {
    rules.push("晶钛卖点优先使用晶钛内胆证据，配合金色光圈和真实投影");
  }
  if (/AI|智能|控温|雷达/i.test(text)) {
    rules.push("AI/智能卖点可用蓝白数据流、雷达扫描、屏幕高光，但不能遮挡产品面板");
  }
  if (!rules.length) {
    rules.push("证据区用真实局部图、材质贴片或配件证明卖点，不做重复文字堆叠");
  }
  return uniqueList(rules);
}

function purposeNote(purpose) {
  const notes = {
    主图: "按高转化主图组织，保留价格权益闭环，适合搜索首图和活动图",
    底图: "为后期排字预留空间，画面不生成文字、数字、Logo和价格",
    视频: "强调镜头运动、光影变化、产品细节和卖点证据的动态呈现",
    商详: "适合拆成详情页首屏、卖点模块、证据模块和权益收口",
  };
  return notes[purpose] || notes.主图;
}

function expandSellingAngles(data, category, direction, offset) {
  const sourcePoints = data.points.length ? data.points : ["【核心卖点】", "【辅助卖点】"];
  const raw = [];
  sourcePoints.forEach((point, index) => {
    const verb = direction.titleVerbs[(index + offset) % direction.titleVerbs.length];
    if (direction.key === "safe") {
      raw.push(`${point}转成清晰购买理由，旁边放对应证据`);
      raw.push(`${verb}${point}，标题区只表达一次`);
    } else if (direction.key === "effect") {
      raw.push(`${point}做成第一眼视觉钩子，配合局部光效和动线`);
      raw.push(`${verb}${point}的结果感，证据贴片靠近产品`);
    } else {
      raw.push(`${point}用材质、光影和局部细节克制呈现`);
      raw.push(`${verb}${point}，避免廉价大字和过度火焰`);
    }
  });
  raw.push(...category.vocabulary.map((word) => `${word}作为参考词，重新组合进卖点或证据区`));
  return pick(raw, offset, 5);
}

function buildDirection(data, category, style, direction, index, evidenceRules) {
  const offset = generationCount + index * 3 + data.productType.length + data.points.join("").length;
  const styleScene = pick(style.scene, offset, 2).join("，");
  const styleTitle = pick(style.title, offset + 1, 2).join("，");
  const layout = pick([...direction.layoutBias, ...category.layouts], offset, 2).join(" / ");
  const evidence = pick(
    [...evidenceRules, ...category.evidence, ...keywordData.fallback.evidence],
    offset,
    5,
  );
  const visual = pick(
    [...direction.visual, ...category.scenes, styleScene, ...keywordData.fallback.structure],
    offset,
    6,
  );
  const sellingAngles = expandSellingAngles(data, category, direction, offset);
  const aux = uniqueList(data.auxPoints.length ? data.auxPoints : sellingAngles).slice(0, 5);
  const referenceNote =
    category.vocabulary?.length > 0
      ? `参考词库命中：${pick(category.vocabulary, offset, 5).join(" / ")}。这些词只作为素材，不原样固定返回。`
      : "词库未命中具体类目，已按电商视觉逻辑补充产品结构、证据区、价格区和真实光影关键词。";

  const titleOptions = uniqueList([
    `${data.corePoint}，把结果感讲清楚`,
    `围绕${data.corePoint}建立第一眼购买理由`,
    `${data.corePoint}，用证据减少用户顾虑`,
    direction.key === "effect" ? `${data.corePoint}，做成强视觉钩子` : "",
    direction.key === "premium" ? `${data.corePoint}，用质感和细节表达价值` : "",
  ]).slice(0, 3);

  const truthRules = keywordData.truthRules.join("；");
  const negative = keywordData.fallback.negative.join("，");

  const mainPrompt = `${direction.name}
定位：${direction.aim}
${referenceNote}

主图提示词：
${data.platform}电商${data.purpose}，产品为${data.productType}，方向为${direction.name}，视觉风格参考${data.visualStyle}但重新组合表达。
产品外观锁定：${data.appearance}。允许优化光影、清晰度、轮廓光、接触阴影和轻微透视；禁止改变型号、主色、Logo位置、控制面板、按键、旋钮、把手、门体、锅盖、杯体、内胆和产品比例。
推荐版式：${layout}。产品占画面45%-60%，主体清晰，背景服务产品，不抢主体。
标题扩写候选：
1. ${titleOptions[0] || data.corePoint}
2. ${titleOptions[1] || `${data.corePoint}建立购买理由`}
3. ${titleOptions[2] || `${data.corePoint}用证据证明`}
辅助卖点重组：
${aux.map((item, itemIndex) => `${itemIndex + 1}. ${item}`).join("\n")}
证据区：${evidence.join("；")}。证据区只证明卖点，不复读主标题。
视觉关键词：${visual.join("；")}；${styleTitle}；真实商业摄影；信息层级清晰；缩略图可读。
价格权益区：${data.campaign}，到手价 ¥【真实价格】，${data.benefits}。${direction.price}。底部价格腰带高度14%-18%，含服务条总成交区不超过22%。
去重复约束：核心卖点只在标题区表达一次；容量如有只出现一次且放产品主体右侧上半部；右侧证据贴片出现过的卖点不再进入左侧文字列表；价格权益区只写成交权益。
真实性约束：${truthRules}。
负面关键词：${negative}。`;

  const backgroundPrompt = `${direction.name}
无字底图提示词：
${data.platform}电商无字底图，产品为${data.productType}，方向为${direction.name}。背景参考${styleScene}，但不要生成任何文字、数字、Logo、价格、角标或促销贴片。
画面布局：${layout}；产品或产品摆放位占45%-60%；左侧/上方预留卖点空间；底部预留价格权益空间；证据贴片位靠近产品但不生成文字。
可落地细节：${visual.join("；")}。围绕${data.corePoint}准备证据位置：${evidence.slice(0, 3).join("；")}。
禁止：背景抢主体，过度梦幻，证据配件变形，生成乱码，生成虚假价格和参数。`;

  const layoutAdvice = `${direction.name}
卖点排版建议：
1. 主阅读线：品牌/平台背书 -> ${titleOptions[0] || data.corePoint} -> 产品主体 -> 证据区 -> 价格权益。
2. 版式：${layout}。
3. 标题：只讲${data.corePoint}，不要把同一句话拆成多个贴片重复出现。
4. 辅助卖点：${aux.slice(0, 4).join(" / ")}。每个卖点只占一个区域。
5. 证据区：${evidence.slice(0, 4).join(" / ")}。证据必须贴近对应结构，不能变成装饰。
6. 价格区：${direction.price}；没有真实价格时保留¥【真实价格】和【真实权益】占位。
7. 去重复结果：已过滤相似表达，避免连续使用同一批泛词；同类词只保留最能落地的一句。`;

  const videoPrompt = `${direction.name}
豆包视频关键词：
${data.productType}，${direction.name}，${data.visualStyle}，${data.platform}电商短视频，5-8秒。
镜头1：${pick(["正面略俯视推近", "从产品侧前方滑入", "低角度轻推镜"], offset, 1)[0]}，展示真实产品主体和轮廓光。
镜头2：扫过${evidence.slice(0, 3).join("、")}，用局部特写证明${data.corePoint}。
镜头3：${direction.key === "effect" ? "加入克制光效、速度线和结果感转场" : direction.key === "premium" ? "用慢速棚拍光影和材质反射展示高级感" : "用清晰卖点卡位置和产品证据建立购买理由"}。
镜头4：回到稳定主视觉，底部预留价格权益区，便于后期加${data.campaign}和成交权益。
动态关键词：${visual.slice(0, 5).join("，")}，产品不变形，面板清晰，证据真实，背景低干扰。
负面关键词：不要改变外观，不要生成错误Logo，不要乱码，不要虚假价格，不要烟雾遮挡产品，不要证据配件变形。`;

  return {
    name: direction.name,
    layout,
    evidence,
    mainPrompt,
    backgroundPrompt,
    layoutAdvice,
    videoPrompt,
  };
}

async function requestApiGenerate(payload) {
  if (!keywordData.api?.enabled) return null;
  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("API generate failed");
  return response.json();
}

async function buildResults(data) {
  const apiResult = await requestApiGenerate(data);
  if (apiResult) return apiResult;

  generationCount += 1;
  const category = getCategory(data.productType);
  const style = keywordData.visualStyles[data.visualStyle] || Object.values(keywordData.visualStyles)[0];
  const allText = `${data.productType} ${data.points.join(" ")} ${data.appearance}`;
  const evidenceRules = detectEvidenceRules(allText, category);
  const directions = keywordData.directions.map((direction, index) =>
    buildDirection(data, category, style, direction, index, evidenceRules),
  );

  const formatGroup = (key) =>
    directions.map((item) => `${item.name}\n${item[key]}`).join("\n\n--------------------------------\n\n");

  return {
    category,
    evidenceRules,
    directions,
    mainPrompt: formatGroup("mainPrompt"),
    backgroundPrompt: formatGroup("backgroundPrompt"),
    layoutAdvice: `词库增强说明：词库仅作为参考素材，本次已按“${data.productType} + ${data.corePoint} + ${data.platform} + ${data.visualStyle}”重新组合扩写。${purposeNote(data.purpose)}\n\n${formatGroup("layoutAdvice")}`,
    videoPrompt: formatGroup("videoPrompt"),
  };
}

function render(results) {
  $("#emptyState").hidden = true;
  $("#summary").hidden = false;
  resultCards.forEach((card) => {
    card.hidden = false;
  });
  $("#metricDirections").textContent = results.directions.map((item) => item.name).join(" / ");
  $("#metricLibrary").textContent = `${keywordData.version} · ${results.category.name}`;
  $("#metricPrice").textContent = "三方向均保留成交区，不编造金额";
  $("#metricRisk").textContent = "词库参考 + 相似表达去重复";
  $("#mainPrompt").textContent = results.mainPrompt;
  $("#backgroundPrompt").textContent = results.backgroundPrompt;
  $("#layoutAdvice").textContent = results.layoutAdvice;
  $("#videoPrompt").textContent = results.videoPrompt;
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1500);
}

async function copyText(text, label = "已复制") {
  if (!text.trim()) {
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
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`Failed to load ${DATA_URL}`);
    keywordData = await response.json();
    populateControls();
    $("#libraryStatus").textContent = "词库已加载";
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
  const results = await buildResults(data);
  render(results);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-copy]");
  if (!button) return;
  const id = button.dataset.copy;
  copyText($(`#${id}`).textContent, "已复制该结果");
});

$("#copyMain").addEventListener("click", () => {
  copyText($("#mainPrompt").textContent, "已复制主图提示词");
});

$("#copyAll").addEventListener("click", () => {
  const all = ["mainPrompt", "backgroundPrompt", "layoutAdvice", "videoPrompt"]
    .map((id) => $(`#${id}`).textContent.trim())
    .filter(Boolean)
    .join("\n\n--------------------------------\n\n");
  copyText(all, "已复制全部结果");
});

$("#clearAll").addEventListener("click", () => {
  $("#keywordForm").reset();
  $("#emptyState").hidden = false;
  $("#summary").hidden = true;
  resultCards.forEach((card) => {
    card.hidden = true;
  });
  ["mainPrompt", "backgroundPrompt", "layoutAdvice", "videoPrompt"].forEach((id) => {
    $(`#${id}`).textContent = "";
  });
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
    "白色电饭煲，正面控制面板清晰，锅盖弧度、开盖结构、品牌Logo位置、内胆和沥糖釜真实，产品比例不能改变";
  document.querySelector("input[name='purpose'][value='主图']").checked = true;
  render(await buildResults(getFormData()));
});

init();
