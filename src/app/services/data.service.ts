import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  configUrl = 'http://localhost:3000/api/';

  constructor(private http: HttpClient) { }

  // getData(functionName: string, options?: any): Observable<any> {
  //   return this.http.get(this.configUrl + functionName, options);
  // }
  getData(functionName: string, options?: any): Observable<any> {
    return this.http.get(`${this.configUrl}${functionName}`, options);
  }

  postData(functionName: string, data?: any, options?: any): Observable<any> {
    return this.http.post(this.configUrl + functionName, data, options);
  }


  putData(endpoint: string, id?:string| number, data?: any): Observable<any> {
    return this.http.put(`${this.configUrl}${endpoint}/${id}`, data);
  }

  // Updated putData method
  // putData(endpoint: string, data: any, id?: string | number): Observable<any> {
  //   if (id) {
  //     return this.http.put(`${this.configUrl}${endpoint}/${id}`, data);
  //   }
  //   return this.http.put(`${this.configUrl}${endpoint}`, data);
  // }

  terminateSession(sessionId: string): Observable<any> {
    return this.http.delete(`${this.configUrl}session/${sessionId}`);
  }

  // ✅ Add this method
  getDataWithParams(endpoint: string, params: any): Observable<any> {
    return this.http.get(`${this.configUrl}${endpoint}`, { params });
  }
}
