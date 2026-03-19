const PRESENTATION_REF = document.getElementById("presentation");
const SLIDE_TEMPLATE = document.getElementById("slide-template");

let outline = null;
let slides = [];
let currentIndex = 0;
let wheelLock = false;

function createElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function setAnimateDelay(node, index) {
  node.dataset.animate = "true";
  node.style.setProperty("--delay", `${120 + index * 70}ms`);
  return node;
}

function renderEvidenceBlocks(container, blocks) {
  blocks.forEach((block, idx) => {
    const card = setAnimateDelay(createElement("section", "evidence-block"), idx);
    card.appendChild(createElement("p", "evidence-block__label", block.label));
    const list = createElement("ul");
    block.items.forEach((item) => {
      list.appendChild(createElement("li", "", item));
    });
    card.appendChild(list);
    container.appendChild(card);
  });
}

function renderHeroMetrics(visual) {
  const wrap = createElement("div", "hero-layout");
  const banner = setAnimateDelay(createElement("section", "hero-banner visual-card"), 0);
  banner.appendChild(createElement("p", "hero-banner__kicker", visual.kicker));
  banner.appendChild(createElement("h3", "hero-banner__title", "강사가 바로 바꿀 수 있는 피드백을 만듭니다"));
  banner.appendChild(
    createElement(
      "p",
      "hero-banner__copy",
      "중간발표에서는 문제 정의보다 한 걸음 더 나아가, 평가가 얼마나 일관적인지와 결과물이 실제로 읽히는지를 함께 증명합니다.",
    ),
  );
  wrap.appendChild(banner);

  const metrics = createElement("div", "hero-metrics");
  visual.metrics.forEach((metric, index) => {
    const card = setAnimateDelay(createElement("article", "metric-card"), index + 1);
    card.appendChild(createElement("p", "metric-card__value", metric.value));
    card.appendChild(createElement("p", "metric-card__label", metric.label));
    metrics.appendChild(card);
  });
  wrap.appendChild(metrics);
  return wrap;
}

function renderTriage(visual) {
  const wrap = createElement("div", "flat-list");
  visual.cards.forEach((cardData, index) => {
    const item = setAnimateDelay(createElement("article", "flat-item"), index);
    item.appendChild(createElement("div", "flat-item__icon", String(index + 1).padStart(2, "0")));
    const content = createElement("div", "flat-item__content");
    content.appendChild(createElement("h3", "", cardData.title));
    content.appendChild(createElement("p", "", cardData.text));
    item.appendChild(content);
    wrap.appendChild(item);
  });
  return wrap;
}

function renderDataScope(visual) {
  const wrap = createElement("div", "scope-layout");
  const bars = createElement("div", "bar-list-h");
  const widths = [100, 78, 62, 84];
  visual.stats.forEach((stat, index) => {
    const row = setAnimateDelay(createElement("div", "bar-item-h"), index);
    row.appendChild(createElement("div", "bar-item-h__label", stat.label));
    const chart = createElement("div", "bar-item-h__chart");
    const fill = createElement("div", `bar-item-h__fill${index % 2 === 1 ? " bar-item-h__fill--light" : ""}`, stat.value);
    fill.style.width = `${widths[index] || 70}%`;
    chart.appendChild(fill);
    row.appendChild(chart);
    bars.appendChild(row);
  });
  wrap.appendChild(bars);

  const summary = setAnimateDelay(createElement("section", "summary-box"), 4);
  summary.appendChild(createElement("p", "summary-box__eyebrow", "입력 자산"));
  summary.appendChild(createElement("p", "summary-box__title", "강의 맥락과 평가 기준을 함께 읽습니다"));
  const list = createElement("ul", "summary-box__list");
  visual.sources.forEach((source) => list.appendChild(createElement("li", "", source)));
  summary.appendChild(list);
  wrap.appendChild(summary);
  return wrap;
}

function renderPipeline(visual) {
  const wrap = createElement("div", "pipeline-layout");
  const row = createElement("div", "pipeline-row");
  visual.nodes.forEach((nodeName, index) => {
    const node = setAnimateDelay(createElement("div", "pipeline-node"), index);
    node.textContent = nodeName;
    row.appendChild(node);
  });
  wrap.appendChild(row);

  const detail = createElement("div", "pipeline-detail");
  visual.detail.forEach((line, index) => {
    const panel = setAnimateDelay(createElement("section", "visual-panel"), index + visual.nodes.length);
    panel.appendChild(createElement("h3", "", `POINT ${index + 1}`));
    panel.appendChild(createElement("p", "", line));
    detail.appendChild(panel);
  });
  wrap.appendChild(detail);
  return wrap;
}

function renderWhyHarness(visual) {
  const wrap = createElement("div", "compare-panels");
  const legacy = setAnimateDelay(createElement("section", "box-panel"), 0);
  legacy.appendChild(createElement("p", "box-panel__eyebrow", "기준이 코드에 묻히는 경우"));
  legacy.appendChild(createElement("h3", "", "수정은 느리고, 변경 이유도 남기기 어렵습니다"));
  const legacyList = createElement("ul", "panel-list");
  visual.reasons.slice(0, 2).forEach((reason) => legacyList.appendChild(createElement("li", "", reason.text)));
  legacy.appendChild(legacyList);
  wrap.appendChild(legacy);

  const current = setAnimateDelay(createElement("section", "box-panel-highlight"), 1);
  current.appendChild(createElement("p", "box-panel__eyebrow", "현재 구조"));
  current.appendChild(createElement("h3", "", "하네스를 문서로 분리해 수정 가능성과 추적성을 높였습니다"));
  const currentList = createElement("ul", "panel-list");
  visual.reasons.forEach((reason) => currentList.appendChild(createElement("li", "", `${reason.title}: ${reason.text}`)));
  current.appendChild(currentList);

  const footnote = createElement("div", "reason-footnote");
  const list = createElement("ul");
  visual.focusItems.forEach((item) => list.appendChild(createElement("li", "", item)));
  current.appendChild(footnote);
  footnote.appendChild(list);
  wrap.appendChild(current);
  return wrap;
}

function renderReliability(visual) {
  const wrap = createElement("div", "reliability-layout");
  const overview = setAnimateDelay(createElement("section", "reliability-overview"), 0);
  overview.appendChild(createElement("p", "summary-box__eyebrow", "핵심 신뢰도"));
  overview.appendChild(createElement("div", "large-stat", visual.metrics[0].value));
  overview.appendChild(createElement("p", "reliability-overview__title", "평균 ICC가 높게 유지돼 반복 평가 시 흔들림이 작았습니다"));
  const metricGrid = createElement("div", "reliability-inline");
  visual.metrics.forEach((metric) => {
    const stat = createElement("div", "reliability-inline__item");
    stat.appendChild(createElement("strong", "", `${metric.label} ${metric.value}`));
    stat.appendChild(createElement("span", "", metric.status));
    metricGrid.appendChild(stat);
  });
  overview.appendChild(metricGrid);
  wrap.appendChild(overview);

  const distribution = setAnimateDelay(createElement("section", "distribution-card"), 1);
  distribution.appendChild(createElement("h3", "", "강의별 ICC 분포"));
  const maxValue = Math.max(...visual.distribution.map((entry) => entry.value), 1);
  visual.distribution.forEach((entry) => {
    const row = createElement("div", "distribution-row");
    row.appendChild(createElement("div", "distribution-row__label", entry.label));
    const bar = createElement("div", "distribution-row__bar");
    const fill = createElement("span");
    fill.style.width = `${(entry.value / maxValue) * 100}%`;
    bar.appendChild(fill);
    row.appendChild(bar);
    row.appendChild(createElement("div", "distribution-row__value", `${entry.value}개`));
    distribution.appendChild(row);
  });
  wrap.appendChild(distribution);

  const callout = setAnimateDelay(createElement("section", "callout-box"), 2);
  callout.appendChild(createElement("p", "callout-box__label", "핵심 메시지"));
  callout.appendChild(createElement("p", "callout-box__text", visual.callout));
  wrap.appendChild(callout);

  return wrap;
}

function renderChunking(visual) {
  const wrap = createElement("div", "chunk-layout");
  const grid = createElement("div", "chunk-compare");
  visual.comparison.forEach((entry, index) => {
    const card = setAnimateDelay(createElement("article", "chunk-column"), index);
    card.appendChild(createElement("p", "summary-box__eyebrow", index === 1 ? "운영 기본값" : "비교 포인트"));
    card.appendChild(createElement("p", "chunk-card__label", entry.label));
    card.appendChild(createElement("p", "chunk-card__value", entry.value));
    grid.appendChild(card);
  });
  wrap.appendChild(grid);

  const summary = createElement("div", "chunk-summary");
  const statsPanel = setAnimateDelay(createElement("section", "visual-panel"), 3);
  statsPanel.appendChild(createElement("h3", "", "검정 결과"));
  const statsList = createElement("ul");
  visual.stats.forEach((item) => statsList.appendChild(createElement("li", "", item)));
  statsPanel.appendChild(statsList);
  summary.appendChild(statsPanel);

  const note = setAnimateDelay(createElement("section", "callout-box"), 4);
  note.appendChild(createElement("p", "callout-box__label", "운영 결론"));
  note.appendChild(createElement("p", "callout-box__text", "비교 실험과 운영 기본값 모두 30분 청크로 통일"));
  summary.appendChild(note);
  wrap.appendChild(summary);

  return wrap;
}

function renderDemoFlow(visual, assets) {
  const wrap = createElement("div", "demo-layout");
  const featured = setAnimateDelay(createElement("section", "demo-feature"), 0);
  const primaryImage = document.createElement("img");
  primaryImage.src = assets[0] ? `./assets/${assets[0]}` : "";
  primaryImage.alt = `${visual.steps[0]?.title || "대표"} 화면`;
  featured.appendChild(primaryImage);

  const featuredCopy = createElement("div", "demo-feature__copy");
  featuredCopy.appendChild(createElement("p", "demo-feature__eyebrow", "PRODUCT WALKTHROUGH"));
  featuredCopy.appendChild(createElement("h3", "demo-feature__title", "전체 현황에서 개별 강의 액션까지 한 흐름으로 이어집니다"));
  featuredCopy.appendChild(
    createElement(
      "p",
      "demo-feature__text",
      "대시보드, 실험 비교, EDA, 강의 상세를 따로 보여주지 않고, 운영자가 실제로 판단하는 순서대로 이어 붙였습니다.",
    ),
  );
  featured.appendChild(featuredCopy);
  wrap.appendChild(featured);

  const strip = createElement("div", "demo-strip");
  visual.steps.forEach((step, index) => {
    const card = setAnimateDelay(createElement("article", "demo-card"), index + 1);
    const image = document.createElement("img");
    image.src = assets[index] ? `./assets/${assets[index]}` : "";
    image.alt = `${step.title} 화면`;
    card.appendChild(createElement("p", "demo-card__index", String(index + 1).padStart(2, "0")));
    card.appendChild(image);
    card.appendChild(createElement("h3", "demo-card__title", step.title));
    card.appendChild(createElement("p", "demo-card__caption", step.caption));
    strip.appendChild(card);
  });
  wrap.appendChild(strip);

  const flow = setAnimateDelay(createElement("div", "demo-flow"), visual.steps.length);
  visual.steps.forEach((step, index) => {
    flow.appendChild(createElement("span", "demo-flow__step", step.title));
    if (index < visual.steps.length - 1) {
      flow.appendChild(createElement("span", "demo-flow__step", "→"));
    }
  });
  wrap.appendChild(flow);
  return wrap;
}

function renderReportSample(visual) {
  const wrap = createElement("div", "report-layout");

  const scoreCard = setAnimateDelay(createElement("section", "summary-box report-summary"), 0);
  scoreCard.appendChild(createElement("p", "summary-box__eyebrow", "REPORT DESIGN"));
  scoreCard.appendChild(createElement("h3", "", "점수보다 근거와 행동으로 읽히는 리포트"));
  scoreCard.appendChild(createElement("p", "report-card__score", visual.score));
  scoreCard.appendChild(createElement("p", "summary-box__title", "관찰된 사실, 해석, 개선 제안을 분리해 강사가 바로 다음 액션을 결정하게 합니다."));
  wrap.appendChild(scoreCard);

  const detail = setAnimateDelay(createElement("section", "report-card"), 1);
  detail.appendChild(createElement("h3", "", "샘플 리포트"));

  const fact = createElement("div", "report-section");
  fact.appendChild(createElement("p", "report-section__label", "관찰된 사실"));
  fact.appendChild(createElement("p", "report-section__text", visual.sample.fact));
  detail.appendChild(fact);

  const interpretation = createElement("div", "report-section");
  interpretation.appendChild(createElement("p", "report-section__label", "해석"));
  interpretation.appendChild(createElement("p", "report-section__text", visual.sample.interpretation));
  detail.appendChild(interpretation);

  const action = createElement("div", "report-section");
  action.appendChild(createElement("p", "report-section__label", "개선 제안"));
  action.appendChild(createElement("p", "report-section__text", visual.sample.action));
  detail.appendChild(action);

  wrap.appendChild(detail);
  return wrap;
}

function renderNextSteps(visual) {
  const wrap = createElement("div", "flat-list");
  visual.columns.forEach((column, index) => {
    const item = setAnimateDelay(createElement("article", "flat-item"), index);
    item.appendChild(createElement("div", "flat-item__icon", String(index + 1).padStart(2, "0")));
    const content = createElement("div", "flat-item__content");
    content.appendChild(createElement("h3", "", column.title));
    const list = createElement("ul", "panel-list");
    column.items.forEach((entry) => list.appendChild(createElement("li", "", entry)));
    content.appendChild(list);
    item.appendChild(content);
    wrap.appendChild(item);
  });
  return wrap;
}

function renderVisual(slide) {
  const { visual, assets = [] } = slide;
  switch (visual.type) {
    case "heroMetrics":
      return renderHeroMetrics(visual);
    case "triage":
      return renderTriage(visual);
    case "dataScope":
      return renderDataScope(visual);
    case "pipeline":
      return renderPipeline(visual);
    case "whyHarness":
      return renderWhyHarness(visual);
    case "reliability":
      return renderReliability(visual);
    case "chunking":
      return renderChunking(visual);
    case "demoFlow":
      return renderDemoFlow(visual, assets);
    case "reportSample":
      return renderReportSample(visual);
    case "nextSteps":
      return renderNextSteps(visual);
    default:
      return createElement("div", "visual-card");
  }
}

function renderSlide(slide, index, total) {
  const fragment = SLIDE_TEMPLATE.content.cloneNode(true);
  const slideRef = fragment.querySelector(".slide");
  slideRef.id = slide.id;
  slideRef.classList.add(`slide--${slide.visual.type}`);
  if (index === 0) {
    slideRef.classList.add("slide--cover");
  }

  fragment.querySelector(".slide__title").textContent = slide.title;
  fragment.querySelector(".slide__subtitle").textContent = slide.subtitle;
  fragment.querySelector(".slide-footer__page").textContent = String(index + 1);

  if (index !== 0) {
    renderEvidenceBlocks(fragment.querySelector(".slide__body"), slide.body);
  }
  fragment.querySelector(".slide__visual").appendChild(renderVisual(slide));

  if (index === 0) {
    fragment.querySelector(".slide__header")?.remove();
    fragment.querySelector(".slide__body")?.remove();
    const coverHeading = createElement("div", "cover-heading");
    coverHeading.appendChild(createElement("p", "slide__eyebrow", "MIDTERM PRESENTATION"));
    coverHeading.appendChild(createElement("h1", "cover-title", slide.title));
    coverHeading.appendChild(createElement("p", "cover-subtitle", slide.subtitle));
    fragment.querySelector(".slide__visual").prepend(coverHeading);
  }

  return fragment;
}

function updateStageScale() {
  const availableWidth = window.innerWidth;
  const availableHeight = window.innerHeight;
  const scale = Math.min(availableWidth / 1200, availableHeight / 675, 1);
  PRESENTATION_REF.style.transform = `scale(${scale})`;
}

function showSlide(nextIndex) {
  if (nextIndex < 0 || nextIndex >= slides.length || nextIndex === currentIndex) return;
  const direction = nextIndex > currentIndex ? 1 : -1;
  slides.forEach((slide, index) => {
    slide.classList.remove("is-active", "is-prev");
    if (index === currentIndex && direction > 0) {
      slide.classList.add("is-prev");
    }
  });
  slides[nextIndex].classList.add("is-active");
  currentIndex = nextIndex;
}

function nextSlide() {
  if (currentIndex < slides.length - 1) showSlide(currentIndex + 1);
}

function previousSlide() {
  if (currentIndex > 0) showSlide(currentIndex - 1);
}

function attachEvents() {
  document.addEventListener("keydown", (event) => {
    if (["ArrowRight", "ArrowDown", " ", "PageDown"].includes(event.key)) {
      event.preventDefault();
      nextSlide();
    }
    if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) {
      event.preventDefault();
      previousSlide();
    }
    if (event.key === "Home") {
      event.preventDefault();
      showSlide(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      showSlide(slides.length - 1);
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (target.closest("a, button")) return;
    const ratio = event.clientX / window.innerWidth;
    if (ratio < 0.32) previousSlide();
    if (ratio > 0.68) nextSlide();
  });

  document.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      if (wheelLock) return;
      wheelLock = true;
      if (event.deltaY > 0) nextSlide();
      else previousSlide();
      window.setTimeout(() => {
        wheelLock = false;
      }, 180);
    },
    { passive: false }
  );

  let touchStartX = 0;
  document.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0].clientX;
  }, { passive: true });
  document.addEventListener("touchend", (event) => {
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) < 48) return;
    if (deltaX < 0) nextSlide();
    else previousSlide();
  }, { passive: true });

  window.addEventListener("resize", updateStageScale);
}

async function bootstrap() {
  const response = await fetch("./content/outline.json");
  outline = await response.json();
  outline.slides.forEach((slide, index) => {
    PRESENTATION_REF.appendChild(renderSlide(slide, index, outline.slides.length));
  });
  slides = Array.from(document.querySelectorAll(".slide"));
  slides[0]?.classList.add("is-active");
  updateStageScale();
  attachEvents();
}

bootstrap().catch((error) => {
  PRESENTATION_REF.innerHTML = `<div style="padding:32px;font-size:14px;color:#b00020">발표 데이터를 불러오지 못했습니다: ${error.message}</div>`;
});
