import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, FormData } from './form-and-table.component';
import { environment } from '../../../environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = 'http://3.133.99.153:3000/api/logs';
    private headers: HttpHeaders;

    constructor(private http: HttpClient) {
        this.headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'x-api-key': environment.apiSecretKey
        });
    }

    submitForm(data: FormData): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/log`, data, { headers: this.headers });
    }

    getData(): Observable<ApiResponse> {
        return this.http.get<ApiResponse>(this.apiUrl, { headers: this.headers });
    }
}