import { Store } from "./core.js";

export const GlobalStore = new Store({
  list: ["please fetch"],
  left_title: "Left Box",
  right_title: "Right Box",
  left: "first text",
  right: "first text",
  right_status: "",
  reset: null,
});
