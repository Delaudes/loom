import { HttpPort } from "./http.port";

export class FakeHttpWrapper implements HttpPort {
    getResponse?: any;
    postResponse?: any;
    putResponse?: any;
    deleteResponse?: any;

    lastGetUrl?: string;
    lastPostUrl?: string;
    lastPostBody?: any;
    lastPutUrl?: string;
    lastPutBody?: any;
    lastDeleteUrl?: string;

    get<T>(url: string): Promise<T> {
        this.lastGetUrl = url;
        return Promise.resolve(this.getResponse as T);
    }

    post<T>(url: string, body: any): Promise<T> {
        this.lastPostUrl = url;
        this.lastPostBody = body;
        return Promise.resolve(this.postResponse as T);
    }

    put<T>(url: string, body: any): Promise<T> {
        this.lastPutUrl = url;
        this.lastPutBody = body;
        return Promise.resolve(this.putResponse as T);
    }

    delete<T>(url: string): Promise<T> {
        this.lastDeleteUrl = url;
        return Promise.resolve(this.deleteResponse as T);
    }
}
