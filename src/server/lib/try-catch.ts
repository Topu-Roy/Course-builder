type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Wraps a promise or async function in a try-catch block and returns a Result type
 *
 * @param promiseOrFn - A Promise or an async function that returns a Promise
 * @returns A Result object containing either the resolved data or an error
 */
export async function tryCatch<T>(promiseOrFn: Promise<T> | (() => Promise<T>)): Promise<Result<T>> {
  try {
    const promise = typeof promiseOrFn === "function" ? promiseOrFn() : promiseOrFn;
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    const errorObj =
      error instanceof Error ? error : new Error(typeof error === "string" ? error : "Unknown error occurred");

    return { data: null, error: errorObj };
  }
}
