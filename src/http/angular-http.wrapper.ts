import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { HttpPort } from "./http.port";

export class AngularHttpWrapper implements HttpPort {
    private readonly httpClient = inject(HttpClient);

    get<T>(url: string): Promise<T> {
        return firstValueFrom(this.httpClient.get<T>(url));
    }

    post<T>(url: string, body: any): Promise<T> {
        return firstValueFrom(this.httpClient.post<T>(url, body));
    }

    put<T>(url: string, body: any): Promise<T> {
        return firstValueFrom(this.httpClient.put<T>(url, body));
    }

    delete<T>(url: string): Promise<T> {
        return firstValueFrom(this.httpClient.delete<T>(url));
    }
}
