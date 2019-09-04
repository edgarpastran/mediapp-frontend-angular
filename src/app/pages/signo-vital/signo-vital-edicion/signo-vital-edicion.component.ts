import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SignoVitalService } from './../../../_service/signo-vital.service';
import { Paciente } from './../../../_model/paciente';
import { FormGroup, FormControl } from '@angular/forms';
import { SignoVital } from 'src/app/_model/signo_vital';
import { Component, OnInit } from '@angular/core';
import { PacienteService } from 'src/app/_service/paciente.service';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-signo-vital-edicion',
  templateUrl: './signo-vital-edicion.component.html',
  styleUrls: ['./signo-vital-edicion.component.css']
})
export class SignoVitalEdicionComponent implements OnInit {

  form: FormGroup;
  currentId: number;

  pacientes: Paciente[] = [];
  myControlPaciente: FormControl = new FormControl();
  filteredOptionsPaciente: Observable<any[]>;

  maxFecha: Date = new Date();

  constructor(
    private signoVitalService: SignoVitalService,
    private pacienteService: PacienteService,
    private route: ActivatedRoute, 
    private router: Router
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      'id': new FormControl(0),
      'paciente': this.myControlPaciente,
      'fecha': new FormControl(new Date()),
      'temperatura': new FormControl(''),
      'pulso': new FormControl(''),
      'ritmoRespiratorio': new FormControl('')
    });

    this.route.params.subscribe((params: Params) => {
      this.currentId = params['id'];

      this.initForm();
    });        
  }

  initForm() {    
    this.listarPacientes();
    this.filteredOptionsPaciente = this.myControlPaciente.valueChanges.pipe(map(val => this.filterPacientes(val)));

    if (this.currentId != null) {
      this.signoVitalService.listarPorId(this.currentId).subscribe(data => {        
        this.myControlPaciente.setValue(data.paciente);

        this.form = new FormGroup({
          'id': new FormControl(data.idSignoVital),
          'paciente': this.myControlPaciente,
          'fecha': new FormControl(new Date(data.fecha)),
          'temperatura': new FormControl(data.temperatura),
          'pulso': new FormControl(data.pulso),
          'ritmoRespiratorio': new FormControl(data.ritmoRespiratorio)
        });        
      });      
    }
  }

  listarPacientes() {
    this.pacienteService.listar().subscribe(data => {
      this.pacientes = data;
    });
  }

  filterPacientes(val: any) {
    if (val != null && val.idPaciente > 0) {
      return this.pacientes.filter(option =>
        option.nombres.toLowerCase().includes(val.nombres.toLowerCase()) || option.apellidos.toLowerCase().includes(val.apellidos.toLowerCase()) || option.dni.includes(val.dni));
    } 
    else {
      return this.pacientes.filter(option =>
        option.nombres.toLowerCase().includes(val.toLowerCase()) || option.apellidos.toLowerCase().includes(val.toLowerCase()) || option.dni.includes(val));
    }
  }

  displayFnPaciente(val: Paciente) {
    return val ? `${val.nombres} ${val.apellidos}` : val;
  }

  operar() {        
    var tzoffset = (this.form.value['fecha']).getTimezoneOffset() * 60000;
    var fechaISO = (new Date(Date.now() - tzoffset)).toISOString()

    let signoVital = new SignoVital();
    signoVital.idSignoVital = this.form.value['id'];
    signoVital.paciente = this.form.value['paciente'];    
    signoVital.fecha = fechaISO;
    signoVital.temperatura = this.form.value['temperatura'];
    signoVital.pulso = this.form.value['pulso'];
    signoVital.ritmoRespiratorio = this.form.value['ritmoRespiratorio'];
    
    if (signoVital != null && signoVital.idSignoVital > 0) {
      var fechaISO = (new Date(this.form.value['fecha'])).toISOString();    
      signoVital.fecha = fechaISO;

      this.signoVitalService.modificar(signoVital).pipe(switchMap(() => {
        return this.signoVitalService.listar();
      })).subscribe(data => {
        this.signoVitalService.dataCambio.next(data);
        this.signoVitalService.mensajeCambio.next("Se modifico");
      });
    } 
    else {
      this.signoVitalService.registrar(signoVital).pipe(switchMap(() => {
        return this.signoVitalService.listar();
      })).subscribe(data => {
        this.signoVitalService.dataCambio.next(data);
        this.signoVitalService.mensajeCambio.next("Se registro");
      });
    }

    this.router.navigate(['signo-vital']);
  }
  
}
