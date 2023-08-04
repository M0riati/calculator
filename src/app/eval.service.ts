import { Injectable } from '@angular/core';
import {evaluate, parser, format, config, create, all} from 'mathjs'
import { VariablesObject } from './utility-panel/variables/variables.component';

// test query \left(\frac{89\left(234+42\right)}{43\sqrt{3}}\right)^{32}

@Injectable({
  providedIn: 'root'
})
export class EvalService {
  private query = "";
  public answer = "undefined";
  public variables: VariablesObject = {};
  public mathjs: any;
  public significantFigures = 9;
  public formatMode = "auto"
  public fixedMin = -3;
  public fixedMax = 5;
  public realtimeFeedback = true;

  public passQuery(q: string, enterPressed=false) {
    if (this.realtimeFeedback || enterPressed) {
      this.query = q
      this.update()
    }
  }

  public update() {
      this.answer = this.computeAnswer()
  }

  static convertFrac(q: string) {
    while (true) {
      let i = q.search(/\\frac{.+}{.+}/gm)      
      if (i == -1) {
        return q
      }
      let bracketLevel = 1
      for(let j=i+6; j<q.length; j++) {
        if (q[j] == '{') {
          bracketLevel++
        }
        else if (q[j] == '}') {
          bracketLevel--
        }
        if (bracketLevel == 0) {
          q = q.slice(0, i) + q.slice(i+5, j+1) + "/" + q.slice(j+1)
          break
        }
      }
    }
  }

  static convertLog(q:string) {
    q = q.replaceAll(/\\log_*(?<base>[a-zA-Z0-9])/gm, '\\log_{$<base>}')
    while (true) {
      let i = q.search(/\\log(_{.+}|_*\d+)\(.+\)/gm)    
      if (i == -1) {
        return q
      }
      let bracketLevel = 1
      let baseEnd = 0
      for(let j=i+6; j<q.length; j++) {
        if (q[j] == '{') {
          bracketLevel++
        }
        else if (q[j] == '}') {
          bracketLevel--
        }
        if (bracketLevel == 0) {
          baseEnd = j;
          break
        }
      }
      let argsEnd = 0;
      for(let j=baseEnd+1; j<q.length; j++) {
        if (q[j] == '(') {
          bracketLevel++
        }
        else if (q[j] == ')') {
          bracketLevel--
        }
        if (bracketLevel == 0) {
          argsEnd = j;
          break
        }
      }
      q = q.slice(0, i+4) + q.slice(baseEnd+1, argsEnd) + ", " + q.slice(i+6, baseEnd) + q.slice(argsEnd)      
    }
  }

  public static replaceGreekLetters(q: string) {
    // replace latex greek letters with their unicode counterparts for use in function and var names.
    
    let greekLetters: {[key:string]: string} = {
      "\\alpha":"α", 
      "\\beta":"β",
      "\\gamma":"γ",
      "\\delta":"δ",
      "\\epsilon":"ϵ",
      "\\zeta":"ζ",
      "\\eta":"η",
      "\\theta":"θ",
      "\\iota":"ι",
      "\\kappa":"κ",
      "\\lambda":"λ",
      "\\mu":"μ",
      "\\nu":"ν",
      "\\xi":"ξ",
      "\\omicron":"ο",
      "\\pi":"π",
      "\\rho":"ρ",
      "\\sigma":"σ",
      "\\tau":"τ",
      "\\upsilon":"υ",
      "\\phi":"ϕ",
      "\\chi":"χ",
      "\\psi":"ψ",
      "\\omega":"ω",
      "\\digamma":"ϝ",
      "\\stigma":"ϛ",
      "\\Alpha":"Α", 
      "\\Beta":"Β",
      "\\Gamma":"Γ",
      "\\Delta":"Δ",
      "\\Epsilon":"Ε",
      "\\Zeta":"Ζ",
      "\\Eta":"Η",
      "\\Theta":"Θ",
      "\\Iota":"Ι",
      "\\Kappa":"Κ",
      "\\Lambda":"Λ",
      "\\Mu":"Μ",
      "\\Nu":"Ν",
      "\\Xi":"Ξ",
      "\\Omicron":"Ο",
      "\\Pi":"Π",
      "\\Rho":"Ρ",
      "\\Sigma":"Σ",
      "\\Tau":"Τ",
      "\\Upsilon":"ϒ",
      "\\Phi":"Φ",
      "\\Chi":"Χ",
      "\\Psi":"Ψ",
      "\\Omega":"Ω",
      "\\Digamma":"Ϝ",
      "\\Stigma":"Ϛ"
    }
    Object.keys(greekLetters).forEach(key => {
      q = q.replaceAll(key, greekLetters[key]);
    });
    return q;
  }

  public reformatQuery(q = this.query) {
    q = EvalService.convertFrac(q)
    q = q.replaceAll('\\left(', '(')
    q = q.replaceAll('\\right)', ')')
    q = EvalService.convertLog(q)
    q = q.replaceAll('\\cdot', '*')
    q = q.replaceAll('\\div', '/')
    q = q.replaceAll('\\wedge', 'and')
    q = q.replaceAll('\\vee', 'or')
    q = q.replaceAll('\\oplus', 'xor')
    q = q.replaceAll('\\ge', '>=')
    q = q.replaceAll('\\gg', '>>')
    q = q.replaceAll('\\pm', '±')
    q = q.replaceAll('=', '==')
    q = q.replaceAll('\\ll', '<<')
    q = q.replaceAll('\\le', '<=')
    q = q.replaceAll('\\pi', 'pi')
    q = EvalService.replaceGreekLetters(q)
    q = q.replaceAll(/\\operatorname\{(?<operator>\w+)\}/gm, '$<operator>')
    q = q.replaceAll('\\ ', ' ')
    q = q.replaceAll('{', '(')
    q = q.replaceAll('}', ')')
    q = q.replaceAll('\\degree', 'degrees')
    q = q.replaceAll('°', 'degrees')
    q = q.replaceAll(/degrees\ *F/gm, 'degF')
    q = q.replaceAll(/degrees\ *C/gm, 'degC')
    q.replaceAll('ln', 'log')
    q = q.replaceAll('\\', ' ')
    return q
  }

  public computeAnswer(q=this.query, variables = true, forOutput = true) {
    let ans = '';
    
    q = this.reformatQuery(q) + "*1"
    try {
      var plusMinusMatch = q.match('±');
      if (plusMinusMatch == null) {
        ans = this.evaluate(q, variables, forOutput);
        if (forOutput) {
          ans = this.mathjs.format(ans, {precision: this.significantFigures, notation: this.formatMode, lowerExp: this.fixedMin, upperExp: this.fixedMax})
        }
        else {
          ans = ans.toString()
        }
      }
      else if (plusMinusMatch?.length == 1) {
        var firstSolution = this.evaluate(q.replace('±', '+'), variables, forOutput);
        var secondSolution = this.evaluate(q.replace('±', '-'), variables, forOutput);
        if (forOutput) {
          firstSolution = this.mathjs.format(firstSolution, {precision: this.significantFigures, notation: this.formatMode, lowerExp: this.fixedMin, upperExp: this.fixedMax})
          secondSolution = this.mathjs.format(secondSolution, {precision: this.significantFigures, notation: this.formatMode, lowerExp: this.fixedMin, upperExp: this.fixedMax})
        }
        else {
          firstSolution = firstSolution.toString()
          secondSolution = secondSolution.toString()
        }
        ans = firstSolution + '; ' + secondSolution
      }
      else {
        throw Error('Not more than one plusminus allowed.')
      } 
      if (forOutput) {
        ans = ans.replaceAll(/(?<p>e\+*)(?<e>[\-]*\d+)/gm, '\\cdot10^{$<e>}')
        //let numbers = ans.match(/\d+(\.\d+)*/gm) 
        ans = ans.replaceAll(/(?<unit>([0-9\ ]|^)[a-zA-Z]+)\^*(?<exp>[0-9\.\-]+)/gm, '$<unit>^{$<exp>}')
        ans = ans.replaceAll('Infinity', '\\infty')
        ans = ans.replaceAll(' degrees', '°')
        ans = ans.replaceAll('degC', '°C')
        ans = ans.replaceAll('degF', '°F')
      }
    } 
    catch (Error) {
      console.log(Error)
      ans = 'undefined'
    }
    return ans
  }

  public evaluate(expression: string, variables = true, forOutput=true) {
    let scope: {[id: string] : string} = {}
    if (expression.search('ln') != -1) {
      this.mathjs.evaluate("ln(x)=log(x, e)")
    }
    if (variables) {
      var varNames = Object.keys(this.variables);
      varNames.forEach(key => {        
        let concreteValue = this.computeAnswer(this.variables[key], false, false)
        console.log(concreteValue)
        let name = EvalService.replaceGreekLetters(key);
        scope[name] = concreteValue;
      });
      var varMatches = expression.match(/[a-zA-Zα-ωΑ-ΩϜϝϚϛ]+/gm)
      varMatches?.forEach(element => {
        let onlyVars = true; 
        if (!varNames.includes(element)) {
          for (var i=0; i<element.length; i++) {
            if (!(varNames.includes(element[i]))) {
              onlyVars = false;
              break;
            }
          }
          if (onlyVars && !(["sqrt", "and", "or", "xor", "degree", "sin", "cos", "tan", "asin", "acos", "atan", "log", "ln"].includes(element))) {
            expression = expression.replace(element, element.split('').join('*'))
          }
        }
      });
    }

    return this.mathjs.evaluate(expression, scope)
  }

  constructor() { 
    this.mathjs = create(all)
    this.mathjs.config({
      precision: 256,
      number: 'BigNumber',
    })
  }
}
