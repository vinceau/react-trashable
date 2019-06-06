import * as React from "react";

import makeTrashable from "trashable";

import { Subtract } from "utility-types";

type TrashablePromise<T> = Promise<T> & { trash: () => void };

type RegisterPromiseType = <T>(promise: Promise<T>) => TrashablePromise<T>;

export type TrashableProps = {
  registerPromise: RegisterPromiseType,
};

interface PromiseStore {
  [key: string]: TrashablePromise<any>;
}

type Key = number;

export function withTrashable<P extends TrashableProps>(WrappedComponent: React.ComponentType<P>) {
  return class TrashableComponent extends React.Component<Subtract<P, TrashableProps>> {
    constructor(props: any) {
      super(props);
      this.registerPromise = this.registerPromise.bind(this);
    }

    promiseStore: PromiseStore = {};
    key: Key = 0;

    componentWillUnmount() {
      const keys = Object.keys(this.promiseStore);
      keys.forEach(key => {
        this.promiseStore[key].trash();
      });
    }


    addPromise = (promise: TrashablePromise<any>): Key => {
      let currentKey = this.key;
      this.promiseStore[currentKey] = promise;

      this.key++;
      return currentKey;
    };

    removePromise = (key: Key): void => {
      delete this.promiseStore[key];
    };

    registerPromise<T>(promise: Promise<T>): TrashablePromise<T> {
      const trashablePromise = makeTrashable(promise);
      const key = this.addPromise(trashablePromise);

      const handledPromise: TrashablePromise<T> = trashablePromise
        .then((value: T) => {
          this.removePromise(key);
          return Promise.resolve(value);
        })
        .catch((error: any) => {
          this.removePromise(key);
          return Promise.reject(error);
        });

      // Return trashable promise
      handledPromise.trash = () => {
        this.removePromise(key);
        trashablePromise.trash();
      };
      return handledPromise;
    }

    render() {
      return (
        <WrappedComponent registerPromise={this.registerPromise} {...this.props as P} />
      );
    }
  };
}

