import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, MatPaginator, MatSnackBar } from '@angular/material';
import { SignoVitalService } from './../../_service/signo-vital.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SignoVital } from 'src/app/_model/signo_vital';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-signo-vital',
  templateUrl: './signo-vital.component.html',
  styleUrls: ['./signo-vital.component.css']
})
export class SignoVitalComponent implements OnInit {

  dataSource: MatTableDataSource<SignoVital>;
  displayedColumns = ['id', 'paciente', 'fecha', 'acciones'];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  cantidad: number = 0;

  constructor(
    private service: SignoVitalService,
    private snackBar: MatSnackBar,
    public route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.service.dataCambio.subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.dataSource.filterPredicate = (data, filter) => {
        const dataStr = 
        data.idSignoVital+" "+
        data.paciente.nombres.toLowerCase()+" "+
        data.paciente.apellidos.toLowerCase()+" "+
        data.fecha;
        return dataStr.indexOf(filter) != -1;
      }
    });

    this.service.mensajeCambio.subscribe(data => {
      this.snackBar.open(data, 'AVISO', {
        duration: 2000
      });
    });

    this.service.listarPageable(0, 10).subscribe(data => {
      this.cantidad = data.totalElements;
      this.service.dataCambio.next(data.content);      
    });
  }

  mostrarMas(e : any){
    this.service.listarPageable(e.pageIndex, e.pageSize).subscribe(data => {
      this.cantidad = data.totalElements;      
      this.service.dataCambio.next(data.content);
    });
  }

  filtrar(valor: string) {
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  eliminar(id: number) {
    this.service.eliminar(id).pipe(switchMap(() => {
      return this.service.listarPageable(0, 10);
    })).subscribe(data => {
      this.service.dataCambio.next(data.content);
      this.service.mensajeCambio.next('Se eliminó');
    });
  }
}