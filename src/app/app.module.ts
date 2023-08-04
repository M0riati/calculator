import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {MatDividerModule} from '@angular/material/divider'; 
import {MatIconModule} from '@angular/material/icon'; 
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card'; 
import {MatInputModule} from '@angular/material/input'; 
import {MatListModule} from '@angular/material/list'; 
import {MatTabsModule} from '@angular/material/tabs'; 
import {MatTableModule} from '@angular/material/table'; 
import {MatExpansionModule} from '@angular/material/expansion'; 
import {MatFormFieldModule} from '@angular/material/form-field'; 
import {MatSliderModule} from '@angular/material/slider';
import {MatSelectModule} from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ExpressionInputComponent } from './expression-input/expression-input.component';
import { AnswerComponent as AnswerDisplayComponent } from './answer-component/answer.component';
import { MathjaxModule } from "mathjax-angular";
import { UtilityPanelComponent } from './utility-panel/utility-panel.component';
import { VariablesComponent } from './utility-panel/variables/variables.component';
import { FunctionsComponent } from './utility-panel/functions/functions.component';
import { SettingsComponent } from './utility-panel/settings/settings.component';
import { VariableEditorComponent } from './utility-panel/variables/variable-editor/variable-editor.component';



@NgModule({
  declarations: [
    AppComponent,
    ExpressionInputComponent,
    AnswerDisplayComponent,
    UtilityPanelComponent,
    VariablesComponent,
    FunctionsComponent,
    SettingsComponent,
    VariableEditorComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatFormFieldModule,
    MatTabsModule,
    MatTableModule,
    MatSliderModule,
    MatSelectModule,
    MatExpansionModule,
    FormsModule,
    MathjaxModule.forRoot(
      
    )
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
