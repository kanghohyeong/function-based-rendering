const renderPipe =
  (...funcs) =>
  (dom) => {
    return funcs.reduce((dom, func) => {
      return func(dom);
    }, dom);
  };

const View = (template, $parent, children, states, store) => (dom) => {
  let $tmp_div = document.createElement("div");
  let tmp_states = {};

  if (states)
    Object.entries(states).forEach(([key, state]) => (tmp_states[key] = store.getState(state)));
  $tmp_div.innerHTML = template(tmp_states);
  tmp_states = null;

  Object.keys(children).forEach((key) => {
    if (Array.isArray(children[key])) {
      if (children[key][1] === -1) {
        const $elements = $tmp_div.querySelectorAll(children[key][0]);
        $elements.forEach(($element, idx) => {
          dom[`${key}${idx}`] = $element;
        });
      } else dom[key] = $tmp_div.querySelectorAll(children[key][0])[children[key][1]];
    } else dom[key] = $tmp_div.querySelector(children[key]);
  });

  [...$tmp_div.children].forEach(($node) => {
    dom[$parent].appendChild($node);
  });
  $tmp_div.remove();
  $tmp_div = null;

  return dom;
};

const Handler = (logic) => (dom) => {
  logic(dom);
  return dom;
};

const Store = function (states) {
  this.states = states;
  this.observer = {};
};
Store.prototype.getState = function (state) {
  return this.states[state];
};
Store.prototype.setState = function (state, value, notify = true) {
  this.states[state] = value;
  if (notify)
    this.observer[state].forEach(({ seletor, $parent, pipe, clear }) => {
      const $element = document.body.querySelector(seletor);
      if (clear) $element.innerHTML = "";
      pipe({ [$parent]: $element });
    });
};
Store.prototype.bindView = function (state, pipe, seletor, $parent, clear = true) {
  if (this.observer.hasOwnProperty(state)) {
    this.observer[state].push({ seletor, $parent, pipe, clear });
  } else this.observer[state] = [{ seletor, $parent, pipe, clear }];
};

export { renderPipe, View, Handler, Store };
