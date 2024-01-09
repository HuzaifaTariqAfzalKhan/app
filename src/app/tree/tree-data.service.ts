// tree-data.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TreeDataService {
  insertRoot(name: string) {
    throw new Error('Method not implemented.');
  }
  deleteItem(itemId: number) {
    throw new Error('Method not implemented.');
  }
  update(item: any) {
    throw new Error('Method not implemented.');
  }

  private API_URL = 'http://localhost:1337/api/groceries'; // Update with your actual API endpoint

  constructor(private http: HttpClient) { }

  fetchDataFromApi(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/custom-nested-data`);
  }

  deleteItemWithChildren(itemId: number): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/custom-delete/${itemId}`);
  }

  updateItem(data: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/custom-update/${data.id}`, { data });
  }

  createItem(name: string, quantity: string, unit: string, parentId: number): Observable<any> {
    const data = { name, quantity, unit, parentId };
    console.log(data);
    return this.http.post<any>(`${this.API_URL}/create-grocery`, { data });
  }
}
