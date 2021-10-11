# Function-Based-Rendering

> This is an VanillaJS SPA example with function based rendering.  Here's how to create Views by function composition and how to implement asynchronous partial rendering by simple data binding.



## Goal

- Create Views by function composition(pipe)

- Implement asynchronous partial rendering



---

## Basic Concept of Function Based Rendering

![image](https://user-images.githubusercontent.com/63776725/136702882-1e9f905f-a8cb-4d99-9762-d62745612517.png)

The rendering process can be implemented as a series of functions that add and modify children from the top-level DOM object.



## core.js

**Code that makes it easier to implement function based rendering**

```javascript
/*
Simple pipe function
In order to continuously process rendering-related functions, the input and output of the function must be the same(custom DOM).
*/
const renderPipe =
  (...funcs) =>
  (dom) => {
    return funcs.reduce((dom, func) => {
      return func(dom);
    }, dom);
  };

/*
Inject context(state,parent element) into the template and Render.
Return custom DOM which the newly created child elements are added.
*/
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

/*
Injects logic into target elements in the custom DOM.
*/
const Handler = (logic) => (dom) => {
  logic(dom);
  return dom;
};
```



## view

```javascript
const BoxTemplate = (states) => {
  return `
    <h2>${states.name}</h2>
    <div class="box">${states.value}</div>
    `;
};
export const LeftBoxView = View(
  BoxTemplate, 
  "$left", // key value of parent element in custom DOM
  { $left_box: ".box" }, // child element which add to custom DOM
  { name: "left_title", value: "left" }, // states
  GlobalStore // store which contains states
);
export const RightBoxView = View(
  BoxTemplate,
  "$right",
  { $right_box: ".box" },
  { name: "right_title", value: "right" },
  GlobalStore
);
```

Example of using a simple `view function` used in the actual example. The template was reused. The `view function` allows the template to be drawn with the desired state in the desired location. As long as the parent key value exists in the custom DOM, the view can also be reused as much as possible.



## Handler

```javascript
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
```

The `handler function` is a wrapper function that receives a custom DOM, processes logic, and returns the custom DOM again. Since the custom DOM already contains the necessary elements, it is possible to minimize the situation in which the real DOM needs to be accessed, such as using `querySelector`.  This dramatically reduces unnecessary complexity.





## Component Based Rendering *vs* Function Based Rendering

### 1. Component based rendering makes it hard to know what actually rendering.

- **component based rendering**

  ```javascript
  /*app.js*/
  const $app = document.body.querySelector(".App");
  
  new Home($app);
  ```
  
  There is very little information in the above code. To find out what `Home` component consist of, you have to go through the nested component structure.
  
  ```jsx
  /*Home.js*/
  class Home extends Component {
      return (
     	<MyHeader></MyHeader>
      <MySection></MySection>
     );
  }
  /*MyHeader.js*/
  class MyHeader extends Component {
      return (
     	...
     );
  }
  /*MySection.js*/
  class Section extends Component {
      return (
     	...
     );
  }
  ```

- **function based rendering**

  ```javascript
  /*app.js*/
  const $app = document.body.querySelector(".App");
  
  renderPipe(
      PageView,
      ContentView, 
      ListView, 
      LeftBoxView, 
      RightBoxView,
      listColorHandler,
      validBtnHandler,
      syncBtnHandler,
      fetchBtnHandler
  )({ $app });
  ```
  
  The above code has a lot of information about the rendering process. Not only can you know in detail **what** is rendering, but you can also see **what** logic is injected in the rendering process. It **declaratively** describes **what to do** during the rendering process. This is an advantage of functional programming, which abstracts the code around what to do.
  
  Do you think it is little verbose? Another advantage of functional programming is that you can create larger functions by composing smaller functions.
  
  ```javascript
  /*app.js*/
  const $app = document.body.querySelector(".App");
  
  renderPipe(
      PageView,
      DefaultSectionView, // == renderPipe(ContentView, ListView, LeftBoxView, RightBoxView)
      listColorHandler, 
      DefaultBtnHandler, // == renderPipe(validBtnHandler, syncBtnHandler, fetchBtnHandler)
  )({ $app });
  ```
  
  

### 2. Components are difficult to reuse.

This may sound strange. Being able to reuse a component created once in many places is definitely an advantage of component-based rendering. But sometimes the unit of component is **too big to be reused.**

- **component based rendering**
  - The parent component mounts the child component. Therefore, there is a dependency between parent and child, and only minimum level components that have the same children can be reused. If the service logic is implemented within the component, it cannot be reused if the logic is different even if the structure is the same.
- **function based rendering**
  - The child element chooses where to enter among the children of the parent element by `view function`. `View function` injects a context such as a parent element or state into a `pure template`. The `template` itself has no relationship with other templates, so it can be reused freely. Since service logic is also injected into the `template` through the `handler function`, the `template` is also free from logic. In other words, `view function `and `handler function` are also free from `templates`. Therefore numerous `view-handler-template` combinations are freely possible. In addition, it is easy to test the view because child element can freely place anywhere due to the characteristic of choosing the parent element itself.



---

## Simple Data Binding

The traditional web used a method of rendering and providing a whole page. However, the SPA(Single-Page-Application) divides the page into several parts and allows each part to be rendered separately by using CSR(Client-Side-Rendering). Therefore, one of the key points of SPA is to redraw only a specific part of the screen according to the data when the data changes. It is a common challenge for SPA to request new data from the server according to the user's activities and then show new content without refreshing the entire page. The problem is that the **occurrence time of the event** causing the data change and the **time to receive the changed data** are **asynchronous**.

Several Front-end frameworks have implemented data change detection in various ways to solve this problem. In this example, **data(state) and views were bound by applying a simple observer pattern** to the store which storing data(state).

```javascript
const Store = function (states) {
  this.states = states;
  this.observer = {};
};
Store.prototype.getState = function (state) {
  return this.states[state];
};
// When the state changes, the rendering functions(renderPipe) bound to the state are automatically executed.
Store.prototype.setState = function (state, value, notify = true) {
  this.states[state] = value;
  if (notify)
    this.observer[state].forEach(({ seletor, $parent, pipe, clear }) => {
      const $element = document.body.querySelector(seletor);
      if (clear) $element.innerHTML = "";
      pipe({ [$parent]: $element });
    });
};
// The view and data are bound by rendering function subscribing to the state.
Store.prototype.bindView = function (state, pipe, seletor, $parent, clear = true) {
  if (this.observer.hasOwnProperty(state)) {
    this.observer[state].push({ seletor, $parent, pipe, clear });
  } else this.observer[state] = [{ seletor, $parent, pipe, clear }];
};
```

In this project, the rendering function is a function that generates child elements from a particular top-level element. Therefore, since the rendering function subscribes to the state, only a specific element can be re-rendering according to the state change.(see `app.js`)



### Demo(asynchronous partial rendering)

![Animation](https://user-images.githubusercontent.com/63776725/136706271-2084701d-248d-43e5-a99d-dc0738539c1a.gif)

**What the buttons do**

- `redraw left` : synchronous re-rendering

- `append right` : asynchronous fetch and append

- `fetch 1 center` : asynchronous fetch full list and re-rendering

- `fetch 2 center` : asynchronous fetch per item and append 

- `reset` : re-rendering contents except header



Implement situations that appear frequently when making SPA. **Each part changes asynchronously according to the user's activity**. In addition, **duplicate requests were prevented** through button deactivation, and UX was improved by providing a **loading UI** between fetch requests. Through this demo, it was confirmed that function-based rendering can be usefully used for actual SPA implementation.