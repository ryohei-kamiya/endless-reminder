export class HTTPClientResponse {
  headers: any;
  contentText: string;
  responseCode: number;

  constructor(headers: any, contentText: string, responseCode: number) {
    this.headers = headers;
    this.contentText = contentText;
    this.responseCode = responseCode;
  }

  getHeaders(): any {
    return this.headers;
  }

  getContentText(): string {
    return this.contentText;
  }

  getContentJson(): any {
    try {
      return JSON.parse(this.contentText);
    } catch (e) {
      console.log(e);
      return {};
    }
  }

  getResponseCode(): number {
    return this.responseCode;
  }
}

export class HttpClient {
  constructor() {
    // do nothing.
  }

  convertParamsToQueryString(params: any = null): string {
    if (params === null) {
      return "";
    }
    return Object.keys(params)
      .map((key) => {
        if (key === undefined || params[key] === undefined) {
          return "";
        }
        return `${key}=${params[key]}`;
      })
      .filter((param) => param !== "")
      .reduce((accumulator, currentValue) => {
        if (accumulator === "?") {
          return accumulator + currentValue;
        } else {
          return accumulator + "&" + currentValue;
        }
      }, "?");
  }

  get(url: string, params: any = null, headers: any = {}): HTTPClientResponse {
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: "get",
      headers: headers,
    };
    const queryString = this.convertParamsToQueryString(params);
    const res = UrlFetchApp.fetch(url + queryString, options);
    const result = new HTTPClientResponse(
      res.getHeaders(),
      res.getContentText(),
      res.getResponseCode()
    );
    return result;
  }

  post(url: string, body: string, headers: any = {}): HTTPClientResponse {
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: "post",
      headers: headers,
      payload: body,
    };
    const res = UrlFetchApp.fetch(url, options);
    const result = new HTTPClientResponse(
      res.getHeaders(),
      res.getContentText(),
      res.getResponseCode()
    );
    return result;
  }
}
