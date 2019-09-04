import { SignoVital } from './../_model/signo_vital';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignoVitalService {

  dataCambio = new Subject<SignoVital[]>();
  mensajeCambio = new Subject<string>();

  url: string = `${environment.HOST}/signos_vitales`;
  
  constructor(private http: HttpClient) { }

  listar() {
    return this.http.get<SignoVital[]>(this.url);
  }

  listarPageable(p: number, s: number) {
    return this.http.get<any>(`${this.url}/pageable?page=${p}&size=${s}`);
  }

  listarPorId(id: number) {
    return this.http.get<SignoVital>(`${this.url}/${id}`);
  }

  registrar(signoVital: SignoVital) {
    return this.http.post(this.url, signoVital);
  }

  modificar(signoVital: SignoVital) {
    return this.http.put(this.url, signoVital);
  }

  eliminar(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }
}
