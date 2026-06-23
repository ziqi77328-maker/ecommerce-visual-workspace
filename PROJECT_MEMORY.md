# Project Memory: Ecommerce Visual Workspace

This repository is the default memory base for ecommerce visual design, ecommerce main images, JD/Tmall appliance main images, high-conversion posters, selling-point extraction, price/benefit modules, and AI prompt generation for product visuals.

Use this file as the first checkpoint. Then read the relevant source files in the repo before creating prompts, layouts, or image-generation instructions.

## Always Read First

1. `README.md`
2. `000-工作流/主图生成工作流.md`
3. `000-工作流/主图信息填写表.md`
4. `000-工作流/产品关键词匹配与优化规则.md`
5. `008-agent决策中心/01-主图决策树.md`
6. `008-agent决策中心/02-优先级评分系统.md`
7. `008-agent决策中心/05-强制锁定清单.md`
8. Relevant case, layout, selling-point, price, and AI keyword files for the current category.

For external image learning, also use:

- `007-案例学习与卖点提取系统/08-图片分析标准Prompt.md`
- `007-案例学习与卖点提取系统/09-图片分析输出模板.md`
- `007-案例学习与卖点提取系统/07-视觉表达学习流程.md`

## Non-Negotiable Gates

Before creating any final prompt or image:

1. Confirm product information completeness.
2. Lock the real product appearance.
3. Output the forced lock checklist from `008-agent决策中心/05-强制锁定清单.md`.
4. Choose the main-image goal.
5. Choose exactly one core selling point.
6. Build a visual evidence chain.
7. Separate product selling points from transaction benefits.
8. Output a full on-image text preview.
9. Wait for user confirmation before image generation.

Never skip the information check, forced lock checklist, and text preview for ecommerce main-image generation. The forced lock checklist must be repeated for every redesign or prompt revision, not only the first generation.

## Product Truth Policy

Do not invent concrete values or claims. Price, cashback, gift value, subsidies, warranty promises, material grades, antibacterial rates, sugar-reduction rates, power, capacity, energy rating, minutes, and official certifications must come from user-provided or confirmed source material.

If only product name, model, or product code is provided, first obtain official product information through the documented workflow when available, especially for Midea/JD appliance work. Record official selling points, parameters, product images, and image descriptions before designing.

If details are missing, use explicit placeholders:

```text
¥【真实价格】
权益1：【真实权益】
材质：【待官方确认】
参数：【待官方确认】
```

Do not upgrade claims. A metal liner is not automatically 304/316L. A healthy cooking claim is not automatically 0-coating, antibacterial, sugar-reduction percentage, or maternal-grade material.

## Product Appearance Lock

The product must stay true to the reference:

- Model and category
- Body color
- Logo position
- Control panel
- Buttons, knobs, display, handle, lid, door, valve, hinge, vents
- Product proportions
- Accessories and evidence parts

Allowed: improve lighting, angle, reflection, shadow, clarity, and background integration.

Not allowed: change model, add/remove controls, recolor the product, redesign the door/lid/handle, invent accessories, crop away key structures, or let text/effects cover the product.

Product realism beats atmosphere. If decorative effects reduce product credibility, remove the effects.

## Decision Workflow

Main-image goal priority:

1. Activity promotion
2. Function education
3. New launch
4. Premium texture
5. Lifestyle seeding

Even when the goal is function education, a high-conversion ecommerce main image still needs a clear transaction close when the platform/task implies purchase conversion.

Core selling point selection rules:

- One core selling point only.
- Use 3-5 auxiliary selling points.
- Core point must be differentiating, purchase-moving, visually provable, true, and readable at thumbnail size.
- Use evidence before decoration.

## Layout Defaults

Use the repo's layout library before inventing a new structure.

- Left-text/right-product: default for most JD appliance high-conversion main images.
- Centered product: single strong selling point, new launch, premium texture, or horizontal products where full product width matters.
- Light-background strong-promotion layout: subsidy, low price, big sale, high-click thumbnail goals, dark/black/metal products needing separation.

Recommended proportions:

- Product: usually 50%-60% of image.
- Complex product or horizontal appliance: 48%-52%.
- Brand/backing zone: about 8%-15%.
- Bottom price belt: 14%-18%.
- Total transaction area with service strip: no more than 20%-22%.

Do not let cards, badges, price belts, or effects resize the product into a secondary element.

## Information Zoning

Every zone must do a different job:

- Title: core selling point.
- Subtitle: benefit translation or proof direction.
- Auxiliary selling points: 3-5 supporting reasons.
- Evidence zone: real structure, material, process, comparison, or accessory proof.
- Product badge: capacity or concise product-side label.
- Price zone: price and transaction benefits only.
- Service strip: logistics, warranty, price protection, platform service only.

Do not repeat the same selling point across title, auxiliary list, evidence zone, product badge, and price zone.

Capacity rule:

- Capacity can only appear once as a small product-side badge.
- Capacity badge belongs to the upper-right information area of the product body.
- When there is no right-side evidence sticker group, the capacity badge may sit near the product's right side or top corner, but must not float into the image corner as an independent corner label.
- When a right-side evidence sticker group exists, the capacity badge must be inside that group and must be the topmost sticker in the group.
- Capacity badge must not appear in the left title area, product lower half, bottom price belt, over the product's central key structure, or below any evidence sticker.
- Capacity must not appear in the title, left selling-point list, evidence text, price zone, or bottom service strip.
- If a capacity badge appears once, no other capacity text appears anywhere.

Right-side product badge or evidence label must not be repeated in the left selling-point list.

## Evidence Chain

A strong main image should answer:

```text
What is the core result?
Which parameter proves it?
Which structure or material explains it?
Which local image or accessory proves it visually?
What user benefit does it translate into?
```

Evidence modules are not decoration. They must prove a claim. Data should sit near the structure or process it proves.

For image-dominant selling points, prefer:

```text
function evidence image + short result title + real data or mechanism + user benefit
```

Do not replace real evidence with oversized text cards.

## Fixed Evidence Assets

Prefer fixed assets under `常用图片` over regenerating evidence stickers.

- Low-sugar rice / 沥糖饭 / 控糖饭 / 米汤分离: `常用图片/沥糖釜.jpg`
- 304 stainless steel: `常用图片/304不锈钢材质贴片1.png` or `常用图片/304不锈钢材质贴片2.jpg`
- 316L / 316 maternal-grade stainless steel: `常用图片/316母婴级不锈钢材质贴片1.png` or `常用图片/316母婴级不锈钢材质贴片2.png`
- 0-coating rice cooker liner: `常用图片/0涂层电饭煲内胆1.png` or `常用图片/0涂层电饭煲内胆 特效.png`
- 晶钛 liner: `常用图片/晶钛电饭煲内胆1.png`

Protect fixed assets:

- Keep original aspect ratio, color, material texture, and text clarity.
- Do not redraw, recolor, distort, blur, crop away key information, or cover important text.
- Scaling, shadow, rim light, and perspective placement are allowed only when the asset remains recognizable and truthful.

## Low-Sugar Cooker Rule

If the product or prompt mentions low-sugar rice, 沥糖饭, 控糖饭, 米汤分离, low-sugar cooker, or professional 沥糖釜:

- Must show the upper 沥糖釜 / 沥糖篮 with rice.
- Must show the paired lower liner below it.
- Must preserve the upper-pot/lower-liner spatial relationship.
- Do not replace the evidence with a normal liner, rice bowl, generic stainless cup, or single 316L sticker.
- Only show sugar-reduction percentages when the user/source provides them.

## Category Rules

Rice cooker:

- Common proof areas: liner, lid, capacity badge, low-sugar accessory, 0-coating, 316L/304 only when confirmed, quick cook, reservation, warming, AI/menu.
- For low-sugar products, 沥糖釜 evidence is mandatory.
- For 晶钛, use 晶钛 liner evidence when confirmed.

Pressure cooker:

- Lock top handle, pressure valve, lid buckle, side buckles, control panel, buttons, metal belt, pot body curve.
- Dual-liner evidence should use foreground staggered depth, not flat stickers.
- Dark or metallic products often need light gray/silver background and rim light.

Microwave / micro-bake-fry appliance:

- Preserve full door, glass reflection, handle, control panel, knob/button layout, vents, and feet.
- Horizontal products often need a complete centered or center-right product display.
- Do not invent 304/316L, 0-coating, antibacterial, inverter, or energy rating.
- If showing inner-liner evidence, use real open-door/inner-cavity structure. Do not turn the evidence into pots, bowls, or unrelated props.

Kettle / health pot:

- Confirm 316L/304, capacity, power, reservation, warming, and safety claims before use.
- Glass and stainless materials need clean highlights and readable material evidence.

Air fryer / steamer / induction / blender:

- Match the core mechanism: hot air, steam, heat plate, motor, screen/menu, liner/coating.
- Do not let food props become more important than the product unless the task is a lifestyle secondary image.

## Price And Benefits

For JD, Tmall, promotional, high-conversion, or big-sale main images, include price/benefit closure unless the user explicitly says not to.

Price zone rules:

- Use real price/benefits or placeholders only.
- Price number is the largest element in the price zone.
- Bottom price belt height: 14%-18%.
- Total transaction area with service strip: no more than 20%-22%.
- Price zone stays near the bottom and must not cover product/evidence/selling points.
- Price and benefit modules must not repeat product-function claims.
- Each benefit appears once.
- The main price-belt benefit and lower service strip must not duplicate each other.

Gift rules:

- Gift image should visually connect to the price belt.
- Gift can break upward from the price belt edge.
- Gift value text is larger than ordinary benefit text but smaller than the main price.
- Gift badge stays close to the gift image.

Fire effects are optional. Choose price style based on product and promotion:

- Red-gold big sale belt
- White-red subsidy card
- Black-gold premium plaque
- Coupon-card price zone
- Flash-sale strip
- Pink/red JD-style service strip

## Title And Visual Effects

Choose title effect by core reason:

- Material selling point: metallic text.
- Heat/firepower: red-orange heat text.
- Tech/screen/AI/energy: blue-white digital text.
- Health/clean/easy-clean: clean translucent text.
- Numeric/symbol selling point: dimensional number or symbol anchor.
- Service benefit: badge/chapter only, not the main title.

Do not default every image to red-gold 3D text. Rotate styles according to product and core reason.

Numeric anchors can be used for `0涂层`, `0氟`, `316L`, `1级能效`, `24H`, `60s`, or verified percentages. They must stay near the evidence they prove and must not be larger than the product.

## Visual Hierarchy

The product should be the clearest and most credible object in the image.

Check:

- Is the product the largest or strongest visual subject?
- Is it complete and readable?
- Are logo, panel, handle, door, lid, or key structures visible?
- Is the product brighter or clearer than background and cards?
- Do effects, text, gifts, or badges steal focus?

Good pattern:

```text
bright credible product
+ lower-brightness background
+ readable but controlled selling-point card
+ evidence image near claim
+ bottom transaction close
```

Background should support, not perform. Use space, light, metal rim, particles, speed lines, fire, smoke, or glow only when they guide attention back to product and core selling point.

## Case-Derived Playbooks

晶钛电饭煲强促销:

- Left black-gold selling card + right product + capacity/activity badges + right-lower liner evidence + bottom subsidy/返卡/618.
- Use benefits instead of exact price when price is uncertain.

电压力锅双内胆:

- Light gray/silver background for dark products.
- Lock pressure cooker structure.
- Left title and 3 benefit lines.
- Dual liners in staggered foreground depth.
- Strong bottom price belt.

微烤炸一体机:

- Black product must be clear, glossy, and separated from background.
- Preserve glass door, silver handle, right control panel, vents, and feet.
- If proving inner liner, show open-door stainless inner cavity as evidence.
- Bottom rights are transaction benefits, not repeated function claims.

M2A microwave:

- Product facts: black 20L mechanical dual-knob microwave, flat bottom, glass door, 700W, price/benefits only when confirmed.
- Do not invent 304/316L/0-coating/antibacterial/inverter/first-class energy.
- Complete centered or center-right product.
- Use clean high-light product, subtle heating evidence, and thick red-gold price belt.

Low-sugar rice cooker:

- 沥糖釜 + lower liner evidence is mandatory.
- No sugar-reduction percentage without source.
- Product around 48%-55%.
- Red-gold price belt optional depending on promotion goal.

## Required Pre-Generation Output

First output information completeness:

```text
已提供信息：
缺少信息：
需要向用户核对的问题：
可以先用占位符处理的信息：
不能编造的信息：
是否确认当前信息已经足够进入文字预览：等待用户确认
```

Then output full on-image text preview:

```text
顶部品牌背书：
主标题：
副标题/利益解释：
左侧辅助卖点1：
左侧辅助卖点2：
左侧辅助卖点3：
左侧辅助卖点4：
容量角标：
产品证据区文字：
价格区主文案：
价格数字：
价格区权益1：
价格区权益2：
底部服务/售后：
其它角标：
```

Only generate after the user confirms the preview.

## Quality Bar

Conceptual score out of 100:

- Product realism: 25
- Selling-point conversion force: 20
- Price/benefit completeness: 15
- Information hierarchy: 15
- Thumbnail click power: 10
- Real commercial photography feel: 10
- Reviewability: 5

Below 80 is not ready for final image generation.

## Failure Intercepts

Stop and revise if any of these appear:

- Product model, structure, color, panel, button, knob, door, lid, valve, logo, or accessory changed.
- A material, rate, certification, price, gift, or benefit is invented.
- Capacity appears outside a product-corner badge.
- Same selling point appears in more than one zone.
- Evidence image does not prove the claim.
- Price zone repeats product functions.
- Price belt is too high or covers the product.
- Product is smaller/weaker than title, badges, gifts, or effects.
- Background is more attractive than the product.
- Text is crowded, unreadable, random, garbled, or not confirmed.

## Knowledge Update Routing

When new reusable knowledge appears, write it to the narrowest matching library:

- Workflow/check rules: `000-工作流`
- Project case process: `001-项目案例库`
- Product category scenes: `002-产品场景库`
- Layout/proportions/zones: `003-产品结构排版库`
- Selling-point language and visual expression: `004-卖点表达库`
- Price/benefit modules: `005-价格与权益表达库`
- Directly reusable prompts: `006-AI关键词库`
- External case learning: `007-案例学习与卖点提取系统`
- Decision, scoring, risk, and failure interception: `008-agent决策中心`

Avoid duplicating the same long rule across multiple folders.
