import { Component } from '@angular/core';
import { EvalService } from 'src/app/eval.service';


export interface VariablesObject {
  [key: string]: string
}

const varLetters = ['a', 'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

@Component({
  selector: 'app-variables',
  templateUrl: './variables.component.html',
  styleUrls: ['./variables.component.scss']
})
export class VariablesComponent {
  constructor(public mathEval: EvalService) {}

  public variables:VariablesObject = {
    
  }

  public variablesDefined(): boolean {
    return Object.keys(this.variables).length > 0
  }

  public getVarName() {

  }

  public addVariable() {
    var varNum = !this.variablesDefined()? 0 : Object.keys(this.variables).length
    this.variables[varLetters[varNum%varLetters.length] + (varNum>=varLetters.length? `_${Math.round(varNum/varLetters.length)}`: "")] = '0';
    this.mathEval.variables = this.variables;
    this.mathEval.update()
  }
}
