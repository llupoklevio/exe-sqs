export class SqSError extends Error {
  #url: string = "";

  constructor({ message, url }: { message: string; url?: string }) {
    super(message);
    this.name = "SqSError";
    if (url) this.#url = url;
  }

  get url() {
    return this.#url;
  }
}
