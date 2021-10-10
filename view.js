import { View, renderPipe } from "./core.js";
import { GlobalStore } from "./store.js";

const PageTemplate = () => {
  return `
    <header>
        <h1>SPA Example with Function Based View
            <button>reset contents</button>
        </h1>
        <input type="text" placeholder="Enter left text">
        <button disabled>redraw left</button>
        <button>fetch 1 center</button>
        <button>fetch 2 center</button>
        <button disabled>append right</button>
        <input type="text" placeholder="Enter right text">
        <span class="loading"></span>
    </header>
    <div class="section_container"></div>
    `;
};
export const PageView = View(PageTemplate, "$app", {
  $header: "header",
  $content: ".section_container",
  $reset_btn: ["button", 0],
  $left_btn: ["button", 1],
  $fetch_btn: ["button", 2],
  $fetch2_btn: ["button", 3],
  $right_btn: ["button", 4],
  $left_input: ["input", 0],
  $right_input: ["input", 1],
  $right_loading: ".loading",
});

const ContentTemplate = () => {
  return `
    <section class="left"></section>    
    <section class="center"></section>
    <section class="right"></section>
    `;
};
export const ContentView = View(ContentTemplate, "$content", {
  $center: ".center",
  $left: ".left",
  $right: ".right",
});

const ListItemTemplate = (states) => {
  return `
    <div class="list">${states.value}</div>
    `;
};
export const ListItemView = View(
  ListItemTemplate,
  "$center",
  { $list: ".list" },
  { value: "fetched_item" },
  GlobalStore
);

const ListTemplate = (states) => {
  const list = states.list;
  if (!list.length) return `<div class="loading">loading...</div>`;
  return list.map((value) => ListItemTemplate({ value })).reduce((prev, cur) => prev + cur, "");
};
export const ListView = View(
  ListTemplate,
  "$center",
  { $list: [".list", -1] },
  { list: "list" },
  GlobalStore
);

const BoxTemplate = (states) => {
  return `
    <h2>${states.name}</h2>
    <div class="box">${states.value}</div>
    `;
};
export const LeftBoxView = View(
  BoxTemplate,
  "$left",
  { $left_box: ".box" },
  { name: "left_title", value: "left" },
  GlobalStore
);
export const RightBoxView = View(
  BoxTemplate,
  "$right",
  { $right_box: ".box" },
  { name: "right_title", value: "right" },
  GlobalStore
);

export const DefaultSectionView = renderPipe(ContentView, ListView, LeftBoxView, RightBoxView);
