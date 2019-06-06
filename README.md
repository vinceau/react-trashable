# react-trashable :put_litter_in_its_place:

A [Higher Order Component](https://reactjs.org/docs/higher-order-components.html) to make React Components garbage collectable when unmounted.

Learn more about garbage collection and `trashable` and why you should use it [here](https://github.com/hjylewis/trashable).

## Installation

Using npm:

```
npm install --save react-trashable
```

Using yarn:

```
yarn add react-trashable
```

## How to use

```
import { withTrashable } from 'react-trashable';

class Component extends React.Component {
    componentDidMount() {
        this.props.registerPromise(apiCall()).then(() => {
            // ...
        }).catch(() => {
            // ...
        });
    }
}

// Passes the registerPromise() function to Component
export default withTrashable(Component);
```

## Gotchas

You need to register the promise **before** you add your `then` and `catch` handlers. Otherwise, you will not get the garbage collection benefits.

```
// Do this
const registeredPromise = registerPromise(promise);
registeredPromise.then(() => {});

// NOT this
const handledPromise = promise.then(() => {});
registerPromise(handledPromise);
```
