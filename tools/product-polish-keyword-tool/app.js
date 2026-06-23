const form = document.querySelector("#polishForm");
const runButton = document.querySelector("#runExtract");
const resetButton = document.querySelector("#resetAll");
const loadCookerButton = document.querySelector("#loadCookerCase");
const imageInput = document.querySelector("#referenceImages");
const imagePreviewGrid = document.querySelector("#imagePreviewGrid");
const imageCount = document.querySelector("#imageCount");
const copyPanel = document.querySelector("#copyPanel");
const copyFallbackText = document.querySelector("#copyFallbackText");
const closeCopyPanelButton = document.querySelector("#closeCopyPanel");

const output = {
  summaryMode: document.querySelector("#summaryMode"),
  summaryPosition: document.querySelector("#summaryPosition"),
  summaryLock: document.querySelector("#summaryLock"),
  beauty: document.querySelector("#beautyText"),
  scene: document.querySelector("#sceneText"),
  truth: document.querySelector("#truthText"),
  negative: document.querySelector("#negativeText"),
  full: document.querySelector("#fullPromptText"),
};

const maxImages = 6;
let referenceImages = [];

const repoImageRules = {
  source:
    "规则来源：002-产品场景库、006-AI关键词库基础画面参数、008-agent决策中心/04-AI感降低策略。仅使用图片相关规则，不使用产品结构排版库、价格权益库和卖点卡排版。",
  beauty:
    "基于真实商品图进行产品精修，只优化清晰度、亮度、边缘、材质、阴影、背景融合和真实商业摄影质感，不改变产品型号、颜色和结构。",
  baseImage:
    "画面比例可用于 1:1 主图或产品主视觉，高清4K商业摄影质感，产品放画面视觉重心，常规产品占比 50%-60%，横向长条产品可到 65%-75%，自然光或柔光高光结合，边缘轮廓光，背景虚化处理，前景装饰适量，突出产品主体。",
  aiLess:
    "真实电商商业摄影质感，产品为真实商品图合成，非概念设计，非塑料模型，非过度渲染。自然摄影棚柔光，真实接触阴影，材质反射符合产品本身，背景干净，空间透视合理，光源方向统一。",
  forcedTexture:
    "强制产品质感增强：产品不能被磨皮，不能变成光滑塑料模型。保留真实商品材质的微细节、边缘厚度、接缝、倒角、暗部层次和局部真实瑕疵。金属表面必须有清晰但不过度锐化的拉丝纹理，横向细密纹路可见，高光沿产品弧面自然过渡，亮部不过曝，暗部不死黑。玻璃必须有真实厚度、边缘高光、轻微反射和透明折射，不发灰、不雾化、不遮挡关键结构。塑料底座必须有细腻哑光或半亮面质感，不能廉价、不能油腻。产品边缘有干净轮廓光，底部有真实接触阴影和轻微台面反射，整体像真实商业摄影精修，不像 AI 渲染图。",
  effectSafe:
    "特效只服务产品质感和氛围：允许轻微轮廓光、柔和金属高光、台面反射、少量热气或水汽、少量粒子和流光；禁止满屏粒子、梦幻背景、过度烟雾、夸张火焰、产品悬浮无阴影。",
};

const categoryRules = {
  电饭煲:
    "电饭煲类目重点锁定锅盖、提手、机身弧度、控制面板、内胆口沿和 Logo。适合米饭热气、厨房台面、浅景深背景；若加入米饭，米粒真实饱满，不能遮挡锅体结构。",
  "电火锅 / 电煮锅":
    "电火锅/电煮锅重点锁定锅身、玻璃锅盖、双侧把手、旋钮底座和锅沿厚度。适合现代厨房台面、石材台面、少量热气、锅内食材或汤品；锅沿、把手和旋钮不能变形。",
  电压力锅:
    "电压力锅重点锁定顶盖、压力阀、开盖把手、侧扣、金属腰线、控制面板和锅体比例。适合浅灰棚拍或深色高端棚拍，边缘轮廓光要清楚。",
  "微波炉 / 微烤炸一体机":
    "微波炉/微烤炸一体机重点锁定门体、玻璃反射、把手、控制面板、旋钮/按键、通风孔和脚垫。横向产品适合完整居中展示，不开门、不改成其他结构。",
  "破壁机 / 豆浆机":
    "破壁机/豆浆机重点锁定透明杯体、杯盖、把手、刀头区域、刻度、底座和数显面板。可加入果汁、豆浆或水果，但内容物不能遮挡杯体结构。",
  空气炸锅:
    "空气炸锅重点锁定抽屉、把手、机身曲面、控制面板、出风口和底座。可轻微打开抽屉展示食物，但不能让食物面积超过产品主体。",
  "电热水壶 / 养生壶":
    "电热水壶/养生壶重点锁定壶嘴、把手、杯体、底座、刻度、盖子和玻璃透明度。适合清新、生活、浅木台面和柔和自然光。",
  "电磁炉 / 电陶炉":
    "电磁炉/电陶炉重点锁定面板、线圈区域、数显按键、边角比例和玻璃反射。适合俯拍或正面轻俯视，台面反射要克制。",
  "蒸锅 / 蒸烤箱":
    "蒸锅/蒸烤箱重点锁定透明门/透明层、把手、蒸汽关系、控制面板和层架结构。蒸汽要轻，不遮挡结构。",
  其他厨房小家电:
    "厨房小家电重点锁定产品轮廓、真实材质、Logo、控制区和关键结构。优先保持产品原有角度，只优化质感和环境融合。",
};

const backgroundRules = {
  简洁:
    "简洁空间背景，暖白、浅灰或柔和米色，大面积低干扰留白，商业摄影布光，背景轻微虚化，产品占据视觉中心。",
  厨房:
    "现代厨房场景，浅木色或石材台面，奶油色墙面，背景厨具和收纳罐虚化，暖色自然光，少量餐具或食材点缀。",
  生活:
    "温馨生活场景，家庭用餐或早餐氛围，阳光厨房，低饱和家居色彩，少量生活化道具，背景保持柔焦。",
  科技:
    "科技感背景，浅银灰或深灰空间，柔和蓝白光、细微数据光线、干净反射，不做夸张赛博背景。",
  黑金:
    "黑金高端背景，深灰石材或黑色金属纹理，产品后方金色聚光，四角略暗，金色光效低强度围绕产品后方。",
  清新:
    "清新明亮背景，浅绿色、浅蓝或暖白空间，柔和自然光，少量绿植或水果点缀，整体干净轻盈。",
  浅灰棚拍:
    "浅灰商业棚拍背景，产品背后柔和渐变光，台面真实接触阴影，适合黑色、白色、金属色家电突出轮廓。",
  奶油原木:
    "奶油原木厨房背景，浅木台面、暖米色墙面、柔和窗光，氛围温暖但不发黄，适合白色和银色产品。",
  深色高端棚拍:
    "深色高端棚拍背景，黑灰石材质感，产品背后柔和金色或白色聚光，边缘轮廓光清晰，产品必须比背景更亮。",
};

const negativeBase = [
  "不要生成价格",
  "不要生成标题字",
  "不要生成卖点卡",
  "不要生成促销腰带",
  "不要生成广告文字",
  "不要生成优惠券",
  "不要生成品牌背书栏",
  "不要生成信息堆叠排版",
  "不要生成海报版式",
  "不要改变产品型号",
  "不要改变产品颜色",
  "不要重绘产品结构",
  "不要增加或减少旋钮、按键、把手、门体、锅盖、阀门、杯盖、杯体、底座",
  "不要让 Logo 乱码或消失",
  "不要让控制面板和数显屏乱码",
  "不要产品变形、拉伸、压扁、裁切关键结构",
  "不要背景比产品更亮",
  "不要特效遮挡产品",
  "不要道具抢主体",
  "不要过度磨皮导致材质消失",
  "不要塑料感廉价",
  "不要金属拉丝消失",
  "不要玻璃发灰发雾",
  "不要阴影漂浮",
  "不要纯黑死背景",
  "不要满屏粒子和火焰",
  "不要磨皮质感",
  "不要塑料模型感",
  "不要金属变成灰色贴图",
  "不要边缘糊成一片",
  "不要高光过曝",
  "不要暗部脏灰",
  "不要把开盖产品自动加盖",
  "不要自动生成玻璃锅盖",
  "不要食材糊成一锅汤",
];

const cookerCase = {
  category: "电饭煲",
  appearance:
    "银色拉丝金属机身，黑色玻璃数显面板，Midea Logo 在正面左侧，顶部面板和按键布局清楚，机身四角圆润，底部灰色底座和脚垫真实，不改变产品比例。",
  goals: [
    "去灰提亮，压住脏灰和暗沉，让产品白场更干净",
    "增强产品边缘清晰度，轮廓不糊、不融入背景",
    "强化真实接触阴影，产品稳稳落在台面或地面上",
    "增加柔和轮廓光，托出产品外形但不过曝",
    "增强金属反射和拉丝层次，高光清楚但不过度锐化",
    "提升控制面板、数显屏、按键和 Logo 的清晰度",
  ],
  materials: [
    "金属拉丝：横向或竖向拉丝纹理可见，高光顺着机身弧面过渡",
    "黑色镜面：镜面反射可控，保留黑色深度，增加白色边缘光防止融入背景",
    "银色机身：银灰过渡自然，金属亮部和暗部都保留细节",
    "数显面板：屏幕数字和功能图标清楚，面板反光不遮挡文字",
  ],
  background: "深色高端棚拍",
  relations: [
    "产品真实落在台面上，有清晰但柔和的接触阴影",
    "产品背后有椭圆柔光区，托亮主体轮廓",
    "产品边缘有淡淡白色高光线，增强外形识别",
    "台面有轻微反射，反射弱于产品本体",
    "背景轻微虚化，主体极致清晰，前实后虚",
  ],
  angle: "右上角机位，三分之二俯视，适合电饭煲、锅类、破壁机",
  state: "产品原本状态不变，不添加内容物",
  states: ["产品原本状态不变，不添加内容物，不改变开合状态"],
  accessory: "不需要配件，只保留产品主体",
  position:
    "产品居中，占画面宽度约55%-65%，上下左右保留8%-12%呼吸空间，适合白底精修和单品展示",
  lockNoPoster: true,
};

function present(value) {
  return String(value || "").trim();
}

function compact(items) {
  return items.map((item) => present(item)).filter(Boolean);
}

function unique(items) {
  const seen = new Set();
  return compact(items).filter((item) => {
    const key = item.replace(/\s+/g, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function checkedValues(name) {
  return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((item) => item.value);
}

function getData() {
  const data = Object.fromEntries(new FormData(form).entries());
  data.goals = checkedValues("goals");
  data.materials = checkedValues("materials");
  data.relations = checkedValues("relations");
  data.states = checkedValues("states");
  data.lockNoPoster = Boolean(form.elements.lockNoPoster.checked);
  return data;
}

function setCheckboxGroup(name, values) {
  form.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.checked = values.includes(input.value);
  });
}

function setData(data) {
  Object.entries(data).forEach(([name, value]) => {
    if (["goals", "materials", "relations", "states"].includes(name)) {
      setCheckboxGroup(name, value);
      return;
    }
    const element = form.elements[name];
    if (!element) return;
    if (element.type === "checkbox") {
      element.checked = Boolean(value);
    } else {
      element.value = value;
    }
  });
}

function selectedCategory(data) {
  return present(data.categoryCustom) || present(data.category) || "未填写类目";
}

function selectedBackground(data) {
  return present(data.backgroundCustom) || present(data.background) || "简洁";
}

function selectedPosition(data) {
  return present(data.positionCustom) || present(data.position);
}

function buildBeauty(data) {
  const category = selectedCategory(data);
  const categoryRule = categoryRules[category] || categoryRules["其他厨房小家电"];
  const items = [
    repoImageRules.source,
    repoImageRules.beauty,
    repoImageRules.baseImage,
    repoImageRules.aiLess,
    repoImageRules.forcedTexture,
    categoryRule,
    ...data.goals,
    ...data.materials,
    present(data.goalsCustom),
    present(data.materialsCustom),
    present(data.angleCustom) || present(data.angle),
    ...data.states,
    present(data.stateCustom),
    present(data.accessoryCustom) || present(data.accessory),
    selectedPosition(data),
  ];
  return unique(items).join("\n");
}

function buildScene(data) {
  const background = selectedBackground(data);
  const backgroundRule = backgroundRules[background] || background;
  const items = [
    "场景要服务产品主体，背景虚化、低对比、弱化处理，产品始终最大、最清楚、最可信。",
    "背景和台面用于解释产品所处空间，不承担海报排版任务。",
    backgroundRule,
    repoImageRules.effectSafe,
    ...data.relations,
    present(data.relationsCustom),
    "保持干净单品展示逻辑，背景弱化，产品主体清楚，适合后续继续做主图设计。",
    "场景道具数量克制，食物、餐具、绿植或厨房物件只做环境暗示，不能超过产品视觉权重。",
    "特效围绕产品后方、边缘和底部台面，不能穿过 Logo、控制面板、玻璃门、锅盖和主体结构。",
  ];
  return unique(items).join("\n");
}

function buildTruth(data) {
  const appearance = present(data.appearance);
  const category = selectedCategory(data);
  const referenceLine = referenceImages.length
    ? `已上传 ${referenceImages.length} 张参考图，参考图只用于锁定产品外观、材质和氛围，不覆盖产品真实结构。`
    : "如有产品参考图，应以参考图为准锁定真实外观。";
  const noPoster = data.lockNoPoster
    ? "强制不输出价格、标题、卖点卡、促销腰带、优惠券、广告文字、品牌背书栏和复杂海报排版。"
    : "";
  const items = [
    `产品类目：${category}`,
    appearance ? `真实外观锁定：${appearance}` : "真实外观锁定：需要补充产品颜色、材质、Logo、控制面板、把手、锅盖、杯体、门体和关键结构。",
    referenceLine,
    "只允许优化光影、清晰度、材质反射、阴影、背景融合、轻微透视和产品质感。",
    repoImageRules.forcedTexture,
    "必须保持产品型号、颜色、比例、Logo位置、控制区、按键、旋钮、把手、锅盖、门体、杯体、底座和配件真实。",
    "产品是画面最大、最清楚、最可信主体，背景、道具和光效都服务产品。",
    noPoster,
  ];
  return unique(items).join("\n");
}

function buildNegative(data) {
  const materialNegatives = [];
  if (data.materials.join(" ").includes("玻璃")) {
    materialNegatives.push("不要玻璃变浑浊", "不要透明杯体变成实心塑料", "不要反射遮挡内部结构");
  }
  if (data.materials.join(" ").includes("金属") || data.materials.join(" ").includes("不锈钢")) {
    materialNegatives.push("不要金属变塑料", "不要拉丝纹理消失", "不要内胆变成普通碗盆");
  }
  if (data.materials.join(" ").includes("黑色")) {
    materialNegatives.push("不要黑色产品和深色背景融在一起", "不要黑色镜面变脏灰");
  }
  if (data.materials.join(" ").includes("白色")) {
    materialNegatives.push("不要白色机身发灰发黄", "不要白色产品过曝丢失边缘");
  }
  return unique([...negativeBase, ...materialNegatives]).join("，");
}

function stripPosterWords(text) {
  return text
    .replace(/价格区|促销腰带|卖点卡|标题字|广告文字|优惠券|品牌背书栏/g, (match) => `不生成${match}`)
    .replace(/不生成不生成/g, "不生成");
}

function render() {
  const data = getData();
  const beauty = buildBeauty(data);
  const scene = buildScene(data);
  const truth = buildTruth(data);
  const negative = buildNegative(data);
  const full = stripPosterWords(
    [
      "【产品美化】",
      beauty,
      "",
      "【背景场景】",
      scene,
      "",
      "【真实约束】",
      truth,
      "",
      "【负面关键词】",
      negative,
    ].join("\n")
  );

  output.summaryMode.textContent = "场景库 / AI关键词库 / AI感降低";
  output.summaryPosition.textContent = present(data.positionCustom) ? "自定义位置" : form.querySelector('input[name="position"]:checked')?.parentElement.textContent.trim() || "未选择";
  output.summaryLock.textContent = data.lockNoPoster ? "已开启" : "未开启";
  output.beauty.textContent = beauty;
  output.scene.textContent = scene;
  output.truth.textContent = truth;
  output.negative.textContent = negative;
  output.full.textContent = full;
}

function renderImages() {
  imagePreviewGrid.innerHTML = "";
  referenceImages.forEach((item, index) => {
    const tile = document.createElement("div");
    tile.className = "image-tile";
    const img = document.createElement("img");
    img.src = item.url;
    img.alt = item.file.name;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `删除图片 ${item.file.name}`);
    remove.addEventListener("click", () => {
      URL.revokeObjectURL(item.url);
      referenceImages.splice(index, 1);
      renderImages();
      render();
    });
    const name = document.createElement("small");
    name.textContent = item.file.name;
    tile.append(img, remove, name);
    imagePreviewGrid.appendChild(tile);
  });
  imageCount.textContent = `${referenceImages.length} / ${maxImages}`;
}

function addImages(files) {
  Array.from(files)
    .slice(0, maxImages - referenceImages.length)
    .forEach((file) => {
      referenceImages.push({ file, url: URL.createObjectURL(file) });
    });
  imageInput.value = "";
  renderImages();
  render();
}

function resetAll() {
  form.reset();
  referenceImages.forEach((item) => URL.revokeObjectURL(item.url));
  referenceImages = [];
  renderImages();
  render();
}

function showCopyFallback(text) {
  copyFallbackText.value = text;
  copyPanel.hidden = false;
  copyFallbackText.focus();
  copyFallbackText.select();
}

function setCopyState(button, text, ok = true) {
  const old = button.textContent;
  button.textContent = text;
  button.classList.toggle("copied", ok);
  window.setTimeout(() => {
    button.textContent = old;
    button.classList.remove("copied");
  }, 1200);
}

async function copyText(id, button) {
  const text = document.querySelector(`#${id}`).textContent;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      setCopyState(button, "已复制");
      return;
    }

    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.left = "-9999px";
    helper.style.top = "0";
    document.body.appendChild(helper);
    helper.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(helper);
    if (copied) {
      setCopyState(button, "已复制");
      return;
    }
    throw new Error("copy blocked");
  } catch (error) {
    showCopyFallback(text);
    setCopyState(button, "请手动复制", false);
  }
}

document.querySelectorAll("[data-select-group]").forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.dataset.selectGroup;
    if (group === "goals") {
      const defaults = [
        "去灰提亮，压住脏灰和暗沉，让产品白场更干净",
        "增强产品边缘清晰度，轮廓不糊、不融入背景",
        "强化真实接触阴影，产品稳稳落在台面或地面上",
        "增加柔和轮廓光，托出产品外形但不过曝",
        "提升控制面板、数显屏、按键和 Logo 的清晰度",
        "统一产品明暗关系，保留暗部层次，不做死白",
      ];
      setCheckboxGroup("goals", defaults);
      render();
    }
  });
});

document.querySelectorAll("[data-clear-group]").forEach((button) => {
  button.addEventListener("click", () => {
    setCheckboxGroup(button.dataset.clearGroup, []);
    render();
  });
});

form.addEventListener("input", render);
form.addEventListener("change", render);
runButton.addEventListener("click", render);
resetButton.addEventListener("click", resetAll);
loadCookerButton.addEventListener("click", () => {
  resetAll();
  setData(cookerCase);
  render();
});
imageInput.addEventListener("change", (event) => addImages(event.target.files));

document.querySelectorAll(".copy-button").forEach((button) => {
  button.addEventListener("click", () => copyText(button.dataset.copy, button));
});

closeCopyPanelButton.addEventListener("click", () => {
  copyPanel.hidden = true;
});

copyPanel.addEventListener("click", (event) => {
  if (event.target === copyPanel) {
    copyPanel.hidden = true;
  }
});

render();
