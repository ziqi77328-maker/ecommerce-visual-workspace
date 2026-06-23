const form = document.querySelector("#productForm");
const runButton = document.querySelector("#runExtract");
const resetButton = document.querySelector("#resetAll");
const loadBlenderButton = document.querySelector("#loadBlenderCase");
const productImagesInput = document.querySelector("#productImages");
const imagePreviewGrid = document.querySelector("#imagePreviewGrid");
const imageCount = document.querySelector("#imageCount");
const accessoryImagesInput = document.querySelector("#accessoryImages");
const accessoryImagePreviewGrid = document.querySelector("#accessoryImagePreviewGrid");
const accessoryImageCount = document.querySelector("#accessoryImageCount");
const referenceImagesInput = document.querySelector("#referenceImages");
const referenceImagePreviewGrid = document.querySelector("#referenceImagePreviewGrid");
const referenceImageCount = document.querySelector("#referenceImageCount");
const evidenceImagesInput = document.querySelector("#evidenceImages");
const evidenceImagePreviewGrid = document.querySelector("#evidenceImagePreviewGrid");
const evidenceImageCount = document.querySelector("#evidenceImageCount");
const sellPointList = document.querySelector("#sellPointList");
const benefitList = document.querySelector("#benefitList");
const addSellPointButton = document.querySelector("#addSellPoint");
const addBenefitButton = document.querySelector("#addBenefit");
const optimizePointsButton = document.querySelector("#optimizePoints");
let productImages = [];
let accessoryImages = [];
let referenceImages = [];
let evidenceImages = [];
const maxImages = 6;
const maxSellPoints = 6;
const maxBenefits = 6;

const output = {
  score: document.querySelector("#scoreNumber"),
  risk: document.querySelector("#riskNumber"),
  status: document.querySelector("#statusText"),
  provided: document.querySelector("#providedList"),
  missing: document.querySelector("#missingList"),
  blocked: document.querySelector("#blockedList"),
  assets: document.querySelector("#assetList"),
  warning: document.querySelector("#warningList"),
  preview: document.querySelector("#previewText"),
  prompt: document.querySelector("#promptText"),
  blankPrompt: document.querySelector("#blankPromptText"),
  pureBackgroundPrompt: document.querySelector("#pureBackgroundPromptText"),
};

const requiredFields = [
  ["brand", "品牌"],
  ["category", "类目"],
  ["appearance", "产品真实外观"],
  ["corePoint", "主标题"],
  ["price", "价格"],
  ["benefit1", "成交权益1"],
];

const cannotInvent = [
  "型号结构",
  "容量",
  "功率",
  "材质编号",
  "检测数据",
  "降糖比例",
  "抗菌率",
  "到手价",
  "返现",
  "赠品",
  "补贴",
  "售后承诺",
];

const fixedAssetRules = [
  {
    keys: ["低糖", "沥糖", "控糖", "米汤分离"],
    text: "低糖/沥糖：常用图片/沥糖釜.jpg",
  },
  {
    keys: ["304"],
    text: "304不锈钢：常用图片/304不锈钢材质贴片1.png 或 304不锈钢材质贴片2.jpg",
  },
  {
    keys: ["316", "316L"],
    text: "316/316L：常用图片/316母婴级不锈钢材质贴片1.png 或 316母婴级不锈钢材质贴片2.png",
  },
  {
    keys: ["0涂层", "零涂层"],
    text: "0涂层：常用图片/0涂层电饭煲内胆1.png 或 0涂层电饭煲内胆 特效.png",
  },
  {
    keys: ["晶钛"],
    text: "晶钛：常用图片/晶钛电饭煲内胆1.png",
  },
];

const blenderCase = {
  brand: "Midea 美的",
  platform: "京东/天猫",
  category: "破壁机 / 豆浆机",
  model: "",
  capacity: "1.75L",
  price: "399",
  appearance:
    "灰色机身，透明搅拌杯，杯体右侧把手，顶部杯盖结构，正面数显控制面板，橙色数字屏显，按键布局清晰，底部 Midea Logo 清晰可见。",
  corePoint: "精钢6叶龙牙刀",
  subtitle: "细腻破壁 香浓好喝",
  subPoint1: "一键高温洗",
  subBenefit1: "清洗省心 不易藏污",
  subIcon1: true,
  subPoint2: "不粘发热盘",
  subBenefit2: "加热顺滑 更好清洁",
  subIcon2: true,
  subPoint3: "1000W整机搅拌功率",
  subBenefit3: "强劲搅打 细腻出浆",
  subIcon3: true,
  subPoint4: "大功率凹盘加热",
  subBenefit4: "均匀受热 香浓释放",
  subIcon4: true,
  benefit1: "正品保障 送运费险",
  campaign: "活动到手价",
  priceBelt: "底部红金强促销价格腰带",
  layout: "左文右品强促销版式",
  composition: "左右构图",
  goal: "活动促销",
  sellingFrameTone: "亮晶晶黑金边框",
  sellingBoardMode: "卖点背景板包含标题",
  accessoryLayout: "右下前景前后错落",
  lockAccessoryCount: true,
  backgroundMode: "黑金火焰特效背景",
  backgroundStyle: "深色高端棚拍",
  effectTextMode: "特效字融入背景",
  backgroundPropsCustom: "水果切片、少量果汁、豆浆、黄豆、燕麦、小玻璃碗、金属小勺",
  scene:
    "浅灰、暖白、浅金色现代厨房或电商摄影棚背景。产品透明杯内加入真实水果块和橙黄色/粉橙色果汁液体，前景只摆放 2-3 杯饮品，搭配水果切片、黄豆、燕麦、小玻璃碗、金属小勺和浅色托盘，饮品杯低于产品主体。",
  evidence: "6叶刀头结构示意；凹盘加热细节",
  confirmed: true,
  officialChecked: false,
};

function getData() {
  const data = Object.fromEntries(new FormData(form).entries());
  data.confirmed = form.elements.confirmed.checked;
  data.officialChecked = form.elements.officialChecked.checked;
  data.lockAccessoryCount = form.elements.lockAccessoryCount.checked;
  data.imageCount = productImages.length;
  data.imageNames = productImages.map((item) => item.file.name);
  data.accessoryImageCount = accessoryImages.length;
  data.accessoryImageNames = accessoryImages.map((item) => item.file.name);
  data.referenceImageCount = referenceImages.length;
  data.referenceImageNames = referenceImages.map((item) => item.file.name);
  data.evidenceImageCount = evidenceImages.length;
  data.evidenceImageNames = evidenceImages.map((item) => item.file.name);
  data.backgroundProps = Array.from(form.querySelectorAll('input[name="backgroundProps"]:checked')).map((item) => item.value);
  return data;
}

function setData(data) {
  Object.entries(data).forEach(([name, value]) => {
    const element = form.elements[name];
    if (!element) return;
    if (name === "backgroundProps" && Array.isArray(value)) {
      form.querySelectorAll('input[name="backgroundProps"]').forEach((checkbox) => {
        checkbox.checked = value.includes(checkbox.value);
      });
    } else if (element.type === "checkbox") {
      element.checked = Boolean(value);
    } else {
      element.value = value;
    }
  });
}

function present(value) {
  return String(value || "").trim();
}

function compact(items) {
  return items.map((item) => present(item)).filter(Boolean);
}

function uniqueItems(items) {
  const seen = new Set();
  return compact(items).filter((item) => {
    const key = item.replace(/\s+/g, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueLines(text) {
  const seen = new Set();
  return text
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => {
      const key = line.replace(/\s+/g, "");
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function subPoints(data) {
  const rows = Array.from(sellPointList.querySelectorAll(".sellpoint-row"));
  return rows.map((row) => {
    const index = row.dataset.index;
    const fileInput = row.querySelector(`[name="subImage${index}"]`);
    const file = fileInput?.files?.[0];
    return {
      point: present(data[`subPoint${index}`]),
      benefit: present(data[`subBenefit${index}`]),
      icon: Boolean(row.querySelector(`[name="subIcon${index}"]`)?.checked),
      imageMode: Boolean(row.querySelector(`[name="subImageMode${index}"]`)?.checked),
      imageName: file ? file.name : "",
    };
  }).filter((item) => item.point);
}

function benefits(data) {
  const rows = Array.from(benefitList.querySelectorAll(".benefit-row"));
  return rows
    .map((row) => {
      const index = row.dataset.index;
      return present(data[`benefit${index}`]);
    })
    .filter(Boolean);
}

function hasAny(text, keys) {
  return keys.some((key) => text.includes(key));
}

function detectAssets(data) {
  const allText = Object.values(data).join(" ");
  const assets = fixedAssetRules
    .filter((rule) => hasAny(allText, rule.keys))
    .map((rule) => rule.text);
  return assets.length ? assets : ["无命中固定素材"];
}

function detectDuplicates(data, points) {
  const issues = [];
  const core = present(data.corePoint);
  if (core && points.some((item) => item.point === core)) {
    issues.push("主标题在辅助卖点重复出现");
  }
  const capacity = present(data.capacity);
  if (capacity) {
    const textFields = [data.corePoint, ...points.flatMap((item) => [item.point, item.benefit]), data.evidence, ...benefits(data)]
      .join(" ");
    if (textFields.includes(capacity)) {
      issues.push("容量不能进入标题、辅助卖点、证据区或价格区");
    }
  }
  const benefitText = benefits(data).join(" ");
  points.forEach((item) => {
    if (item.point && benefitText.includes(item.point)) {
      issues.push(`价格权益区重复产品功能卖点：${item.point}`);
    }
  });
  return issues;
}

function decideMissing(data) {
  const missing = requiredFields
    .filter(([field]) => !present(data[field]))
    .map(([, label]) => label);
  if (!present(data.capacity)) missing.push("容量，可用【待确认】占位");
  if (!data.imageCount) missing.push("产品图，可用文字外观锁定替代");
  if (!data.confirmed) missing.push("用户确认");
  return missing;
}

function backgroundProps(data) {
  return uniqueItems([...(Array.isArray(data.backgroundProps) ? data.backgroundProps : []), present(data.backgroundPropsCustom)]);
}

function selectedBackgroundProps(data) {
  return uniqueItems(Array.isArray(data.backgroundProps) ? data.backgroundProps : []);
}

function customBackgroundProps(data) {
  return present(data.backgroundPropsCustom)
    .split(/[、,，/]/)
    .map((item) => present(item))
    .filter(Boolean);
}

function effectiveBackgroundProps(data) {
  const selected = selectedBackgroundProps(data);
  if (selected.length) return selected;
  return uniqueItems(customBackgroundProps(data));
}

function blockedBackgroundProps(data) {
  const known = ["米饭", "果汁", "水果", "豆浆", "内胆", "沥糖釜"];
  const selected = new Set(effectiveBackgroundProps(data));
  return known.filter((item) => !selected.has(item));
}

function backgroundPropRule(data) {
  const selected = effectiveBackgroundProps(data);
  const blocked = blockedBackgroundProps(data);
  if (selected.length) {
    return `背景配件只能使用：${selected.join("、")}。未勾选或未填写的配件不要出现${blocked.length ? `，尤其不要出现：${blocked.join("、")}` : ""}。`;
  }
  return "未选择背景配件，画面不主动添加果汁、豆浆、水果、米饭、内胆等装饰物，只保留干净背景和产品。";
}

function backgroundStyleLabel(data) {
  if (present(data.backgroundStyle) === "自定义背景质感") {
    return present(data.backgroundStyleCustom) || "【自定义背景质感待填写】";
  }
  return present(data.backgroundStyle) || "深色高端棚拍";
}

function backgroundStyleGuidance(style) {
  if (style.includes("深色高端棚拍")) {
    return "深色背景不是纯黑，要有深灰、黑金、石材纹理、暗金渐变或斜向光纹。背景有层次但不抢产品，产品后方有柔亮背光圈，只亮产品周围，把轮廓托出来。产品质感靠反光，不靠磨皮，金属拉丝、玻璃反射、面板高光、边缘白色轮廓光、接触阴影和台面反射都要清楚。";
  }
  if (style.includes("黑金火焰")) {
    return "黑金火焰大促背景，深黑到暖金渐变，产品后方有金色火焰光环和橙金流光，底部有金色圆形舞台，火焰只托亮轮廓，不遮挡产品和文字。";
  }
  if (style.includes("深灰石材")) {
    return "深灰石材质感背景，低饱和黑灰纹理，局部暖金反射，产品后方有柔和聚光和白色轮廓光，整体高级克制。";
  }
  if (style.includes("金色光圈")) {
    return "金色光圈舞台背景，产品后方有圆弧光圈、金色速度线和局部星芒，产品底部有金属平台和真实接触阴影。";
  }
  if (style.includes("真实厨房")) {
    return "真实厨房轻场景，背景干净柔和，厨房元素弱化，不抢产品主体。";
  }
  if (style.includes("金色丝绸")) {
    return "金色丝绸光效舞台，柔和金色布纹和波纹光带作为中后景，不遮挡产品。";
  }
  if (style.includes("黑金科技")) {
    return "黑金科技光圈舞台，深黑背景、金色科技线条、圆弧光圈和少量粒子，突出产品轮廓和高端科技感。";
  }
  return style;
}

function scenePromptLine(data) {
  const scene = present(data.scene) || "深色高端电商棚拍背景，产品周围有柔亮背光圈，真实接触阴影和台面反射。";
  if (effectiveBackgroundProps(data).length) {
    return `场景氛围按“背景选择”和“背景质感”执行；如果场景输入框里出现食物、饮品或配件词，不要读取那些词，只按背景光影和空间关系理解。${backgroundPropRule(data)}`;
  }
  return `${scene} ${backgroundPropRule(data)}`;
}

function propLimitGuidance(data) {
  const props = effectiveBackgroundProps(data);
  if (!props.length) {
    return "装饰物控制：未选择背景配件，不主动添加食物、饮品或厨房小物，画面只保留产品、光效、台面和必要阴影。";
  }
  return `装饰物控制：只使用已选择的 ${props.join("、")}，数量少而精，低于产品主体，不遮挡产品、Logo、控制面板、卖点区和价格区。未选择的装饰物不要出现。`;
}

function accessoryLayoutLabel(data) {
  if (present(data.accessoryLayout) === "自定义配件摆放") {
    return present(data.accessoryLayoutCustom) || "【自定义配件摆放待填写】";
  }
  return present(data.accessoryLayout) || "右下前景前后错落";
}

function hasInnerPotAccessory(data) {
  const text = [
    ...effectiveBackgroundProps(data),
    present(data.backgroundPropsCustom),
    present(data.scene),
    present(data.evidence),
    present(data.appearance),
    ...(Array.isArray(data.accessoryImageNames) ? data.accessoryImageNames : []),
  ].join(" ");
  return /内胆|内锅|锅胆|沥糖釜|釜/.test(text);
}

function accessoryCountRule(data) {
  if (!data.accessoryImageCount) {
    return "未上传配件图，如画面需要配件，只能使用已确认文字里的配件，不能新增赠品或未确认附件。";
  }
  const names = data.accessoryImageNames.length ? `（${data.accessoryImageNames.join(" / ")}）` : "";
  const identity = accessoryIdentityRule(data);
  if (data.lockAccessoryCount) {
    return `本次上传了 ${data.accessoryImageCount} 张配件图${names}，必须生成 ${data.accessoryImageCount} 个独立配件实物；一张配件图对应一个配件，不能把多张图合并成 1 个，不能省略其中任何一个，也不能新增未上传的配件。${identity}`;
  }
  return `本次上传了 ${data.accessoryImageCount} 张配件图${names}，用于锁定真实配件外观；配件只能作为辅助展示，不得替代产品主体。${identity}`;
}

function accessoryIdentityRule(data) {
  const custom = present(data.accessoryItems);
  if (custom) {
    return `配件身份逐个锁定：${cleanSentence(custom)}。每个配件按对应说明独立生成，不能互相融合，不能套在一起，不能把其中一个变成另一个的内部结构。`;
  }
  if (data.accessoryImageCount >= 2) {
    return `把这些配件明确区分为“配件1、配件2${data.accessoryImageCount > 2 ? "、配件3等" : ""}”，每个都是独立物体，必须能看到各自完整外轮廓和台面接触阴影；不能套叠成一个锅，不能一个放进另一个里面，不能只露出一个配件的外观。`;
  }
  return "";
}

function accessoryPlacementRule(data) {
  const props = effectiveBackgroundProps(data);
  const layout = accessoryLayoutLabel(data);
  const selectedLine = props.length ? `当前允许出现的背景配件为：${props.join("、")}。` : "未选择背景配件时，不主动添加配件。";
  if (!data.accessoryImageCount && !props.length) {
    return `${selectedLine} 配件摆放：无配件陈列，只保留产品和背景。`;
  }
  const innerPotLine = hasInnerPotAccessory(data)
    ? "内胆/内锅/沥糖釜类配件必须作为真实独立实物出现，优先放在产品前方右下角，属于前景证据，不是贴片、不是悬浮图标、不是背景装饰。"
    : "";
  if (layout === "产品前方横向陈列") {
    return `${selectedLine} ${innerPotLine}配件摆放：配件位于产品前方低位横向陈列，整体高度低于产品主体 35%，左右有轻微前后距离，有真实接触阴影和台面反射，不能遮挡产品 Logo、控制面板和主体轮廓。`;
  }
  if (layout === "产品旁边局部证据") {
    return `${selectedLine} ${innerPotLine}配件摆放：配件位于产品旁边或右下角，作为小型局部证据展示，总占比不超过产品主体的 30%-40%，边缘清晰，有前后层次，不做大面积配件堆叠。`;
  }
  if (present(data.accessoryLayout) === "自定义配件摆放") {
    return `${selectedLine} ${innerPotLine}配件摆放：${layout}。配件低于产品主体，不遮挡产品关键结构，有真实接触阴影、前后层次和台面反射。`;
  }
  return `${selectedLine} ${innerPotLine}配件摆放：配件必须位于产品前方右下角，不能放到产品后面或画面边缘。若有 2 个以上配件，前方配件略大略低、后方配件略小略高，形成前后错落关系，但两个配件之间必须留出可见分界和一点台面缝隙，不能套在一起，不能融合成一个锅，不能一个配件装在另一个配件里面，不能只剩一个外轮廓。配件整体占比不超过产品主体的 35%-45%，单个配件不超过产品主体的 25%-30%。配件要站在台面上，有各自独立的接触阴影和轻微反射，不能漂浮，不能排成平面贴片，不能遮挡产品 Logo、控制面板、把手、杯体/锅盖/门体和底部轮廓。`;
}

function sellingFrameStyle(data) {
  if (present(data.sellingFrameTone) === "自定义") {
    return present(data.sellingFrameCustom) || "【自定义卖点边框待填写】";
  }
  return present(data.sellingFrameTone) || "黑色边框金色背景板";
}

function frameVisualDescription(data) {
  const tone = present(data.sellingFrameTone);
  if (tone === "黑色边框金色背景板" || !tone) {
    return "深黑色描边，浅金色渐变空白底板";
  }
  if (tone === "亮晶晶黑金边框") {
    return "亮晶晶黑金精修质感，深黑钢琴烤漆描边，金色金属倒角，玻璃高光扫光，浅金香槟色渐变空白底板，细小星芒高光";
  }
  if (tone === "金色边框黑色背景板") {
    return "金色描边，深黑色空白底板";
  }
  if (tone === "米色边框红色背景板") {
    return "米白色描边，红色空白底板";
  }
  return present(data.sellingFrameCustom) || "自定义颜色的空白卖点边框";
}

function sellPointVisualLine(points) {
  if (!points.length) return "小卖点未填写，暂不生成小图标或卖点图片。";
  const lines = points.map((item, index) => {
    const visual = [];
    if (item.icon) visual.push("小图标");
    if (item.imageMode) visual.push(item.imageName ? `上传图片“${item.imageName}”` : "上传图片【待选择】");
    return `卖点${index + 1}：${visual.length ? visual.join(" + ") : "纯文字模块"}`;
  });
  return lines.join("；");
}

function hasAnySellPointVisual(points) {
  return points.some((item) => item.icon || item.imageMode);
}

function sellPointImageCount(points) {
  return points.filter((item) => item.imageName).length;
}

function effectTextGuidance(mode) {
  if (mode === "不生成特效字") {
    return "不生成任何特效文字，只保留金色光环、火焰、流光和舞台光效。";
  }
  if (mode === "只留特效字位置") {
    return "只预留特效字发光位置和能量光效，不生成可读文字，方便后期叠加特效字。";
  }
  return "特效文字要像背景中的发光大字或能量字，融入光环和产品后方空间，不要像普通贴纸悬在画面外。";
}

function ecommerceWarnings(data, points, duplicateIssues) {
  const warnings = [];
  const title = present(data.corePoint);
  const subtitle = present(data.subtitle);
  const props = effectiveBackgroundProps(data);
  const evidence = present(data.evidence);
  const textModuleCount = 1 + (subtitle ? 1 : 0) + points.length + (present(data.capacity) ? 1 : 0) + (evidence ? 1 : 0) + 3;
  const imageTotal = data.imageCount + data.accessoryImageCount + data.referenceImageCount + data.evidenceImageCount;
  const materialTotal = imageTotal + sellPointImageCount(points);

  if (title.length > 12) warnings.push("主标题偏长，手机缩略图可能看不清，建议控制在 8-12 个字以内");
  if (subtitle.length > 18) warnings.push("副标题偏长，建议控制在 8-18 个字以内");
  if (points.length > 3) warnings.push("辅助卖点超过 3 条，画面可能显拥挤，建议优先保留高转化卖点");
  if (evidence.length > 24 || data.evidenceImageCount > 2) warnings.push("证据区内容偏多，建议只保留 1-2 个强证据");
  if (present(data.backgroundMode) === "复杂场景图" && points.length > 2) warnings.push("复杂场景图叠加多卖点会抢主体，建议减少卖点或改简单场景");
  if (present(data.backgroundMode) === "特效背景" && props.length > 2) warnings.push("特效背景不适合放太多背景配件，建议配件控制在 1-2 个");
  if (props.length > 4) warnings.push("背景配件偏多，可能分散注意力，建议控制在 2-4 个");
  if (textModuleCount > 9) warnings.push("文字模块偏多，可能影响点击率，建议合并或删减非必要信息");
  if (materialTotal > 14) warnings.push("上传参考素材很多，生成时容易混淆主次，建议明确产品图优先级");
  duplicateIssues.forEach((item) => warnings.push(item));

  return warnings.length ? warnings : ["当前信息量可控"];
}

function scoreFlow(data, missing, duplicateIssues, assets) {
  let score = 100;
  score -= missing.filter((item) => !item.includes("可用")).length * 8;
  score -= duplicateIssues.length * 10;
  if (!data.officialChecked) score -= 5;
  if (subPoints(data).length < 1) score -= 10;
  if (!present(data.scene)) score -= 5;
  if (assets.length > 0 && assets[0] !== "无命中固定素材") score += 2;
  return Math.max(0, Math.min(100, score));
}

function riskCount(data, missing, duplicateIssues) {
  let risk = 0;
  if (!present(data.appearance)) risk += 1;
  if (!data.imageCount) risk += 1;
  if (!data.confirmed) risk += 1;
  if (!data.officialChecked) risk += 1;
  if (duplicateIssues.length) risk += duplicateIssues.length;
  if (missing.some((item) => item.includes("成交权益"))) risk += 1;
  if (ecommerceWarnings(data, subPoints(data), duplicateIssues)[0] !== "当前信息量可控") risk += 1;
  return risk;
}

function renderList(node, items) {
  node.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    node.appendChild(li);
  });
}

function buildPreview(data, points) {
  const capacity = present(data.capacity) || "【待确认】";
  const campaign = present(data.campaign) || "活动到手价";
  const price = present(data.price) || "【真实价格】";
  const evidence = present(data.evidence) || "【产品证据待确认】";
  const subtitle = present(data.subtitle) || subtitleFor(data);
  const props = effectiveBackgroundProps(data);
  const benefitItems = benefits(data);
  const lines = [
    "强制锁定清单：",
    `产品外观锁定：${present(data.appearance) || "【产品真实外观待确认】"}`,
    `容量角标锁定：${capacity} 容量，只出现一次，属于产品主体右侧上半部信息区；无右侧证据贴片组时可靠近产品右侧或产品顶部顶角，但不能高过指定容量区上沿、不能漂到画面四角；有右侧证据贴片组时必须进入该组，并作为最上方第一个贴片`,
    `卖点分区锁定：主标题、辅助卖点、证据区、价格权益区各自承担不同信息`,
    `证据图锁定：${evidence}`,
    `配件锁定：${data.accessoryImageCount ? `${data.accessoryImageCount} 张配件图，按真实外观和数量生成` : "未上传配件图，不新增未确认附件"}`,
    `版式/价格区锁定：${present(data.layout) || "左文右图"} / ${present(data.priceBelt) || "底部红金强促销价格腰带"}`,
    `本次禁止出现：产品变形、卖点重复、容量放角落、容量重复、未确认参数、证据图变装饰`,
    `顶部品牌背书：${present(data.brand) || "【品牌待确认】"} 官方正品`,
    `主标题：${present(data.corePoint) || "【主标题待确认】"}`,
    `副标题：${subtitle}`,
    ...points.map((item, index) => `左侧辅助卖点${index + 1}：${item.point}${item.benefit ? ` / ${item.benefit}` : ""}`),
    `容量角标：${capacity} 容量，产品主体右侧上半部信息区；无右侧证据贴片组时可靠近产品右侧或产品顶部顶角，但不能高过指定容量区上沿、不能漂到画面四角；有右侧证据贴片组时排在该组最上方`,
    `产品图：${data.imageCount ? `${data.imageCount} 张，作为产品外观锁定参考` : "未上传，仅使用文字外观锁定"}`,
    `配件图：${data.accessoryImageCount ? `${data.accessoryImageCount} 张，作为真实配件参考` : "未上传"}`,
    `配件摆放：${accessoryLayoutLabel(data)}${data.lockAccessoryCount ? " / 按上传数量生成，不合并" : ""}`,
    `配件逐个说明：${present(data.accessoryItems) || "未填写"}`,
    `参考图：${data.referenceImageCount ? `${data.referenceImageCount} 张，作为构图/风格参考` : "未上传，使用仓库默认风格"}`,
    `小卖点视觉：${sellPointVisualLine(points)}`,
    `卖点边框：${sellingFrameStyle(data)}`,
    `卖点背景板：${present(data.sellingBoardMode) || "卖点背景板包含标题"}`,
    `背景选择：${present(data.backgroundMode) || "少量特效"}`,
    `背景质感：${backgroundStyleLabel(data)}`,
    `特效字融合：${present(data.effectTextMode) || "特效字融入背景"}`,
    `背景配件：${props.length ? props.join(" / ") : "无"}`,
    `配件限制：${backgroundPropRule(data)}`,
    `产品证据区文字：${evidence}`,
    `证据图：${data.evidenceImageCount ? `${data.evidenceImageCount} 张，作为证据区辅助参考` : "未上传"}`,
    `价格区主文案：${campaign}`,
    `价格数字：¥${price}`,
    ...(benefitItems.length ? benefitItems.map((item, index) => `价格区权益${index + 1}：${item}`) : ["价格区权益1：【真实权益】"]),
    `额外附加提示词：${present(data.extraPrompt) || "无"}`,
    "底部服务/售后：不额外重复权益",
    `其它角标：${sceneBrief(data)}`,
  ];
  return lines.join("\n");
}

function subtitleFor(data) {
  if (present(data.subtitle)) return present(data.subtitle);
  const category = present(data.category);
  if (category.includes("破壁") || category.includes("豆浆") || category.includes("料理") || category.includes("榨汁")) {
    return "细腻破壁 香浓好喝";
  }
  if (category.includes("电饭煲")) return "香甜软糯 每一口都好吃";
  if (category.includes("微波") || category.includes("烤")) return "加热均匀 清洁省心";
  return "利益解释【待优化】";
}

function sceneBrief(data) {
  const scene = present(data.scene);
  if (!scene) return "【场景氛围待确认】";
  if (scene.length <= 42) return scene;
  return `${scene.slice(0, 42)}...`;
}

function cleanSentence(value) {
  return present(value).replace(/[。；;,\s]+$/g, "");
}

function buildKeywords(data, points, assets, duplicateIssues, missing, score, risk) {
  const benefitItems = benefits(data);
  const lines = [
    `主图目标：${present(data.goal) || "活动促销"}`,
    `推荐版式：${present(data.layout) || "左文右图"}`,
    `构图方向：${present(data.composition) || "左右构图"}`,
    `背景选择：${present(data.backgroundMode) || "少量特效"}`,
    `背景质感：${backgroundStyleLabel(data)}`,
    `特效字融合：${present(data.effectTextMode) || "特效字融入背景"}`,
    `背景配件：${effectiveBackgroundProps(data).join(" / ") || "无"}`,
    `配件限制：${backgroundPropRule(data)}`,
    `价格区：${present(data.priceBelt) || "底部红金强促销价格腰带"}`,
    `卖点边框：${sellingFrameStyle(data)}`,
    `卖点背景板：${present(data.sellingBoardMode) || "卖点背景板包含标题"}`,
    `小卖点视觉：${sellPointVisualLine(points)}`,
    `主标题：${present(data.corePoint) || "【待确认】"}`,
    `副标题：${present(data.subtitle) || subtitleFor(data)}`,
    `辅助卖点：${points.map((item) => item.point).join(" / ") || "【待确认】"}`,
    `容量角标：${present(data.capacity) || "【待确认】"} 容量，产品主体右侧上半部信息区；无右侧证据贴片组时可靠近产品右侧或产品顶部顶角，但不能高过指定容量区上沿、不能漂到画面四角；有右侧证据贴片组时排最上方`,
    `产品图：${data.imageCount ? `${data.imageCount} 张（${data.imageNames.join(" / ")}）` : "未上传"}`,
    `配件图：${data.accessoryImageCount ? `${data.accessoryImageCount} 张（${data.accessoryImageNames.join(" / ")}）` : "未上传"}`,
    `配件摆放：${accessoryLayoutLabel(data)}${data.lockAccessoryCount ? " / 按上传数量生成，不合并、不省略" : ""}`,
    `配件逐个说明：${present(data.accessoryItems) || "未填写"}`,
    `参考图：${data.referenceImageCount ? `${data.referenceImageCount} 张（${data.referenceImageNames.join(" / ")}）` : "未上传"}`,
    `卖点图片：${sellPointImageCount(points) ? `${sellPointImageCount(points)} 张（${points.map((item) => item.imageName).filter(Boolean).join(" / ")}）` : "未上传"}`,
    `证据图：${data.evidenceImageCount ? `${data.evidenceImageCount} 张（${data.evidenceImageNames.join(" / ")}）` : "未上传"}`,
    `场景关键词：${present(data.scene) || "【待确认】"}`,
    `证据关键词：${present(data.evidence) || "【待确认】"}`,
    `价格权益：${present(data.campaign) || "活动到手价"} ¥${present(data.price) || "【真实价格】"} / ${benefitItems.join(" / ") || "【真实权益】"}`,
    `额外附加提示词：${present(data.extraPrompt) || "无"}`,
    `固定素材调用：${assets.join("；")}`,
    `流程评分：${score}`,
    `风险项：${risk}`,
    `重复检查：${duplicateIssues.length ? duplicateIssues.join("；") : "通过"}`,
    `缺失检查：${missing.length ? missing.join("；") : "通过"}`,
    `是否允许生成：${score >= 80 && data.confirmed ? "是" : "否"}`,
  ];
  return lines.join("\n");
}

function buildPrompt(data, points) {
  const brand = present(data.brand) || "【品牌待确认】";
  const category = present(data.category) || "【类目待确认】";
  const platform = present(data.platform) || "京东/天猫";
  const appearance = present(data.appearance) || "【产品真实外观待确认】";
  const core = present(data.corePoint) || "【主标题待确认】";
  const subtitle = present(data.subtitle) || subtitleFor(data);
  const capacity = present(data.capacity) || "【待确认】";
  const price = present(data.price) || "【真实价格】";
  const campaign = present(data.campaign) || "活动到手价";
  const scene = present(data.scene) || "浅灰、暖白、浅金色现代厨房或电商摄影棚背景，干净台面，真实柔光，轻微环境反射，真实接触阴影。";
  const evidence = present(data.evidence) || "【产品证据待确认】";
  const frameStyle = sellingFrameStyle(data);
  const boardMode = present(data.sellingBoardMode) || "卖点背景板包含标题";
  const extraPrompt = present(data.extraPrompt);
  const benefitItems = benefits(data);
  const backgroundStyle = backgroundStyleLabel(data);
  const effectTextMode = present(data.effectTextMode) || "特效字融入背景";
  const imageLine = data.imageCount
    ? `本次上传了 ${data.imageCount} 张产品图，作为产品主体、细节、面板、Logo、配件或证据图参考。生成时必须以这些产品图锁定产品真实外观。`
    : "未上传产品图，必须严格依据文字外观锁定描述生成，不得自行发明产品结构。";
  const referenceLine = data.referenceImageCount
    ? `本次另有 ${data.referenceImageCount} 张参考图，仅用于参考价格腰带、构图、氛围、字体、背景、杯子饮品或陈列方式，不允许用参考图改变产品真实外观。`
    : "未上传参考图，构图和视觉风格按仓库默认主图流程执行。";
  const accessoryLine = data.accessoryImageCount
    ? "配件图只用于锁定真实配件外观和材质，不得改变产品主体。具体配件数量和摆位按下方硬性要求执行。"
    : "未上传配件图，画面不新增赠品或未确认附件。";
  const evidenceImageLine = data.evidenceImageCount
    ? `本次上传了 ${data.evidenceImageCount} 张证据图，可用于证据区的小图卡、局部放大或结构说明，但证据区不超过画面 12%。`
    : "未上传证据图，证据区以文字和简洁图标表达，不虚构检测图或结构图。";
  const sellPointImageLine = sellPointImageCount(points)
    ? `本次每条小卖点可单独指定小图标或上传图片，当前已选择 ${sellPointImageCount(points)} 张卖点图片，必须保持图片比例和清晰度。`
    : "每条小卖点可单独指定小图标或上传图片；未上传图片的卖点只使用简洁图标，不新增未确认的实拍证据。";
  const props = effectiveBackgroundProps(data);
  const pointLines = points.map((item, index) => `${index + 1}. “${item.point}”${item.benefit ? ` 小字“${item.benefit}”` : ""}`).join("\n");
  const benefitLines = benefitItems.length
    ? benefitItems.map((item, index) => `价格区权益${index + 1}写“${item}”。`).join("\n")
    : "价格区权益1写“【真实权益】”。";
  const vsPriceLine = present(data.priceBelt) === "VS价格对比腰带"
    ? `如果价格腰带选择“VS价格对比腰带”，底部用左右对比价格结构：左侧展示原价/日常价占位“¥【原价】”，右侧展示本次到手价“¥${price}”，中间用 VS 或对比箭头连接；未提供原价时只能使用“¥【原价】”占位，不能编造原价。`
    : "";

  return uniqueLines(`${platform}厨房小家电高转化主图，1:1正方形构图，高清4K真实电商商业摄影质感。

产品主体为${brand}${category}，使用用户提供的真实产品图作为主体参考。${imageLine}${accessoryLine}${referenceLine}${evidenceImageLine} 必须保持原始产品外观：${cleanSentence(appearance)}。只允许优化商业摄影光影、轮廓高光、接触阴影和清晰度，不允许改变型号、颜色、比例、关键结构、面板、按钮和 Logo。

强制锁定清单：
1. 产品外观锁定：${cleanSentence(appearance)}。必须保持型号、颜色、比例、Logo位置、控制区、按键、旋钮、把手、锅盖、门体、底座和配件真实。
2. 容量角标锁定：容量只出现一次，写“${capacity} 容量”。容量角标属于产品主体右侧上半部信息区。无右侧证据贴片组时，容量角标可以靠近产品右侧或产品顶部顶角，但在画面中的垂直位置不得高于指定容量区上沿，不能漂到画面四角成为独立角标。若右侧存在证据贴片组，容量角标必须进入右侧贴片组区域，并且必须作为该组最上方的第一个贴片。容量角标不得出现在左侧标题区、产品下半部、底部腰带、产品正中核心结构上，也不得位于任何证据贴片下方。
3. 卖点分区锁定：主标题只表达“${core}”；辅助卖点、证据区、价格权益区各自承担不同信息，不互相复读。
4. 证据图锁定：${evidence}。证据区只证明卖点，不做装饰，不遮挡产品。
5. 配件锁定：${data.accessoryImageCount ? `本次上传 ${data.accessoryImageCount} 张配件图，必须按真实数量和外观生成，不合并、不省略、不新增。` : "未上传配件图，不新增未确认附件。"}
6. 版式/价格区锁定：版式为${present(data.layout) || "左文右品强促销版式"}，价格区为${present(data.priceBelt) || "仓库京东高转化红金强促销价格腰带"}。
7. 本次禁止出现：产品变形、改变产品颜色、控制面板模糊、卖点重复、容量漂到画面四角、容量在产品下半部、容量位于证据贴片下方、容量重复、未确认参数、证据图变装饰、参考图覆盖产品真实外观。

画面采用${present(data.layout) || "左文右品强促销版式"}，${present(data.composition) || "左右构图"}，背景策略为${present(data.backgroundMode) || "黑金火焰特效背景"}，背景质感为${backgroundStyle}，${effectTextMode}。${compositionDirection(data)}产品主体清晰突出，正面轻微俯视，轮廓有干净高光，材质真实清晰。${scenePromptLine(data)}
背景学习要点：${backgroundStyleGuidance(backgroundStyle)} ${effectTextGuidance(effectTextMode)}

顶部品牌背书区：左上角横向品牌识别栏，文字写“${brand} 官方正品”，品牌区不遮挡产品主体，占画面顶部 8%-12%。

左侧标题区：卖点框架采用“${frameStyle}”，背景板规则为“${boardMode}”。主标题大字写“${core}”，标题不超过两行，字体清晰有力，金属质感但不要厚重生成字。副标题写“${subtitle}”。

左侧辅助卖点区：在主标题下方使用 ${points.length || 3} 行功能卖点模块，每行包含小卖点和一句小字解释，图标简洁，分割线清楚：
${pointLines || "1. “【辅助卖点】” 小字“【利益解释】”"}
${sellPointVisualLine(points)} ${sellPointImageLine}

容量角标：容量角标属于产品主体右侧上半部信息区，写“${capacity} 容量”。无右侧证据贴片组时，容量角标可以靠近产品右侧或产品顶部顶角，但在画面中的垂直位置不得高于指定容量区上沿，不能漂到画面四角成为独立角标。若右侧存在证据贴片组，容量角标必须进入右侧贴片组区域，并且必须作为该组最上方的第一个贴片。容量只出现在这个角标中，画面其它区域不再出现容量文字。

产品证据区：产品右下或产品旁边做小型证据卡，不抢主体：${evidence}。证据区只做局部结构证明，不重复主标题和辅助卖点大段文字，不遮挡产品和价格区。

配件数量和摆位硬性要求：${accessoryCountRule(data)} ${accessoryPlacementRule(data)}

底部价格腰带：使用${present(data.priceBelt) || "仓库京东高转化红金强促销价格腰带"}风格，横跨底部，主价格腰带高度控制在画面高度 14%-18%，总成交区不超过 22%。价格区贴近底边，不遮挡产品主体、控制面板和左侧卖点。
价格区左侧写“${campaign}”，超大价格数字写“¥${price}”，价格数字是价格区最大元素，白色/亮黄色数字，金色描边，轻微立体阴影，可以有红金流光和爆闪，但不要过度火焰。
${benefitLines}
${vsPriceLine}
价格腰带主权益和其它小贴片不重复，每个权益只出现一次。价格权益区只写成交权益，不写产品功能卖点。

整体视觉：真实电商主图，高点击率，高转化，产品真实可信，信息层级清楚，手机端缩略图能一眼看到“${core}”和“¥${price}”。画面有促销感但不杂乱，产品是最清晰的视觉中心。若画面信息过多，优先保留主标题、产品主体、价格和核心证据，删减背景配件与辅助卖点。

全图卖点不重复：标题区、辅助卖点区、产品证据区、价格权益区各自承担不同信息。同一个卖点不要在多个位置重复出现。证据区只用图片证明卖点，不重复大标题文案。价格权益区只写成交权益，不写产品功能卖点。容量只出现一次，作为产品主体右侧上半部信息区的小型角标；无右侧证据贴片组时可靠近产品右侧或产品顶部顶角，但不能高过指定容量区上沿、不能漂到画面四角；有右侧证据贴片组时必须进入右侧贴片组区域，并作为该组最上方第一个贴片；不进入左侧文字卖点列表；画面中除容量角标外，不再出现任何容量相关文字。右侧贴片出现过的卖点，左侧文字卖点区不得重复。底部价格腰带高度控制在画面 14%-18%，如有下层服务条，总成交区高度不超过 22%。
完整提示词生成后必须去重：同一句卖点、同一个权益、同一个参数、同一个版式要求不得重复出现。若内容冲突，优先保留产品真实外观、主标题、核心证据、价格区和右侧参数小贴片。
${extraPrompt ? `额外附加提示词：${extraPrompt}` : ""}

AI感降低要求：真实商品图合成，非概念设计，非塑料模型，非过度渲染。产品边缘真实，光源方向统一。文字区域清晰，平面设计排版感，非手写，非乱码，非厚重 3D 生成字。

负面关键词：产品变形，产品比例失真，改变产品颜色，错误 Logo，控制面板模糊，按键错乱，文字乱码，价格太小，卖点重复，容量重复出现，价格区写产品功能卖点，价格腰带过高，背景抢主体，配件合并，配件缺失，两个内胆套在一起，两个配件融合成一个，配件只有一个外轮廓，过度粒子，梦幻背景，塑料质感，过度火焰，虚假反光，厚重生成字，garbled text, distorted product, inconsistent lighting`);
}

function buildBlankPrompt(data, points) {
  const brand = present(data.brand) || "【品牌待确认】";
  const category = present(data.category) || "【类目待确认】";
  const appearance = present(data.appearance) || "【产品真实外观待确认】";
  const capacity = present(data.capacity) || "【待确认】";
  const scene = present(data.scene) || "浅灰、暖白、浅金色现代厨房或电商摄影棚背景，干净台面，真实柔光，轻微环境反射，真实接触阴影。";
  const props = effectiveBackgroundProps(data);
  const frameStyle = frameVisualDescription(data);
  const boardMode = present(data.sellingBoardMode) || "卖点背景板包含标题";
  const extraPrompt = present(data.extraPrompt);
  const backgroundStyle = backgroundStyleLabel(data);
  const pointPlaceholders = points.length
    ? points.map((item, index) => {
        const visual = item.imageMode ? "，只保留上传图片占位" : item.icon ? "，只保留小图标占位" : "";
        return `${index + 1}. 预留第 ${index + 1} 个卖点空框，不出现任何中文、英文、数字或符号${visual}`;
      }).join("\n")
    : "1. 预留一个卖点空框，不出现任何中文、英文、数字或符号";
  const boardDescription = boardMode === "无背景板"
    ? "不生成大面积卖点背景板，只保留干净留白和必要细线框"
    : boardMode === "卖点背景板不包含标题"
      ? "只在辅助卖点区域保留空白背景板，标题区域保持干净留白"
      : "标题区域和辅助卖点区域都保留空白背景板，但背景板内不能有文字";
  const propLimitLine = propLimitGuidance(data);

  return uniqueLines(`电商主图空白版背景图，1:1正方形构图，高清4K真实商业摄影质感，用于后期排版。

产品主体为${brand}${category}，必须保持真实外观：${cleanSentence(appearance)}。只允许优化光影、轮廓高光、接触阴影和清晰度，不允许改变型号、颜色、比例、面板、按钮、把手、杯体、Logo位置和关键结构。

画面采用${present(data.layout) || "左文右品强促销版式"}，${present(data.composition) || "左右构图"}。${blankCompositionDirection(data)}背景质感为${backgroundStyle}。${scenePromptLine(data)} ${propLimitLine}
背景学习要点：${backgroundStyleGuidance(backgroundStyle)} 空白版不生成特效字文字，只保留光效形状和发光位置。

配件数量和摆位硬性要求：${accessoryCountRule(data)} ${accessoryPlacementRule(data)} 空白版里配件只能作为真实实物出现在场景中，不能变成贴片、图标、证据卡或文字说明。

强制去文字要求：整张图只允许产品机身原本自带的面板小字和右侧参数小贴片文字存在。去掉所有广告文案，去掉顶部品牌 Logo/品牌背书栏，去掉底部价格腰带，去掉价格、权益、主标题、副标题、左侧小卖点文字、证据区说明文字和服务承诺文字。左侧卖点框里必须是空白，不能出现中文、英文、数字、符号、乱码、伪文字、水印或 AI 标记。

保留后期排版空间：左侧或对应版式位置只保留空的卖点边框和空白背景板，空出来的版面要对应主标题和辅助卖点层级，后期可以直接放文字。卖点框视觉为${frameStyle}。${boardDescription}。边框内部保持纯净留白，绝不生成任何文字。

卖点框结构必须对应后期文字层级：左侧做一个大标题空框，宽度占左侧卖点区约 85%-92%，高度约为单条小卖点框的 1.2-1.5 倍；大标题空框下方做 3-4 条横向小卖点空框，每条独立圆角长条，竖向排列，对齐整齐，间距一致。不要做九宫格，不要做 2 列表格，不要把小边框切成很多小方块，不要让卖点边框像表格。

黑金质感要求：边框要亮晶晶，高级黑金电商精修质感，黑色部分像钢琴烤漆或黑色金属，金色部分像金属倒角和香槟金高光，有少量玻璃扫光、星芒和立体投影，但不要土黄色、不要暗淡棕色、不要廉价卡片感。

卖点边框占位：
${pointPlaceholders}

容量/参数小角标保留：容量角标只允许出现在产品主体右侧上半部信息区；无右侧证据贴片组时可靠近产品右侧或产品顶部顶角，但不能高过指定容量区上沿、不能漂到画面四角；有右侧证据贴片组时必须作为该组最上方第一个贴片。当前小角标文字写“${capacity} 容量”，除该角标外，画面其它区域不再出现容量文字。

小卖点视觉：${sellPointVisualLine(points)}。小图标或上传卖点图片只做占位和视觉引导，不生成任何额外卖点文字。图标旁边留空，不要写说明。

产品证据区只保留结构图框、局部放大框、图片占位和连接线，不生成说明文字。证据区不遮挡产品，不超过画面 12%。

整体视觉：真实电商商业摄影感，产品清晰可信，背景干净，左侧/顶部/底部留白足够后期文字排版。空白版面要有明确信息层级，但不出现广告文案。

完整提示词生成后必须去重：同一句约束、同一个区域要求、同一个参数不得重复出现。若内容冲突，优先保留产品真实外观、空白留版、右侧小贴片文字和卖点边框。
${extraPrompt ? `额外附加提示词：${extraPrompt}` : ""}

负面关键词：生成广告文字，生成标题文字，生成卖点文字，生成背景板文字，生成顶部 Logo，生成品牌背书栏，生成价格腰带，生成价格数字，生成权益文字，AI生成水印，文字乱码，伪文字，英文乱字，卖点文字重复，容量重复出现，九宫格卖点框，2列表格卖点框，表格样式边框，小方块边框，土黄色背景板，暗淡棕色，廉价卡片感，饮品过多，满屏果汁杯，产品变形，改变产品颜色，错误 Logo，控制面板模糊，按键错乱，背景抢主体，配件合并，配件缺失，两个内胆套在一起，两个配件融合成一个，配件只有一个外轮廓，过度粒子，梦幻背景，塑料质感，虚假反光，distorted product, garbled text, fake text, random letters, watermark, inconsistent lighting`);
}

function buildPureBackgroundPrompt(data) {
  const brand = present(data.brand) || "【品牌待确认】";
  const category = present(data.category) || "【类目待确认】";
  const appearance = present(data.appearance) || "【产品真实外观待确认】";
  const backgroundStyle = backgroundStyleLabel(data);
  const props = effectiveBackgroundProps(data);
  const extraPrompt = present(data.extraPrompt);

  return uniqueLines(`电商产品场景纯背景图，1:1 正方形构图，真实商业摄影精修质感。

画面只包含三类内容：背景、产品主体、已选择的配件。除此以外不出现任何内容。

产品主体为${brand}${category}，必须保持真实外观：${cleanSentence(appearance)}。产品放在画面中右侧或右侧偏中位置，占画面 48%-58%，左侧留下干净、完整、可后期排版的空白版面。产品最亮、最清晰、最可信，边缘有白色轮廓光，真实接触阴影和台面轻微反射清楚。只允许优化光影、轮廓高光、材质反射和清晰度，不允许改变型号、颜色、比例、Logo位置、面板、按钮、把手、杯体、锅盖、门体或关键结构。

背景质感为${backgroundStyle}。${backgroundStyleGuidance(backgroundStyle)} ${effectTextGuidance("不生成特效字")}

${backgroundPropRule(data)} ${propLimitGuidance(data)}

配件数量和摆位硬性要求：${accessoryCountRule(data)} ${accessoryPlacementRule(data)} 纯背景版里配件只能作为真实实物出现在台面上，不能变成贴片、图标、证据卡、文字说明或悬浮素材。

左侧留白要求：左侧 35%-45% 画面保持干净背景和自然光效，留给后期排版。左侧可以有柔和暗金渐变、轻微石材纹理、弱光圈或浅景深，但不能出现任何框、板、卡片、表格、文字占位、图标占位或贴片。

强制删除项：不要顶部 Logo，不要品牌背书栏，不要京东新品条，不要卖点背景板，不要卖点边框，不要小卖点框，不要证据卡，不要容量贴片，不要能效贴片，不要角标，不要价格腰带，不要价格数字，不要权益条，不要服务条，不要水印，不要 AI 生成标记，不要任何中文、英文、数字、符号或伪文字。

配件规则：画面里只允许出现已选择的配件，配件低于产品主体，只做场景辅助。未选择的配件不出现。配件不能遮挡产品主体、Logo、控制面板、把手、杯体/锅盖/门体和底部轮廓。

整体视觉：像把真实产品放进高级电商棚拍场景里，不是完整海报，不是广告版式，不是带文字的主图。画面高级、干净、产品突出，左侧留出足够后期排版空间。
${extraPrompt ? `额外附加提示词：${extraPrompt}` : ""}

负面关键词：文字，广告文案，标题，卖点，Logo栏，品牌栏，价格腰带，价格数字，权益条，角标，贴片，容量贴片，能效贴片，卖点框，背景板，证据卡，图标，表格，水印，AI标记，伪文字，乱码，产品变形，改变产品颜色，产品比例失真，控制面板模糊，Logo错误，按键错乱，背景抢主体，装饰物过多，未选择配件出现，配件合并，配件缺失，两个内胆套在一起，两个配件融合成一个，配件只有一个外轮廓，garbled text, fake text, watermark, distorted product, inconsistent lighting`);
}

function runExtraction() {
  const data = getData();
  const points = subPoints(data);
  const missing = decideMissing(data);
  const assets = detectAssets(data);
  const duplicateIssues = detectDuplicates(data, points);
  const warnings = ecommerceWarnings(data, points, duplicateIssues);
  const score = scoreFlow(data, missing, duplicateIssues, assets);
  const risk = riskCount(data, missing, duplicateIssues);

  const provided = requiredFields
    .filter(([field]) => present(data[field]))
    .map(([, label]) => label);
  if (present(data.capacity)) provided.push("容量");
  if (points.length) provided.push(`${points.length} 个辅助卖点`);
  if (data.imageCount) provided.push(`${data.imageCount} 张产品图`);
  if (data.accessoryImageCount) provided.push(`${data.accessoryImageCount} 张配件图`);
  if (data.referenceImageCount) provided.push(`${data.referenceImageCount} 张参考图`);
  if (sellPointImageCount(points)) provided.push(`${sellPointImageCount(points)} 张卖点图片`);
  if (data.evidenceImageCount) provided.push(`${data.evidenceImageCount} 张证据图`);
  if (hasAnySellPointVisual(points)) provided.push("小卖点图标/图片");
  if (data.confirmed) provided.push("用户确认");
  if (data.officialChecked) provided.push("官方资料核对");

  renderList(output.provided, provided.length ? provided : ["暂无"]);
  renderList(output.missing, missing.length ? missing : ["无"]);
  renderList(output.blocked, cannotInvent);
  renderList(output.assets, assets);
  renderList(output.warning, warnings);

  output.score.textContent = String(score);
  output.risk.textContent = String(risk);
  output.status.textContent = score >= 80 && data.confirmed ? "可生成" : "需确认";
  output.status.style.color = score >= 80 && data.confirmed ? "var(--ok)" : "var(--warn)";

  output.preview.textContent = buildPreview(data, points);
  output.prompt.textContent = buildPrompt(data, points);
  output.blankPrompt.textContent = buildBlankPrompt(data, points);
  output.pureBackgroundPrompt.textContent = buildPureBackgroundPrompt(data);
  saveDraft();
}

function saveDraft() {
  const data = getData();
  delete data.productImages;
  delete data.imageNames;
  delete data.accessoryImages;
  delete data.accessoryImageNames;
  delete data.referenceImages;
  delete data.referenceImageNames;
  delete data.evidenceImages;
  delete data.evidenceImageNames;
  localStorage.setItem("mainImageKeywordExtractorDraft", JSON.stringify(data));
}

function compositionDirection(data) {
  if (present(data.composition) === "上下构图") {
    return "上方放主标题和品牌背书，中部放产品主体，下方放价格腰带与权益，产品占画面约 45%-52%，上下信息区留白清楚。";
  }
  return "左侧放主标题和辅助卖点，右侧放产品主体，产品占画面约 50%-55%，底部放价格腰带。";
}

function blankCompositionDirection(data) {
  if (present(data.composition) === "上下构图") {
    return "上方预留标题与卖点框架空位，中部放产品主体，下方只保留干净留白，不生成价格腰带或权益条，产品占画面约 45%-52%。";
  }
  return "左侧预留主标题和辅助卖点框架空位，右侧放产品主体，产品占画面约 50%-55%，底部只保留干净留白，不生成价格腰带。";
}

function renderImagePreviews(list, grid, countNode, inputNode) {
  grid.innerHTML = "";
  countNode.textContent = `${list.length} / ${maxImages}`;
  list.forEach((item, index) => {
    const tile = document.createElement("div");
    tile.className = "image-tile";
    const img = document.createElement("img");
    img.src = item.url;
    img.alt = item.file.name;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `移除 ${item.file.name}`);
    remove.addEventListener("click", () => {
      URL.revokeObjectURL(item.url);
      list.splice(index, 1);
      inputNode.value = "";
      renderAllImagePreviews();
      runExtraction();
    });
    const name = document.createElement("small");
    name.textContent = item.file.name;
    tile.append(img, remove, name);
    grid.appendChild(tile);
  });
}

function renderAllImagePreviews() {
  renderImagePreviews(productImages, imagePreviewGrid, imageCount, productImagesInput);
  renderImagePreviews(accessoryImages, accessoryImagePreviewGrid, accessoryImageCount, accessoryImagesInput);
  renderImagePreviews(referenceImages, referenceImagePreviewGrid, referenceImageCount, referenceImagesInput);
  renderImagePreviews(evidenceImages, evidenceImagePreviewGrid, evidenceImageCount, evidenceImagesInput);
}

function addImages(files, list) {
  const remaining = Math.max(0, maxImages - list.length);
  const nextFiles = Array.from(files).filter((file) => file.type.startsWith("image/")).slice(0, remaining);
  nextFiles.forEach((file) => {
    list.push({
      file,
      url: URL.createObjectURL(file),
    });
  });
  renderAllImagePreviews();
  runExtraction();
}

function sellPointIndexesFromData(data) {
  const indexes = Object.keys(data)
    .map((key) => {
      const match = key.match(/^subPoint(\d+)$/);
      return match ? Number(match[1]) : 0;
    })
    .filter(Boolean);
  return Math.max(1, ...indexes);
}

function benefitIndexesFromData(data) {
  const indexes = Object.keys(data)
    .map((key) => {
      const match = key.match(/^benefit(\d+)$/);
      return match ? Number(match[1]) : 0;
    })
    .filter(Boolean);
  return Math.max(1, ...indexes);
}

function createSellPointRow(index) {
  const row = document.createElement("div");
  row.className = "sellpoint-row";
  row.dataset.index = String(index);
  row.innerHTML = `
    <label>
      小卖点 ${index}
      <input name="subPoint${index}" />
    </label>
    <label>
      利益解释 ${index}
      <input name="subBenefit${index}" />
    </label>
    <div class="row-options">
      <label class="checkline"><input name="subIcon${index}" type="checkbox" />小图标</label>
      <label class="checkline"><input name="subImageMode${index}" type="checkbox" />上传图片</label>
      <label class="inline-file">
        卖点图片 ${index}
        <input name="subImage${index}" type="file" accept="image/*" />
      </label>
    </div>
    <button class="remove-sellpoint" type="button" aria-label="删除卖点 ${index}">×</button>
  `;
  row.querySelector(".remove-sellpoint").addEventListener("click", () => {
    if (sellPointList.querySelectorAll(".sellpoint-row").length <= 1) {
      row.querySelectorAll("input").forEach((input) => {
        input.value = "";
      });
    } else {
      row.remove();
      renumberSellPoints();
    }
    runExtraction();
  });
  return row;
}

function renumberSellPoints() {
  sellPointList.querySelectorAll(".sellpoint-row").forEach((row, rowIndex) => {
    const index = rowIndex + 1;
    row.dataset.index = String(index);
    const labels = row.querySelectorAll("label");
    const inputs = row.querySelectorAll("input");
    labels[0].firstChild.textContent = `小卖点 ${index}`;
    labels[1].firstChild.textContent = `利益解释 ${index}`;
    inputs[0].name = `subPoint${index}`;
    inputs[1].name = `subBenefit${index}`;
    inputs[2].name = `subIcon${index}`;
    inputs[3].name = `subImageMode${index}`;
    labels[4].firstChild.textContent = `卖点图片 ${index}`;
    inputs[4].name = `subImage${index}`;
    row.querySelector(".remove-sellpoint").setAttribute("aria-label", `删除卖点 ${index}`);
  });
}

function ensureSellPointRows(count) {
  while (sellPointList.querySelectorAll(".sellpoint-row").length < Math.min(count, maxSellPoints)) {
    sellPointList.appendChild(createSellPointRow(sellPointList.querySelectorAll(".sellpoint-row").length + 1));
  }
}

function createBenefitRow(index) {
  const row = document.createElement("div");
  row.className = "benefit-row";
  row.dataset.index = String(index);
  row.innerHTML = `
    <label>
      权益 ${index}
      <input name="benefit${index}" placeholder="如：正品保障 送运费险" />
    </label>
    <button class="remove-sellpoint" type="button" aria-label="删除权益 ${index}">×</button>
  `;
  row.querySelector(".remove-sellpoint").addEventListener("click", () => {
    if (benefitList.querySelectorAll(".benefit-row").length <= 1) {
      row.querySelector("input").value = "";
    } else {
      row.remove();
      renumberBenefits();
    }
    runExtraction();
  });
  return row;
}

function renumberBenefits() {
  benefitList.querySelectorAll(".benefit-row").forEach((row, rowIndex) => {
    const index = rowIndex + 1;
    row.dataset.index = String(index);
    const label = row.querySelector("label");
    const input = row.querySelector("input");
    label.firstChild.textContent = `权益 ${index}`;
    input.name = `benefit${index}`;
    row.querySelector(".remove-sellpoint").setAttribute("aria-label", `删除权益 ${index}`);
  });
}

function ensureBenefitRows(count) {
  while (benefitList.querySelectorAll(".benefit-row").length < Math.min(count, maxBenefits)) {
    benefitList.appendChild(createBenefitRow(benefitList.querySelectorAll(".benefit-row").length + 1));
  }
}

function optimizeSellPoints() {
  const data = getData();
  const rows = Array.from(sellPointList.querySelectorAll(".sellpoint-row"));
  rows.forEach((row) => {
    const index = row.dataset.index;
    const pointInput = row.querySelector(`[name="subPoint${index}"]`);
    const benefitInput = row.querySelector(`[name="subBenefit${index}"]`);
    const point = present(pointInput.value)
      .replace(/[，。；;]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!point) return;
    pointInput.value = point.length > 14 ? point.slice(0, 14) : point;
    if (!present(benefitInput.value)) {
      benefitInput.value = benefitForPoint(point, data.category);
    } else {
      benefitInput.value = present(benefitInput.value).replace(/[，。；;]/g, " ").replace(/\s+/g, " ").slice(0, 18);
    }
  });
  runExtraction();
}

function benefitForPoint(point, category) {
  if (point.includes("清洗") || point.includes("洗")) return "清洁省心 不易残留";
  if (point.includes("不粘")) return "加热顺滑 更好清洁";
  if (point.includes("功率") || point.includes("W")) return "强劲输出 高效处理";
  if (point.includes("加热") || point.includes("凹盘")) return "均匀受热 香浓释放";
  if (point.includes("刀") || point.includes("叶")) return "细腻搅打 口感顺滑";
  if (String(category || "").includes("电饭煲")) return "米饭好吃 操作省心";
  return "表达更直接 转化更清晰";
}

function restoreDraft() {
  const raw = localStorage.getItem("mainImageKeywordExtractorDraft");
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    ensureSellPointRows(sellPointIndexesFromData(data));
    ensureBenefitRows(benefitIndexesFromData(data));
    setData(data);
  } catch {
    localStorage.removeItem("mainImageKeywordExtractorDraft");
  }
}

function bindTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((item) => item.classList.remove("is-active"));
      document.querySelectorAll(".tab-panel").forEach((item) => item.classList.remove("is-active"));
      tab.classList.add("is-active");
      document.querySelector(`#${tab.dataset.tab}Panel`).classList.add("is-active");
    });
  });
}

function bindCopy() {
  document.querySelectorAll(".copy-button").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = document.querySelector(`#${button.dataset.copy}`);
      const text = target.textContent || "";
      const oldText = button.textContent;
      const copyStatus = await copyText(text);
      button.textContent = copyStatus === "copied" ? "已复制" : copyStatus === "selected" ? "已选中，按⌘C" : "复制失败";
      setTimeout(() => {
        button.textContent = oldText;
      }, copyStatus === "selected" ? 2400 : 1200);
    });
  });
}

async function copyText(text) {
  if (!text) return "failed";
  if (copyTextWithTextarea(text)) return "copied";

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return "copied";
    }
  } catch {
    // Fall through to the textarea copy path.
  }

  return showManualCopyBox(text) ? "selected" : "failed";
}

function copyTextWithTextarea(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  textarea.remove();
  return ok;
}

function showManualCopyBox(text) {
  document.querySelector(".manual-copy-box")?.remove();
  const box = document.createElement("div");
  box.className = "manual-copy-box";
  box.innerHTML = `
    <div class="manual-copy-head">
      <strong>浏览器拦截了自动复制</strong>
      <button type="button" aria-label="关闭复制框">×</button>
    </div>
    <p>下面内容已全选，按 ⌘C 复制。</p>
    <textarea readonly></textarea>
  `;
  const textarea = box.querySelector("textarea");
  textarea.value = text;
  box.querySelector("button").addEventListener("click", () => {
    box.remove();
  });
  document.body.appendChild(box);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  return true;
}

runButton.addEventListener("click", runExtraction);
form.addEventListener("input", saveDraft);
form.addEventListener("change", saveDraft);
resetButton.addEventListener("click", () => {
  form.reset();
  productImages.forEach((item) => URL.revokeObjectURL(item.url));
  accessoryImages.forEach((item) => URL.revokeObjectURL(item.url));
  referenceImages.forEach((item) => URL.revokeObjectURL(item.url));
  evidenceImages.forEach((item) => URL.revokeObjectURL(item.url));
  productImages = [];
  accessoryImages = [];
  referenceImages = [];
  evidenceImages = [];
  sellPointList.innerHTML = "";
  sellPointList.appendChild(createSellPointRow(1));
  benefitList.innerHTML = "";
  benefitList.appendChild(createBenefitRow(1));
  renderAllImagePreviews();
  localStorage.removeItem("mainImageKeywordExtractorDraft");
  runExtraction();
});
loadBlenderButton.addEventListener("click", () => {
  sellPointList.innerHTML = "";
  for (let index = 1; index <= 4; index += 1) {
    sellPointList.appendChild(createSellPointRow(index));
  }
  benefitList.innerHTML = "";
  benefitList.appendChild(createBenefitRow(1));
  setData(blenderCase);
  runExtraction();
});
productImagesInput.addEventListener("change", (event) => {
  addImages(event.target.files, productImages);
  productImagesInput.value = "";
});
accessoryImagesInput.addEventListener("change", (event) => {
  addImages(event.target.files, accessoryImages);
  accessoryImagesInput.value = "";
});
referenceImagesInput.addEventListener("change", (event) => {
  addImages(event.target.files, referenceImages);
  referenceImagesInput.value = "";
});
evidenceImagesInput.addEventListener("change", (event) => {
  addImages(event.target.files, evidenceImages);
  evidenceImagesInput.value = "";
});
addSellPointButton.addEventListener("click", () => {
  const count = sellPointList.querySelectorAll(".sellpoint-row").length;
  if (count >= maxSellPoints) return;
  sellPointList.appendChild(createSellPointRow(count + 1));
  saveDraft();
});
addBenefitButton.addEventListener("click", () => {
  const count = benefitList.querySelectorAll(".benefit-row").length;
  if (count >= maxBenefits) return;
  benefitList.appendChild(createBenefitRow(count + 1));
  saveDraft();
});
optimizePointsButton.addEventListener("click", optimizeSellPoints);
sellPointList.querySelector(".remove-sellpoint").addEventListener("click", () => {
  const row = sellPointList.querySelector(".sellpoint-row");
  row.querySelectorAll("input").forEach((input) => {
    input.value = "";
  });
  runExtraction();
});
benefitList.querySelector(".remove-sellpoint").addEventListener("click", () => {
  const row = benefitList.querySelector(".benefit-row");
  row.querySelector("input").value = "";
  runExtraction();
});
sellPointList.addEventListener("change", runExtraction);
benefitList.addEventListener("input", saveDraft);
benefitList.addEventListener("change", runExtraction);

bindTabs();
bindCopy();
restoreDraft();
renderAllImagePreviews();
runExtraction();
