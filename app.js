import {
  ListView,
  ListItemView,
  LeftBoxView,
  RightBoxView,
  PageView,
  DefaultSectionView,
} from "./view.js";
import { listColorHandler, validBtnHandler, syncBtnHandler, fetchBtnHandler } from "./handler.js";
import { renderPipe } from "./core.js";
import { GlobalStore } from "./store.js";

GlobalStore.bindView("list", renderPipe(ListView, listColorHandler), ".center", "$center");
GlobalStore.bindView("left", LeftBoxView, ".left", "$left");
GlobalStore.bindView("right", RightBoxView, ".right", "$right", false);
GlobalStore.bindView(
  "reset",
  renderPipe(DefaultSectionView, listColorHandler),
  ".section_container",
  "$content",
  true
);
GlobalStore.bindView(
  "fetched_item",
  renderPipe(ListItemView, listColorHandler),
  ".center",
  "$center",
  false
);

(function () {
  const $app = document.body.querySelector(".App");
  renderPipe(
    PageView,
    DefaultSectionView,
    listColorHandler,
    validBtnHandler,
    syncBtnHandler,
    fetchBtnHandler
  )({ $app });
})();
