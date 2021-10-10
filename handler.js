import { Handler } from "./core.js";
import { GlobalStore } from "./store.js";

const getRandomColor = () => {
  const R = Math.floor(Math.random() * 256);
  const G = Math.floor(Math.random() * 256);
  const B = Math.floor(Math.random() * 256);
  return `rgb(${R},${G},${B})`;
};

const asyncFetchList = ($btn) => {
  const FETCH_ITEMS = Math.ceil(Math.random() * 20);
  Array(FETCH_ITEMS)
    .fill(0)
    .forEach((_, idx) => {
      const fetch_time = Math.random() * 2000 + 1000;
      setTimeout(() => {
        const list = [...GlobalStore.getState("list")];
        GlobalStore.setState("fetched_item", `list ${idx}`);
        list.push(`list ${idx}`);
        GlobalStore.setState("list", list, false);
      }, fetch_time);
    });
};

const fetchList = ($btn) => {
  const fetch_time = Math.random() * 2000 + 1000;
  GlobalStore.setState("list", []);
  if ($btn) $btn.disabled = true;
  setTimeout(() => {
    GlobalStore.setState(
      "list",
      Array(Math.ceil(Math.random() * 20))
        .fill(0)
        .map((_, i) => `list ${i}`)
    );
    if ($btn) $btn.disabled = false;
  }, fetch_time);
};

export const listColorHandler = Handler((dom) => {
  Object.keys(dom)
    .filter((key) => key.includes("list"))
    .forEach(($list) => {
      dom[$list].style.backgroundColor = getRandomColor();
    });
});

export const validBtnHandler = Handler(({ $left_btn, $left_input, $right_btn, $right_input }) => {
  $left_input.addEventListener("input", () => {
    if ($left_input.value.length) $left_btn.disabled = false;
    else $left_btn.disabled = true;
  });
  $right_input.addEventListener("input", () => {
    if ($right_input.value.length) $right_btn.disabled = false;
    else $right_btn.disabled = true;
  });
});

export const syncBtnHandler = Handler(({ $left_btn, $left_input, $reset_btn }) => {
  $left_btn.addEventListener("click", () => {
    GlobalStore.setState("left", $left_input.value);
    $left_input.value = "";
  });
  $reset_btn.addEventListener("click", () => {
    GlobalStore.setState("left", "left box", false);
    GlobalStore.setState("right", "right box", false);
    GlobalStore.setState("list", ["please fetch"], false);
    GlobalStore.setState("reset", null);
  });
});

export const fetchBtnHandler = Handler(
  ({ $fetch_btn, $fetch2_btn, $right_btn, $right_input, $right_loading }) => {
    $fetch_btn.addEventListener("click", () => {
      fetchList($fetch_btn);
    });
    $fetch2_btn.addEventListener("click", () => {
      asyncFetchList($fetch2_btn);
    });

    $right_btn.addEventListener("click", () => {
      $right_loading.innerText = "Loading..";
      const input_value = $right_input.value;
      $right_btn.disabled = true;
      $right_input.value = "";
      setTimeout(() => {
        $right_loading.innerText = "";
        GlobalStore.setState("right", input_value);
        $right_btn.disabled = false;
      }, 1000);
    });
  }
);
